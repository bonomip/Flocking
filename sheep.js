class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size, angle, debug, color = "black"){
  this.debug = debug;

  this.color = color;
  this.size = size;
  this.w = 100 * size; //body width
  this.h = 50 * size; //body height
  this.c = 30 * size; //head size
  this.rotation = angle; //current rotation
  this.pos = createVector(x, y); //current position

  this.glob = 0; this.flee = 1; this.align = 2; this.cohe = 3; this.sep = 4;

  this.velocities = [
                      createVector(0, 0),   // 0 global velocity;
                      createVector(0, 0),   // 1 flee velocity
                      createVector(0, 0),   // 2 align velocity
                      createVector(0, 0),   // 3 cohesion velocity
                      createVector(0, 0)    // 4 separation velocity
                      ];
  this.accelerations = [
                        createVector(0, 0),  // 0 global acceleration;
                        createVector(0, 0),   // 1 flee acceleration
                        createVector(0, 0),   // 2 align acceleration
                        createVector(0, 0),   // 3 cohesion acceleration
                        createVector(0, 0)    // 4 separation acceleration

                        ];
  this.perceptions = [
                        0*size,   // 0 global perception //not used
                        3200*size,   // 1 flee perception
                        1000*size,   // 2 align perception
                        0*size,   // 3 cohesion perception //not used because we use global
                        500*size  // 4 separation perception
                      ];
  this.speed_limits = [
                        2,   // 0 global max speed;
                        1,   // 1 flee max speed
                        1,   // 2 align max speed
                        2,   // 3 cohesion max speed
                        1   // 4 separation max speed
                      ];
  this.speed_threshold = [
                            0.01,  // 0 global min speed;
                            0.01,   // 1 flee min speed
                            0.01,   // 2 align min speed
                            0.01,   // 3 cohesion min speed
                            0.01  // 4 separation min speed
                                ];
  this.force_limits = [
                        0.5,  // 0 global max froce
                        0.5,   // 1 flee max froce
                        0.5,   // 2 align max froce
                        5,   // 3 cohesion max froce
                        0.5  // 4 separation max froce
                          ];

  this.perception_angle = 75; //angle of view
  this.drag = 0.1; //drag
  this.max_steer_angle = 20;
  this.min_adjusted_speed = 0.1; // the minimum speed of the sheep when
                                // it's new velocity is completly inverse of
                                // last frame velocity

  this.flee_min_perception = 300*size;
  this.cohe_min_distance = 100*size;
  this.separation_min_distance = this.size * 5;
  this.fear = 0;
}

mult(v, w){
  return p5.Vector.mult(v, w);
}

div(v, w){
  return p5.Vector.div(v,w);
}

add(v, w){
  return p5.Vector.add(v, w);
}

sub(v, w){
  return p5.Vector.sub(v, w);
}

dist(v, w){
  return p5.Vector.dist(v, w);
}

dot(v, w){
  return p5.Vector.dot(v, w);
}

//SEERING METHODS

setWolf(x, y){
  this.wolf = createVector(x, y);
}

bounds(){
  if(this.pos.x > width-this.w/2){
    this.pos.x = width-this.w/2;
  }
  else if ( this.pos.x < 0 +this.w/2)
    this.pos.x = 0+this.w/2;

  if(this.pos.y > height-this.w/2)
    this.pos.y = height-this.w/2;
  else if ( this.pos.y < 0+this.w/2 )
    this.pos.y = 0+this.w/2;
}

isInMyView(point, angle, radius){
  let my_fwd = createVector(1, 0);
  my_fwd.rotate(this.rotation);

  let v = this.sub(point, this.pos);

  return (abs(my_fwd.angleBetween(v)) <= angle) && (this.dist(point, this.pos) < radius);
}

updateRotation(last, now){
  let e = 0.001;

  if(last.mag() < e){
    if(now.mag() >= e)
      this.rotation = 90-atan2(now.x, now.y);
    return;
  }

  this.rotation += last.angleBetween(now);

  if(this.rotation >= 360)
    this.rotation = this.rotation %360;

}

inverseFunction(x, s){
  return pow(x/s + 0.0001, -2);
}

// BEHAVIOUR METHODS


///////////// SEPARATION ////////////////

log(b, x){
  return log(x) / log(b);
}

computeSepM0(x, r, max, min){
  let e = -log(r/min, max);

  if(x < min)
    return exp(min/r, e);
  else
    return exp(x/r, e);
}

computeSepVector(other){
  let v = this.sub(this.pos, other.pos);
  let d = v.mag();

  if(d < 0.00001) //overlapping
      v = p5.Vector.random2D();

  v.setMag(d);

  return v;
}

computeSepDesired(perception, max_speed, dist_threshold){
  let desired = createVector(0, 0);
  let count = 0;

  for(let other of sheeps){
    if(!this.isInMyView(other.pos, 360, perception))
      continue;

    desired.add(this.computeSepVector(other));
    count++;
  }

  if(count == 0)
    return createVector(0, 0);

  desired.div(count);
  let m0 = this.computeSepM0(desired.mag(), perception, max_speed, dist_threshold);
  desired.limit(max_speed);
  if(this.fear > 0.5){
    desired.mult(0);
    return desired;
  }

  desired.mult(m0*separationSlider.value()*(1-this.fear));

  return desired;
}

computeSepSteer(sheeps){
  let desired = this.computeSepDesired(
    this.perceptions[this.sep],
    this.speed_limits[this.sep],
    this.cohe_min_distance);
  let steer = this.sub(desired, this.velocities[this.sep]);
  steer.limit(this.force_limits[this.sep]);
  return steer;
}



///////////// COHESION //////////////////

//d = distance
//max = is the max length
//min = minimum distance
//e = exponent
computeCoheM0(d, max, min, e){
  if(d < min)
    return 0;
  if(d > max)
    return 1;

  return pow(d/max, e);
}

computeAvgPos(sheeps){
  let avg_pos = createVector(0, 0);

  for(let other of sheeps)
      avg_pos.add(other.pos);

  return avg_pos.div(sheeps.length);
}

computeCoheDesired(pos){

  let desired = this.sub(pos, this.pos);
  let m0 = this.computeCoheM0(
    desired.mag(),
    1000*this.size,
    this.cohe_min_distance,
    2);

  desired.normalize();
  desired.mult(m0*this.fear*cohesionSlider.value());
  desired.limit(this.velocities[this.cohe]);

  return desired;
}

computeCoheSteer(sheeps){

  let steer;

  if(sheeps.length == 0)
    steer = this.sub(createVector(0,0),this.velocities[this.cohe]);
  else
    steer = this.sub(
                  this.computeCoheDesired(this.computeAvgPos(sheeps)),
                  this.velocities[this.cohe]);

  steer.limit(this.force_limits[this.cohe]);

  return steer;
}


//////////// ALIGNMENT /////////////////



alignWith(sheeps){
  let desired = createVector(0, 0);

  let desired_speed = 0;

  let count = 0;

  for(let other of sheeps){
      let d = this.pos.dist(other.pos);

      if( !this.isInMyView(other.pos, this.perception_angle, this.perceptions[this.align])
          || other.velocities[this.glob].mag() < this.speed_threshold[this.align])
        continue;
      desired.add(other.velocities[this.glob]);
      desired_speed += other.velocities[this.glob].mag();
      count++;
    }

  if(count == 0){
    return this.sub(createVector(0, 0), this.velocities[this.align])
              .limit(this.force_limits[this.align]);
  }

  desired_speed /= count;

  desired.setMag(desired_speed);
  desired.limit(this.speed_limits[this.align]);
  desired.mult(this.fear);

  let steer = this.sub(desired, this.velocities[this.align]);
  steer.limit(this.force_limits[this.align]);

  return steer;
}

fleeFrom(desired, d){

  if(!this.isInMyView(this.wolf, 360, this.perceptions[this.flee]))
    return this.sub(createVector(0,0), this.velocities[this.flee])
              .limit(this.force_limits[this.flee]);

  let m;

  if(d <= this.flee_min_perception){
    m = this.speed_limits[this.flee];
  } else {
    m = map(d, this.flee_min_perception, this.perceptions[this.flee], this.speed_limits[this.flee], 0);
  }


  desired.setMag(m);

  let steer = this.sub(desired, this.velocities[this.flee]);
  steer.limit(this.force_limits[this.flee]);

  return steer;
}

// BEHAVIOUR

constrainVelocityAngle(fwd, vel){ // pass by copy
  let alpha = fwd.angleBetween(vel);

  if(isNaN(alpha) || abs(alpha) < this.max_steer_angle ) //if alpha is NaN so vel is 0, 0, 0;
    return vel;

  if(abs(alpha) == 180){
    vel.rotate(this.max_steer_angle-alpha);
    vel.setMag(this.min_adjusted_speed);
    return vel;
  } else{
    let m = map(abs(alpha), this.max_steer_angle, 180, vel.mag(), this.min_adjusted_speed);
    vel.rotate(this.max_steer_angle-alpha);
    vel.setMag(m);
    return vel;
  }
}

computeFearFactor(r, d){
  angleMode(RADIANS);
  let fear = atan((r-d)/20)/PI + 0.5;
  angleMode(DEGREES);
  return fear;
}

computeBehaviours(sheeps){

  let neighbors = [];

  for(let sheep of sheeps) if(sheep != this) neighbors.push(sheep);

  let v =  this.sub(this.pos, this.wolf); //vector from wolf position to my position
  let m = v.mag(); //magitude of that vector

  this.fear = this.computeFearFactor(this.perceptions[this.flee], m);

  //passing those argument so i dont have to compute them twice ;)
  this.accelerations[this.flee] = this.fleeFrom(v, m).mult(fleeSlider.value());

  this.accelerations[this.cohe] = this.computeCoheSteer(neighbors);

  this.accelerations[this.align] = this.alignWith(neighbors).mult(alignSlider.value());

  this.accelerations[this.sep] = this.computeSepSteer(neighbors);
}

applyBehaviours() {
  let last_frame_velocity = this.velocities[this.glob].copy(); //save last velocity

  for(let i = 1; i < this.velocities.length; i++){
    this.velocities[i].add(this.accelerations[i]);
    this.velocities[i].limit(this.speed_limits[i]);
    this.velocities[this.glob].add(this.velocities[i]);
  }

  this.velocities[this.glob].limit(this.speed_limits[this.glob]);
  this.velocities[this.glob].mult(1-this.drag);

  this.velocities[this.glob] = this.constrainVelocityAngle(
                                      createVector(1, 0).rotate(this.rotation),
                                      this.velocities[this.glob].copy());

  this.updateRotation(last_frame_velocity, this.velocities[this.glob].copy());

  for(let i = 0; i < this.velocities.length; i++){
    if(this.velocities[i].mag() <= this.speed_threshold[i])
      this.velocities[i].mult(0);
  }

  this.pos.add(this.velocities[this.glob]);

  for(let i = 0; i < this.accelerations.length; i++ )
      this.accelerations[i].mult(0);
}

//DRAW METHODS

drawPerception(i, r = 255, g = 0, b = 0,  a = 360){
  noFill();
  stroke(r, g, b);

  if(a == 360){
    circle(0, 0, this.perceptions[i]*2);

    if(i == this.sep){
      stroke(r/2, g/2, b/2);
      circle(0, 0, this.separation_min_distance*2);
    }
    if(i == this.flee){
      stroke(r/2, g/2, b/2);
      circle(0, 0, this.flee_min_perception*2);
    }
    if(i == this.cohe){
      stroke(r/2, g/2, b/2);
      circle(0, 0, this.cohe_min_distance*2);
    }
  } else {
    arc( 0, 0, this.perceptions[i]*2, this.perceptions[i]*2, -a, a, PIE );
  }
}

drawVector(vector, color){ //DEBUg
  if(vector.mag() < 0.001) return;
    drawArrow(this.pos, this.mult(vector, 20), color);
}

drawDesired(){
  let c1 = createVector(width/2,height/2);
  let c2 = createVector(width/2,height/2);
  let m1 = createVector(100, 0);

  drawArrow(c1, m1, "blue");
  drawArrow(c1, m1.rotate(this.rotation), "green");
}

drawBody(w, h){
  /* body as rectangle
  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, w, h);
  */

  fill(this.color);
  noStroke();
  circle(0, 0, this.w);
}

drawHead(f, w, s){
  fill(120);
  noStroke();
  ellipseMode(CENTER);
  f.mult(w/3);
  circle(f.x, f.y, s);
}

draw(alpha){

  push();
  translate(this.pos.x, this.pos.y);
  rotate(this.rotation);
if(this.debug){
  //this.drawPerception(this.sep, 255, 125, 0);
  //this.drawPerception(this.flee, 125, 255, 0);
  //this.drawPerception(this.cohe, this.perception_angle);
}
  this.drawBody(this.w, this.h);
  this.drawHead(createVector(1,0), this.w, this.c);

  pop();

  //this.drawDesired();
  //this.drawVector(this.velocity, "green")
  //this.drawVector(this.wolf_flee_velocity, "blue")
  //this.drawVector(this.wolf_flee_acceleration, "red")
  //this.drawVector(this.align_velocity, "blue")
  //this.drawVector(this.align_acceleration, "red")

}

}

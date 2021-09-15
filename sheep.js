class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.debug = true;

  this.perception_angle = 100;
  this.drag = 0.1;

  this.flee_min_perception = 30;

  this.rotation = random(0, 360);
  this.pos = createVector(x, y);


  this.glob = 0; this.flee = 1; this.align = 2; this.cohe = 3; this.sep = 4;

  this.velocities = [ createVector(0, 0),   // 0 global velocity;
                      createVector(0, 0),   // 1 flee velocity
                      createVector(0, 0),   // 2 align velocity
                      createVector(0, 0),   // 3 cohesion velocity
                      createVector(0, 0) ]; // 4 separation velocity

  this.accelerations = [ createVector(0, 0),  // 0 global acceleration;
                        createVector(0, 0),   // 1 flee acceleration
                        createVector(0, 0),   // 2 align acceleration
                        createVector(0, 0),   // 3 cohesion acceleration
                        createVector(0, 0) ]; // 4 separation acceleration

  this.perceptions =  [ 200,  // 0 global perception
                        100,  // 1 flee perception
                        50,   // 2 align perception
                        50,   // 3 cohesion perception
                        50 ]; // 4 separation perception

  this.speed_limits = [ 5,   // 0 global max speed;
                        5,   // 1 flee max speed
                        5,   // 2 align max speed
                        5,   // 3 cohesion max speed
                        5 ]; // 4 separation max speed

  this.speed_threshold =  [ 0.01,  // 0 global min speed;
                            0.01,   // 1 flee min speed
                            0.01,   // 2 align min speed
                            0.01,   // 3 cohesion min speed
                            0.01 ]; // 4 separation min speed

  this.force_limits = [ 0.5,  // 0 global max froce
                        0.5,   // 1 flee max froce
                        0.5,   // 2 align max froce
                        0.5,   // 3 cohesion max froce
                        0.5 ]; // 4 separation max froce




  this.w = 100 * size; //body width
  this.h = 50 * size; //body height
  this.c = 30 * size; //head size
}

setWolfPosition(x, y){
  this.wolf = createVector(x, y);
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

bounds(){
  if(this.pos.x > width)
    this.pos.x = 0;
  else if ( this.pos.x < 0 )
    this.pos.x = width;

  if(this.pos.y > height)
    this.pos.y = 0;
  else if ( this.pos.y < 0 )
    this.pos.y = height;
}
/*
separation(sheeps){
  let avg_vel = createVector(0, 0);
  let tot = 0;

  for(let other of sheeps){
    let v = this.sub(this.pos, other.pos);

    if(v.mag() < 0.01){
      avg_vel.add(p5.Vector.random2D().normalize().mult(this.max_speed));
      tot++;
    } else if(v.mag() <= this.min_dist_sep){
      avg_vel.add(v.mult(this.max_speed));
      tot++;
    }

  }

  //let s = this.inverseForce(avg_vel.mag(), this.perception, this.max_speed);
  //avg_vel.setMag(s*this.separation_drag);
  if(tot == 0) return createVector(0,0);

  return avg_vel.div(tot);
}

cohesion(sheeps){
  let desired_pos = createVector(0, 0);
  let count = 0;

  for(let other of sheeps){
    let d = this.pos.dist(other.pos);

    if(!this.isInMyView(other.pos, this.perception_angle, this.cohesion_perception))
        continue;
      desired_pos.add(other.pos);
  }

  desired_pos.div(sheeps.length);
  let avg_vel = this.sub(avg_pos, this.pos);
  let s = this.inverseForce(avg_vel.mag(), this.perception, this.max_speed);
  avg_vel.setMag(s);

  return avg_vel;

}
*/
alignWith(sheeps){
  let desired = createVector(0, 0);

  let desired_speed = 0;

  let count = 0;

  for(let other of sheeps){
      let d = this.pos.dist(other.pos);

      if( !this.isInMyView(other.pos, this.perceptions[this.align])
          || other.velocities[this.glob].mag() < this.speed_threshold[this.align])
        continue;
      desired.add(other.velocities[this.glob]);
      desired_speed += other.velocities[this.glob].mag();
      count++;
    }

  if(count == 0)
    return this.sub(createVector(0, 0), this.velocities[this.align]);

  desired_speed /= count;

  desired.normalize();
  desired.mult(desired_speed);
  desired.limit(this.speed_limits[this.align]);

  let steer = this.sub(desired, this.velocities[this.align]).limit(this.force_limits[this.align]);

  return steer;
}

fleeFrom(){
  let desired = this.sub(this.pos, this.wolf);
  let d = desired.mag();

  desired.normalize();

  if(d > this.perceptions[this.flee])
    return this.sub(createVector(0,0), this.velocities[this.flee]);

  let m;

  if(d < this.flee_min_perception){
    m = this.speed_limits[this.flee];
  } else {
    m = map(d, 20, this.perceptions[this.flee], this.speed_limits[this.flee], 0);
  }


  desired.mult(m);

  let steer = this.sub(desired, this.velocities[this.flee]).limit(this.force_limits[this.flee]);

  return steer;
}

// BEHAVIOUR

behaviour(sheeps){

  let neighbors = [];

  for(let sheep of sheeps)
    if(sheep != this && this.perceptions[this.glob] > this.dist(sheep.pos, this.pos))
      neighbors.push(sheep);

  let fleeSteer = this.fleeFrom()
  this.accelerations[this.flee] = fleeSteer.mult(fleeSlider.value());

    let alignSteer = this.alignWith(neighbors)
    this.accelerations[this.align] = alignSteer.mult(alignSlider.value());

    //let separationSteer = this.separation(neighbors);
    //this.applyForce(separationSteer.mult(separationSlider.value()));

    //let cohesionSteer = this.cohesion(neighbors);
    //this.applyForce(cohesionSteer.mult(cohesionSlider.value()));
}

isInMyView(point, radius){
  let my_fwd = createVector(1, 0);
  my_fwd.rotate(this.rotation);

  let v = this.sub(point, this.pos);

  return (abs(my_fwd.angleBetween(v)) <= this.perception_angle) && (this.dist(point, this.pos) < radius);
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

step() {
  let last_frame_velocity = this.velocities[this.glob].copy(); //save last velocity

  for(let i = 1; i < this.velocities.length; i++){
    this.velocities[i].add(this.accelerations[i]);
    this.velocities[i].limit(this.speed_limits[i]);
    this.velocities[this.glob].add(this.velocities[i]);
  }

  this.velocities[this.glob].limit(this.speed_limits[this.glob]);
  this.velocities[this.glob].mult(1-this.drag);

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

drawAlignPerception(){ //DEBUg
  fill(255, 0, 0, 50);
  noStroke();
  arc( 0,
       0,
       this.perceptions[this.align]*2,
       this.perceptions[this.align]*2,
       -this.perception_angle,
       this.perception_angle,
       PIE );
}

drawWolfPerception(){ //DEBUG
  noFill();
  stroke(0, 255, 0);
  circle(0, 0, this.perceptions[this.flee]*2);
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
  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, w, h);
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

  this.drawAlignPerception();
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

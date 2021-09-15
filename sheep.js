class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.debug = true;

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
                        75,  // 0 global perception
                        100,  // 1 flee perception
                        50,   // 2 align perception
                        50,   // 3 cohesion perception
                        40    // 4 separation perception
                      ];
  this.speed_limits = [
                        5,   // 0 global max speed;
                        5,   // 1 flee max speed
                        5,   // 2 align max speed
                        5,   // 3 cohesion max speed
                        5    // 4 separation max speed
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
                        0.5,   // 3 cohesion max froce
                        0.5   // 4 separation max froce
                          ];

  this.perception_angle = 100; //angle of view
  this.drag = 0.1; //drag
  this.flee_min_perception = 30;
  this.cohe_min_distance = 10;

  this.w = 100 * size; //body width
  this.h = 50 * size; //body height
  this.c = 30 * size; //head size
  this.rotation = random(0, 360); //current rotation
  this.pos = createVector(x, y); //current position
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
  if(this.pos.x > width)
    this.pos.x = 0;
  else if ( this.pos.x < 0 )
    this.pos.x = width;

  if(this.pos.y > height)
    this.pos.y = 0;
  else if ( this.pos.y < 0 )
    this.pos.y = height;
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

// BEHAVIOUR METHODS

separation(sheeps){
  let desired = createVector(0, 0);
  let desired_speed = 0;
  let count = 0;

  for(let other of sheeps){
    let v = this.sub(this.pos, other.pos);
    let d = this.pos.dist(other.pos);
    let m, w;

    if(d > this.perceptions[this.sep])
      continue;

    if(d < 0.01){ //if i'm sovrappsed go away in a random way at max speed
      w = p5.Vector.random2D();
      m = this.speed_limits[this.sep];
    } else {
      w = v;
      m = map(d, 0.01, this.perceptions[this.sep], this.speed_limits[this.sep], 0);
    }

    w.setMag(m);
    desired.add(w);
    desired_speed += m;
    count++;
  }

  if(count == 0)
    return this.sub(desired, this.velocities[this.sep])
                  .limit(this.force_limits[this.sep]);

  desired.div(count);
  desired_speed /= count;
  desired.setMag(desired_speed);

  let steer = this.sub(desired, this.velocities[this.sep]);
  steer.limit(this.force_limits[this.sep]);
  return steer;
}

cohesion(sheeps){
  let avg_pos = createVector(0, 0);
  let count = 0;

  for(let other of sheeps){
    let d = this.pos.dist(other.pos);

    if(!this.isInMyView(other.pos, this.perceptions[this.cohe]))
        continue;
      avg_pos.add(other.pos);
      count++;
  }

  if(count == 0)
    return this.sub(createVector(0,0), this.velocities[this.cohe])
                .limit(this.force_limits[this.cohe]);

  avg_pos.div(count);
  let desired = this.sub(avg_pos, this.pos);
  let mag = desired.mag();

  let steer;

  if(mag < this.cohe_min_distance){
    desired = createVector(0, 0);
  } else {
    let m = map(mag, this.cohe_min_distance, this.perceptions[this.cohe], 0, this.speed_limits[this.cohe]);
    desired.setMag(m);
  }

  steer = this.sub(desired, this.velocities[this.cohe]);
  steer.limit(this.force_limits[this.cohe]);

  return steer;
}

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

  if(count == 0){
    return this.sub(createVector(0, 0), this.velocities[this.align])
              .limit(this.force_limits[this.align]);
  }

  desired_speed /= count;

  desired.setMag(desired_speed);
  desired.limit(this.speed_limits[this.align]);

  let steer = this.sub(desired, this.velocities[this.align]);
  steer.limit(this.force_limits[this.align]);

  return steer;
}

fleeFrom(){
  let desired = this.sub(this.pos, this.wolf);
  let d = desired.mag();

  if(d > this.perceptions[this.flee])
    return this.sub(createVector(0,0), this.velocities[this.flee])
              .limit(this.force_limits[this.flee]);

  let m;

  if(d < this.flee_min_perception){
    m = this.speed_limits[this.flee];
  } else {
    m = map(d, 20, this.perceptions[this.flee], this.speed_limits[this.flee], 0);
  }


  desired.setMag(m);

  let steer = this.sub(desired, this.velocities[this.flee]);
  steer.limit(this.force_limits[this.flee]);

  return steer;
}

// BEHAVIOUR

computeBehaviours(sheeps){

  let neighbors = [];

  for(let sheep of sheeps)
    if(sheep != this && this.perceptions[this.glob] > this.dist(sheep.pos, this.pos))
      neighbors.push(sheep);

  let fleeSteer = this.fleeFrom()
  this.accelerations[this.flee] = fleeSteer.mult(fleeSlider.value());

  let alignSteer = this.alignWith(neighbors)
  this.accelerations[this.align] = alignSteer.mult(alignSlider.value());

  let separationSteer = this.separation(neighbors);
  this.accelerations[this.sep] = separationSteer.mult(separationSlider.value());

  let cohesionSteer = this.cohesion(neighbors);
  this.accelerations[this.cohe] = (cohesionSteer.mult(cohesionSlider.value()));
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

drawSeparationPerception(){
  noFill();
  stroke(0, 255, 0);
  circle(0, 0, this.perceptions[this.sep]);
}

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
  stroke(255, 0, 255);
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

  //this.drawSeparationPerception();
  //this.drawWolfPerception();
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

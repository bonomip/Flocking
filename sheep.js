class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.perception = 200;
  this.wolf_perception = 150;
  this.min_dist_sep = 20;
  this.separation_factor = 0.4;

  this.min_speed = 0.05;
  this.max_speed = 5;
  this.speed = random(0, 5);

  this.drag = 0.1;
  this.dt_factor = 0.05;

  this.acc = createVector(0,0);
  this.desired = createVector(0, 0);
  this.pos = createVector(x, y);
  this.fwd = p5.Vector.random2D().normalize();
  this.w = 100 * size; //body width
  this.h = 50 * size; //body height
  this.c = 30 * size; //head size
}

getRotation(){
    var a = atan2(this.fwd.x, this.fwd.y);
    return -a+90;
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

vel(){
  return this.mult(this.fwd, this.speed);
}

dist(v, w){
  return p5.Vector.dist(v, w);
}

dot(v, w){
  return p5.Vector.dot(v, w);
}

setVel(vel){
  let m = vel.mag();

  if(m < this.min_speed){
    this.speed = 0;
    return;
  }

  this.speed = constrain(m, this.min_speed, this.max_speed);
  this.fwd = vel.normalize();
}

inverseForce(mag, rad, max){
  return (rad - mag)/rad*max;
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
  let avg_pos = createVector(0, 0);

  for(let other of sheeps)
      avg_pos.add(other.pos);

  avg_pos.div(sheeps.length);
  let avg_vel = this.sub(avg_pos, this.pos);
  let s = this.inverseForce(avg_vel.mag(), this.perception, this.max_speed);
  avg_vel.setMag(s);

  return avg_vel;

}

align(sheeps){
  let avg_vel = createVector(0, 0);

  let avg_speed = 0;

  for(let other of sheeps){
      avg_vel.add(other.vel());
      avg_speed += other.speed;
    }

  avg_vel.normalize();

  let factor = this.dot(avg_vel, this.fwd);

  avg_speed /= sheeps.length;

  avg_vel.setMag(avg_speed);

  //weight the speed to apply to tavg_vel based on how much the this.fwd and avg_vel are different
  // if this.fwd and avg_vel are a lot similar so don't apply any forces because i'm alread
  //aligned
  return avg_vel;
}

flee(from){

  if(this.dist(this.pos, from) >= this.wolf_perception)
    return createVector(0,0);

  let vel = this.sub(this.pos, from);
  let s = this.inverseForce(vel.mag(), this.wolf_perception, 100);

  return vel.normalize().mult(s);
}

steer(desired){
  //// TODO: smooth steering when sheep is stop and than suddently start
  // there's too much inconsistency and the cange of fwd is too hard.
  // ADD MAX STEERING ANGLE

  let force = this.sub(desired, this.vel()).limit(this.max_speed);
  let drag_force = this.mult(this.mult(this.vel(), this.vel()), this.drag*0.5);
  let new_acc = this.sub(force, drag_force);
  let new_vel = this.add(this.vel(), this.mult(this.add(this.acc, new_acc), this.dt_factor));

  this.setVel(new_vel);
  this.acc = new_acc;
}

// BEHAVIOUR

behaviour(sheeps){

let neighbors = [];

for(let sheep of sheeps)
  if(sheep != this && this.perception > this.dist(sheep.pos, this.pos))
    neighbors.push(sheep);

this.desired.add(this.flee(this.wolf).mult(fleeSlider.value()));

if(neighbors.length != 0) {
  this.desired.add(this.separation(neighbors).mult(separationSlider.value()));
  this.desired.add(this.align(neighbors).mult(alignSlider.value()));
  this.desired.add(this.cohesion(neighbors).mult(cohesionSlider.value()));
}
}

//DRAW METHODS

drawBody(w, h){
  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, w, h);

  /*
  noFill();
  stroke(255, 0, 0);
  circle(0, 0, this.perception*2);
  stroke(0, 255, 0);
  circle(0, 0, this.min_dist_sep);
  */
}

drawHead(f, w, s){
  fill(120);
  noStroke();
  ellipseMode(CENTER);
  f.mult(w/3);
  circle(f.x, f.y, s);
}

draw(alpha){

  this.steer(this.desired);

  this.pos = this.add(this.pos, this.mult(this.fwd, this.speed));

  this.desired = createVector(0, 0);

  push();

  translate(this.pos.x, this.pos.y);
  rotate(this.getRotation());

  this.drawBody(this.w, this.h);
  this.drawHead(createVector(1,0), this.w, this.c);

  pop();
}

}

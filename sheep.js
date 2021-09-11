class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.perception = 100;
  this.min_speed = 0.05;
  this.max_speed = 10;
  this.speed = random(0, 5);
  this.drag = 0.1;
  this.acc = createVector(0,0);
  this.dt_factor = 0.05;

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

setVel(vel){
  let m = vel.mag();

  if(m < this.min_speed){
    this.speed = 0;
    return;
  }

  this.speed = constrain(m, this.min_speed, this.max_speed);
  this.fwd = vel.normalize();
}


//SEERING METHODS

cohesion(sheeps){

}

align(sheeps){
  let avg_vel = createVector(0, 0);

if(sheeps.length == 0) return avg_vel;

  for(let other of sheeps)
      avg_vel.add(other.vel());

  return avg_vel.div(sheeps.length);
}

flee(from){

  let vel = createVector(0,0);

  if(this.dist(this.pos, from) >= this.perception)
    return vel;

  vel = this.sub(this.pos, from);
  let s = (this.perception - vel.mag())/this.perception*this.max_speed;

  return vel.normalize().mult(s);
}

steer(desired){
  //// TODO: smooth steering when sheep is stop and than suddently start
  // there's too much inconsistency and the cange of fwd is too hard.

  let force = this.sub(desired, this.vel());
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

let desired = createVector(0,0);

desired.add(this.flee(this.wolf));
desired.add(this.align(neighbors));

this.steer(desired.div(2));

this.pos = this.add(this.pos, this.mult(this.fwd, this.speed));

//console.log("SPEED:"+this.speed);
}

//DRAW METHODS

drawBody(w, h){
  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, w, h);

  noFill();
  stroke(2550, 0, 0);
  circle(0, 0, this.perception*2);

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
  rotate(this.getRotation());

  this.drawBody(this.w, this.h);
  this.drawHead(createVector(1,0), this.w, this.c);

  pop();
}

}

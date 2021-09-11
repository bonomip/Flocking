class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.perception = 400;
  this.max_speed = 10;
  this.speed = 0;
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

setVel(vel){
  let m = vel.mag();

  if(m < 0.01){
    this.speed = 0;
    return;
  }

  this.speed = constrain(m, 0, this.max_speed);
  this.fwd = vel.normalize();
}


//SEERING METHODS



align(sheeps){
  let avg_fwd = createVector();
  let avg_speed = 0;

  for(let other of sheeps){
    if(other == this) continue;
    avg_fwd.add(other.fwd);
    avg_speed += other.speed;
  }

    return avg_fwd.mult(avg_speed).div(sheeps.length);
}

flee(from){

  let v = this.sub(this.pos, from);
  v.limit(this.perception-0.1); //add boundary error because p5 sucks

  //// TODO: make this function better so the sheep is going to go max speed
  //for example 2 units befor mag() == 0
  let s = this.max_speed * (this.perception - v.mag()) / this.perception;

  return v.normalize().mult(s);
}

steer(desired){
  //this.speed = constrain(this.speed+desired.mag(), 0, this.max_speed);

  let force = this.sub(desired, this.vel());
  let drag_force = this.mult(this.mult(this.vel(), this.vel()), this.drag*0.5);
  let new_acc = this.sub(force, drag_force);
  let new_vel = this.add(this.vel(), this.mult(this.add(this.acc, new_acc), this.dt_factor));

  this.setVel(new_vel);
  this.acc = new_acc;
}

// BEHAVIOUR

behaviour(sheeps){

  //// TODO: add speed fdamping

let desired = this.flee(this.wolf);
//desired.add(  this.align(sheeps));

this.steer(desired);

this.pos = this.add(this.pos, this.mult(this.fwd, this.speed));

console.log("SPEED:"+this.speed);
}

//DRAW METHODS

drawBody(w, h){
  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, w, h);
}

drawHead(f, w, s){
  fill(120);
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

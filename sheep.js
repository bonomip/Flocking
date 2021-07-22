class Sheep {

//dir is an angle 0 to 360
constructor(x,y, dir){
  this.pos = createVector(x, y);
  this.alpha = dir;
  this.fwd = createVector(1, 0);
  this.w = 100; //width
  this.h = 50; //height
}

getForward(){
  var v = this.fwd.copy();
  v.rotate(this.alpha);
  return v;
}

draw(alpha){

  push();

  translate(this.pos.x, this.pos.y);
  rotate(this.alpha);

  fill(60);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, this.w, this.h);

  fill(120);
  ellipseMode(CENTER);
  var f = this.fwd.copy();
  f.mult(this.w/2);
  circle(f.x, f.y, 30)

  pop();
}

}

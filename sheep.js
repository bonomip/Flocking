class Sheep {

//dir is an angle 0 to 360
constructor(x,y, size){
  this.debug = true;

  this.global_perception = 200;
  this.drag = 0.1;

  this.align_perception = 50;
  this.align_speed_threshold = 0.01;
  this.align_max_steer_force = 0.5;
  this.align_max_speed = 5; //the speed is going to be the disired vector magnitude,
                            //higher the mag higher the angle between the velocity
                            //and the steer vector
                            // is also possibile to multiply the result steer vectory by a factor
                            // to add force
  this.align_velocity = createVector(0, 0);
  this.align_acceleration = createVector(0, 0);

  this.wolf_perception = 100;
  this.wolf_min_perception = 30;
  this.wolf_max_steer_force = 0.5;
  this.wolf_max_flee_speed = 5;
  this.wolf_flee_velocity = createVector(0, 0);
  this.wolf_flee_acceleration = createVector(0, 0);

  this.min_dist_sep = 20;
  this.separation_factor = 0.4;

  this.min_speed = 0.01;
  this.max_speed = 5; // GLOBAL MAXIMUM SPEED
  this.max_force = 5;

  this.rotation = -90;
  this.acceleration = createVector(0,0);
  this.pos = createVector(x, y);
  this.velocity = createVector(0, 0);

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
  let desired = createVector(0, 0);

  let desired_speed = 0;

  let count = 0;

  for(let other of sheeps){
      let d = this.pos.dist(other.pos);

      if(other.velocity.mag() < this.align_speed_threshold || d > this.align_perception){
        continue;
      }

      desired.add(other.velocity);
      desired_speed += other.velocity.mag();
      count++;
    }

  if(count == 0)
    return this.sub(createVector(0, 0), this.align_velocity);

  desired_speed /= count;

  desired.div(count);
  desired.mult(desired_speed);
  desired.limit(this.align_max_speed);

  let steer = this.sub(desired, this.align_velocity).limit(this.align_max_steer_force);

  return steer;
}

flee(){
  let desired = this.sub(this.pos, this.wolf);

  let d = desired.mag();

  desired.normalize();

  if(d > this.wolf_perception)
    return this.sub(createVector(0,0), this.wolf_flee_velocity);

  let m;

  if(d < this.wolf_min_perception){
    m = this.wolf_max_flee_speed;
  } else {
    m = map(d, 20, this.wolf_perception, this.wolf_max_flee_speed, 0);
  }


  desired.mult(m);

  let steer = this.sub(desired, this.wolf_flee_velocity).limit(this.wolf_max_steer_force);
  return steer;
}

// BEHAVIOUR

behaviour(sheeps){

  let neighbors = [];

  for(let sheep of sheeps)
    if(sheep != this && this.global_perception > this.dist(sheep.pos, this.pos))
      neighbors.push(sheep);

  let fleeSteer = this.flee()
  this.wolf_flee_acceleration = fleeSteer.mult(fleeSlider.value());

  if(neighbors.length != 0)
  {
    //let separationSteer = this.separation(neighbors);
    //this.applyForce(separationSteer.mult(separationSlider.value()));

    let alignSteer = this.align(neighbors)
    this.align_acceleration = alignSteer.mult(alignSlider.value());

    //let cohesionSteer = this.cohesion(neighbors);
    //this.applyForce(cohesionSteer.mult(cohesionSlider.value()));
  }
}

getAngleBetween(v, w){
  let z = v.cross(w);
  z.normalize();
  z.normalize(); //need to avoid 0, 0, 0.999999999999999

  let up = createVector(0, 0, 1);
  let down = createVector(0, 0, -1);
  let dot = v.dot(w);


  if(z.mag() < 1)
      return 0;

  let args = dot / (v.mag() * w.mag());

  if(args > 1)
    args = 1;
  if(args < -1)
    args = -1;


  if(z.dot(up) == 1){
    return acos(args);
  } else if(z.dot(down) == 1){
    return acos(args) * (-1);
  }

  return NaN;
}

updateRotation(last, now){
  let e = 0.001;
  if(last.mag() < e && now.mag() > e){
    var a = atan2(now.x, now.y);
    this.rotation = -a+90;
    return;
  }

  this.rotation += this.getAngleBetween(last, now);
}

step(){

  this.wolf_flee_velocity.add(this.wolf_flee_acceleration);
  this.wolf_flee_velocity.limit(this.wolf_max_flee_speed);

  this.align_velocity.add(this.align_acceleration);
  this.align_velocity.limit(this.align_max_speed);

  let last_frame_velocity = this.velocity.copy();

  this.velocity.add(this.wolf_flee_velocity);
  this.velocity.add(this.align_velocity);

  this.velocity.limit(this.max_speed);
  this.velocity.mult(1-this.drag);

  this.updateRotation(last_frame_velocity, this.velocity.copy());

  if(this.velocity.mag() <= this.min_speed)
    this.velocity.mult(0);
  if(this.wolf_flee_velocity.mag() <= this.min_speed)
    this.wolf_flee_velocity.mult(0);
  if(this.align_velocity.mag() <= this.min_speed)
    this.align_velocity.mult(0);

  this.pos.add(this.velocity);

  this.acceleration.mult(0);
  this.wolf_flee_acceleration.mult(0);
  this.align_acceleration.mult(0);
}

//DRAW METHODS

drawAlignPerception(){ //DEBUg
  noFill();
  stroke(255, 0, 0);
  circle(0, 0, this.align_perception*2);

}

drawWolfPerception(){ //DEBUG
  noFill();
  stroke(0, 255, 0);
  circle(0, 0, this.wolf_perception*2);
}

drawVector(vector, color){ //DEBUg
  if(vector.mag() < 0.001) return;
    drawArrow(this.pos, this.mult(vector, 20), color);
}

drawDesired(){
  let c1 = createVector(width/2 + 100,height/2);
  let c2 = createVector(width/2 + 100,height/2);
  let c3 = createVector(width/2 - 100,height/2);
  let c4 = createVector(width/2 - 100 ,height/2);
  let m1 = createVector(0, -100);
  let m2 = createVector(75, -75);

  drawArrow(c1, m1, "blue");
      drawArrow(c1, m1, "green");
        drawArrow(c1, this.sub(m1, m1), "red");


  drawArrow(c3, m1, "blue");
      drawArrow(c3, m1, "green");
          drawArrow(c3, this.sub(m1, m1), "red");


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

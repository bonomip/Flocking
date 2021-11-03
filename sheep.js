class Sheep {

  constructor(x,y, size, angle, debug, color = "black"){
    this.debug = debug;

    //// TODO:  add mood for each sheep
    //to create diversity
    //the sheep is going to react based on the mood to different stimulus
    //this.sep_mood = random(0, 10);
    //this.flee_mood = random(0, 10);

    //sheep's color
    this.color = color;
    //sheep's size
    this.size = size;
    //body width
    this.w = 100 * size;
    //body height
    this.h = 50 * size;
    //head size
    this.c = 30 * size;
    //current rotation
    this.rotation = angle;
    //current position
    this.pos = createVector(x, y);
    //sheep's angle of view
    this.p_angle = 75;
    //drag
    this.drag = 0.1;
    //sheep's max steering angle
    this.s_angle = 5;
    // the minimum speed of the sheep when
    // it's new velocity is the inverse of last frame velocity
    this.min_a_speed = 0.2;
    this.flee_min_perception = 300*size;
    this.cohe_min_distance = 50*size;
    this.separation_min_distance = this.size * 5;
    this.fear = 0;

    let params = new SheepParams(size);

    this.velocities = params.velocities;
    this.accelerations = params.accelerations;
    this.perceptions = params.perceptions;
    this.speed_limits = params.speed_limits;
    this.speed_threshold = params.speed_threshold;
    this.force_limits = params.force_limits;

    //index for the array assigned above
    this.glob = 0;
    this.flee = 1;
    this.align = 2;
    this.cohe = 3;
    this.sep = 4;
  }


////// SHORT CUT FUNCTIONS /////////////////////////////////////////////////////

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


//////// MATH FUNCTIONS ////////////////////////////////////////////////////////

  /**
    @param {float} d - Distance value
    @param {float} max - Distance's upper bound
    @param {float} min - Distance's lower bound
    @param {integer} e  -  Exponent
  */
  inverseSquareFunction(d, max, min, e){
    if(d < min)
      return 0;
    if(d > max)
      return 1;

    return pow(d/max, e);
  }

  /**
    returns the logaritm with base x and argument x
  */
  log(b, x){
    return log(x) / log(b);
  }


////////////////////////////////////////////////////////////////////////////////

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

  computeFearFactor(r, d){
    angleMode(RADIANS);
    let fear = atan((r-d)/20)/PI + 0.5;
    angleMode(DEGREES);
    return fear;
  }

  /**
    @param {P5.Vector} fwd - Sheep's forward Vector
    @param {P5.Vector} vel - Sheep's velocity [PASS IT BY COPY!]
  */
  constrainVelocityAngle(fwd, vel){
    let alpha = fwd.angleBetween(vel);

    if(isNaN(alpha) || abs(alpha) <= this.s_angle ) //if alpha is NaN so vel is 0, 0, 0;
      return vel;

    let m = map(abs(alpha), this.s_angle, 180, vel.mag(), this.min_a_speed);
    vel.setMag(m);

    if(alpha < 0)
      vel.rotate(-alpha-this.s_angle);
    else
      vel.rotate(-alpha+this.s_angle);

    return vel;
  }

////////////////////////////////////////////////////////////////////////////////
////// BEHAVIOUR METHODS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


///////////// SEPARATION ///////////////////////////////////////////////////////

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

    if(d < 0.0001) //overlapping
        v = p5.Vector.random2D();

    v.setMag(d);

    return v;
  }

  computeSepDesired(perception, max_speed, dist_threshold){
    let desired = createVector(0, 0);
    let count = 0;

    if(this.mood == 0) return desired;

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

    desired.mult(m0*separationSlider.value()*(1-this.fear));

    return desired;
  }

  computeSepSteer(sheeps, idx){

    let desired = this.computeSepDesired(
      this.perceptions[idx],
      this.speed_limits[idx],
      this.cohe_min_distance);

    let steer = this.sub(desired, this.velocities[idx]);
    steer.limit(this.force_limits[idx]);
    return steer;
  }


///////////// COHESION /////////////////////////////////////////////////////////

  computeAvgPos(sheeps){
    let avg_pos = createVector(0, 0);
    let count = 0;

    for(let other of sheeps){
      avg_pos.add(other.pos);
      count++;
    }

    if(count == 0) return this.pos;

    return avg_pos.div(count);
  }

  computeCoheDesired(pos, idx){
    if(this.fear < 0.1) return createVector(0, 0);

    let desired = this.sub(pos, this.pos);

    let m0 = this.inverseSquareFunction(
      desired.mag(),
      800*this.size,
      this.cohe_min_distance,
      2);

    desired.normalize();

    desired.mult(m0*this.fear*cohesionSlider.value());
    desired.limit(this.velocities[idx]);

    return desired;
  }

  computeCoheSteer(sheeps, idx){

    let steer;

    if(sheeps.length == 0)
      steer = this.sub(createVector(0,0),this.velocities[idx]);
    else
      steer = this.sub(
                    this.computeCoheDesired(this.computeAvgPos(sheeps)),
                    this.velocities[idx]);

    steer.limit(this.force_limits[idx]);

    return steer;
  }


//////////// ALIGNMENT /////////////////////////////////////////////////////////

  computeAlignDesired(sheeps, idx){
    let desired = createVector(0, 0);
    let count = 0;

    for(let other of sheeps){
        if( !this.isInMyView(other.pos, this.p_angle, this.perceptions[idx])
            || other.velocities[this.glob].mag() < this.speed_threshold[idx])
          continue;
        desired.add(other.velocities[this.glob]);
        count++;
    }

    if(count == 0)
      return createVector(0, 0);

    desired.div(count);
    desired.mult(this.fear);
    desired.mult(alignSlider.value());
    desired.limit(this.speed_limits[idx]);

    return desired;
  }

  computeAlignSteer(sheeps, idx){
    let desired = this.computeAlignDesired(sheeps, idx);

    let steer = this.sub(desired, this.velocities[idx]);
    steer.limit(this.force_limits[idx]);
    return steer;
  }


///////// FLEE /////////////////////////////////////////////////////////////////

  computeFleeDesired(direction, magnitude, idx){

    if(!this.isInMyView(this.wolf, 360, this.perceptions[idx]))
      return createVector(0,0);

    let m;

    if(magnitude <= this.flee_min_perception){
      m = this.speed_limits[idx];
    } else {
      m = map(
        magnitude,
        this.flee_min_perception,
        this.perceptions[idx],
        this.speed_limits[idx],
        0);
    }


    direction.setMag(m);
    direction.mult(fleeSlider.value());

    return direction;
  }

  computeFleeSteer(direction, magnitude, idx){
    let desired = this.computeFleeDesired(direction, magnitude, idx);

    let steer = this.sub(desired, this.velocities[idx]);
    steer.limit(this.force_limits[idx]);

    return steer;

  }


////////////////////////////////////////////////////////////////////////////////
/////// COMPUTE AND APPLY //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  computeBehaviours(sheeps){

    let neighbors = [];

    for(let sheep of sheeps) if(sheep != this) neighbors.push(sheep);

    //vector from wolf position to my position
    let v =  this.sub(this.pos, this.wolf);
    //magitude of that vector
    let m = v.mag();

    this.fear = this.computeFearFactor(this.perceptions[this.flee], m);

    //passing v, m so i dont have to compute them twice ;)
    this.accelerations[this.flee] = this.computeFleeSteer(v, m, this.flee);

    this.accelerations[this.cohe] = this.computeCoheSteer(neighbors, this.cohe);

    this.accelerations[this.align] = this.computeAlignSteer(neighbors, this.align);

    this.accelerations[this.sep] = this.computeSepSteer(neighbors, this.sep);
  }

  applyBehaviours() {
    //save last velocity
    let last_frame_velocity = this.velocities[this.glob].copy();

    for(let i = 1; i < this.velocities.length; i++){
      this.velocities[i].add(this.accelerations[i]);
      this.velocities[i].limit(this.speed_limits[i]);
      this.velocities[this.glob].add(this.velocities[i]);
    }

    this.velocities[this.glob].limit(this.speed_limits[this.glob]*(1+this.fear/2));

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


////////////////////////////////////////////////////////////////////////////////
//////// DRAW METHODS //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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

  drawBody(w, h){
    //body as rectangle
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, w, h);

    /*fill(this.color);
    noStroke();
    circle(0, 0, this.w);*/
  }

  drawHead(f, w, s){
    fill(120);
    noStroke();
    ellipseMode(CENTER);
    f.mult(w/3);
    circle(f.x, f.y, s);
  }


///////// DEBUG ////////////////////////////////////////////////////////////////

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
}

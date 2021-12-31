class Sheep {

  constructor(x,y, size, angle, debug, color = "dimgray"){
    this.debug = debug;

    //array of the sheeps that are
    //close enought to be taken in cosideration
    //by the collision algorithm
    this.cs = [];

    //// TODO:  add mood for each sheep
    //to create diversity
    //the sheep is going to react based on the mood to different stimulus

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
    
    this.collision_distance = this.w * 0.9;
    this.fear = 0;

    this.prms = new SheepPrms(size);

    //sheep's color
    this.color = color;

    if(this.prms.ff >= 60)
      this.color = "darkslategray";
    
    if (this.prms.ff <= 1)
      this.color = "darkgray";

  }

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

    let v = sub(point, this.pos);

    return (abs(my_fwd.angleBetween(v)) <= angle) && (dist2(point, this.pos) < radius);
  }

  updateRotation(last, now){
    let e = 0.001;

    if(last.mag() < e){

      if(now.mag() > e) this.rotation = 90-atan2(now.x, now.y);

      return;

    }

    this.rotation += last.angleBetween(now);

    if(this.rotation >= 360) this.rotation = this.rotation %360;

  }

  computeFearFactor(r, d){
      
///0  1
///10 1.2
///20 1.4
///40 1.6

    if(d >= r)
      return 0;
    angleMode(RADIANS);
    var fear = atan((r-d)/this.prms.ff) / PI * 2 * (1 + this.prms.ff * 0.002);
    angleMode(DEGREES);

    return fear;
  }


  isAngleLessThen(fwd, v, a){
    var b = fwd.angleBetween(v);
    return isNaN(b)|| (abs(b) <= a); 
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

///////////// SEPARATION ///////////////////////////////////////////////////////

  computeSepVector(other){
    let v = sub(this.pos, other.pos);
    let d = v.mag();

    if(d < 0.001) {
      d = 0.001;
      v = p5.Vector.random2D();
      v.setMag(d);
    }

    return v;
  }

  //prc perception =~ max distance
  //ms = max speed
  // t = distance threshold =~ min distance
  computeSepDesired(sheeps, prc, ms){
    var desired = createVector(0, 0);
    var count = 0;

    for( var i = 0; i < sheeps.length; i++ ){
      if(!this.isInMyView(sheeps[i].pos, 360, prc)){
        sheeps.splice(i, 1);
        i--;
        continue;
      }
      desired.add(this.computeSepVector(sheeps[i]));
      count++;
    }

    if(count == 0) return createVector(0, 0);

    desired.div(count);

    var m0 = fadeOut(desired.mag(), prc, this.prms.sdt, this.prms.fosp);

    desired.mult(m0*separationSlider.value()*(1-this.fear));

    desired.limit(ms);

    return desired;
  }

  computeSepSteer(sheeps, i){

    let desired = this.computeSepDesired(
      sheeps,
      this.prms.prc(i),
      this.prms.sl(i));
    
    if(this.isAngleLessThen(
      createVector(1, 0).rotate(this.rotation),
      desired,
      this.s_angle)){
        desired.mult(0);
    }

    let steer = sub(desired, this.prms.vel(i));

    steer.limit(this.prms.fl(i));

    return steer;
  }


///////////// COHESION /////////////////////////////////////////////////////////

  

  avgPos(sheeps){
    let avg_pos = createVector(0, 0);
    let count = 0;

    for(let other of sheeps){
      avg_pos.add(other.pos);
      count++;
    }

    if(count == 0) return this.pos;

    return avg_pos.div(count);
  }

  coheDesired(pos, i){
    if(this.fear < 0.1) return createVector(0, 0);

    let desired = sub(pos, this.pos);

    let m0 = squash(
                      desired.mag(),
                      this.prms.prc(this.prms.c),
                      this.prms.ctd,
                      this.prms.sscf
                    );

    desired.normalize();

    desired.mult(m0*this.fear*cohesionSlider.value());
    
    desired.limit(this.prms.sl(i));

    return desired;
  }

  computeCoheSteer(sheeps, i){

    let steer = sheeps.length == 0 ?
          sub(createVector(0,0),this.prms.vel(i)) :
          sub(this.coheDesired(this.avgPos(sheeps)), this.prms.vel(i));

    steer.limit(this.prms.fl(i));

    return steer;
  }


//////////// ALIGNMENT /////////////////////////////////////////////////////////

  computeAlignDesired(sheeps, i){
    let desired = createVector(0, 0);
    let count = 0;

    for(let other of sheeps){
        if( !this.isInMyView(other.pos, this.p_angle, this.prms.prc(i))
            || other.prms.gvel().mag() < this.prms.st(i))
          continue;
        desired.add(other.prms.gvel());
        count++;
    }

    if(count == 0)
      return desired;

    desired.div(count);

    desired.mult(this.fear*alignSlider.value());

    desired.limit(this.prms.sl(i));

    return desired;
  }

  computeAlignSteer(sheeps, i){
    let desired = this.computeAlignDesired(sheeps, i);

    let steer = sub(desired, this.prms.vel(i));
    steer.limit(this.prms.fl(i));
    return steer;
  }


///////// FLEE /////////////////////////////////////////////////////////////////

  computeFleeDesired(direction, magnitude, i){

    if(!this.isInMyView(this.wolf, 360, this.prms.prc(i)))
      return createVector(0,0);

    var m0 = invSquash(magnitude, this.prms.prc(i), this.prms.ftd, this.prms.fisp)
    //var m0 = fadeOut(magnitude, this.prms.prc(i), this.prms.ftd, this.prms.fisp);

    direction.mult(m0*fleeSlider.value());

    direction.limit(this.prms.sl(i));

    return direction;
  }

  computeFleeSteer(direction, magnitude, i){
    let desired = this.computeFleeDesired(direction, magnitude, i);

    let steer = sub(desired, this.prms.vel(i));

    steer.limit(this.prms.fl(i));

    return steer;

  }

  //////////////////////////////////// COLLISION

  collisions(){
    if(this.cs.length <= 0)
      return;

    this.cd = createVector(0, 0);
    //threshold distance
    var d = this.collision_distance;
    var count = 0;
    for(var i = 0; i < this.cs.length; i++){
      //if there is a collision
      if(dist2(this.cs[i].pos, this.pos)<d){
        //compute vector from the other sheep to this
        var v = sub(this.pos, this.cs[i].pos);
        //squash it
        v.setMag( ( 1 - ( v.mag() / d ) ) * d );
        this.cd.add(v);
        count++;
      }
    }

    if(count == 0 ) return;

    this.cd.div(this.cs.length);
    this.pos.add(this.cd);
  }


////////////////////////////////////////////////////////////////////////////////
/////// COMPUTE AND APPLY //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  computeBehaviours(sheeps){

    let neighbors = [];
    

    for(let sheep of sheeps) if(sheep != this) neighbors.push(sheep);

    //vector from wolf position to my position
    let v =  sub(this.pos, this.wolf);
    //magitude of that vector
    let m = v.mag();

    this.fear = this.computeFearFactor(this.prms.prc(this.prms.f), m);

    //passing v, m so i dont have to compute them twice ;)
    this.prms.sacc(this.prms.f, this.computeFleeSteer(v, m, this.prms.f));

    this.prms.sacc(this.prms.c, this.computeCoheSteer(neighbors, this.prms.c));

    this.prms.sacc(this.prms.a, this.computeAlignSteer(neighbors, this.prms.a));

    this.cs = [...neighbors];

    this.prms.sacc(this.prms.s, this.computeSepSteer(this.cs, this.prms.s));

  }

  applyBehaviours() {

    let lfv = this.prms.gvel(); //last frame velocity

    this.prms.step();

    this.prms.limitVel(this.prms.g, 1+this.fear/2);
    
    this.prms.sgvel(
        this.constrainVelocityAngle(
            createVector(1, 0).rotate(this.rotation),
            this.prms.gvel())
    );
    
    this.prms.sgvel(this.prms.gvel().mult(1-this.drag));

    this.updateRotation(lfv, this.prms.gvel());

    this.prms.threshold()

    this.pos.add(this.prms.gvel());

    this.prms.reset();

    for(var i = 0; i < 5; i++)
      this.collisions();
  }


////////////////////////////////////////////////////////////////////////////////
//////// DRAW METHODS //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  draw(alpha){

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    this.drawBody(this.w, this.h);
    this.drawHead(createVector(1,0), this.w, this.c);
    if(this.debug){
      this.drawCollison();
      
  }

    pop();

    //this.drawVector(this.cd, color(200,200,200));
  

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
    fill(255);
    noStroke();
    ellipseMode(CENTER);
    f.mult(w/3);
    circle(f.x, f.y, s);
  }


///////// DEBUG ////////////////////////////////////////////////////////////////

  drawCollison(){
    fill(color(120,120,120, 50));
    noStroke();
    ellipseMode(CENTER);
    circle(0, 0, this.collision_distance*2);
  }

  /*drawPerception(i, r = 255, g = 0, b = 0,  a = 360){
    noFill();
    stroke(r, g, b);

    if(a == 360){
      circle(0, 0, this.prms.prc(i)*2);

      if(i == this.prms.s){
        stroke(r/2, g/2, b/2);
        circle(0, 0, this.separation_min_distance*2);
      }
      if(i == this.prms.f){
        stroke(r/2, g/2, b/2);
        circle(0, 0, this.flee_min_perception*2);
      }
      if(i == this.prms.c){
        stroke(r/2, g/2, b/2);
        circle(0, 0, this.cohe_min_distance*2);
      }
    } else {
      arc( 0, 0, this.prms.prc(i)*2, this.prms.prc(i)*2, -a, a, PIE );
    }
  }*/

  drawVector(vector, color){ //DEBUg
    var v = vector.normalize()
    if(v.mag() < 0.001) return;
      drawArrow(this.pos, v, color);
  }

  drawDesired(){
    let c1 = createVector(width/2,height/2);
    let c2 = createVector(width/2,height/2);
    let m1 = createVector(100, 0);

    drawArrow(c1, m1, "blue");
    drawArrow(c1, m1.rotate(this.rotation), "green");
  }
}

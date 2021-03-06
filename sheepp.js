class SheepPrms{

  constructor(size){


    //fear factor m
    /*
     an higher fear factor (> 30 )rep. an adult male
      so its less scary from wolf and has an heighr speed
    */
    this.ff = random(0.1, 41);
    if(this.ff >= 30) //adult 
      this.ff = random(20, 75);

    // fear factor "m" pre computation
    this.ffpc2 = 1 / PI * 2 * (1 + this.ff * 0.002);
    this.ffpc1 = 1 / this.ff;

    //flee perception bias
    this.fpb = 1-random(-0.5*size, 0.5*size );
    //Squared Squash cohesion factor
    this.sscf = 2;
    //Cohesion threshold
    this.ctd = 50*size;

    //fade out separation parameter
    this.fosp = 0.4;
    //separation minimum distance threshold
    this.sdt = 2*size;

    //flee minimum distance trheshold
    this.ftd = 0;
    //flee inverse squash factor
    this.fisp = 5;


    this.g = 0;
    this.f = 1;
    this.a = 2;
    this.c = 3;
    this.s = 4;
    this.b = 5;

    //velocity
    this.avel = [
                        createVector(0, 0),   // 0 global velocity;
                        createVector(0, 0),   // 1 flee velocity
                        createVector(0, 0),   // 2 align velocity
                        createVector(0, 0),   // 3 cohesion velocity
                        createVector(0, 0),    // 4 separation velocity
                        createVector(0, 0)    // 5 avoid bounds velocity
                        ];

    //acceleration                    
    this.aacc = [
                          createVector(0, 0),  // 0 global acceleration;
                          createVector(0, 0),   // 1 flee acceleration
                          createVector(0, 0),   // 2 align acceleration
                          createVector(0, 0),   // 3 cohesion acceleration
                          createVector(0, 0),    // 4 separation acceleration
                          createVector(0, 0)    // 5 avoid bounds velocity
                          ];

    //perceptions                      
    this.aprc = [
                          0*size,   // 0 global perception //not used
                          3200*size*this.fpb,   // 1 flee perception
                          800*size,   // 2 align perception
                          800*size,   // 3 cohesion perception
                                      //used for squared squash as max
                          200*size,  // 4 separation perception
                          2000*size // 5 bounds perception
                        ];
    
    this.asl = [
                          (20+(this.ff/100))*size,   // 0 global max speed;
                          6*size,   // 1 flee max speed
                          12*size,   // 2 align max speed
                          16*size,   // 3 cohesion max speed
                          12*size,   // 4 separation max speed
                          16*size // 5 bound max speed
                        ];

    //speed threshold
    this.ast = [
                              0.1*size,  // 0 global min speed;
                              0.1*size,   // 1 flee min speed
                              0.1*size,   // 2 align min speed
                              0.1*size,   // 3 cohesion min speed
                              0.1*size,  // 4 separation min speed
                              0.1*size // 5 bounds min speed
                                  ];

    //force limits
    this.afl = [
                          2*size,  // 0 global max froce
                          2*size,   // 1 flee max froce
                          2*size,   // 2 align max froce
                          2*size,   // 3 cohesion max froce
                          2*size,  // 4 separation max froce
                          2*size // 5 bounds max force
                            ];
  }

  // PHYSICS

  step(){
    for(let i = 1; i < this.avel.length; i++){
      this.avel[i].add(this.aacc[i]);
      this.avel[i].limit(this.asl[i]);
      this.avel[this.g].add(this.avel[i]);
    }
  }

  threshold(){
    for(let i = 0; i < this.avel.length; i++)
      if(this.avel[i].mag() <= this.ast[i])
        this.avel[i].mult(0);
  }

  ///// GET

  gvel(){
    return this.vel(this.g);
  }

  vel(i){
    return this.avel[i].copy();
  }

  prc(i){
    return this.aprc[i];
  }

  acc(i){
    return this.aacc[i].copy();
  }

  sl(i){
    return this.asl[i];
  }

  st(i){
    return this.ast[i];
  }

  fl(i){
    return this.afl[i];
  }

  ///// SET

  sgvel(v){
    this.avel[this.g] = v;
  }

  sacc(i, v){
    this.aacc[i] = v;
  }

  

  // LIMIT

  limitVel(i, m){
    this.avel[i].limit(this.asl[i]*m)
  }

}

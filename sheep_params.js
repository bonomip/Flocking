class SheepParams{

  constructor(size){
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
                          0*size,   // 0 global perception //not used
                          3200*size,   // 1 flee perception
                          800*size,   // 2 align perception
                          0*size,   // 3 cohesion perception
                          500*size  // 4 separation perception
                        ];

    this.speed_limits = [
                          2,   // 0 global max speed;
                          0.2,   // 1 flee max speed
                          0.2,   // 2 align max speed
                          0.2,   // 3 cohesion max speed
                          0.2   // 4 separation max speed
                        ];

    this.speed_threshold = [
                              0.01,  // 0 global min speed;
                              0.01,   // 1 flee min speed
                              0.01,   // 2 align min speed
                              0.01,   // 3 cohesion min speed
                              0.1  // 4 separation min speed
                                  ];

    this.force_limits = [
                          0.2,  // 0 global max froce
                          0.2,   // 1 flee max froce
                          0.2,   // 2 align max froce
                          0.2,   // 3 cohesion max froce
                          0.2  // 4 separation max froce
                            ];
  }
}

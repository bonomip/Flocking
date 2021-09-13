let sheeps = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);

	fleeSlider = createSlider(0, 5, 1, 0.1);
	fleeSlider.position(width-fleeSlider.width-30, 20);
	alignSlider = createSlider(0, 5, 1, 0.1);
	alignSlider.position(width-fleeSlider.width-30, 50);
	cohesionSlider = createSlider(0, 5, 1, 0.1);
	cohesionSlider.position(width-fleeSlider.width-30, 80);
	separationSlider = createSlider(0, 5, 1, 0.1);
	separationSlider.position(width-fleeSlider.width-30, 110);


	frameRate(30);

	let c = 2;
	let w = width/2;
	let h = height/2;

	for(let i = 0; i < c; i++){
		for(let j = 0; j < c; j++){
			sheeps.push(new Sheep((w/c * i) + w/2, (h/c *j) + h/2, 0.2));
		}
	}

	//sheep = new Sheep(width/2, height/2, 0);
	// put setup code here
}

function draw() {
	background(255);

		text('flee '+fleeSlider.value(), width-fleeSlider.width-65, 35);
		text('align '+alignSlider.value(), width-fleeSlider.width-70, 65);
	  text('cohesion '+cohesionSlider.value(), width-fleeSlider.width-93, 95);
	  text('separation '+separationSlider.value(), width-fleeSlider.width-100, 125);


	sheeps.forEach((item, i) => {
		item.setWolfPosition(mouseX, mouseY);
		item.behaviour(sheeps);
	});

	sheeps.forEach((item, i) => {
		item.bounds();
		item.step();
		item.draw();
	});

	//sheep.draw();
	// put drawing code here
}

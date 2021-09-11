let sheeps = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);

frameRate(30);

	let c = 7;
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

	sheeps.forEach((item, i) => {
		item.setWolfPosition(mouseX, mouseY);
		item.behaviour(sheeps);
		item.draw();
	});

	//sheep.draw();
	// put drawing code here
}

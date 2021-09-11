let sheeps = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);

frameRate(1);

	let c = 2;

	for(let i = 1; i < c; i++){
		for(let j = 1; j < c; j++){
			sheeps.push(new Sheep(width/c * i, height/c *j, 1));
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

let sheep;

function setup() {
	createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);
	sheep = new Sheep(width/2, height/2, 45);
	// put setup code here
}

function draw() {
	background(255);
	sheep.draw();
	// put drawing code here
}

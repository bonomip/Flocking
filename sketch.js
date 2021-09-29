let sheeps = [];

function setup() {
	createCanvas(600, 600);
	angleMode(DEGREES);

	fleeSlider = createSlider(0, 1, 1, 0.1);
	fleeSlider.position(width-fleeSlider.width-30, 20);
	alignSlider = createSlider(0, 1, 1, 0.1);
	alignSlider.position(width-fleeSlider.width-30, 50);
	cohesionSlider = createSlider(0, 1, 1, 0.1);
	cohesionSlider.position(width-fleeSlider.width-30, 80);
	separationSlider = createSlider(0, 1, 1, 0.1);
	separationSlider.position(width-fleeSlider.width-30, 110);


	frameRate(30);

	let c = 2;
	let w = width/2;
	let h = height/2;

	for(let i = 0; i < c; i++){
		for(let j = 0; j < c; j++){
			sheeps.push(new Sheep((w/c * i) + w/2, (h/c *j) + h/2, 0.5, random(0, 360), false));
		}
	}
}

function draw() {
	background(255);

		text('flee '+fleeSlider.value(), width-fleeSlider.width-65, 35);
		text('align '+alignSlider.value(), width-fleeSlider.width-70, 65);
	  text('cohesion '+cohesionSlider.value(), width-fleeSlider.width-93, 95);
	  text('separation '+separationSlider.value(), width-fleeSlider.width-100, 125);


	sheeps.forEach((item, i) => {
		item.draw()
		item.setWolf(mouseX, mouseY);
		item.computeBehaviours(sheeps);
	});

	sheeps.forEach((item, i) => {
		item.applyBehaviours();
		item.bounds();
	});
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 4;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

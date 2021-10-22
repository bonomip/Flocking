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

	sss = createSlider(0, 10, 0, 0.05);
	sss.position(width-fleeSlider.width-30, 140);
	sfs = createSlider(0, 10, 0, 0.05);
	sfs.position(width-fleeSlider.width-30, 170);

	frameRate(30);

	let c = 8;
	let w = width/2;
	let h = height/2;

	for(let i = 0; i < c; i++){
		for(let j = 0; j < c; j++){
			if(i == 0 && j == 0)
				sheeps.push(new Sheep((w/c * i) + w/2, (h/c *j) + h/2, 0.1, random(0, 360), true, "red"));
			else
				sheeps.push(new Sheep((w/c * i) + w/2, (h/c *j) + h/2, 0.1, random(0, 360), false));
		}
	}
}

function draw() {
	background(255);

		text('flee '+fleeSlider.value(), width-fleeSlider.width-65, 35);
		text('align '+alignSlider.value(), width-fleeSlider.width-70, 65);
	  text('cohesion '+cohesionSlider.value(), width-fleeSlider.width-93, 95);
	  text('separation '+separationSlider.value(), width-fleeSlider.width-100, 125);
	  text('speed '+sss.value(), width-fleeSlider.width-90, 155);
		text('force '+sfs.value(), width-fleeSlider.width-85, 185);

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

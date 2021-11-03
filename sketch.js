let sheeps = [];

function setup() {
	createCanvas(900, 680);
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

let lmx = 0;
let lmy = 0;
let vel = 5;

function draw() {
	background(255);

	let p1 = createVector(lmx, lmy);
	let p2 = createVector(mouseX, mouseY);
	let p3;

	let v = p5.Vector.sub(p2, p1);
	if(v.mag() > vel){
		v.setMag(vel);
		p3 = p5.Vector.add(p1, v);
	} else {
		p3 = p2;
	}

	lmx = p3.x;
	lmy = p3.y;

	noStroke();
	fill("green");
  circle(lmx, lmy, 20);

	text('flee '+fleeSlider.value(), width-fleeSlider.width-65, 35);
	text('align '+alignSlider.value(), width-fleeSlider.width-70, 65);
  text('cohesion '+cohesionSlider.value(), width-fleeSlider.width-93, 95);
  text('separation '+separationSlider.value(), width-fleeSlider.width-100, 125);
  text('speed '+sss.value(), width-fleeSlider.width-90, 155);
	text('force '+sfs.value(), width-fleeSlider.width-85, 185);

	sheeps.forEach((item, i) => {
		item.draw()
		item.setWolf(lmx, lmy);
		item.computeBehaviours(sheeps);
	});

	sheeps.forEach((item, i) => {
		item.applyBehaviours();
		item.bounds();
	});
}

function debugAngle() {
  background(240);
  let v0 = createVector(100, 100);

  let v1 = createVector(100, -50);
  drawArrow(v0, v1, 'red');

  let v2 = createVector(mouseX - 100, mouseY - 100);
  drawArrow(v0, v2, 'blue');

	let a = 5;
  let angleBetween = v1.angleBetween(v2);

	if(abs(angleBetween) < a)
		drawArrow(v0, v2, 'green');
	else if(angleBetween < 0){
		v2.rotate(-angleBetween-a);
		drawArrow(v0, v2, 'green');
	} else {
		v2.rotate(a-angleBetween);
		drawArrow(v0, v2, 'green');
	}


  noStroke();
  text(
    'angle between: ' +
      angleBetween.toFixed(2) +
      ' radians',
    10,
    50,
    90,
    50
  );
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

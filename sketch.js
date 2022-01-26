let sheeps = [];
let wolf_img;
let scaling;
let vel;
let wolf_w;
let wolf_h;
let low_b = 200*200;
let high_b = 1000*1000;
let cnv;
let lmx = 0;
let lmy = 0;

function preload() {
	wolf_img = loadImage('res/wolf2.png');
  }

function b(){
	return random(-2*scaling, 2*scaling);
}

function border(){
	return windowHeight > windowWidth ? windowWidth*0.2 : windowHeight*0.2;
}

function windowResized() {
	reset(false);
}

function reset(first){
	var brd = border();
	var ww = windowWidth-brd;
	var wh = windowHeight-brd;

	if(first)
		cnv = createCanvas(ww, wh);
	else
		resizeCanvas(ww, wh);

	cnv.position(brd/2, brd/2);
	
	var pixels = ww*wh;
	if(pixels < low_b)
		pixels = low_b;
	if(pixels > high_b)
		pixels = high_b; 
	
	scaling = map(pixels, low_b, high_b, 0, 1);
	
	vel = (10*scaling)+1.25;
	wolf_w = (28*scaling)+2;
	wolf_h = (38*scaling)+2;

	if(!first)
		sheeps = [];

	let c = ceil(scaling * 10)+3;
	c = c > 11 ? 11 : c;
	var size = 0.01+(0.09 * scaling);
	let w = width/2;
	let h = height/2;
	var sheep_count = 0;
	for(let i = 0; i < c; i++){
		for(let j = 0; j < c; j++){
				sheep_count++;
				var i0 = c/2 + b();
				var j0 = c/2 + b();
				sheeps.push(new Sheep((w/c * i0) + w/2, (h/c *j0) + h/2, size, random(0, 360)));
		}
	}

	//sheeps[0].setDebug(true);

	lmx = 0;
	lmy = 0;
}

function setup() {
	reset(true);
	noCursor();
	angleMode(DEGREES);
	frameRate(30);
}

function draw() {
	background("bisque");

	push();
	noStroke();
	fill(255, 165);
	circle(mouseX, mouseY, (18*scaling)+2);
	pop();

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

	sheeps.forEach((item, i) => {
		item.draw()
		item.setWolf(lmx, lmy);
		item.computeBehaviours(sheeps);
	});

	sheeps.forEach((item, i) => {
		item.applyBehaviours();
		item.bounds();
	});

	lmx = p3.x;
	lmy = p3.y;

	image(wolf_img, lmx-wolf_w/2, lmy-wolf_h/2, wolf_w, wolf_h);
}

/*
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

*/

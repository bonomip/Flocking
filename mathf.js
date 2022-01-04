function mult(v, w){
	return p5.Vector.mult(v, w);
}

function div(v, w){
	return p5.Vector.div(v,w);
}

function add(v, w){
	return p5.Vector.add(v, w);
}

function dist2(v, w){
	return dist(v.x, v.y, w.x, w.y);
}

function sub(v, w){
	return p5.Vector.sub(v, w);
}

function dot(v, w){
	return p5.Vector.dot(v, w);
}


/* create inverse exponential function
  computeSepM0(x, r, max, min){

    //log di max in base r/min
    let e = logb(max, r/min);

    if(x < min)
      return pow(min/r, e);
    else
      return pow(x/r, e);
  }
*/

/**
@param {float} d - Distance value
@param {float} max - Distance's upper bound
@param {float} min - Distance's lower bound
@param {integer} e  -  Exponent
*/
function squash(d, max, min, e){
    if(d < min)
        return 0;
    if(d > max)
        return 1;

    return pow(d/max, e);
    }

function negSquash(d, max, min, e){
    return 1-squash(d, max, min, e);
}

function fadeOut(d, max, min, e){
    if(d < min) return 1;
    if(d >= max) return 0;

    return exp(-e*d);
}

    /**
    returns the logaritm with base b and argument x
    */
function logb(x, b){
    return log(x) / log(b);
}

/*function linearInverse(x, n){
    if(n <= 0) return 0;
    if(x > n) return 0;
    if(x < 0) return n;
    
    return ( 1 - ( x / n ) ) * n
}
*/
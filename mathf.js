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

/**
@param {float} d - Distance value
@param {float} max - Distance's upper bound
@param {float} min - Distance's lower bound
@param {integer} e  -  Exponent
*/
function inverseSquareFunction(d, max, min, e){
    if(d < min)
        return 0;
    if(d > max)
        return 1;

    return pow(d/max, e);
    }

    /**
    returns the logaritm with base b and argument x
    */
function logb(b, x){
    return log(x) / log(b);
}
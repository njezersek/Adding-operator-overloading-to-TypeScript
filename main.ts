class P{
	constructor(public x: number, public y: number){}

	static __add__(a: P, b: P){
		return new P(a.x + b.x, a.y + b.y);
	}

	static __sub__(a: P, b: P){
		return new P(a.x - b.x, a.y - b.y);
	}

	static __mul__(a: P, b: P){
		return new P(a.x * b.x, a.y * b.y);
	}

	static __div__(a: P, b: P){
		return new P(a.x / b.x, a.y / b.y);
	}
}

function t(){
	return new P(1,1);
}

let a = new P(1,3);
let b = new P(2,2);
let c = "123";

let d = a + b * c;

console.log(d);
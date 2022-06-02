declare function __add__(a: number, b: number);

declare function __sub__(a, b);

declare function __mul__(a, b);

declare function __div__(a, b);

declare function __mod__(a, b);

declare function __eq__(a, b);

class P{
	constructor(public x: number, public y: number){}

	static __add__(a: P, b: P){
		return new P(a.x + b.x, a.y + b.y);
	}
}

function t(){
	return new P(1,1);
}

let a: number = 123;
let b = new P(1, 2);

let c = t() + b;

console.log(c);
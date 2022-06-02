var P = /** @class */ (function () {
    function P(x, y) {
        this.x = x;
        this.y = y;
    }
    P.__add__ = function (a, b) {
        return new P(a.x + b.x, a.y + b.y);
    };
    return P;
}());
function t() {
    return new P(1, 1);
}
var a = 123;
var b = new P(1, 2);
var c = P.__add__(t(), b);
console.log(c);

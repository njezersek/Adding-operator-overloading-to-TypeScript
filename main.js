var P = /** @class */ (function () {
    function P(x, y) {
        this.x = x;
        this.y = y;
    }
    P.__add__ = function (a, b) {
        return new P(a.x + b.x, a.y + b.y);
    };
    P.__sub__ = function (a, b) {
        return new P(a.x - b.x, a.y - b.y);
    };
    P.__mul__ = function (a, b) {
        return new P(a.x * b.x, a.y * b.y);
    };
    P.__div__ = function (a, b) {
        return new P(a.x / b.x, a.y / b.y);
    };
    return P;
}());
function t() {
    return new P(1, 1);
}
var a = new P(1, 3);
var b = new P(2, 2);
var c = "123";
var d = P.__add__(a, P.__mul__(b, c));
console.log(d);

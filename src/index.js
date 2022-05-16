class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.testFunction = this.test
    }
    c = '222'

    static __run() {
        console.log('__run')

    }

    test(){
        console.log('test')
    }
    toString() {
        return '( x:' + this.x + ', y:' + this.y+ ', c:' + this.c + ')';
    }
}


class Bar extends Point {
    constructor() {
        super();
        super.test()
    }
    static classMethod() {
        return super.__run() + ', too';
    }
    draw() {
        super.test()
    }
}
var bar = new Bar();
console.log(bar.draw())

console.log('============================')
var point = new Point(2, 3);
console.log(point.__proto__)
console.log(point.toString()) // (2, 3)
console.log(point.hasOwnProperty('x')) // true
console.log(point.hasOwnProperty('y')) // true
console.log(point.hasOwnProperty('c')) // true
console.log(point.hasOwnProperty('toString')) // false
console.log(point.__proto__.hasOwnProperty('toString')) // true


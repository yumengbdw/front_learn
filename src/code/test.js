// const map = new Map()
// const weakmap = new WeakMap()

//     (function () {
//         const foo = { foo: 1 };
//         const bar = { bar: 2 };
//         map.set(foo, 1);
//         weakmap.set(bar, 2)
//     })()



const c = a.bind(b)
Function.prototype.myBind = myBind

function myBind(context, ...args) {
    const somFun = this
    const constructor = arguments.splice(1)
    return function () {
        return somFun.apply(context, [...args, arguments])
    }
}




a.bind(b).bind(c)


function() {
    return somFun(arguments)
}
}








a.myApply(b, args)
// 手写apply  call bind new 防抖 节流 promise

function myApply(context, ...args) {
    const context = context || window
    context.somFun = this
    const res = context.somFun(args)
    delete context.somFun
    return res
}


Function.prototype.myCall = function myCall(context) {
    const context = context || window
    const args = [...arguments].slice(1)
    context.somFun = this
    const res = context.somFun(args)
    delete context.somFun
    return res

}


Function.prototype.myBind = function myBind(context, ...args) {
    const _this = this
    return function () {
        _this.apply(context, [...args, ...arguments])
    }

}





function objectFactory() {
    const obj = new Object()
    const Constructor = [].call.shift(arguments)

    obj.__proto__ = Constructor.prototype
    const res = Constructor.apply(obj, arguments)

    return typeof ret === "object" ? ret : obj;


}


function throttle(fn, wait) {
    let lastTime = 0
    return function () {
        const now = new Date().getTime();
        if (now - lastTime > wait) {
            fn.apply(this, arguments)
            lastTime = now
        }
    }
}

function debounce(fn, wait) {
    let timer = null
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, wait);
    }

}



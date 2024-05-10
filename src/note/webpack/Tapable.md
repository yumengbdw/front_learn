Tapable 原理浅尝

## Tapable的使用
tap 注册 call调用，实际发布订阅模式大同小异，tap用来手机所有的回调，call用来执行回调方向。
```javascript
const {SyncHook} = require("tapable");

const syncHook = new SyncHook()
syncHook.tap('logPlugin', () => { console.log('synchook 被执行了.')})
syncHook.call()

```

-  新建实例对象syncHook`const syncHook = new SyncHook()`
```javascript
//主要是初始化作用,给hook所有要用到的变量赋默认值
constructor(args) {
		if (!Array.isArray(args)) args = [];
		this._args = args;
		this.taps = [];
		this.interceptors = [];
		this.call = this._call;
		this.promise = this._promise;
		this.callAsync = this._callAsync;
		this._x = undefined;
	}


```

- 赋值给syncHoo实例  第二行代码`syncHook.tap('logPlugin', () => { console.log('synchook 被执行了.')})`

> 将传进去的参数变成 options: {type: "sync", fn: Function, name: "logPlugin"}
>  把option赋值给hook实例 ===> 最终执行 this.taps[i] = option;

```javascript
	tap(options, fn) {
		if (typeof options === "string") options = { name: options };
		if (typeof options !== "object" || options === null)
			throw new Error(
				"Invalid arguments to tap(options: Object, fn: function)"
			);
        // 将传进去的参数变成 options: {type: "sync", fn: Function, name: "logPlugin"}
		options = Object.assign({ type: "sync", fn: fn }, options);
		if (typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tap");
        // 把option赋值给hook实例 ===> 最终执行 this.taps[i] = option;
        this._insert(options); 
	}
```

- 生成执行函数并执行  第三行代码`syncHook.call()`
```javascript
function createCompileDelegate(name, type) {
	return function lazyCompileHook(...args) {
		this[name] = this._createCall(type);
		return this[name](...args);
	};
}

_createCall(type) {
    return this.compile({
        taps: this.taps,
        interceptors: this.interceptors,
        args: this._args,
        type: type
    });
}

compile(options) {
    给_x赋值,生成的匿名函数会用到
    factory.setup(this, options);
    // 生成匿名函数并返回
    return factory.create(options);
}

/**
 * 
 * 给 _x 赋值传进去的函数  () => { console.log('synchook 被执行了.')}
 */
*/
setup(instance, options) {
    instance._x = options.taps.map(t => t.fn);
}


/**
 * 
 *  hook关键方法,根据不同的hook生成不同的执行代码,
 *  此处为syncHook 最终生成的代码为  
 *  
 *  
  (function anonymous() {
    "use strict";
    var _context;
    var _x = this._x;
    var _fn0 = _x[0];
    _fn0();
})
 
 */
create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
        case "sync":
            fn = new Function(
                this.args(),
                '"use strict";\n' +
                this.header() +
                this.content({
                    onError: err => `throw ${err};\n`,
                    onResult: result => `return ${result};\n`,
                    resultReturns: true,
                    onDone: () => "",
                    rethrowIfPossible: true
                })
            );
            break;
    }
    this.deinit();
    return fn;
}
```


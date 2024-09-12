## 1. 手写 call bind apply

> 实际上改变 this 指向就是在要改变后的 this 对象中复制一份调用的函数

### call

```js
Function.property.call2 = function (context) {
  var context = context || window; // 有可能传null bar.call(null)
  context.somFn = this;
  let args = [...arguments].slice(1); // 第一个参数是context
  const result = context.somFn(...args);
  delete context.someFn;
  return result;
};
```

### apply

apply 和 call 的区别就是第二个参数是数组

所以

```js
Function.property.apply2 = function(context， arr=[]){
    var context = context || window // 有可能传null bar.call(null)
    context.somFn = this
    const result =  context.somFn(...arr)
    delete context.someFn
    return result
}
```

### bind

会创建一个新的函数，当新的函数调用的时候第一个参数是 this

1. 返回的是一个函数
2. 能够传入参数

```js
Function.property.bind = function (context) {
  if (typeof this !== "function") {
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }
  var _this = this; // 谁调用this就是谁， 也就是bar  context 就是绑定的this即foo
  var args = [...arguments].slice(1); // 取出bind函数第二个开始的参数作为函数调用的函数
  var fTemp = function () {};
  var fBound = function () {
    // bindFoo(18)正常调用的时候this是window对象，实际相当于window.bindFoo(18)。此时的apply绑定的this应该是传进来的foo对象即context。
    //当作为构造函数的时候this就不是context了应该就是fBound本身了。new bindFOO(18) new出来的对象实际上就是fBound的实例。
    return _this.apply(this instanceof fTemp ? this : context, [
      ...args,
      ...arguments,
    ]); // 这里的arguments是调用bind函数的参数即上面的bindFoo('18')
  };

  fTemp.prototype = this.prototype;

  fBound.prototype = new fTemp();
  return fBound;
};
```

### 手写 new

1.1. 手写 new `var person = objectFactory(Person, "Kevin", "18");`

> 即 `(new Object()).__proto__ = Person.prototype`

```js
// 最终版的代码
function objectFactory() {
  var obj = new Object();
  var Constructor = [].shift.call(arguments); // Array.prototype.shift.call(arguments) 即取出第一个参数
  obj.__proto__ = Constructor.prototype;
  var ret = Constructor.apply(obj, arguments);
  return typeof ret === "object" ? ret : obj;
}
```

在上述代码中，防抖函数 debounce 会在指定的延迟时间内，如果函数再次被调用，就取消之前设置的定时器，重新计时。只有在延迟时间结束后没有新的调用，才执行函数。
节流函数 throttle 则是确保在指定的延迟时间内，函数最多被调用一次。

### 节流

```js
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}
```

### 防抖

```js
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
```

## 2. 手写 promise

## 3. 基本数据类型。

基本类型： boolean number String bigData Null Undefined Symbol
引用类型 array obj function
Boolean Number Undefined Null Symbol String

typeof 对于 null array obj 都返回 Object

## 4. 检测数据类型方式

`typeof`
`instanceof`
`('str').constructor === String `
`Object.prototype.toString.call()`

'[object Array]'
'[object String]'

## 5. 判断数组方式

Array.isArray
obj.**proto** === Array.prototype;`
`Array.prototype.isPrototypeOf(obj)`   checks if this object exists in another object's prototype chain.
 obj instanceof Array`
`Object.prototype.toString.call(obj)`

## 6. 关于 this

词法作用域（静态作用域，与之对应的动态作用域）跟调用上下文有关，即变量的作用域由它们声明的位置决定，而不是它们被调用的位置。
。构造函数的 this 指向新创建的对象。改变 this 指向 apply call bind

箭头函数: this 继承自自己作用域的上一层，没有 prototype 不能作为构造函数,没有自己的 arguments 对象，箭头函数中访问 arguments 实际上获得的是它外层函数的 arguments 值。不能用作 Generator 函数，不能使用 yeild 关键字

执行上下文按照类型分
全局执行上下文，
函数执行上下文，
eval 函数执行上下文
执行栈：用来存储代码执行的上下文，后进先出

全局作用域 最外层变量
函数作用域 函数内部变量
块级作用域 {} let const

作用域链： 在当前作用域中查找所需变量，但是该作用域没有这个变量，那这个变量就是自由变量。如果在自己作用域找不到该变量就去父级作用域查找，依次向上级作用域查找，直到访问到 window 对象就被终止，这一层层的关系就是作用域链。

执行上下文包含三部分

1. 变量对象 VO（variable object） 上下文中定义的变量和函数声明 全局上下文 VO 对应的 window
2. 作用域链
3. this

this 是 JavaScript 中的一个特殊关键字，它指向函数执行的当前上下文。this 的指向取决于函数的调用方式，而不是函数声明的位置。以下是一些常见的 this 指向规则：
全局上下文：在全局上下文中，this 指向全局对象（浏览器中是 window，Node.js 中是 global）。
对象方法调用：当一个函数作为对象的方法被调用时，this 指向调用该方法的对象。
构造函数调用：在构造函数中，this 指向新创建的对象。
箭头函数：箭头函数没有自己的 this 值，它会捕获其所在上下文的 this 值。

分析执行过程

```js
var scope = "global scope";
function checkscope() {
  var scope2 = "local scope";
  return scope2;
}
checkscope();
```

1. 首先

```js
ECStack = [globalContext];
```

2. 函数创建的时候

```js
   checkscope.[[scope]] = {
     globalContext.VO
   }

```

3. 函数执行前

```js
ECStack = [
    checkscopeContext，
    globalContext，
];
```

执行新准备工作

给其 scope 赋值之前创建好的 checkscope.[[scope]]

```js
checkscopeContext = {
     Scope: checkscope.[[scope]],
};
```

然后初始化活动对象即 AO（形参、函数声明、变量声明） 并将 AO 压入 checkscope 作用域链顶端

```js
checkscopeContext = {
  AO: {
    arguments: {
      length: 0,
    },
    scope2: undefined,
  },
  //  Scope: checkscope.[[scope]],

  Scope: [AO, [[Scope]]],
};
```

4. 开始执行函数
   执行函数的时候赋值

   ```js
   checkscopeContext = {
     AO: {
       arguments: {
         length: 0,
       },
       scope2: "local scope",
     },
     Scope: [AO, [[Scope]]],
   };
   ```

5. 返回 scope2 的值，返回后函数执行完毕，函数上下文从执行上下文栈中弹出
   变成最初的状态

   ```js
   ECStack = [globalContext];
   ```

其他相关参见闭包章节

## 9. 原型和原型链

每个函数都有一个 prototype 属性，这个属性指向一个对象，称为该函数的原型对象。当使用这个函数创建对象实例时，实例会继承原型对象上的属性和方法。
对象之间的原型关系形成的链条，就是原型链
当访问一个对象的属性或方法时，如果对象自身没有找到，就会沿着原型链向上查找，直到找到或者到达 null 即 Object.prototype 为止。

回答： 查找属性顺序

- 如何获得对象非原型链上的属性？
  使用后 hasOwnProperty()方法来判断属性是否属于原型链的属性：

## 10. 闭包

有权访问另一个函数作用域中变量的函数

闭包是返回函数的时候扫描函数内的标识符引用，把用到的本作用域的变量打成 Closure 包，放到 [[Scopes]] 里。

eval 因为没法分析内容，所以直接调用会把整个作用域打包（所以尽量不要用 eval，容易在闭包保存过多的无用变量），而不直接调用则没有闭包。

闭包是为了解决子函数晚于父函数销毁的问题，我们会在父函数销毁时，把子函数引用到的变量打成 Closure 包放到函数的 [[Scopes]] 上，让它计算父函数销毁了也随时随地能访问外部环境。

```js
javascript
复制代码for (var i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i)
  }, i * 1000)
}

```

如何节约预期打印的 1-5 而不是全部为 6

闭包，立即执行函数解决

```js
for (var i = 1; i <= 5; i++) {
  (function (j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

方法 2 或者利用 setTimeout 的第三个参数（也就是给第一个函数传参）

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(
    function timer() {
      console.log(i);
    },
    i * 1000,
    i
  );
}
```

闭包（Closure）是 JavaScript 中一个非常强大的概念，它指的是一个函数可以访问其创建时的作用域中的变量，即使这个函数在原始作用域之外被调用。

### 闭包的特点：

1. **访问自由变量**：闭包可以访问创建它时所在作用域中的变量，即使这些变量在函数外部是不可见的。

2. **保持状态**：闭包可以保持函数的状态，即使函数执行完毕后，闭包仍然可以访问和修改这些状态。

3. **函数作为一等公民**：函数可以作为参数传递给其他函数，也可以作为其他函数的返回结果。

4. **延迟执行**：闭包可以延迟函数的执行，直到需要的时候才调用。

### 闭包的作用：

1. **数据封装**：闭包可以用来封装数据和逻辑，使得外部代码无法直接访问这些数据，从而实现数据的隐藏和保护。

2. **创建私有变量**：闭包可以创建私有变量，这些变量只能在闭包内部访问，外部代码无法直接访问。

3. **实现模块化**：闭包可以用来实现模块化，将相关的函数和变量封装在一起，形成一个独立的模块。

4. **实现函数工厂**：闭包可以用来创建函数工厂，即返回一个函数的函数。这些返回的函数可以访问创建它们的闭包中的变量。

5. **实现柯里化**：闭包可以用来实现柯里化，即预先填充函数参数的过程。通过闭包，可以创建一个函数，它接受一部分参数，并返回一个接受剩余参数的新函数。

6. **实现异步编程**：闭包在异步编程中非常有用，例如在回调函数中访问外部变量。

### 闭包示例：

```javascript
function outerFunction() {
  var name = "Alice";

  function innerFunction() {
    console.log("Name:", name);
  }

  return innerFunction;
}

var closure = outerFunction();
closure(); // 输出: Name: Alice
```

在这个示例中，`outerFunction` 返回了一个 `innerFunction` 函数。即使 `outerFunction` 执行完毕后，`innerFunction` 仍然可以访问 `outerFunction` 的局部变量 `name`。这就是闭包的作用。

### 注意事项：

- 闭包可能会占用更多的内存，因为它们会保持对创建时作用域的引用，直到闭包被销毁。
- 过度使用闭包可能会导致代码难以理解和维护，因此需要谨慎使用。

总之，闭包是 JavaScript 中一个非常有用的工具，它提供了强大的数据封装和函数封装能力。理解闭包的概念和使用方式对于编写高效、可维护的 JavaScript 代码非常重要。

- 对作用域和作用域链的理解

执行上下文：
执行上下文类型： 全局执行上下文 函数执行上下文 eval 函数执行上下文 。
执行上下文栈：

## 7. let const var

var 变量提升，全局 window 下的，重复声明后声明的替换前面，

let 和 const 存在块级作用域，声明之前不可用即暂时性死去

const 必须要初始值。不能改变指针指向

## 8. 有哪些遍历方法区别

forEach 对数据的操作会改变原数组，
map 不改变原数组，返回新数组
filter
for...of item 为数组的值 遍历数组
for... in 遍历数组和对象 item 为 key ，会遍历对象的整个原型链，返回数组中所有可枚举的属性(性能非常差不推荐使用
every 只要有就返回 false some 只有要就返回 true
find findIndex 返回第一个满足的 item 或者 index
reduce reduceRight

```js
for (const [key, value] of Object.entries({ a: 1, b: 2 })) {
}
```

## 11. promise async await setTimeout Promise.all Promise.race

```js
// 1. 排队操作
// 2. async返回promise对象
// const g = gen()

// 也就是将generator传进去后用一个函数来处理generator执行过程。
function generatorToAsync(generator) {
  return function () {
    return new Promise((resolve, reject) => {
      // 当key为down的时候resolve来结束当前的promise否则调用next方法
      const g = generator();
      let res;
      function step(key, args) {
        try {
          res = g[key](args);
        } catch (error) {
          reject(error);
        }
        // 如果执行完了next()函数后当前的状态是done那么就直接结束return的promise
        //否则继续执行下一个next，即yield

        console.log(res);
        if (res.done) {
          resolve(res);
        } else {
          // 执行下一个next的时候。
          Promise.resolve(res.value).then(
            (val) => step("next", val),
            (err) => step("reject", val)
          );
        }
      }

      step("next");
    });
  };
}
```

## 12. 浏览器垃圾回收机制 内存泄露

在面试中，关于浏览器的垃圾回收机制和内存泄露的问题是常见的技术问题。以下是一些关键点，可以帮助你更好地理解和回答这些问题。

### 浏览器垃圾回收机制：

1. **引用计数**：这是最早的垃圾回收机制，通过计数每个对象被引用的次数来决定是否回收。如果一个对象的引用计数为 0，它就会被回收。但是，引用计数无法处理循环引用的问题。

2. **标记-清除（Mark-and-Sweep）**：这是现代浏览器常用的垃圾回收机制。 遍历所有可达的对象，将它们标记为“活跃”回收未被标记的对象

3. **复制（Copying）**：将内存分为两个区域，一半用于分配新对象，另一半用于存放存活的对象。当一个区域填满时，垃圾回收器将存活的对象复制到另一个区域，然后清空原来的区域。这种方法可以避免内存碎片，但代价是内存使用效率较低。

4. **分代收集**：新生代中的对象生命周期较短，垃圾回收器会频繁地回收新生代。老生代中的对象生命周期较长，垃圾回收器会较少地回收老生代。

5. **增量回收**：为了避免垃圾回收过程中的长时间停顿，现代浏览器的垃圾回收器会采用增量回收策略，将垃圾回收过程分成多个小步骤，逐步进行。

### 内存泄露：

内存泄露是指程序中不再使用的对象没有被垃圾回收器回收，导致内存占用持续增加。以下是一些常见的内存泄露场景：

1. **全局变量**：将对象赋值给全局变量，这些对象会一直存在于内存中，直到页面关闭。

2. **循环引用**：在 JavaScript 中，循环引用会导致引用计数无法归零，从而阻止垃圾回收器回收这些对象。

3. **未移除的事件监听器**：如果为 DOM 元素添加了事件监听器，但没有在适当的时候移除，这些监听器会一直占用内存。

4. **定时器回调**：使用 `setInterval` 或 `setTimeout` 创建的定时器，如果回调函数中引用了外部变量，这些变量会被保留在内存中。

5. **闭包**：不当使用闭包可能导致内存泄露，因为闭包会捕获并保持对外部变量的引用。

6. **DOM 引用**：在 JavaScript 中，如果一个 DOM 元素被删除，但是 JavaScript 中仍然有对这个元素的引用，这个元素不会被回收。

### 避免内存泄露的策略：

1. **及时清理**：在不需要的时候，及时清理全局变量、事件监听器、定时器等。

2. **避免循环引用**：在可能产生循环引用的地方，使用 `WeakMap` 或 `WeakSet`，这些结构在它们的键或值被回收时会自动删除。

3. **使用 `WeakRef`**：`WeakRef` 是一种弱引用，当被引用的对象被回收时，`WeakRef` 也会被回收。

4. **监控内存使用**：使用浏览器的开发者工具监控内存使用情况，及时发现和解决内存泄露问题。

5. **代码审查**：定期进行代码审查，检查可能的内存泄露问题。

理解浏览器的垃圾回收机制和内存泄露问题对于编写高效、稳定的 Web 应用程序至关重要。在面试中，展示你对这些概念的深入理解，以及你如何避免和解决内存泄露问题，可以给面试官留下深刻印象。

## 13. es6 新特性

箭头，解构及展开(...)，模版字符串``， 函数默认参数值，promise，Generator，类，let 和 const，proxy， for。。。of

## 14. 匿名函数即立即执行函数

封装局部作用域内的代码，以便其声明的变量不会暴露到全局作用域
只用一次，不需要在其他地方使用的回调函数。当处理函数在调用它们的程序内部被定义时，代码具有更好地自闭性和可读性，可以省去寻找该处理函数的函数体位置的麻烦。

## 15. 函数式编程，函数柯里化例子

FP: 是一种编程范式，它将计算视为数学函数的评估，并避免改变状态和可变数据。
定义好输入参数，只关心它的输出结果。函数可以作为作为输入输出（一等公民）。

- 纯函数：
  相同的输入永远会得到相同的输出。不会改变系统的状态，也不依赖于系统状态。
- 高阶函数：
  接受一个或多个函数作为输入，输出另外一个组合函数
- 柯里化 curry
  柯里化是一种将接受多个参数的函数转换成接受一个单一参数（最初函数的第一个参数）的函数，并返回接受余下的参数且返回结果的新函数的技术。这个技术的主要用途是减少代码的冗余和增加函数的复用性。

  ```js
  function curry(fn) {
    return function curried(...args) {
      if (args.length >= fn.length) {
        return fn.apply(this, args);
      } else {
        return function (...args2) {
          return curried.apply(this, args.concat(args2));
        };
      }
    };
  }
  // 使用柯里化的函数
  function sum(a, b, c) {
    return a + b + c;
  }
  const curriedSum = curry(sum);
  console.log(curriedSum(1)(2)(3)); // 输出: 6
  console.log(curriedSum(1, 2, 3)); // 输出: 6
  ```

```

```

柯里化的应用

```js
function addEventListener(type, element, fn) {
  element.addEventListener(type, fn);
}
const addClickListener = curry(addEventListener)("click");
const addMouseOverListener = curry(addEventListener)("mouseover");

const button = document.getElementById("myButton");
addClickListener(button, () => console.log("Button clicked!"));
addMouseOverListener(button, () => console.log("Mouse over button!"));
```

- 函数组合 compose
  将多个函数组合成一个函数，新函数的输出是一个函数的输出作为另一个函数的输入

```js
const add = (x, y) => x + y;
const square = (x) => x * x;

const addAndSquare = (x, y) => square(add(x, y));

console.log(addAndSquare(2, 3));
```

- 副作用以及为什么在函数式编程中避免它们
  副作用是指函数在计算结果的同时，还影响了外部的状态或有外部交互的行为，例如修改全局变量、写文件、修改数据库等

## 16. 事件循环

eventloop 就是一个循环泵不停的查找是否有任务执行
同步任务直接进入到主线程被执行，而异步任务则进入到 Event Table 并把异步任务对应的回调函数注册
异步任务完成后，Event Table 会将这个函数移入 Event Queue
主线程任务执行完了以后，会从 Event Queue 中读取任务，进入到主线程去执行。
js 引擎存在 monitoring process 进程，会持续不断的检查主线程执行栈是否为空，一旦为空，就会去 Event Queue 那里检查是否有等待被调用的函数。
这里就引发了一个问题 setTimeout 设置的时间并不准。假如同步任务执行时间远超过定时器设置的时间，没办法也是要等到同步任务执行完再执行定时器

宏任务(MacroTask)、微任务(MicroTask)

MacroTask，

> 所有的同步任务代码都是 MacroTask（这么说其实不是很严谨，下面解释）,
> 整体代码 script setTimeout、setInterval、I/O、UI Rendering 等都是宏任务。

MicroTask

> 包括：Process.nextTick、Promise.then catch finally(注意我不是说 Promise)、MutationObserver。

我们仅仅需要记住几个 MicroTask 即可，排除法！别的都是 MacroTask

```js
setTimeout(function () {
  console.log("定时器开始啦");
});

new Promise(function (resolve) {
  console.log("马上执行for循环啦");
  for (var i = 0; i < 10000; i++) {
    i == 99 && resolve();
  }
}).then(function () {
  console.log("执行then函数啦");
});

console.log("代码执行结束");
```

new Promise 立即执行，resolve,then 函数分发到微任务 Event Queue。
然后执行 console.log("代码执行结束"); ----》微任务 then ----》 第二轮宏任务从 Event Queue 找（ 异步任务存在 Event Table 会将回调移入 Event Queue）

执行结果如下

<!--
马上执行 for 循环啦
代码执行结束
执行 then 函数啦
定时器开始啦
 -->

测试题

```js
console.log("1");

setTimeout(function () {
  console.log("2");
  process.nextTick(function () {
    console.log("3");
  });
  new Promise(function (resolve) {
    console.log("4");
    resolve();
  }).then(function () {
    console.log("5");
  });
});
process.nextTick(function () {
  console.log("6");
});
new Promise(function (resolve) {
  console.log("7");
  resolve();
}).then(function () {
  console.log("8");
});

setTimeout(function () {
  console.log("9");
  process.nextTick(function () {
    console.log("10");
  });
  new Promise(function (resolve) {
    console.log("11");
    resolve();
  }).then(function () {
    console.log("12");
  });
});
```

1，7，6，8，2，4，3，5，9，11，10，12

```js
console.log("start");
setTimeout(() => {
  console.log("timer1");
  Promise.resolve().then(function () {
    console.log("promise1");
  });
}, 0);
setTimeout(() => {
  console.log("timer2");
  Promise.resolve().then(function () {
    console.log("promise2");
  });
}, 0);
Promise.resolve().then(function () {
  console.log("promise3");
});
console.log("end");
```

浏览器环境
start
end
promise3

timer1
promise1
timer2
promise2

node 环境
start=>end=>promise3=>timer1=>timer2=>promise1=>promise2

总结 浏览器环境下，microtask 的任务队列是每个 macrotask 执行完之后执行。在 node 环境下 microtask 会在事件循环的各个阶段之间执行，也就是一个阶段执行完毕，就会去执行 microtask 队列的任务。

## 17. js 设计模式，手写

创建型模式，共五种：工厂方法模式、抽象工厂模式、单例模式、建造者模式、原型模式。

结构型模式，共七种：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式。

行为型模式，共十一种：策略模式、模板方法模式、观察者模式/发布订阅模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式。

- 手写单例

```js
javascript
复制代码let CreateSingleton = (function(){
    let instance;
    return function(name) {
        if (instance) {
            return instance;
        }
        this.name = name;
        return instance = this;
    }
})();
CreateSingleton.prototype.getName = function() {
    console.log(this.name);
}

```

使用

```js
javascript
复制代码let Winner = new CreateSingleton('Winner');
let Looser = new CreateSingleton('Looser');
​
console.log(Winner === Looser); // true
console.log(Winner.getName());  // 'Winner'
console.log(Looser.getName());  // 'Winner'

```

- 手写观察者模式

```js

javascript
复制代码// 定义observe
const queuedObservers = new Set();
const observe = fn => queuedObservers.add(fn);
​
​
const observable = obj => new Proxy(obj, {
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    // notify
    queuedObservers.forEach(observer => observer());
    return result;
  }
});

```

- 手写发布订阅

dom 事件也可以当做发布订阅模式 考题 btn 添加两个 click 监听，执行结果

on

emit
off

```js

   *{
            font-size: 15px;
        }

```

`*`的优先级高于继承

## 18. 深拷贝浅拷贝

浅拷贝+递归，判断如果是对象就递归

```js
function deepCopy(source) {
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === "object") {
        target[key] = deepCopy(source[key]); // 注意这里
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
```

循环引用
json 循环引用会报错
a.circleRef = a;

JSON.parse(JSON.stringify(a));
// TypeError: Converting circular structure to JSON

解决循环引用的深拷贝原理就是将对象保存在 map 中。当检测到当前对象已存在于哈希表中时，取出该值并返回即可。

```js
// 木易杨
function deepCopy(source, hash = new WeakMap()) {
  if (!isObject(source)) return source;
  if (hash.has(source)) return hash.get(source); // 新增代码，查哈希表

  var target = Array.isArray(source) ? [] : {};
  hash.set(source, target); // 新增代码，哈希表设值

  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (isObject(source[key])) {
        target[key] = deepCopy(source[key], hash); // 新增代码，传入哈希表
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
```

es5 中没有 weakmap 可以用数组

```js
if (!uniqueList) uniqueList = []; // 新增代码，初始化数组

var target = Array.isArray(source) ? [] : {};

// ============= 新增代码
// 数据已经存在，返回保存的数据
var uniqueData = find(uniqueList, source);
if (uniqueData) {
  return uniqueData.target;
}

// 数据不存在，保存源数据，以及对应的引用
uniqueList.push({
  source: source,
  target: target,
});
// =============
```

## 19. Service Worker

构建渐进式 Web 应用程序

Service worker 本质上充当 网页和网络（可用时）之间的代理服务器。这个 API 旨在创建有效的离线体验，
拦截网络请求并根据网络是否可用来采取适当的动作、更新来自服务器的资源。它还提供入口以推送通知和访问后台同步 API。

Service Worker 是走的另外的线程，可以理解为在浏览器背后默默运行的一个线程，脱离浏览器窗体，因此，window 以及 DOM 都是不能访问的

Service Worker 和 Web Worker 都是运行在浏览器背景的 JavaScript 执行环境，但它们的用途和功能有显著的区别：

Web Worker 提供了一种方式，使得 Web 应用程序可以运行脚本操作在后台线程中，而不会影响用户界面的响应性。Web Workers 适用于那些需要长时间运行或计算密集型任务的场景，如图像处理或大数据计算。

Service Worker 是一种特殊类型的 Worker，它主要用于实现离线体验、拦截和处理网络请求以及资源缓存。Service Workers 充当应用程序与网络之间的代理服务器，可以控制如何响应资源请求，从而使得 Web 应用能够更好地支持离线使用。

- 用 service worker 实现离线缓存

  1. 注册

  ```js
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("Service Worker 注册成功:", registration);
      })
      .catch(function (error) {
        console.log("Service Worker 注册失败:", error);
      });
  }
  ```

  2.  安装 Service Worker：

  安装的时候打开一个缓存，然后缓存应用的静态资源。

  ```js
  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches.open("v1").then(function (cache) {
        return cache.addAll([
          "/index.html",
          "/styles/main.css",
          "/script/main.js",
        ]);
      })
    );
  });
  ```

  3. 拦截请求并提供响应：
     在 Service Worker 的 fetch 事件中拦截所有的请求，并从缓存中提供资源，如果缓存中没有，则尝试从网络获取。

  ```js
  self.addEventListener("fetch", function (event) {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  });
  ```

- Service Worker 的生命周期是怎样的？
  解答：
  Service Worker 的生命周期包括以下几个阶段：

  1. 注册：在主线程中注册 Service Worker。
  2. 安装（Install）：Service Worker 被安装时触发，通常用于缓存应用所需的资源。
  3. 激活（Activate）：安装后，Service Worker 需要激活。激活阶段常用于清理旧版本的缓存。
  4. 拦截请求（Fetch）：一旦激活，Service Worker 就可以拦截页面的网络请求。
  5. 更新：如果 Service Worker 文件有所更改，浏览器会启动更新过程，下载新的文件并重新安装和激活。
  6. 终止：浏览器可以随时终止 Service Worker 以节省内存，但会在需要时重新启动。
     这些面试题和答案涵盖了 Service Workers 和 Web Workers 的基本概念和应用，可以帮助你在面试中展示你对这些现代 Web 技术的理解和实践经验。

- web worker 和主线程通讯
  Web Worker 和主线程之间的通信是通过消息传递实现的。主线程和 Worker 都可以使用 postMessage 方法发送消息，使用 onmessage 事件处理器接收消息。
  主线程

          ```js
          var myWorker = new Worker("worker.js");

          myWorker.postMessage("Hello, worker!");

          myWorker.onmessage = function (e) {
          console.log("收到来自worker的消息:", e.data);
          };
          ```

  Worker 线程代码（worker.js）：

  ````js
     onmessage = function(e) {
     console.log('收到来自主线程的消息:', e.data);
     postMessage('Hi, main thread!');

  };

     ```
  ````

生命周期
下载

安装

注册 Service Worker

激活

# 其他

## 20. settimeout 浏览器失活的时候停止运行

document.addEventListener('visibilitychange',function(){
document.visibilityState // 浏览器的状态 hidden 和 visible
console.log('浏览器失活的监听')
})

## 21. 判断是不是 promise 考察 promiseA+规范

function isPromise(value){
return value !== null && (typeof value === 'object' || typeof value === 'function')&& (typeof value.then === 'function')
}

## 22. 模块化

commonjs 规范
同步加载模块的，不适合浏览器，会阻塞， 输出的事值的拷贝 esm 是值的引用。

因为只有运行时才能得到这个对象，导致完全没办法在编译时做“静态优化”。

1. node 里面所有 js 都是模块，
2. 全局变量函数都不会产生污染
3. 通过 module.exports import 来相互引用模块内容

module.exports{
functionA, functionB
}

4. require 导入
5. 模块是有缓存的第一次导入会缓存后面直接使用缓存

## 23 ajax

AJAX 不是一种新的编程语言，而是一种使用现有标准的新方法。
它主要由 HTML/CSS、DOM、JavaScript、XMLHttpRequest 和服务器端语言组成。

AJAX 的核心是“异步”，XMLHttpRequest 对象：通过这个对象与服务器交换数据并更新部分网页内容。
接收到服务器响应后，可以使用 JavaScript 对 DOM 进行操作，动态地修改 HTML 内容，从而实现不刷新页面也可以更新页面内容

的核心是“异步”，XMLHttpRequest
open(), send(), 和事件处理如 onreadystatechange

const a = [1, 2,2,3,[1, 2],[1, 3],[1,3],[1, 3], { a: 1 },{a:1,b:1}]

const b = new Set(...a)

for(let item of b){
if
}

ajax

兼容性：在旧版本的浏览器中可能存在兼容性问题，需要进行额外的处理来确保在不同浏览器中正常工作

fetch
使用 Promise 来处理异步操作。
不能在 node 环境使用

语法简洁

错误处理相对复杂一些

axios
使用 Promise
可以在浏览器和 Node.js 中使用。

Axios 可以自动将响应数据转换为 JSON 格式，无需手动处理
拦截器

在各种浏览器中都有较好的兼容性

错误处理：
Ajax 需要手动检查 XHR 对象的状态码和 readyState 属性来处理错误。
Fetch 的错误处理相对复杂，需要分别处理网络错误和 HTTP 状态码错误。
Axios 可以通过捕获 Promise 的拒绝来统一处理错误，并且可以在拦截器中进行全局的错误处理。


## 1. promise手写  async、await实现，generator,三者区别


```js

// 简易版
// 定义生成器函数，入参是任意集合
function webCanteenGenerator(list) {
    var index = 0;
    var len = list.length;
    return {
        // 定义 next 方法
        // 记录每次遍历位置，实现闭包，借助自由变量做迭代过程中的“游标”
        next: function() {
            var done = index >= len; // 如果索引还没有超出集合长度，done 为 false
            var value = !done ? list[index++] : undefined; // 如果 done 为 false，则可以继续取值
            // 返回遍历是否完毕的状态和当前值
            return {
                done: done,
                value: value
            }
        }
    }
}

var canteen = webCanteenGenerator(['道路千万条', '安全第一条', '行车不规范']);
canteen.next();
canteen.next();
canteen.next();

// {done: false, value: "道路千万条"}
// {done: false, value: "安全第一条"}
// {done: false, value: "行车不规范"}
// {done: true, value: undefined}


function* webCanteenGenerator() {
    yield '店小二儿，给我切两斤牛肉来';
    yield '再来十八碗酒';
    return '好酒！这酒有力气！';
}

var canteen = webCanteenGenerator();
canteen.next();
canteen.next();
canteen.next();
canteen.next();

// {value: "店小二儿，给我切两斤牛肉来", done: false}
// {value: "再来十八碗酒", done: false}
// {value: "好酒！这酒有力气！", done: true}
// {value: undefined, done: true}


```


async、await的实现 
<!-- /Users/yum/code/front_learn/src/code/promise/asyncAwait.js -->



```js
function foo(num) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(num * 2)
      }, 1000)
    })
  }  
  // async  具有async功能的函数
  function generatorToAsync(generatorFn) {
    return function() {
      const gen = generatorFn.apply(this, arguments)  
      return new Promise((resolve, reject) => {  
        // const g = generatorFn()
        // const next1 = g.next()
        // next1.value.then(res1 =>  
        //   const next2 = g.next(res1)
        //   next2.value.then(res2 => {
        //     const next3 = g.next(res2)
        //     next3.value.then(res3 => {  
        //       resolve(g.next(res3).value) // { value: 8, done: true }
        //     })
        //   })
        // })
        function loop(key, arg) {
          let res = null
          res = gen[key](arg) // gen.next(8)
          const { value, done } = res
          if (done) {
            return resolve(value)
          } else {
            // Promise.resolve(value) 为了保证 value 中的promise状态已经变更成 成功状态
            Promise.resolve(value).then(val => loop('next', val))
          }
        }
        loop('next')
      })
    }
  }
  
  function* gen() {
    const num1 = yield foo(1)
    const num2 = yield foo(num1)
    const num3 = yield foo(num2)
    return num3
  }
  const asyncFn = generatorToAsync(gen)
  // console.log(asyncFn()); // Promise{}
  asyncFn().then(res => {
    console.log(res);
  })


```
## 2. 事件循环， 宏任务微任务
 - setTimeout的执行过程（事件循环，同步、异步）
 - 解释 requestAnimationFrame/requestIdleCallback，分别有什么用？
 - addEventListener第三个参数是什么
## 3. 原型/继承
   类，实例类型判断
   js 获取原型的方法？
   > p.__proto__
   >  p.constructor.prototype
   > Object.getPrototypeOf(p)



## 4. 回流、重绘是什么？如何减少回流和重绘？

## 5. web worker理解 service worker和强缓存对比
## 6. 实现compose函数, 类似于koa的中间件洋葱模型。 实现一个对象的 flatten 方法。科里化，
## 7.闭包
   变量提升

## 7. 深浅拷贝， this call apply bind 执行上下文，作用域链， ，隐式转换等其他基础相关
### 具体面试题

#### 1. ['10', '10', '10', '10', '10'].map(parseInt) 的输出值是什么？
    > 提示考察的是paseInt的第二个参数，radix 为2-36 如果为0的话当做没有直接返回字符串本身。 
    > [10, NaN, 2,3,4]





图片懒加载


> image.offsetTop <= document.documentElement.clientHeight + document.documentElement.scrollTop
即在可视区域，就可以设置src
```js
image.src = image.getAttribute("data-src");
 image.removeAttribute("data-src")
```

### 1. let仅在作用域有效，而 var 全局作用域，
> 表现上面就是在定义之前打印变量，var 的结果是 undefined  而 let 会报错ReferenceError

```javascript
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10
```
暂时性死区
块级作用域类用 let 声明的所有变量的作用域都在代码块范围内。即使外面定义同名 var 变量  ）
```javascript
var a = 100
if (a === 100) {
    typeof a; // ReferenceError
    a = 88 // ReferenceError
    let a; // 此例子中对于 const 也是一样的
}
```

条件判断语句，和 for 循环判断语句里面，判断语句（就是圆括号里面的 a=== 100   i< 100; i++之类的）的变量都是父作用域，函数体里面都是子作用域
且圆括号里面变量默认都是 let 类型   报错：``bar(x = y, y = 2) {}``
eg： 
for 语句里面的变量 i 是父作用域
循环函数体里面i是子作用域

```javascript
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
```

对于函数默认值，函数参数是独立作用域
```javascript
var x = 1;
function f(x, y = x) {
  console.log(y);
}
f(2) // 2


//=====================
var x = 1;
function f(z, y = x) {
    console.log(y);
}
f(2) // 1

//=====================


var x = 1;
function test(x = x) {
   console.log(x)
}
test()// // 会报错 ReferenceError
test(2)// 2
```
### 2. const定义‘常量’，只是引用地址不变，值无法保证，基础类型的不可变，引用类型（数组[]，对象{}）的值可能发生变化
### 3. 结构 '='表示默认值   ':'表示重命名。
```javascript
const data = { id: '232323' }
var {id: orderId = '777' } = data || {}; // 如果 data 有值，取orderId也就是 data.id的值， 如果 data 没值取orderId即data.id的值就是默认值'777'
orderId // 3
```
> 数组特殊的对象，字符串也是特殊的数组(数组很多属性字符串都具备)。 所以字符串也能结构，和数组一样一一对应。
```javascript
const [a,b] = '你好';  a// 你， b//好
```

变量值交换可以
```javascript
[x, y] = [y, x];
```

函数参数必传判断
```javascript

function throwIfMissing(paramName) {
  throw new Error(`${paramName} 为必传参数！`);
}
function foo(params = throwIfMissing('params')) { // 同样也可以给默认值设置 undefined， 给调用方说明可以省略
    
}
foo()
// Error: Missing parameter
```

### 4.

isFinite() 和 isNaN() 的区别在于，传统方法先调用 Number () 将非数值的值转为数值，再进行判断，而这两个新方法只对数值有效，Number.isFinite() 对于非数值一律返回 false，Number.isNaN() 只有对于 NaN 才返回 true，非 NaN 一律返回 false



Math.trunc(a)  // 返回一个数的整数部分
Math.sign(a)   // 判断是正数还是负数，还是 0  返回 0 1 -1


### 箭头函数不能使用 yield
不可以使用yield命令，因此箭头函数不能用作 Generator 函数。

Array.from第二个参数类似于 map
Array.from(arrayLike, x => x * x);
// 等同于
Array.from(arrayLike).map(x => x * x);



// 将3号位复制到0号位
[1, 2, 3, 4, 5].copyWithin(0, 3, 4)// 从 0 位开始替换，替换内容为数组的第三位到第四位（含头不含尾）
// [4, 2, 3, 4, 5]


### find 找到数组中第一个满足条件的元素，找到后不再继续，在筛选唯一一个数据的时候可以替换 filter

```javascript
/**
 * @param1 回调函数，参数中 arr 表示原数组
 * @param2 obj 绑定 this 对象
 * */
array.find((item, index, arr) => {}, obj)

const abc = [10, 12, 26, 15].find(
    function f(v){ //箭头函数会改变 this 指向
       return v > this.age;
       } , { age: 10 });    // 26


```

flat() 将二维数组拉平，只会拉平一层
```javascript
[1, 2, [3, [4, 5]]].flat() // [1, 2, 3, [4, 5]]  flat(2)即拉平两层

```


### 链判断运算符 `?.`    ES2020
```javascript
const firstName = (obj
  && obj.body
  && obj.body.user
  && obj.body.user.firstName) || 'default';

等同于
const firstName = obj?.body?.user?.firstName || 'default';



a?.b
// 等同于
a == null ? undefined : a.b
a?.[x]
// 等同于
a == null ? undefined : a[x]
a?.b()
// 等同于
a == null ? undefined : a.b()
a?.()
// 等同于
a == null ? undefined : a()
```

### ?? 福音啊
```javascript
// price 字段 undefined 或者 null 或者''的时候用--代替，假如为 0 呢
const realPrice = obj.price || '--'
const shouldNotReload = obj.shouldNotReload || true
```

> ?? 只有运算符左侧的值为null或undefined时，才会返回右侧的值。

```javascript
const animationDuration = response.obj?.price ?? '--'; //如果response.obj存在，取 obj.price 字段，如果返回undefined 或者 null 则赋值 '--' 否则显示默认值包含 0

obj.shouldNotReload ?? true //判null undefined后给默认值 true

```


### Symbol
- enum 的常量。消除魔法字符串（也就是相同的字符串在项目中多次出现）
- 作为对象的隐藏属性使用
> Symbol作为对象的 key 时候 只能被Object.getOwnPropertySymbols()和Reflect.ownKeys()获取到，其他所有遍历都会跳过 Symbol为 key 的数据


Symbol.for("cat")  保存在全局环境中，先检查key 是否存在，存在返回。可以保证只要参数相同每次返回的都是一样
Symbol("cat")   每次调用返回值都不一样


const sym = Symbol('foo');// sym.description // "foo"
const sym = Symbol.for('foo');// Symbol.keyFor(sym) // "foo"

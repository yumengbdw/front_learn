1. 为什么用 ts，在 ts 中，any 和 unknown 分别是什么意思？泛型怎么使用？

any： 可以赋值给任意类型 ，没有类型检查。可以进行任何操作，而不会引发类型错

unknown： 表示任何类型的值，但与 any 不同的是，对 unknown 类型的变量进行操作时，必须先进行类型检查或类型断言。

```js
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity < string > "myString";
let output2 = identity < number > 100;
```

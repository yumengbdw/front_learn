# 什么是 Ts

> Typed JavaScript at Any Scale. 具有类型的 JavaScript，适用于任何大小的项目。
> 我们可以理解为 ts 是用来 hook js 的，就是在 js 编译时判断类型，编译后和原本 js 代码完全相同

// hellow.ts

```typescript
function test(name: string) {
  return "Hello, " + name;
}

console.log(sayHello("Tom"));
```

tsc hello.ts 后实际代码和原本 js 完全相同

```typescript
function test(name) {
  return "Hello, " + name;
}

console.log(sayHello("Tom"));
```

假如非 string 类型参数
`sayHello(123)`时候 上面代码直接报错， 下面代码则运行正常。

ts 和 js 同属于弱类型语言(即会自动帮我们转化类型后计算，而不是开发者显示的写出转换代码)
所以 ts 会编译时校验类型,规避错误，js 则不会，如遇到报错则会在运行时抛出， 其他非错误的异常显示情况则需要开发者自行检查判断。

优点

1. 节省了很多判断异常的类型校验代码。
2. 将错误信息从运行时提前到编译时抛出。

相同代码.ts 会在编译时抛错，.js 则是运行过后才抛错。所以 ts 将错误提前暴露

```typescript
let a = 1;
a.split(" ");
```

为了规范，便于阅读通常 TypeScript 编写的文件以 .ts 为后缀， React 项目 pages 页面，则以 .tsx 为后缀。

## 类型定义

### 基本类型

变量名称: 变量类型
内置 8 种类型

`string number boolean undefined null object bigint symbol`

```typescript
let str: string = "jimmy";
```

注意 null 和 undefined 是所有类型的子类型

### 数组

`type[]` 来表示数组
类型 type 用来定义 Shape(里面元素的类型)的， `[]` 也就是数组

```typescript
let numberArray: number[] = [1, 2, 3, 4, 5];
numberArray.push("8"); // 报错，必须传push进去number的元素
```

ts 同时也支持和 java 保持一致的泛型,这种更加通俗易懂

```typescript
let numberArray: Array<number> = [1, 1, 2, 3, 5];
```

问题： 假如我想不同 index 不同类型的数组如何定义。

### 元祖

元祖可以定义数组中不同位置的类型。缺点是必须限定数组个数

```typescript
// 相当于 let employee = [1, "Semlinker"]
let employee: [number, string] = [1, "Semlinker"];
// 结构也必须参数个数一致
let [id, username] = employee;
// let [id, username, age] = employee; // error

// 问号`?`表示参数可选
type Point = [number, number?, number?];
//以下三种方式定义Point类型变量都合法
// const x: Point = [10];
// const x: Point = [10,10];
const x: Point = [10, 10, 10];

// readonly 类型的同样后面不可改变数组的值了
const point: readonly [number, number] = [10, 20];
```

let x: [string, number];

### 对象类型，接口

java 里面接口定义可以完全忽略，这里我们理解成为 interface 就是限定对象 Shape 形状(里面元素类型)的

```typescript
interface Person {
  readonly id: number;
  name: string; // 确定(类型)属性，name
  age: number;
  id?: number; // 可选属性
  [propName: string]: any; // 任意属性
}

let tom: Person = {
  id: 123,
  name: "Tom",
  age: 25,
};

tom.id = 9527; // 会报错，因为定义的是只读属性
```

接口 interface 中定义的确定属性。 ----interface 的定义
在定义接口属性的变量的时候 ---- let tom:Interface = {}

1. **所有的确定属性都必须赋值**
2. **可选属性可以赋值也可以不赋值**
3. **如果有任意属性，则其他所有属性的类型都必须是任意属性中包含的**

## 函数

```typescript
// 函数声明
function funcName1(x, y) {}
// 函数表达式
let funcName2 = function (x, y) {};
```

分别定义如下

```typescript
function funcName1(x: number, y: number): number {
  return x + y;
}

// rest为剩余参数数组，剩余参数的类型可以为任意类型
let funcName2: (x: number, y: number, ...rest: any[]) => number = function (
  x: number,
  y: number
): number {
  return x + y;
};
```

如下定义，

1. 可以给确定类型的参数赋值默认值。
2. parameter?:type 定义可选参数 parameter，类型为 type，可选参数必须在末尾定义(确定类型参数后面定义)。

```typescript
function funcName1(x: number, y: number = 1, z?: string): number {
  return x + y;
}
```

### 重载

同样是 java 的概念，即相同名称，不同参数类型，不同参数数量，就视为不同函数

例子： 数字和字符串翻转我们可以这样定义、
123 变 321
hellow 变 wolleh

```typescript
function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string | void {
  if (typeof x === "number") {
    return Number(x.toString().split("").reverse().join(""));
  } else if (typeof x === "string") {
    return x.split("").reverse().join("");
  }
}
```

## 类型推论

在没有指定类型的时候 ts 会根据赋值情况推测出一个类型来。 触发类型推论的条件：声明的时候同时赋值了。

```typescript
let name = "jack"; // 类型推论会认为name为string类型
name = 1001; // 所以会报错
```

## any 类型

可以为任意类型，即不校验类型

1. 明确指定 any 类型
2. 生命的时候不赋值 以上两点满足则为 any 类型

```typescript
// 1.指定类型
let name: any = "jack";
name = 10001;

或者;
// 2.声明不赋值
let name2;
name2 = "jack";
name2 = 10001;
```

## 联合类型

即可以为多个类型中的任意一个类型 联合类型使用`|`分隔每个类型。

```typescript
let name: string | number;
```

作为变量传递的时候，需手动判断是否可以用该类型 api 赋值的时候，会根据类型指定，自动判断类型

赋值的时候类型确定的可以类型指定

```typescript
let name: string | number;
name = "jack";
console.log(name.length);

name = 7;
console.log(name.length); // TS2339: Property 'length' does not exist on type 'number'.
```

作为变量的时候，不确定，需要自己判断

```typescript
function getFullName(name: string | number) {
  // 如果那么传进来的是number就会报错
  // TS2339: Property 'length' does not exist on type 'number'.
  return name.length > 0 ? name : "";
}
```

never
void
unknown

包装类型
首字母大写也就是 class
java 里面包装类型相当于是模板，
原始类型就相当于是模板造出来的东西。

原始类型可以赋值给模板实例，反过来不行。

```typescript
let num: number;
let Num: Number;
Num = num; // ok
num = Num; // ts(2322)报错
```

其实很容易理解

```typescript
let num = new Number();
num = 12;
```

Object 包装类型，是所有数据类型的基类

**Object** 与 object

void

never

> 值永远不会存在 任何类型都不能赋值，只有 never 类型可以赋值给 never 类型

```typescript
function err(msg: string): never {
  throw new Error(msg);
}
```

当然上面例子中 void 也是满足的

实际上 never 类型应用可以让我们写出非常安装代码

实际开发中经常定义 type 然后根据 type 实现逻辑

```typescript
type TabType = "100" | "200";

function tabClicked(type: TabType) {
  if (type === "100") {
  } else if (type === "100") {
  } else {
    const check: never = type;
  }
}
```

下次新增 type 的时候 没有写对应的逻辑代码或者写漏了地方会直接报错

```typescript
type TabType = "100" | "200" | "300";
```

ts 3.0 引进了 unknown 类型
unknown 任何类型的值都可以赋值给它，但它只能赋值给 unknown 和 any
any 赋值和取值都可以当做任意类型

unknown 类型要使用对应包装类型实现的方法，必须使用 typeof 或者 as 后才能用

```typescript
let x: unknown = "aBdc";
// 直接使用
const upName = x.toLowerCase(); // Error
// typeof
if (typeof x === "string") {
  const upName = x.toLowerCase(); // OK
}
// 类型断言
const upName2 = (x as string).toLowerCase(); // OK
```

类型断言，as 确定为某个类型，as 笃定

!非空断言

```typescript
let name: null | undefined | string;
name!.toString(); // ok
name.toString(); // ts(2531)
```

name 类型不确定 ！可以排除不含 toString 方法的其他类型

有时候 ts 无法判断是否已经赋值了，这时候我们可以用确定赋值断言

```typescript
let name!: string;
```

##字面量类型。

ts 中有三种字面量类型，字符串 布尔值和数字。
也就是值可以被定义为一种类型，既是类型又是值。

```typescript
interface Config {
  size: "small" | "big"; // 值small既是类型又是值
  isEnable: true | false;
  margin: 0 | 2 | 4;
}
```

## 交叉类型

`&` 就是并集

> 基础类型合并没有任何意义，一般用在两个接口类型合并。合并过程相当于继承。但是如果同名属性 property 在不同接口是不同类型，则该同名属性 property 合并有为 never 类型

```typescript
type IntersectionType = { id: number; name: string } & { age: number };
```

上述代码相当于

```typescript
type IntersectionType = { id: number; name: string; age: number };
```

注意坑

```typescript
 type IntersectionType = { id: number; name: string; } & { name: number };
最终name将是never类型

type IntersectionType = { id: 2; name: string; } & { id: number };
最终id将是 2 类型 只能赋值2不能其他值
```

## interface 绕考类型检查方式

### 鸭式辨型法

```typescript
interface TestType {
  label: string;
}
function printLabel(test: TestType) {
  console.log(test.label);
}
let myObj = { size: 10, label: "testtest" };
printLabel(myObj); // OK
```

### as

```typescript
let myObj: TestType = { size: 10, label: "testtest" } as TestType;
```

接口多次定义，会被自动合并为所有接口

```typescript
interface Point {
  x: number;
}
interface Point {
  y: number;
}
const point: Point = { x: 1, y: 2 };
```

---

---

> 1.基础类型合并没有任何意义，一般用在两个接口类型合并。合并过程相当于继承。但是如果同名属性 property 在不同接口是不同类型，则该同名属性 property 合并有为 never 类型

> 2.任意属性一旦定义后其他所有属性都必须是任意属性类型值的子级，本例中 name 和 age 都将变成 string
> interface Person {
> name: string;
> age?: number;
> [propName: string]: string; //
> }

3.当以变量形式作为参数调方法时候会绕过方法参数的类型检查，和 as 效果一样。
原因是给变量赋值的时候，赋值语句会自动根据类型推定，判断出参数类型。而方法参数校验，校验需要的类型满足条件。
故而其他类型绕开了检查。
所以注意：仅仅绕开多余类型检查。

```typescript
interface TestType {
  label: string;
}
function printLabel(test: TestType) {
  console.log(test.label);
}
let myObj = { size: 10, label: "testtest" };
printLabel(myObj); // OK
```

或者

```typescript
let myObj: TestType = { size: 10, label: "testtest" } as TestType;
```

4.定义多个同名接口的会自动合并其中所有值

```typescript
interface Point {
  x: number;
}
interface Point {
  y: number;
}
```

等价于

```typescript
interface Point {
  x: number;
  y: number;
}
```

5 泛型限定传参必须包含某个或某些属性

```typescript
interface Person {
  idCard: number;
}
// 限定传参必须包含idCard参数
function personInfo<T extends Person>(params: T): T {
  console.log(params.idCard);
  return args;
}
```

通过 keyof 获取 T 中的所有 key，第一个参数传 T，第二个参数传 T 中的 key 组成的 array，返回 T[K]即 value

```typescript
function getValues<T, K extends keyof T>(person: T, keys: K[]): T[K][] {
  return keys.map((key) => person[key]);
}
```

6.将 interface 中所有属性变成可选的

```typescript
interface TestInterface {
  name: string;
  age: number;
}
type NewTestInterface<T> = {
  [p in keyof T]+?: T[p];
};
// 加上只读
// type NewTestInterface<T> = {
//     +readonly [p in keyof T]+?:T[p]
// }
```

关键字 Partial<T>直接将所有属性变成可选

注意只会处理第一层属性，第二层会忽略

```typescript
// 与上面例子等价
type NewTestInterface = Partial<TestInterface>;
```

反过来将可选变成必选 Required -？

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

Readonly<T>所有属性变成只读

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

```typescript
const testInterface: Readonly<TestInterface> = {
  name: "Delete inactive users",
  age: 20,
};

todo.name = "Hello"; // Error: cannot reassign a readonly property
```

#### Omit

Omit<T, K extends keyof any> 的作用是使用 T 类型中除了 K 类型的所有属性，来构造一个新的类型。

```typescript
interface TestInterface {
  name: string;
  age: number;
}

type NameTestInterface = Omit<TestInterface, "age">; // 删掉了age属性，=== {name:string}
```

除去所有 null 和 undefined 的属性
type T0 = NonNullable<TestInterface>

#### Pick

Pick 挑出指定属性作为一个新的类型 和 Omit 刚好相反

```typescript
interface TestInterface {
  name: string;
  age: number;
  weight: number;
  scores: number;
}

type NameTestInterface = Pick<TestInterface, "name" | "age">;
```

#### ReturnType

ReturnType 用来得到函数的返回值类型

```typescript
type Func = (value: number) => string;
const foo: ReturnType<Func> = "1"; // 将foo定义为函数Func的返回值类型string
```

#### Exclude<T, U>

Exclude<T, U> 的作用是将某个类型中属于另一个的类型移除掉。
Exclude<T, U>，如果 T 中的属性在 U 不存在那么就会返回。
与 Extract 刚好相反，取交集，属于 T，U 中公共的部分

```typescript
interface TestInterface {
  name: string;
  age: number;
  weight: number;
  scores: number;
}

interface TestInterface2 {
  name: string;
  age: number;
  weight: number;
}

type T0 = Exclude<TestInterface, TestInterface2>; // 最终得到scores
```

#开发技巧

## 1. 对于可选参数用`！`来规避 undefined，null 的情况

```typescript
interface ButtonProps {
  title: string;
  type?: "primary" | "danger";
  onLabelClick?: (name: string) => void;
}

const Button = (props: ButtonProps) => {
  //实际开发中都是结构出来取值的，解构过程中实际已经给了默认值
  props!.type;
  // 同样也可以
  const { onLabelClick } = props;
  // 这种情况还是比较常用。相当于我们的onLabelClick && onLabelClick()
  onLabelClick!();
};
```

和 es6 的`?.`很像，主要区别是一个在编译时校验，
一个是在运行时校验

## 2.尽量使用 typeof 来定义类型，减少不必要的导出

```typescript
import React from "react"
import Child from "./child"
type ParentProps = React.ComponentProps<typeof Child> & {
    age: number
}
const Parent = FC(props: ParentProps) => {
    return (
        <div>
            <Child/>
         </div>
    )
}


//child.tsx
type ChildProps = {
    name: string
}
const Child = FC(props: ChildProps) => {
    return (
        <div>
            <Child/>
        </div>
    )
}
```

如下所示，`props: React.ComponentProps<"button">`获取 button 组件的所有 props
所以 click 方法也可以巧妙的现货区所有 props 然后取 onClick 就得到类型定义`onClickButton：React.ComponentProps<"button">["onClick"]
``

3.FC 即 functionComponent
`FC(props: PropsInterface)` 实际相当于

```typescript
PropsInterface & {
    children: React.ReactNode
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
}
```

```typescript
// function get(url: string, opts: Options): Promise<Response> { /* ... */ }
type HTTPFunction = (url: string, opts: Options) => Promise<Response>;
const get: HTTPFunction = (url, opts) => {
  /* ... */
};
```

很巧妙的限制了当 T 为 string 的时候值为 1，否则为 2

```typescript
type B<T> = T extends string ? "1" : "2";
```

命名空间的主要作用是不需要引入，直接使用

```typescript
declare namespace MarketApi {
  interface Product {
    productName: string;
    productID: string;
    date: date;
    id: number;
  }
}

const data: MarketApi.Product = result.data;
```

```typescript
declare type dispatch = { action: `market/${string}`; payload: any };
```

enum Status {
START = 0,
PENDING,
END
}

Record<K, V>，能够快速的为 object 创建统一的 key 和 value 类型。

```typescript
const marketType: Record<string, string> = {
  name: "222",
  age: 2, // 必须为string
};
```

问题

参数 valueID 数组对象中的 value 对应的 key
nameID 数组对象中 name 对应的 key array

例如： array = [{label: 'text label', value: 'hello'}]
时 valueID='value' nameID = 'label'

例如： array = [{name: 'text label', nameValue: 'hello'}]
时 valueID='nameValue' nameID = 'name'

get the first object
array[0][valueID]
array[0][nameID]

## 与 vue 对比

相同点

- 虚拟 dom
- 基于组件的开发模式
- 专注于视图
  不同点
- vue mvvm  
  react 单向数据流
  props 父子流动，state setState
- 运行时和编译时
  vue 编译会预编译 template +jsx v-if v-for 静态标记等
  vue 运行时 diff 算法
  react 侧重于运行时 jsx 编译成为 js
- 数据是否可变
  react 不可变 immutable 只能 this.setState 改变，不能直接 this.state.xx
  vue 是 mutable 响应式的。

- 语法的不同

## hooks 组件的生命周期

```react
React.useEffect(()=>{
    /* 请求数据 ， 事件监听 ， 操纵dom */
},[])
dep为空数组就相当于componentDidMount

React.useEffect(()=>{
    console.log('props变化：componentWillReceiveProps')
},[ props ])

React.useEffect(()=>{
    console.log('组件更新完成：componentDidUpdate ')
}) /* 没有 dep 依赖项 */

```

useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前

useEffect 执行是在浏览器绘制视图之后，
接下来又改 DOM ，就可能会导致浏览器再次回流和重绘。而且由于两次绘制，视图上可能会造成闪现突兀的效果。

**修改 DOM ，改变布局就用 useLayoutEffect ，其他情况就用 useEffect 。**

react 18 useInsertionEffect 的执行时机要比 useLayoutEffect 提前，useLayoutEffect 执行的时候 DOM 已经更新了，但是在 useInsertionEffect 的执行的时候，DOM 还没有更新。主要是解决 CSS-in-JS 在渲染中注入样式的性能问题。

```js
function FunctionLifecycle(props) {
  const [num, setNum] = useState(0);
  React.useEffect(() => {
    /* 请求数据 ， 事件监听 ， 操纵dom  ， 增加定时器 ， 延时器 */
    console.log("组件挂载完成：componentDidMount");
    return function componentWillUnmount() {
      /* 解除事件监听器 ，清除 */
      console.log("组件销毁：componentWillUnmount");
    };
  }, []); /* 切记 dep = [] */
  React.useEffect(() => {
    console.log("props变化：componentWillReceiveProps");
  }, [props]);
  React.useEffect(() => {
    /*  */
    console.log(" 组件更新完成：componentDidUpdate ");
  });
  return (
    <div>
      <div> props : {props.number} </div>
      <div> states : {num} </div>
      <button onClick={() => setNum((state) => state + 1)}>改变state</button>
    </div>
  );
}

export default () => {
  const [number, setNumber] = React.useState(0);
  const [isRender, setRender] = React.useState(true);
  return (
    <div>
      {isRender && <FunctionLifecycle number={number} />}
      <button onClick={() => setNumber((state) => state + 1)}>
        {" "}
        改变props{" "}
      </button> <br />
      <button onClick={() => setRender(false)}>卸载组件</button>
    </div>
  );
};
```

从 React15 升级为 React16 后，源码改动如此之大，说 React 被重构可能更贴切些。
正是由于变动如此之大，使得一些特性在新旧版本 React 中表现不一致

为了让开发者能平稳从旧版本迁移到新版本，React 推出了三个模式：

- legacy 模式 -- 通过 ReactDOM.render 创建的应用会开启该模式。这是当前 React 使用的方式。这个模式可能不支持一些新功能。
- blocking 模式 -- 通过 ReactDOM.createBlockingRoot 创建的应用会开启该模式。开启部分 concurrent 模式特性，作为迁移到 concurrent 模式的第一步。
- concurrent 模式 -- 通过 ReactDOM.createRoot 创建的应用会开启该模式。面向未来的开发模式。

## ref

- ref 对象

通过 `React.userRef` 或者 `React.createRef()`创建的{current:null }的对象 其中 `current` 指向 ref 对象获取到的实际内容，可以是 dom 元素，组件实例，或者其它。

### 三种使用方法

```js react
import React, { Component, createRef } from "react";

class myComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(this.refs.divDom);
    console.log(this.divDom);
  }

  divDom = createRef(null);

  render() {
    return <div ref={this.divDom}></div>;
  }
}
```

```js

 render() {
    return <div ref={(node)=>{
               this.node = node
               console.log('此时的参数是什么：', this.node )
            }} ></div>;
  }


```

```js
export default function myComponent() {
  const divDom = React.useRef(null);
  return <div ref={divDom}></div>;
}
```

源码部分，两个都是类似如下创建对象，区别保存位置

```js
// react/src/ReactCreateRef.js
export function createRef() {
  const refObject = {
    current: null,
  };
  return refObject;
}
```

### 问题： 为什么在函数组件中不能使用 createRef

因为类组件有一个实例 instance 能够维护 ref，函数组件每次更新，重新运行，所有变量都会重新声明，为了解决这个问题，所以 useRef 会保存在函数组件的 fiber 种

### ref 的高阶用法

#### forwardRef

- 解决 ref 不能跨层级捕获和传递的问题

```js
// 孙组件
function Son(props) {
  const { grandRef } = props;
  return (
    <div>
      <div> i am alien </div>
      <span ref={grandRef}>这个是想要获取元素</span>
    </div>
  );
}
// 父组件
class Father extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}
const NewFather = React.forwardRef((props, ref) => (
  <Father grandRef={ref} {...props} />
));

class GrandFather extends React.Component {
  render() {
    return (
      <div>
        <NewFather ref={(node) => (this.node = node)} />
      </div>
    );
  }
}
```

- 合并转发 ref 使得 父组件有子组件想要的 ref 对象

```js

// 表单组件
class Form extends React.Component{
    render(){
       return <div>{...}</div>
    }
}
// index 组件
class Index extends React.Component{
    componentDidMount(){
        const { forwardRef } = this.props
        forwardRef.current={
            form:this.form,      // 给form组件实例 ，绑定给 ref form属性
            index:this,          // 给index组件实例 ，绑定给 ref index属性
            button:this.button,  // 给button dom 元素，绑定给 ref button属性
        }
    }
    form = null
    button = null
    render(){
        return <div   >
          <button ref={(button)=> this.button = button }  >点击</button>
          <Form  ref={(form) => this.form = form }  />
      </div>
    }
}
const ForwardRefIndex = React.forwardRef(( props,ref )=><Index  {...props} forwardRef={ref}  />)
// home 组件
export default function Home(){
    const ref = useRef(null)
     useEffect(()=>{
         console.log(ref.current) // {button: button, form: Form{...}, index: Index{...} }
     },[])
    return <ForwardRefIndex ref={ref} />
}


```

1 通过 useRef 创建一个 ref 对象，通过 forwardRef 将当前 ref 对象传递给子组件。
2 向 父 组件传递的 ref 对象上，绑定 form 孙组件实例，index 子组件实例，和 button DOM 元素。

- 高阶组件转发

```js
function HOC(Component) {
  class Wrap extends React.Component {
    render() {
      const { forwardedRef, ...otherprops } = this.props;
      return <Component ref={forwardedRef} {...otherprops} />;
    }
  }
  return React.forwardRef((props, ref) => (
    <Wrap forwardedRef={ref} {...props} />
  ));
}
class Index extends React.Component {
  render() {
    return <div>hello,world</div>;
  }
}
const HocIndex = HOC(Index);
export default () => {
  const node = useRef(null);
  useEffect(() => {
    console.log(node.current); /* Index 组件实例  */
  }, []);
  return (
    <div>
      <HocIndex ref={node} />
    </div>
  );
};
```

经过 forwardRef 处理后的 HOC ，就可以正常访问到 Index 组件实例了。

#### 通过 ref 实现组件通信

- 类组件

```js
export default function father{
    const toSon =()=> sonInstance.current.fatherSay(fatherMes) /_ 调用子组件实例方法，改变子组件 state _/
    return   <Son ref={sonInstance} toFather={setSonMes} />

}

```

- 函数组件

useImperativeHandle 接受三个参数：

第一个参数 ref : 接受 forWardRef 传递过来的 ref 。
第二个参数 createHandle ：处理函数，返回值作为暴露给父组件的 ref 对象。
第三个参数 deps :依赖项 deps，依赖项更改形成新的 ref 对象。

```js
// 子组件
function Son(props, ref) {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  useImperativeHandle(
    ref,
    () => {
      const handleRefs = {
        onFocus() {
          /* 声明方法用于聚焦input框 */
          inputRef.current.focus();
        },
        onChangeValue(value) {
          /* 声明方法用于改变input的值 */
          setInputValue(value);
        },
      };
      return handleRefs;
    },
    []
  );
  return (
    <div>
      <input placeholder="请输入内容" ref={inputRef} value={inputValue} />
    </div>
  );
}

const ForwardSon = forwardRef(Son);
// 父组件
class Index extends React.Component {
  cur = null;
  handleClick() {
    const { onFocus, onChangeValue } = this.cur;
    onFocus(); // 让子组件的输入框获取焦点
    onChangeValue("let us learn React!"); // 让子组件input
  }
  render() {
    return (
      <div style={{ marginTop: "50px" }}>
        <ForwardSon ref={(cur) => (this.cur = cur)} />
        <button onClick={this.handleClick.bind(this)}>操控子组件</button>
      </div>
    );
  }
}
```

父组件用 ref 标记子组件，
forwardRef 来转发 ref，
useImperativeHandle 接收父组件 ref， 返回新的 ref 传递给父组件，
父组件通过标记的 ref 能够获取返回的方法

#### 函数组件用 useRef 缓存数据

### ref 原理

```js

 render() {
    return <div ref={(node)=>{
               this.node = node
               console.log('此时的参数是什么：', this.node )
            }} >ref元素节点</div>;
  }

// 此时的参数是什么：null
// 此时的参数是什么：<div>ref 元素节点</div>

```

为什么会打印两次日志

ref 就是用来获取真实的 DOM 以及组件实例的，commit 阶段操作 dom，所以需要 commit 阶段处理。
React 底层用两个方法处理：DOM 更新之前的 commitDetachRef 和 DOM 更新之后的 commitAttachRef ，

commit 的 mutation 阶段,commitDetachRef 会清空之前 ref 值，使其重置为 null。如果是函数会调用方法，传 null 参数

可以看到两个方法的调用时机都是含有 Ref tag 的时候

```js
function commitMutationEffects() {
  if (effectTag & Ref) {
    const current = nextEffect.alternate;
    if (current !== null) {
      commitDetachRef(current);
    }
  }
}

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null) {
    if (typeof currentRef === "function") {
      /* function 和 字符串获取方式。 */
      currentRef(null);
    } else {
      /* Ref对象获取方式 */
      currentRef.current = null;
    }
  }
}
```

```js
function commitLayoutEffects() {
  if (effectTag & Ref) {
    commitAttachRef(nextEffect);
  }
}

function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent: //元素节点 获取元素
        instanceToUse = getPublicInstance(instance);
        break;
      default: // 类组件直接使用实例
        instanceToUse = instance;
    }
    if (typeof ref === "function") {
      ref(instanceToUse); //* function 和 字符串获取方式。 */
    } else {
      ref.current = instanceToUse; /* ref对象方式 */
    }
  }
}
```

注意 ref="node"的时候也会当做函数处理
以为如果 ref 是字符串的话会绑定一个处理函数 在 commitAttachRef 阶段会调用 ref(<div>)

```js
const ref = function (value) {
  let refs = inst.refs;
  if (refs === emptyRefsObject) {
    refs = inst.refs = {};
  }
  if (value === null) {
    delete refs[stringRef];
  } else {
    refs[stringRef] = value;
  }
};
```

什么时候打的 Ref tag 呢

1. 类组件 fiber 构建过程，无论更新还是初始化都会，beginWork --- ClassComponent --最后会走-> finishClassComponent ---> markRef(current, workInProgress);
2. 归的阶段 completeUnitOfWork --->completeWork(创建真是 dom 添加到 stateNode 中) ---> HostComponent

HostComponent 即 <div /> 等元素

更新阶段

````js
if (current.ref !== workInProgress.ref) {
markRef(workInProgress);
}```

current 为空的

```js
if (workInProgress.ref !== null) {
// If there is a ref on a host node we need to schedule a callback
markRef(workInProgress);
}
````

```js
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) || // 初始化的时候
    (current !== null && current.ref !== ref) // ref 指向发生改变
  ) {
    workInProgress.effectTag |= Ref;
  }
}
```

点击按钮的时候会什么也打印了

render() {
return <div ref={(node)=>{
this.node = node
console.log('此时的参数是什么：', this.node )
}} >ref 元素节点</div>;
}

上面写法还有问题，每次更新都给 ref 赋值了新的函数

改为
getDom= (node)=>{
this.node = node
console.log('此时的参数是什么：', this.node )
}

<div ref={this.getDom}>ref元素节点</div>

####卸载 ref

{isShow && <div ref={this.getDom}>ref 元素节点</div>}

当 isShow 为 false 的时候需要卸载，虽然 fiber 删了但是 ref 的值还有，所有需要卸载

```js
function safelyDetachRef(current) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === "function") {
      // 函数式 ｜ 字符串
      ref(null);
    } else {
      ref.current = null; // ref 对象
    }
  }
}
```

## context

### 如何使用

```js

const ThemeContext = React.createContext(null)



export default function providerDemo{

  const { contextValue, setContextValue } = useState({color: '#ccc', bgColor:''#ffffff})


  return <ThemeContext.provider value = {contextValue}>
      <Son/>
  </ThemeContext.provider>
}




```

- contextType 消费

```js
class ConsumerDemo extends React.Component {
  render() {
    const { color, bgColor } = this.context;
    render(){
      <div></div>
    }
  }
}

ConsumerDemo.contextType = ThemeContext;
```

- 函数组件 useContext 消费

```js
  export default function ConsumerDemo{
    const { color, bgColor } = useContext(ThemeContext);
    return<div></div>
  }


```

- 订阅者 consumer 方式

```js
class ConsumerDemo extends React.Component {
  render() {
    const { color, bgColor } = this.context;
    render(){
      <ThemeContext.Consumer></ThemeContext.Consumer>
    }
  }
}

ConsumerDemo.contextType = ThemeContext;
```

Provider 的 value 改变，会使所有消费 value 的组件重新渲染

与其他两种方式(整个调用链的组件都会重新渲染)不同的是 Consumer 方式，当 context 内容改变的时候，不会让引用 Consumer 的父组件重新更新。

解决其他两种方式导致其不消费的组件渲染方法

1. memo 和 pureComponent 浅比较
   const Son = React.memo(()=> <ConsumerDemo />)

2. 把 React element 缓存下来， 下一次调和更新时候，就会跳过该 React element 对应 fiber 的更新。

<ThemeProvider value={ contextValue } >
{ React.useMemo(()=> <Son /> ,[]) }
</ThemeProvider>

## 模块化 css

react 中没有 scoped 概念，导致样式各种覆盖。同时命名不统一等问题

解决上述问题

1. css Modules

```js
{
     test: /\.css$/,/* 对于 css 文件的处理 */
     use:[
        {
            loader: 'css-loader',
            options:{
              modules: {
                localIdentName: "[path][name]__[local]--[hash:base64:5]", /* 命名规则  [path][name]__[local] 开发环境 - 便于调试   */
              },
            }
        },
     ],
}


```

```css
.base {
  /* 基础样式 */
  color: blue;
}
.text {
  composes: base;
  background-color: blue;
}
:global(.text_bg) {
  background-color: pink;
}
```

:global()包裹的样式不做名称混淆处理

composes 来继承其他样式组成新的样式对象。

```js
import style from "./style.css";
export default () => (
  <div>
    <div className={style.text}>验证 css modules </div>
  </div>
);
```

配合 classNames 库 实现更灵活的动态添加类名

         className={ classNames(Style.base, theme === 'light' ? Style.light : Style.dark ) }

2. css in js

```js
const baseStyle = { /* 基础样式 */ }

/* 容器的背景颜色 */
const boxStyle = {
  backgroundColor: "blue",
};
/* 字体颜色 */
const textStyle = {
  ...baseStyle,
  color: "orange",
};

export default {
  boxStyle,
  textStyle,
};



import React from 'react'
import Style from './style'

export default function Index(){
    return <div  style={ Style.boxStyle }  >
        <span style={ Style.textStyle }  >hi , i am CSS IN JS!</span>
    </div>
}

```

CSS IN JS 也可以由一些第三方库支持，比如我即将介绍的 style-components 可以把写好的 css 样式注入到组件中,可以接收传参

```js
const Button = styled.button`
  background: ${(props) => (props.theme ? props.theme : "#6a8bad")};
  color: #fff;
  min-width: 96px;
  height: 36px;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 20px !important;
`;

// 继承样式
const NewButton = styled(Button)`
  background: orange;
  color: pink;
`;

export default function Index() {
  return (
    <div>
      <Button theme={"#fc4838"}>props主题按钮</Button>
    </div>
  );
}
```

## 高阶组件

### 增加属性

```js
function HOC(WrapComponent) {
  return class Advance extends React.Component {
    state = {
      name: "alien",
    };
    render() {
      return <WrapComponent {...this.props} {...this.state} />;
    }
  };
}
```

### 反向继承

劫持生命周期，操作原组件的 state

```js
function Hoc(WrappedComponent){
  const state = WrapComponent.prototype.state
  const didMount = WrappedComponent.prototype.componentDidMount
  async componentDidMount(){
      if(didMount){
          await didMount.apply(this)
      }
      this.setState({
          number: 123,
          ...state
      })
  }

  return class extends WrapperComponent{
      render(){
          return super.render()
      }
  }
}

```

### 条件渲染

```js
const HOC = (WrappedComponent) => {
  return class extends WrapperComponent {
    render() {
      if (this.props.isShow) {
        return super.render();
      } else {
        return <div>empty</div>;
      }
    }
  };
};
```

### 修改返回的 react 结构

```js
function HOC(WrappedComponent) {
  return class extends WrapperComponent {
    render() {
      const tree = super.render();
      const newProps = {};
      if (tree?.type === "input") {
        newProps.value = "sth";
      }
      const props = {
        ...tree.props,
        ...newProps,
      };

      return React.cloneElement(tree, props, tree.props.children);
    }
  };
}
```

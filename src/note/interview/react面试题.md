深度优先，有子节点，就遍历子节点，没有子节点，就找兄弟节点，没有兄弟节点，就找叔叔节点，叔叔节点也没有的话，就继续往上找，它爷爷的兄弟，如果一直没找到，就代表所有的更新任务都更新完毕了。

重点是在更新自己的同时需要去 reconcile 子节点，也就是传说中进行 Diff 的地方。

## react 为什么不能进行静态节点标记呀

因为 React 使用的是 JSX，而 JSX 本质上就是 JS 语言，动态的，而 Vue 使用的 template 足够的约束，所以就十分容易进行优化分析；而 JSX 本质上就是 JS 语言，那么你要做静态分析，实质就是在做 JS 的静态分析，所以就非常困难，举个例子，Vue 的 template 里面是没有闭包的，而 JSX 里面就有可能存在闭包

## react 的 diff vue2 的 diff vue3 的 diff 算法

## setState 是同步还是异步的。

关键： batchUpdate 批量更新概念（事件系统），以及批量更新被打破的条件，

legacy 模式
blocking 模式 concurrent 的优雅降级版本和过渡版本
concurrent 模式
setState 完整的流程
setState ----> 计算优先级（老版本用 expirationTime ，新版本用 lane ）----> fiber Root 根部 fiber 向下调和子节点 ---> 合并 state，然后触发 render 函数 ----> commit 阶段替换 dom ----执行 callback 函数

合成事件、生命周期钩子函数都为异步执行

React 的事件系统是合成事件，事件执行之前通过 isBatchingEventUpdates=true 打开开关，开启事件批量更新，当该事件结束，再通过 isBatchingEventUpdates = false; 关闭开关，然后在 scheduleUpdateOnFiber 中根据这个开关来确定是否进行批量更新

事件执行是在 dispatchEvent 中，dispatchEvent 会调 dispatchEventForLegacyPluginEventSystem 方法

```js
/* 在`legacy`模式下，所有的事件都将经过此函数同一处理 */
function dispatchEventForLegacyPluginEventSystem() {
  // handleTopLevel 事件处理函数
  batchedEventUpdates(handleTopLevel, bookKeeping);
}

function batchedEventUpdates(fn, a) {
  /* 开启批量更新  */
  isBatchingEventUpdates = true;
  try {
    /* 这里执行了的事件处理函数， 比如在一次点击事件中触发setState,那么它将在这个函数内执行 */
    return batchedEventUpdatesImpl(fn, a, b);
  } finally {
    /* try 里面 return 不会影响 finally 执行  */
    /* 完成一次事件，批量更新  */
    isBatchingEventUpdates = false;
  }
}
```

当调用 setState 的时候实际上调用的是 scheduleUpdateOnFiber

```js
enqueueSetState(){
     /* 每一次调用`setState`，react 都会创建一个 update 里面保存了 */
     const update = createUpdate(expirationTime, suspenseConfig);
     /* callback 可以理解为 setState 回调函数，第二个参数 */
     callback && (update.callback = callback)
     /* enqueueUpdate 把当前的update 传入当前fiber，待更新队列中 */
     enqueueUpdate(fiber, update);
     /* 开始调度更新 */
     scheduleUpdateOnFiber(fiber, expirationTime);
}

```

### 批量更新规则打破

`unstable_batchedUpdates` 可以手动开启批量更新。

用 `promise` 或者 `setTimeout` 包裹会取消批量更新

react18，将所有事件都进行批处理也就是取消批量的方法无效

### 提升更新优先级

`ReactDOM.flushSync(()=> {})` v18 的新特性。
可以将回调函数中的更新任务，放在一个较高的优先级中
flushSync 在同步条件下，会合并之前的 setState | useState

用 flushSync 可以打破批量更新

```js
onClick=(()=>{
        // 第一次更新
        flushSync(()=>{
          setCount(count=>count+1)
        })
        // 第二次更新
        flushSync(()=>{
          setCount2(count2=>count2+1)
        })
      })>`

```

### 例子 eg

1.

```js
handerClick=()=>{
    setTimeout(()=>{
        this.setState({ number: 1  })
    })
    this.setState({ number: 2  })
    ReactDOM.flushSync(()=>{
        this.setState({ number: 3  })
    })
    this.setState({ number: 4  })
}
render(){
   console.log(this.state.number)
   return ...
}



```

打印结果是 3,4,1
2 和 3 批量更新为 3

1. 那么在 click 事件函数里面和 setTimeout 回调里面执行 setstate 有什么区别

```js
    state = { number:0 }

handleClick(){
  this.setState({ number:this.state.number + 1 })
  this.setState({ number:this.state.number + 1 })
  this.setState({ number:this.state.number + 1 })
}

setTimeout(()=>{
    this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
    console.log(this.state.number)
    this.setState({ number:this.state.number + 1 },()=>{    console.log( 'callback2', this.state.number)  })
    console.log(this.state.number)
    this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback3', this.state.number)  })
    console.log(this.state.number)
})
```

`click` 事件打印结果是 `0,0,0`
`setTimeout` 结果是： `1,2,3`

解释： 都会执行事件函数`isBatchingEventUpdates=true` 区别在于，`setTimeout` 在事件执行完后会执行三个 `setState` 语句，而 click 会同时执行`this.state.number = this.state.number + 1`而 number 的初始值是 0

```js
setTimeout(() => {
  unstable_batchedUpdates(() => {
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
  });
});
```

变为 0，0，0

## 生命周期

注意参数

两个阶段， render commit

四个生命周期状态 mount update unMount Error

### render 阶段

#### 1. beginWork

beginWork 方法根据不同的 tag 走不同的构建 fiber 方法 对于 `classComponent` 会调用 `updateClassComponent`

constructClassInstance

```js
/* workloop React 处理类组件的主要功能方法 */
function updateClassComponent() {
  if (instance === null) {
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime
    );
    shouldUpdate = true; // shouldUpdate 标识用来证明 组件是否需要更新。
  } else {
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime
    );
  }

  if (shouldUpdate) {
    nextChildren = instance.render(); /* 执行render函数 ，得到子节点 */
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime
    );

    /* 继续调和子节点 */
  }
}
```

- 如果是初始化阶段

getDerivedStateFromProps(nextProps, prevState)
废弃 componentWillMount() 触发条件

`mountClassInstance`

```js
function mountClassInstance() {
  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === "function") {
    /* ctor 就是我们写的类组件，获取类组件的静态方法 */
    const partialState = getDerivedStateFromProps(nextProps, prevState);
    instance.state = workInProgress.Object.assign(
      {},
      prevState,
      partialState
    ); /* 将state 赋值给我们实例上，instance.state  就是我们在组件中 this.state获取的state*/
  }

  if (
    typeof ctor.getDerivedStateFromProps !== "function" &&
    typeof instance.getSnapshotBeforeUpdate !== "function" &&
    typeof instance.componentWillMount === "function"
  ) {
    instance.componentWillMount(); /* 当 getDerivedStateFromProps 和 getSnapshotBeforeUpdate 不存在的时候 ，执行 componentWillMount*/
  }
}
```

- 如果是更新阶段

updateClassInstance

废弃 componentWillReceiveProps(newProps, nextContext)
getDerivedStateFromProps( nextProps, prevState)
shouldComponentUpdate(newProps,newState,nextContext)
废弃 componentWillUpdate()

```js
function updateClassInstance() {
  const hasNewLifecycles = typeof ctor.getDerivedStateFromProps === "function"; // 判断是否具有 getDerivedStateFromProps 生命周期
  if (
    !hasNewLifecycles &&
    typeof instance.componentWillReceiveProps === "function"
  ) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      // 浅比较 props 不相等
      instance.componentWillReceiveProps(newProps, nextContext); // 执行生命周期 componentWillReceiveProps
    }
  }
  let newState = (instance.state = oldState);
  if (typeof getDerivedStateFromProps === "function") {
    ctor.getDerivedStateFromProps(
      nextProps,
      prevState
    ); /* 执行生命周期getDerivedStateFromProps  ，逻辑和mounted类似 ，合并state  */
    newState = workInProgress.memoizedState;
  }
  let shouldUpdate = true;
  if (typeof instance.shouldComponentUpdate === "function") {
    /* 执行生命周期 shouldComponentUpdate 返回值决定是否执行render ，调和子节点 */
    shouldUpdate = instance.shouldComponentUpdate(
      newProps,
      newState,
      nextContext
    );
  }
  if (shouldUpdate) {
    if (typeof instance.componentWillUpdate === "function") {
      instance.componentWillUpdate(); /* 执行生命周期 componentWillUpdate  */
    }
  }
  return shouldUpdate;
}
```

最终上面判断走完后会走 `render()`方法

### commit 阶段

#### 第一个阶段 DOM 修改前 commitBeforeMutationEffects

生命周期方法
异步调用 `useEffect`
`getSnapshotBeforeUpdate` 返回值作为 didUpdate 的第三个参数

`commitBeforeMutationEffects = commitBeforeMutationLifeCycles`

```js
function commitBeforeMutationLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case ClassComponent: {
      const snapshot = instance.getSnapshotBeforeUpdate(
        prevProps,
        prevState
      ); /* 执行生命周期 getSnapshotBeforeUpdate   */
      instance.__reactInternalSnapshotBeforeUpdate =
        snapshot; /* 返回值将作为 __reactInternalSnapshotBeforeUpdate 传递给 componentDidUpdate 生命周期  */
    }
  }
}
```

#### commit DOM `修改中` 的第二个阶段

生命周期方法
`componentWillUnmount()`
dom 真是操作过程中其中 删 的操作会调用 `componentWillUnmount` 方法

#### commit DOM 修改后 的第三个阶段

生命周期方法
componentDidMount()
componentDidUpdate(prevProps, prevState, snapshot)

> snapshot: 就是 getSnapshotBeforeUpdate 函数返回值

commit 的第三个阶段 commitLayoutEffects 会调用 commitLayoutEffectOnFiber = commitLifeCycles

```js
function commitLifeCycles(finishedRoot,current,finishedWork){
     switch (finishedWork.tag){                             /* fiber tag 在第一节讲了不同fiber类型 */
        case ClassComponent: {                              /* 如果是 类组件 类型 */
             const instance = finishedWork.stateNode        /* 类实例 */
             if(current === null){                          /* 类组件第一次调和渲染 */
                instance.componentDidMount()
             }else{                                         /* 类组件更新 */
                instance.componentDidUpdate(prevProps,prevState，instance.__reactInternalSnapshotBeforeUpdate);
             }
        }
     }
}

```

### 为什么 constructor 里要调用 super 和传递 props？

JavaScript 的限制在构造函数里如果要调用 this，那么提前就要调用 super
直接调用了 super() ，你仍然可以在 render 和其他方法中访问 this.props
因为 React 会在构造函数被调用之后，会把 props 赋值给刚刚创建的实例对象

## v18 的新特性

合成事件在 id 为 app 的节点上之前版本都在 document 上

1. setState 全部批量更新
2. 新特性取消了 ie 的支持， 新特性全部基于现代浏览器
3. 组件返回支持 null 和 undefined 返回，之前返回 undefined 会报错
4. Suspense 不再需要 fallback 捕获
5. 支持 useId
   在服务器和客户端生成相同的唯一一个 id，避免 hydrating 的不兼容
6. useSyncExternalStore
   用于解决外部数据撕裂问题
7. useInsertionEffect
   这个 hooks 只建议在 css in js 库中使用，这个 hooks 执行时机在 DOM 生成之后，useLayoutEffect 执行之前，它的工作原理大致与 useLayoutEffect 相同，此时无法访问 DOM 节点的引用，一般用于提前注入脚本
8. Concurrent Mode
   同步不可中断更新变成了异步可中断更新
   useDeferredValue 和 startTransition 用来标记一次非紧急更新
9. strict mode 更新
   React 会对每个组件返回两次渲染，以便你观察一些意想不到的结果,在 react17 中去掉了一次渲染的控制台日志，以便让日志容易阅读。react18 取消了这个限制，第二次渲染会以浅灰色出现在控制台日志

## react 设计思想

1. 组件化
   每个组件都符合开放-封闭原则
   封闭原则：组件内部的状态都由自身维护，只处理内部的渲染逻辑
   开放原则： 组件可以通过 props（单项数据流）进行数据交互
2. 数据驱动视图 UI=f(data)
   渲染界面，不应该直接操作 DOM，而是通过修改数据(state 或 prop)，数据驱动视图更新
3. 虚拟 DOM
   虚拟 DOM 是对真实 DOM 的映射，React 通过新旧虚拟 DOM 对比，得到需要更新的部分，实现数据的增量更新

4. 声明式的 写好一个组件，UI 就展示成什么样 jquery 是命令式操作 dom

5. 其他设计模式

- 组合模式: 外层组件包裹内层组件 vue 中 slot 直观反映出 父 -> 子组件的包含关系<Tabs><TabsItem/></TabsItem>

通过 React.cloneElement 隐式传参，通过 React.Children 访问每一个 item 的 props

```js
React.Children.forEach(props.children, (item) => {
  console.log(item.props); //依次打印 props
});

function Groups(props) {
  const newChilren = React.cloneElement(props.children, { author: "alien" });
  return newChilren;
}
```

- hoc 高阶组件模式

提供者模式 Provider

```js
const ThemeContext = React.createContext(null)


<ThemeContext.provider value = {contextValue}>
      <Son/>
  </ThemeContext.provider>



class Son extends React.Component {
  render() {
    const { color, bgColor } = this.context;
    render(){
      <ThemeContext.Consumer></ThemeContext.Consumer>
    }
  }
}

Son.contextType = ThemeContext;
```

## jsx 是什么

react 的语法糖，需要 babel 转换为 js 才能执行。
jsx 其实等价于 React.createElement

- 为何必须引入 `import React from “react”`:
  jsx 本质就是 `React.createElement`
- 为什么 React 自定义组件首字母要大写:
  不大写就会当成字符串标签处理` React.createElement("app",null,"lyllovelemon")`
- 为什么不能返回多个元素
  最终编译为 render 函数的返回值只能一个，虚拟 dom 是树状结构，只能有一个父节点

## 事件机制

根据浏览器事件机制实现的一套自身事件机制。包含事件触发、事件冒泡、事件捕获、事件合成和事件派发

- 事件不用考虑兼容性，且实现了原生事件相同的接口
- react 统一管控事件。不是绑定在真实的 dom 上的。引入了事件池，避免频繁的创建销毁事件。
  在 v17 之前是绑定在 document 上的，在 v17 改成了 app 容器上。这样更利于一个 html 下存在多个应用（微前端）。

三部分组成

### 1. 事件合成系统，初始化会注册不同的事件插件。

```js
const registrationNameModules = {
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    ...
}

const registrationNameDependencies = {
    onClick: ['click'],
    onClickCapture: ['click'],
    onChange: ['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange'],
    ...
}

```

### 2. 事件标签中事件的收集，向 container 注册事件。

button Fiber.memoizedProps:{onClick: `组件中我们写的 click 方法`}

completeWork 阶段会对 fiber 创建对应的真是的 dom，挂载在 fiber.stateNode 节点上面， 在执行
如果是 hostComponent 类型 的 fiber 的时候，都会先走 diffProperties 方法

```js
function diffProperties(){
    /* 判断当前的 propKey 是不是 React合成事件 */
    if(registrationNameModules.hasOwnProperty(propKey)){
         /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
         legacyListenToEvent(registrationName, document）;
    }
}

function legacyListenToEvent(registrationName，mountAt){
   const dependencies = registrationNameDependencies[registrationName];
    for (let i = 0; i < dependencies.length; i++) {
        addTrappedEventListener(event,dependencies[i],PLUGIN_EVENT_SYSTEM,false)
  }
}

function addTrappedEventListener(targetContainer,topLevelType,eventSystemFlags,capture){
   const listener = dispatchEvent.bind(null,topLevelType,eventSystemFlags,targetContainer)
   if(capture){
       // 事件捕获阶段处理函数。
   }else{
       /* TODO: 重要, 这里进行真正的事件绑定。*/
      targetContainer.addEventListener(topLevelType,listener,false) // document.addEventListener('click',listener,false)
   }
}
```

最终绑定的处理函数 listener 就是 dispatchEvent

### 3. 事件触发，到事件执行一系列过程。

事件执行是在 `dispatchEvent` `中，dispatchEvent` 会调 `dispatchEventForLegacyPluginEventSystem`(该方法执行了 `batchedEventUpdates`) 方法

```js
/_ 在`legacy`模式下，所有的事件都将经过此函数同一处理 _/;
function dispatchEventForLegacyPluginEventSystem() {
  // handleTopLevel 事件处理函数
  batchedEventUpdates(handleTopLevel, bookKeeping);
}
```

handleTopLevel 中执行 SimpleEventPlugin 形成事件队列（即冒泡的 push，捕获的 unShift 形成的事件数组）

runEventsInBatch 会判断如果有 event.isPropagationStopped()（即 e.stopPropagation） 那么直接 break 跳出循环 后续的事件不再执行,同时还会 SimpleEventPlugin 中的事件队列遍历后执行

```js
function handleTopLevel() {
  for (let i = 0; i < plugins.length; i++) {
    const possiblePlugin = plugins[i];
    /* 找到对应的事件插件，形成对应的合成event，形成事件执行队列  即执行 SimpleEventPlugin*/
    const extractedEvents = possiblePlugin.extractEvents(
      topLevelType,
      targetInst,
      nativeEvent,
      eventTarget,
      eventSystemFlags
    );
  }
  if (extractedEvents) {
    events = accumulateInto(events, extractedEvents);
  }
  /* 执行事件处理函数 */
  runEventsInBatch(events);
}
```

```js

function runEventsInBatch(){
    const dispatchListeners = event._dispatchListeners;
    const dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) { /* 判断是否已经阻止事件冒泡 */
        break;
      }

      dispatchListeners[i](event)
    }
  }
  /* 执行完函数，置空两字段 */
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}


handerClick(e){
    e.preventDefault()
}
```

```js
export function batchedEventUpdates(fn, a) {
  isBatchingEventUpdates = true; //打开批量更新开关
  fn(a);
  isBatchingEventUpdates = false; //关闭批量更新开关
}
```

EventPlugin 会判断如果是捕获就 unShift 如果是冒泡就 push 用户监听的事件

```js
const SimpleEventPlugin = {
  extractEvents: function (
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget
  ) {
    // ...... 省略
    while (instance !== null) {
      const { stateNode, tag } = instance;
      if (tag === HostComponent && stateNode !== null) {
        /* DOM 元素 */
        const currentTarget = stateNode;
        if (captured !== null) {
          /* 事件捕获 */
          /* 在事件捕获阶段,真正的事件处理函数 */
          const captureListener = getListener(instance, captured); // onClickCapture
          if (captureListener != null) {
            /* 对应发生在事件捕获阶段的处理函数，逻辑是将执行函数unshift添加到队列的最前面 */
            dispatchListeners.unshift(captureListener);
          }
        }
        if (bubbled !== null) {
          /* 事件冒泡 */
          /* 事件冒泡阶段，真正的事件处理函数，逻辑是将执行函数push到执行队列的最后面 */
          const bubbleListener = getListener(instance, bubbled); //
          if (bubbleListener != null) {
            dispatchListeners.push(bubbleListener); // onClick
          }
        }
      }
      instance = instance.return;
    }
  },
};
```

## 错误边界

getDerivedStateFromError 和 componentDidCatch 的区别是前者展示降级 UI，后者记录具体的错误信息

```js
import React from "react";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error(err, info);

    /* 降级UI */
    this.setState({
      hasError: true,
    });
  }
  render() {
    if (this.state.hasError) {
      return <div>Oops,err</div>;
    }
    return this.props.children;
  }
}

// App.jsx
import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ComponentA from "./components/ComponentA";
export class App extends React.Component {
  render() {
    return (
      <ErrorBoundary>
        <ComponentA></ComponentA>
      </ErrorBoundary>
    );
  }
}
```

以下情况无法捕获
事件处理器中的错误
异步代码错误：例如，setTimeout 或 requestAnimationFrame 回调函数中的错误，或者异步请求（如使用 fetch 或 axios 发起的 HTTP 请求）的处理中抛出的错误。
服务端渲染

## redux 原理 react-router 原理 mobx

Redux 工作原理

使用单例模式实现
Store 一个全局状态管理对象
Reducer 一个纯函数，根据旧 state 和 props 更新新 state
Action 改变状态的唯一方式是 dispatch action

### react-redux

一是如何向 React 应用中注入 redux 中的 Store ，
二是如何根据 Store 的改变，把消息派发给应用中需要状态的每一个组件。

#### 应用

```js
/* 注册中间件  */
const rootMiddleware = applyMiddleware(logMiddleware);
/* 注册reducer */
const rootReducer = combineReducers({
  number: numberReducer,
  info: InfoReducer,
});
/* 合成Store */
const Store = createStore(
  rootReducer,
  { number: 1, info: { name: null } },
  rootMiddleware
);

function logMiddleware() {
  /* 第二层在reduce中被执行 */
  return (next) => {
    /* 返回增强后的dispatch */
    return (action) => {
      const { type } = action;
      console.log("发生一次action:", type);
      return next(action);
    };
  };
}

function numberReducer(state = 1, action) {
  switch (action.type) {
    case "ADD":
      return state + 1;
    case "DEL":
      return state - 1;
    default:
      return state;
  }
}

function InfoReducer(state = {}, action) {
  const { payload = {} } = action;
  switch (action.type) {
    case "SET":
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}

// 函数组件的使用
function Index() {
  const [state, changeState] = useState(Store.getState());
  useEffect(() => {
    /* 订阅state */
    const unSubscribe = Store.subscribe(() => {
      changeState(Store.getState());
    });
    /* 解除订阅 */
    return () => unSubscribe();
  }, []);
}

class ComponentB extends React.Component {
  /* B组件 */
  state = { compBsay: "" };
  handleToA = () => {
    this.props.dispatch({
      type: "SET",
      payload: { compBsay: this.state.compBsay },
    });
  };
  render() {
    return (
      <div className="box">
        <p>我是组件B</p>
        <div> A组件对我说：{this.props.compAsay} </div>
        我对A组件说：
        <input
          placeholder="CompBsay"
          onChange={(e) => this.setState({ compBsay: e.target.value })}
        />
        <button onClick={this.handleToA}>确定</button>
      </div>
    );
  }
}
/* 映射state中 CompAsay  */
const CompBMapStateToProps = (state) => ({ compAsay: state.info.compAsay });
export const CompB = connect(CompBMapStateToProps)(ComponentB);
```

#### react-redux 原理

源码 code/myRedux 目录

#### react-redux 中 connect 实现原理

### react-mox

不依赖于 React 本身

1. 初始化：首先就是 mobx 在初始化的时候，是如何处理 observable 可观察属性的。
2. 依赖收集：第二点就是通过 mobx-react 中的 observer ，如何收集依赖项，与 observable 建立起关系的。
3. 派发更新：最后就是当改变可观察属性的值的时

#### 初始化

被 observable 装饰器包装的属性，本质上就是调用 createObservable 方法。

```js
function createObservable(target, name, descriptor) {
  // 对于如上DEMO1，target——Root类，name——属性名称 authorInfo 或者 name ，descriptor——属性描述，枚举性，可读性等
  if (isStringish(name)) {
    /* 装饰器模式下 */
    target[Symbol("mobx-stored-annotations")][name] = {
      /* 向类的mobx-stored-annotations属性的name属性上，绑定 annotationType_ ， extend_ 等方法。 */
      annotationType_: "observable", //这个标签证明是 observable，除了observable，还有 action， computed 等。
      options_: null,
      make_, // 这个方法在类组件 makeObservable 会被激活
      extend_, // 这个方法在类组件 makeObservable 会被激活
    };
  }
}

function make_(adm, key, descriptor) {
  return this.extend_(adm, key, descriptor);
}
function extend_(adm, key, descriptor) {
  return adm.defineObservableProperty_(key, descriptor, options);
}
```

当调用 observable 配置项的 make* ，本质上调用 adm.defineObservableProperty*

必须在类的 `constructor` 中调用`makeObservable(this)` 才能建立响应式

```js
function makeObservable (target){ // target 模块实例——this
    const adm = new ObservableObjectAdministration(target) /* 创建一个管理者——这个管理者是最上层的管理者，管理模块下的observable属性 */
    target[Symbol("mobx administration")] = adm  /* 将管理者 adm 和 class 实例建立起关联 */
    startBatch()
    try{
        let annotations = target[Symbol("mobx-stored-annotations"] /* 上面第一步说到，获取状态 */
        Reflect.ownKeys(annotations)  /* 得到每个状态名称 */
        .forEach(key => adm.make_(key, annotations[key])) /* 对每个属性调用 */
    }finally{
        endBatch()
    }
}

```

遍历所有的属性，每个属性通过 adm 管理者调用`make_`处理即`defineObservableProperty_`

```js

class ObservableObjectAdministration{
    constructor(target_,values_){
        this.target_ = target_
        this.values_ = new Map() //存放每一个属性的ObserverValue。
    }
    /* 调用 ObserverValue的 get —— 收集依赖  */
    getObservablePropValue_(key){
        return this.values_.get(key)!.get()
    }
    /* 调用 ObserverValue的 setNewValue_   */
    setObservablePropValue_(key,newValue){
        const observable = this.values_.get(key)
        observable.setNewValue_(newValue) /* 设置新值 */
    }
    make_(key,annotation){ // annotation 为每个observable对应的配置项的内容，{ make_,extends }
        const outcome = annotation.make_(this, key, descriptor, source)
    }
    /* 这个函数很重要，用于劫持对象上的get,set */
    defineObservableProperty_(key,value){
        try{
            startBatch()
            const descriptor = {
                get(){      // 当我们引用对象下的属性，实际上触发的是 getObservablePropValue_
                   this.getObservablePropValue_(key)
                },
                set(value){ // 当我们改变对象下的属性，实际上触发的是 setObservablePropValue_
                   this.setObservablePropValue_(key,value)
                }
            }
            Object.defineProperty(this.target_, key , descriptor)
            const observable = new ObservableValue(value) // 创建一个 ObservableValue
            this.values_.set(key, observable)             // 设置observable到value中
        }finally{
            endBatch()
        }
    }
}

```

ObservableValue 继承了 Atom。

```js
class ObservableValue extends Atom {
  get() {
    //adm.getObservablePropValue_ 被调用
    this.reportObserved(); // 调用Atom中 reportObserved
    return this.dehanceValue(this.value_);
  }
  setNewValue_(newValue) {
    // adm.setObservablePropValue_
    const oldValue = this.value_;
    this.value_ = newValue;
    this.reportChanged(); // 调用Atom中reportChanged
  }
}

class Atom {
  observers_ = new Set(); /* 存放每个组件的 */
  /* value改变，通知更新 */
  reportChanged() {
    startBatch();
    propagateChanged(this);
    endBatch();
  }
  /* 收集依赖 */
  reportObserved() {
    return reportObserved(this);
  }
}
```

关键 代码 组件的`@observe` 装饰器怎么做的

```js
function observer(componentClass) {
  /* componentClass 是类组件的情况 (函数组件我们暂且忽略) */
  return function makeClassComponentObserver() {
    const target = componentClass.prototype;
    const baseRender = target.render; /* 这个是原来组件的render */
    /* 劫持render函数 */
    target.render = function () {
      return makeComponentReactive.call(this, baseRender);
    };
  };
}
```

劫持了 render 方法来收集组件中的依赖项

```js

function makeComponentReactive(){
    const baseRender = render.bind(this) // baseRender为真正的render方法
     /* 创建一个反应器，绑定类组件的更新函数 —— forceUpdate  */
     const reaction = new Reaction(`${initialName}.render()`,()=>{
          Component.prototype.forceUpdate.call(this) /* forceUpdate 为类组件更新函数 */
     })
    reaction["reactComponent"] = this    /* Reaction 和 组件实例建立起关联 */
    reactiveRender["$mobx"] = reaction
    this.render = reactiveRender
    function reactiveRender() { /* 改造的响应式render方法 */
        reaction.track(() => {  // track中进行真正的依赖收集
            try {
                rendering = baseRender() /* 执行更新函数 */
            }
        })
        return rendering
    }
    return reactiveRender.call(this)
}

```

注入模块通过 provider inject 完成

@inject 作用就是将 store 中的状态 中混入 props 中。

newProps[storeName] = context[storeName]

每一个组件会创建一个 Reaction，Reaction 第二个参数就是 forceUpdate
对 render 函数进行改造，改造成 reactiveRender ，在 reactiveRender 中，reaction.track 是真正的进行依赖的收集，track 回调函数中，执行真正的 render 方法，得到 element 对象 rendering 。

get 值的时候 reaction 中添加 observable，

上面 reaction.track 方法执行的时候会 observable 中添加 reaction

当属性改变的时候会走劫持的 set 方法，set 方法即`setObservablePropValue_`最终会调` Reaction.onBecomeStale_()`
这个方法会开启调度更新，最终触发 new reaction 的时候传入的第二个回调函数即 forceUpdate 方法

Mobx 上手简单， Redux 复杂
redux 数据流向规范简单，mobx 数据依赖于 Proxy， Object.defineProperty 等，劫持属性 get ，set ，数据变化多样化，允许数据冗余  
Redux 可拓展性比较强，可以通过中间件自定义增强 dispatch 。
基本有一个 store ，统一管理 store 下的状态，在 mobx 中可以有多个模块，可以理解每一个模块都是一个 store ，相互之间是独立的。

### react-router

this.props 会多出三个对象

history
location
match

#### history

pushState(state, title, path)
replaceState(state, title, path)

监听事件只有浏览器的 `history.back()`、`history.forward()`、`history.go()`方法才会触发。
`pushState，replaceState` 不会触发。

```js
window.addEventListener("popState", function (e) {});
```

```js
history.push(`/home?name=${name}&mes=${mes}`);
// 或者
history.push({
  pathname: "/home",
  state: {
    name,
    mes,
  },
});

const { state = {} } = this.prop.location;
const { name, mes } = state;
```

#### hash

切换路由本质上是改变 `window.location.hash 。`

通过`hashchange` 可以监听 `hash` 值的改变。

```js
window.addEventListener("hashchange", function (e) {
  /* 监听改变 */
});
```

#### 自定义路由

```js
<CustomRouter path="/list" component={List} />;

function CustomRouter(props) {
  const permissionList = useContext(permissionContext); /* 获取权限列表 */
  const haspermission = matchPermission(
    permissionList,
    props.path
  ); /* 检查是否具有权限 */
  return haspermission ? <Route {...props} /> : <Redirect to="/noPermission" />;
}
```

## react 组件的通讯方式

ref
props callback
Context.Consumer ， Context.provider
redux
事件冒泡和捕获

## react 优化之控制渲染

### 非必要不更新

#### key

#### state props 下放，对于影响其他组件的属性的一些 dom 可以抽出来成为一个子组件

比如

<div>
  <input/>
  <p></p>
  <Complex/>
</div>

可以把 ` <input/> <p></p>` 抽出去

```js
<div>
  <Form />
  <Complex />
</div>
```

本质上相当于

const renderExpensive = useMemo(()=> <ExpensiveTree />)

```js
<div>
  <input />
  <p></p>
  {renderExpensive()}
</div>
```

#### memo，PureComponent， shouldComponentUpdate， React.memo

react 控制 render 的方式 经典的就是 memo，缓存 element 对象。 组件从自身来控制：PureComponent ，shouldComponentUpdate 。

```js
{
  useMemo(() => <Children number={numberA} />, [numberA]);
}
```

其他值改变 children 会从缓存中读取，numberA 改变重新生成新的 element

第一个参数 create 回调函数的缓存值绑定在函数组件对应的 fiber 对象上，只有第二个参数 deps 改变才会替换

通过 createElement 生成 element 会产生一个新的 props，这个 props 将作为对应 fiber 的 pendingProps ，在此 fiber 更新调和阶段，React 会对比 fiber 上老 oldProps 和新的 newProp （ pendingProps ）是否相等，如果相等函数组件就会放弃子组件的调和更新，从而子组件不会重新渲染；

PureComponent： 浅比较 state 和 props 是否相等

React.memo

```js
React.memo(Component, compare);
```

compare 是一个函数，返回 true 不更新，false 更新和 shouldComponentUpdate 相反，compare 不存在时，会用浅比较原则处理 props

```js
const controlIsRender = (pre, next) => {
  return (
    pre.number === next.number ||
    (pre.number !== next.number && next.number > 5)
  ); // number不改变或number 改变但值大于5->不渲染组件 | 否则渲染组件
};
const NewTexMemo = memo(TextMemo, controlIsRender);

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 1,
      num: 1,
    };
  }
  render() {
    const { num, number } = this.state;
    return (
      <div>
        <button onClick={() => this.setState({ number: number + 1 })}>
          number++
        </button>
        <button onClick={() => this.setState({ num: num + 1 })}>num++</button>

        <NewTexMemo num={num} number={number} />
      </div>
    );
  }
}
```

getDerivedStateFromProps 在 render 之前也可以判断条件后更新否则 return null 不更新

#### immutable.js

老的 api 都是突变
sort splice push pop 数据突变

新的 api 不可变
map filter reduce slice 都是数据不可变，操作后原数组不变
但是都是浅拷贝的

array = [{name: 'ddd'}] 这种包了一层的都是突变的

redux 要求全局装填不可变，本地组件状态不可变

immutable.js
**提供数据共享的特性，能够快速差异比较，使得组件更加智能的渲染**

list
map

api：
fromJS 把深层嵌套的 map 都变成 immutable.js 的 map 结构，相当于深层都是不可变的

is 判断对象是否直观的相等,js 里面比较的是地址。

应用：
当调用 setState 的时候即使传入的数据一样也会 diff ，js 是引用地址比较
react 中采用的 pureComponent 浅比较数据结构比较复杂的时候依然会存在无效 diff

formJS 包裹 state， is 判断是否相等，get 方法取 name 的值

```js
import { fromJS, is } from "immutable";
import { Component } from "react";

class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      person: formJS({ name: "zhangsan" }),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!is(this.state.person, nextState.person)) {
      return true;
    }
    return false;
  }
}

render(){
  return (

    <div>{this.state.person.get("name")}</div>
  )
}
```

另外和 redux 一起使用。

redux 本身数据就是用的不可变数据

```js
const initialState = fromJS({ count: 0 });

function numberReducer(state = initialState, action) {
  switch (action.type) {
    case "ADD":
      return state.set("count", count + 1);
    case "DEL":
      return state.set("count", count - 1);
    default:
      return state;
  }
}



获取的时候也是`state.get('count')` 的形式
```

### 懒加载异步渲染

1. Suspense
   v18 Suspense 在 UserInfo 请求数据成功后才会渲染。

```js
<Suspense fallback={<h1>Loading...</h1>}>
  <UserInfo />
</Suspense>
```

传统模式：挂载组件-> 请求数据 -> 再渲染组件。
异步模式：请求数据-> 渲染组件。

2. React.lazy

```js
const LazyComponent = React.lazy(() => import("./text"));

<Suspense fallback={<div>loading...</div>}>
  <LazyComponent />
</Suspense>;
```

### 参考下面的十万条数据渲染

## React SSR

仅仅 SEO 的话就可以用 preRender 库

CSR client side render
SSR server side render

服务端直接返回 html

next
nuxt

## 函数组件和类组件区别

### 判断组件是 class 组件还是 function 组件

```js
ClassComponent.prototype.isReactComponent; // {}
FunctionComponent.prototype.isReactComponent; // undefined
```

## React Hooks

### 为什么要有 hooks

函数组件交互就有状态的改变，React 是通过 setState 来改变状态。但 setState 是类组件中的 API，还有生命周期之类的
在函数式组件中，是没有状态的，一般当做渲染（无状态组件）

官网描述的 hooks 动机

> 在组件之间复用状态逻辑很难
> 复杂组件变得难以理解
> 难以理解的 class

所以 Hook 解决的是

1. 无 Class 的复杂性 ，没有生命周期的困扰
2. 优雅地复用
3. 具有 Class 组件已经具备的能力 可以处理一些副作用，能获取 ref ，也能做数据缓存。

class 组件缺点

1. 代码量多
2. 状态逻辑难以复用，复用只能通过 render props（渲染属性）或者 HOC（高阶组件），但无论时渲染属性还是高阶组件，都会在原先的组件外包裹一层父容器（一般都是 div 元素），导致层级冗余

### Hoc

创建一个函数，接收一个组件或其他的参数作为输入返回一个不同的组件
由于嵌套，使得调试难度变高

```js
function Wrapper(Component1) {
  return new Component2();
}
```

### Hooks 的本质是什么？为什么？ Hooks 的原理

hooks 本质是闭包

Hooks 主要是利用闭包来保存状态，使用链表保存一系列 Hooks，将链表中的第一个 Hook 与 Fiber 关联。在 Fiber 树更新时，就能从 Hooks 中计算出最终输出的状态和执行相关的副作用

### 为什么不能在 for 循环、if 语句里使用 hooks？

存 Hooks 状态的对象是以单链表的形式储存状态，如果用循环、条件或者嵌套函数等方式使用 Hooks，会破坏 Hooks 的调用顺序

`fiber.memorizedstate(hook@)-> next(hook1)-> next(hook2)->next(hook3)->next(hook4)->...`

单链表的每个 Hook 节点没有名字或者 key，因为除了它们的顺序，我们无法记录它们的唯一性。因为为了确保某个 Hook 是它本身，我们不能破坏这个链表的稳定性

### Hooks 和 hoc 的区别，为什么不用 hoc

render props 和 高阶组件只渲染一个子节点。我们认为让 Hook 来服务这个使用场景更加简单。
hoc 的缺点是会有嵌套、props 会被劫持，容易出现冲突，Hooks 没有个问题

### 特殊 hooks 的作用

React.memo、React.useCallback、React.usememo 的作用

#### useMemo，useCallback 的区别

#### useEffect(fn, []) 和 componentDidMount 有什么差异

useEffect 会捕获 props 和 state。即使在回调函数里，你拿到的还是初始的 props 和 state。如果你想要得到“最新”的值，你可以使用 ref。不过通常会有更简单的实现方式，所以你并不一定要用 ref。也可以用第二个参数 deps

执行时机不同 ​
componentDidMount 在组件挂载之后运行。如果立即（同步）设置 state，那么 React 就会触发一次额外的 render，并将第二个 render 的响应作为初始 UI，

useEffect 在 commit 的第一个阶段执行因为 useEffect 在绘制（Paint）之后异步运行。

Props 和 State 的捕获（Capture Value）​
每次渲染就会捕获新的 props 和 state

### hooks 组件的生命周期

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

useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前，同步的。会阻塞主线程

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

## Fiber

重点，为什么要 fiber react 自己实现了浏览器 requestIdleCallback 方法，

在浏览器空闲的时候再执行 beginWork 和 completeWork 操作
重点就是有了 fiber 结构实现的就是任务可以中断并恢复

render 阶段执行完后 workInProgress fiber 会变成 currentFiber

fiberRoot 的 current 指针指向 workInProgress 使其变成 current fiber 直接替，完成初始化流程

- Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入 Reconciler react 自己实现 requestIdleCallback，即有空闲时间的时候执行
- Reconciler（协调器）—— 负责找出变化的组件 打上标记
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上
  整个 Scheduler 与 Reconciler 的工作都在内存中进行。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。 Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。

使用“双缓存”
在内存中绘制当前的 fiber dom，绘制完毕后直接替换上一帧的 fiber dom，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况

在 React 中最多会同时存在两棵 Fiber 树。当前屏幕上显示内容对应的 Fiber 树称为 current Fiber，正在内存中构建的 Fiber 树称为 workInProgress Fiber，两者通过 alternate 连接

### 异步调度原理？

#### scheduleCallback

```js
scheduleCallback(Immediate, workLoopSync);
scheduleCallback(priorityLevel, workLoopConcurrent);
```

```js
function scheduleCallback(){
   const newTask = { ... }
  if (startTime > currentTime) {
    // 如果还没过期
    //开始时间排序
      newTask.sortIndex = startTime;
      push(timerQueue, newTask);
      requestHostTimeout(handleTimeout, startTime - currentTime);
  }else{
    // 通过过期时间排序
    newTask.sortIndex = expirationTime;
    /* 把任务放入taskQueue */
    push(taskQueue, newTask);
    /*没有处于调度中的任务， 然后向浏览器请求一帧，浏览器空闲执行 flushWork */
     if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
         requestHostCallback(flushWork)
     }

  }

}
```

#### requestHostTimeout

`requestHostTimeout` 就是调用`setTimeout(cb, ms);`延迟到刚好过期 延迟后的回调方法是 `handleTimeout`

`handleTimeout` 方法就是

1.  将 `timeQueue` 中过期的任务，放在 `taskQueue` 中
2.  调用 `requestHostCallback(flushWork);`

#### requestHostCallback

requestHostCallback 就是 requestIdleCallback 实现的关键

`MessageChannel` 来实现的 `requestIdleCallback`

`React` 会调用 `requestHostCallback` ，把更新任务赋值给 `scheduledHostCallback` ，

```js
let scheduledHostCallback = null;
var channel = new MessageChannel();
var port = channel.port2;

channel.port1.onmessage = function () {
  /* 执行任务 */
  scheduledHostCallback();
  scheduledHostCallback = null;
};
/* 向浏览器请求执行更新任务 */
requestHostCallback = function (callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
};
```

port2 MessageChannel.port.postMessage 发送消息，port1 会通过 onmessage ，接受来自 port2 消息，然后执行更新任务 scheduledHostCallback ，然后置空 scheduledHostCallback ，借此达到异步执行目的。

#### flushWork

```js
function flushWork() {
  // 如果任务没过期会调用requestHostTimeout开启定时器，定时器结束后会调用requestHostCallback(flushWork); 这里就是取消定时器
  cancelHostTimeout();
  workLoop(hasTimeRemaining, initialTime);
}
```

对于正常更新会走 `performSyncWorkOnRoot` 逻辑，最后会走 `workLoopSync` 。
对于低优先级的异步更新会走 `performConcurrentWorkOnRoot` 逻辑，最后会走 `workLoopConcurrent` 。

```js
function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

唯一区别就是`shouldYield()`方法。当前浏览器没有空余时间， `shouldYield` 会中止循环，直到浏览器有空闲时间后再继续遍历，从而达到终止渲染的目的。

![两张图帮助理解](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b54e758e13641adae78499dbddc6b47~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

![两张图帮助理解](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/429a103a732e42b69b6cd9a32f1d265a~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

### fiber 更新机制

element 和真实 DOM 以及 fiber 关系

什么事双缓存

创建 fiberRoot 节点，只有一个。然后创建 rootFiber 可以有多个。FiberRoot 的 current 指针指向 rootFiber

判断有没有 alternate 属性，如果没有就创建 workInProgress 的 fiber 树 用 alternate 和 rootFiber 关联起来。

1. 进入到 beginWork 阶段
   对于 classComponent 先执行构造方法 然后判断是更新还是初始化，

   - 初始化 首先 getDerivedFromProps componentWillMount（三个条件）
   - 更新 首先 componentWillReceiveProps(没有 getDerived 且有该方法才会触发)， getDerivedFromProps，shouldComponentUpdate componentWillUpdate

   最后执行 render 方法，

> 向下遍历 children 遍历过程中会执行 diff 算法，来复用 oldFiber，不能复用的会打上 effectTag 标记，标记包括删除（delete），更新（update），添加（Placement）

在初始化完成的过程中 fiberRoot 会将 current 指针指向 前面创建的 workInProgress 树

2. 进入 completeWork 阶段
   该阶段会创建 effectList 同时对 beginWork 阶段打标的节点创建出真实的 dom，同时还是执行 diffProperties 来处理 props, style, className 等属性， 同时该方法还会处理事件收集

   - diffProperties 中判断合成事件，遍历合成事件的数组，判断捕获还是冒泡执行原生的 addEventListener 方法，将监听事件统一到 dispatchEvent 来处理 `legacy`模式下，都会执行 dispatchEventForLegacyPluginEventSystem
   - 会调用 batchedEventUpdates 方法
     - 批量更新就是在这里做的，经过上述处理第一个参数就是事件队列的数组 isBatchingEventUpdates 设为 true 在
       然后执行回调事件回调事件 handleTopLevel， handleTopLevel 执行完毕后 isBatchingEventUpdates 设为 false
   - handleTopLevel 该方法会执行时间 registrationNameModules 中定义的事件插件，如 onClick 对应的就是 SimpleEventPlugin，在事件插件方法中会判断如果是冒泡就 push 如果是捕获就 unShift 到事件数组中。

3. 进入 commit 阶段

   复用之前 current 上的 alternate 来创建一棵新的 workInProgress 树除了 rootFiber 的 alternate 外剩余的所有子节点都要创建和 current 上的 fiber 用 alternate 一一对应。渲染完毕后 workInProgress 树会再次变为 current 树

   1. beforeMutation 阶段
      该阶段是获取 dom 快照最佳时期 getSnapshotBeforeUpdate 以及 useEffect
   2. mutation 阶段
      置空 ref，对新增元素，更新元素，删除元素。进行真实的 DOM 操作。 如果是删除组件操作此时组件的 componentWillUnmount 将会执行
   3. Layout 阶段
      如果有 ref ，会重新赋值 ref 。
      函数组件执行 useLayoutEffect
      类组件执行 componentDidMount componentDidUpdate 两个方法
      componentDidCatch 也是在这调用的

另外两个生命周期 getDerivedStateFromError 在 Reconciliation 阶段的错误捕获中被调用 componentDidCatch 是 Commit 阶段的 Layout 部分调用的

---

那么 render 的作用是根据一次更新中产生的新状态值，通过 React.createElement ，替换成新的状态，得到新的 React element 对象，新的 element 对象上，保存了最新状态值。 createElement 会产生一个全新的 props。到此 render 函数使命完成了

一次更新中产生的新状态值，通过 React.createElement ，替换成新的状态，得到新的 React element 对象，新的 element 对象上，保存了最新状态值。 createElement 会产生一个全新的 props。接下来，React 会调和由 render 函数产生 chidlren，将子代 element 变成 fiber（这个过程如果存在 alternate，会复用 alternate 进行克隆，如果没有 alternate ，那么将创建一个），将 props 变成 pendingProps ，至此当前组件更新完毕。然后如果 children 是组件，会继续重复上一步，直到全部 fiber 调和完毕。完成 render 阶段。

## react 15 和 16 的改进。

reconcile

render

增加了

Scheduler 分配优先级 15 没有，
Reconcile 采用的 fiber 结构异步可中断更新，15 中采用 Stack reconciler（堆栈协调器），递归更新，同步且不可中断

element 标记就是`$$typeof: REACT_ELEMENT_TYPE`(Symbol)表示该对象是个 React Element

之所以用`$$typeof`为了防止 XSS 攻击。因为 JSON 不支持 Symbol 类型，所以服务器通过 JSON 攻击不会影响到 React

React Element + 优先级、打标记等属性和方法 = React Fiber

再看 fiber 解构 alternate stateNode，lanes，childLanes，flags，subtreeFlags， return， child sibling，memoizedProps，updateQueue 基础信息，type tag elementType key 等

因为一个更新过程可能被打断，所以 React Fiber 一个更新过程被分为两个阶段（Phase）：第一个阶段 Reconciliation Phase 和 第二阶段 Commit Phase

16ms 即 1 帧做的事情，若超过 16ms 就会感觉到卡

- 处理用户的交互
- JS 解析执行
- 帧开始。窗口尺寸变更，页面滚动等事件
- rAF(requestAnimationFrame)
- 布局
- 绘制

因为浏览器是一帧一帧执行的，在两个执行帧之间，主线程通常会有一小段空闲时间，requestIdleCallback 可以在空闲期（Idle Period）调用空闲期回调（Idle Callback），执行一些任务

## react 响应式

组件 A 更新方式

- 类组件：`setState | forceUpdate`。 函数组件 `useState | useReducer`
- `props` 改变, 本质是父 state 的改变
- `context` 的更新， context 改变来源于 provider 中 value 的改变。而 value 也是 state 的衍生物

**fiber 是调和过程中的最小单元，每一个需要调和的 fiber 都会进入 workLoop 中。**
**而组件是最小的更新单元，React 的更新源于数据层 state 的变化。**

当

```js
root {
   A:{C,D},
   B:{
    E:
    {
      F:
      }}}
```

当 F 变化后，执行`scheduleUpdateOnFiber` 调用`markUpdateLaneFromFiberToRoot`标记优先级
会把 F 到 root 的所有 fiber 节点（ root -> B-> E -> F）优先级都会标记`childLanes`

`scheduleUpdateOnFiber` 另外执行的方法就是 `performSyncWorkOnRoot`(执行 workLoop 的 render 阶段和 commit)执行`beginWork`的时候查找过程通过 `childLanes` 主机向下，即 `root -> A --sibling--> B ---> E--->F` 到 F 后执行`render`更新

无论什么模式，workLoop 的执行单元都是 fiber 。而且更新单元的函数叫做 performUnitOfWork 。
workLoop ---> performUnitOfWork{ beginWork, completeUnitOfWork}

root{A:{B:{C:{D}}}}

如上结构，只要子组件 state 改变，所有 children 都会 reRender 所有父组件都会调和

即加入 B 组件 State 变化，即使变换内容 CD 没用到，只要不适用 memo pureComponent 都会更新。B 组件的父组件即 root 和 A 组件都会调和但是不会 rerender

!(参考文章)[https://juejin.cn/book/6945998773818490884/section/7023422095514140687?enter_from=course_center&utm_source=course_center]

## 什么是虚拟 dom

官方解释

> Virtual DOM 是一种编程概念。在这个概念里，UI 以一种理想化的，或者说“虚拟的”表现形式被保存于内存中，并通过如 ReactDOM 等类库使之与“真实的”DOM 同步。这一过程叫做协调.
> 这种方式赋予了 React 声明式的 API：您告诉 React 希望让 UI 是什么状态，React 就确保 DOM 匹配该状态。这使您可以从属性操作、事件处理和手动 DOM 更新这些在构建应用程序时必要的操作中解放出来 UI = f(data)

以 tag attrs children 的形式保存

```js

{
    "tag": "ul",
    "attrs": {
        "id": "list"
    },
    "children": [
    ]
}
```

Virtual DOM 就是描述真实 DOM 的一个对象（包括 tag， attrs， children） 是真实 DOM 状态的内存映射，和虚拟 dom 的属性和真是 dom 的 tag 和 props 都一一对应，因此不需要操作 dom 只关注应用装填就可以。

react 优势 1. batching 合并更新，减少渲染次数，提高渲染效率 2. diff 针对变化的 dom 更新。 跨平台性

## 十万条数据渲染

react-window 和 react-virtualized 是两个流行的虚拟化库。

### 1. 时间分片

    浏览器执 js 速度要比渲染 DOM 速度快的多, 时间分片。并没有本质减少浏览器的工作量，而是把一次性任务分割开来，给用户一种流畅的体验效果。

随机颜色随机位置一次性显示 20000 条数据出现卡顿的现象。 关键是 toRenderList 方法，分次渲染一次渲染 eachRenderNum 条数据总共渲染 times 次。每次渲染后 index++ 当 index > times 代表渲染完成

```js
// TODO: 改造方案
class Index extends React.Component {
  state = {
    dataList: [], //数据源列表
    renderList: [], //渲染列表
    position: { width: 0, height: 0 }, // 位置信息
    eachRenderNum: 500, // 每次渲染数量
  };
  box = React.createRef();
  componentDidMount() {
    const { offsetHeight, offsetWidth } = this.box.current;
    const originList = new Array(20000).fill(1);
    const times = Math.ceil(
      originList.length / this.state.eachRenderNum
    ); /* 计算需要渲染此次数*/
    let index = 1;
    this.setState(
      {
        dataList: originList,
        position: { height: offsetHeight, width: offsetWidth },
      },
      () => {
        this.toRenderList(index, times);
      }
    );
  }
  toRenderList = (index, times) => {
    if (index > times) return; /* 如果渲染完成，那么退出 */
    const { renderList } = this.state;
    renderList.push(
      this.renderNewList(index)
    ); /* 通过缓存element把所有渲染完成的list缓存下来，下一次更新，直接跳过渲染 */
    this.setState({
      renderList,
    });
    requestIdleCallback(() => {
      /* 用 requestIdleCallback 代替 setTimeout 浏览器空闲执行下一批渲染 */
      this.toRenderList(++index, times);
    });
  };
  renderNewList(index) {
    /* 得到最新的渲染列表 */
    const { dataList, position, eachRenderNum } = this.state;
    const list = dataList.slice(
      (index - 1) * eachRenderNum,
      index * eachRenderNum
    );
    return (
      <React.Fragment key={index}>
        {list.map((item, index) => (
          <Circle key={index} position={position} />
        ))}
      </React.Fragment>
    );
  }
  render() {
    return (
      <div className="bigData_index" ref={this.box}>
        {this.state.renderList}
      </div>
    );
  }
}
```

### 2. 虚拟列表

在长列表滚动过程中，只有视图区域显示的是真实 DOM ，滚动过程中，不断截取视图的有效区域，让人视觉上感觉列表是在滚动。达到无限滚动的效果。

视图区：视图区就是能够直观看到的列表区，此时的元素都是真实的 DOM 元素。
缓冲区：缓冲区是为了防止用户上滑或者下滑过程中，出现白屏等效果。（缓冲区和视图区为渲染真实的 DOM ）
虚拟区：对于用户看不见的区域（除了缓冲区），剩下的区域，不需要渲染真实的 DOM 元素。虚拟列表就是通过这个方式来减少页面上 DOM 元素的数量。

根据 scrollTop 来计算渲染区域向上偏移量, 重新计算 end 和 start 来重新渲染列表。

设置 transform 模拟用户滑动效果。用户向下滑动的时候，可视区域要向上滚动， 用户向上滑动的时候，可视区域要向下滚动。

```js
function VirtualList() {
  const [dataList, setDataList] = React.useState([]); /* 保存数据源 */
  const [position, setPosition] = React.useState([
    0, 0,
  ]); /* 截取缓冲区 + 视图区索引 */
  const scroll = React.useRef(null); /* 获取scroll元素 */
  const box = React.useRef(null); /* 获取元素用于容器高度 */
  const context = React.useRef(null); /* 用于移动视图区域，形成滑动效果。 */
  const scrollInfo = React.useRef({
    height: 500 /* 容器高度 */,
    bufferCount: 8 /* 缓冲区个数 */,
    itemHeight: 60 /* 每一个item高度 */,
    renderCount: 0 /* 渲染区个数 */,
  });
  React.useEffect(() => {
    const height = box.current.offsetHeight;
    const { itemHeight, bufferCount } = scrollInfo.current;
    const renderCount = Math.ceil(height / itemHeight) + bufferCount;
    scrollInfo.current = { renderCount, height, bufferCount, itemHeight };
    const dataList = new Array(10000).fill(1).map((item, index) => index + 1);
    setDataList(dataList);
    setPosition([0, renderCount]);
  }, []);
  const handleScroll = () => {
    const { scrollTop } = scroll.current;
    const { itemHeight, renderCount } = scrollInfo.current;

    // 直接使用scrollTop的话，就每触发一次scroll事件就会改变下偏移量，造成滑动与偏移同时产生，所以就不会这么丝滑了。取余操作的话，表示每经过一个元素块变动一次，不会频繁的触发偏移操作
    const currentOffset = scrollTop - (scrollTop % itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    context.current.style.transform = `translate3d(0, ${currentOffset}px, 0)`; /* 偏移，造成下滑效果 */
    const end = Math.floor(scrollTop / itemHeight + renderCount + 1);
    if (end !== position[1] || start !== position[0]) {
      /* 如果render内容发生改变，那么截取  */
      setPosition([start, end]);
    }
  };
  const { itemHeight, height } = scrollInfo.current;
  const [start, end] = position;
  const renderList = dataList.slice(start, end); /* 渲染区间 */
  console.log("渲染区间", position);
  return (
    <div className="list_box" ref={box}>
      <div
        className="scroll_box"
        style={{ height: height + "px" }}
        onScroll={handleScroll}
        ref={scroll}
      >
        <div
          className="scroll_hold"
          style={{ height: `${dataList.length * itemHeight}px` }}
        />
        <div className="context" ref={context}>
          {renderList.map((item, index) => (
            <div className="list" key={index}>
              {" "}
              {item + ""} Item{" "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

scroll 事件密集发生，计算量很大，容易造成性能问题
IntersectionObserver API，可以自动"观察"元素是否可见

所以也可以用 IntersectionObserver 替代 onScroll
https://fe.azhubaby.com/React/%E9%9D%A2%E8%AF%95%E9%A2%98/%E6%B8%B2%E6%9F%93%E5%8D%81%E4%B8%87%E6%9D%A1%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88.html

## context 原理

重点流程放在 context 的传递和更新两个方面

1. Provider 如何传递 context？
2. 三种获取 context 原理 （ Consumer， useContext，contextType ）？
3. 消费 context 的组件，context 改变，为什么会订阅更新 （如何实现） 。
4. context 更新，如何避免 pureComponent ， shouldComponentUpdate 渲染控制策略的影响。
5. 如何实现的 context 嵌套传递 （ 多个 Provider ）?

老版本的 context 是采用约定式的使用规则，于是有了 getChildContext 和 childContextTypes 协商的属性和方法，这种方式不仅不够灵活
新版本引入 context 对象的概念，对象上除了保留了传递的信息 value 外 ， 还有提供者 Provider 和消费者 Consumer。

`createContext`

```js
export function createContext<T>(
  defaultValue: T,
  calculateChangedBits: ?(a: T, b: T) => number
): ReactContext<T> {
  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE, // 本质上就是 Consumer element 类型
    _calculateChangedBits: calculateChangedBits,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: (null: any),
    Consumer: (null: any),
  };

  /* 本质上就是 Provider element 类型。  */
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  let hasWarnedAboutUsingNestedContextConsumers = false;
  let hasWarnedAboutUsingConsumerProvider = false;

  if (__DEV__) {
    // A separate object, but proxies back to the original context object for
    // backwards compatibility. It has a different $$typeof, so we can properly
    // warn for the incorrect usage of Context as a Consumer.
    const Consumer = {
      $$typeof: REACT_CONTEXT_TYPE,
      _context: context,
      _calculateChangedBits: context._calculateChangedBits,
    };
    // $FlowFixMe: Flow complains about not setting a value, which is intentional here
    Object.defineProperties(Consumer, {
      Provider: {
        get() {
          if (!hasWarnedAboutUsingConsumerProvider) {
            hasWarnedAboutUsingConsumerProvider = true;
            console.error(
              "Rendering <Context.Consumer.Provider> is not supported and will be removed in " +
                "a future major release. Did you mean to render <Context.Provider> instead?"
            );
          }
          return context.Provider;
        },
        set(_Provider) {
          context.Provider = _Provider;
        },
      },
      _currentValue: {
        get() {
          return context._currentValue;
        },
        set(_currentValue) {
          context._currentValue = _currentValue;
        },
      },
      _currentValue2: {
        get() {
          return context._currentValue2;
        },
        set(_currentValue2) {
          context._currentValue2 = _currentValue2;
        },
      },
      _threadCount: {
        get() {
          return context._threadCount;
        },
        set(_threadCount) {
          context._threadCount = _threadCount;
        },
      },
      Consumer: {
        get() {
          if (!hasWarnedAboutUsingNestedContextConsumers) {
            hasWarnedAboutUsingNestedContextConsumers = true;
            console.error(
              "Rendering <Context.Consumer.Consumer> is not supported and will be removed in " +
                "a future major release. Did you mean to render <Context.Consumer> instead?"
            );
          }
          return context.Consumer;
        },
      },
    });
    // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty
    context.Consumer = Consumer;
  } else {
    context.Consumer = context;
  }

  if (__DEV__) {
    context._currentRenderer = null;
    context._currentRenderer2 = null;
  }

  return context;
}
```

createContext
其初始值保存在 `context._currentValue`

Provider 合并 Consumer 是 2 个 reactElement 对象.

```js
function beginWork(current, workInProgress, renderLanes): Fiber | null {
  const updateLanes = workInProgress.lanes;
  workInProgress.lanes = NoLanes;
  // ...省略...
  switch (workInProgress.tag) {
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress, renderLanes);
  }
}

function updateContextProvider(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  // ...省略无关代码
  const providerType: ReactProviderType<any> = workInProgress.type;
  const context: ReactContext<any> = providerType._context;

  const newProps = workInProgress.pendingProps;
  const oldProps = workInProgress.memoizedProps;
  // 接收新value
  const newValue = newProps.value;

  // 更新 ContextProvider._currentValue
  pushProvider(workInProgress, newValue);

  if (oldProps !== null) {
    // ... 省略更新context的逻辑, 下文讨论
  }

  const newChildren = newProps.children;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```

updateContextProvider()在 fiber 初次创建时就是保存 pendingProps.value 做为 context 的最新值, 之后这个最新的值用于供给消费.
pushProvider 实际上是一个存储函数, 利用栈的特性, 先把 `context._currentValue` 压栈, 之后更新 `context._currentValue` = nextValue.
与 pushProvider 对应的还有 popProvider, 同样利用栈的特性, 把栈中的值弹出, 还原到 `context._currentValue` 中.

使用了 MyContext.Provider(reactElement 对象)组件之后,
在 fiber 树构造过程中, context 的值会被 ContextProvider 类型的 fiber 节点所更新.

1. 使用`<MyContext.Consumer>`消费

```js
function updateContextConsumer(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  let context: ReactContext<any> = workInProgress.type;
  const newProps = workInProgress.pendingProps;
  const render = newProps.children;

  // 读取context
  prepareToReadContext(workInProgress, renderLanes);
  const newValue = readContext(context, newProps.unstable_observedBits);
  let newChildren;

  // ...省略无关代码
}
```

2. 使用 useContext: 用于 function 中 const value = useContext(MyContext)
   进入 updateFunctionComponent 后, 会调用 prepareToReadContext 无论是创建还是更新都会调用 readContext

3. class 组件 MyClass.contextType = MyContext;

进入 updateClassComponent 后 , 会调用 prepareToReadContext 无论是创建还是更新都会调用 readContext

```js
// ... 省略无关代码
export function prepareToReadContext(
  workInProgress: Fiber,
  renderLanes: Lanes
): void {
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null;

  const dependencies = workInProgress.dependencies;
  if (dependencies !== null) {
    const firstContext = dependencies.firstContext;
    if (firstContext !== null) {
      if (includesSomeLane(dependencies.lanes, renderLanes)) {
        // Context list has a pending update. Mark that this fiber performed work.
        markWorkInProgressReceivedUpdate();
      }
      // Reset the work-in-progress list
      dependencies.firstContext = null;
    }
  }
}
// ... 省略无关代码
export function readContext<T>(
  context: ReactContext<T>,
  observedBits: void | number | boolean
): T {
  const contextItem = {
    context: ((context: any): ReactContext<mixed>),
    observedBits: resolvedObservedBits,
    next: null,
  };
  // 1. 构造一个contextItem, 加入到 workInProgress.dependencies链表之后
  if (lastContextDependency === null) {
    lastContextDependency = contextItem;
    currentlyRenderingFiber.dependencies = {
      lanes: NoLanes,
      firstContext: contextItem,
      responders: null,
    };
  } else {
    lastContextDependency = lastContextDependency.next = contextItem;
  }
  // 2. 返回 currentValue
  return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}
```

返回`context._currentValue`, 并构造一个`contextItem添加到workInProgress.dependencies`链表之后
`dependencies`属性会在更新时使用, 用于判定是否依赖了`ContextProvider`中的值.

更新的时候, 同样进入 updateContextConsumer

如果 value 改变的话会走如下逻辑

向下遍历：从 ContextProvider 类型的节点开始, 向下查找所有 fiber.dependencies 依赖该 context 的节点(假设叫做 consumer).

向上遍历: 从 consumer 节点开始, 向上遍历, 修改父路径上所有节点的 fiber.childLanes 属性, 表明其子节点有改动, 子节点会进入更新逻辑.

总结：
Context 的实现思路还是比较清晰, 总体分为 2 步.
在消费状态时,ContextConsumer 节点调用 readContext(MyContext)获取最新状态.
在更新状态时, 由 ContextProvider 节点负责查找所有 ContextConsumer 节点, 并设置消费节点的父路径上所有节点的 fiber.childLanes, 保证消费节点可以得到更新.

## 怎么寻找 react 页面卡顿的原因

1. 使用 React DevTools Profiler

安装 React DevTools：
在 Chrome 或 Firefox 浏览器中安装 React DevTools 扩展。
打开 React DevTools，切换到 "Profiler" 选项卡。
点击 "Start profiling" 按钮，开始记录性能数据。
进行一些用户操作，然后点击 "Stop profiling" 按钮，停止记录性能数据。

2. 使用浏览器开发者工具
   Performance

查看 "Main" 线程，找出哪些 JavaScript 函数执行时间较长。
查看 "Frames" 选项卡，找出哪些帧的渲染时间超过了 16ms（导致掉帧）。

3. 检查不必要的重新渲染
   不必要的重新渲染是导致 React 页面卡顿的常见原因。

函数组件 React.memo

类组件使用 shouldComponentUpdate 或 PureComponent

4. 优化状态管理

尽量将状态保持在最小的组件范围内，避免将所有状态提升到顶层组件。

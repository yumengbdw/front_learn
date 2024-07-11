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
componentWillMount() 触发条件

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

componentWillReceiveProps(newProps, nextContext)
getDerivedStateFromProps( nextProps, prevState)
shouldComponentUpdate(newProps,newState,nextContext)
componentWillUpdate()

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

## v18 的新特性

1. setState 全部批量更新
2. setState
3. 新特性取消了 ie 的支持， 新特性全部基于现代浏览器
4. 组件返回支持 null 和 undefined 返回，之前返回 undefined 会报错
5. Suspense 不再需要 fallback 捕获
6. 支持 useId
   在服务器和客户端生成相同的唯一一个 id，避免 hydrating 的不兼容
7. useSyncExternalStore
   用于解决外部数据撕裂问题
8. useInsertionEffect
   这个 hooks 只建议在 css in js 库中使用，这个 hooks 执行时机在 DOM 生成之后，useLayoutEffect 执行之前，它的工作原理大致与 useLayoutEffect 相同，此时无法访问 DOM 节点的引用，一般用于提前注入脚本
9. Concurrent Mode
   同步不可中断更新变成了异步可中断更新
   useDeferredValue 和 startTransition 用来标记一次非紧急更新
10. strict mode 更新
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

组合模式: 外层组件包裹内层组件 vue 中 slot 直观反映出 父 -> 子组件的包含关系<Tabs><TabsItem/></TabsItem>

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

hoc 高阶组件模式

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

completeWork 阶段会对比属性 diffProperties

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

runEventsInBatch 会判断如果有 event.isPropagationStopped()（即 e.stopPropagation） 那么直接 break 跳出循环 后续的事件不再执行

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

## redux 原理 react-router 原理

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

源码 code/myRedux 目录

### react-mox

## react 组件的通讯方式

ref
props callback
Context.Consumer ， Context.provider
redux
事件冒泡和捕获

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

react 响应式
那么 render 的作用是根据一次更新中产生的新状态值，通过 React.createElement ，替换成新的状态，得到新的 React element 对象，新的 element 对象上，保存了最新状态值。 createElement 会产生一个全新的 props。到此 render 函数使命完成了

一次更新中产生的新状态值，通过 React.createElement ，替换成新的状态，得到新的 React element 对象，新的 element 对象上，保存了最新状态值。 createElement 会产生一个全新的 props。接下来，React 会调和由 render 函数产生 chidlren，将子代 element 变成 fiber（这个过程如果存在 alternate，会复用 alternate 进行克隆，如果没有 alternate ，那么将创建一个），将 props 变成 pendingProps ，至此当前组件更新完毕。然后如果 children 是组件，会继续重复上一步，直到全部 fiber 调和完毕。完成 render 阶段。

## react 优化之控制渲染

### memo，PureComponent， shouldComponentUpdate， React.memo

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

## react 响应式

组件 A 更新方式

- 类组件：`setState | forceUpdate`。 函数组件 `useState | useReducer`
- `props` 改变
- `context` 的更新
  本质上都是 state 的变化。 props 改变是父 state 的改变，context 改变来源于 provider 中 value 的改变。而 value 也是 state 的衍生物

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

## React SSR

仅仅 SEO 的话就可以用 preRender 库

CSR client side render
SSR server side render

服务端直接返回 html

next
nuxt

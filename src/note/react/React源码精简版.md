```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

![alt text](download_image.png)

1. 递
   首先从 rootFiber 开始向下深度优先遍历。为遍历到的每个 Fiber 节点调用 beginWork（下面详细讲）；

- 该方法会根据传入的 Fiber 节点创建子 Fiber 节点，并将这两个 Fiber 节点连接起来；
- 当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段；

1. 归
   在“归”阶段会调用 completeWork（下面详细讲)处理 Fiber 节点。

- 当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的“递”阶段；
- 如果不存在兄弟 Fiber，会进入父级 Fiber 的“归”阶段；
  “递”和“归”阶段会交错执行直到“归”到 rootFiber

workLoopSync ---> performUnitOfWork ---> beginWork ----如果`fiber为null`即从父到子遍历完成----> completeWork

beginWork 的工作是传入当前 Fiber 节点，创建子 Fiber 节点,根据 current!==null，判断组件是 mount 还是 update

## 源码精简版

1. `render` ---> `legacyRenderSubtreeIntoContainer`

```js
function legacyRenderSubtreeIntoContainer(...) {
  let root = container._reactRootContainer;
  if (!root) {
    //  创建了 FiberRoot 以及绑定了 stateNode 和 current 的关系
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    );
    // 获取 Fiber Root 对象
    fiberRoot = root._internalRoot;
    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    // 非初始化渲染 即更新
    fiberRoot = root._internalRoot;
    // Update
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}
```

2. 创建 update 对象，关联 rootFiber 执行 schedule 调度更新

```js
export function updateContainer(...) {

  // 计算过期时间确定优先级 超时强制执行
  const expirationTime = computeExpirationForFiber(...);

  // 初始化一个update对象，即待执行的任务
  const update = createUpdate(expirationTime, suspenseConfig);
  update.payload = { element };
  update.callback = callback;
  rootFiber.updateQueue.shared.pending = update

  // 调度和更新 current 对象
  scheduleWork(current, expirationTime);
  // 返回过期时间
  return expirationTime;
}
```

3.  执行 `scheduleWork` ---> `performSyncWorkOnRoot` 开始进入 `render` 阶段 `workLoopSync`

```js
export const scheduleWork = scheduleUpdateOnFiber;
// rootFiber
export function scheduleUpdateOnFiber(...) {
  ...
  /**schedule的核心就是计算优先级。省略各种判断优先级的代码*/
  ...
  performSyncWorkOnRoot(root);
}
```

```js
// 进入 render 阶段, 构建 workInProgress Fiber 树
function performSyncWorkOnRoot(root) {
  // 参数 root 为 fiberRoot 对象
  // 构建 workInProgressFiber 树及 和rootFiber 相关联
  prepareFreshStack(root, expirationTime);
  do {
    workLoopSync();
  } while (true);

  // 将构建好的新 Fiber 对象存储在 finishedWork 属性中存储workInProgress的fiber树
  root.finishedWork = (root.current.alternate: any);
  // 结束 render 阶段
  // 进入 commit 阶段
  finishSyncRender(root);
  return null;
}
```

### render 阶段

```js
// 同步执行
function workLoopSync() {
  // workInProgress 是一个 fiber 对象
  // 它的值不为 null 意味着该 fiber 对象上仍然有更新要执行
  // while 方法支撑 render 阶段 所有 fiber 节点的构建
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

```js
// 构建 Fiber 对象
//  unitOfWork   workInProgress
function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  const current = unitOfWork.alternate;
  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    next = beginWork(current, unitOfWork, renderExpirationTime);
  } else {
    // beginWork: 从父到子, 构建 Fiber 节点对象
    // 返回值 next 为当前节点的子节点
    next = beginWork(current, unitOfWork, renderExpirationTime);
  }
  // 继续向上返回 遇到兄弟节点 构建兄弟节点的子 Fiber 对象 直到返回到根 Fiber 对象
  if (next === null) {
    // 从子到父, 构建其余节点 Fiber 对象
    next = completeUnitOfWork(unitOfWork);
  }

  ReactCurrentOwner.current = null;
  return next;
}
```

#### `beginWork` 从父到子的 `递` 阶段

#### beginWork

```js
function beginWork(...) {
  switch (workInProgress.tag) {
    // 0
    case FunctionComponent: {
      // 内部调用renderWithHooks
      child = updateFunctionComponent(
        null,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      );
      return child;
    }
    // 1
    case ClassComponent: {
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime
      );
    }


    // 3
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime);
    // 5
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime);
    // 6
    case HostText:
      return updateHostText(current, workInProgress);
      break;
    }
  }
}
```

以 `updateHostRoot` 为例，最终 `switch (workInProgress.tag) case` 方法都会调用 `reconcileChildren` 方法

```js
// 主要做的是获取 nextState.element;然后调用 reconcileChildren方法
function updateHostRoot(current, workInProgress, renderExpirationTime) {
  // 客户端渲染走 else
  // 构建子节点 fiber 对象
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime
  );
  // 返回子节点 fiber 对象
  return workInProgress.child;
}
```

`reconcileChildren` 方法根据渲染还是更新最终调得方法都是`ChildReconciler`

```js
// 用于更新
export const reconcileChildFibers = ChildReconciler(true);
// 用于初始渲染
export const mountChildFibers = ChildReconciler(false);
```

```js
function ChildReconciler(shouldTrackSideEffects) {
  // 处理子元素是单个对象的情况
  function reconcileSingleElement(... ) {
    while (child !== null) {
        const existing = useFiber(child, element.props);
        existing.ref = coerceRef(returnFiber, child, element);
        existing.return = returnFiber;
        return existing;

      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
      // 根据 React Element 创建 Fiber 对象
      // 返回创建好的 Fiber 对象
      const created = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      );
      // 添加 ref 属性 { current: DOM }
      created.ref = coerceRef(returnFiber, currentFirstChild, element);
      // 添加父级 Fiber 对象
      created.return = returnFiber;
      // 返回创建好的子 Fiber
      return created;
  }

  ...省略一批类似deleteChild  reconcileSingleElement的方法...




  function reconcileChildFibers(... ) {
    if (isObject) {
      // 匹配子元素的类型
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 返回创建好的子 Fiber
          return placeSingleChild(
            // 处理单个 React Element 的情况
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              expirationTime,
            ),
          );
      }
    }
    // 处理 children 为文本和数值的情况 return "App works"
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          // 如果 newChild 是数值, 转换为字符串
          '' + newChild,
          expirationTime,
        ),
      );
    }

    // children 是数组的情况
    if (isArray(newChild)) {
      // 返回创建好的子 Fiber
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      );
    }
  return reconcileChildFibers;
}
```

```js
function updateClassComponent() {
  // 构造方法
  if (instance === null) {
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime
    );
    shouldUpdate = true;
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime
    );
  } else {
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime
    );
  }
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderExpirationTime
  );
  return nextUnitOfWork;
}
```

##### 总结

主要两个方法 updateHostComponent 和 updateClassComponent

updateClassComponent 最终会将 nextChildren 赋值为`nextChildren = instance.render()`
以满足继续循环构建子 fiber
updateClassComponent 普通标签 最终会根据类型判断 `nextChildren`是`returnFiber`还是`sibling`

1. 首先是构建 root 标签，传进去的是 root 标签的 fiber，构建完后返回 child 即 render 的第一个参数 App 组件的 fiber，
2. 传进去 app 组件的 fiber，通过` nextChildren = instance.render();`构建 reconcileChildren 传入 nextChildren 构建 App 组件的 render 方法。里面的 div 组件

3. 传进来的是普通的 div 标签 于是在 beginWork 会调用 updateHostComponent 5 来构建 通过 `nextProps.children;`获取子元素。

```js
const nextProps = workInProgress.pendingProps;
const prevProps = current !== null ? current.memoizedProps : null;

let nextChildren = nextProps.children;
```

#### `completeUnitOfWork` 从子到父的 `归` 阶段

##### completeWork

```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime
): Fiber | null {
  // 获取待更新 props
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    // 0
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      return null;
    }
    // 3
    case HostRoot: {
     ...
    }
    // 5
    case HostComponent: {
      popHostContext(workInProgress);
      // 获取 rootDOM 节点 <div id="root"></div>
      const rootContainerInstance = getRootHostContainer();
      // 节点的具体的类型 div span ...
      const type = workInProgress.type;
      // 初始渲染不执行 current = null
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance
        );
        if (enableDeprecatedFlareAPI) {
          const prevListeners = current.memoizedProps.DEPRECATED_flareListeners;
          const nextListeners = newProps.DEPRECATED_flareListeners;
          if (prevListeners !== nextListeners) {
            markUpdate(workInProgress);
          }
        }

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        const currentHostContext = getHostContext();
        let wasHydrated = popHydrationState(workInProgress);
        // 服务器渲染相关 初始渲染为不执行
        // false
        if (wasHydrated) {
          // TODO: Move this and createInstance step into the beginPhase
          // to consolidate.
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext
            )
          ) {
            // If changes to the hydrated node need to be applied at the
            // commit-phase we mark this as such.
            markUpdate(workInProgress);
          }
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance
              );
            }
          }
        } else {
          // 创建节点实例对象 <div></div> <span></span>
          let instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress
          );
          /**
           * 将所有的子级追加到父级中
           * instance 为父级
           * workInProgress.child 为子级
           */
          appendAllChildren(instance, workInProgress, false, false);

          // 为 Fiber 对象添加 stateNode 属性
          workInProgress.stateNode = instance;
          // 初始渲染不执行
          // false
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance
              );
            }
          }

          // 初始渲染不执行
          if (
            finalizeInitialChildren(
              instance,
              type,
              newProps,
              rootContainerInstance,
              currentHostContext
            )
          ) {
            markUpdate(workInProgress);
          }
        }
        // 处理 ref DOM 引用
        if (workInProgress.ref !== null) {
          // If there is a ref on a host node we need to schedule a callback
          markRef(workInProgress);
        }
      }
      return null;
    }
    // 6
    case HostText: {
      let newText = newProps;
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress);
          }
        } else {
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress
          );
        }
      }
      return null;
    }
    // .........省略其他组件判断......
    case Block:
      if (enableBlocksAPI) {
        return null;
      }
      break;
  }
}
```

// 创建节点实例对象 <div></div> <span></span>
createInstance(

updateHostComponent 中会调用 diffProperties

### commit 阶段

#### 第一个阶段 DOM `修改前` commitBeforeMutationEffects

生命周期方法
`getSnapshotBeforeUpdate`

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

#### commit DOM `修改后` 的第三个阶段

生命周期方法
componentDidMount
componentDidUpdate

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

### 函数组件 Hooks

初次渲染 performUnitOfWork->beginWork->updateFunctionComponent->renderWithHooks

beginWork `case FunctionComponent` 中调用`renderWithHooks(位于ReactFiberHooks)` 至此 hook 和 fiber 关联起来了

```js
// Hooks被存储在fiber.memoizedState 链表上
let currentHook: Hook | null = null; // currentHook = fiber(current).memoizedState

let workInProgressHook: Hook | null = null; // workInProgressHook = fiber(workInProgress).memoizedState

// 当前正在构造的fiber, 等同于 workInProgress, 为了和当前hook区分, 所以将其改名
let currentlyRenderingFiber;
function renderWithHooks(current, workInProgress, Component, props) {
  // --------------- 1. 设置全局变量 标记渲染优先级和当前fiber, 清除当前fiber的遗留状态 -------------------
  renderLanes = nextRenderLanes; // 当前渲染优先级
  currentlyRenderingFiber = workInProgress; // 当前fiber节点, 也就是function组件对应的fiber节点

  // 清除当前fiber的遗留状态
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

  // --------------- 2. 调用function,生成子级ReactElement对象，构造出Hooks链表-------------------
  // 指定dispatcher, 区分mount和update
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;
  // 执行function函数, 其中进行分析Hooks的使用
  let children = Component(props, secondArg);

  // ----------- 3. 重置全局变量,并返回 children， 保证不同的function节点在调用时renderWithHooks互不影响-------------------
  // 执行function之后, 还原被修改的全局变量, 不影响下一次调用
  renderLanes = NoLanes;
  currentlyRenderingFiber = (null: any);

  currentHook = null;
  workInProgressHook = null;
  didScheduleRenderPhaseUpdate = false;

  // ReactCurrentDispatcher.current =
  // ContextOnlyDispatcher; /* 将hooks变成第一种，防止hooks在函数组件外部调用，调用直接报错。 */

  return children;
}
```

1. 每个 hooks 内部读取的就是 currentlyRenderingFiber 的内容 即函数组件的 fiber 信息
2. memoizedState ： 类组件保存 state 信息，函数组件保存 hooks 信息。
3. hooks 对象本质上是主要以三种处理策略存在 React 中
   - ContextOnlyDispatcher 防止开发者在函数组件外部调用 hooks ，所以第一种就是报错形态
   - HooksDispatcherOnMount 函数组件初始化 mount
   - HooksDispatcherOnUpdate 函数组件的更新
4. React hooks 都是从 ReactCurrentDispatcher.current 中的， React 就是通过赋予 current 不同的 hooks 对象达到监控 hooks 是否在函数组件内部调用。
5. Component ( props ， secondArg ) 这个时候函数组件被真正的执行，里面每一个 hooks 也将依次执行。

Hooks 的第一个核心原理：闭包，是的 Hooks 返回的 state 和 setState 方法，在 hooks 内部都是利用闭包实现的

#### 初次构造

上面第二阶段开始调用 function 中共使用到的 hook 方法如 useState useEffect 等

而 useState, useEffect 在 fiber 初次构造时分别对应 mountState 和 mountEffect->mountEffectImpl

```js
function mountState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  // 1. 创建hook
  const hook = mountWorkInProgressHook();
  if (typeof initialState === "function") {
    initialState = initialState();
  }
  // 2. 初始化hook的属性
  // 2.1 设置 hook.memoizedState/hook.baseState
  // 2.2 设置 hook.queue
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    // queue.lastRenderedReducer是内置函数
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  // 2.3 设置 hook.dispatch
  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch =
    (dispatchAction.bind(null, currentlyRenderingFiber, queue): any));

  return [hook.memoizedState, dispatch];
}

function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = mountWorkInProgressHook();
  // ...省略部分本节不讨论
}

function mountReducer(reducer, initialArg, init) {
  // 1. 创建hook
  const hook = mountWorkInProgressHook();
  let initialState;
  if (init !== undefined) {
    initialState = init(initialArg);
  } else {
    initialState = ((initialArg: any): S);
  }
  // 2. 初始化hook的属性
  // 2.1 设置 hook.memoizedState/hook.baseState
  hook.memoizedState = hook.baseState = initialState;
  // 2.2 设置 hook.queue
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    // queue.lastRenderedReducer是由外传入
    lastRenderedReducer: reducer,
    lastRenderedState: (initialState: any),
  });
  // 2.3 设置 hook.dispatch
  const dispatch: Dispatch<A> = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ): any));

  // 3. 返回[当前状态, dispatch函数]
  return [hook.memoizedState, dispatch];
}
```

mountReducer 和 mountState 唯一的不同点是 hook.queue.lastRenderedReducer:
mountState 使用的是内置的 basicStateReducer , mountReducer 用的是传进去的 reducer

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === "function" ? action(state) : action;
}
```

useState 就是对 useReducer 的基本封装, 内置了一个特殊的 reducer

```js
const [state, dispatch] = useState({ count: 0 });

// 等价于
const [state, dispatch] = useReducer(
  function basicStateReducer(state, action) {
    return typeof action === "function" ? action(state) : action;
  },
  { count: 0 }
);
```

无论 useState, useEffect, 内部都通过 mountWorkInProgressHook 创建一个 hook.

```js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };

  if (workInProgressHook === null) {
    // 链表中首个hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 将hook添加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

创建 Hook 按照调用顺序存储在 fiber.memoizedState 上, 多个 Hook 以链表结构保存.

#### 更新

updateFunctionComponent->renderWithHooks 时再次调用 function

接下来调用 function, 同样依次调用所有 hooks. 而 useState, useEffect 在 fiber 对比更新时分别对应
`updateState->updateReducer`
和`updateEffect->updateEffectImpl`

1. 调用 updateWorkInProgressHook 获取 workInProgressHook 对象
2. 链表拼接: 将 hook.queue.pending 拼接到 current.baseQueue
3. update 优先级不够: 加入到 baseQueue 中, 等待下一次 render
   update 优先级足够: 状态合并
   更新属性

```js
// ----- 状态Hook --------
function updateReducer(reducer, initialArg, init): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  queue.lastRenderedReducer = reducer;
  const current: Hook = (currentHook: any);
  let baseQueue = current.baseQueue;

  // 2. 链表拼接: 将 hook.queue.pending 拼接到 current.baseQueue
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  // 3. 状态计算
  if (baseQueue !== null) {
    const first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;

    do {
      const updateLane = update.lane;
      // 3.1 优先级提取update
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // 优先级不够: 加入到baseQueue中, 等待下一次render
        const clone: Update<S, A> = {
          lane: updateLane,
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: (null: any),
        };
        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        );
        markSkippedUpdateLanes(updateLane);
      } else {
        // 优先级足够: 状态合并
        if (newBaseQueueLast !== null) {
          // 更新baseQueue
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: (null: any),
          };
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        if (update.eagerReducer === reducer) {
          // 性能优化: 如果存在 update.eagerReducer, 直接使用update.eagerState.避免重复调用reducer
          newState = ((update.eagerState: any): S);
        } else {
          const action = update.action;
          // 调用reducer获取最新状态
          newState = reducer(newState, action);
        }
      }
      update = update.next;
    } while (update !== null && update !== first);

    // 3.2. 更新属性
    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = (newBaseQueueFirst: any);
    }
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }
    // 把计算之后的结果更新到workInProgressHook上
    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;
    queue.lastRenderedState = newState;
  }

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
// ----- 副作用Hook --------
function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = updateWorkInProgressHook();
  // ...省略部分本节不讨论
}
```

最终都会调用 `updateWorkInProgressHook`

```js
function updateWorkInProgressHook(): Hook {
  // 1. 移动currentHook指针
  let nextCurrentHook: null | Hook;
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  // 2. 移动workInProgressHook指针
  let nextWorkInProgressHook: null | Hook;
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    // 渲染时更新: 本节不讨论
  } else {
    currentHook = nextCurrentHook;
    // 3. 克隆currentHook作为新的workInProgressHook.
    // 随后逻辑与mountWorkInProgressHook一致
    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,

      next: null, // 注意next指针是null
    };
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }
  return workInProgressHook;
}
```

updateWorkInProgressHook 函数逻辑简单: 目的是为了让 currentHook 和 workInProgressHook 两个指针同时向后移动.
以双缓冲技术为基础, 将 current.memoizedState 按照顺序克隆到了 workInProgress.memoizedState 中.
Hook 经过了一次克隆, 内部的属性(hook.memoizedState 等)都没有变动, 所以其状态并不会丢失.

总结

> function 类型的 fiber 节点, 它的处理函数是 updateFunctionComponent, 其中再通过 renderWithHooks 调用 function.在 function 中, 通过 Hook Api(如: useState, useEffect)创建 Hook 对象.状态 Hook 实现了状态持久化(等同于 class 组件维护 fiber.memoizedState).副作用 Hook 则实现了维护 fiber.flags,并提供副作用回调(类似于 class 组件的生命周期回调).多个 Hook 对象构成一个链表结构, 并挂载到 fiber.memoizedState 之上.fiber 树更新阶段, 把 current.memoizedState 链表上的所有 Hook 按照顺序克隆到 workInProgress.memoizedState 上, 实现数据的持久化.

dispatchAction

```js
function dispatchAction(fiber, queue, action) {
  // 1. 创建update对象
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(fiber); // Legacy模式返回SyncLane
  const update = {
    lane,
    action,
    eagerReducer: null,
    eagerState: null,
    next: (null: any),
  };

  // 2. 将update对象添加到hook.queue.pending队列
  const pending = queue.pending;
  if (pending === null) {
    // 首个update, 创建一个环形链表
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  const alternate = fiber.alternate;
  if (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ) {
    // 渲染时更新, 做好全局标记
    didScheduleRenderPhaseUpdateDuringThisPass =
      didScheduleRenderPhaseUpdate = true;
  } else {
    // 下面这个if判断, 能保证当前创建的update, 是`queue.pending`中第一个`update`.

    //  queue.pending中只包含当前update时, 即当前update是queue.pending中的第一个update
    // 直接调用queue.lastRenderedReducer,计算出update之后的 state, 记为eagerState
    // 如果eagerState与currentState相同, 则直接退出, 不用发起调度更新.
    // 已经被挂载到queue.pending上的update会在下一次render时再次合并.

    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        let prevDispatcher;
        const currentState: S = (queue.lastRenderedState: any);
        const eagerState = lastRenderedReducer(currentState, action);
        // 暂存`eagerReducer`和`eagerState`, 如果在render阶段reducer==update.eagerReducer, 则可以直接使用无需再次计算
        update.eagerReducer = lastRenderedReducer;
        update.eagerState = eagerState;
        if (is(eagerState, currentState)) {
          // 快速通道, eagerState与currentState相同, 无需调度更新
          // 注: update已经被添加到了queue.pending, 并没有丢弃. 之后需要更新的时候, 此update还是会起作用
          return;
        }
      }
    }
    // 3. 发起调度更新, 进入`reconciler 运作流程`中的输入阶段.
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}
```

将 update 对象添加到 hook.queue.pending 环形链,发起调度更新: 调用 scheduleUpdateOnFiber, 进入 reconciler 运作流程中的输入阶段.

scheduleUpdateOnFiber --->performSyncWorkOnRoot---> workLoop--> beginWork --- updateFunctionComponent--->执行 `let children = Component(props, secondArg);`Component 方法
方法，----> updateState ---> updateReducer

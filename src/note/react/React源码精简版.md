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

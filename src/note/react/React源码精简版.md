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

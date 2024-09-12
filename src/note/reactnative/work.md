AzFarmersModal/getFarmerList

[
{"farmersList": [{}], "initials": "#"},
{"farmersList": [{}, {}, {}, {}, {}], "initials": "A"}, {"farmersList": [{}, {}, {}, {}, {}], "initials": "B"}
]

```js
if (ref.current && ref.current.measureLayout) {
  ref.current.measureLayout(scrollViewRef.current, (x, y) => {
    scrollViewRef.current.scrollTo({ x: 0, y, animated: true });
  });
}
```

measureLayout 方法通常用于测量一个视图相对于另一个视图的位置。在这个例子中，它测量了由 ref.current 表示的视图相对于 scrollViewRef.current 的位置。
测量完成后，会调用传入的回调函数，该回调函数接收两个参数 x 和 y，分别表示测量的视图在父视图中的横坐标和纵坐标。

react-native-linear-gradient

```js
<LinearGradient
  colors={["#FF0000", "#00FF00", "#0000FF"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  {/* 这里放置你想要应用渐变效果的内容 */}
</LinearGradient>
```

colors：一个数组，包含了渐变的颜色值。可以是十六进制颜色代码、RGB 颜色值等。
start：一个对象，包含 x 和 y 属性，定义了渐变的起始点。取值范围为 0 到 1，表示相对于组件的宽度和高度的比例。
end：与 start 类似，定义了渐变的结束点。

```js
"react-native-calendars": "^1.1305.0",
"react-native-drawer-layout": "^3.3.0",
"react-native-gesture-handler": "^2.16.2",
"react-native-global-props": "^1.1.5",
"react-native-keyboard-aware-scroll-view": "^0.9.5",
"react-native-paper": "^5.12.3",
"react-native-reanimated": "^3.12.1",
"react-native-safe-area-context": "^4.10.4",
"react-native-screens": "^3.31.1",
"react-native-shadow-2": "7.1.0",
"react-native-svg": "12.1.1",
"react-native-update": "^10.6.0",
"react-native-webview": "13.8.6",
```

Modal 和 Portal 效果一致

```js
// <Modal animationType='slide' transparent={true} visible={open}>
// </Modal>

<Portal></Portal>
```

项目中使用如下形式 dismiss 弹框，性能上比用 visible 要好一些

```js
if (!visible) return null;
```

## 扩展

### 1. 对于复杂的弹框可以考虑动态导入

```js
import React, { useState, useEffect } from "react";
const ModalComponent = () => {
  const [visible, setVisible] = useState(false);
  const [complexComponent, setComplexComponent] = useState(null);

  useEffect(() => {
    if (visible) {
      // 当visible即将变为true时，动态导入组件
      import("./ComplexModalContent.js").then((module) => {
        setComplexComponent(module.default);
      });
    } else {
      setComplexComponent(null);
    }
  }, [visible]);

  return (
    <Modal visible={visible}>{complexComponent && <complexComponent />}</Modal>
  );
};
```

或者用`Suspense`加上` React.lazy`

```js
import React, { Suspense, useState } from "react";
const LazyComplexModalContent = React.lazy(() =>
  import("./ComplexModalContent.js")
);

const ModalComponent = () => {
  const [visible, setVisible] = useState(false);

  return (
    <Modal visible={visible}>
      {visible && (
        <Suspense fallback={<Text>Loading...</Text>}>
          <LazyComplexModalContent />
        </Suspense>
      )}
    </Modal>
  );
};
```

### 重复渲染的逻辑优化

React 是一个高度遵循 FP（函数编程）的框架，其核心逻辑就是 UI = fn(props & state)，这里的 fn 就是组件， React 的设计初期，就是希望组件（树）是一个纯函数
组件的输出完全由输入决定，不会受到任何外部因素的影响

对于 classComponent 本质还是 render 函数，实例 instance 对象用来存储 state 和 props 的

render phase，这个阶段是纯粹的 JS 执行过程，不涉及任何的 DOM 操作，在 React 中，一旦 Virtual Dom diff 的结果确定， 进入 commit phase 之后，任务就无法再被打断，而且 commit 的内容是固定的，所以基本也没有什么优化空间，所以围绕 React 性能优化的话题，基本上都是再 render phase 展开

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

反向继承

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

条件渲染

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

修改返回的 react 结构

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

```js
import fetchMovieListByType from 'xx'
import
```

```js
const withFetchingHoc = ()
```

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

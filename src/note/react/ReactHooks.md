## React Hooks介绍
> 对函数组件增强，可以存储状态，处理副作用的能力
> 让函数组件可以实现类组件相同功能

### 为什么要使用hooks

- 类组件缺少逻辑复用
- 相同逻辑分布在多个生命周期中
- 同一个生命周期存在不同逻辑代码
- 类组件要考虑this指向，hooks不用


缺点，相对于class组件

**`重要` :每次数据更新，定义在方法组件中的变量函数都会重新定义**
真是因为有这个缺点导致专门实现了缓存变量的的钩子 useRef
和缓存方法的钩子useCallback
后面会详细介绍

## 使用

### 钩子函数
#### useState(parameter) 引入state状态
> 唯一参数，设置默认值, parameter可以为任意类型包含函数。 
> 只会执行一次，而组件定义的变量每次都运行，所以尽量都放在parameter形式直接赋值
```typescript

const [count, setCount] = useState(0)
// 对象
const [person, setPerson] = useState({name: '张三', age: 23})


function increase() {
    // 回调函数的参数就是 原来的count的值
    setCount(count => { 
        return count + 1
    })
}
```

注意 setState（setCount） 是异步的

#### useReducer()函数
> 也是让组件保存状态的，
> 主要用在是子组件想改变父组件状态的值，我们可以直接传递dispatch就可以更改，
> 而不像类组件传递方法

使用，参见useContext使用的App组件

#### useContext()
> 跟类组件context使用方法一致
```typescript
import React, {createContext, useContext} from 'react';
// 1. 定义context
const countContext = createContext()
// 2. 父类provider 想要共享给所有子类的数据  <countContext.Provider value={count}>
function App() {
    function reducer (state, action) {
        switch (action.type) {
            case 'increment':
                return state + 1;
            case 'decrement':
                return state - 1;
            default:
                return state;
        }
    }
    const [count, dispatch] = useReducer(reducer, 0);
    return (
        <countContext.Provider value={count}>
        {count}
        <Header/>
        <button onClick={() => dispatch({type: 'increment'})}>+1</button>
        <button onClick={() => dispatch({type: 'decrement'})}>-1</button>
    </countContext.Provider>
)}


// 4. useContext获取数据
function Header() {
    const count = useContext(countContext)
    return (
        <div>count: {count}</div>
)
}
```





#### useEffects()
> 看做三个生命周期函数的集合  
> componentDidMount ： 挂载组件，页面显示只会调一次
> 
> componentDidUpdate ： 页面使用到的数据变更，都会执行
> 
> componentWillUnmount ： 卸载组件

```typescript
useEffect(() => {}) =>   componentDidMount, 第二个参数没有指定相当于所有参数变更都执行即 === componentDidUpdate
useEffect(() => {}, []) => componentDidMount  第二个参数为空，任何参数变更都不会执行 即componentDidUpdate不可能执行
useEffect(() => () => {}) => componentWillUnMount 返回的方法体就是组件卸载的时候会走
```


##### 指定参数变更才会执行componentDidUpdate
第二个参数限定，指定参数变更componentDidUpdate才会执行，不设置第二个参数，则默认所有参数变更都会执行
```typescript
useEffect(() => {
    // componentDidMount 和 componentDidUpdate都会执行
})

用第二个参数

useEffect(() => {
    // componentDidMount 和 count变更才会执行componentDidUpdate
}, [count])




useEffect(() => {
    // componentDidMount 和 count变更才会执行componentDidUpdate
    
    // 返回一个函数，函数体就是componentWillUnMount
    return () => {
        //componentWillUnMount
    }
}, [count])
```


useEffect 可以多次调用，不同逻辑可以单独写一个useEffect
简化重复代码

##### 执行异步操作
需用函数自执行方式
```typescript
useEffect(() => {
    (async () => {
        await requestData()
    })()
})
```


#### useMemo()
> 相当于vue的computed 也和mobx中的computed类似

> 简单说就是如果某个(或多个）变量变化，会根据次变量计算一个新值返回
> 发散： class组件render函数前面的逻辑代码可以放在其中，减少执行次数。


```typescript
const newValue = useMemo(() => {
    return result
}, [count]) // 第二个参数变更就是引起改方法执行的因素
```

##### memo方法
> 类组件中的pureComponent 和 shouldComponentUpdate 即React自动判断 如果参数没变化，则不重新渲染组件

```typescript
function Counter() {
    
}

export default memo(Counter)

```
#### useCallback()
> 性能优化, 缓存函数, 使组件重新渲染时得到相同的函数实例.
> 因为方法定义在方法组件里面，当组件渲染的时候，方法重新实例化，导致两次的方法不是一致的
> 

```javascript
function App() {
    const [count, setCount] = userState(0);
    // 每次count变化  resetCount都跟上次的不一致，导致渲染了Header组件。
    const resetCount = () => {
      setCount(0);
  }
  return (
      <countContext.Provider value={count}> 
          {count}
        <Header resetCount={resetCount}/>
        <button onClick={() => dispatch({type: 'increment'})}>+1</button>
        <button onClick={() => dispatch({type: 'decrement'})}>-1</button>
      </countContext.Provider>
)}

const Header = memo(function Header(props) {
  const count = useContext(countContext)
  return (
      <div>
          count: {count}
          <div onClick={props.resetCount}>清空count</div>
      </div>
      
  )
})
```

将resetCount函数改造如下，就可以保证每次得到的方法实例是一致的
```javascript
const resetCount = useCallback(() => {
    setCount(0);
},[setCount]) // 同样第二个参数是setCount函数变化才会重新实例化resetCount
```



#### useRef()
##### 1. 获取dom
>useRef()=== createRef()
> 

使用
```javascript
const inputRef = useRef()
<input ref={inputRef}/>
```

##### 2. 缓存数据
> 方法组件方便的同时也造成了不便，就是每次数据更新，定义的变量函数都会重新定义。

```javascript
function App() {
    const [count, setCount] = userState(0);
    const timerId = null
    // 组件挂载后启动定时器每秒加一
    useEffect(() => {
        timerId = setInterval(() => {
            setCount(count => count + 1)
        }) 
    }, [])
    
    const stopInterval = () => {
        // 永远都停不下来，因为count变化timerId重新赋值null 永远清空不了
        clearInterval(timerId)
    }
  return (
      <countContext.Provider value={count}> 
          {count}
        <button onClick={stopInterval}>-1</button>
      </countContext.Provider>
)}
```

解决方法

```javascript
// 1. 用useRef() 来定义timerId
let timerId = useRef();
//2. 赋值和取值的时候用timerId.current
useEffect(() => {
    timerId.current = setInterval(() => {
        setCount(count => count + 1)
    })
}, [])
const stopInterval = () => {
    clearInterval(timerId.current)
}
```



## 自定义Hook函数
> 为了在组件之间实现逻辑共享，我们可以自定义hook,实际就是逻辑和内置hook的组合
> 就是一个函数，名称以use开头
其实很容易
>

```javascript
/**
 *  自定义hook，在组件加载的时候获取appInfo信息
 * @returns {*[]}
 */
function useAppInfo() {
  const [appInfo, setAppInfo] = useState({})
  useEffect(()=> {
    const info = JSON.parse(localStorage.getItem('appInfo')|| "{}")
    setAppInfo(appInfo)
  }, [])
  
  return [appInfo, setAppInfo]

}

// 使用
const [appInfo, setAppInfo] = useAppInfo()
```

input组件封装 onChange方法和value值

```javascript
function useUpdateInput(initialValue) {
    const [value, setValue] = useState(initialValue);
    return {
        value, 
        onChange: event => setValue(event.target.value)
    }
}

// 使用
function FormTest() {
    const useNameInput = useUpdateInput('')
    const submitForm = event => {
        console.log(useNameInput.value)
    }
    return <form onsubmit={submitForm}>
            <input {...useNameInput}/>
        </form>
}
<input type="text" name="useName" />
```

## 路由的Hooks
安装包 react-router-dom
```javascript
import {useHistory, useLocation, useRouterMatch, useParams}  from 'react-router-dom'
const history = useHistory()
```





#复杂逻辑useState中传函数
// 这个函数只在初始渲染时执行一次，后续更新状态重新渲染组件时，该函数就不会再被调用
function getInitState(){
return {number:props.number};
}
let [counter,setCounter] = useState(getInitState);
。

setState是异步的。



### 子组件除了用React.memo包裹组件外。传递给子组件的对于高开销的值用useMemo 方法要用useCallback 。低开销不要用，因为缓存函数本身也耗费性能
```typescript
const Parent = () => {
const [visible, setVisible] = useState(false);
const [visible2, setVisible2] = useState(false);
return (
<>
<Child1 visible={visible} />
<Child2 visible={visible2} />
</>
)
}
```


### hook定义顺序一定要保持不变，不能用条件判断来定义hook
```typescript
if(value) {
    const [state, setState] = useState(0)
}
```
### useEffect中调用函数，要在useEffect里面声明并调用
保证useEffect依赖的变量一目了然。

### setState的时候用到了原来的state一定要用函数
因为极有可能造成闭包陷阱
```typescript
    const [state, setState] = useState(0)
    setState(state + 1) // 容易闭包陷阱
```
```typescript
    setState(state => state + 1) // 容易闭包陷阱
```


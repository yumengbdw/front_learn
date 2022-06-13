# Redux 核心概念

view --> action --> reducer --> store --> view
![img.png](img.png)



我们以加减count为例，接受使用方法
```javascript
// 2. 创建reducer
/**
 * @params state : 对象{} store 里面的所有变量 此例子里面只有一个变量count { count: 0 } 所以要给state一个默认值
 * @params action： { type : '', payload: {}} action 有两个参数，type 和传参payload
 * 
 * */
function reducer(state = { count: 0 }, action){
    switch (action) {
        case 'increment':
            return {...state, count: count + action.payload.tick};
        default:
            return state
    }
    
}
// 1. 首先创建store
const store = Redux.createStore(reducer)

// 3. 创建action,
const inscrement5 = {type: 'increment', payload: { tick: 5}}
const decrement5 = {type: 'increment', payload: { tick: -5}} // 传参 -5相当于减去（decrement）tick的功能

// 4. dispatch 发送action
document.getElementById('plus').onclick = function () {
    store.dispatch(inscrement5);
}

document.getElementById('mimus').onclick = function () {
    store.dispatch(decrement5);
}

// 5. 订阅 store
store.subscribe(() => {
    // 获取store对象中存储的状态
    const{ count } =  store.getState()
    document.getElementById('count').innerHTML = count;
})

```
1. component组件dispatch
```javascript
// 创建 store 传参数reducer
var store = Redux.createStore(reducer);
store.dispatch(action)
```
2. Store 接收 Action 并将 Action 分发给 Reducer
3. reducer根据action的type写逻辑代码,然后将更改后的state返回给store
4. 组件订阅变量的状态，走订阅方法


function createStore(reducer, preloadedState, enhancer) {
    if (typeof reducer !== 'function') throw new Error("reducer必选是函数")
    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') throw new Error("enhancer必须是函数")

        return enhancer(createStore)(reducer, preloadedState)
    }

    var currentState = preloadedState
    var currentListeners = []

    function getState() {
        return currentState
    }

    function dispatch(actions) {
        // 判断action为对象

        if (!isPlainObject(actions)) {
            throw new Error("actions must be object")
        }

        if (!actions.type) {
            throw new Error("actions must have type")
        }
        // 遍历listener
        currentState = reducer(currentState, actions)
        for (let index = 0; index < currentListeners.length; index++) {
            currentListeners[index]()

        }
    }

    function subscribe(listeners) {
        currentListeners.push(listeners)
    }

    return {
        subscribe,
        dispatch,
        getState
    }

}


//  enhancer(createStore)(reducer, preloadedState)
function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer, preloadedState) {
            const store = createStore(reducer, preloadedState)

            const middlewareAPI = {
                getState: store.getState,
                dispatch: store.dispatch
            }
            const chain = middlewares.map(middleware => middleware(middlewareAPI))

            const dispatch = compose(...chain)(store.dispatch)

            return {
                ...store,
                dispatch
            }
        }
    }

}

function compose() {
    const funcs = [...arguments]

    return function (dispatch) {
        for (var i = funcs.length - 1; i >= 0; i--) {
            dispatch = funcs[i](dispatch);
        }
        return dispatch;

    }
}


function combineReducers(reducers) {
    //因为返回的是函数必须在调用combineReducers就判断类型错误
    for (const [key, reducerItem] of Object.entries(reducers)) {
        if (typeof reducerItem !== "function") {
            throw new Error(" reducers must be function")
        }
    }

    // dispatch中调用reducer会保存最新的状态，
    return function (state, action) {
        let nextState = {}
        for (const [key, reducerItem] of Object.entries(reducers)) {
            const currentState = state[key]
            nextState[key] = reducerItem(currentState, action)
        }
        return nextState
    }

}

//actionObj[INCREMENT]()
function bindActionCreators(actionCreators, dispatch) {
    let actionObj = {}
    for (const [key, value] of Object.entries(actionCreators)) {
        (function (key) {
            actionObj[key] = function () {
                dispatch({ type: value })
            }
        })(key)
    }
    return actionObj

}



// 判断参数是否是对象类型
// 判断对象的当前原型对象是否和顶层原型对象相同
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;
    // while (Object.getPrototypeOf(proto) != null) {
    //     proto = Object.getPrototypeOf(proto)
    // }
    // return Object.getPrototypeOf(obj) === proto;

    return Object.prototype = Object.getPrototypeOf(obj)
}
vuex 3.4

## `Vue.use(Vuex)`做了啥

```js
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | any) {
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []);
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters
    const args = toArray(arguments, 1);
    args.unshift(this);
    if (isFunction(plugin.install)) {
      plugin.install.apply(plugin, args);
    } else if (isFunction(plugin)) {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };
}
```

关键代码

```js
args.unshift(this);
if (isFunction(plugin.install)) {
  plugin.install.apply(plugin, args);
} else if (isFunction(plugin)) {
  plugin.apply(null, args);
}
```

1.  args.unshift(this) 将 vue 对象放进参数 args 里面

2.  判断 plugin.install 是不是方法，vuex 中有 install 方法，所以会执行

` plugin.install.apply(plugin, args)`

## `this.$store`为什么所有页面都能直接使用

然后执行 vuex 中的 install 方法

```js
export function install(_Vue) {
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error(
        "[vuex] already installed. Vue.use(Vuex) should be called only once."
      );
    }
    return;
  }
  Vue = _Vue;
  applyMixin(Vue);
}
```

这段代码做了

1.  将 vue 对象存起来 `Vue = _Vue ` 、
2.  `applyMixin(Vue)`将 store 对象绑定到 vue 上使得我们可以在页面直接使用 this.$store

applyMixin 类的代码

```js
export default function (Vue) {
  Vue.mixin({ beforeCreate: vuexInit });
  function vuexInit() {
    const options = this.$options;
    // store injection
    if (options.store) {
      this.$store =
        typeof options.store === "function" ? options.store() : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
}
```

可以看到用 mixin 拦截 beforeCreate 生命周期方法然后判断 options 的对象是否有 store 有就证明是根页面，赋值 this.$store
不过不是就在parent页面找$store 对象，找到后子页面的 赋值 this.$store

扩展 options 是什么呢

```js
new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
```

其实就是我们 new Vue 传进去的对象即

```js {
  store,
  render: h => h(App),
}
```

### vuex 4.x 怎么做的

```js

  install (app, injectKey) {
    //Composition API  不依赖 this 上下文共享数据
    app.provide(injectKey || storeKey, this)
    // 使用Options API编写的可以直接this.$store获取
    app.config.globalProperties.$store = this

    const useDevtools = this._devtools !== undefined
      ? this._devtools
      : __DEV__ || __VUE_PROD_DEVTOOLS__

    if (useDevtools) {
      addDevtools(app, this)
    }
  }




```

整个源码就这两句代码

#### app.provide

app.provide 方法是 Vue 3 的 Composition API 的一部分，用于在应用的根级别提供可注入的依赖，这些依赖可以在组件树中的任何组件里被注入和使用。这是一种实现依赖注入的方法，允许开发者在顶层提供数据或服务，并在需要的地方通过 inject 函数接收这些数据或服务。

```js
// 在 main.js 或类似的入口文件
const app = createApp(App);
app.provide("someKey", someValue);
app.mount("#app");
```

使用

````js
import { inject } from 'vue';

export default {
  setup() {
    const someInjectedValue = inject('someKey');
    return { someInjectedValue };
  }
};```



## state中的变量怎么做到可观测的、

```js


function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

````

````js
 Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })```


Vue.observable() 是vue2.6才有的方法，所以为了兼容才用new vue来实现可观测的

reactive在vue3中才有，


其他源码很简单，大致是写dispatch commit的api完善调用方法后执行对应的module方法。从而更改state的目的










pinia中同理也是


  ```js
 // 把pinia注入到app中
 app.provide(piniaSymbol, pinia)
// 设置全局变量$pinia，以便获取
app.config.globalProperties.$pinia = pinia
````

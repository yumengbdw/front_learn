## 题目

1. Vue 的父组件和子组件生命周期钩子函数执行顺序？
   - 在哪个生命周期内调用异步请求？
   - 父组件如何监听子组件生命周期？
   - setup 和 created 谁先执行？
   - setup 中为什么没有 beforeCreate 和 created？
2. keep-alive 的了解
3. 组件中 data 为什么是一个函数？
4. v-model 的原理
5. Vue，react 组件间通信有哪几种方式？
6. vuex 原理
7. vue-router
8. Vue 如何找入口文件，首次渲染流程
9. Vue 是如何实现数据双向绑定的？
10. Vue 框架怎么实现对象和数组的监听
11. Proxy 与 Object.defineProperty 优劣对比
12. vue $set $nextTick $delete $watcher 等实现原理
13. 虚拟 DOM 原理，优点 key 作用
14. v-if 和 v-for 哪个优先级更高？
15. Vue 中如何扩展一个组件
16. Vue 权限管理，页面权限以及按钮权限
17. vue3 新特性
18. keepAlive
19. 从 0 到 1 自己构架一个 vue 项目，说说有哪些步骤、哪些重要插件、目录结构你会怎么组织

vue 优化 react 优化

SSR

## 解答

### 1. Vue 的父组件和子组件生命周期钩子函数执行顺序......

- 父组件和子组件生命周期钩子函数执行顺序？

  父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted

  子组件更新过程

  父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

  父组件更新过程

  父 beforeUpdate -> 父 updated

  销毁过程

  父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

- 在哪个生命周期内调用异步请求？

  可以在钩子函数 created、beforeMount、mounted 中进行调用，因为在这三个钩子函数中，data 已经创建，可以将服务端端返回的数据进行赋值。但是本人推荐在 created 钩子函数中调用异步请求，因为在 created 钩子函数中调用异步请求有以下优点：

  更快获取请求结果减少 loading 时间，ssr  不支持 beforeMount 、mounted 钩子函数，保持一致性

- 父组件如何监听子组件生命周期？

1. 把 mounted 当成普通方法，子组件 mounted 方法里面调用`$emit('mounted','mounted 触发了')`

```vue
template>
  <div>
    <child-component @mounted="handleDoSomething"></child-component>
  </div>
</template>
<script>
export default Vue.component("HelloWorld", {
...
  methods:{
    handleDoSomething(data){
      console.log('监听到子组件生命周期钩子函数mounted时，触发该回调',data)
    }
  },
  components:{
    "child-component":ChildComponent
  }
});
</script>


```

```vue
<script>
export default {
  ...
    mounted(){
        this.$emit('mounted','mounted 触发了')
    },
}
</script>
```

方法 2 用@hook 即可

```vue
<child-component @hook:mounted="handleDoSomething"></child-component>
```

### 2. `keep-alive `的了解

`keep-alive` 是 `Vue` 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染
一般结合路由和动态组件一起使用，用于缓存组件
`include` 表示只有名称匹配的组件会被缓存，exclude 表示任何名称匹配的组件都不会被缓存 `，exclude` 的优先级比 `include` 高
对应两个钩子函数 `activated` 和 `deactivated` ，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated。

首次进入组件时：beforeRouteEnter > beforeCreate > created> mounted > activated > ... ... > beforeRouteLeave > deactivated

再次进入组件时：beforeRouteEnter >activated > ... ... > beforeRouteLeave > deactivated

原理：

```js
export default {
  name: "keep-alive",
  abstract: true,

  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },

  created() {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted() {
    //  如果include 或exclude 发生了变化，即表示定义需要缓存的组件的规则或者不需要缓存的组件的规则发生了变化，那么就执行pruneCache函数

    // pruneCache函数做的事： 遍历this.cache，取出每一项的name值，用其与新的缓存规则进行匹配，如果匹配不上，则表示在新的缓存规则下该组件已经不需要被缓存，则调用pruneCacheEntry函数将其从this.cache对象剔除即可
    this.$watch("include", (val) => {
      pruneCache(this, (name) => matches(val, name));
    });
    this.$watch("exclude", (val) => {
      pruneCache(this, (name) => !matches(val, name));
    });
  },

  render() {
    return vnode || (slot && slot[0]);
  },
};
```

this.cache 是一个对象，用来存储需要缓存的组件，它将以如下形式存储：

```js
this.cache = {
  key1: "组件1",
  key2: "组件2",
  // ...
};
```

销毁的时候

```js
function pruneCacheEntry() {
  const cached = cache[key];
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}
```

render 函数作用

拿到 key 值后去 this.cache 对象中去寻找是否有该值，如果有则表示该组件有缓存，即命中缓存， 从缓存中拿 vnode 的组件实例，
没有直接存入 this.cache 中，然后两种情况都会将 key 顺序调整至 this.keys 最后一个

如果 this.cache 长度超过了 this.max 将 cache 中第一个删掉

### 3. 组件中 `data` 为什么是一个函数？

因为组件是用来复用的，且 `JS` 里对象是引用关系，如果组件中 `data` 是一个对象，那么这样作用域没有隔离，子组件中的 `data` 属性值会相互影响，如果组件中 `data` 选项是一个函数，那么每个实例可以维护一份被返回对象的独立的拷贝，组件实例之间的 `data` 属性值不会互相影响；而 `new Vue `的实例，是不会被复用的，因此不存在引用对象的问题。

组件 data 在根组件的时候可以是对象其他只能是数组。

根实例对象 data 可以是对象也可以是函数（根实例是单例），不会产生数据污染情况

### 4. `v-model` 原理

`text` 和 `textarea` 元素使用 `value property` 和 `input` 事件

`checkbox` 和 `radio` 元素使用 `checked property` 和 `change` 事件

`select` 元素使用 `value property` 和 `change` 事件

```vue
<text-document :title.sync="title"></text-document>
//相当于
<text-document
  :title="title"
  @update:title="(newValue) => (title = newValue)"
></text-document>
```

`vue3` 中去掉了`.sync` 因为 `v-model` 就是`.sync` 的作用

`vue3` 中默认` v-model` 传递的事 `modelValue` `update:modelValue`

如带参数
`v-model:myPropName` 则 `update:myPropName`

### 5. `Vue` 组件间通信有哪几种方式？

- `props / $emit` 适用 父子组件通信 `$attrs/$listeners`
- `event bus`

```js
// eventBus.js
import Vue from "vue";
export const EventBus = new Vue();

// 组件 A 发送事件
EventBus.$emit("my-event", "Hello from Component A");

// 组件 B 监听事件
EventBus.$on("my-event", (data) => {
  console.log(data);
});
```

- `vuex`

- `provide/inject`

```js
   <!-- 祖先组件 -->
   <script>
   export default {
     provide() {
       return {
         message: 'message from ancestor'
       };
     }
   };
   </script>

   <!-- 后代组件 -->
   <script>
   export default {
     inject: ['message'],
     mounted() {
       console.log(this.message); // "message from ancestor"
     }
   };
   </script>
```

react 组件间通信

- `props`
- `context`
- `redux`
- `ref`

单向数据流，不能在子组件直接更改 props 因为 props 中的属性改变所有用到该属性的组件都要刷新。当前组件改变了其他组件会有影响。只能通过 emit 的形式更改

而且 child1 更改了 props child2~child n 中都跟着改，很难查看那里改变的 props

### 6. vuex 原理

Vue.myGlobalMethod
Vue.directive
Vue.mixin

#### pinia 原理

CreatePinia 创建一个 effectScope，全局 state 对象，Map 对象
defineStore 判断 setupStore 还是 OptionStore，返回一个 useStore 函数。
useStore 函数判断是否已存在 store，如果未存在根据 defineStore 的判断来执行 createSetupStore 或者 createOptionsStore，这个里面几个参数`$onAction，$patch, $reset(vue3不支持，需在store中自定义）,$subscribe， $store`其中`$store` 是 reactive 包裹传进去的 state，如果已存在直接返回已有 store。
createSetupStore 使用一个新的 effectStore 执行 setup 函数赋值给 setupStore，最后将 store 和 setupStore 合并。

#### vuex 原理

> Vue.use(plugin)用法
> 如果插件是一个对象，必须提供 install 方法。
> 如果插件是一个函数，它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入。

关键是

1. 如何全局引入$store 的

调用 Vue.use(Vuex)

```js
export function initUse(Vue: GlobalAPI) {
  args.unshift(this);
  if (isFunction(plugin.install)) {
    plugin.install.apply(plugin, args);
  } else if (isFunction(plugin)) {
    plugin.apply(null, args);
  }
}
```

然后拦截 `beforeCreate` 方法。 判断 `options` 的对象是否有 store 有就证明是根页面，赋值 `this.$store`
如果不是就在 parent 页面找$store 对象，找到后子页面的 赋值 `this.$store`

扩展 `options` 是什么呢

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

<!-- app.provide(injectKey || storeKey, this)
// 使用 Options API 编写的可以直接 this.$store获取
    app.config.globalProperties.$store = this -->

2. 实现可观测

```js
store._vm = new Vue({
  data: {
    $$state: state,
  },
  computed,
});
```

`Vue.observable()` 是 `vue2.6` 才有的方法，所以为了兼容才用 `new vue` 来实现可观测

在 `vuex 3.0` 中用 `reactive` 直接包裹传进来的 `state` 的，

本质就是 `vuex` 中所有的可观测的 `state` 数据传进全局 `store` 里面，`store `里面做的事就是将传进来的对象变为可观测的，用的是 vue 的方法。`new vue`, `observable` `，observable` 之类的,剩下的就是完善 api。

### 7.` vue-router`

`history` 路由即 `postState`

`hash` 路由即 `hashChange`

- `hash`

```js
window.addEventListener("hashchange", () => {
  console.log("hashchange被监听到了===========");
  // hash为 #about 所以通过 slice(1) 得到 /about
  that.route.current = window.location.hash.slice(1);
});
```

- `history`

  `popstate` 事件只有浏览器的 `history.back()`、`history.forward()`、`history.go()`方法才会触发。
  `pushState，replaceState` 不会触发。所以除了在事件监听中要做更新操作，还要在跳转时手动做路由模块更新。

```js
<!DOCTYPE html>
<html lang="en">
<body>
  <a href='/home'>home</a>
  <a href='/about'>about</a>
  <!-- 渲染路由模块 -->
  <div id="view"></div>
</body>
<script>
  let view = document.querySelector("#view")

  // 路由跳转
  function push(path = "/home"){
    window.history.pushState(null, '', path)
    update()
  }
  // 更新路由模块视图
  function update(){
    view.innerHTML = location.pathname
  }

  window.addEventListener('popstate', ()=>{
    update()
  })
  window.addEventListener('load', ()=>{
    let links = document.querySelectorAll('a[href]')
    links.forEach(el => el.addEventListener('click', (e) => {
      // 阻止a标签默认行为
      e.preventDefault()
      push(el.getAttribute('href'))
    }))
    push()
  })
</script>
</html>


```

#### 怎么定义动态路由 怎么获取参数

`detail:id`
this.$route.params
$route.query、$route.hash

#### 从零开始写一个 vue 路由，说说你的思路

1. 实现 `install` 方法用 `mixins` 拦截 `beforeCreate` 方法添加` _Vue.prototype.$router = this.$options.router`（在 vue3 中 app.config.globalProperties.$router = this.$options.router;）来实现
2. 实现 router-link 和 router-view 组件

```js
  initComponent(Vue){
        const that = this
        Vue.component('route-link', {
            props: {
                to: String
            },
            render(h) {
                return h('a',{
                    domprops:{
                        to: '#' + this.to
                    }
                }, [this.$slots.default])
            }

        })
        Vue.component('route-view', {
            render(h){
                // routeMap根据路径获取当前component
                return h(that.routeMap(that.route.current))
            }
        })
    }
```

3. 路由监听,添加可观测对象 route

```js
// 监听route.current对象
this.route = _Vue.observable({
  current: "#/",
});
```

```js
window.addEventListener("hashchange", () => {
  console.log("hashchange被监听到了===========");
  // hash为 #about 所以通过 slice(1) 得到 /about
  that.route.current = window.location.hash.slice(1);
});
```

### 8. Vue 如何找入口文件，首次渲染流程

`package.json` 脚本找到 `scripts/config.js` 目录，根据参数找对应入口文件 `entry-runtime-with-compiler` 根据导包找到 Vue 实例方法`function Vue (options)`--> `_init(options) `

```js
export function initMixin(Vue: Class<Component>) {
  // 给 Vue 实例增加 _init() 方法
  // 合并 options / 初始化操作
  Vue.prototype._init = function (options?: Object) {
    // 如果是 Vue 实例不需要被 observe
    vm._isVue = true;
    // vm 的生命周期相关变量初始化
    // $children/$parent/$root/$refs
    initLifecycle(vm);
    // vm 的事件监听初始化, 父组件绑定在当前组件上的事件
    initEvents(vm);
    // vm 的编译render初始化
    // $slots/$scopedSlots/_c/$createElement/$attrs/$listeners
    initRender(vm);
    // beforeCreate 生命钩子的回调
    callHook(vm, "beforeCreate");
    // 把 inject 的成员注入到 vm 上
    initInjections(vm); // resolve injections before data/props
    // 初始化 vm 的 _props/methods/_data/computed/watch
    initState(vm);
    // 初始化 provide
    initProvide(vm); // resolve provide after data/props
    // created 生命钩子的回调
    callHook(vm, "created");
    // 调用 $mount() 挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}
```

` callHook(vm, "beforeCreate");`

` callHook(vm, "created");`

`vm.$mount(vm.$options.el);`

--> `vm.$mount(vm.$options.el);` --> `mountComponent(this, el, hydrating);`(从脚本文件中创建 render 后到 runtime 中的 mount 最后调到 mountComponent 方法)

```js
export function mountComponent(
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el;
  // 1. 如果没有render方法的话直接抛出异常，
  // 传参正常：runtime版本vue不带编译功能，要么完整版本要么编译好了再来调用。
  ...
  // 2. 触发beforeMount钩子
  callHook(vm, "beforeMount");

  let updateComponent;

  // 6.Watcher对象创建的时候会直接调用 updateComponent方法即调用render方法  调用_update方法
  updateComponent = () => {
    vm._update(vm._render(), hydrating);
  };

  //  3. 最后一个参数isRenderWatcher   创建render watcher，另外两个watcher一个是组件中的data 一个是正常的watch方法。
  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, "beforeUpdate");
        }
      },
    },
    true /* isRenderWatcher */
  );
  hydrating = false;

  // 到这里组件加载完成  触发mounted钩子
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, "mounted");
  }
  return vm;
}
```

--> 调用 `new Watcher` 创建 `render watcher`

```js
// 4. Watcher构造方法主要作用就是在new的时候自己调了一次 this.get()方法
export default class Watcher {
  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    ...
    // expOrFn updateComponent
    this.getter = expOrFn;
    // 没有lazy属性
    this.value = this.lazy ? undefined : this.get();
  }

    get() {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 5. 调用传进来的  expOrFn方法  this.getter = expOrFn;
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
}
```

创建的时候会直接调用 get 方法

--> watcher 初始化的 get 方法---> `updateComponent()` 即` vm._update(vm._render(), hydrating);` --> `_render()` -->` _update`--> `patch`

### 9、Vue 是如何实现数据双向绑定的？

这里实际上答到

1. 初始化的时候 `pushTarget` 中保存` Dep.target` ,`render` 方法会编译模版代码， `update` 方法中的 `patch` 会创建真实的 `dom` 元素
   同样初始化的时候还会 `initData` 即将 `data` 通过 `defineReactive` 重写 `get` 和 `set` 方法 `get` 里面通过 `dep.depend `来建立 `render Watcher` 和变量对应 `dep` 之间的关系

`set` 方法里面更改数据调用 `dep.notify`

2. 当数据变化的时候， 调用劫持的 `set` 方法---> `dep.notify`---> 然后遍历 `dep.depend` 中收集的依赖 `watcher` ---> 调用 `watcher` 的 `update` 方法---> watcher.update() 方法会将 watcher 自身添加到一个队列中，而不是立即执行更新操作。 这个队列会在同一事件循环结束时，批量执行所有的更新操作。 --->最终会调用 `watcher` 的 `before` 和 `run` 方法---> `run` 方法会调用 `watcher` 的 `get` 方法---> `get` 方法就是调用 `vue` 的 `update` 方法参数是 `render` 编译后的模版代码(`vm._update(vm._render(), hydrating)`;)---> `patch`

备注

`__init()`会调用 `beforeCreate` 然后调用 `initState` 方法 -->`initState(vm)` --> `initData(vm)`--> `observe(data, true /* asRootData */)` -->

Vue 使用微任务（如 Promise.then）和宏任务（如 setTimeout）来异步执行队列中的更新操作。

### 10. Vue 框架怎么实现对象和数组的监听

通过 `Object.keys()`遍历对象，然后给每个属性调用`defineReactive`

数组遍历每个元素遍历完后，调用 Observer 递归判断。

```js
export function observe(value: any, asRootData: ?boolean): Observer | void {
  let ob = new Observer(value);
  return ob;
}
```

```js
export class Observer {
  // 观测对象
  value: any;
  // 依赖对象
  dep: Dep;
  // 实例计数器
  vmCount: number; // number of vms that have this object as root $data

  constructor(value: any) {
    this.value = value;
    this.dep = new Dep();
    // 初始化实例的 vmCount 为0
    this.vmCount = 0;
    // 将实例挂载到观测对象的 __ob__ 属性，设置为不可枚举
    def(value, "__ob__", this);
    // 数组的响应式处理
    if (Array.isArray(value)) {
      // 为数组中的每一个对象创建一个 observer 实例
      this.observeArray(value);
    } else {
      // 对象的响应化处理
      // 遍历对象中的每一个属性，转换成 setter/getter
      this.walk(value);
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk(obj: Object) {
    // 获取观察对象的每一个属性
    const keys = Object.keys(obj);
    // 遍历每一个属性，设置为响应式数据
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}
```

### 11. `Proxy` 与` Object.definePropert`y 优劣对比

//TODO
Proxy 的优势如下:

`Proxy` 可以直接监听对象而非属性；
`Proxy` 可以直接监听数组的变化；
`Proxy` 有多达 13 种拦截方法,不限于 `apply、ownKeys、deleteProperty、has` 等等是

`Object.defineProperty` 不具备的；
`Proxy` 返回的是一个新对象,我们可以只操作新的对象达到目的,而`Object.defineProperty`只能遍历对象属性直接修改；

`Proxy` 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利；
`Object.defineProperty` 的优势如下:

兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题,而且无法用 polyfill 磨平，因此 Vue 的作者才声明需要等到下个大版本( 3.0 )才能用 Proxy 重写。

mvvm

model 前端来说就是接口配置
view 页面展示
viewModel 将接口返回数据处理成 view 所需的。处理交互操作行为，将交互数据处理为接口所需的传给 model

### 12. vue `$set` `$nextTick` ` $delete`` $watcher ` 等实现原理

vue3 是直接 ref reactive 定义的响应式数据，所以可以随时添加。
但是 vue2 是在 initData 的时候设置的，也就是 beforeCreate 到 create 之间。

浏览器渲染-->宏任务-->微任务-->执行渲染--> 执行下一次宏任务 循环......

$set $nextTick 最终都是调用 set 和 nextTick 方法

- `$set` 源码

defineReactive(ob.value, key, val);

ob.dep.notify();

```js
// 如果 key 在对象中已经存在直接赋值

if (key in target && !(key in Object.prototype)) {
  target[key] = val;
  return val;
}
// 如果 ob 不存在，target 不是响应式对象直接赋值
if (!ob) {
  target[key] = val;
  return val;
}
// 把 key 设置为响应式属性
defineReactive(ob.value, key, val);
// 发送通知
ob.dep.notify();
```

- `$delete` 源码

```js
...
// 同$set
...
delete target[key]
if (!ob) {
return
}
// 通过 ob 发送通知
  ob.dep.notify()

```

- `$watcher`源码

```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
// 获取 Vue 实例 this
const vm: Component = this
if (isPlainObject(cb)) {
// 判断如果 cb 是对象执行 createWatcher
    return createWatcher(vm, expOrFn, cb, options)
  }
options = options || {}
// 标记为用户 watcher
options.user = true
// 创建用户 watcher 对象
const watcher = new Watcher(vm, expOrFn, cb, options) // 判断 immediate 如果为 true
if (options.immediate) {
// 立即执行一次 cb 回调，并且把当前值传入 try {
      cb.call(vm, watcher.value)
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher
"${watcher.expression}"`)
} }
// 返回取消监听的方法
return function unwatchFn () {
    watcher.teardown()
  }
}

```

三种 watcher `computed Watcher` `user watcher` `render watcher`

initState 的时候会先

```js
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }

  // 先调用computed watcher
  if (opts.computed) initComputed(vm, opts.computed);
  // 然后调用user watcher
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

`initState` 后才会调用 `mount` 方法，才会调用 `render watcher`

- `$nextTick`源码

```js
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
// 把 cb 加上异常处理存入 callbacks 数组中 callbacks.push(() => {
if (cb) { try {
// 调用 cb()
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
} })
  if (!pending) {
    pending = true
    timerFunc()
}
  // $flow-disable-line
if (!cb && typeof Promise !== 'undefined') { // 返回 promise 对象
  return new Promise(resolve => {
      _resolve = resolve
    })
} }



const timerFunc = () => {
    p.then(flushCallbacks)
}
```

Vue 在监听到数据变化时，并不会立即更新 DOM，而是将这些更新操作放入一个队列中。 这个队列会在同一事件循环结束时，批量执行所有的更新操作
Vue 使用微任务（如 Promise.then）和宏任务（如 setTimeout）来实现异步更新。微任务会在当前事件循环结束之前执行，而宏任务会在下一个事件循环开始时执行。$nextTick 的实现是通过将回调函数放入一个微任务队列中，确保在 DOM 更新完成之后执行。如果微任务不可用，则会退而求其次使用宏任务。

在 `Vue` 内部，`nextTick` 之所以能够让我们看到 DOM 更新后的结果，是因为我们传入的 `callback` 会被添加到队列刷新函数(`flushSchedulerQueue`)的后面，这样等队列内部的更新函数都执行完毕，所有 DOM 操作也就结束了，callback 自然能够获取到最新的 DOM 值。

`nextTick` 是等待下一次 `DOM` 更新刷新的工具方法。

开发时，有两个场景我们会用到 `nextTick：`
`created` 中想要获取 DOM 时；
响应式数据变化后获取 DOM 更新后的状态，比如希望获取列表更新后的高度。
nextTick 签名如下：function nextTick(callback?: () => void): Promise<void>

所以我们只需要在传入的回调函数中访问最新 DOM 状态即可，或者我们可以 await nextTick()方法返回的 `Promise` 之后做这件事。

### 13 虚拟 `DOM` 原理，优点

操作 dom 是比较昂贵的操作，减少操作 dom， 提高开发效率
跨平台性
保证性能下限

缺点 无法极致优化

虚拟 DOM 的实现原理主要包括以下 3 部分：

用 JavaScript 对象模拟真实 DOM 树，对真实 DOM 进行抽象；
diff 算法 — 比较两棵虚拟 DOM 树的差异；
pach 算法 — 将两个虚拟 DOM 对象的差异应用到真正的 DOM 树。

完整流程看源码部分

key 作用

arr: ['a', 'b', 'c', 'd']

arr = ['a', 'x', 'b', 'c', 'd']

如果有 key 的话直接
当比较 x 的时候 两个开头的 不同，
else
比较 oldEnd 和 startEnd d c b 比较完后（索引没变化)
再走最终的 else
查找 key 的阶段。找不到直接 insert

如果不传 key 的话除了 a 会走 newStart === oldStart 外其他所有的都会走到查找 key 或者相同元素的阶段。
节点相同 sameNode 返回 true 于是更改文本 b-->x c--->b d----> c 最后老的 startIndex > endIndex
循环结束，但是新的节点还没遍历完，直接添加后面的节点到末尾 即插入 d 到最末尾为止

### 14 v-if 和 v-for 哪个优先级更高？

不应该把 v-for 和 v-if 放一起

VUE2 v-for 的优先级是高于 v-if vue3 中则完全相反，v-if 的优先级高于 v-for

### 15 Vue 中如何扩展一个组件

mixins、extends、composition api； 插槽 slots

区别 mixins 可以引入对象或数组多个 extends 只能引入一个对象或者函数
mixins: [mixin]，
extends: CompA,

```js
// 复用代码：它是一个配置对象，选项和组件里面一样
const mymixin = {
  methods: {
    dosomething() {},
  },
};
// 全局混入：将混入对象传入
Vue.mixin(mymixin);

// 局部混入：做数组项设置到mixins选项，仅作用于当前组件
const Comp = {
  mixins: [mymixin],
};
```

混入的数据和方法不能明确判断来源且可能和当前组件内变量产生命名冲突，vue3 中引入的 composition api，可以很好解决这些问题

很方便编写独立逻辑并提供响应式的数据

### 16 Vue 权限管理，页面权限以及按钮权限

`router.addRoutes(accessRoutes)`方式动态添加路由
按钮权限的控制通常会实现一个指令，例如 `v-permission`，将按钮要求角色通过值传给 `v-permission` 指令，在指令的 `moutned` 钩子中可以判断当前用户角色和按钮是否存在交集

扩展
路由守卫
动态添加路由

`v-permission` 如何实现

```js
Vue.directive("permission", {
  inserted: function (el, binding) {
    const { value } = binding;
    if (!checkPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
});
```

```js
<el-tabs>
  <el-tab-pane label="⽤户管理" name="first">
    ⽤户管理
  </el-tab-pane>
  <el-tab-pane label="⻆⾊管理" name="third">
    ⻆⾊管理
  </el-tab-pane>
</el-tabs>
```

tabs 能不能使用 v-permission

### 17 `vue3` 新特性

也就是下面这些：

`Composition API`
`SFC Composition API `语法糖
`Teleport` 传送门
`Fragments` 片段
`Emits` 选项
自定义渲染器
`SFC CSS` 变量
`Suspense`
以上这些是 api 相关，另外还有很多框架特性也不能落掉。

回答范例
api 层面 Vue3 新特性主要包括：`Composition API`、`SFC` `Composition API` `语法糖、Teleport` `传送门、Fragments` `片段、Emits` 选项、自定义渲染器、` SFC CSS ``变量、Suspense `

另外，Vue3.0 在框架层面也有很多亮眼的改进：

更快
虚拟 DOM 重写
编译器优化：静态提升、` patchFlags``、block ` 等
基于 `Proxy` 的响应式系统
更小：更好的摇树优化
更容易维护：`TypeScript` + 模块化
更容易扩展
独立的响应化模块
自定义渲染器

为什么用 proxy 代替 defineProperty

Vue.js 3.0 对其响应式系统的实现从 Object.defineProperty() 转向了使用 ES6 的 Proxy，这个改变带来了多个显著的优势和改进。以下是使用 Proxy 代替 Object.defineProperty() 的主要原因：

1. 性能提升
   Proxy 可以拦截更多种类的操作，包括属性访问、属性赋值、枚举、函数调用等，而 Object.defineProperty() 只能拦截属性的读取和设置。这意味着 Proxy 可以更细粒度地控制对象的行为。在 Vue.js 的场景中，这允许框架更智能地收集依赖和触发更新，从而减少不必要的计算和渲染，提高应用性能。
2. 数组操作的拦截
   在 Vue 2.x 中，由于 Object.defineProperty() 的限制，Vue 不能直接拦截数组的变更方法（如 push()，pop()，shift()，unshift()，splice()，sort()，reverse() 等）。Vue 2.x 通过修改数组实例的原型来实现这些方法的拦截，这种方式不仅有性能开销，而且在某些情况下可能导致兼容性问题。使用 Proxy，Vue 3 可以直接拦截数组的变更操作，无需修改原型，提供了更自然和高效的响应式数组处理。
3. 更好的支持集合类型
   Proxy 支持拦截对 Map、Set、WeakMap 和 WeakSet 等 ES6 集合类型的操作，而 Object.defineProperty() 无法做到这一点。这使得 Vue 3 可以提供对这些数据结构的原生响应式支持。
4. 避免属性初始化的限制
   使用 Object.defineProperty() 实现响应式需要在初始化时就定义好所有的响应式属性，这意味着后续添加的新属性不会自动变为响应式的，除非使用 Vue.set 或类似的 API。而 Proxy 可以在任何时候拦截并处理任何属性，包括之后动态添加的属性，这为开发者提供了更大的灵活性和便利。
5. 简化内部实现
   由于 Proxy 的强大能力，Vue 3 的响应式系统实现更为简洁。它允许 Vue 直接操作原始对象而不需要额外的抽象层，简化了内部代码，减少了出错的可能性，同时也使得框架的体积更小。
6. 更好的类型支持
   在 TypeScript 和现代 JavaScript 项目中，Proxy 提供的灵活性和功能使得它更容易与类型系统集成，提供更安全和清晰的类型推导。
   总的来说，Vue 3 使用 Proxy 代替 Object.defineProperty() 是为了利用 Proxy 提供的更强大的功能、更好的性能和更高的灵活性，从而提供更优秀的开发体验和应用性能。这是 Vue.js 框架发展中的一次重要进步，标志着其在现代 JavaScript 生态中的进一步成熟。

### 18 keepAlive

1. 开发中缓存组件使用 keep-alive 组件，keep-alive 是 vue 内置组件，keep-alive 包裹动态组件 component 时，会缓存不活动的组件实例，而不是销毁它们，这样在组件切换过程中将状态保留在内存中，防止重复渲染 DOM。

2. 结合属性 include 和 exclude 可以明确指定缓存哪些组件或排除缓存指定组件。vue3 中结合 vue-router 时变化较大，之前是 keep-alive 包裹 router-view，现在需要反过来用 router-view 包裹 keep-alive：

```vue
<router-view v-slot="{ Component }">
<keep-alive>
<component :is="Component"></component>
</keep-alive>
</router-view>
```

3. 缓存后如果要获取数据，解决方案可以有以下两种： beforeRouteEnter：在有
   vue-router 的项目，每次进入路由的时候，都会执行 beforeRouteEnter

```js
  beforeRouteEnter(to, from, next){
  next(vm=>{
    console.log(vm)
    // 每次进入路由执行
    vm.getData()  // 获取数据
  })
},
```

actived：在 keep-alive 缓存的组件被激活的时候，都会执行 activated 钩子 deActivated

```js
activated(){
	  this.getData() // 获取数据
},
```

4. `keep-alive` 是一个通用组件，它内部定义了一个 map，缓存创建过的组件实例，它返回的渲染函数内部会查找内嵌的 `component` 组件对应组件的 `vnode`，如果该组件在 map 中存在就直接返回它。由于 `component` 的 is 属性是个响应式数据，因此只要它变化，`keep-alive` 的 `render` 函数就会重新执行。

### 19-从 0 到 1 自己构架一个 vue 项目，说说有哪些步骤、哪些重要插件、目录结构你会怎么组织

回答范例

1. 从 0 创建一个项目我大致会做以下事情：项目构建、引入必要插件、代码规范、提交规范、常用库和组件

2. 目前 vue3 项目我会用 vite 或者 create-vue 创建项目

3. 接下来引入必要插件：路由插件 vue-router、状态管理 vuex/pinia、ui 库我比较喜欢 element-plus 和 antd-vue、http 工具我会选 axios

4. 其他比较常用的库有 vueuse，nprogress，图标可以使用 vite-svg-loader

5. 下面是代码规范：结合 prettier 和 eslint 即可

6. 最后是提交规范，可以使用 husky，lint-staged，commitlint

7. 目录结构我有如下习惯： .vscode：用来放项目中的 vscode 配置

plugins：用来放 vite 插件的 plugin 配置

public：用来放一些诸如 页头 icon 之类的公共文件，会被打包到 dist 根目录下

src：用来放项目代码文件

api：用来放 http 的一些接口配置

assets：用来放一些 CSS 之类的静态资源

components：用来放项目通用组件

layout：用来放项目的布局

router：用来放项目的路由配置

store：用来放状态管理 Pinia 的配置

utils：用来放项目中的工具方法类

views：用来放项目的页面文件

#### 编码规范

- 编码风格方面：

1. 命名组件时使用“多词”风格避免和 HTML 元素冲突
2. 使用“细节化”方式定义属性而不是只有一个属性名
3. 属性名声明时使用“驼峰命名”，模板或 jsx 中使用“肉串命名”
4. 使用 v-for 时务必加上 key，且不要跟 v-if 写在一起

- 性能方面：

1. 路由懒加载减少应用尺寸
2. 利用 SSR 减少首屏加载时间
3. 利用 v-once 渲染那些不需要更新的内容
4. 一些长列表可以利用虚拟滚动技术避免内存过度占用
5. 对于深层嵌套对象的大数组可以使用 shallowRef 或 shallowReactive 降低开销
6. 避免不必要的组件抽象

- 安全：

1. 不使用不可信模板，例如使用用户输入拼接模板：template: <div> + userProvidedString + </div>
2. 小心使用 v-html，:url，:style 等，避免 html、url、样式等注入

### 响应式原理

### diff 算法 2 和 3

### 3 的优化。

1. 使用 v-if 和 v-show
2. 使用 v-for 时添加 key
3. 避免不必要的计算属性
   避免在计算属性中进行复杂的逻辑运算，尽量保持计算属性的简单和高效。
4. 使用异步组件
5. 使用 keep-alive 缓存组件
6. 优化事件监听，避免在大量元素上绑定事件。
7. 使用 requestAnimationFrame 优化动画
   requestAnimationFrame 是一个用于在浏览器的下一次重绘之前执行回调函数的 API。它通常用于动画和需要在每一帧更新的任务。

8. 使用 Vuex 进行状态管理
9. 使用 lazy-loading 加载路由组件
10. 使用 v-once 指令
    对于不需要更新的静态内容，可以使用 v-once 指令来进行一次性渲染，避免不必要的重新渲染。
11. 使用 v-bind 和 v-on 的对象语法 使用对象语法可以更清晰地管理绑定的属性和事件，减少代码冗余。

12. 使用 v-model 的修饰符
    使用 v-model 的修饰符（如 .lazy、.number、.trim）可以减少不必要的事件处理和数据转换。

### vue 中的导航守卫

1. 全局前置守卫（beforeEach）
   在路由切换之前被调用。全局的导航控制，比如登录验证、权限检查等。
2. 全局解析守卫（beforeResolve）
   在导航被确认之前，且在所有组件内守卫和异步路由组件被解析之后被调用。
   这个守卫通常用于获取数据或者进行一些异步操作，确保在路由切换完成之前数据已经准备好
   ```js
   router.beforeResolve((to, from, next) => {
     if (to.name === "somePage" && !dataLoaded) {
       // 加载数据
       loadData().then(() => {
         next();
       });
     } else {
       next();
     }
   });
   ```
3. 全局后置守卫（afterEach）
   路由切换完成之后被调用。
   埋点
4. 路由独享守卫（beforeEnter）

直接在 routes 配置中定义，只对特定的路由生效。
可以用于对特定路由进行更精细的导航控制。

```js
const routes = [
  {
    path: "/admin",
    component: AdminPage,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      // 检查是否具有管理员权限
      if (isAdmin()) {
        next();
      } else {
        next(false);
      }
    },
  },
];
```

5. 组件内守卫

beforeRouteEnter
路由进入该组件之前被调用。
在这个守卫中无法访问组件实例 this，因为此时组件实例还未被创建。可以通过传递一个回调函数给 next 来访问组件实例。

keep-alive 缓存数据想要获取通过 beforeRouteEnter 来

```js
  beforeRouteEnter(to, from, next){
  next(vm=>{
    console.log(vm)
    // 每次进入路由执行
    vm.getData()  // 获取数据
  })
},
```

beforeRouteUpdate

路由复用
路由参数变化，比如详情页 id，

beforeRouteLeave

在导航离开该组件的路由时被调用。
可以用于在离开组件之前进行一些确认操作，比如提示用户是否保存未保存的数据。

` _Vue.prototype.$router = this.$options.router`（在 vue3 中 app.config.globalProperties.$router = this.$options.router;）来实现

### vue 常见的修饰符

lazy 光标离开标签的时候，才会将值赋予给 value，也就是在 change 事件之后再进行信息同步
trim
number 转为数值类型 如果这个值无法被 parseFloat 解析，则会返回原来的值

<input type="text" v-model.lazy="value">

事件类型

stop event.stopPropagation
prevent
once 只会触发一次
capture
passive 相当于给 onScroll 加了 lazy 事件

<button @click.stop="shout(1)">ok</button>

### 自定义指令

v-copy

```js

  bind(el, { value }) {
    el.handler = () => {
      // 创建 textarea
      textarea.value = el.$value;
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea);
      textarea.select();

      const result = document.execCommand("Copy");
      document.body.removeChild(textarea);
    }
    el.addEventListener('click', el.handler);
  },
    // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value;
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler);
  },
```

v-throttle

```js
Vue.directive('throttle', {
bind: (el, binding) => {
  let throttleTime = binding.value; // 节流时间
  if (!throttleTime) { // 用户若不设置节流时间，则默认2s
    throttleTime = 2000;
  }
  let cbFun;
  el.addEventListener('click', event => {
    if (!cbFun) { // 第一次执行
      cbFun = setTimeout(() => {
        cbFun = null;
      }, throttleTime);
    } else {
      event && event.stopImmediatePropagation();
    }
  }, true);
},
});
// 2.为button标签设置v-throttle自定义指令
<button @click="sayHello" v-throttle>提交</button>
```

Tree shaking 无非就是做了两件事：

编译阶段利用 ES6 Module 判断哪些模块已经加载
判断那些模块和变量未被使用或者引用，进而删除对应代码

减少程序体积（更小）
减少程序执行时间（更快）
便于将来对程序架构进行优化（更友好）

#

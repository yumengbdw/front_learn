## 本章考点。

一、简答题

### 1、请简述 Vue 首次渲染的过程。

![alt text](image-2.png)

1. 首先初始化 vue 对象，初始化的时候会初始化在 initMixin 中初始化`Vue.prototype._init`方法()。

2. new Vue 创建 vue 对象 首先调得就是`_init`方法，该方法会 ① 初始化身边周期，事件相关变量，render 方法
   ② 触发`beforeCreate`钩子方法 ③`initState ` ④ `created`钩子 ⑤ 调用`vm.$mount(vm.$options.el)`

3. 调用编译脚本的 mount 方法，生成 render 函数 `const { render, staticRenderFns } = compileToFunctions()` 将 render 赋值给 options 然后调用真正的 mount 方法

4. 执行 runtime 下面的通用 mount 方法
5. 执行生命周期中（'./core/instance/lifecycle'）的`mountComponent(this, el, hydrating)`方法
   `new Watcher` 传入 `updateComponent方法。`

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating);
};
```

`new watcher`的时候会自己掉一次 get 方法，get 方法实际调的就是传进去的`updateComponent`方法，所以会执行 render 方法，然后执行 update 方法。

`new watcher`前调用 beforeMount 方法，调用`_update`后`mounted`方法被调用。

这个方法做的是

### 2、请简述 Vue 响应式原理。

initState --> initData---> observe(data, true /_ asRootData _/)---> new Observer(data) ---> 构造方法调用 defineReactive(obj, keys[i]) --->
Object.defineProperty(obj, key, {
enumerable: true,
configurable: true,
get: function reactiveGetter () {dep.depend()},
set: function reactiveSetter () { dep.notify()}

}) ---> dep.depend()实际执行 Dep.target.addDep(this) ---> Dep.target 是 watcher 对象，执行的是 watcher 对象里面的 addDep 方法 --->最终会 dep（变量 msg 的 dep 对象） add（renderWatcher 对象）

创建 vue 对象初始化的过程。其中 `Dep.target` 是在 `mounter` 之前执行的 `new Watcher（renderWatcher）`对象的时候调用 get 方法之前调得 `pushTarget(this)`方法创建的 `Dep.target = target`

当`msg`改变的时候会走 set 中的 `dep.notify()`---> 遍历 subs 数组调用`watcher`中的`update`方法--->`queueWatcher`---> `nextTick(flushSchedulerQueue)` ---> `watcher.before`（生命周期 beforeUpdate）`watcher.run()` ---> `this.get()`--->

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating);
};
```

---> 重新执行 render 方法，调用 get 方法。 ---> 渲染结束

### 3、请简述虚拟 DOM 中 Key 的作用和好处。

### 4、请简述 Vue 中模板编译的过程。

### 5、其他方法源码

$set $nextTick 最终都是调用set 和nextTick方法
$set 源码

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

$delete 源码

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

$watcher

```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
// 获取 Vue 实例 this
const vm: Component = this if (isPlainObject(cb)) {
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

三种 watcher computed Watcher user watcher render watcher

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

initState 后才会调用 mount 方法，才会调用 render watcher

$nextTick

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

v2.6

目录结构

src
├─compiler 编译相关
├─core Vue 核心库
├─platforms 平台相关代码
├─server SSR，服务端渲染
├─sfc .vue 文件编译为 js 对象 公共的代码（相当于 react 的 babel）
└─shared 公共的代码

Flow Rollup

先看 package.json

```js
    "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",

    // -w watch 监听文件的变化，文件变化自动重新打包
    // --sourcemap
    // TARGET环境变量 web-full-dev   if (process.env.TARGET) {

```

后缀带.runtime 的是运行时版本，不带的是运行时+编译时版本。
运行时版本不包含编译器，即把 template 编译成为虚拟 dom

UMD ： 完整版可以通过 script 标签直接引用
CommonJs 以.common.js 结尾的版本 兼容老的打包工具 如 Browserify 或 webpack 1 等。
ES Module： 以.esm.js 结尾的版本 为现代打包工具提供的版本。 ESM 格式被设计为可以被静态分析，所以打包工具可以利用这一点来进行“tree-shaking”并 将用不到的代码排除出最终的包。

基于 vue-cli 创建的项目默认使用的是 vue.runtime.esm.js 版本，即不包含编译器的运行时 exm 标准的版本

## 首次渲染过程

### 1. 根目录 `scripts/config.js`

```js
const path = require("path");
const buble = require("rollup-plugin-buble");
const alias = require("rollup-plugin-alias");
const cjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const node = require("rollup-plugin-node-resolve");
const flow = require("rollup-plugin-flow-no-whitespace");
const version = process.env.VERSION || require("../package.json").version;
const weexVersion =
  process.env.WEEX_VERSION ||
  require("../packages/weex-vue-framework/package.json").version;
const featureFlags = require("./feature-flags");

const banner =
  "/*!\n" +
  ` * Vue.js v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
  " * Released under the MIT License.\n" +
  " */";

const weexFactoryPlugin = {
  intro() {
    return "module.exports = function weexFactory (exports, document) {";
  },
  outro() {
    return "}";
  },
};

const aliases = require("./alias");
const resolve = (p) => {
  // 根据路径中的前半部分去alias中找别名
  const base = p.split("/")[0];
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1));
  } else {
    return path.resolve(__dirname, "../", p);
  }
};

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  "web-runtime-cjs-dev": {
    entry: resolve("web/entry-runtime.js"),
    dest: resolve("dist/vue.runtime.common.dev.js"),
    format: "cjs",
    env: "development",
    banner,
  },
  "web-runtime-cjs-prod": {
    entry: resolve("web/entry-runtime.js"),
    dest: resolve("dist/vue.runtime.common.prod.js"),
    format: "cjs",
    env: "production",
    banner,
  },
  // Runtime+compiler CommonJS build (CommonJS)
  "web-full-cjs-dev": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.common.dev.js"),
    format: "cjs",
    env: "development",
    alias: { he: "./entity-decoder" },
    banner,
  },
  "web-full-cjs-prod": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.common.prod.js"),
    format: "cjs",
    env: "production",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // Runtime only ES modules build (for bundlers)
  "web-runtime-esm": {
    entry: resolve("web/entry-runtime.js"),
    dest: resolve("dist/vue.runtime.esm.js"),
    format: "es",
    banner,
  },
  // Runtime+compiler ES modules build (for bundlers)
  "web-full-esm": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.esm.js"),
    format: "es",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  "web-full-esm-browser-dev": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.esm.browser.js"),
    format: "es",
    transpile: false,
    env: "development",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  "web-full-esm-browser-prod": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.esm.browser.min.js"),
    format: "es",
    transpile: false,
    env: "production",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // runtime-only build (Browser)
  "web-runtime-dev": {
    entry: resolve("web/entry-runtime.js"),
    dest: resolve("dist/vue.runtime.js"),
    format: "umd",
    env: "development",
    banner,
  },
  // runtime-only production build (Browser)
  "web-runtime-prod": {
    entry: resolve("web/entry-runtime.js"),
    dest: resolve("dist/vue.runtime.min.js"),
    format: "umd",
    env: "production",
    banner,
  },
  // Runtime+compiler development build (Browser)
  "web-full-dev": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.js"),
    format: "umd",
    env: "development",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // Runtime+compiler production build  (Browser)
  "web-full-prod": {
    entry: resolve("web/entry-runtime-with-compiler.js"),
    dest: resolve("dist/vue.min.js"),
    format: "umd",
    env: "production",
    alias: { he: "./entity-decoder" },
    banner,
  },
  // Web compiler (CommonJS).
  "web-compiler": {
    entry: resolve("web/entry-compiler.js"),
    dest: resolve("packages/vue-template-compiler/build.js"),
    format: "cjs",
    external: Object.keys(
      require("../packages/vue-template-compiler/package.json").dependencies
    ),
  },
  // Web compiler (UMD for in-browser use).
  "web-compiler-browser": {
    entry: resolve("web/entry-compiler.js"),
    dest: resolve("packages/vue-template-compiler/browser.js"),
    format: "umd",
    env: "development",
    moduleName: "VueTemplateCompiler",
    plugins: [node(), cjs()],
  },
  // Web server renderer (CommonJS).
  "web-server-renderer-dev": {
    entry: resolve("web/entry-server-renderer.js"),
    dest: resolve("packages/vue-server-renderer/build.dev.js"),
    format: "cjs",
    env: "development",
    external: Object.keys(
      require("../packages/vue-server-renderer/package.json").dependencies
    ),
  },
  "web-server-renderer-prod": {
    entry: resolve("web/entry-server-renderer.js"),
    dest: resolve("packages/vue-server-renderer/build.prod.js"),
    format: "cjs",
    env: "production",
    external: Object.keys(
      require("../packages/vue-server-renderer/package.json").dependencies
    ),
  },
  "web-server-renderer-basic": {
    entry: resolve("web/entry-server-basic-renderer.js"),
    dest: resolve("packages/vue-server-renderer/basic.js"),
    format: "umd",
    env: "development",
    moduleName: "renderVueComponentToString",
    plugins: [node(), cjs()],
  },
  "web-server-renderer-webpack-server-plugin": {
    entry: resolve("server/webpack-plugin/server.js"),
    dest: resolve("packages/vue-server-renderer/server-plugin.js"),
    format: "cjs",
    external: Object.keys(
      require("../packages/vue-server-renderer/package.json").dependencies
    ),
  },
  "web-server-renderer-webpack-client-plugin": {
    entry: resolve("server/webpack-plugin/client.js"),
    dest: resolve("packages/vue-server-renderer/client-plugin.js"),
    format: "cjs",
    external: Object.keys(
      require("../packages/vue-server-renderer/package.json").dependencies
    ),
  },
  // Weex runtime factory
  "weex-factory": {
    weex: true,
    entry: resolve("weex/entry-runtime-factory.js"),
    dest: resolve("packages/weex-vue-framework/factory.js"),
    format: "cjs",
    plugins: [weexFactoryPlugin],
  },
  // Weex runtime framework (CommonJS).
  "weex-framework": {
    weex: true,
    entry: resolve("weex/entry-framework.js"),
    dest: resolve("packages/weex-vue-framework/index.js"),
    format: "cjs",
  },
  // Weex compiler (CommonJS). Used by Weex's Webpack loader.
  "weex-compiler": {
    weex: true,
    entry: resolve("weex/entry-compiler.js"),
    dest: resolve("packages/weex-template-compiler/build.js"),
    format: "cjs",
    external: Object.keys(
      require("../packages/weex-template-compiler/package.json").dependencies
    ),
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [flow(), alias(Object.assign({}, aliases, opts.alias))].concat(
      opts.plugins || []
    ),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || "Vue",
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };

  // built-in vars
  const vars = {
    __WEEX__: !!opts.weex,
    __WEEX_VERSION__: weexVersion,
    __VERSION__: version,
  };
  // feature flags
  Object.keys(featureFlags).forEach((key) => {
    vars[`process.env.${key}`] = featureFlags[key];
  });
  // build-specific env
  if (opts.env) {
    vars["process.env.NODE_ENV"] = JSON.stringify(opts.env);
  }
  config.plugins.push(replace(vars));

  if (opts.transpile !== false) {
    config.plugins.push(buble());
  }

  Object.defineProperty(config, "_name", {
    enumerable: false,
    value: name,
  });

  return config;
}
// 判断环境变量是否有 TARGET
// 如果有的话 使用 genConfig() 生成 rollup 配置文件
if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET);
} else {
  exports.getBuild = genConfig;
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
}
```

执行顺序

```js
 1. module.exports = genConfig(process.env.TARGET)
 2. const opts = builds[name]

   2.1.
    // 找到如下配置
        // Runtime+compiler development build (Browser)
      'web-full-dev': {
        entry: resolve('web/entry-runtime-with-compiler.js'),
        dest: resolve('dist/vue.js'),
        format: 'umd',
        env: 'development',
        alias: { he: './entity-decoder' },
        banner
      },


 2.2
    web: resolve('src/platforms/web'),

        const resolve = p => {
      // 根据路径中的前半部分去alias中找别名
      const base = p.split('/')[0]
      if (aliases[base]) {
        return path.resolve(aliases[base], p.slice(base.length + 1))
      } else {
        return path.resolve(__dirname, '../', p)
      }
    }

    2.2.1 执行 aliases[base]   返回    web: resolve('src/platforms/web'),









```

最终
把 `src/platforms/web/entry-runtime-with-compiler.js` 构建成 `dist/vue.js`，如果设置 `-- sourcemap `会生成 `vue.js.map`

### 2. entry 入口 src/platforms/web/entry-runtime-with-compiler.js 文件

问题 1. $mount 的时候可以 mount html 或者 body 吗

```js
new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
```

问题 2. 如果同时配置了 render 以及 template 的话会显示什么

```js
const vm = new Vue({
  el: "#app",
  template: "<h3>Hello template</h3>",
  render(h) {
    return h("h4", "Hello render");
  },
});
```

```js
/* @flow */

import config from "core/config";
import { warn, cached } from "core/util/index";
import { mark, measure } from "core/util/perf";

import Vue from "./runtime/index";
import { query } from "./util/index";
import { compileToFunctions } from "./compiler/index";
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
} from "./util/compat";

const idToTemplate = cached((id) => {
  const el = query(id);
  return el && el.innerHTML;
});
// 保留 Vue 实例的 $mount 方法
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
  el?: string | Element,
  // 非ssr情况下为 false，ssr 时候为true
  hydrating?: boolean
): Component {
  // 获取 el 对象
  el = el && query(el);

  /* istanbul ignore if */
  // el 不能是 body 或者 html
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== "production" &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      );
    return this;
  }

  const options = this.$options;
  // resolve template/el and convert to render function
  // 把 template/el 转换成 render 函数
  if (!options.render) {
    let template = options.template;
    // 如果模板存在
    if (template) {
      if (typeof template === "string") {
        // 如果模板是 id 选择器
        if (template.charAt(0) === "#") {
          // 获取对应的 DOM 对象的 innerHTML
          template = idToTemplate(template);
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== "production" && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        // 如果模板是元素，返回元素的 innerHTML
        template = template.innerHTML;
      } else {
        if (process.env.NODE_ENV !== "production") {
          warn("invalid template option:" + template, this);
        }
        // 否则返回当前实例
        return this;
      }
    } else if (el) {
      // 如果没有 template，获取el的 outerHTML 作为模板
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile");
      }
      // 把 template 转换成 render 函数
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== "production",
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile end");
        measure(`vue ${this._name} compile`, "compile", "compile end");
      }
    }
  }
  // 调用 mount 方法，渲染 DOM
  return mount.call(this, el, hydrating);
};
Vue.compile = compileToFunctions;

export default Vue;
```

挂载 mount 方法。

1. el 不能是 body 或者 html 标签

2. render 和 template 会优先将 render mount 挂载到 DOM 上 忽略 template
   如果只有 template 的话，会将 template 转为 render 后再挂载。

`const mount = Vue.prototype.$mount`

那么 Vue 从哪里来。

根据导包路径找到 `./runtime/index` 找到 `import Vue from 'core/index'`然后找到`import Vue from './instance/index'`

### 3. Vue 构造函数

```js
import { initMixin } from "./init";
import { stateMixin } from "./state";
import { renderMixin } from "./render";
import { eventsMixin } from "./events";
import { lifecycleMixin } from "./lifecycle";
import { warn } from "../util/index";
// 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例成员
function Vue(options) {
  if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
    warn("Vue is a constructor and should be called with the `new` keyword");
  }
  // 调用 _init() 方法
  this._init(options);
}
// 注册 vm 的 _init() 方法，初始化 vm
initMixin(Vue);
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue);
// 初始化事件相关方法
// $on/$once/$off/$emit
eventsMixin(Vue);
// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue);
// 混入 render
// $nextTick/_render
renderMixin(Vue);

export default Vue;
```

core/index \_init() 方法 $data/$props/$set/$delete/$watch

1. 初始化过程

````js

 new Vue({
 store,
 render: (h) => h(App),
 }).$mount("#app");
 ```

2. new Vue 实际会调用 core/instance/index.js

```js
function Vue(options) {
if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
  warn("Vue is a constructor and should be called with the `new` keyword");
}
// 调用 _init() 方法
this._init(options);
}
````

最终调用 `this._init`

3. \_init 实在 initMixin 方法中定义的。最终会走到

```js
export function initMixin(Vue: Class<Component>) {
  // 给 Vue 实例增加 _init() 方法
  // 合并 options / 初始化操作
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this;
    // a uid
    vm._uid = uid++;

    let startTag, endTag;
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== "production" && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`;
      endTag = `vue-perf-end:${vm._uid}`;
      mark(startTag);
    }

    // a flag to avoid this being observed
    // 如果是 Vue 实例不需要被 observe
    vm._isVue = true;
    // merge options
    // 合并 options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
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

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== "production" && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(`vue ${vm._name} init`, startTag, endTag);
    }
    // 调用 $mount() 挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}
```

在\_init 中会调用 beforeCreate 和 created 两个生命周期的钩子
最终走到`  vm.$mount(vm.$options.el)`而$mount 方法则正是在入口脚本文件中写的即 `entry-runtime-with-compiler`中。

4. `entry-runtime-with-compiler`中

改源码首先判断有没有$options.render 有没有，如果有的话直接进入下一步真正的 mount 方法
如果没有就给 options 赋值 render 方法

大致的逻辑如下

```js
if (!options.render) {
  template = getOuterHTML(el);
  const { render, staticRenderFns } = compileToFunctions(
    template,
    {
      outputSourceRange: process.env.NODE_ENV !== "production",
      shouldDecodeNewlines,
      shouldDecodeNewlinesForHref,
      delimiters: options.delimiters,
      comments: options.comments,
    },
    this
  );

  options.render = render;
  options.staticRenderFns = staticRenderFns;
}
return mount.call(this, el, hybrid);
```

4. `mount.call(this, el, hybrid);  `调用`./runtime/index'`的公共的 mount 方法

```js
import { mountComponent } from "core/instance/lifecycle";

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

5.  `mountComponent` 真正组件 mount 在这个方法中进行的

```js
export function mountComponent(
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el;
  // 1. 如果没有render方法的话直接抛出异常，
  // 传参正常：runtime版本vue不带编译功能，要么完整版本要么编译好了再来调用。
  // 传参不正常： template or render没有定义
  if (!vm.$options.render) {
    // 创建空文本节点
    vm.$options.render = createEmptyVNode;
    if (process.env.NODE_ENV !== "production") {
      /* istanbul ignore if */
      if (
        (vm.$options.template && vm.$options.template.charAt(0) !== "#") ||
        vm.$options.el ||
        el
      ) {
        warn(
          "You are using the runtime-only build of Vue where the template " +
            "compiler is not available. Either pre-compile the templates into " +
            "render functions, or use the compiler-included build.",
          vm
        );
      } else {
        warn(
          "Failed to mount component: template or render function not defined.",
          vm
        );
      }
    }
  }
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

6. render 方法和 update 方法
   在创建 Vue 对象前即 Vue 初始化的时候 实例化成员，静态成员调用的 定义的 prototype 上`_render` 方法

作用就是创建 vNode 对象

```js
Vue.prototype._render = function (): VNode {
  const vm: Component = this;
  const { render, _parentVnode } = vm.$options;

  let vnode;
  try {
    // There's no need to maintain a stack because all render fns are called
    // separately from one another. Nested component's render fns are called
    // when parent component is patched.
    currentRenderingInstance = vm;
    vnode = render.call(vm._renderProxy, vm.$createElement);
  } catch (e) {
    handleError(e, vm, `render`);
    vnode = vm._vnode;
  } finally {
    currentRenderingInstance = null;
  }
  // if the returned array contains only a single node, allow it
  if (Array.isArray(vnode) && vnode.length === 1) {
    vnode = vnode[0];
  }
  // set parent
  vnode.parent = _parentVnode;
  return vnode;
};
```

`_render`方法的关键代码就是  
` vnode = render.call(vm._renderProxy, vm.$createElement);`

render 是前面`entry-runtime-with-compiler`文件通过传入 template 生成的编译好了的代码。

```js
const vm = new Vue({
  el: "#app",
  data: {
    msg: "Hello Vue",
  },
})(
  // 最终的render方法是如下
  function anonymous() {
    with (this) {
      return _c("div", { attrs: { id: "app" } }, [
        _m(0),
        _v("\n    " + _s(msg) + "\n  "),
      ]);
    }
  }
);

new Vue({
  el: "#app",
  template: `
      <div>
        <h1>{{ message }}</h1>
        <p>This is a paragraph with some {{ info }}.</p>
      </div>
    `,
  data: {
    message: "Hello, Vue!",
    info: "additional information",
  },
});
// 最终的render方法如下
(function anonymous() {
  with (this) {
    return _c("div", [
      _c("h1", [_v(_s(message))]),
      _v(" "),
      _c("p", [_v("This is a paragraph with some " + _s(info) + ".")]),
    ]);
  }
});

搜索vue源码找到对应关系;
vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);

target._s = toString;
target._v = createTextVNode;
target._m = renderStatic;
```

render 方法调用后生成的 vnode 对象如下

![alt text](image-1.png)

最后到 update 的 **patch** 方法

```js
export function lifecycleMixin(Vue: Class<Component>) {
  // _update 方法的作用是把 VNode 渲染成真实的 DOM
  // 首次渲染会调用，数据更新会调用
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this;
    const prevEl = vm.$el;
    const prevVnode = vm._vnode;
    const restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };
}
```

完整的渲染流程。

## 虚拟 DOM

h(tag, data, children) h --> createElement(tag, data, children,normalizeChildren)

h 函数返回 VNode 对象
tag data

AST 用于编译阶段，进行代码的静态分析和优化，生成高效的运行时代码。 在运行时就不需要再次检查或更新这些节点。
虚拟 DOM 用于运行时，作为一个高效更新真实 DOM 的中间表示，利用其结构来最小化 DOM 操作。

## 解释

确实，当你提到 `Dep.target` 是在组件的渲染过程中通过 `pushTarget` 设置的，这里涉及到 Vue 的更新机制的一个重要方面：即使是单个数据属性（如 `msg`）的更新，也会触发整个组件的重新渲染。这是因为 Vue 的渲染 `Watcher` 是以组件为单位的，而不是以数据属性为单位。下面是详细的解释：

渲染 Watcher 和组件级更新

1. **Watcher 实例化**：对于每个组件，Vue 实例化一个 `Watcher` 对象来观察和响应该组件的依赖变化。这个 `Watcher` 的作用是评估和重新渲染整个组件的渲染函数。

2. **依赖收集**：在组件的渲染过程中，所有被访问的响应式数据属性（如 `msg`）都会将这个组件的 `Watcher` 添加到它们各自的 `Dep` 实例中。这意味着，无论是哪个属性发生变化，都会通知同一个 `Watcher`。

3. **数据更新**：当 `msg` 更新时，它的 `Dep` 实例调用 `notify()` 方法，通知所有依赖（即组件的 `Watcher`），导致 `Watcher` 的 `update()` 方法被调用。
4. 组件重新渲染：Watcher 会重新执行组件的渲染函数，生成新的虚拟 DOM，并进行 diff 操作，最终只更新必要的 DOM 元素。尽管整个组件的渲染函数被执行，但实际上只有与变化的数据相关的 DOM 部分会被更新。

为什么是组件级别的更新？

- **效率考虑**：虽然看起来每次更新整个组件可能效率不高，但实际上，由于 Vue 的虚拟 DOM 和高效的 diff 算法，这种方式在大多数情况下是非常高效的。只有真正需要更新的部分才会触及 DOM，这是一个相对昂贵的操作。

- **简化数据流**：这种设计简化了数据流和依赖跟踪的复杂性。开发者不需要手动指定哪些部分应该在哪些数据变化时更新，Vue 的响应式系统和组件级 `Watcher` 自动处理这些依赖关系。

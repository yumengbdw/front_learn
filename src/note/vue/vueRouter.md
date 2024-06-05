## vue-router 原理
> 原理其实很简单，主要是vue的响应性和路由监听事件。
1. 监听postState或hashChange 
> history路由即postState   hash路由即hashChange  
> 在路由监听回调里面会给route的current赋值即
```javascript
this.route.current = window.location.pathname
```
2. 观测route中 current 变化
3. 更新route-view
> 因为route-view用到了route参数，响应式特性会update用到的dom，在route-view中会根据route获取对应的component对象也就是组件本身，替换route-view显示

## postState 和 hashChange什么时候会监听到？
postState 和 hashChange 在地址发生变化时都会触发

值得注意的 在不请求情况下点击相同的route-link postState会触发，hashChange不会。 hashChange只会在#后面的地址变化触发
另外调用history.pushState()或history.replaceState()不会触发popstate事件。

所以，a标签href 如果是#号事件会触发，如果不带#号，页面会请求，浏览器刷新的。
所以我们要重写a标签的click事件，以防止请求事件触发
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test</title>
</head>
<body>
<div>
    <a href="ceshi" onClick="tagAClick(event)">测试1</a>
    <a href="#ddddd">测试1</a>
    <a href="#erwe">测试1</a>
    <button onclick="jumpPage()">按钮跳转</button>
</div>

<script>
    window.addEventListener('hashchange', () => {
        console.log('hashchange监听 \n' + 'pathname:' + window.location.pathname + ' \nhash: ' + window.location.hash)
    })

    window.addEventListener('popstate', () => {
        console.log('popstate被监听到了 \n' + 'pathname:' + window.location.pathname + ' \nhash: ' + window.location.hash)

    })

    function jumpPage(e) {
        history.pushState({}, '', 'button')
        console.log('button点击跳转 \n' + 'pathname:' + window.location.pathname + ' \nhash: ' + window.location.hash)
    }

    function tagAClick(e) {
        history.pushState({}, '', 'ceshi')
        console.log('a标签跳转 \n' + 'pathname:' + window.location.pathname + ' \nhash: ' + window.location.hash)
        e.preventDefault();
    }

</script>
</body>
</html>
```

## 手写router-view

### router-使用
> 完整的使用大致分为以下五个步骤
```javascript
// 1. router.use  也就是调用intall方法
Vue.use(VueRouter)
// 2. 配置路由对象
const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/detail',
        name: 'detail',
        component: Detail
    },
    {
        path: '/about',
        name: 'about',
        component: About
    }
]
// 3.导出router对象，并将路由配置穿进构造方法里面
export default new VueRouter({routers})
```

```javascript
// 4. 将router对象传进Vue实例中
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
```

```vue
// 5. 配置route-link跳转， 和component占位元素 route-view
<template>
    <div class="app">
        <div class="nav">
            <router-link to="/">Index</router-link> |
            <router-link to="/about">About</router-link> |
            <router-link to="/detail">Detail</router-link>
        </div>
        <router-view />
    </div>
</template>

```

### 根据使用来写vue-router

[//]: # (vueRouter.js 文件)
#### install方法
> `install`方法对应的是 `Vue.use(VueRouter)`类名直接调用所以是静态方法。                                       
> `install` 主要作用就是让所有页面都有`router`对象，同时拥有`route`对象

```javascript
let _Vue 
class VueRouter {
    static install(Vue) {
        _Vue = Vue
        Vue.mixin({
            // 在mixin情况下会先调用mixin里面的生命周期方法（beforeCreate），后调用组件自身的生命周期方法（beforeCreate）
            beforeCreate() {
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                    // this.$router = this.$options.router
                }
            }
        })
    }
    
}

export default VueRouter

```

####构造方法
> 构造方法主要作用初始变量，观察route属性等
- 保存options属性
- 生成routeMap（`{ url：component }` ）对象 
- 添加路由监听。
- 定义route-view  route-link组件
```javascript
let _Vue 
class VueRouter {
    static install(Vue) {
        _Vue = Vue
        Vue.mixin({
            // 在mixin情况下会先调用mixin里面的生命周期方法（beforeCreate），后调用组件自身的生命周期方法（beforeCreate）
            beforeCreate() {
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                    // this.$router = this.$options.router
                }
            }
        })
    }
    
    constructor(options){
        // 保存options属性
        this.options = options
        // 生命routeMap对象
        this.routeMap = {}
        // 监听route.current对象
        this.route = _Vue.observable({
            current: '#/'
        })
        this.init()
    }
    
    init() {
        //生成routeMap
        this.initRouteMap()
        //添加路由监听。
        this.initEvent()
        // 定义组件route-view 和route-link
        this.initComponent(_Vue)
    }
    
    /**
     * 生成routeMap
     * */
    initRouteMap() {
        this.options.routes.forEach(item => {
            /**
             *   {
             *        path: '/about',
             *        name: 'about',
             *        component: About
             *    }
             * */
            
            this.routeMap[item.path] = item.component
        })
    }
    
    /**
     * 添加路由监听事件，在监听事件里面改变route.current的值
     * */
    initEvent() {
        window.addEventListener('hashchange', () => {
            console.log('hashchange被监听到了===========')
            // hash为 #about 所以通过 slice(1) 得到 /about
            that.route.current = window.location.hash.slice(1)
        })
    }
    /**
     * 定义route-view 和route-link组件
     *  
     *  route-link实际上就是<a href='path'></a>
     *  
     *  routeView 实际上就是根据不同的path展示不同的component组件
     *  
     *  扩展：h函数
     *  h函数实际上就是createElement()方法
     *
     *  //@param1  tags(标签名)、组件名称等
     *  //@param2  tagPropsObject 标签对应的属性数据
     *  //@param3  childNode 子级虚拟节点，也是需要createElement构建
     *  createElement(tags, tagPropsObject, childNode) 函数接受三个参数，分别是：
       eg： h('div', {class: 'title'}, '我是标题') === <div class='title'>我是标题</div>
     * 
     * 
     * */
    initComponent(Vue) {
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
    
}

export default VueRouter

```



#### route-link和route-view组件






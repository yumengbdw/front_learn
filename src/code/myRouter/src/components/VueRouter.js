/**

<!--vue 分为三部分 template， script 和  style-->
<!--
vue-router使用
1. Vue.use(router)
2. new VueRouter(options)
3.
new Vue({
router,
render: h=> h(App)
}).$mount('#app')

 Vue.util.defineReactive(obj,key,value,fn)

        obj: 目标对象，
        key: 目标对象属性；
        value: 属性值
        fn: 只在node调试环境下set时调用
-->
postState 和 hashChange 在地址发生变化时都会触发
值得注意的是tab点击切换页面，点击当前页面的tab postState会触发，hashChange不会。
 hashChange只会在#后面的地址变化触发
 另外调用history.pushState()或history.replaceState()不会触发popstate事件。
 所以，a标签href 如果是#号事件会触发，如果不带#号，页面会请求，浏览器刷新的。
 所以我们要重写a标签的click事件，以防止请求事件触发

 routeView引用被监听的对象route----->当点击的时候 route-link   a标签会跳转，改变地址触发监听----> 监听方法改变route的值。---->  route值改变，触发routeView更新，替换为url对应的component页面

 1. install 主要作用就是让所有页面都有router对象，同时拥有route对象。
2. constructor 方法就是初始化router对象，观测route对象
3. 然后就是组件router-view 和组件route-link
4. 最后监测网址变化，网址变化改变route，监测对象变化后会改变用到改属性的router-view组件，而在router组件中会根据route获取对应的component对象也就是组件本身，
-
 *
 */
let _Vue = null
class VueRouter {
  static install(Vue) {
    _Vue = Vue
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          // this.$router = this.$options.router
        }
      }
    })
  }

  constructor(options) {
    this.options = options
    this.routeMap = {}
    this.route = _Vue.observable({
      current: '/'
    })
    this.init()
  }

  init() {
    this.createRouteMap()
    this.initComponent(_Vue)
    this.initEvent()
  }

  createRouteMap() {
    this.options.routes.forEach(item => {
      this.routeMap[item.path] = item.component
    })
  }

  /**
   * 定义组件router-view
   * 定义组件 router-link
   * */
  initComponent(Vue) {
    const that = this
    Vue.component('router-link', {
      props: {
        to: String
      },
      methods: {
        clickHander(e) {
          history.pushState({}, '', this.to)
          // that.route.current = this.to
          this.$router.route.current = this.to
          e.preventDefault()
        }
      },

      render(h) {
        return h('a', {
          domProps: {
            href: '#' + this.to
          }
          //
          // on: {
          //   click: this.clickHander
          // }
        }, [this.$slots.default])
      }

    })
    Vue.component('router-view', {
      render(h) {
        console.log(that, that.data)
        return h(that.routeMap[that.route.current])
      }
    })
  }

  initEvent() {
    //
    const that = this
    window.addEventListener('popstate', () => {
      console.log('popstate被监听到了===========')
      that.route.current = window.location.pathname
    })

    window.addEventListener('hashchange', () => {
      console.log('hashchange被监听到了===========')
      that.route.current = window.location.hash.slice(1)
    })
  }
}

export default VueRouter


import HashHistory from './b'
class VueRouter {
  constructor(options) {
    this.options = options

    // 如果不传mode，默认为hash
    this.mode = options.mode || 'hash'

    // 判断模式是哪种
    switch (this.mode) {
      case 'hash':
        this.history = new HashHistory(this)
        break
      case 'history':
        // this.history = new HTML5History(this, options.base)
        break
      case 'abstract':
    }
  }

  init(app) {
    // 关键给route赋值，route在history里面 。所以把方法放在history里面保存，变化后调用完成赋值
    this.history.listen((route) => { app._route = route })

    // 初始化时执行一次，保证刷新能渲染
    this.history.transitionTo(window.location.hash.slice(1))
  }

  // 根据hash变化获取对应的所有组件
  createMathcer(location) {
    const { pathMap } = createRouteMap(this.options.routes)

    const record = pathMap[location]
    const local = {
      path: location
    }
    if (record) {
      return createRoute(record, local)
    }
    return createRoute(null, local)
  }
}

// let _Vue
VueRouter.install = (Vue) => {
  // _Vue = Vue
  // 使用Vue.mixin混入每一个组件
  Vue.mixin({
    // 在每一个组件的beforeCreate生命周期去执行
    beforeCreate() {
      if (this.$options.router) { // 如果是根组件
        // this 是 根组件本身
        this._routerRoot = this

        // this.$options.router就是挂在根组件上的VueRouter实例
        this.$router = this.$options.router

        // 执行VueRouter实例上的init方法，初始化
        this.$router.init(this)

        // 相当于存在_routerRoot上，并且调用Vue的defineReactive方法进行响应式处理
        Vue.util.defineReactive(this, '_route', this.$router.history.current)
      } else {
        // 非根组件，也要把父组件的_routerRoot保存到自身身上
        this._routerRoot = this.$parent && this.$parent._routerRoot
        // 子组件也要挂上$router
        this.$router = this._routerRoot.$router
      }
    }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route
    }
  })
}

function createRouteMap(routes) {
  const pathList = []
  const pathMap = {}

  // 对传进来的routes数组进行遍历处理
  routes.forEach(route => {
    addRouteRecord(route, pathList, pathMap)
  })

  console.log(pathList)
  // ["/home", "/home/child1", "/home/child2", "/hello", "/hello/child1"]
  console.log(pathMap)
  // {
  //     /hello: {path: xxx, component: xxx, parent: xxx },
  //     /hello/child1: {path: xxx, component: xxx, parent: xxx },
  //     /hello/child2: {path: xxx, component: xxx, parent: xxx },
  //     /home: {path: xxx, component: xxx, parent: xxx },
  //     /home/child1: {path: xxx, component: xxx, parent: xxx }
  // }

  // 将pathList与pathMap返回
  return {
    pathList,
    pathMap
  }
}

function addRouteRecord(route, pathList, pathMap, parent) {
  // 拼接path
  const path = parent ? `${parent.path}/${route.path}` : route.path
  const { component, children = null } = route
  const record = {
    path,
    component,
    parent
  }
  if (!pathMap[path]) {
    pathList.push(path)
    pathMap[path] = record
  }
  if (children) {
    // 如果有children，则递归执行addRouteRecord
    children.forEach(child => addRouteRecord(child, pathList, pathMap, record))
  }
}

function createRoute(record, location) {
  const res = []
  if (record) {
    while (record) {
      res.unshift(record)
      record = record.parent
    }
  }
  return {
    ...location,
    matched: res
  }
}
export default VueRouter

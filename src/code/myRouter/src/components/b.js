class HashHistory {
  constructor(router) {
    // 将传进来的VueRouter实例保存
    this.router = router

    // 一开始给current赋值初始值
    this.current = createRoute(null, {
      path: '/'
    })

    // 如果url没有 # ，自动填充 /#/
    ensureSlash()

    // 监听hash变化
    this.setupHashLister()
  }

  // 监听hash的变化
  setupHashLister() {
    window.addEventListener('hashchange', () => {
      console.log('hashchange监听===========')

      // 传入当前url的hash
      this.transitionTo(window.location.hash.slice(1))
    })

    window.addEventListener('popstate', () => {
      console.log('popstate被监听到了===========')
    })
  }

  // 跳转路由时触发的函数
  transitionTo(location) {
    console.log(location)

    // 找出所有对应组件
    /**
     *
     *   location,
     *   matched: {record:{
     *     path,
     *     component,
     *     parent
     *   }}
     * */
    const route = this.router.createMathcer(location)

    console.log(route)

    // hash更新时给current赋真实值
    this.current = route
    // 同时更新_route
    this.cb && this.cb(route)
  }

  // 监听回调
  listen(cb) {
    this.cb = cb
  }
}

// 如果浏览器url上没有#，则自动补充/#/
function ensureSlash() {
  if (window.location.hash) {
    return
  }
  window.location.hash = '/'
}

export function createRoute(record, location) {
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

export default HashHistory

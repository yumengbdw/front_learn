const myView = {
  functional: true,
  render(h, { parent, data }) {
    console.log(parent, data)
    const { matched } = parent.$route

    data.routerView = true // 标识此组件为router-view
    let depth = 0 // 深度索引

    while (parent) {
      // 如果有父组件且父组件为router-view 说明索引需要加1
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      parent = parent.$parent
    }
    const record = matched[depth]

    if (!record) {
      return h()
    }

    const component = record.component

    // 使用render的h函数进行渲染组件
    return h(component, data)
  }
}
export default myView

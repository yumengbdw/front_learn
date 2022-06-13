const myLink = {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  // 渲染
  render(h) {
    // 使用render的h函数渲染
    return h(
      // 标签名
      'a',
      // 标签属性
      {
        domProps: {
          href: '#' + this.to
        }
      },
      // 插槽内容
      [this.$slots.default]
    )
  }
}

export default myLink


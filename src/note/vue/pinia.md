const store = useStore()
store.$reset() // 你可以通过调用 store 的 $reset() 方法将 state 重置为初始值。

store.count++ //可以通过 store 实例访问 state，直接对其进行读写。



$patch 经过优化的，会加快修改的速度，对与较大数据，或者多条数据修改的时候还是建议使用$patch
也可以使用
参数为对象

store.$patch({
  count: store.count + 1,
  age: 120,
  name: 'DIO',
})


参数为函数
store.$patch((state) => {
  state.items.push({ name: 'shoes', quantity: 1 })
  state.hasChanged = true
})


还能通过action修改


getter中返回的数据有缓存，如果返回数据没变化，下次调用会直接从缓存中取、

action和getter中均可以通过this直接取值
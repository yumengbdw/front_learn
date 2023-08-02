/**
 *  本版本解决的问题就是  改变obj中非响应式内容时候obj.other = 'hello vue'执行了副用用函数。
 */

/**
 *  const obj = { text: 'hello world'}
 *  当obj.notExists = '222'改变的时候，副用用函数执行了。
 *  实际上text才应该是响应式的，怎么解决呢
 * 
 *   set方法的时候，执行响应式行
 *    根据更改的 key: affectFunc  值为副用用函数
 * 
 *   最终 的数据格式即下面这样。所以依赖函数（副作用函数）收集的时候就需要将set按照如下结构来新建。
 * 
 *  注意前两层是map最后方法的对象是set。set和map的区别是set不重复且只存key的对象。
 *   {target1: { key: {function}} }}
 */





let activeEffect
function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        fn()
    }
    effectFn.deps = []
    effectFn()
}

function cleanup(effectFn) {
    for (let index = 0; index < effectFn.deps.length; index++) {
        const deps = effectFn.deps[index];
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}



let effectFuncList = new WeakMap()
const data = { text: 'hello world', ok: true }
const obj = new Proxy(data, {
    get(target, key) {
        if (!activeEffect) return target[key]
        // 是不是根据key来保存就能够保证唯一呢。
        let keyMap = effectFuncList.get(target)
        if (!keyMap) effectFuncList.set(target, (keyMap = new Map()))
        let deps = keyMap.get(key)
        if (!deps) keyMap.set(key, (deps = new Set()))
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
        return target[key]
    },
    set(target, key, newValue) {
        target[key] = newValue
        // 根据target获取以key为键的集合
        const keyMap = effectFuncList.get(target)
        if (!keyMap) return

        // 根据target获取以key为键的集合
        const effectsSet = keyMap.get(key)
        if (!effectsSet) return
        // 执行副作用函数
        const effectsToRun = new Set(effectsSet)
        effectsToRun.forEach(fn => fn())
    }
})





effect(() => {
    console.warn('副用用函数执行====')
    document.body.innerText = obj.ok ? obj.text : 'no data'
})


// setTimeout(() => {
//     obj.text = 'hello vue'
// }, 1000);



setTimeout(() => {
    obj.ok = false
}, 3000);

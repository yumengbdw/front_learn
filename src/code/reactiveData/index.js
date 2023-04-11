

let activeEffect

function effect(fn) {
    activeEffect = fn
    fn()
}


let effectFuncList = new Set()
const data = { text: 'hello world' }
const obj = new Proxy(data, {
    get(target, key) {
        if (activeEffect) {
            effectFuncList.add(activeEffect)
        }
        return target[key]

    },
    set(target, key, newValue) {
        target[key] = newValue

        effectFuncList.forEach(fn => fn())

    }
})



effect(() => {
    console.warn('副用用函数执行====')
    document.body.innerText = obj.text
})


setTimeout(() => {
    obj.other = 'hello vue'
}, 2000);





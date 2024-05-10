/**
 * async是语法糖，async前缀的函数执行返回的是一个promise，
 * async function fn(num) {
 *       return num 
 *   }
 *  console.log(fn) // [AsyncFunction: fn]
 *   console.log(fn(10)) // Promise {<fulfilled>: 10} 如果fn没有返回值的话就是Promise {<fulfilled>: undefined}
 *   fn(10).then(res => console.log(res)) // 10
 * 
 *   
 *
 *
 */



function fn(num) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(num * 2)

        }, 1000);

    })
}

function* gen() {
    const num1 = yield fn(1)
    console.log(num1)
    const num2 = yield fn(num1)
    console.log(num2)

    const num3 = yield fn(num2)
    console.log(num3)

    const num4 = yield fn(num3)
    console.log(num4)

    const num5 = yield fn(num4)
    return num5
}

// 1. 排队操作
// 2. async返回promise对象
// const g = gen()

// 也就是将generator传进去后用一个函数来处理generator执行过程。
function generatorToAsync(generator) {


    return function () {
        return new Promise((resolve, reject) => {
            // 当key为down的时候resolve来结束当前的promise否则调用next方法
            const g = generator()
            let res
            function step(key, args) {
                try {
                    res = g[key](args)
                } catch (error) {
                    reject(error)

                }
                // 如果执行完了next()函数后当前的状态是done那么就直接结束return的promise
                //否则继续执行下一个next，即yield

                console.log(res)
                if (res.done) {
                    resolve(res)
                } else {
                    // 执行下一个next的时候。
                    Promise.resolve(res.value).then(val => step('next', val), err => step('reject', val))
                }
            }

            step('next')
        })
    }
}





const asyncFn = generatorToAsync(gen)

asyncFn().then(res => console.log)



// function generatorToAsync(generator) {
//     return function () {
//         return new Promise((resolve, reject) => {
//             let g = generator()
//             let res

//             function step(key, args) {
//                 try {
//                     res = g[key](args)
//                 } catch (error) {
//                     reject(error)
//                 }

//                 if (res.done) {
//                     resolve(res.value)
//                 } else {
//                     return Promise.resolve(res.value).then(val => step('next', val), err => step('reject', val))
//                 }
//             }
//             step('next')
//         })
//     }
// }





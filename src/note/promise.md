
- 实现promise.all方法
> 传一个数组进去,全部成功才会到then 否则都是到catche

调用
```javascript
Promise.all([p1,p2,p3]).then((res => {
    console.log(res)
})).catch((err) => {
    console.log(err)
})

```

实现
```javascript
Promise.all = function (promiseArray) {
    let array = []
    return new Promise((resolve, reject) => {
      promiseArray.forEach((value, index) => {
          Promise.resolve(value).then((result) => {
              array[index] = result
              if (array.length === promiseArray.length) {
                  resolve(array)
              }
          }, reject)
      })  
    })
}
```

- Promise.race 的实现
> race 赛跑, 任意一个promise状态结束就返回,成功或者失败
> 
使用
```javascript
Promise.race([p1,p2,p3]).then(console.log).catch(console.log)

```

实现
```javascript
Promise.race = function (promiseArray) {
    return new Promise(function (resolve, reject) {
        promiseArray.forEach(item => Promise.resolve(item).then(resolve,reject))
    })
}
```

- Promise.any  的实现
> 只有一个成功就成功,所有失败才失败. 就是promise.all的resole和reject逻辑互换

- Promise.allSettled
>  相当于all和any 的结合,所有的都走完了才会回调,也就是允许中间可能有失败

```javascript
Promise.MyAllSettled = function (promises) {
  let arr = [],
    count = 0
  return new Promise((resolve, reject) => {
    promises.forEach((item, i) => {
      Promise.resolve(item).then(res => {
        arr[i] = { status: 'fulfilled', val: res }
        count += 1
        if (count === promises.length) resolve(arr)
      }, (err) => {
        arr[i] = { status: 'rejected', val: err }
        count += 1
        if (count === promises.length) resolve(arr)
      })
    })
  })
}

```
## 路由

### 导航

```js
// 1. link
import Link from 'next/link'
<Link href={`/blog/${post.slug}`}>{post.title}</Link>
// 2. useRouter
import {useRouter} from 'next/nativation'
const router = useRouter()
router.push('/dashboard', {scroll: false})

// 3. redirect  服务端函数
redirect('/login')


```

也可以使用浏览器原生的 window.history.pushState 和 window.history.replaceState 方法更新浏览器的历史记录堆栈。
通常与 usePathname（获取路径名的 hook） 和 useSearchParams（获取页面参数的 hook） 一起使用

### 动态路由

[...slug] 匹配后面所有的内容

`app/shop/[...slug]/page.js`  会匹配 `/shop/aaa`,`/shop/aaa/bbb`, `/shop/aaa/bbb/ccc`等

页面组件传入的props中params参数中的slug就是参数  如`{slug:['aaa','bbb', 'ccc']}`


[[...slug]] 会多出 `/shop` 这种不带参数的类型   此时`params.params = {}`


圆括号  标记的不映射到url中

比如
`app/(marketing)/about ` 对应路径为 `app/about`



@ 标记的文件夹会作为组件形式在layout中使用

如` app/@team `  `app/@analytics`
在`app/layout.js`中

```js
export default function Layout(props) {
    return (
        <>
            {props.children}
            {props.team}
            {props.analytics}

        </>
    )}

```
所以`app/pages` 实际相当于`app/@children/page.js`


#### 应用
1. 登录和首页跳转判断用在

```js
isLogin ? props.login : props.dashboard
```


2. 不同页面不同的error.js方式和loading.js方式
3. 用于子导航。

### 拦截路由

(.) 表示匹配同一层级
(..) 表示匹配上一层级
(..)(..) 表示匹配上上层级。
(...) 表示匹配根目录

## 路由处理
route.js 

新建 app/api/posts/route.js 文件，代码如下：
```js
import { NextResponse } from 'next/server' // 是 Next.js 基于 Response 的封装，提供更加方便用法，cookie

export async function GET(request, context) {
  //  访问 /home, pathname 的值为 /home
	const pathname = request.nextUrl.pathname
	// 访问 /home?name=lee, searchParams 的值为 { 'name': 'lee' }
	const searchParams = request.nextUrl.searchParams
}

import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const field = request.nextUrl.searchParams.get("dataField")
  const data = await ((await fetch(`https://jsonplaceholder.typicode.com/posts/${params.id}`)).json())
  const result = field ? { [field]: data[field] } : data
  return NextResponse.json(result)
}
```

浏览器访问 http://localhost:3000/api/posts 查看接口返回的数据：
放在app目录也可以建议放api区分页面和api

Post请求
```js
export async function POST(request) {
    const article = await request.json()
    return NextResponse.json({
        id: Math.random().toString(36).slice(-8)
        data: argicle
    }, {status: 201})
}

```
import { headers } from 'next/headers'


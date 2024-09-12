1. 目录结构跟导航地址保持一致，包括大小写。
   `http://localhost:3000/dashboard`
   加载的是 dashboard 目录下的 `layout.tsx`

   children 父标签就是导航的展位的样式

```js
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
```

SideNav 就是 Link 标签包裹的导航

2.  `Link` 跟 `a` 标签使用完全一致，区别就是 `a` `标签会请求数据，加载过程，Link` 标签会提前预加载，直接切换

通常用来设置导航的选中高亮功能的。

```js
import { usePathname } from "next/navigation";
const pathname = usePathname();


<Link
    className={`link ${pathname === '/about' ? 'active' : ''}`}
    href="/about"
    >
```

获取外部数据以进行预渲染

导航的。
`layout.js` and `template.js` allow you to create UI that is shared between routes

`layout.js` ：
accept a children prop that will be populated with a child layout (if it exists) or a page during rendering

接受一个 children 参数用来填充子 layout 布局或者 page 页面

Root Layout： defined at the top level of the app directory and applies to all routes 定义在 app 的根目录，适用于所有路由
必须包含 html 和 body 标签,

改变页面的`head`标签内容或者 html 需要通过`Metadata` 来在 page.js 或者 layout.js 中使用。

在页面直接 export metadata 或者导出 generateMetadata 方法

```js
//page.js
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js",
};

export default function Page() {
  return "...";
}
```

## 跳转

1. `<Link href="/dashboard">`

2. `useRouter`

   ```js
   const router = useRouter();
   router.push("/dashboard");
   ```

3. `redirect`

   ```js
   if (status === 404) {
     redirect("/login");
   }
   ```

4. `native History API`
   ```js
   window.history.replaceState(null, "", newPath);
   window.history.pushState(null, "", `?${params.toString()}`);
   ```

API Routes

在 pages/api 文件夹创建 API Routes 文件 比如 user.js

```js
export default function (reg, res) {
  res.status(200).send({ id: 1, name: "Tom" });
}
```

访问 localhost: 3000/api/user
不要再 getStaticPaths 或者 getStaticProps 函数中访问 api，这两个函数就是在服务端运行的

@chark-ui

`pages/index.js`--- `/`

`pages/list.js` ---`/list `

`pages/post/first.js ` --- `/post/first`

静态生成 getStaticProps

服务端渲染 getServerSideProps

```js
export async function getStaticProps( ){
// 从文件系统，API，数据库中获取的数据
const data= ...
// p rops 属性的值将会传递给组件
    return {
      props: ...
    }
}

```

基于动态路由的静态生成

```js
export async function getStaticPaths() {
    return {
        paths: [{params: {id: "1"}, {params: {id: "2"}, {params: {id: "3}}],
        fallback: true
    }
}


export async function getStaticProps ({params}) {
    console.log('')
    const id = params.id
    let data;
    switch (id) {
        case "1":
            data = {id: "1", title: 'hellor'}
            break;
        case "2":
            data = {id: "2", title: 'world'}
            break;
        case "3":
            data = {id: "3", title:'hello world'}
            break;
        case "3":
            data = {id: "4", title:'thank you '}
            break;
        default:
            data = {}
    }

    return {
        props: data
    }
}

```

`_document.tsx` 文件,运行在服务端，所以不能写方法事件。
这个页面用来更新<html>和<body>标签的

<Head>是应用于所有页面的

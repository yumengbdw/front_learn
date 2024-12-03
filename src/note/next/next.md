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

# next 通关秘籍

https://juejin.cn/book/7226988578700525605/section/7227320664863014968?enter_from=course_center&utm_source=course_center
https://nest.nodejs.cn/

## 基础概念

每个模块都会包含 controller、service、module、dto、entities 这些东西：

Nest 有了模块 module 的划分，每个模块 module 里都包含 controller 和 service：

controller 里面处理的事接口定义,
service 里面处理接口逻辑
module 来定义 controller 和关联的 service
dto (data transfer object)是封装请求参数的。
entities 是封装对应数据库表的实体的。

```js
@controller('book')
export class BookController {
  // 构造器注入
  constructor(private readonly bookService: BookService)

// 属性注入
  @Inject(JwtService)
  private jwtService: JwtService

  @Post('create')
  create(@Body() createBookDto: CreateBookDto){
    return this.bookService.createBook(createBookDto);
  }

  @Get('list')
  findAll(){
    return this.bookService.findAll();
  }

}

```

```js
@Module({
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
```

因为 Nest 实现了一套依赖注入机制，叫做 IoC（Inverse of Control 反转控制）。
nest 应用跑起来后，会从 AppModule 开始解析，初始化 IoC 容器，加载所有的 service 到容器里，然后解析 controller 里的路由，接下来就可以接收请求了。

在 Nest 提供了 AOP （Aspect Oriented Programming 面向切面编程）的机制
具体来说，有 Middleware、Guard、Interceptor、Pipe、Exception Filter 这五种。
它们都是在目标 controller 的 handler 前后，额外加一段逻辑的。

## next cli

nest info 打印 node、npm、nest 包的依赖版本

tsconfig.json

```json
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false

```

nest generate module aaa

```js
CREATE src/aaa/aaa.module.ts (80 bytes)
```

还会自动在 AppModule 里引入：

```js
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AaaModule } from "./aaa/aaa.module";

@Module({
  imports: [AaaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

nest generate controller aaa
在 aaa.module.ts 中也会自动引入

```js
import { Module } from "@nestjs/common";
import { AaaController } from "./aaa.controller";

@Module({
  controllers: [AaaController],
})
export class AaaModule {}
```

nest generate resource xxx
会生成整个模块的 CRUD + REST api 的代码，同样会自动在 AppModule 引入：

nest-cli.json 里配置：

1. `compilerOptions` 里设置 webpack 为 true 就相当于 nest build --webpack，一样的效果，webpack 设置为 false 就是用 tsc 了。

2. `deleteOutDir` 设置为 true，每次 build 都会都清空 dist 目录。
3. `assets` 是指定 nest build 的时候，把那些非 js、ts 文件也复制到 dist 目录下。可以通过 include、exclude 来精确匹配，并且可以单独指定是否 watchAssets。只支持 src 下文件的复制，如果是非 src 下的，可以自己写脚本复制：

4. `generateOptions`，这些就和我们 nest generate 时的 --no-spec、--no-flat 一样的效果。
   --spec 和 --no-spec 是指定是否生成测试文件 --flat 和 --no-flat 是指定是否生成对应目录的：

sourceRoot 是指定源码目录。

entryFile 是指定入口文件的名字，默认是 main。

而 $schema 是指定 nest-cli.json 的 schema，也就是可以有哪些属性的：是一种 json schema 的规范,如果想全面了解 nest-cli.json 都有啥属性，可以看看这个 schema 定义。

## 五中 http 传输数据的方式

1. `url param ` http://guang.zxg/person/1111 其中 111 就是

2. `query` http://guang.zxg/person?name=guang&age=20 ? &连接的此处 name 和 age 就是
   非英文的字符和一些特殊字符要经过编码，可以使用 encodeURIComponent 的 api 来编码：

```js
const query = "?name=" + encodeURIComponent("光") + "&age=20";
```

或者使用封装了一层的 query-string 库来处理。

```js
const queryString = require("query-string");

queryString.stringify({
  name: "光",
  age: 20,
});

// ?name=%E5%85%89&age=20
```

3. `form-urlencoded`
   直接用 form 表单提交数据就是这种，它和 query 字符串的方式的区别只是放在了 body 里，然后指定下 `content-type` 是 `application/x-www-form-urlencoded` 因为内容也是 query 字符串，所以也要用 encodeURIComponent 的 api 或者 query-string 库处理下。 4.

4. `form-data`
   如果传递大量的数据，比如上传文件的时候就不是很合适了，因为文件 encode 一遍的话太慢了，这时候就可以用 form-data。
   form-data 需要指定 content type 为 multipart/form-data，然后指定 boundary 也就是分割线。

5. `json`
   form-urlencoded 需要对内容做 url encode，而 form data 则需要加很长的 boundary，两种方式都有一些缺点。如果只是传输 json 数据的话，不需要用这两种。

可以直接指定 content type 为 application/json 就行：

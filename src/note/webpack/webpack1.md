
## 流程类

输入输出
entry
context
output



模块处理
resolve
module
externals

后处理
optimization
target
mode



输入：从文件系统读入代码文件；
模块递归处理：调用 Loader 转译 Module 内容，并将结果转换为 AST，从中分析出模块依赖关系，进一步递归调用模块处理过程，直到所有依赖文件都处理完毕；
后处理：所有模块递归处理完毕后开始执行后处理，包括模块合并、注入运行时、产物优化等，最终输出 Chunk 集合；
输出：将 Chunk 写出到外部文件系统；

Webpack 首先需要根据输入配置(entry/context) 找到项目入口文件；之后根据按模块处理(module/resolve/externals 等) 所配置的规则逐一处理模块文件，处理过程包括转译、依赖分析等；模块处理完毕后，最后再根据后处理相关配置项(optimization/target 等)合并模块资源、注入运行时依赖、优化产物结构等。




## 工具类
效率
watch
devtool
devServer

性能
cache
performance

日志
stats
infrastructureLogging



https://juejin.cn/book/7115598540721618944/section/7116186197902229517?enter_from=course_center&utm_source=course_center



# babel

Babel 是一个开源 JavaScript 转编译器，它能将高版本 —— 如 ES6 代码等价转译为向后兼容，能直接在旧版 JavaScript 引擎运行的低版本代码

```
// 预先安装 @babel/preset-env
// npm i -D @babel/preset-env
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
};

```

@babel/preset-env 预设规则集，这种设计能按需将一系列复杂、数量庞大的配置、插件、Polyfill 等打包成一个单一的资源包，从而简化 Babel 的应用、学习成本。Preset 是 Babel 的主要应用方式之一


解析ts文件

```
const path = require('path');

module.exports = {
  /* xxx */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
};

```

resolve.extensions 即导包的时候可以import '.../a' 意思是按照数组顺序依次找对应后缀文件，找不到后会报错，先找a.ts然后找a.js



直接使用/preset-typescript 解析，该解析只会转换代码不会类型检查  ts-loader会类型检查

```
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-typescript'] }
        }
      }
    ]
  },
  plugins: [new ESLintPlugin({ extensions: ['.js', '.ts'] })]
}

```


style-loader、mini-css-extract-plugin（将样式代码抽离到单独产物文件，并以 <link> 标签方式引入到页面中。）是互斥的.通常判断环境后使用
```

 rules: [{
            test: /\.css$/,
            use: [
                // 根据运行环境判断使用那个 loader
                (process.env.NODE_ENV === 'development' ?
                    'style-loader' :
                    MiniCssExtractPlugin.loader),
                'css-loader'
            ]
```


lessLoader sassLoader 预处理器

PostCSS只是实现了一套将 CSS 源码解析为 AST 结构，并传入 PostCSS 插件做处理的流程框架，具体功能都由插件实现。
预处理器之于 CSS，就像 TypeScript 与 JavaScript 的关系；而 PostCSS 之于 CSS，则更像 Babel 与 JavaScript。


 PostCSS 还只是个空壳主要是借助插件具体的处理 例如我们可以使用 autoprefixer 插件自动添加浏览器前缀，


 ```

 rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader", 
          {
            loader: "css-loader",            
            options: {
              importLoaders: 1
            }
          }, 
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                // 添加 autoprefixer 插件
                plugins: [require("autoprefixer")],
              },
            },
            'less-loader' // 可以与postcss同时存在
          }
        ],
 ```
 postcss-less：兼容 Less 语法的 PostCSS 插件，类似的还有：postcss-sass、poststylus
stylelint：一个现代 CSS 代码风格检查器，能够帮助识别样式代码中的异常或风格


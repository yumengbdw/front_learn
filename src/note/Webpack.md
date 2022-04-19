Webpack原理篇

实际调用 
1. 实例化compiler对象,webpack类返回
2. 调用 compiler.run()方法
```javascript
let compiler = webpack(options)

compiler.run((err, stats) => {
    console.log(err)
    console.log(stats.toJson({
        entries: true,
        chunks: false,
        modules: false,
        assets: false
    }))
})
```

```javascript
/**
 *  主要目的是获取compiler 对象
 * */
const webpack = (options, callback) => {
    /**
     * webpackOptionsSchema中定义了wepack.config文件配置的各种参数类型,长度等合法性标准.
     * validateSchema 目的是校验参数的合法性
     * */
	const webpackOptionsValidationErrors = validateSchema(
		webpackOptionsSchema,
		options
	);
    // 如果不合法,抛出异常
	if (webpackOptionsValidationErrors.length) {
		throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
	}
	let compiler;
    /**
     * 如果是数组遍历,返回MultiCompiler对象所有compiler对象存储在MultiCompiler实例的compilers属性中
     * **/
	if (Array.isArray(options)) {
		compiler = new MultiCompiler(
			Array.from(options).map(options => webpack(options))
		);
	} else if (typeof options === "object") { // 通常我们定义的都是object类型
        /**
         *  process方法
         * new WebpackOptionsDefaulter()会返回一个带所有配置默认值的对象.
         * process 方法  /lib/OptionsDefaulter.js文件 图片所示    设置默认值. 
         */
        options = new WebpackOptionsDefaulter().process(options);

        // 新建compiler实例,并且将options赋值给compiler
		compiler = new Compiler(options.context);
		compiler.options = options;
        
        //  apply 方法,将compiler实例添加了 outputFileSystem, inputFileSystem, watchFileSystem方法,
        //  然后在tapable注册了事件
        new NodeEnvironmentPlugin({
			infrastructureLogging: options.infrastructureLogging
		}).apply(compiler);
        
        // 遍历插件,调用插件的apply方法,让compiler具有插件的某种能力.
		if (options.plugins && Array.isArray(options.plugins)) {
			for (const plugin of options.plugins) {
				if (typeof plugin === "function") {
					plugin.call(compiler, compiler);
				} else {
					plugin.apply(compiler);
				}
			}
		}
        // 执行 environment和afterEnvironment 注册的hook方法
		compiler.hooks.environment.call();
		compiler.hooks.afterEnvironment.call();
        /**
         *  ***核心步骤1 挂载所有 webpack 内置的插件（入口）
         * */
		compiler.options = new WebpackOptionsApply().process(options, compiler);
	} else {
		throw new Error("Invalid argument: options");
	}
    
    // 如果传了回调方法,会直接调 compiler.run方法.
	if (callback) {
		if (typeof callback !== "function") {
			throw new Error("Invalid argument: callback");
		}
		if (
			options.watch === true ||
			(Array.isArray(options) && options.some(o => o.watch))
		) {
			const watchOptions = Array.isArray(options)
				? options.map(o => o.wat| {})
				: options.watchOptions || {};
			return compiler.watch(watchOptions, callback);
		}
		compiler.run(callback);
	}
	return compiler;
};
```
![new WebpackOptionsDefaulter().process(options)](img_1.png)



compiler实例化
1. 定义了一系列钩子
2. 实例化后,compiler实例会贯穿在整个执行过程,会给他赋值很多属性和方法.首先赋予了其文件读写的能力
3. 遍历webpack.config的plugins全部挂载到compiler上面. 
4. 然后new WebpackOptionsApply().process 会将内置的默认插件挂载到compiler上面
5. 其中EntryOptionPlugin处理入口模块id
> EntryOptionPlugin 1个钩子事件  entryOption,在钩子方法里面主要调用了SingleEntryPlugin的apply方法
> SingleEntryPlugin 注册了两个钩子compilation(让compiler具备创建normalModuleFactory工场模块的能力,以加载需要打包的模块) 和 
> make钩子 会在run方法里面call,函数体中会执行addEntry 方法	compilation.addEntry(context, dep, name, callback);


run方法执行流程

1. 基本上钩子都是在这个阶段执行的  beforeRun  run compile
2. 关键步骤触发 `this.compile()` 方法
> beforeCompile(compilation对象实例化)执行 --> compile执行 --> make(将实例化的compilation对象传过去)执行
3. make钩子执行的时候会调用addEntry方法`compilation.addEntry(context, dep, name, callback);`
```javascript
/**
 *  entry   当前打包模块的相对路径
 *  context 当前根目录
 *  name    main
 */
addEntry(context, entry, name, callback)
{
		this.hooks.addEntry.call(entry, name);

		const slot = {
			name: name,
			// TODO webpack 5 remove `request`
			request: null,
			module: null
		};

		if (entry instanceof ModuleDependency) {
			slot.request = entry.request;
		}

		// TODO webpack 5: merge modules instead when multiple entry modules are supported
		const idx = this._preparedEntrypoints.findIndex(slot => slot.name === name);
		if (idx >= 0) {
			// Overwrite existing entrypoint
			this._preparedEntrypoints[idx] = slot;
		} else {
			this._preparedEntrypoints.push(slot);
		}
        
        // 处理依赖
      
		this._addModuleChain(
			context,
			entry,
			module => {
				this.entries.push(module);
			},
			(err, module) => {
				if (err) {
					this.hooks.failedEntry.call(entry, name, err);
					return callback(err);
				}

				if (module) {
					slot.module = module;
				} else {
					const idx = this._preparedEntrypoints.indexOf(slot);
					if (idx >= 0) {
						this._preparedEntrypoints.splice(idx, 1);
					}
				}
				this.hooks.succeedEntry.call(entry, name, module);
				return callback(null, module);
			}
		);
	}
```

doAddEntry  


所有的入口文件都被存放在了 compilation对象的entries数组里面
封装chunk就是找某个入口找到所有依赖,然后将用到的代码全部放在一起
Chunk类 核心就是创建模块,加载已有模块的内容,同时记录模块信息

 seal() 封装chunk文件
 
seal(callback)



步骤
1. webpack init  实例化webpack对象
 - 实例化compiler对象,给默认配置给compiler.options
 - 给compiler赋予读写能力
 - 遍历config文件的所有plugins 调用其apply方法
 - 调用process方法(1.挂载所有内置的插件, 2. 监听make方法,回调会走addEntry方法)
2. run方法步骤,run方法实际就是找到对应文件做各种处理,处理完后回调回来,,走process里面的make监听中去
> compilation实例化后会调用make方法,调用make方法后会走make的监听中去,处理完后会回调给调用make方法的地方,在make.call 回调中我们开始处理chunk文件
> > addEntry处理流程,关键是调用build方法,readFile读取到的内容赋值给_source变量,根据_source生成ast树,根据生成的ast树,获取dependencies信息,以及生成新的code给_source变量.然后根据esm模板生成编译后代码返回
 - 调用 beforeRun, run, compile, make, afterCompile等等





![webpack优化1](https://juejin.cn/post/7083519723484708878)
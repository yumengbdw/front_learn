
## 切换至node 10 ，删除掉aliyun等node16的版本的包
    "aliyun-react-native-push": "0.9.0",
      "victory-native": "36.3.0",
    "yup": "1.4.0"

1. npm install
2. yarn
    "aliyun-react-native-push": "0.9.0",

## 切换至node16
1. yarn add aliyun-react-native-push@0.9.0

跑项目


报错

## 替换内容 @react-native-community/cli-platform-android/native_modules.gradle
```js
//     def cliResolveScript = "console.log(require('react-native/cli').bin);"
//     String[] nodeCommand = ["node", "-e", cliResolveScript]
//     def cliPath = this.getCommandOutput(nodeCommand)

    // def cliResolveScript = "\"require.resolve('react-native/cli');\""
    // String[] nodeCommand = ["node", "--print", cliResolveScript]
    // def cliPath = this.getCommandOutput(nodeCommand)

//    String[] reactNativeConfigCommand = ["node", cliPath, "config"]
//    def reactNativeConfigOutput = this.getCommandOutput(reactNativeConfigCommand)

    def reactNativeConfigOutput
    //读取本地cli配置
    def localConfig = new File(jsAppDir+"tmp/cli-config.json")
    if(localConfig.isFile()){
      String[] catConfigCommand = ["cat", localConfig.absolutePath]
      reactNativeConfigOutput = this.getCommandOutput(catConfigCommand)
    }else {
      def cliResolveScript = "console.log(require('react-native/cli').bin);"
      String[] nodeCommand = ["node", "-e", cliResolveScript]
      def cliPath = this.getCommandOutput(nodeCommand)
      String[] reactNativeConfigCommand = ["node", cliPath, "config"]
      reactNativeConfigOutput = this.getCommandOutput(reactNativeConfigCommand)
    }

    ```


执行合并指令
```js
mkdir tmp 1>/dev/null 2>/dev/null 
node `node --print "require.resolve('react-native/cli');"` config >tmp/cli-config.json
```



## 注释 @react-native-community/cameraroll/android/build.gradle 
注释第35行jcenter()


注意android同步grandle的时候要用私有服
  `npm config set registry  http://verdaccio.caixm.cn/`


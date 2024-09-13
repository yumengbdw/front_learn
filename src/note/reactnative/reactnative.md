调整 React Native 开发者菜单里面的 "Enable Fast Refresh" 来开启或关闭

`// @refresh reset` 强制 状态被重置,编辑其他文件也刷新

## Metro

[metro 配置官网](https://metrobundler.dev/docs/configuration/)

`metro.config.js`文件中自定义 Metro 的配置选项

## 体验好的点击组件

### 第一代 Touchable

```js
TouchableWithoutFeedback  无反馈效果
TouchableNativeFeedback   android 涟漪效果
TouchableOpacity    短暂改变组件透明度
TouchableHighlight  加深组件背景效果
TouchableBounce    有bounce回弹动画效果

```

### 第二代 Button

### 第三代 Pressable 组件

```js
<Pressable
  style={({ pressed }) => [
    styles.extraBtn,
    styles.extraEdit,
    { opacity: pressed ? 0.5 : 1 },
  ]}
  onPress={() => editGoods()}
></Pressable>
```

onResponderGrant 开始响应事件，用户接触屏幕，且手指被当前组件锁定后触发

onResponderRelease 用户手指离开屏幕触发

基于以上事件，Pressable 组件总结出 onPressIn
和 onPressOut 两个事件

onLongPress >500ms

能够点击的都是可见区域包括 content padding 和 border 三部分，margin 属于透明的不可点的

如何在不改变 UI 设计的情况下扩大点击区域呢

HitSlop 属性 可接受 number 和 HitReact 两种类型数据

```js
type HitReact = {
  top?: number,
  left?: number,
  bottom?: number,
  right?: number,
};

type HitSlop = number | HitReact;
```

PressReact 可保留区域，即用户点击后从按钮区域移开取消点击的区域。默认情况可见区域就是可保留区域。
可以通过 pressRetentionOffset 来扩大类型和 HitSlop 一致

用户反复移动最后如何判断点击呢，

通过松开手指位置判断，如果松开手指位置在 PressReact 区域就是取消，HitSlop 区域就是点击。一般情况 PressReact 比 HitSlop 要大一圈

```js
const a = document.createElement("a");
a.href = "";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
```

## 组件

组件拆分原则

每个组件都应该只有一个单一的功能， 并且这个组件和其他组件没有相互依赖

## style

rn 的布局引擎是 yoga
使用 Yoga 实现的 FlexLayout 布局引擎比苹果官方提供了 UIStackViews 和 Auto layout 布局引擎，耗时减少了将近一个量级。

## 状态管理

列表

loading

接口 error

其实可以合并为

```js
const requestStatus = {
  IDLE: "IDLE",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};
```

图片

静态图片资源；

```js
const dianxinIcon = require('./dianxin.jpg')
<Image source={dianxinIcon}/>

```

require()的入参必须是字面量，不能用变量表示。

不对的

```js
const path = "./dianxin.jpg";
const dianxinIcon = require(path);
```

网络图片；

建议加宽高

```js
<Image
  source={{ uri: "https://reactjs.org/logo-og.png" }}
  style={{ width: 400, height: 400 }}
/>
```

NSURLCache 遵循的是 HTTP 的 Cache-Control 缓存策略，同时当 CDN 图片默认都已经设置了 Cache-Control 时，iOS 图片就是有缓存的。
NSURLCache 的默认最大内存缓存为 512kb，最大磁盘缓存为 10MB

图片预加载

```js
Image.prefetch(url);
```

宿主应用图片；

宿主应用图片（Images From Hybrid App’s Resources​）指的是 React Native 使用 Android/iOS 宿主应用的图片进行加载的方式

```js
// Android drawable 文件目录
// iOS asset 文件目录
<Image source={{ uri: 'app_icon' }} />

// Android asset 文件目录
<Image source={{ uri: 'asset:/app_icon.png' }} />
```

Base64 图片。

_由于 Base64 图片是嵌套在 Bundle 文件中的，所以 Base64 图片的优点是无需额外的网络请求展示快，缺点是它会增大 Bundle 的体积。 在动态更新的 React Native 应用中，Base64 图片展示快是以 React Native 页面整体加载慢为代价的。原因就是它会增加 Bundle 的体积，增加 Bundle 的下载耗时，从而导致 React Native 页面展示变慢。_

_。Base64 从 ASCII 256 个字符中选取了 64 个可见字符作为基础，这样就二进制就能以 Base64 的格式转换为 ASCII 字符串了。例如，二进制 00000000 对应的 Base64 字符是 A，是可见字符，可见字符 A 是可以存在在 .js 文件中的。_

_ASCII 256 个字符需要 8 个比特来表示（2^8=256），Base64 的 64 个字符只需要 6 个比特位来表示（2^6=64）。但实际上，Base64 字符也是以 ASCII 码的形式存在，因此这里就有 2 个比特的浪费（8-6=2） 因此转换后的体积就大了 1/3_

markdown 斜体

## textInput

对焦 focus()、失焦 blur()、控制选中文字的光标 setSelection。

```js
  const ref1 = React.useRef<TextInput>(null);

    <TextInput ref={ref1} onSubmitEditing={ref2.current?.focus} /> // 姓名输入框
    <TextInput ref={ref2} onSubmitEditing={ref3.current?.focus} /> // 电话输入框
    <TextInput ref={ref3} /> // 地址输入框
```

的 enablesReturnKeyAutomatically ios 独有属性，设为 true 在用户搜索时候没有输入内容时变为灰色，不可搜索。默认是 false 蓝色的，可以搜索

`returnKeyType`
default：换行；
done：“完成”，它适合作为最后一个输入框的提示文案；
go：“前往”，它适合作为浏览器网站输入框或页面跳出的提示文案；
next：“下一项”，它适合作为转移焦点的提示文案；
search：“搜索”，它适合作为搜索框的提示文案；
send：“发送”，它比较适合聊天输入框的提示文案。

完成快速填写功能，
iOS 上叫做 textContentType，
Android 上叫做 autoComplete。

textContentType="name" 来辅助用户填写姓名

`keyboardType`

default
number-pad
decimal-pad
numeric
email-address
phone-pad
url

iOS Only
ascii-capable
numbers-and-punctuation
name-phone-pad
twitter
web-search

Android Only

visible-password

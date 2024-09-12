const Stack = createNativeStackNavigator() is a function that returns an object containing 2 properties Screen and Navigator

Both of them are React components used for configuring the navigator.
Screen 是 Navigator 的 children 组件

```js
<NavigationContainer>
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      initialParams={{ itemId: 42 }}
      options={{
        title: "My home",
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
    <Stack.Screen name="Details" component={DetailsScreen} />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={({ route }) => ({ title: route.params.name })}
    />
  </Stack.Navigator>
</NavigationContainer>
```

home 大小写都可以 We prefer capitalizing our route names. 推荐大写 use to navigate,

initialRouteName： To specify what the initial route in a stack is

initialParams 默认传进去的参数

如果 options 中要使用 this 对象需要用箭头函数获取

header 样式也可以在全局设置一次

```js
<Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Custom Back',
        headerBackTitleStyle: { fontSize: 30 },
      }}
    >
```

也可以用组件

```js





  options={{ headerTitle: (props) => <LogoTitle {...props} /> }}


options={({ navigation, route }) => ({
    headerTitle: (props) => <LogoTitle {...props} />,
    // Add a placeholder button without the `onPress` to avoid flicker
    headerRight: () => <Button title="Update count" />,
})}




// 或者

React.useEffect(() => {
// Use `setOptions` to update the button that we previously specified
// Now the button includes an `onPress` handler to update the count
navigation.setOptions({
headerRight: () => (
<Button onPress={() => setCount((c) => c + 1)} title="Update count" />
),
});
}, [navigation]);
```

传参

1. Use context and wrap the navigator
2. Use a render callback for the screen instead of specifying a component prop:

默认情况 navigator 会优化组件渲染，如果用下面 render callback 的形式会移除优化，需要自己添加 useMemo 或者 pureComponent 来优化

```js
<Stack.Screen name="Home">
  {(props) => <HomeScreen {...props} extraData={someData} />}
</Stack.Screen>
```

跳转

navigation.navigate('Details',{...props})如果在详情页调用就不能再跳转了 push 则可以继续跳转 第二个参数就是想传进去的任意参数

navigation 参数会传递到所有<Stack.Screen> 配置的组件

navigation.push('Details') 如果在详情页 push 还能跳转。

navigation.setParams({}) 改变当前 screen 的参数，类似与 setState 会浅比较
setOptions

menu1 menu2:[men2Children1,men2Children2]
想从 menu1 跳转到 men2Children1 并且传参

```js
navigation.navigate("menu2", {
  screen: "men2Children1",
  params: { user: "jane" },
});
```

dispatch 来触发导航到另一个屏幕的动作，比如 navigation.dispatch(navigate('ScreenName'))，这里 navigate('ScreenName') 是一个导航动作，表示导航到名为 “ScreenName” 的屏幕。
返回

navigation.popToTop() 直接返回第一屏
navigation.goBack() 直接返回上级
navigation.navigate('Home') 直接跳转到第一屏 go back multiple screens 相当于 go(2)之类的。栈也清除了

也能用这种。既能向下一个页面传参也能向上一个页面传参

```js
navigation.navigate({
  name: "Home",
  params: { post: postText },
  merge: true,
});
```

不建议传整个 user 进去，建议只传 userId

应用程序数据与导航数据分离开来，多个页面使用相同数据建议使用 redux

navigation.addListener('focus', () => {
// 屏幕进入焦点时执行的操作
console.log('Screen focused');
});

navigation.addListener('blur', () => {
// 屏幕失去焦点时执行的操作
console.log('Screen blurred');
});

一个链接符合多个 Route 的匹配规则时，那么多个组件都会被渲染。如果把 Route 嵌套在 Switch 中， 那么只会渲染第一个符合规则的路由。

route中的render函数可以做复杂逻辑判断
```javascript
 <Route path="/" 
    render={() => auth ? <PrimaryLayout/> : <Redirect to="/login"/>} />
```
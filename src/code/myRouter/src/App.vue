<template>
  <div class="app">
<!--        <div id="nav">-->
<!--          <MyLink to="/">Index</MyLink> |-->
<!--          <MyLink to="/about">About</MyLink> |-->
<!--          <MyLink to="/detail">Detail</MyLink>-->
<!--        </div>-->
<!--        <MyView />-->
    <div class="nav">
      <router-link to="/">Index</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/detail">Detail</router-link>
    </div>
    <router-view />
  </div>
</template>
<script>
// import MyView from './components/c'
// import MyLink from './components/d'
export default {
  name: 'App'
  // components: { MyView, MyLink }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.nav {
  padding: 30px;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
}

.nav a.router-link-exact-active {
  color: #42b983;
}
</style>

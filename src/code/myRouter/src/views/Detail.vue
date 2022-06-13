<template>
  <div>
    <!-- 方式1： 通过当前路由规则，获取数据 -->
    通过当前路由规则获取

    <br>
    <!-- 方式2：路由规则中开启 props 传参 -->
    通过开启 props 获取：
  </div>
</template>

<script>
export default {
  name: 'Detail',
  props: ['id']
}
</script>

<style>

</style>

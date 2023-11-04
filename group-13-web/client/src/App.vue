<template>
  <div id="app" v-cloak>
    <div id="nav">
      <router-link to="/register"></router-link>
    </div>
    <!-- Render the content of the current page view -->
    <router-view />
  </div>
</template>

<script>
// here we put the logic
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
[v-cloak] {
  display: none;
}
</style>

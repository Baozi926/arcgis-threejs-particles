<template>
  <div id="app">
    <ArcgisMap />
  </div>
</template>

<script>
import ArcgisMap from "./components/ArcgisMap.vue";

export default {
  name: "App",
  components: {
    ArcgisMap
  }
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

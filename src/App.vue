<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <vue-picture-zoom :scrollElement="scrollElement" url="https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1401878636,1957300882&fm=58" />
  </div>
</template>

<script>
import vuePictureZoom from './lib/index'

export default {
  name: 'App',
  data() {
    return {
      scrollElement: null
    }
  },
  mounted() {
    this.scrollElement = document.getElementById('app')
  },
  components: {
    vuePictureZoom
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

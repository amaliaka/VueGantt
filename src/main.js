import Vue from 'vue'
import App from './App2.vue'
import './plugins/element.js'
import "@/assets/css/clear.css";

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

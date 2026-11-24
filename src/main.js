import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import uView from '@/uview-ui'
import './uni.promisify.adaptor'
import langMixin from '@/libs/lang.js'
Vue.use(uView)
Vue.mixin(langMixin)
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import langMixin from '@/libs/lang.js'
export function createApp() {
  const app = createSSRApp(App)
  app.mixin(langMixin)
  return {
    app
  }
}
// #endif
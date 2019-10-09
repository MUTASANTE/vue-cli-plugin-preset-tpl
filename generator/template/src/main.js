import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';

Vue.config.productionTip = process.env.NODE_ENV === 'production';

init(Vue, true);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

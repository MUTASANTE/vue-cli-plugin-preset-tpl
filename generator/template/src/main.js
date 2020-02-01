import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';
<% if (useVeevalidate) { -%>
import {
  extend as veeExtend,
  ValidationProvider,
  ValidationObserver
} from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';
<% } -%><% if (useFontawesome) { -%>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
<% } -%><% if (useBootstrapVue) { -%>
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
<% } -%><% if (useVeevalidate) { -%>

// import all known VeeValidate rules
Object.keys(rules).forEach(rule => {
  veeExtend(rule, rules[rule]);
});
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
<% } -%><% if (useFontawesome) { -%>
Vue.component('FontAwesomeIcon', FontAwesomeIcon);
<% } -%>

Vue.config.productionTip = process.env.NODE_ENV === 'production';

init(Vue, true);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

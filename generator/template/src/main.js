import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';
<% if (useAxios) { -%>
import axios from 'axios';
<% } -%>
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
<% } -%><% if (useAxios) { -%>

// Support Ajax-like requests. Note that adding the X-Requested-With header
// makes the request "unsafe" (as defined by CORS), and will trigger a preflight request,
// which may not always be desirable.
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//axios.defaults.withCredentials = true;
if (process.env.NODE_ENV !== 'production' && console) {
  const fn = [
    function(r) {
      // Log valid request/response
      console.log(r);
      return r;
    },
    function(error) {
      // Log request/response error
      console.log(error);
      return Promise.reject(error);
    }
  ];
  axios.interceptors.request.use(...fn);
  axios.interceptors.response.use(...fn);
}
<% } -%>

Vue.config.productionTip = process.env.NODE_ENV === 'production';

init(Vue, true);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

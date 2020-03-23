import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';
import vueCustomElement from 'vue-custom-element';
<% if (useAxios) { -%>
import axios from 'axios';
<% } -%>
<% if (useVeevalidate) { -%>
import {
  extend as veeExtend,
  localize as veeLocalize,
  ValidationProvider,
  ValidationObserver
} from 'vee-validate';
import fr from 'vee-validate/dist/locale/fr.json';
import * as rules from 'vee-validate/dist/rules';
<% } -%><% if (useVueLoadingOverlay) { -%>
import Loading from 'vue-loading-overlay';
<% } -%><% if (useFontawesome) { -%>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
//import { library } from '@fortawesome/fontawesome-svg-core';
//import * as solidIcons from '@fortawesome/free-solid-svg-icons';
//import * as regularIcons from '@fortawesome/free-regular-svg-icons';
//library.add(
//  solidIcons.faHome,
//  solidIcons.faUser,
//  solidIcons.faUserPlus,
//  solidIcons.faSignInAlt,
//  solidIcons.faSignOutAlt,
//  solidIcons.faCog,
//  solidIcons.faAddressCard
//);
<% } -%><% if (useBootstrapVue) { -%>
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
<% } -%><% if (useVueLoadingOverlay && !useBootstrapVue) { -%>

<% } -%><% if (useVueLoadingOverlay) { -%>
Vue.use(Loading);
<% } -%><% if (useVeevalidate) { -%>

veeLocalize('fr', fr);
// import all known VeeValidate rules
Object.keys(rules).forEach(rule => {
  veeExtend(rule, rules[rule]);
});
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
<% } -%><% if (useFontawesome) { -%>
Vue.component('FontAwesomeIcon', FontAwesomeIcon);
<% } -%><% if (useVueLoadingOverlay) { -%>
Vue.component('Loading', Loading);
<% } -%>
Vue.use(vueCustomElement);
<% if (useAxios) { -%>

// Support Ajax-like requests. Note that adding the X-Requested-With header
// makes the request "unsafe" (as defined by CORS), and will trigger a preflight request,
// which may not always be desirable.
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//axios.defaults.withCredentials = true;
<% } -%>

Vue.config.productionTip = process.env.NODE_ENV === 'production';

init(Vue<% if (useAxios) { -%>, axios<% } -%>);

// On instancie la vue uniquement si on ne construit
// pas de "Web component" (voir WebComponent.vue).
if (
  !process.env.VUE_APP_IS_WEB_COMPONENT &&
  !process.env.VUE_APP_IS_WEB_COMPONENT2
) {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
} else if (process.env.VUE_APP_IS_WEB_COMPONENT2) {
  App.store = store;
  App.router = router;
  Vue.customElement('my-custom-element2', App);
}

import Vue from 'vue';
import Router from 'vue-router';
import { detectIE } from './services/auth.compat';
import qs from 'qs';
const Home = () => import('./views/Home.vue');

Vue.use(Router);

export const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    props: true
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ './views/About.vue'),
    props: true
  },
  {
    path: '*',
    // https://webpack.js.org/api/module-methods/#magic-comments
    component: () =>
      import(/* webpackMode: "eager" */ './components/ComponentNotFound')
  }
];

// XXX : bug sous Edge !!! A remonter à vue-router ?
// Voir aussi https://github.com/vuejs/vue-router/pull/2774
if (detectIE()) {
  const oldReplaceState = window.history.replaceState;
  window.history.replaceState = function(...args) {
    var matches;
    const newArgs = [...args];
    if (
      newArgs.length >= 3 &&
      newArgs[2] &&
      // Il faut supprimer le lecteur Windows de chaque Url "locale" (de type file:)
      // sinon "window.history.replaceState(stateCopy, '', absolutePath);"
      // dans la fonction setupScroll() de Vue-router ne fonctionnera pas !
      (matches = /^\/[A-Z]:(\/.*)$/gi.exec(newArgs[2].toString())) &&
      matches.length == 2
    ) {
      newArgs[2] = matches[1];
    }
    return oldReplaceState.apply(this, newArgs);
  };
}

export default new Router({
  routes,
  // https://cli.vuejs.org/config/#publicpath
  base:
    process.env
      .BASE_URL /* est (re)défini grâce à la propriété publicPath du fichier vue.config.js */,
  mode: process.env.VUE_APP_ROUTE_MODE /* 'history' or 'hash' */,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash && process.env.VUE_APP_ROUTE_MODE !== 'hash') {
      return { selector: to.hash };
    }
    if (savedPosition) {
      return savedPosition;
    }
  },
  // https://github.com/vuejs/vue-router/issues/1259#issuecomment-306000548
  // permet d'utiliser des objets en tant que "query" :
  parseQuery(query) {
    return qs.parse(query);
  },
  stringifyQuery(query) {
    var result = qs.stringify(query);
    return result ? '?' + result : '';
  }
});

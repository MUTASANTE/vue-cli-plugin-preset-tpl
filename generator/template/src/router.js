import Vue from 'vue';
import Router from 'vue-router';
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
  { path: '*', component: () => import('./components/ComponentNotFound') }
];

export default new Router({
  routes,
  // https://cli.vuejs.org/config/#publicpath
  base:
    process.env
      .BASE_URL /* est (re)défini grâce à la propriété publicPath du fichier vue.config.js */,
  mode: process.env.VUE_APP_ROUTE_MODE /* 'history' or 'hash' */,
  // XXX : bug sous Edge !!! A supprimer !!!
  scrollBehavior(to, from, savedPosition) {
    if (to.hash && process.env.VUE_APP_ROUTE_MODE !== 'hash') {
      return { selector: to.hash };
    }
    if (savedPosition) {
      return savedPosition;
    }
  }
});

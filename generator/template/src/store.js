import Vue from 'vue';
import Vuex from 'vuex';
import moduleHttp from './http';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { moduleHttp },
  state: {},
  getters: {},
  mutations: {},
  actions: {}
});

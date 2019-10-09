<template>
  <App></App>
</template>

<script>
/**
 * Compilation :
 * vue build --target wc --name my-custom-element ./src/WebComponent.vue
 * ou
 * npx vue-cli-service build --target wc --name my-custom-element ./src/WebComponent.vue
 */

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { init } from './conf';

Vue.config.productionTip = process.env.NODE_ENV === 'production';

init(Vue, true);

export default {
  components: {
    App
  },
  router,
  store,
  mounted() {
    // XXX : est-ce utile ?
    // https://github.com/vuejs/vue-web-component-wrapper/issues/19#issuecomment-531861202
    router.push('/');
  }
};
</script>

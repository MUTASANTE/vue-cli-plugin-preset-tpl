<template>
  <App></App>
</template>

<script>
/**
 * Compilation :
 * npx vue-cli-service build --target wc --name my-custom-element ./src/WebComponent.vue --mode webcomponent
 * ou (mais attention, pas de possibilité d'ajouter un paramètre "mode", ce sera automatiquement le mode "production" !)
 * vue build --target wc --name my-custom-element ./src/WebComponent.vue
 *
 * Utilisation : <my-custom-element id="my-element-id"></my-custom-element>
 */

import './main';
import { copyExternalStylesToShadowDom } from './conf';
import App from './App.vue';
import router from './router';
import store from './store';

export default {
  components: {
    App
  },
  props: {
    id: { type: String, required: true }
  },
  router,
  store,
  mounted() {
    const el = document.getElementById(this.id);
    if (el) copyExternalStylesToShadowDom([el]);
  }
};
</script>

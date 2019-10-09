import Vue from 'vue';
import VueResource from 'vue-resource';
// eslint-disable-next-line
import axios from 'axios';

// Ajout de plugins
Vue.use(VueResource);

// https://github.com/pagekit/vue-resource/issues/717
Vue.http.options.root = 'http://localhost:81/tp/PHPDemoGeremi';
// Pour bien spécifier au serveur PHP qu'il s'agit d'une requête pseudo-ajax,
// afin qu'il sache que les données json + ajax sont *TOUJOURS* encodées en UTF-8.
Vue.http.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Nécessaire pour envoyer des données PUT ou POST comme s'il provenait
// d'un formulaire HTML, sans quoi le serveur PHP ne peut pas peupler
// $_PUT (si supporté) ou $_POST :
//Vue.http.options.emulateJSON = true;

axios.defaults.baseURL = 'http://localhost:81/tp/PHPDemoGeremi';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// eslint-disable-next-line
const httpResource = Vue.resource(
  'stocks.json', // url with or without parameters (they are populated when calling one of the newly defined method)
  {}, // set some of the url parameters
  // define the methods + override the url if necessary (can also define variables in it)
  {
    save: { method: 'PUT' },
    load: { method: 'GET' }
  }
);

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {}
};

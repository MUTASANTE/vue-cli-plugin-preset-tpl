import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import jQuery from 'jquery';

var statusHandler = status => {
  if (status === 'prepare') console.clear();
};

// NB : il faut d'abord appeler init() pour initialiser le contenu de "conf" !
/**
 * <code>
 * import { init } from '@/conf';
 * init(Vue, true);
 * </code>
 */
export const conf = {
  eventBus: null
};

/**
 * Permet de configurer dans ce projet :
 * - activation de l'autoloading des fichiers components .vue
 * - console JS du navigateur effacée à chaque recompilation du projet (HMR)
 * - correction de l'erreur jQuery "Cannot read property 'fn' of undefined in VueJS"
 * - utilisation du plugin pagekit/vue-resource (pour les requêtes serveur asynchrones)
 * @param {*} Vue composant Vue qui sera "mount-é" et affiché
 * @param {boolean} autoloadComponents ajout/maj de l'autoloading de composants Vuejs ou non
 */
export function init(Vue, autoloadComponents = true) {
  // https://github.com/webpack/webpack-dev-server/issues/565
  if (process.env.NODE_ENV === 'development' && module && module.hot) {
    module.hot.accept(); // already had this init code

    module.hot.removeStatusHandler(statusHandler);
    module.hot.addStatusHandler(statusHandler);

    Vue.config.warnHandler = function(msg, vm, trace) {
      if (console && !Vue.config.silent) {
        console.error(`[Vue warn]: ${msg}${trace}`);
      }
      alert(`WARNING: ${msg}${trace}`);
    };

    Vue.config.errorHandler = function(msg, vm, trace) {
      if (console) {
        console.error(msg);
      }
      alert(`ERROR: ${msg}${trace}`);
    };
  }

  // https://stackoverflow.com/questions/52548556/cannot-read-property-fn-of-undefined-in-vuejs
  // https://medium.com/code4mk-org/how-to-use-jquery-inside-vue-add-other-js-library-inside-vue-9eea8fbd0416
  if (!window.jQuery) {
    window.jQuery = jQuery;
  }

  conf.eventBus = conf.eventBus || new Vue();

  if (!autoloadComponents) {
    return;
  }

  // require.context(
  //   directory: String,
  //   includeSubdirs: Boolean /* optional, default true */,
  //   filter: RegExp /* optional, default /^\.\/.*$/, any file */,
  //   mode: String  /* optional, 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once', default 'sync' */
  // )
  // https://fr.vuejs.org/v2/guide/components-registration.html
  // https://stackoverflow.com/questions/53630683/webpack-dependency-management-and-vue-js-async-component-loading
  // https://stackoverflow.com/questions/54344164/how-to-import-all-vue-components-from-a-folder
  // XXX : les variables et opérateurs ternaires ne peuvent pas être utilisés en paramètre de require.context(...)
  // Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
  // https://github.com/webpack/webpack/issues/4772#issuecomment-358573955
  // require.context's arguments must be static and not be variables.
  // webpack need to determine at build time (before any of your code runs) which files need to be bundled.
  const componentContext = require.context(
    // Le chemin relatif du dossier composants
    './components',
    // Suivre ou non les sous-dossiers
    true,
    // L'expression régulière utilisée pour faire concorder les noms de fichiers de composant de base
    /\w\d*\.vue$/i,
    // vue.config.js : 'lazy' ou 'sync'
    // eslint-disable-next-line
    VUE_APP_LOAD_MODE
  );
  componentContext.keys().forEach(componentFilePath => {
    const componentName = upperFirst(
      camelCase(
        // Retrouver le nom du fichier indépendemment de la profondeur de dossier
        componentFilePath
          .split('/')
          .pop()
          .replace(/\.vue$/, '')
      )
    );
    if (process.env.NODE_ENV === 'development' && console) {
      console.log(`Autoload ${componentName} depuis "${componentFilePath}"`);
    }

    const componentContent = componentContext(componentFilePath);
    // Chercher les options du composant dans `.default`, qui
    // existera si le composant a été exporté avec `export default`,
    // sinon revenir à la racine du module.
    const componentConfig = componentContent.default || componentContent;
    // Créer un composant global
    if (componentConfig instanceof Promise) {
      // Principalement dans le cas d'un "lazy-load".
      Vue.component(componentName, () => componentConfig);
    } else {
      Vue.component(componentName, componentConfig);
    }
  });
}
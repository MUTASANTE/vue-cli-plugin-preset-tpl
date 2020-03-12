import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import jQuery from 'jquery';

const statusHandler = status => {
  if (status === 'prepare') console.clear();
};

// https://markeev.com/posts/vue-error-handling/
// handle errors same way as Vue.js handles them
function handleError(error, vm, info) {
  let cur = vm,
    nbHooks = 0;
  while ((cur = cur.$parent)) {
    var hooks = cur.$options.errorCaptured || [];
    for (let hook of hooks) {
      nbHooks++;
      if (hook.call(cur, error, vm, info) === false) break;
    }
  }
  // fallback
  if (!nbHooks && window && window.onerror) {
    window.onerror(info, '', '', '', error);
  }
}

// https://markeev.com/posts/vue-error-handling/
// wrap all methods of component with try-catch
const handleMethodErrorsMixin = {
  beforeCreate: function() {
    var _self = this;
    var methods = this.$options.methods || {};
    for (var key in methods) {
      var original = methods[key];
      methods[key] = function() {
        try {
          var result = original.apply(this, arguments);
          // let's analyse what is returned from the method
          if (result instanceof Promise) {
            // this looks like a Promise. let's handle it's errors:
            return result.catch(function(err) {
              handleError(err, _self, key);
            });
          } else return result;
        } catch (e) {
          handleError(e, _self, key);
        }
      };
    }
  }
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
 * @param {*} axios objet axios qui sera utilisé
 * @param {boolean} autoloadComponents ajout/maj de l'autoloading de composants Vuejs ou non
 * @param {boolean} addMethodErrorsHandlerMixin ajout du Mixin "handleMethodErrorsMixin"
 * au composant Vue pour une gestion plus poussée des erreurs et des exceptions (EXPERIMENTAL)
 */
export function init(
  Vue,
  axios = null,
  autoloadComponents = true,
  addMethodErrorsHandlerMixin = false
) {
  // https://github.com/webpack/webpack-dev-server/issues/565
  if (process.env.VUE_APP_DEBUG_MODE && module && module.hot) {
    module.hot.accept(); // already had this init code

    module.hot.removeStatusHandler(statusHandler);
    module.hot.addStatusHandler(statusHandler);

    if (addMethodErrorsHandlerMixin) {
      // add the mixin
      Vue.mixin(handleMethodErrorsMixin);
    }

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

    if (window && !window.onerror) {
      // https://developer.mozilla.org/fr/docs/Web/API/GlobalEventHandlers/onerror
      // https://www.raymondcamden.com/2019/05/01/handling-errors-in-vuejs
      // If you define this, and do not use Vue.config.errorHandler, then this will not help.
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        var string = msg.toLowerCase();
        var substring = 'script error';
        if (string.indexOf(substring) > -1) {
          alert('Script Error: See Browser Console for Detail');
        } else {
          var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
          ].join(' - ');
          alert(message);
        }
        return false;
      };
    }
  }

  if (axios) {
    axios.interceptors.response.use(
      function(response) {
        return response;
      },
      function(error) {
        var matches;
        // https://github.com/axios/axios/blob/master/dist/axios.js
        // TODO : utiliser vue-i18n et vue-cli-plugin-i18n ?
        // On traduit en français les messages d'erreur d'Axios connus :
        if (error.message === 'Request aborted') {
          error.message = 'La requête a été interrompue';
        } else if (error.message === 'Network Error') {
          error.message = 'Service indisponible (problème de réseau)';
        } else if (
          error.message &&
          (matches = /^Request failed with status code ([0-9]+)$/g.exec(
            error.message.toString()
          )) &&
          matches.length == 2
        ) {
          error.message = `La requête a échouée avec le code statut ${matches[1]}`;
        } else if (
          error.message &&
          (matches = /^timeout of ([0-9]+)ms exceeded$/g.exec(
            error.message.toString()
          )) &&
          matches.length == 2
        ) {
          error.message = `Délai de ${matches[1]} ms dépassé`;
        }
        return Promise.reject(error);
      }
    );

    if (process.env.VUE_APP_DEBUG_MODE && console) {
      axios.interceptors.request.use(
        function(config) {
          // https://stackoverflow.com/a/51279029/2332350
          config.__metadata__ = {
            startTime: new Date(),
            endTime: null
          };
          // Log valid request/response
          console.log(`Request:\n`, config);
          return config;
        },
        function(error) {
          // Log request/response error
          console.log(`Request error:\n`, error);
          return Promise.reject(error);
        }
      );
      axios.interceptors.response.use(
        function(response) {
          if (response.config && response.config.__metadata__) {
            let m = response.config.__metadata__;
            m.endTime = new Date();
            response.__completedIn__ = (m.endTime - m.startTime) / 1000;
          }
          // Log valid request/response
          console.log(`Response:\n`, response);
          return response;
        },
        function(error) {
          if (error.config && error.config.__metadata__) {
            let m = error.config.__metadata__;
            m.endTime = new Date();
            error.__completedIn__ = (m.endTime - m.startTime) / 1000;
          }
          // Log request/response error
          console.log(`Response error:\n`, error);
          return Promise.reject(error);
        }
      );
    }
  }

  // https://stackoverflow.com/questions/52548556/cannot-read-property-fn-of-undefined-in-vuejs
  // https://medium.com/code4mk-org/how-to-use-jquery-inside-vue-add-other-js-library-inside-vue-9eea8fbd0416
  if (window && !window.jQuery) {
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
    if (process.env.VUE_APP_DEBUG_MODE && console) {
      console.log(`Autoload ${componentName} depuis "${componentFilePath}"`);
    }

    const componentContent = componentContext(componentFilePath);
    // Chercher les options du composant dans `.default`, qui
    // existera si le composant a été exporté avec `export default`,
    // sinon revenir à la racine du module.
    const componentConfig = componentContent.default || componentContent;
    // Création d'un composant global.
    // Il y a un plusieurs avantages à faire cela :
    // - un composant global n'a pas besoin de définir l'attribut "name" pour
    //   pouvoir s'appeler récursivement (Recursive Components)
    //   https://vuejs.org/v2/guide/components-edge-cases.html#Recursive-Components
    // - Les références circulaires entre composants sont résolues automatiquement
    //   si ceux-ci sont enregistrés globalement
    //   https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
    if (componentConfig instanceof Promise) {
      // Principalement dans le cas d'un "lazy-load".
      Vue.component(componentName, () => componentConfig);
    } else {
      Vue.component(componentName, componentConfig);
    }
  });
}

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import jQuery from 'jquery';

const statusHandler = status => {
  if (console && status === 'prepare') console.clear();
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
  // https://github.com/vuejs/vue/issues/7653#issuecomment-425163501
  async function propagateErrorCaptured(component, error, vm) {
    var continuePropagation = true;
    const ec = component.$options.errorCaptured;
    if (ec instanceof Array) {
      for (let i = 0; i < ec.length; i++) {
        continuePropagation = ec[i].apply(component, [error, vm]);
        if (continuePropagation instanceof Promise) {
          // wait for the promise
          continuePropagation = await continuePropagation;
        }
        if (!continuePropagation) break;
      }
    }
    if (component.$parent && continuePropagation) {
      return await propagateErrorCaptured(component.$parent, error, vm);
    } else {
      return continuePropagation;
    }
  }

  // https://github.com/vuejs/vue/issues/7653#issuecomment-425163501
  // wrap all methods of component with try-catch
  const handleMethodErrorsMixin = {
    beforeCreate: function() {
      const methods = this.$options.methods || {};
      Object.entries(methods).forEach(([key, method]) => {
        const wrappedMethod = function(...args) {
          const result = method.apply(this, args);
          const resultIsPromise = result instanceof Promise;
          if (!resultIsPromise) return result;
          return Promise.resolve(result).catch(async error => {
            const continuePropagation = await propagateErrorCaptured(
              this,
              error,
              this
            );
            if (!continuePropagation) {
              if (Vue.config.errorHandler) {
                Vue.config.errorHandler(error, this);
              } else {
                return Promise.reject(error);
              }
            }
          });
        };
        methods[key] = wrappedMethod;
      });
    }
  };

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
      if (!Vue.config.silent) {
        if (console) console.error('warnHandler', msg, trace);
        alert(`ERROR(warnHandler): ${msg}${trace}`);
      }
    };

    Vue.config.errorHandler = function(msg, vm, trace) {
      if (console) console.error('errorHandler', msg, trace);
      alert(`ERROR(errorHandler): ${msg}${trace}`);
    };

    if (window && !window.onunhandledrejection) {
      window.onunhandledrejection = event => {
        if (console) console.error('onunhandledrejection', event.reason);
        alert(`ERROR(onunhandledrejection): ${event.reason}`);
      };
    }

    if (window && !window.onerror) {
      // https://developer.mozilla.org/fr/docs/Web/API/GlobalEventHandlers/onerror
      // https://www.raymondcamden.com/2019/05/01/handling-errors-in-vuejs
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        const message = [
          'Message: ' + msg,
          'URL: ' + url,
          'Line: ' + lineNo,
          'Column: ' + columnNo,
          'Error object: ' + JSON.stringify(error)
        ].join(' - ');
        if (console) console.error('onerror', message);
        const string = msg.toLowerCase();
        const substring = 'script error';
        if (string.indexOf(substring) > -1) {
          alert('ERROR(onerror): Script Error: See Browser Console for Detail');
        } else {
          alert(`ERROR(onerror): ${message}`);
        }
        return false;
      };
    }
  } else {
    Vue.config.warnHandler = function(msg, vm, trace) {
      if (!Vue.config.silent) {
        if (console) console.error('warnHandler', msg, trace);
      }
    };

    Vue.config.errorHandler = function(msg, vm, trace) {
      if (console) console.error('errorHandler', msg, trace);
    };

    if (window && !window.onunhandledrejection) {
      window.onunhandledrejection = event => {
        if (console) console.error('onunhandledrejection', event.reason);
      };
    }
  }

  if (axios) {
    axios.interceptors.response.use(undefined, function(error) {
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
    });

    if (process.env.VUE_APP_DEBUG_MODE) {
      axios.interceptors.request.use(
        function(config) {
          // https://stackoverflow.com/a/51279029/2332350
          config.__metadata__ = {
            startTime: new Date(),
            endTime: null
          };
          // Log valid request
          if (process.env.VUE_APP_DEBUG_MODE && console)
            console.log(`Axios request:\n`, config);
          return Promise.resolve(config);
        },
        function(error) {
          // On ne loggue pas les données d'authentification.
          if (
            !(error.config && error.config.data && error.config.data.password)
          ) {
            // Log request error
            if (console) console.error(`Axios request error:\n`, error);
          }
          return Promise.reject(error);
        }
      );
      axios.interceptors.response.use(
        function(response) {
          // Axios renvoie le "string" response.data tel quel s'il n'arrive pas
          // à le "parser" sous forme d'objet JSON.
          // https://github.com/axios/axios/blob/6642ca9aa1efae47b1a9d3ce3adc98416318661c/lib/defaults.js#L57
          // https://github.com/axios/axios/issues/811
          // https://github.com/axios/axios/issues/61#issuecomment-411815115
          if (typeof response.data === 'string') {
            if (console)
              console.error(
                `Axios response error (cannot parse response data as JSON object):\n`,
                response
              );
            return Promise.reject({
              config: response.config,
              message:
                'Les données du serveur sont invalides. Chargement des données impossible.'
            });
          }
          if (response.config && response.config.__metadata__) {
            const m = response.config.__metadata__;
            m.endTime = new Date();
            response.__completedIn__ = (m.endTime - m.startTime) / 1000;
          }
          // Log valid response
          if (process.env.VUE_APP_DEBUG_MODE && console)
            console.log(`Axios response:\n`, response);
          return Promise.resolve(response);
        },
        function(error) {
          if (error.config && error.config.__metadata__) {
            const m = error.config.__metadata__;
            m.endTime = new Date();
            error.__completedIn__ = (m.endTime - m.startTime) / 1000;
          }
          // On ne loggue pas les données d'authentification.
          if (!(error.response && error.response.status === 401)) {
            // Log response error
            if (console) console.error(`Axios response error:\n`, error);
          }
          return Promise.reject(error);
        }
      );
    } else {
      // Log request/response errors
      axios.interceptors.request.use(undefined, function(error) {
        // On ne loggue pas les données d'authentification.
        if (
          !(error.config && error.config.data && error.config.data.password)
        ) {
          if (console) console.error(`Axios request error:\n`, error);
        }
        return Promise.reject(error);
      });
      axios.interceptors.response.use(
        response => {
          // Axios renvoie le "string" response.data tel quel s'il n'arrive pas
          // à le "parser" sous forme d'objet JSON.
          // https://github.com/axios/axios/blob/6642ca9aa1efae47b1a9d3ce3adc98416318661c/lib/defaults.js#L57
          // https://github.com/axios/axios/issues/811
          // https://github.com/axios/axios/issues/61#issuecomment-411815115
          if (typeof response.data === 'string') {
            if (console)
              console.error(
                `Axios response error (cannot parse response data as JSON object):\n`,
                response
              );
            return Promise.reject({
              config: response.config,
              message:
                'Les données du serveur sont invalides. Chargement des données impossible.'
            });
          }
          return Promise.resolve(response);
        },
        function(error) {
          // On ne loggue pas les données d'authentification.
          if (!(error.response && error.response.status === 401)) {
            if (console) console.error(`Axios response error:\n`, error);
          }
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
    // Le chemin relatif (au dossier courant) du dossier composants (ou "@/..." pour les chemins relatifs à "src/...")
    '@/components',
    // Suivre ou non les sous-dossiers
    true,
    // L'expression régulière utilisée pour faire concorder les noms de fichiers de composant de base
    /\w\d*\.vue$/i,
    // vue.config.js : 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'
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
    if (process.env.VUE_APP_DEBUG_MODE && console)
      console.log(`Autoload ${componentName} depuis "${componentFilePath}"`);

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

// Inspiré de :
// https://github.com/adamlacombe/Shadow-DOM-inject-styles/blob/master/src/index.ts
// https://github.com/adamlacombe/Shadow-DOM-inject-styles/issues/4
function prependStyles(shadowRootElement, styles) {
  const root = shadowRootElement.shadowRoot;
  var styleAlreadyAdded = false;
  const currentStyleTags = Array.from(root.querySelectorAll('style'));
  currentStyleTags.forEach(element => {
    if (element.innerHTML === styles) {
      styleAlreadyAdded = true;
    }
  });

  if (styleAlreadyAdded === false) {
    const newStyleTag = document.createElement('style');
    newStyleTag.innerHTML = styles;
    root.prepend(newStyleTag);
  }
}

export function copyExternalStylesToShadowDom(wcs) {
  const styles = Array.from(document.querySelectorAll('head>style')).reverse();

  wcs.forEach(function(currentWC) {
    styles.forEach(function(currentStyle) {
      prependStyles(
        // currentWC.getRootNode({ composed: true }).shadowRoot vaut null (TypeError: root is null)
        // lorsque currentWC est un élément DANS le shadow DOM, donc le code ci-dessous ne fonctionnera pas :
        //currentWC.getRootNode({ composed: true }),
        currentWC,
        currentStyle.innerHTML
      );
    });
  });
}

// https://cli.vuejs.org/guide/mode-and-env.html#modes
// https://github.com/motdotla/dotenv#rules
// Les variables d'environnement définis ici *doivent* être de la forme process.env.VUE_APP_*
// Les variables d'environnement (de n'importe quel format) peuvent être stockées dans des fichiers .env*
// mais uniquement ceux de la forme VUE_APP_* seront accessible automatiquement via process.env.VUE_APP_*,
// les autres variables doivent être chargées "manuellement" dans process.env.* via require('dotenv').config()
process.env.VUE_APP_ROUTE_MODE =
  process.env.NODE_ENV === 'production' ? 'hash' : 'history';

const webpack = require('webpack');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '.' : '/',
  configureWebpack: {
    // https://webpack.js.org/configuration/externals/
    // 'nom fichier js': 'variable globale'
    externals: {
      //jquery: 'jQuery',
      //vue: 'Vue'
    },
    plugins: [
      new webpack.DefinePlugin({
        // conf.js : le seul moyen pour "variabiliser" les paramètres de require.context(...)
        // Même si pas obligatoire ici, on conserve le format VUE_APP_*
        // require.context's arguments must be static and not be variables.
        // webpack need to determine at build time (before any of your code runs) which files need to be bundled.
        // Valeurs admises : 'lazy' ou 'sync'
        VUE_APP_LOAD_MODE: JSON.stringify('lazy')
      })
    ],
    resolve: {
      alias: {
        // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
        // Les <template>s des fichiers *.vue sont pré-compilés par vue-cli / vue-loader,
        // dans les autres cas on peut intégrer la version complète (runtime+compiler) de Vuejs
        // dans le "bundle" final en utilisant 'vue/dist/vue.esm.js' :
        vue$: 'vue/dist/vue.runtime.esm.js'
      }
    }
  }
};

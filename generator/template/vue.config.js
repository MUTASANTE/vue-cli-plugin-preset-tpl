const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { DuplicatesPlugin } = require('inspectpack/plugin');
const CompressionPlugin = require('compression-webpack-plugin');

function getFullPathFor(_path) {
  return path.resolve(path.join(__dirname, _path));
}

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  // https://cli.vuejs.org/guide/webpack.html#chaining-advanced
  chainWebpack: config => {
    // https://stackoverflow.com/a/53578028/2332350
    //enableShadowCss(config);
    // https://medium.com/@aetherus.zhou/vue-cli-3-performance-optimization-55316dcd491c
    // https://cli.vuejs.org/guide/html-and-static-assets.html#prefetch
    config.plugins.delete('prefetch');
    //config.plugin('CompressionPlugin').use(CompressionPlugin);
  },
  configureWebpack: {
    // https://webpack.js.org/configuration/externals/
    // 'nom fichier js': 'variable globale'
    externals: {
      //jquery: 'jQuery',
      //vue: 'Vue'
    },
    plugins: [
      // ReferenceError: process is not defined (_stream_writable.js:57)
      // In webpack 5 automatic node.js polyfills are removed.
      // https://stackoverflow.com/questions/65018431/webpack-5-uncaught-referenceerror-process-is-not-defined
      // https://www.journaldunet.fr/developpeur/developpement/1516315-comment-faire-un-polyfill-automatise-dans-webpack-5/
      // https://stackoverflow.com/a/72169560/2332350
      new NodePolyfillPlugin(),
      new webpack.DefinePlugin({
        // conf.js : le seul moyen pour "variabiliser" les paramètres de require.context(...)
        // Même si pas obligatoire ici, on conserve le format VUE_APP_*
        // require.context's arguments must be static and not be variables.
        // webpack need to determine at build time (before any of your code runs) which files need to be bundled.
        // https://webpack.js.org/api/module-methods/#requirecontext
        // Valeurs admises : 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once', default 'sync'
        VUE_APP_LOAD_MODE: JSON.stringify('eager')
      })
    ].concat(
      // On désactive les plugins optionnels pour accélérer le HMR :
      process.env.NODE_ENV === 'development'
        ? []
        : [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename:
                'bundle-analyzer-' + process.env.NODE_ENV + '.html',
              openAnalyzer: false,
              generateStatsFile: false
            }),
            new CompressionPlugin(),
            new DuplicatePackageCheckerPlugin({ verbose: true }),
            new DuplicatesPlugin({ verbose: true })
          ]
    ),
    resolve: {
      alias: {
        // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
        // Les <template>s des fichiers *.vue sont pré-compilés par vue-cli / vue-loader,
        // dans les autres cas on peut intégrer la version complète (runtime+compiler) de Vue.js
        // dans le "bundle" final en utilisant 'vue/dist/vue.esm.js' :
        vue$: 'vue/dist/vue.runtime.esm.js',
        // https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
        // Ces entrées sont là pour réduire la taille des builds de production :
        jquery$: 'jquery/dist/jquery.slim.js',
        // https://bootstrap-vue.org/docs#using-bootstrapvue-source-code-for-smaller-bundles
        // Pour réduire (un peu) la taille du "build final" :
        'bootstrap-vue$': 'bootstrap-vue/src/index.js',
        // https://github.com/ethereum/web3.js/issues/2517#issuecomment-483672442
        // Pour réduire la taille du "build final" en supprimant les injections multiples de bn.js :
        // ./node_modules/bn.js/lib/bn.js (11.17 KB) => version la plus récente, on conserve
        // ./node_modules/public-encrypt/node_modules/bn.js/lib/bn.js (10.88 KB) => version plus ancienne, on supprime
        // ./node_modules/diffie-hellman/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        // ./node_modules/asn1.js/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        // ./node_modules/elliptic/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        // ./node_modules/create-ecdh/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        // ./node_modules/miller-rabin/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        // ./node_modules/browserify-rsa/node_modules/bn.js/lib/bn.js (10.88 KB) => doublon, on supprime
        'bn.js$': getFullPathFor('node_modules/bn.js')
      }
    },
    optimization: {
      // https://stackoverflow.com/a/55372086/2332350
      // Pas de "chunk files", tout sera compilé dans un seul fichier (même les bibliothèques "vendor" en "dependencies" de ce projet).
      // Nécessite que VUE_APP_LOAD_MODE utilise le 'sync' loading mode et que tous les fichiers *.vue qui sont chargés
      // de manière asynchrone via () => import(...) se trouvent dans le répertoire src/components pour que src/conf.js
      // les précharge (en réalité) déjà de manière synchrone (Webpack sait détecter et gérer cela intelligemment au moment du build).
      // IMPORTANT : ne pas oublier d'utiliser les "import magic-comments" sur les imports dynamiques () => import(...)
      // ne se trouvant pas dans le répertoire src/components pour que Webpack leur applique également le bon "loading mode".
      // IMPORTANT: le chargement des styles CSS ne fonctionnera plus avec les web components !!!
      //splitChunks: false
      // https://github.com/ethereum/web3.js/issues/1178#issuecomment-464617646
      // https://github.com/webpack/webpack/issues/2134
      //runtimeChunk: {
      //  name: 'runtime'
      //}
    },
    // https://github.com/Microsoft/vscode-recipes/tree/master/vuejs-cli#vue-cli-3x
    // Pour débugger avec Chrome
    devtool:
      process.env.NODE_ENV === 'production'
        ? // https://webpack.js.org/configuration/devtool/
          'source-map'
        : 'eval-source-map'
  },
  // XXX : utiliser scss et sass en même temps dans un projet vue-cli semble poser problème à bootstrap ...
  // XXX : cela ne semble arriver que s'il y a un répertoire "@/sass" qui contienne des fichiers *.scss
  // "surchargeant" des fichiers de même nom du répertoire "~bootstrap/scss", par exemple "@/sass/variables.scss".
  // La seule solution (si nécessaire) est donc de forcer la compilation de bootstrap *avant* les
  // fichiers du répertoire "@/sass".
  //  css: {
  //    loaderOptions: {
  //      scss: {
  //        // Here we can use the newer SCSS flavor of Sass.
  //        // Note that there *is* a semicolon at the end of the below line
  //        prependData: `@import "~bootstrap/scss/bootstrap.scss";`
  //      }
  //    }
  //  },
  filenameHashing: true,
  // https://cli.vuejs.org/config/#productionsourcemap
  productionSourceMap: false,
  // https://filosophy.org/code/bundling-vue-css-and-js-into-a-single-output-file/
  //css: {
  //  extract: true,
  //},
  //transpileDependencies: ['vuetify'],
  transpileDependencies: ['bootstrap-vue'],
  pluginOptions: {
    i18n: {
      enableInSFC: true
    }
  }
};

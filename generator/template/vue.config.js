const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
//const CompressionPlugin = require('compression-webpack-plugin');

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
      new webpack.DefinePlugin({
        // conf.js : le seul moyen pour "variabiliser" les paramètres de require.context(...)
        // Même si pas obligatoire ici, on conserve le format VUE_APP_*
        // require.context's arguments must be static and not be variables.
        // webpack need to determine at build time (before any of your code runs) which files need to be bundled.
        // https://webpack.js.org/api/module-methods/#requirecontext
        // Valeurs admises : 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once', default 'sync'
        VUE_APP_LOAD_MODE: JSON.stringify('eager')
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analyzer-' + process.env.NODE_ENV + '.html',
        openAnalyzer: false,
        generateStatsFile: false
      })
    ],
    resolve: {
      alias: {
        // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
        // Les <template>s des fichiers *.vue sont pré-compilés par vue-cli / vue-loader,
        // dans les autres cas on peut intégrer la version complète (runtime+compiler) de Vuejs
        // dans le "bundle" final en utilisant 'vue/dist/vue.esm.js' :
        vue$: 'vue/dist/vue.runtime.esm.js',
        // https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
        // Ces entrées sont là pour réduire la taille des builds de production :
        jquery$: 'jquery/dist/jquery.slim.js'
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
    }
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
  productionSourceMap: false
  // https://filosophy.org/code/bundling-vue-css-and-js-into-a-single-output-file/
  //css: {
  //  extract: true,
  //},
  //transpileDependencies: ['vuetify']
};

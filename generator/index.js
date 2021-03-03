const fs = require('fs');
// XXX: require('lignator') will only work with "vue add my-vue-preset" or "npm install --save-dev file:/local/path/to/my-vue-preset"
// + "vue invoke my-vue-preset" but not with "vue create my-vue-project --preset my-vue-preset",
// i.e. it will work if this project is used as a vue-cli plugin but not as a vue-cli preset (no project dependencies will be loaded!),
// so for now we provide a local lignator file as a fallback plan.
// To be used as vue-cli plugin, note that this project should be named in package.json as @MUTASANTE/vue-cli-plugin-preset-tpl
// and registered on npmjs.com as @MUTASANTE/preset-tpl
try {
  var lignator = require('lignator');
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND')
    lignator = require('./lignator');
  else throw e;
}

function directoryExits(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (err) {
    // Catch ENOENT errors
    return false;
  }
}

module.exports = (api, options, rootOptions) => {
  // https://github.com/vxhly/vue-cli-plugin-preset-tpl/blob/master/generator/index.js
  api.extendPackage({
    dependencies: {
      'vue-resource': '*',
      jquery: '*',
      'vue-custom-element': '*'
    },
    devDependencies: {
      sass: '*',
      'sass-loader': '*',
      'webpack-bundle-analyzer': '*',
      'duplicate-package-checker-webpack-plugin': '*',
      'inspectpack': '*',
      'compression-webpack-plugin': '<7.0.0',
      'prettier': '*'
    }
  });

  if (options.installationType == 2) {
    // These options weren't set, so do it now.
    options.axios = true;
    options.bootstrap = true;
    options.bootstrapVue = true;
    options.fontawesome = true;
    options.veevalidate = true;
    options.vueLoadingOverlay = true;
  }

  if (options.installationType != 1) {
    if (options.installationType == 2 || options.axios) {
      api.extendPackage({
        dependencies: {
          axios: '*'
        }
      });
    }

    if (
      options.installationType != 2 &&
      options.bootstrap &&
      !options.bootstrapVue
    ) {
      if (options.popperjs) {
        api.extendPackage({
          dependencies: {
            'popper.js': '*'
          }
        });
      }
      api.extendPackage({
        dependencies: {
          bootstrap: '*'
        }
      });
    }

    if (
      options.installationType == 2 ||
      (options.bootstrap && options.bootstrapVue)
    ) {
      api.extendPackage({
        dependencies: {
          bootstrap: '*',
          'bootstrap-vue': '*'
        }
      });
    }

    if (options.installationType == 2 || options.fontawesome) {
      api.extendPackage({
        dependencies: {
          '@fortawesome/fontawesome-svg-core': '*',
          '@fortawesome/free-solid-svg-icons': '*',
          '@fortawesome/vue-fontawesome': '*',
          '@fortawesome/free-brands-svg-icons': '*',
          '@fortawesome/free-regular-svg-icons': '*'
        }
      });
    }

    if (options.installationType == 2 || options.veevalidate) {
      api.extendPackage({
        dependencies: {
          'vee-validate': '*'
        }
      });
    }

    if (options.installationType == 2 || options.vueLoadingOverlay) {
      api.extendPackage({
        dependencies: {
          'vue-loading-overlay': '*'
        }
      });
    }
  }

  if (!options.globalScriptsPath) {
    // options.globalScriptsPath is not defined because process.env.ARP_PHP_CONF_71 is defined for current installation.
    // Since options.globalScriptsPath is only used in DOS command files, let's use the %ARP_PHP_CONF_71% DOS syntax
    // to make the path truly dynamic.
    options.globalScriptsPath = '%ARP_PHP_CONF_71%';
  }

  api.render('./template', {
    // Embedded JavaScript templates (EJS): https://github.com/mde/ejs
    useAxios: !!options.axios,
    useBootstrap: !!options.bootstrap,
    useBootstrapVue: !!options.bootstrapVue,
    useFontawesome: !!options.fontawesome,
    useVeevalidate: !!options.veevalidate,
    useVueLoadingOverlay: !!options.vueLoadingOverlay,
    globalScriptsPath: options.globalScriptsPath
  });
};

// Vue-cli v4: delete router and store files from their new locations
// https://cli.vuejs.org/migrating-from-v3/#the-global-vue-cli
module.exports.hooks = api => {
  api.afterInvoke(() => {
    // Problem with App.vue not being updated correctly.
    // Workaround at https://github.com/vuejs/vue-cli/issues/5106#issuecomment-579509196 :
    // vue-router must be added to the "plugins" section of the preset.json file.
    //
    //let mainTemplateVuePath = api.resolve('./src/App.tmpl.vue');
    //let mainVuePath = mainTemplateVuePath.replace(/App\.tmpl\.vue$/, 'App.vue');
    //fs.unlinkSync(mainVuePath);
    //fs.renameSync(mainTemplateVuePath, mainVuePath);

    if (directoryExits(api.resolve('./src/store'))) {
      lignator.remove(api.resolve('./src/store'));
    }
    if (directoryExits(api.resolve('./src/router'))) {
      lignator.remove(api.resolve('./src/router'));
    }
  });
};

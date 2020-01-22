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
      axios: '*',
      jquery: '*'
    }
  });

  if (options.bootstrap && options.popperjs) {
    api.extendPackage({
      dependencies: {
        'popper.js': '*'
      }
    });
  }

  if (options.bootstrap) {
    api.extendPackage({
      dependencies: {
        bootstrap: '^4.0'
      }
    });
  }

  if (options.fontawesome) {
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

  if (options.veevalidate) {
    api.extendPackage({
      dependencies: {
        'vee-validate': '*'
      }
    });
  }

  const filesToDelete = ['src/App.vue', 'src/conf.js', 'src/main.js', 'src/router.js', 'src/store.js'];

  api.render(files => {
    Object.keys(files)
      //.filter(path => filesToDelete.indexOf(path) > -1)
      .forEach(path => delete files[path]);
  });

  api.render('./template', {
    // Embedded JavaScript templates (EJS): https://github.com/mde/ejs
    useBootstrap: options.bootstrap,
    useFontawesome: options.fontawesome,
    useVeevalidate: options.veevalidate,
    globalScriptsPath: options.globalScriptsPath
  });
};

// Vue-cli v4: delete router and store files from their new locations
// https://cli.vuejs.org/migrating-from-v3/#the-global-vue-cli
module.exports.hooks = api => {
  api.afterInvoke(() => {
    if (directoryExits(api.resolve('./src/store'))) {
      lignator.remove(api.resolve('./src/store'));
    }
    if (directoryExits(api.resolve('./src/router'))) {
      lignator.remove(api.resolve('./src/router'));
    }
  });
};

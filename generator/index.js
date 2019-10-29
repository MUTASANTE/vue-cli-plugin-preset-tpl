const fs = require('fs');
// XXX: require('lignator') will only work with "vue add ..." but not with "vue create ... --preset ...",
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

  const filesToDelete = ['src/main.js', 'src/router.js', 'src/store.js'];

  api.render(files => {
    Object.keys(files)
      .filter(name => filesToDelete.indexOf(name) > -1)
      .forEach(name => delete files[name]);
  });

  api.render('./template', {
    // Embedded JavaScript templates (EJS): https://github.com/mde/ejs
    useBootstrap: options.bootstrap
  });
};

// Vue-cli v4: delete router and store files from their new locations
// https://cli.vuejs.org/migrating-from-v3/#the-global-vue-cli
module.exports.hooks = api => {
  api.afterInvoke(() => {
    if (fs.lstatSync(api.resolve('./src/store')).isDirectory()) {
      lignator.remove(api.resolve('./src/store'));
    }
    if (fs.lstatSync(api.resolve('./src/router')).isDirectory()) {
      lignator.remove(api.resolve('./src/router'));
    }
  });
};

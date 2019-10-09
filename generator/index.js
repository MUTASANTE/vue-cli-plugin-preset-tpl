module.exports = (api, options, rootOptions) => {
  // https://github.com/vxhly/vue-cli-plugin-preset-tpl/blob/master/generator/index.js
  api.extendPackage({
    'dependencies': {
      'vue-resource': '*',
      'axios': '*',
      'jquery': '*'
    }
  })

  if (options.bootstrap && options.popperjs) {
    api.extendPackage({
      'dependencies': {
        'popper.js': '*'
      }
    })
  }

  if (options.bootstrap) {
    api.extendPackage({
      'dependencies': {
        'bootstrap': '^4.0'
      }
    })
  }

  const filesToDelete = [
    'src/main.js',
    'src/router.js',
    'src/store.js'
  ]

  api.render(files => {
    Object.keys(files)
      .filter(name => filesToDelete.indexOf(name) > -1)
      .forEach(name => delete files[name])
  })

  api.render('./template', {
    // Embedded JavaScript templates (EJS): https://github.com/mde/ejs
    useBootstrap: options.bootstrap
  })
}

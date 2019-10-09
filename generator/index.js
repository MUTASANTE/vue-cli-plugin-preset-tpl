module.exports = (api, options, rootOptions) => {
  // https://github.com/vxhly/vue-cli-plugin-preset-tpl/blob/master/generator/index.js
  api.extendPackage({
    'dependencies': {
      'axios': '*',
      'vue-resource': '*',
      'jquery': '*'
    }
  })

  if (options.bootstrap) {
    api.extendPackage({
      'dependencies': {
        'bootstrap': '^4.0'
      },
      'peerDependencies': {
        'popper.js': '*'
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

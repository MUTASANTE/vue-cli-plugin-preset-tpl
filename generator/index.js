module.exports = api => {
  // https://github.com/vxhly/vue-cli-plugin-preset-tpl/blob/master/generator/index.js
  api.extendPackage({
    'dependencies': {
      'axios': '*',
      'vue-resource': '*'
    }
  })

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

  api.render('./templates')
}

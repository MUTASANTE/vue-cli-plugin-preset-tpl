module.exports = api => {
  api.extendPackage({
    'dependencies': {
      'axios': '*',
      'vue-resource': '*'
    }
  })

  api.render('./templates')
}

module.exports = [
  {
    name: 'bootstrap',
    type: 'confirm',
    message: 'Use bootstrap? ',
    default: false
  },
  {
    name: 'popperjs',
    type: 'confirm',
    message: 'Use popper.js? ',
    default: true,
    // https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/examples/when.js#L18
    when: answers => !!answers.bootstrap
  }
]
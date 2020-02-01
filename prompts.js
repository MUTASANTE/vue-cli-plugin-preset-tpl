const path = require('path');
const dirPath = process.env.NPM_CONFIG_USERCONFIG
  ? path.resolve(process.env.NPM_CONFIG_USERCONFIG, './../../PHPConfiguration')
  : path.resolve(process.cwd(), './PHPConfiguration');

module.exports = [
  {
    name: 'bootstrap',
    type: 'confirm',
    message: 'Use Bootstrap? ',
    default: false
  },
  {
    name: 'bootstrapVue',
    type: 'confirm',
    message: 'Use BootstrapVue (for better Vue.js integration)? ',
    default: true,
    // https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/examples/when.js#L18
    when: answers => !!answers.bootstrap
  },
  {
    name: 'popperjs',
    type: 'confirm',
    message: 'Use popper.js (for extended Bootstrap features)? ',
    default: true,
    // https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/examples/when.js#L18
    when: answers => !!answers.bootstrap && !answers.bootstrapVue
  },
  {
    name: 'fontawesome',
    type: 'confirm',
    message: 'Use vue-fontawesome? ',
    default: false
  },
  {
    name: 'veevalidate',
    type: 'confirm',
    message: 'Use VeeValidate? ',
    default: false
  },
  {
    name: 'globalScriptsPath',
    type: 'input',
    message: 'Path to the global NodeJS, NPM and Vuejs scripts ',
    default: dirPath,
    validate: input => !!input
  }
];

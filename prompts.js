const path = require('path');
const dirPath = process.env.ARP_PHP_CONF_71
  ? path.resolve(process.env.ARP_PHP_CONF_71)
  : process.env.NPM_CONFIG_USERCONFIG
  ? path.resolve(process.env.NPM_CONFIG_USERCONFIG, './../../PHPConfiguration')
  : path.resolve(process.cwd(), './PHPConfiguration');

module.exports = [
  {
    name: 'installationType',
    type: 'list',
    message: 'What kind of installation do you want to do? ',
    choices: [
      { name: 'Minimal', value: 1 },
      { name: 'Complete', value: 2 },
      { name: 'Customized', value: 3 }
    ],
    default: 1 // array index of choice 'Complete'
  },
  {
    name: 'jquery',
    type: 'confirm',
    message: 'Use jQuery? ',
    default: false,
    when: answers => answers.installationType == 3
  },
  {
    name: 'vueResource',
    type: 'confirm',
    message: 'Use vue-resource? ',
    default: false,
    when: answers => answers.installationType == 3
  },
  {
    name: 'axios',
    type: 'confirm',
    message: 'Use axios? ',
    default: true,
    when: answers => answers.installationType == 3
  },
  {
    name: 'bootstrap',
    type: 'confirm',
    message: 'Use Bootstrap? ',
    default: false,
    when: answers => answers.installationType == 3
  },
  {
    name: 'bootstrapVue',
    type: 'confirm',
    message: 'Use BootstrapVue (for better Vue.js integration)? ',
    default: true,
    // https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/examples/when.js#L18
    when: answers => answers.installationType == 3 && answers.bootstrap
  },
  {
    name: 'popperjs',
    type: 'confirm',
    message: 'Use popper.js (for extended Bootstrap features)? ',
    default: true,
    // https://github.com/SBoudrias/Inquirer.js/blob/master/packages/inquirer/examples/when.js#L18
    when: answers =>
      answers.installationType == 3 &&
      answers.bootstrap &&
      !answers.bootstrapVue
  },
  {
    name: 'fontawesome',
    type: 'confirm',
    message: 'Use vue-fontawesome? ',
    default: false,
    when: answers => answers.installationType == 3
  },
  {
    name: 'veevalidate',
    type: 'confirm',
    message: 'Use VeeValidate? ',
    default: true,
    when: answers => answers.installationType == 3
  },
  {
    name: 'vueLoadingOverlay',
    type: 'confirm',
    message: 'Use vue-loading-overlay? ',
    default: true,
    when: answers => answers.installationType == 3
  },
  {
    name: 'globalScriptsPath',
    type: 'input',
    message: 'Path to the global NodeJS, NPM and Vuejs scripts ',
    default: dirPath,
    // when the DOS variable %ARP_PHP_CONF_71% is defined (and not empty),
    // make the path truly dynamic by leaving globalScriptsPath unset
    when: () => !process.env.ARP_PHP_CONF_71,
    validate: input => !!input
  }
];

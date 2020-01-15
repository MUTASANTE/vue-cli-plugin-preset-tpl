const path = require('path');
const dirPath = path.resolve(process.cwd(), '../PHPConfiguration');

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
  },
  {
    name: 'fontawesome',
    type: 'confirm',
    message: 'Use vue-fontawesome? ',
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

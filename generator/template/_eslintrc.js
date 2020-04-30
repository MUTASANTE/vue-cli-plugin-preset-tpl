module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    // Do not use vue-eslint-parser as a lint parser (through "parser: 'vue-eslint-parser'"), because "eslint-plugin-prettier"
    // will still use Vetur's html parser (eslint-plugin-vue?) while the vscode text editor will use vue-eslint-parser.
    // Using different parsers will result in strange behaviors using auto-saving+auto-linting with extension "plugin:vue/recommended".
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    VUE_APP_LOAD_MODE: true
  }
};

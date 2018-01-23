module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017
  },
  plugins: ['prettier'],
  extends: ['eslint-config-airbnb-base', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off'
  }
};

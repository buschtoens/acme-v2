module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017
  },
  plugins: ['node', 'prettier'],
  extends: ['eslint-config-airbnb-base', 'plugin:node/recommended', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'node/no-unsupported-features': ['error', { ignores: ['modules'] }]
  }
};

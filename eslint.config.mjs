// The two theme scripts are plain browser scripts, loaded with require_js and no bundler.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/js/**/*.js'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'script', globals: globals.browser },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.node },
  },
];

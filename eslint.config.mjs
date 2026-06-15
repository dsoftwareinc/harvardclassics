// @ts-check
// Flat ESLint config (ESLint 10 + angular-eslint 22).
// angular-eslint 22 moved its rule presets out of the @angular-eslint/* plugins
// and into the `angular-eslint` meta-package, so the recommended rule sets are
// pulled from there (and from `typescript-eslint`) via the tseslint.config helper.
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    // src/assets holds the static Harvard Classics reading content (raw HTML,
    // not Angular templates) — never lint it.
    ignores: ['www/**', 'coverage/**', 'node_modules/**', '.angular/**', 'src/assets/**'],
  },
  // TypeScript source files.
  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // This app is intentionally NgModule-based with constructor DI (see CLAUDE.md);
      // these defaults push the opposite architecture, so they're disabled here.
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-inject': 'off',
      // `any` is pervasive and tracked as a Known Issue — surface it without blocking lint.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Angular HTML templates.
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {},
  },
);

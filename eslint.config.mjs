// @ts-check
// Flat ESLint config (ESLint 10 + angular-eslint 21).
// Uses the individual angular-eslint / typescript-eslint plugins directly,
// since the `angular-eslint` / `typescript-eslint` meta-packages are not installed.
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';

export default [
  {
    // src/assets holds the static Harvard Classics reading content (raw HTML,
    // not Angular templates) — never lint it.
    ignores: ['www/**', 'coverage/**', 'node_modules/**', '.angular/**', 'src/assets/**'],
  },
  // TypeScript source files.
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angular,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...angular.configs.recommended.rules,
      // This app is intentionally NgModule-based with constructor DI (see CLAUDE.md);
      // these v21 defaults push the opposite architecture, so they're disabled here.
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-inject': 'off',
      // `any` is pervasive and tracked as a Known Issue — surface it without blocking lint.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Angular HTML templates.
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
];

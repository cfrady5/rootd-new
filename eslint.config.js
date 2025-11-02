import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // Prefer the flat config from eslint-plugin-react when available
      (react.configs && react.configs.flat && react.configs.flat.recommended) || [],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Treat variables used in JSX as used and allow leading underscore/uppercase patterns
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^[A-Z_]',
          caughtErrorsIgnorePattern: '^[A-Z_]',
          ignoreRestSiblings: false,
        },
      ],
      // Allow intentionally empty catch blocks (we often ignore best-effort operations)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Ensure variables used in JSX mark as used (prevents false no-unused-vars)
      'react/jsx-uses-vars': 'error',
      // Using React 17+/automatic runtime, so this can be disabled
      'react/react-in-jsx-scope': 'off',
    },
  },
])

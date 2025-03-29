import js from '@eslint/js'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginTailwindCSS from 'eslint-plugin-tailwindcss'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default [
  {
    files: ['**/*.{js,jsx}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      tailwindcss: eslintPluginTailwindCSS,
      import: eslintPluginImport,
      'jsx-a11y': eslintPluginJsxA11y,
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 🔥 ESLint reconocerá JSX sin Babel
        },
      },
      globals: {
        document: 'readonly', // 🔥 Habilita `document`, `window`, etc.
        window: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginTailwindCSS.configs.recommended.rules,
      ...eslintPluginJsxA11y.configs.recommended.rules,
      ...eslintPluginPrettier.configs.recommended.rules,

      'prettier/prettier': ['error'], // 🔥 Prettier validará el formato

      // Reglas generales
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-use-before-define': 'error',
      'dot-notation': 'error',
      eqeqeq: 'error',
      'no-return-await': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'consistent-return': 'error',
      'object-shorthand': 'error',

      // Reglas para React
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-deprecated': 'warn',
      'react/no-unused-state': 'error',
      'react/jsx-fragments': ['error', 'element'], // 🔥 Mantener solo la regla 'element'
      'react/react-in-jsx-scope': 'off', // 🔥 Esta regla se puede desactivar si usas React 17 o posterior
      'react/jsx-curly-brace-presence': 'error',
      'react/self-closing-comp': 'error',

      // Reglas para React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Reglas para Tailwind CSS
      'tailwindcss/no-contradicting-classname': 'error',

      // Reglas para accesibilidad en JSX
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: ['Label'],
          labelAttributes: ['label'],
          controlComponents: ['Input', 'Select'],
        },
      ],
      'jsx-a11y/anchor-is-valid': [
        'error',
        { components: ['Link'], aspects: ['invalidHref', 'preferButton'] },
      ],
    },
  },
]

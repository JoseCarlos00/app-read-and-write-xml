import globals from 'globals';
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/out/',
      'electron.vite.config.mjs', // Ignore Vite config file
      'eslint.config.mjs', // Ignore this ESLint config file
      '**/*.d.ts', // Ignore TypeScript declaration files
    ],
  },

  // Base TypeScript configurations from typescript-eslint
  // This sets up the TypeScript parser and recommended rules for .ts, .tsx, .js, .jsx files
  ...tseslint.configs.recommended,

  // You can opt for type-aware linting by uncommenting the following.
  // This requires `tsconfig.json` to be correctly set up.
  // ...tseslint.configs.recommendedTypeChecked,
  // {
  //   languageOptions: {
  //     parserOptions: {
  //       project: true,
  //       tsconfigRootDir: import.meta.dirname, // Or process.cwd() if tsconfig.json is in root
  //     },
  //   },
  // },

  // Configuration for Renderer process (React, Browser environment)
  {
    files: ['src/renderer/src/**/*.{js,jsx,ts,tsx}'], // Target renderer files
    ...eslintPluginReact.configs.flat.recommended, // Base React rules
    ...eslintPluginReact.configs.flat['jsx-runtime'], // For new JSX transform
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh,
      // 'react' plugin is already included by eslintPluginReact.configs.flat.recommended
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Ensure JSX is enabled
      },
      globals: {
        ...globals.browser, // Define browser global variables
      },
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules, // Rules for Vite React Refresh
      'react/prop-types': 'off', // Not needed with TypeScript
      // 'react/react-in-jsx-scope': 'off', // Handled by jsx-runtime config
      'max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreUrls: true,
        },
      ],
      // You can add/override more rules here, e.g.:
      // '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Configuration for Main process (Node.js environment)
  {
    files: ['src/main/**/*.[jt]s'], // Adjust path if your main process code is elsewhere
    languageOptions: {
      globals: {
        ...globals.node, // Define Node.js global variables
      },
    },
    rules: {
      // Add any Main process specific rules here
    },
  },

  // Configuration for Preload scripts (Node.js + Electron contextIsolation)
  {
    files: ['src/preload/**/*.[jt]s'], // Adjust path if your preload scripts are elsewhere
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // Add any Preload script specific rules here
      // '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintConfigPrettier,
);

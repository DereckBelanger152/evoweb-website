import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    // Application React : exécutée par le navigateur.
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Une promesse non attendue avale silencieusement ses erreurs.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Point d'entrée : il monte l'application et déclare les routes chargées à
    // la demande. Il n'exporte donc aucun composant, ce que la règle du
    // rafraîchissement à chaud interprète à tort comme une erreur.
    files: ['src/main.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Fonctions serverless Vercel et scripts de build : exécutés par Node, pas
    // par le navigateur — globals différents (process, etc.).
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['api/**/*.ts', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
);

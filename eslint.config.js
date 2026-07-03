import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// The engine-no-dom import boundary (DEC-001, constraint `engine-no-dom`):
// src/engine/** is pure TypeScript and must not import React or anything
// DOM-related. Enforced mechanically with no-restricted-imports so the wall
// exists before any engine code does.
const engineForbiddenImports = {
  paths: [
    { name: 'react', message: 'src/engine/** must not import React (engine-no-dom).' },
    { name: 'react-dom', message: 'src/engine/** must not import react-dom (engine-no-dom).' },
    { name: 'react-dom/client', message: 'src/engine/** must not import react-dom (engine-no-dom).' },
  ],
  patterns: [
    {
      group: ['react', 'react-dom', 'react-dom/*', 'react/*'],
      message: 'src/engine/** must not import React (engine-no-dom).',
    },
  ],
};

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', engineForbiddenImports],
    },
  },
  {
    // Node CLI scripts (e.g. the supply-chain license scanner, SPEC-036) run
    // under Node, not the browser — give them Node globals (process, console).
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Prettier last: turn off stylistic rules that conflict with the formatter.
  prettier,
);

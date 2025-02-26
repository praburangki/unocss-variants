import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    vue: false,
  },
  {
    files: ['src/types.ts'],
    rules: {
      'ts/no-empty-object-type': ['error', {
        allowObjectTypes: 'always',
      }],
    },
  },
);

import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    vue: false,
  },
  {
    files: [
      'src/types.ts',
      'src/index.d.ts',
    ],
    rules: {
      'ts/no-empty-object-type': ['error', {
        allowObjectTypes: 'always',
      }],
    },
  },
);

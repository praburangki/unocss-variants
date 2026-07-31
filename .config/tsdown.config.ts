import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    '../src/index.ts',
  ],
  shims: true,
  format: [
    'esm',
  ],
  target: 'node20',
  clean: true,
  minify: true,
  treeshake: true,
  deps: {
    neverBundle: [
      '@vinicunca/perkakas',
    ],
  },
});

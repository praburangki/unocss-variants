import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.js',
  ],
  shims: true,
  format: [
    'cjs',
    'esm',
  ],
  target: 'es2019',
  clean: true,
  minify: true,
  treeshake: true,
  noExternal: [
    '@vinicunca/perkakas',
  ],
});

import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    '../src/index.ts',
  ],
  // Paths resolve relative to this config file, so without this the build lands in `.config/dist`
  outDir: '../dist',
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

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  minify: true,
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  // legacyOutput: true,
});

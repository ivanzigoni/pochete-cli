import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: false,
  splitting: false,
  // Distribuição é um arquivo único via curl, sem node_modules ao lado:
  // embute todas as dependências (commander, execa) no bundle.
  noExternal: [/.*/],
});

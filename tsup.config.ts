import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/engine/components/index.ts',
  },
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: { entry: { components: 'src/engine/components/index.ts' } },
  sourcemap: false,
  splitting: false,
  // Distribuição é um arquivo único via curl, sem node_modules ao lado:
  // embute todas as dependências no bundle, exceto jiti (ver `external`).
  noExternal: ['@inquirer/prompts', 'commander', 'execa', 'mdx-prompt', 'react', 'react-dom'],
  external: ['jiti'],
});

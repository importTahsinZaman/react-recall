import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
  },
  {
    entry: { 'server/index': 'src/server/index.ts' },
    outDir: 'dist',
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    platform: 'node',
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: { 'server-capture/index': 'src/server-capture/index.ts' },
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    platform: 'node',
    target: 'node18',
  },
]);

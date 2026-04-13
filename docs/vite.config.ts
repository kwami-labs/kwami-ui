import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@kwami/ui': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});

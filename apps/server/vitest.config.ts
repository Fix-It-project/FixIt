import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    root: resolve(__dirname),
    include: ['src/**/tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    mockReset: true,
  },
});

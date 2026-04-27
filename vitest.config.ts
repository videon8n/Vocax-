import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/features/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/audio/capabilities.ts',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 65,
        branches: 60,
      },
    },
  },
});

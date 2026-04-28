import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for golden tests on calculator compute() functions.
 *
 * Why we need this: medical calculators where a single off-by-one in a
 * threshold map turns a "low risk DVT" into a "high risk DVT" can hurt
 * a real patient. Golden tests pin compute() outputs to known reference
 * cases from the source guideline (NICE / ESC / WHO) so an editorial
 * change to the prose can never silently shift a band boundary.
 *
 * Coverage strategy: start with the CRITICAL_TOOL_IDS list from
 * next.config.ts, expand to every runner over time. CI fails the PR
 * if golden coverage drops below the previous main.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    reporters: ['default'],
  },
});

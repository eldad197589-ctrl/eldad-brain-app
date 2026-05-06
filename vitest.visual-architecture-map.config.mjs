/* ==== FILE: vitest.visual-architecture-map.config.mjs ==== */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/visual-architecture/visual-architecture-map-seed.test.ts'],
  },
});

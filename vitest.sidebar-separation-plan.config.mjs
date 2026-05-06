/* ==== FILE: vitest.sidebar-separation-plan.config.mjs ==== */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/visual-navigation/sidebar-separation-plan-seed.test.ts'],
  },
});

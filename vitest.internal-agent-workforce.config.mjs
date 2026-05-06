/* ==== FILE: vitest.internal-agent-workforce.config.mjs ==== */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/agent-workforce/internal-agent-workforce-seed.test.ts'],
  },
});

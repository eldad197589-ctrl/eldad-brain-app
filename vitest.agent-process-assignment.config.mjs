/* ==== FILE: vitest.agent-process-assignment.config.mjs ==== */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/agent-process-map/agent-process-assignment-seed.test.ts'],
  },
});

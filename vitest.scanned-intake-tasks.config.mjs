/* ============================================
   FILE: vitest.scanned-intake-tasks.config.mjs
   PURPOSE: Focused Vitest config for scanned intake task candidate tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/scanned-intake-task-candidates.test.ts'],
    pool: 'threads',
  },
};

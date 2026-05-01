/* ============================================
   FILE: vitest.local-workitem-preview.config.mjs
   PURPOSE: Focused Vitest config for the local-only WorkItem preview evaluator tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/local-workitem-preview.test.ts'],
    pool: 'threads',
  },
};

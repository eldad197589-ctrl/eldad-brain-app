/* ============================================
   FILE: vitest.workitem-preview-gate.config.mjs
   PURPOSE: Focused Vitest config for the blocked WorkItem preview gate tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/workitem-preview-gate.test.ts'],
    pool: 'threads',
  },
};

/* ====
   FILE: vitest.workflow-map.config.mjs
   PURPOSE: Focused Vitest config for Stage 11 workflow map contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/workflow/workflow-map-types.test.ts'],
    pool: 'threads',
  },
};

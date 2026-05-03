/* ====
   FILE: vitest.approval-decision.config.mjs
   PURPOSE: Focused Vitest config for Stage 7A Approval Gate contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/approval/approval-decision-types.test.ts'],
    pool: 'threads',
  },
};

/* ====
   FILE: vitest.real-actions-policy.config.mjs
   PURPOSE: Focused Vitest config for Stage 9 real-action policy tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/policy/real-actions-policy-map.test.ts'],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.robium-salary-clients.config.mjs
   PURPOSE: Focused Vitest config for Stage 18 Robium salary client tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/domains/robium-salary-clients-types.test.ts'],
    pool: 'threads',
  },
};

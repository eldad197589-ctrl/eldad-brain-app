/* ============================================
   FILE: vitest.lead-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for lead-to-unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/lead-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

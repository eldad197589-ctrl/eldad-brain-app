/* ============================================
   FILE: vitest.email-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for email-to-unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/email-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

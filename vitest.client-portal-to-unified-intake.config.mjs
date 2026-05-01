/* ============================================
   FILE: vitest.client-portal-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for client portal-to-unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/client-portal-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

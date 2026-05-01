/* ============================================
   FILE: vitest.scan-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for scan-to-unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/scan-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

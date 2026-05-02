/* ============================================
   FILE: vitest.mock-gmail-drive-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for mock Gmail and Drive Unified Intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/mock/mock-gmail-drive-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

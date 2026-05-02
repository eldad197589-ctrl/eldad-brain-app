/* ============================================
   FILE: vitest.mock-email-drive-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for mock Email and Drive Unified Intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/mock/mock-email-drive-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

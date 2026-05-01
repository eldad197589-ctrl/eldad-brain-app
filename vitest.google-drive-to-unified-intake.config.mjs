/* ============================================
   FILE: vitest.google-drive-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for Google Drive-to-unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/google-drive-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

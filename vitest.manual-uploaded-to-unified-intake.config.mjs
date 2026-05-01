/* ============================================
   FILE: vitest.manual-uploaded-to-unified-intake.config.mjs
   PURPOSE: Focused Vitest config for manual/uploaded-file unified intake mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/manual-and-uploaded-file-to-unified-intake.test.ts'],
    pool: 'threads',
  },
};

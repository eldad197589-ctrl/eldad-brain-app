/* ============================================
   FILE: vitest.scanned-intake-staging.config.mjs
   PURPOSE: Focused Vitest config for scanned intake staging mapper tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/scanned-intake-staging.test.ts'],
    pool: 'threads',
  },
};

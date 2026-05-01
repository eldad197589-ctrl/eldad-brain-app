/* ============================================
   FILE: vitest.scanned-folder-recursive.config.mjs
   PURPOSE: Focused Vitest config for recursive scanned folder listing tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/scanned-folder-listing.test.ts'],
    pool: 'threads',
  },
};

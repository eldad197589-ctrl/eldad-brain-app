/* ============================================
   FILE: vitest.learning-types.config.mjs
   PURPOSE: Focused Vitest config for Brain Learning System type contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/system/learning/learning-types.test.ts'],
    pool: 'threads',
  },
};

/* ====
   FILE: vitest.learning-review-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 14 learning review preview tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/learning/learning-review-preview-types.test.ts'],
    pool: 'threads',
  },
};

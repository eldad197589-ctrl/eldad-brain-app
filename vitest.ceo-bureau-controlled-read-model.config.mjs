/* ============================================
   FILE: vitest.ceo-bureau-controlled-read-model.config.mjs
   PURPOSE: Focused Vitest config for Stage 15 controlled read-model tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/ceo-bureau-controlled/ceo-bureau-controlled-read-model-types.test.ts'],
    pool: 'threads',
  },
};

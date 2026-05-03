/* ====
   FILE: vitest.operational-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 8 operational preview contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/operational/operational-preview-types.test.ts'],
    pool: 'threads',
  },
};

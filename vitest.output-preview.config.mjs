/* ====
   FILE: vitest.output-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 10 output preview contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/output-preview/output-preview-types.test.ts'],
    pool: 'threads',
  },
};

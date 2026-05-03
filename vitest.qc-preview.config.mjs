/* ============================================
   FILE: vitest.qc-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 12 static QC preview tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/qc/qc-preview-types.test.ts'],
    pool: 'threads',
  },
};

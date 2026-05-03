/* ============================================
   FILE: vitest.scans-manifest-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 6C-2 static scans manifest preview tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/components/internal/scans-manifest-preview-section.test.tsx'],
    pool: 'threads',
  },
};

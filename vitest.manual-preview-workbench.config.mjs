/* ============================================
   FILE: vitest.manual-preview-workbench.config.mjs
   PURPOSE: Focused Vitest config for Manual Preview Workbench tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/pages/internal/manual-preview-workbench/ManualPreviewWorkbench.test.tsx'],
    pool: 'threads',
  },
};

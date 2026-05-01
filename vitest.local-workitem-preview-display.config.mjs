/* ============================================
   FILE: vitest.local-workitem-preview-display.config.mjs
   PURPOSE: Focused Vitest config for the local WorkItem preview display tests.
   DEPENDENCIES: Vitest, happy-dom
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/local-draft/LocalWorkItemPreviewDisplay.test.tsx'],
    pool: 'threads',
  },
};

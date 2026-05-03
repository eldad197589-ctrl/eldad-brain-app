/* ============================================
   FILE: vitest.unified-provider-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 5E unified provider preview tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/unified-provider-preview-section.test.tsx'],
    pool: 'threads',
  },
};

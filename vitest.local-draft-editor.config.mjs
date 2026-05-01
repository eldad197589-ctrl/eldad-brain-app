/* ============================================
   FILE: vitest.local-draft-editor.config.mjs
   PURPOSE: Focused Vitest config for the local-only draft editor tests.
   DEPENDENCIES: Vitest, happy-dom
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/local-draft-editor.test.tsx'],
    pool: 'threads',
  },
};

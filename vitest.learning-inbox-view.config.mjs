/* ============================================
   FILE: vitest.learning-inbox-view.config.mjs
   PURPOSE: Focused Vitest config for Learning Inbox view tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/learning-inbox-view.test.tsx'],
    pool: 'threads',
  },
};

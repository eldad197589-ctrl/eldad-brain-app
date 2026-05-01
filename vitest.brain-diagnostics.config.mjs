/* ============================================
   FILE: vitest.brain-diagnostics.config.mjs
   PURPOSE: Focused Vitest config for the read-only Brain diagnostics internal view tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/components/internal/brain-diagnostics-view.test.tsx'],
    pool: 'threads',
  },
};

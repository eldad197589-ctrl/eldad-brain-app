/* ============================================
   FILE: vitest.universal-routing-suggestion.config.mjs
   PURPOSE: Focused Vitest config for Universal Routing suggestion UI tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/universal-routing-suggestion.test.tsx'],
    pool: 'threads',
  },
};

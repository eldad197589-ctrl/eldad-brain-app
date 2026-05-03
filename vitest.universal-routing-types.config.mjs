/* ============================================
   FILE: vitest.universal-routing-types.config.mjs
   PURPOSE: Focused Vitest config for Universal Routing type contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/routing/universal-routing-types.test.ts'],
    pool: 'threads',
  },
};

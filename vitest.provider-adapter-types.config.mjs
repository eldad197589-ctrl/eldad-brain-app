/* ============================================
   FILE: vitest.provider-adapter-types.config.mjs
   PURPOSE: Focused Vitest config for provider adapter type contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/providers/provider-adapter-types.test.ts'],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.unified-intake-registry.config.mjs
   PURPOSE: Focused Vitest config for unified intake registry type tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/unified-intake-registry.test.ts'],
    pool: 'threads',
  },
};

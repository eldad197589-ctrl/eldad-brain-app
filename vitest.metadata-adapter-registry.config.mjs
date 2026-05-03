/* ============================================
   FILE: vitest.metadata-adapter-registry.config.mjs
   PURPOSE: Focused Vitest config for Stage 5D metadata adapter registry tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/providers/metadata-adapter-registry.test.ts'],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.protocol-provider-types.config.mjs
   PURPOSE: Focused Vitest config for Stage 6D-1 protocol metadata mapping tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/providers/protocol/protocol-metadata-to-unified-intake-source.test.ts'],
    pool: 'threads',
  },
};

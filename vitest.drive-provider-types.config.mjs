/* ============================================
   FILE: vitest.drive-provider-types.config.mjs
   PURPOSE: Focused Vitest config for Drive metadata mapping tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: [
      'src/work-spine/providers/drive/drive-metadata-to-unified-intake-source.test.ts',
    ],
    pool: 'threads',
  },
};

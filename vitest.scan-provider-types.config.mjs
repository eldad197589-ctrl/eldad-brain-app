/* ============================================
   FILE: vitest.scan-provider-types.config.mjs
   PURPOSE: Focused Vitest config for scan metadata mapping tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: [
      'src/work-spine/providers/scans/scan-metadata-to-unified-intake-source.test.ts',
    ],
    pool: 'threads',
  },
};

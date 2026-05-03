/* ============================================
   FILE: vitest.scan-manifest.config.mjs
   PURPOSE: Focused Vitest config for Stage 6C-1 static scan manifest tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: [
      'src/work-spine/providers/scans/scan-manifest-to-unified-intake-source.test.ts',
    ],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.scanned-intake-inspector.config.mjs
   PURPOSE: Focused Vitest config for the internal scanned intake inspector UI tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/components/internal/scanned-intake-inspector.test.tsx', 'src/components/internal/manual-scan-review.test.tsx'],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.unified-intake-inspector.config.mjs
   PURPOSE: Focused Vitest config for the internal unified intake inspector UI tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/unified-intake-inspector.test.tsx'],
    pool: 'threads',
  },
};

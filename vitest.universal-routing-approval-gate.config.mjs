/* ============================================
   FILE: vitest.universal-routing-approval-gate.config.mjs
   PURPOSE: Focused Vitest config for Universal Routing approval gate UI tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/components/internal/universal-routing-approval-gate.test.tsx'],
    pool: 'threads',
  },
};

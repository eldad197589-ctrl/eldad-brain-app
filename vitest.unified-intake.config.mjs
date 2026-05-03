/* ============================================
   FILE: vitest.unified-intake.config.mjs
   PURPOSE: Focused Vitest config for Stage 3 Unified Intake source hardening tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/intake/unified-intake-source-types.test.ts'],
    pool: 'threads',
  },
};

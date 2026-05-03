/* ============================================
   FILE: vitest.full-brain-blueprint.config.mjs
   PURPOSE: Focused Vitest config for Stage 20 full brain blueprint tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/blueprint/full-brain-blueprint-types.test.ts'],
    pool: 'threads',
  },
};

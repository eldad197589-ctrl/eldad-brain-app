/* ====
   FILE: vitest.evidence-spine.config.mjs
   PURPOSE: Focused Vitest config for Stage 13 Evidence Spine tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/evidence/evidence-spine-types.test.ts'],
    pool: 'threads',
  },
};

/* ====
   FILE: vitest.domain-boundary-index.config.mjs
   PURPOSE: Focused Vitest config for Stage 18F-18G domain boundary index tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

// #region Config
/** Focused Vitest config for the Stage 18F-18G label-only static index tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/domain-boundary-index/domain-boundary-index-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

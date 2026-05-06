/* ==== FILE: vitest.gravity-source-index.config.mjs ==== */

// #region Config
/** Focused Vitest config for Stage 18C Gravity source index tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/gravity-source-index/gravity-source-index-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

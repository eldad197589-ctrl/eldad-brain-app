/* ==== FILE: vitest.knowledge-base-index.config.mjs ==== */

// #region Config
/** Focused Vitest config for Stage 18B Knowledge_Base index tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/knowledge-base-index/knowledge-base-index-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

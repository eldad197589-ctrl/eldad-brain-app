/* ==== FILE: vitest.systems-under-brain-index.config.mjs ==== */

// #region Config
/** Focused Vitest config for Stage 18E systems-under-brain index tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/systems-under-brain-index/systems-under-brain-index-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

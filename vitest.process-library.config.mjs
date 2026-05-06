/* ==== FILE: vitest.process-library.config.mjs ==== */

// #region Config
/** Focused Vitest config for Process Library blueprint seed tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/process-library/process-library-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

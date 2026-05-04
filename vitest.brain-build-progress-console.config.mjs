/* ==== FILE: vitest.brain-build-progress-console.config.mjs ==== */

// #region Config
/** Focused Vitest config for Brain Build Progress Console seed tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/build-progress/brain-build-progress-console-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

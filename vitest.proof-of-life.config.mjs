/* ==== FILE: vitest.proof-of-life.config.mjs ==== */

// #region Config
/** Focused Vitest config for Static Visual Proof Checklist tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/proof-of-life/proof-of-life-standard.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

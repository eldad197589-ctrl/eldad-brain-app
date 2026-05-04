/* ==== FILE: vitest.scanned-evidence-static-batch.config.mjs ==== */

// #region Config
/** Focused Vitest config for static scanned evidence batch tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/scanned-evidence/scanned-evidence-static-batch.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

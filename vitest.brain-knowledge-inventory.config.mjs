/* ==== FILE: vitest.brain-knowledge-inventory.config.mjs ==== */

// #region Config
/** Focused Vitest config for Brain knowledge inventory tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/knowledge-inventory/brain-knowledge-inventory-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

/* ==== FILE: vitest.visual-navigation-inventory.config.mjs ==== */

// #region Config
/** Focused Vitest config for Visual Navigation Inventory tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/visual-navigation/visual-navigation-inventory-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

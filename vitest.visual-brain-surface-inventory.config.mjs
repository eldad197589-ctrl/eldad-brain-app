/* ==== FILE: vitest.visual-brain-surface-inventory.config.mjs ==== */

// #region Config
/** Focused Vitest config for Visual Brain Surface Inventory tests. */
const config = {
  test: {
    environment: 'node',
    include: ['src/work-spine/visual-surface-inventory/visual-brain-surface-inventory-seed.test.ts'],
    pool: 'threads',
  },
};

export default config;
// #endregion

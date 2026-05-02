/* ============================================
   FILE: vitest.settings-freeze.config.mjs
   PURPOSE: Focused Vitest config for the settings live integration freeze tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'happy-dom',
    include: ['src/pages/settings/settings-freeze.test.tsx'],
    pool: 'threads',
  },
};

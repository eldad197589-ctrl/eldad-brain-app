/* ============================================
   FILE: vitest.secure-vault-types.config.mjs
   PURPOSE: Focused Vitest config for secure vault type contract tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/security/secure-vault-types.test.ts'],
    pool: 'threads',
  },
};

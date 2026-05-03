/* ============================================
   FILE: vitest.gmail-provider-types.config.mjs
   PURPOSE: Focused Vitest config for Gmail inbound type and scope tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: [
      'src/work-spine/providers/gmail/gmail-provider-types.test.ts',
      'src/work-spine/providers/gmail/gmail-scope-allowlist.test.ts',
    ],
    pool: 'threads',
  },
};

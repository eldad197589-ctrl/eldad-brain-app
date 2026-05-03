/* ====
   FILE: vitest.daily-operating-snapshot.config.mjs
   PURPOSE: Focused Vitest config for Stage 17 daily operating snapshot tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/daily/daily-operating-snapshot-types.test.ts'],
    pool: 'threads',
  },
};

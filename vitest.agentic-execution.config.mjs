/* ============================================
   FILE: vitest.agentic-execution.config.mjs
   PURPOSE: Focused Vitest config for Stage 16 agentic execution tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/execution/agentic-execution-types.test.ts'],
    pool: 'threads',
  },
};

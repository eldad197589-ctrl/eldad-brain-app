/* ====
   FILE: vitest.multi-agent-ops.config.mjs
   PURPOSE: Focused Vitest config for Stage 19 multi-agent operations tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ==== */

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/agents/multi-agent-ops-types.test.ts'],
    pool: 'threads',
  },
};

/* ============================================
   FILE: vitest.approval-gate-preview.config.mjs
   PURPOSE: Focused Vitest config for Stage 7B Approval Gate preview tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
   ============================================ */

export default {
  test: {
    environment: 'node',
    include: ['src/pages/internal/approval-gate-preview/ApprovalGatePreview.test.tsx'],
    pool: 'threads',
  },
};

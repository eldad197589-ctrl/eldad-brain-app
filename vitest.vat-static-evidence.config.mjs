/*
   FILE: vitest.vat-static-evidence.config.mjs
   PURPOSE: Focused Vitest config for static VAT evidence seed tests.
   DEPENDENCIES: Vitest
   EXPORTS: Vitest config
*/

export default {
  test: {
    environment: 'node',
    include: ['src/work-spine/vat-evidence/vat-static-evidence-seed.test.ts'],
    pool: 'threads',
  },
};

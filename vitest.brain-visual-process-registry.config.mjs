import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/build-progress/brain-visual-process-registry-seed.test.ts'],
  },
});

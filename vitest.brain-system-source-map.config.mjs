import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/build-progress/brain-system-source-map-seed.test.ts'],
  },
});

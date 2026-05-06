import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/work-spine/build-progress/external-knowledge-sources-map-seed.test.ts'],
  },
});

// Vitest config for THE LAST TRAIN's logic/invariant test harness.
//
// Deliberately separate from vite.config.ts (owned by shipping/infra): when a
// vitest.config.ts exists Vitest uses it *instead of* vite.config.ts, so the
// React plugin / dev-server settings never leak into the test run. All tests
// here exercise pure logic + data (engine/, data/) plus the zustand store, so
// a plain node environment is enough; tests/setup/localStorage.ts installs a
// minimal in-memory Web Storage for zustand's persist middleware.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup/localStorage.ts'],
    // Property-style suites iterate over thousands of seeds; keep headroom.
    testTimeout: 20000,
  },
});

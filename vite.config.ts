/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Build-time app identity (surfaced in the Paytable → About section).
// version comes from package.json; the commit SHA + date let us see exactly
// which build is live (prefer a CI-provided SHA, else git, else 'unknown').
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

function gitOut(cmd: string): string | null {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const ciSha =
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.WORKERS_CI_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  null;
const buildSha = (ciSha ? ciSha.slice(0, 7) : gitOut('git rev-parse --short HEAD')) ?? 'unknown';
const buildDate =
  gitOut('git log -1 --format=%cd --date=short') ?? new Date().toISOString().slice(0, 10);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
  },
});

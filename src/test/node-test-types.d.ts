/**
 * Minimal ambient Node.js module declarations for test files.
 *
 * Why: The project does not install @types/node (no Node modules in
 * production app code). Tests that parse source files via fs.readFileSync
 * run in Vitest's Node environment and need these types for tsc --noEmit.
 * Only the signatures actually used in token tests are declared here.
 */

declare module 'fs' {
  function readFileSync(path: string, encoding: BufferEncoding): string;
}

declare module 'path' {
  function resolve(...paths: string[]): string;
}

declare const __dirname: string;

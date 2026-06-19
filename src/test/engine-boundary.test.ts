import { ESLint } from 'eslint';

// Proves the engine-no-dom boundary (DEC-001, constraint `engine-no-dom`) is a
// real, mechanically-enforced rule and not just a convention: it must fire on a
// React import from src/engine/**, and stay silent on a clean engine module.
// Loads the repo's actual flat config via the ESLint Node API.
const eslint = new ESLint();

async function lintEngineModule(source: string) {
  const results = await eslint.lintText(source, {
    filePath: 'src/engine/sample.ts',
  });
  return results[0];
}

describe('engine-no-dom import boundary', () => {
  it('flags a React import from src/engine/**', async () => {
    const result = await lintEngineModule("import 'react'\n");
    const boundaryErrors = result.messages.filter(
      (m) => m.severity === 2 && m.ruleId === 'no-restricted-imports',
    );
    expect(boundaryErrors.length).toBeGreaterThanOrEqual(1);
  });

  it('allows a clean engine module', async () => {
    const result = await lintEngineModule('export const x = 1\n');
    expect(result.errorCount).toBe(0);
  });
});

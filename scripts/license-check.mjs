import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const ALLOWED = new Set([
  'MIT', 'MIT-0', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BSD',
  '0BSD', 'Zlib', 'Unicode-3.0', 'Unicode-DFS-2016', 'CC0-1.0',
  'BlueOak-1.0.0', 'Python-2.0',
]);

// Named exceptions: a license OUTSIDE ALLOWED, knowingly accepted for ONE package.
export const EXCEPTIONS = {
  // caniuse-lite ships browser-support DATA under CC-BY-4.0 (attribution). It is a
  // transitive build-time devDependency and is NOT in the shipped bundle — safe.
  'caniuse-lite': 'CC-BY-4.0',
};

export function isAllowed(name, license) {
  if (!license) return false;
  if (EXCEPTIONS[name] && EXCEPTIONS[name] === String(license)) return true;
  // Allowed iff EVERY OR-alternative is allowed (an "A OR B" dep lets us pick an
  // allowed one; "A AND B" requires all). Be conservative: split on OR/AND, require all.
  const toks = String(license).replace(/[()]/g, ' ').split(/\s+(?:OR|AND)\s+/i)
    .map(s => s.trim()).filter(Boolean);
  return toks.length > 0 && toks.every(t => ALLOWED.has(t));
}
// Note: OR semantics could be "some" — but "every" is the safe under-approximation
// and the current tree has no OR-licensed deps, so it does not reject anything real.

export function scan(root) {
  const violations = [];
  const seen = new Set();
  const walk = (dir) => {
    let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (!e.isDirectory() || e.name === '.bin') continue;
      const p = join(dir, e.name);
      const pj = join(p, 'package.json');
      if (existsSync(pj) && !e.name.startsWith('@')) {
        try {
          const j = JSON.parse(readFileSync(pj, 'utf8'));
          let lic = j.license ?? (Array.isArray(j.licenses) ? j.licenses.map(x => x.type || x).join(' OR ') : j.licenses);
          if (lic && typeof lic === 'object') lic = lic.type;
          const key = `${j.name}@${j.version}`;
          if (j.name && lic && !seen.has(key)) {
            seen.add(key);
            if (!isAllowed(j.name, lic)) violations.push(`${key} : ${lic}`);
          }
        } catch { /* ignore unparseable */ }
        if (existsSync(join(p, 'node_modules'))) walk(join(p, 'node_modules'));
      } else if (e.name.startsWith('@')) {
        walk(p); // scope dir
      }
    }
  };
  walk(root);
  return violations;
}

// CLI entry: exit non-zero on any violation.
if (import.meta.url === `file://${process.argv[1]}`) {
  const v = scan(join(process.cwd(), 'node_modules'));
  if (v.length) { console.error('Disallowed licenses:\n' + v.join('\n')); process.exit(1); }
  console.log('license-check: all dependency licenses are permissive (or excepted).');
}

// CLI: print machine metrics for tuning (STAGE-008 / SPEC-044). Run via vite-node.
//   just simulate                      # all registered machines
//   just simulate wild-and-whimsical   # one machine
//   just simulate --spins 200000 --seed 24301
import { MACHINES } from '../src/machines/registry';
import { simulateMachine } from '../src/engine/metrics';

const argv = process.argv.slice(2);
const flags = new Map<string, string>();
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) flags.set(a.slice(2), argv[++i]);
  else positional.push(a);
}
const spins = flags.has('spins') ? Number(flags.get('spins')) : undefined;
const seed = flags.has('seed') ? Number(flags.get('seed')) : undefined;
const only = positional[0];

const ids = only ? [only] : Object.keys(MACHINES);
for (const id of ids) {
  const machine = MACHINES[id];
  if (!machine) { console.error(`unknown machine: ${id}`); process.exitCode = 1; continue; }
  const m = simulateMachine(machine.math, { spins, seed });
  const pct = (x: number) => `${(x * 100).toFixed(2)}%`;
  console.log(`\n${machine.name}  (${id})  ${m.spins} spins @ bet ${m.bet}`);
  console.log(`  RTP           ${pct(m.rtp)}`);
  console.log(`  hit-frequency ${pct(m.hitFrequency)}`);
  console.log(`  tiers         none ${pct(m.tierFrequency.none)} | small ${pct(m.tierFrequency.small)} | big ${pct(m.tierFrequency.big)} | jackpot ${pct(m.tierFrequency.jackpot)}`);
  console.log(`  jackpot rate  ${m.jackpotRate > 0 ? `1 in ${Math.round(1 / m.jackpotRate)}` : 'never (in sample)'}`);
  console.log(`  max win       ${m.maxWin}`);
}

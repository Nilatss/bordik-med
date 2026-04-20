#!/usr/bin/env node
/**
 * Runtime smoke test: load every runner, derive default values from its
 * `inputs[]` declaration, and invoke compute(values) (for CalculatorTool)
 * to catch runtime errors that tsc can't see (divide-by-zero, undefined
 * access, bad template interpolation, etc.).
 *
 * Uses tsx to load .ts files directly.
 *
 * Usage:
 *   npx tsx scripts/smoke-runners.mjs
 *   or: node --import tsx scripts/smoke-runners.mjs
 */
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');

function pickDefault(inp) {
  // Derive a representative value for this input based on its declared shape.
  switch (inp.type) {
    case 'number': {
      if (Array.isArray(inp.quickValues) && inp.quickValues.length) return inp.quickValues[0];
      if (typeof inp.min === 'number' && typeof inp.max === 'number') {
        return (inp.min + inp.max) / 2;
      }
      if (typeof inp.min === 'number') return inp.min;
      if (typeof inp.max === 'number') return inp.max;
      return 1;
    }
    case 'select': {
      if (Array.isArray(inp.options) && inp.options.length) return inp.options[0].value;
      return '';
    }
    case 'checkbox':
      return false;
    default:
      return undefined;
  }
}

const files = readdirSync(DIR)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

const crashes = [];
const noResult = [];
let ok = 0;

for (const file of files) {
  const id = file.replace('.ts', '');
  const url = pathToFileURL(join(DIR, file)).href;
  try {
    const mod = await import(url);
    const runner = mod.default;
    if (!runner) { crashes.push({ id, error: 'no default export' }); continue; }
    if (!runner.kind) { crashes.push({ id, error: 'missing kind' }); continue; }
    if (!Array.isArray(runner.inputs)) { crashes.push({ id, error: 'no inputs' }); continue; }

    const values = {};
    for (const inp of runner.inputs) values[inp.id] = pickDefault(inp);

    if (runner.kind === 'calculator' && typeof runner.compute === 'function') {
      try {
        const result = runner.compute(values);
        if (!result || typeof result !== 'object') {
          noResult.push({ id, reason: 'compute returned non-object' });
          continue;
        }
        if (result.value === undefined) {
          noResult.push({ id, reason: 'result.value is undefined' });
          continue;
        }
        ok++;
      } catch (e) {
        crashes.push({ id, error: e.message || String(e) });
      }
    } else if (runner.kind === 'score') {
      // score runners don't have compute(); they rely on sum of input scores
      // Just check bands array is there.
      if (!Array.isArray(runner.bands)) {
        crashes.push({ id, error: 'score runner missing bands[]' });
        continue;
      }
      ok++;
    } else {
      crashes.push({ id, error: `unknown kind: ${runner.kind}` });
    }
  } catch (e) {
    crashes.push({ id, error: `import failed: ${e.message}` });
  }
}

console.log(`\n✓ OK: ${ok} / ${files.length}`);
console.log(`✗ Crashes: ${crashes.length}`);
console.log(`⚠ No-result: ${noResult.length}`);

if (crashes.length) {
  console.log('\n--- CRASHES ---');
  for (const c of crashes) console.log(`  ${c.id}: ${c.error}`);
}
if (noResult.length) {
  console.log('\n--- NO RESULT ---');
  for (const c of noResult) console.log(`  ${c.id}: ${c.reason}`);
}

process.exit(crashes.length ? 1 : 0);

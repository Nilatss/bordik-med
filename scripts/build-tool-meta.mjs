#!/usr/bin/env node
/**
 * Regenerate lib/tool-meta-data.ts from the per-runner files in
 * lib/runners/<id>.ts.
 *
 * The metadata is just the list of implemented runner ids plus their
 * `countries` strings — the Tools list page needs this without paying
 * the cost of importing every runner module. Each <id>.ts file declares
 * `const runner: <Type> = { ... }` so we can recover the runner id from
 * the filename and the optional countries string from a top-level
 * `countries: '...'` line inside the literal.
 *
 * Usage:  node scripts/build-tool-meta.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RUNNERS_DIR = join(ROOT, 'lib', 'runners');
const OUT = join(ROOT, 'lib', 'tool-meta-data.ts');

const files = readdirSync(RUNNERS_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

const ids = [];
const countries = {};

for (const f of files) {
  const id = f.replace(/\.ts$/, '');
  ids.push(id);
  const src = readFileSync(join(RUNNERS_DIR, f), 'utf8');
  // Top-level countries field — accept any indentation since formatting
  // varies between hand-written and auto-recovered runners.
  const m = src.match(/^\s+countries:\s*['"]([^'"]+)['"]/m);
  if (m) countries[id] = m[1];
}

let out = '/**\n';
out += ' * AUTO-GENERATED from lib/runners/*.ts by scripts/build-tool-meta.mjs.\n';
out += ' * Do not edit by hand — rerun via `npm run build:tool-meta`.\n';
out += ' *\n';
out += ' * Exists so tool-meta.ts (and therefore ToolsPage) does not need to\n';
out += ' * import every runner module just to know which tools are\n';
out += ' * implemented and which countries they apply to.\n';
out += ' */\n\n';
out += 'export const RUNNER_IDS: readonly string[] = [\n';
for (const id of ids) out += '  ' + JSON.stringify(id) + ',\n';
out += '];\n\n';
out += 'export const RUNNER_COUNTRIES: Readonly<Record<string, string>> = {\n';
for (const [k, v] of Object.entries(countries)) {
  out += '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v) + ',\n';
}
out += '};\n';

writeFileSync(OUT, out);
console.log(`Wrote ${OUT}`);
console.log(`  ${ids.length} runners, ${Object.keys(countries).length} with countries`);

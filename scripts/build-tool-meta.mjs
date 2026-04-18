#!/usr/bin/env node
/**
 * Regenerate lib/tool-meta-data.ts from lib/tools-runners.ts.
 *
 * Extracts just the top-level runner ids and their `countries` strings so
 * the Tools list page can render without importing the ~446 KB runners file.
 *
 * Usage:  node scripts/build-tool-meta.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'lib', 'tools-runners.ts');
const OUT = join(ROOT, 'lib', 'tool-meta-data.ts');

const lines = readFileSync(SRC, 'utf8').split(/\r?\n/);

// Phase 1: locate each runner. A runner is an object whose `kind:` field sits
// at 4-space indent (inside TOOL_RUNNERS). Walk backwards from each `kind:`
// line to the key that introduced the runner.
const runners = [];
for (let i = 0; i < lines.length; i++) {
  if (/^    kind:\s*'(score|calculator)'/.test(lines[i])) {
    for (let j = i - 1; j >= 0; j--) {
      const m = lines[j].match(/^  ([a-zA-Z0-9_-]+|'[^']+'|"[^"]+"):\s*\{?\s*$/);
      if (m) {
        let k = m[1];
        if (k.startsWith("'") || k.startsWith('"')) k = k.slice(1, -1);
        runners.push({ id: k, keyLine: j });
        break;
      }
    }
  }
}

// Phase 2: for each runner, scan its own region for a `countries:` line.
const countries = {};
for (let r = 0; r < runners.length; r++) {
  const start = runners[r].keyLine;
  const end = r + 1 < runners.length ? runners[r + 1].keyLine : lines.length;
  for (let i = start; i < end; i++) {
    const cm = lines[i].match(/^\s{4}countries:\s*['"]([^'"]+)['"]/);
    if (cm) {
      countries[runners[r].id] = cm[1];
      break;
    }
  }
}

const ids = runners.map((r) => r.id);

let out = '/**\n';
out += ' * AUTO-GENERATED from tools-runners.ts by scripts/build-tool-meta.mjs.\n';
out += ' * Do not edit by hand — rerun the script instead.\n';
out += ' *\n';
out += ' * Exists so tool-meta.ts (and therefore ToolsPage) does not need to\n';
out += ' * import the massive runners file just to know which tools are\n';
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

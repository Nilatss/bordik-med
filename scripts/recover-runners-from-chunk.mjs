#!/usr/bin/env node
/**
 * Recovers runners from the Turbopack dev SSR chunk after a git checkout
 * accidentally clobbered the in-progress version of lib/tools-runners.ts.
 *
 * The chunk lives at .next/dev/server/chunks/ssr/lib_tools-runners_ts_*.js
 * and contains a near-original copy of the file wrapped in Turbopack's
 * `__turbopack_context__.s([...exports])` shim. We strip the shim, eval
 * the body in a Node sandbox, then serialise every TOOL_RUNNERS entry
 * back into the source file lib/tools-runners.ts as one big
 * Object.assign block so the splitter can re-emit the per-runner files.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHUNK_DIR = join(ROOT, '.next', 'dev', 'server', 'chunks', 'ssr');
const TARGET = join(ROOT, 'lib', 'tools-runners.ts');

// Find the latest chunk file with name lib_tools-runners_ts_*.js
const candidates = readdirSync(CHUNK_DIR)
  .filter((f) => f.startsWith('lib_tools-runners_ts_') && f.endsWith('.js'));
if (!candidates.length) {
  console.error('No matching chunk file found in', CHUNK_DIR);
  process.exit(1);
}
const chunkPath = join(CHUNK_DIR, candidates[0]);
console.log('Using chunk:', chunkPath);

let chunk = readFileSync(chunkPath, 'utf8');

// The chunk wraps the file body inside:
//   module.exports = ["[project]/lib/tools-runners.ts ...", ((__turbopack_context__) => { ... })]
// Extract just the inner function body.
const arrowStart = chunk.indexOf('((__turbopack_context__) => {');
// Wrapper closes with `\n}),\n];` near the end of the file
const arrowEnd = chunk.lastIndexOf('}),\n];');
if (arrowStart < 0 || arrowEnd < 0) {
  console.error('Could not locate the wrapper bounds in the chunk');
  process.exit(1);
}
// Body sits between `(ctx) => {` and the matching `}` — exclude the brace itself
let body = chunk.slice(arrowStart + '((__turbopack_context__) => {'.length, arrowEnd);

// Replace the namespace-export call with a real `module.exports`.
// __turbopack_context__.s([...]) registers exports — we just need TOOL_RUNNERS,
// so swap the call for an empty noop and add an explicit export at the end.
body = body.replace(/__turbopack_context__\.s\(\[[\s\S]*?\]\);/, '');

// Run the body in a sandbox that captures TOOL_RUNNERS.
const sandbox = { console, module: { exports: {} } };
vm.createContext(sandbox);
const wrapped = `${body}\n;module.exports = { TOOL_RUNNERS };`;
let runners;
try {
  runners = vm.runInContext(wrapped, sandbox).TOOL_RUNNERS;
} catch (e) {
  console.error('Failed to evaluate chunk:', e.message);
  process.exit(1);
}
const ids = Object.keys(runners);
console.log(`Recovered ${ids.length} runners from chunk`);

// Custom serialiser: handles functions by emitting their .toString().
function serialise(value, indent = 2) {
  const pad = (n) => ' '.repeat(n);
  if (value === null) return 'null';
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'function') return value.toString();
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
    return String(value);
  }
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map((v) => pad(indent + 2) + serialise(v, indent + 2));
    return '[\n' + items.join(',\n') + '\n' + pad(indent) + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    const lines = keys.map((k) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return pad(indent + 2) + safeKey + ': ' + serialise(value[k], indent + 2);
    });
    return '{\n' + lines.join(',\n') + '\n' + pad(indent) + '}';
  }
  return JSON.stringify(value);
}

// Read current tools-runners.ts (the 286-runner stub after git checkout) and
// rewrite it: keep types/findBand/sumScore (lines 1..170), then inject one
// TOOL_RUNNERS object with ALL 446 runners.
const existing = readFileSync(TARGET, 'utf8');
const lines = existing.split(/\r?\n/);
// Find the line where the original TOOL_RUNNERS export begins
let cutAt = lines.findIndex((l) => /^export const TOOL_RUNNERS/.test(l));
if (cutAt < 0) {
  // Already truncated — keep first 170 lines (types + helpers).
  cutAt = Math.min(170, lines.length);
}
const header = lines.slice(0, cutAt).join('\n');

// Build the body: a single TOOL_RUNNERS literal with every recovered runner.
let body2 = '\nexport const TOOL_RUNNERS: Record<string, ToolRunner> = {\n';
for (const id of ids) {
  const r = runners[id];
  const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id) ? id : JSON.stringify(id);
  body2 += `  ${safeKey}: ${serialise(r, 2)},\n`;
}
body2 += '};\n\nexport function getRunner(toolId: string): ToolRunner | null {\n  return TOOL_RUNNERS[toolId] || null;\n}\n';

writeFileSync(TARGET, header + body2);
console.log(`✓ Rewrote ${TARGET} with all ${ids.length} runners`);

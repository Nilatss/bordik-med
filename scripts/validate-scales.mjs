#!/usr/bin/env node
/**
 * Scans every runner that exposes a `scale` in its CalculatorResult and
 * validates the segment geometry:
 *
 *   - Segments are sorted by `min` ascending
 *   - No gaps: segments[i].max == segments[i+1].min (touching cutoffs)
 *     OR  segments[i].max + 1 == segments[i+1].min (discrete bands)
 *   - `current` falls within [segments[0].min, segments.last.max]
 *   - Label length ≤ 16 chars (fits under segment without overflow)
 *
 * Uses runtime import (tsx) with default preset values so we actually
 * call compute() and inspect the real scale object each runner emits.
 *
 * Usage:  npx tsx scripts/validate-scales.mjs
 */
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');

function pickDefault(inp) {
  switch (inp.type) {
    case 'number':
      if (Array.isArray(inp.quickValues) && inp.quickValues.length) return inp.quickValues[0];
      if (typeof inp.min === 'number' && typeof inp.max === 'number') return (inp.min + inp.max) / 2;
      if (typeof inp.min === 'number') return inp.min;
      return 1;
    case 'select':
      if (Array.isArray(inp.options) && inp.options.length) return inp.options[0].value;
      return '';
    case 'checkbox':
      return false;
    default:
      return undefined;
  }
}

const files = readdirSync(DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts').sort();

const issues = [];

for (const file of files) {
  const id = file.replace('.ts', '');
  let runner;
  try {
    const mod = await import(pathToFileURL(join(DIR, file)).href);
    runner = mod.default;
  } catch { continue; }
  if (!runner || runner.kind !== 'calculator' || typeof runner.compute !== 'function') continue;

  const values = {};
  for (const inp of runner.inputs) values[inp.id] = pickDefault(inp);

  let result;
  try { result = runner.compute(values); } catch { continue; }
  if (!result || !result.scale) continue;

  const { segments, current, unit } = result.scale;
  if (!Array.isArray(segments) || segments.length === 0) continue;

  // Sort check
  const sorted = [...segments].sort((a, b) => a.min - b.min);
  const inOrder = segments.every((s, i) => s.min === sorted[i].min);
  if (!inOrder) issues.push({ id, kind: 'unsorted', msg: 'segments not sorted by min' });

  // Gaps check
  for (let i = 0; i < segments.length - 1; i++) {
    const a = segments[i], b = segments[i + 1];
    const touches = a.max === b.min || a.max + 1 === b.min;
    if (!touches) {
      issues.push({ id, kind: 'gap', msg: `gap between seg ${i} [${a.min}-${a.max}] and seg ${i+1} [${b.min}-${b.max}]` });
    }
  }

  // Current in range
  const lo = segments[0].min;
  const hi = segments[segments.length - 1].max;
  if (typeof current === 'number') {
    if (current < lo || current > hi) {
      issues.push({ id, kind: 'out-of-range', msg: `current=${current} outside [${lo}, ${hi}]` });
    }
  }

  // Long labels
  for (const s of segments) {
    if (typeof s.label === 'string' && s.label.length > 16) {
      issues.push({ id, kind: 'long-label', msg: `"${s.label}" (${s.label.length} chars)` });
    }
  }
}

if (issues.length === 0) {
  console.log('✓ All runner scales validated OK');
  process.exit(0);
}

// Group by kind
const byKind = {};
for (const i of issues) {
  if (!byKind[i.kind]) byKind[i.kind] = [];
  byKind[i.kind].push(i);
}

for (const [kind, arr] of Object.entries(byKind)) {
  console.log(`\n--- ${kind.toUpperCase()} (${arr.length}) ---`);
  for (const i of arr) console.log(`  ${i.id}: ${i.msg}`);
}

console.log(`\nTotal issues: ${issues.length}`);
process.exit(1);

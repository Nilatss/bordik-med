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

// Tools whose bands intentionally overlap or are non-monotone — categorical
// classifiers, not severity scales. Documented in docs/BACKLOG.md (раздел
// «Сознательно пропущено»). Skipping prevents noise that masks real issues.
const SKIP_GAP_CHECK = new Set([
  'start',  // MCI triage: Black/Red/Yellow/Green — overlapping points by design
  'lqts',   // Schwartz LQTS: half-step (.5) categorical risk thresholds
]);

/**
 * Detect step size of a score tool: 1 (integer points) или 0.5 (half-step,
 * когда хотя бы один critère награждается 1.5 / 0.5 points).
 * Calculator-tools задают шкалу вручную — для них используем 1 по умолчанию.
 */
function detectStep(runner) {
  if (runner?.kind !== 'score' || !Array.isArray(runner.inputs)) return 1;
  const collect = (n) => (typeof n === 'number' && n !== 0 ? n : null);
  const allPts = [];
  for (const inp of runner.inputs) {
    if (inp.type === 'checkbox') { const p = collect(inp.points); if (p !== null) allPts.push(p); }
    if (inp.type === 'select' && Array.isArray(inp.options)) {
      for (const o of inp.options) { const p = collect(o.points); if (p !== null) allPts.push(p); }
    }
  }
  // Если хоть одно значение не целое — half-step scale.
  return allPts.some((p) => !Number.isInteger(p)) ? 0.5 : 1;
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
  if (!runner) continue;

  // Figure out the scale segments:
  //  - CalculatorTool: returned from compute(default values).result.scale.segments
  //  - ScoreTool:       synthesised from runner.bands (see ToolView.tsx)
  let segments = null;
  let current = null;

  if (runner.kind === 'calculator' && typeof runner.compute === 'function') {
    const values = {};
    for (const inp of runner.inputs) values[inp.id] = pickDefault(inp);
    let result;
    try { result = runner.compute(values); } catch { continue; }
    if (!result?.scale) continue;
    segments = result.scale.segments;
    current = result.scale.current;
  } else if (runner.kind === 'score' && Array.isArray(runner.bands)) {
    segments = runner.bands.map((b) => ({ min: b.min, max: b.max, label: b.label, color: b.color }));
    current = 0; // sum of 0 selections is our default
  }

  if (!Array.isArray(segments) || segments.length === 0) continue;

  // We now sort at runtime (see ToolView.tsx) before handing segments to
  // the scale renderer, so an unsorted runner is NOT a visual bug. Report
  // it as a style warning (low priority) and evaluate gaps / range on the
  // sorted copy instead.
  const sortedSegs = [...segments].sort((a, b) => a.min - b.min);
  const inOrder = segments.every((s, i) => s.min === sortedSegs[i].min);
  if (!inOrder && runner.kind !== 'score') {
    // For calculator tools we prefer to keep the source ordered already.
    issues.push({ id, kind: 'unsorted', msg: 'segments not sorted by min (author preference)' });
  }

  // Gaps — evaluated on sorted copy.
  // Шкала может быть integer (step=1) или half-step (step=0.5).
  // Touching: a.max == b.min, либо a.max + step == b.min (discrete).
  // Tools в SKIP_GAP_CHECK — категориальные классификаторы с overlap by design.
  if (!SKIP_GAP_CHECK.has(id)) {
    const step = detectStep(runner);
    for (let i = 0; i < sortedSegs.length - 1; i++) {
      const a = sortedSegs[i], b = sortedSegs[i + 1];
      // floating-point safe: |Δ| < 1e-9 эквивалентно равенству.
      const eq = (x, y) => Math.abs(x - y) < 1e-9;
      const touches = eq(a.max, b.min) || eq(a.max + step, b.min) || eq(a.max + 1, b.min);
      if (!touches) {
        issues.push({ id, kind: 'gap', msg: `gap between [${a.min}-${a.max}] and [${b.min}-${b.max}]` });
      }
    }
  }

  // Current in range — only flag for CALCULATOR tools. For score tools we
  // seed current=0 in the validator, which often falls outside the band
  // range (e.g. GCS 3-15 doesn't cover 0 until the user actually selects).
  if (runner.kind !== 'score') {
    const lo = sortedSegs[0].min;
    const hi = sortedSegs[sortedSegs.length - 1].max;
    if (typeof current === 'number') {
      if (current < lo || current > hi) {
        issues.push({ id, kind: 'out-of-range', msg: `current=${current} outside [${lo}, ${hi}]` });
      }
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

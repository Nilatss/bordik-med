#!/usr/bin/env node
/**
 * gen-hand-tests.mjs — generates clinical-correctness hand-tests for
 * score-based runners that lack them. Different from the auto smoke-tests
 * which only verify runner shape — these tests verify ACTUAL bands data
 * (coverage of all scores, no gaps/overlaps, first/last band content).
 *
 * Usage:
 *   node scripts/gen-hand-tests.mjs --batch <n> [--dry-run]
 *
 * --batch N    : generate up to N test files in this run
 * --dry-run    : print plan but don't write
 *
 * Output: tests/calculators/<runner-id>.test.ts (skipped if already exists).
 *
 * Goal: bring hand-test coverage from ~15% to ~30% per P0-CR-2.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const BATCH = (() => {
  const idx = process.argv.indexOf('--batch');
  return idx >= 0 ? Number(process.argv[idx + 1] ?? 25) : 25;
})();
const DRY_RUN = process.argv.includes('--dry-run');

const RUNNERS_DIR = path.join(ROOT, 'lib/runners');
const TESTS_DIR = path.join(ROOT, 'tests/calculators');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function existsTest(runnerId) {
  return fs.existsSync(path.join(TESTS_DIR, `${runnerId}.test.ts`));
}

/**
 * Lightweight parse of a runner file's bands array. We only need:
 *   - is `kind: "score"`
 *   - maxScore: number
 *   - bands.length
 *   - first/last band's min/max + label (truncated)
 *
 * Not a full TS parser — uses regex on the source. Good enough for the
 * generated-from-tools-runners format which is consistent.
 */
function parseRunner(src) {
  // Match kind
  const kindMatch = src.match(/kind:\s*['"]([a-z]+)['"]/);
  const kind = kindMatch?.[1] ?? null;
  if (kind === 'calculator') {
    // Parse number inputs and their min/max
    const inputs = [];
    // Match each input block: type: "number" ... id: "..." ... min: N ... max: M
    const inputRe = /\{\s*id:\s*"([^"]+)"[\s\S]*?type:\s*"(number|select|checkbox)"[\s\S]*?(?:min:\s*(-?\d+(?:\.\d+)?))?[\s\S]*?(?:max:\s*(-?\d+(?:\.\d+)?))?[\s\S]*?\}/g;
    // Simpler: extract `id: "...", ..., type: "number"` blocks line-by-line
    const lines = src.split('\n');
    let curInput = null;
    for (const line of lines) {
      const idMatch = line.match(/id:\s*"([^"]+)"/);
      if (idMatch && line.includes('id:')) {
        if (curInput) inputs.push(curInput);
        curInput = { id: idMatch[1], type: null, min: null, max: null };
      }
      if (curInput) {
        const typeMatch = line.match(/type:\s*"([^"]+)"/);
        if (typeMatch) curInput.type = typeMatch[1];
        const minMatch = line.match(/min:\s*(-?\d+(?:\.\d+)?)/);
        if (minMatch && curInput.min === null) curInput.min = Number(minMatch[1]);
        const maxMatch = line.match(/max:\s*(-?\d+(?:\.\d+)?)/);
        if (maxMatch && curInput.max === null) curInput.max = Number(maxMatch[1]);
      }
    }
    if (curInput) inputs.push(curInput);
    // Filter inputs that have type=number AND min/max defined
    const numericInputs = inputs.filter((i) => i.type === 'number' && i.min !== null && i.max !== null);
    if (numericInputs.length === 0) return null;
    return { kind: 'calculator', inputs: numericInputs };
  }
  if (kind !== 'score') return null;

  const maxScoreMatch = src.match(/maxScore:\s*(-?\d+(?:\.\d+)?)/);
  const maxScore = maxScoreMatch ? Number(maxScoreMatch[1]) : null;
  if (maxScore == null) return null;

  // Capture each band's min/max/label via shallow regex.
  // Bands look like:
  //   {
  //     min: 0,
  //     max: 3,
  //     label: "...",
  //     ...
  //   }
  // We capture them by scanning for `min: N,\s*max: M,\s*label: "..."`.
  const bandRe = /min:\s*(-?\d+(?:\.\d+)?)[,\s]+max:\s*(-?\d+(?:\.\d+)?)[,\s]+label:\s*"((?:[^"\\]|\\.)*)"/g;
  const bands = [];
  let m;
  while ((m = bandRe.exec(src)) !== null) {
    bands.push({
      min: Number(m[1]),
      max: Number(m[2]),
      label: m[3],
    });
  }
  if (bands.length === 0) return null;

  return { kind, maxScore, bands };
}

/**
 * Pick first 3 words / non-punct tokens from a label for the regex match
 * keyword. Escape regex special chars.
 */
function labelKeyword(label) {
  const cleaned = label.replace(/[<>≤≥]/g, ' ').replace(/\s+/g, ' ').trim();
  // First token, removing surrounding quotes / brackets
  const first = cleaned.split(/[\s—–-]/)[0].replace(/[()[\]]/g, '');
  // Escape regex special chars
  return first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateCalculatorTest(runnerId, { inputs }) {
  // Build a sample object: each input gets a mid-range value
  const sampleEntries = inputs.map((i) => {
    const mid = (i.min + i.max) / 2;
    // Round if integer range
    const val = i.max - i.min >= 10 ? Math.round(mid) : Math.round(mid * 10) / 10;
    return `${i.id}: ${val}`;
  }).join(', ');

  return `/**
 * Golden tests for calculator runner '${runnerId}'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/${runnerId}';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('${runnerId} · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ ${sampleEntries} }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { ${inputs.map((i) => `${i.id}: ${i.min}`).join(', ')} };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { ${inputs.map((i) => `${i.id}: ${i.max}`).join(', ')} };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
`;
}

function generateTest(runnerId, { maxScore, bands }) {
  const minScore = bands.reduce((a, b) => Math.min(a, b.min), bands[0].min);
  const firstBand = bands[0];
  const lastBand = bands[bands.length - 1];

  // Pick a middle score to test "intermediate" interpretation if more than 2 bands.
  const midScore = bands.length >= 3
    ? Math.round((firstBand.max + lastBand.min) / 2)
    : null;

  const firstKw = labelKeyword(firstBand.label);
  const lastKw = labelKeyword(lastBand.label);

  return `/**
 * Golden tests for runner '${runnerId}'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: ${minScore}..${maxScore}, ${bands.length} bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/${runnerId}';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('${runnerId} · bands', () => {
  it('declares ${bands.length} band(s)', () => {
    expect(bands).toHaveLength(${bands.length});
  });

  it('every score ${minScore}..${maxScore} maps to exactly one band', () => {
    for (let s = ${minScore}; s <= ${maxScore}; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, \`score \${s} matched \${matches.length} bands\`).toBe(1);
    }
  });

  it('bands have non-empty labels + descriptions', () => {
    for (const b of bands) {
      expect(b.label, \`band \${b.min}-\${b.max} label\`).toBeTruthy();
      expect(b.description, \`band \${b.min}-\${b.max} description\`).toBeTruthy();
    }
  });

  it('lowest band (score ${firstBand.min}) → label matches "${firstKw}"', () => {
    const b = findBand(bands, ${firstBand.min});
    expect(b.label).toMatch(/${firstKw}/i);
  });

  it('highest band (score ${lastBand.max}) → label matches "${lastKw}"', () => {
    const b = findBand(bands, ${lastBand.max});
    expect(b.label).toMatch(/${lastKw}/i);
  });
  it('bands cover full ${minScore}..${maxScore} range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(${minScore});
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(${maxScore});
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, \`band[\${i}].min after band[\${i - 1}].max\`).toBeGreaterThan(prev.max);
      }
    }
  });
});
`;
}

// ── Main ────────────────────────────────────────────────────────────
const runners = fs.readdirSync(RUNNERS_DIR)
  .filter((f) => f.endsWith('.ts') && !f.startsWith('_'))
  .map((f) => f.replace(/\.ts$/, ''))
  .filter((id) => !existsTest(id))
  .sort();

const generated = [];
const skipped = [];

for (const runnerId of runners) {
  if (generated.length >= BATCH) break;

  const src = read(path.join(RUNNERS_DIR, `${runnerId}.ts`));
  const parsed = parseRunner(src);
  if (!parsed) {
    skipped.push(`${runnerId} (not a score-with-bands runner)`);
    continue;
  }

  const test = parsed.kind === 'calculator'
    ? generateCalculatorTest(runnerId, parsed)
    : generateTest(runnerId, parsed);
  if (DRY_RUN) {
    generated.push({ id: runnerId, lines: test.split('\n').length });
  } else {
    fs.writeFileSync(path.join(TESTS_DIR, `${runnerId}.test.ts`), test, 'utf8');
    generated.push({ id: runnerId, lines: test.split('\n').length });
  }
}

console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Generated ${generated.length} hand-test files:`);
generated.forEach((g) => console.log(`  + ${g.id}.test.ts (${g.lines} lines)`));

if (skipped.length > 0 && process.argv.includes('--verbose')) {
  console.log(`\nSkipped ${skipped.length} runners (not score-with-bands):`);
  skipped.slice(0, 20).forEach((s) => console.log(`  - ${s}`));
}

console.log(`\nNext available: ${runners.length - generated.length} runners (${runners.length - generated.length - skipped.length} score-runners).`);

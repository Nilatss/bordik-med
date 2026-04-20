// Find runners whose scale has one segment that takes > 50% of the total
// visual bar width. That's usually an over-extended "emergency/death"
// band that squashes the clinically useful zones.
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'runners');
const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort();

function pickDefault(inp) {
  switch (inp.type) {
    case 'number':
      if (Array.isArray(inp.quickValues) && inp.quickValues.length) return inp.quickValues[0];
      if (typeof inp.min === 'number' && typeof inp.max === 'number') return (inp.min + inp.max) / 2;
      return 1;
    case 'select': return inp.options?.[0]?.value ?? '';
    case 'checkbox': return false;
    default: return undefined;
  }
}

const issues = [];
for (const file of files) {
  const id = file.replace('.ts', '');
  let runner;
  try { runner = (await import(pathToFileURL(join(DIR, file)).href)).default; } catch { continue; }
  if (!runner) continue;

  let segments = null;
  if (runner.kind === 'calculator' && typeof runner.compute === 'function') {
    const values = {};
    for (const inp of runner.inputs) values[inp.id] = pickDefault(inp);
    try { segments = runner.compute(values)?.scale?.segments; } catch { continue; }
  } else if (runner.kind === 'score' && runner.bands) {
    segments = runner.bands;
  }
  if (!Array.isArray(segments) || segments.length === 0) continue;

  const sorted = [...segments].sort((a, b) => a.min - b.min);
  const total = sorted.reduce((sum, s) => sum + Math.max(0, s.max - s.min), 0);
  if (total <= 0) continue;

  // Find the widest segment and its % of total
  let widest = sorted[0];
  let widestWidth = 0;
  for (const s of sorted) {
    const w = Math.max(0, s.max - s.min);
    if (w > widestWidth) { widestWidth = w; widest = s; }
  }
  const pct = (widestWidth / total) * 100;

  if (pct > 55) {
    issues.push({ id, pct: pct.toFixed(0), widest: widest.label, range: `${widest.min}-${widest.max}` });
  }
}

issues.sort((a, b) => Number(b.pct) - Number(a.pct));
console.log('Runners with one segment >55% of scale width:');
for (const i of issues.slice(0, 40)) {
  console.log(`  ${i.pct.padStart(3)}%  ${i.id.padEnd(18)} "${i.widest}" [${i.range}]`);
}
console.log(`\nTotal: ${issues.length}`);

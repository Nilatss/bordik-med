// Quick audit: show how inputs are split across number/select/checkbox
// for 20 random runners. The spacing rules (24 between sections, 6 between
// checkboxes) apply uniformly because CalculatorBody handles them — this
// just confirms there's a realistic variety of runner shapes being served.
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'runners');
const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort();

// Stratified sample: some with only number, only checkbox, mix
const sample = ['bmi', 'chads-vasc', 'ymrs', 'phq9', 'gcs', 'dka', 'parkland', 'wells-dvt',
                'bishop', 'qtc', 'gleason', 'nihss', '4at', 'apache', 'nmibc', 'iief',
                'psa', 'has-bled', 'tsh', 'cortisol'];

const stats = { onlyNum: 0, onlyCb: 0, onlySel: 0, mixed: 0, numCb: 0, others: 0 };
console.log('Sample of 20 runners:');
for (const id of sample) {
  const url = pathToFileURL(join(DIR, id + '.ts')).href;
  try {
    const mod = await import(url);
    const r = mod.default;
    if (!r?.inputs) { console.log('  ' + id + ': NO INPUTS'); continue; }
    const nums = r.inputs.filter((i) => i.type === 'number').length;
    const sels = r.inputs.filter((i) => i.type === 'select').length;
    const cbs  = r.inputs.filter((i) => i.type === 'checkbox').length;
    const tag = (nums > 0 && cbs > 0) ? 'NUM+CB (separator shown)' :
                (cbs > 0 && nums === 0 && sels === 0) ? 'only checkboxes' :
                (nums > 0 && cbs === 0) ? 'only numbers' :
                (sels > 0 && cbs === 0) ? 'only selects' : 'mixed';
    console.log('  ' + (id + ':').padEnd(14) +
      ' num=' + String(nums).padEnd(2) + ' sel=' + String(sels).padEnd(2) +
      ' cb=' + String(cbs).padEnd(2) + '  → ' + tag);
  } catch (e) {
    console.log('  ' + id + ': FAIL ' + e.message);
  }
}

// Global: count runners by category
let onlyNum = 0, onlyCb = 0, onlySel = 0, numCb = 0, numSel = 0, selCb = 0, all3 = 0, empty = 0;
for (const f of files) {
  const url = pathToFileURL(join(DIR, f)).href;
  try {
    const mod = await import(url);
    const r = mod.default;
    if (!r?.inputs || r.inputs.length === 0) { empty++; continue; }
    const hasNum = r.inputs.some((i) => i.type === 'number');
    const hasSel = r.inputs.some((i) => i.type === 'select');
    const hasCb  = r.inputs.some((i) => i.type === 'checkbox');
    if (hasNum && hasSel && hasCb) all3++;
    else if (hasNum && hasCb) numCb++;
    else if (hasSel && hasCb) selCb++;
    else if (hasNum && hasSel) numSel++;
    else if (hasNum) onlyNum++;
    else if (hasSel) onlySel++;
    else if (hasCb) onlyCb++;
  } catch {}
}
console.log('\nAll ' + files.length + ' runners:');
console.log('  only numbers:        ' + onlyNum);
console.log('  only selects:        ' + onlySel);
console.log('  only checkboxes:     ' + onlyCb);
console.log('  num+select (no cb):  ' + numSel);
console.log('  num+checkbox (SEP):  ' + numCb);
console.log('  select+checkbox (SEP): ' + selCb);
console.log('  num+sel+cb (SEP):    ' + all3);
console.log('  empty/error:         ' + empty);
console.log('\n→ Runners that show the dashed separator: ' + (numCb + selCb + all3));

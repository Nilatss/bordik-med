// Парсит 3 XML таблицы из CMS ICD-10-CM Tabular ZIP:
//   1. Drug Table (Table of Drugs and Chemicals)
//   2. Neoplasm Table
//   3. Alphabetic Index (Index to Diseases and Injuries)
//
// Все три имеют общую структуру с <mainTerm><title> + <term level="N">,
// различаются только содержимым (<cell col="N"> для таблиц, <code>/<see>
// для index).

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Используем sax — потоковый XML парсер (есть в node_modules от vitest deps)
let sax;
try { sax = require('sax'); } catch {
  console.error('Need sax: npm install sax');
  process.exit(1);
}

const SRC_DIR = './data/raw/icd10cm-tabular/Table and Index';

// ─── DRUG TABLE ─────────────────────────────────────────────────────
function parseDrugTable() {
  const xml = fs.readFileSync(`${SRC_DIR}/icd10cm_drug_2026.xml`, 'utf8');
  const parser = sax.parser(true, { trim: true });
  const drugs = []; // [{name, accidental, intentional, assault, undetermined, adverse, underdosing}]

  let currentLetter = '';
  let currentTerm = null;       // {title, cells: {2: '...', 3: '...'}, level}
  const termStack = [];         // for nested <term>
  let inTitle = false;
  let inCell = false;
  let currentCol = 0;
  let inLetterTitle = false;

  parser.onopentag = (node) => {
    if (node.name === 'letter') {
      inLetterTitle = true;
    } else if (node.name === 'title' && inLetterTitle === true && currentTerm === null) {
      // letter title — ignore
    } else if (node.name === 'mainTerm' || node.name === 'term') {
      const newTerm = {
        title: '',
        level: node.attributes.level ? parseInt(node.attributes.level) : 0,
        cells: {},
        parent: currentTerm,
        type: node.name,
      };
      if (currentTerm) termStack.push(currentTerm);
      currentTerm = newTerm;
    } else if (node.name === 'title' && currentTerm) {
      inTitle = true;
    } else if (node.name === 'cell' && currentTerm) {
      inCell = true;
      currentCol = parseInt(node.attributes.col);
    } else if (node.name === 'nemod') {
      // nested modifier — append to current title
      if (inTitle && currentTerm) currentTerm.title += ' ';
    }
  };

  parser.ontext = (text) => {
    if (inLetterTitle && !currentTerm) {
      currentLetter = text.trim();
    } else if (inTitle && currentTerm) {
      currentTerm.title += text;
    } else if (inCell && currentTerm) {
      currentTerm.cells[currentCol] = (currentTerm.cells[currentCol] || '') + text;
    }
  };

  parser.onclosetag = (name) => {
    if (name === 'title') {
      inTitle = false;
      if (inLetterTitle && !currentTerm) inLetterTitle = false;
    } else if (name === 'cell') {
      inCell = false;
    } else if (name === 'mainTerm' || name === 'term') {
      // Build full path: parent titles + current
      const path = [];
      let t = currentTerm;
      while (t) { path.unshift(t.title.trim()); t = t.parent; }
      const fullName = path.join(', ');
      const c = currentTerm.cells;
      // Drug table cells: col 2 (accidental) ... col 7 (underdosing)
      if (c[2] || c[3] || c[4] || c[5] || c[6] || c[7]) {
        drugs.push({
          name: fullName,
          accidental:    c[2]?.trim() === '--' ? null : c[2]?.trim() || null,
          intentional:   c[3]?.trim() === '--' ? null : c[3]?.trim() || null,
          assault:       c[4]?.trim() === '--' ? null : c[4]?.trim() || null,
          undetermined:  c[5]?.trim() === '--' ? null : c[5]?.trim() || null,
          adverse:       c[6]?.trim() === '--' ? null : c[6]?.trim() || null,
          underdosing:   c[7]?.trim() === '--' ? null : c[7]?.trim() || null,
        });
      }
      currentTerm = termStack.pop() || null;
    }
  };

  parser.write(xml).close();
  return drugs;
}

// ─── NEOPLASM TABLE (hierarchical) ─────────────────────────────────
function parseNeoplasmTable() {
  const xml = fs.readFileSync(`${SRC_DIR}/icd10cm_neoplasm_2026.xml`, 'utf8');
  const parser = sax.parser(true, { trim: true });
  const neoplasms = [];

  let currentTerm = null;
  const termStack = [];
  let inTitle = false;
  let inCell = false;
  let currentCol = 0;
  let inSeeAlso = false;

  parser.onopentag = (node) => {
    if (node.name === 'mainTerm' || node.name === 'term') {
      const newTerm = {
        title: '',
        level: node.attributes.level ? parseInt(node.attributes.level) : 0,
        cells: {},
        seeAlso: '',
        parent: currentTerm,
      };
      if (currentTerm) termStack.push(currentTerm);
      currentTerm = newTerm;
    } else if (node.name === 'title' && currentTerm) {
      inTitle = true;
    } else if (node.name === 'cell' && currentTerm) {
      inCell = true;
      currentCol = parseInt(node.attributes.col);
    } else if (node.name === 'seeAlso' && currentTerm) {
      inSeeAlso = true;
    }
  };

  parser.ontext = (text) => {
    if (inTitle && currentTerm) currentTerm.title += text;
    else if (inCell && currentTerm) currentTerm.cells[currentCol] = (currentTerm.cells[currentCol] || '') + text;
    else if (inSeeAlso && currentTerm) currentTerm.seeAlso += text;
  };

  parser.onclosetag = (name) => {
    if (name === 'title') inTitle = false;
    else if (name === 'cell') inCell = false;
    else if (name === 'seeAlso') inSeeAlso = false;
    else if (name === 'mainTerm' || name === 'term') {
      const path = [];
      let t = currentTerm;
      while (t) { path.unshift(t.title.trim()); t = t.parent; }
      const fullName = path.join(', ');
      const c = currentTerm.cells;
      if (c[2] || c[3] || c[4] || c[5] || c[6] || c[7]) {
        neoplasms.push({
          site: fullName,
          primary:    c[2]?.trim() === '--' ? null : c[2]?.trim() || null,
          secondary:  c[3]?.trim() === '--' ? null : c[3]?.trim() || null,
          in_situ:    c[4]?.trim() === '--' ? null : c[4]?.trim() || null,
          benign:     c[5]?.trim() === '--' ? null : c[5]?.trim() || null,
          uncertain:  c[6]?.trim() === '--' ? null : c[6]?.trim() || null,
          unspecified:c[7]?.trim() === '--' ? null : c[7]?.trim() || null,
        });
      } else if (currentTerm.seeAlso) {
        neoplasms.push({
          site: fullName,
          seeAlso: currentTerm.seeAlso.trim(),
        });
      }
      currentTerm = termStack.pop() || null;
    }
  };

  parser.write(xml).close();
  return neoplasms;
}

// ─── ALPHABETIC INDEX (hierarchical, term → code/see/see-also) ─────
function parseIndex() {
  const xml = fs.readFileSync(`${SRC_DIR}/icd10cm_index_2026.xml`, 'utf8');
  const parser = sax.parser(true, { trim: true });
  const entries = [];

  let currentTerm = null;
  const termStack = [];
  let inTitle = false;
  let inCode = false;
  let inSee = false;
  let inSeeAlso = false;

  parser.onopentag = (node) => {
    if (node.name === 'mainTerm' || node.name === 'term') {
      const newTerm = {
        title: '',
        level: node.attributes.level ? parseInt(node.attributes.level) : 0,
        code: '',
        see: '',
        seeAlso: '',
        parent: currentTerm,
      };
      if (currentTerm) termStack.push(currentTerm);
      currentTerm = newTerm;
    } else if (node.name === 'title' && currentTerm) {
      inTitle = true;
    } else if (node.name === 'code' && currentTerm) {
      inCode = true;
    } else if (node.name === 'see' && currentTerm) {
      inSee = true;
    } else if (node.name === 'seeAlso' && currentTerm) {
      inSeeAlso = true;
    }
  };

  parser.ontext = (text) => {
    if (inTitle && currentTerm) currentTerm.title += text;
    else if (inCode && currentTerm) currentTerm.code += text;
    else if (inSee && currentTerm) currentTerm.see += text;
    else if (inSeeAlso && currentTerm) currentTerm.seeAlso += text;
  };

  parser.onclosetag = (name) => {
    if (name === 'title') inTitle = false;
    else if (name === 'code') inCode = false;
    else if (name === 'see') inSee = false;
    else if (name === 'seeAlso') inSeeAlso = false;
    else if (name === 'mainTerm' || name === 'term') {
      const path = [];
      let t = currentTerm;
      while (t) { path.unshift(t.title.trim()); t = t.parent; }
      const fullName = path.join(' → ');
      const o = { term: fullName };
      if (currentTerm.code) o.code = currentTerm.code.trim();
      if (currentTerm.see) o.see = currentTerm.see.trim();
      if (currentTerm.seeAlso) o.seeAlso = currentTerm.seeAlso.trim();
      if (o.code || o.see || o.seeAlso) entries.push(o);
      currentTerm = termStack.pop() || null;
    }
  };

  parser.write(xml).close();
  return entries;
}

// ─── EXECUTE ──────────────────────────────────────────────────────
console.log('Parsing Drug Table...');
const drugs = parseDrugTable();
console.log(`  → ${drugs.length} drug entries`);

console.log('Parsing Neoplasm Table...');
const neoplasms = parseNeoplasmTable();
console.log(`  → ${neoplasms.length} neoplasm entries`);

console.log('Parsing Alphabetic Index...');
const index = parseIndex();
console.log(`  → ${index.length} index entries`);

// Write outputs
fs.writeFileSync('./public/icd10cm-drug-table.json', JSON.stringify(drugs));
fs.writeFileSync('./data/icd10cm-drug-table.json', JSON.stringify(drugs));
fs.writeFileSync('./public/icd10cm-neoplasm.json', JSON.stringify(neoplasms));
fs.writeFileSync('./data/icd10cm-neoplasm.json', JSON.stringify(neoplasms));
fs.writeFileSync('./public/icd10cm-index.json', JSON.stringify(index));
fs.writeFileSync('./data/icd10cm-index.json', JSON.stringify(index));

console.log('\n=== Sizes ===');
for (const f of ['icd10cm-drug-table.json', 'icd10cm-neoplasm.json', 'icd10cm-index.json']) {
  const s = fs.statSync(`./public/${f}`).size;
  console.log(`  ${f}: ${(s/1024/1024).toFixed(2)} MB raw`);
}

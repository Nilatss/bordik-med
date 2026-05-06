// Гибридный мерж: наша ручная база (~427 препаратов / 873 пары
// с РУ-описаниями + recommendations) + DDInter (2496 drugs / 444k pairs
// с severity only, EN-names).
//
// Стратегия:
//   - Existing 873 pairs (manual, RU-описания) → priority
//   - DDInter pairs которых нет в наших 873 → добавляются с
//     source:'ddinter', severity only, без mechanism/RU-описаний
//   - Drugs матчатся по lowercased name_en
//   - Новые DDInter-drugs добавляются с only name_en (RU = transliteration)
//
// Output: data/drug-interactions.json + public/drug-interactions.json
//          version 0.9.0

import fs from 'node:fs';

const path = './data/drug-interactions.json';
const ddinterCsv = './data/raw/ddinter/DDinterTable.csv';

const d = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Нормализация: name_en → drug.id для существующих
const byNameEn = new Map();
for (const drug of d.drugs) {
  if (drug.name_en) byNameEn.set(drug.name_en.toLowerCase().trim(), drug.id);
}

// 2. pair_key → existing pair (priority)
const pairKey = (a, b) => [a, b].sort().join('|');
const existingPairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

// 3. Простая транслитерация English → Cyrillic (для drugs без RU)
const TRANSLIT = {
  a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х',
  i: 'и', j: 'дж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п',
  q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'кс',
  y: 'й', z: 'з',
  ' ': ' ', '-': '-',
};
function transliterate(s) {
  let out = '';
  for (const ch of s.toLowerCase()) out += TRANSLIT[ch] ?? ch;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// 4. Парсим DDInter CSV
const csv = fs.readFileSync(ddinterCsv, 'utf8');
const lines = csv.split(/\r?\n/).filter(Boolean);
lines.shift(); // header

console.log(`DDInter rows: ${lines.length}`);

// Build drug name → DDInter ID map
const ddDrugs = new Map(); // drug name (lowercased) → DDInterID

// Severity mapping
const sevMap = {
  'Major': 'major',
  'Moderate': 'moderate',
  'Minor': 'minor',
  'Unknown': 'minor', // conservative fallback
};

// Стат
let stats = {
  ddinterPairs: 0,
  matched: 0,
  newDrugs: 0,
  newPairs: 0,
  skipped: 0,
};

// First pass: collect all drugs + their canonical name
for (const line of lines) {
  const cols = line.split(',');
  if (cols.length < 5) continue;
  const [, drugA, , drugB] = cols;
  for (const name of [drugA, drugB]) {
    const key = name.toLowerCase().trim();
    if (!ddDrugs.has(key)) ddDrugs.set(key, name.trim());
  }
  stats.ddinterPairs++;
}

console.log(`DDInter unique drugs: ${ddDrugs.size}`);

// Second pass: ensure all DDInter drugs have a our-drug-id
for (const [keyLower, originalName] of ddDrugs) {
  if (byNameEn.has(keyLower)) {
    stats.matched++;
    continue;
  }
  // Create new drug entry
  const id = 'dd_' + keyLower.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  // Avoid id collision
  let finalId = id;
  let suffix = 2;
  while (d.drugs.some(x => x.id === finalId)) {
    finalId = id + '_' + suffix++;
  }
  d.drugs.push({
    id: finalId,
    name_ru: transliterate(originalName),
    name_en: originalName,
    atc: '',
    class_ru: '',
    aliases: [],
    source: 'ddinter',
  });
  byNameEn.set(keyLower, finalId);
  stats.newDrugs++;
}

console.log(`After matching: ${stats.matched} existing matched, ${stats.newDrugs} new drugs added`);

// Third pass: add new pairs
for (const line of lines) {
  const cols = line.split(',');
  if (cols.length < 5) continue;
  const [, drugA, , drugB, level] = cols;
  const idA = byNameEn.get(drugA.toLowerCase().trim());
  const idB = byNameEn.get(drugB.toLowerCase().trim());
  if (!idA || !idB || idA === idB) { stats.skipped++; continue; }

  const k = pairKey(idA, idB);
  if (existingPairs.has(k)) { stats.skipped++; continue; }
  existingPairs.add(k);

  const severity = sevMap[level] || 'minor';
  // Компактный формат: только обязательные поля для DDInter pairs.
  // Расширенные тексты подставляются в UI на лету (общий шаблон для всех
  // DDInter записей — не нужно хранить identical strings 160k раз).
  d.interactions.push({
    drugA: idA,
    drugB: idB,
    severity,
    source: 'ddinter',
  });
  stats.newPairs++;
}

// Update version
d.version = '0.9.0';
d.lastUpdated = '2026-05-07';

// Severity histogram
const sev = {};
for (const i of d.interactions) sev[i.severity] = (sev[i.severity]||0)+1;

// Минифицируем — экономит ~30% size без потери данных
fs.writeFileSync(path, JSON.stringify(d));
fs.writeFileSync('./public/drug-interactions.json', JSON.stringify(d));

console.log('\n=== RESULT ===');
console.log(`Total drugs:        ${d.drugs.length} (was ${d.drugs.length - stats.newDrugs})`);
console.log(`Total pairs:        ${d.interactions.length}`);
console.log(`Skipped (dup/inv):  ${stats.skipped}`);
console.log(`Severity histogram: ${JSON.stringify(sev)}`);
console.log(`File: ${(JSON.stringify(d).length / 1024 / 1024).toFixed(2)} MB`);

// Полный импорт МКБ-10 РФ из официального датасета Минздрава
// (OID 1.2.643.5.1.13.13.11.1005, через ak4nv/mkb10).
// Перезаписывает icd10-starter.json полной базой.
// v1.x.x → v2.0.0 (full Minzdrav)
import fs from 'node:fs';

const csvPath = './data/raw/mkb10-codes.csv';
const outPath = './public/icd10-starter.json';
const dPath = './data/icd10-starter.json';

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split(/\r?\n/).filter(Boolean);
const header = lines.shift();

// CSV format: ID;REC_CODE;MKB_CODE;MKB_NAME;ID_PARENT;ADDL_CODE;ACTUAL;DATE
// Поля заключены в "..." опционально, разделитель ;
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ';' && !inQ) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

const rows = lines.map(parseCsvLine).map(r => ({
  id: r[0],
  recCode: r[1],
  mkbCode: r[2],
  mkbName: r[3],
  idParent: r[4] || null,
  actual: r[6] === '1',
}));

console.log(`Total rows: ${rows.length}`);
console.log(`Active (actual=1): ${rows.filter(r => r.actual).length}`);

// Глава = MKB_CODE — римская цифра (I, II, III, ..., XXII)
const ROMAN = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII)$/;
// Блок = диапазон вида "A00-B99"
const BLOCK = /^[A-Z][0-9]{2}-[A-Z][0-9]{2}$/;
// Код =  буква + 2 цифры (A00) + опционально точка + цифры (A00.0, A00.01)
const CODE = /^[A-Z][0-9]{2}(\.[0-9A-Z]+)?$/;

const chapterRows = rows.filter(r => r.actual && ROMAN.test(r.mkbCode));
const blockRows = rows.filter(r => r.actual && BLOCK.test(r.mkbCode));
const codeRows = rows.filter(r => r.actual && CODE.test(r.mkbCode));

console.log(`Chapters: ${chapterRows.length}`);
console.log(`Blocks:   ${blockRows.length}`);
console.log(`Codes:    ${codeRows.length}`);

// Map: chapter id → roman numeral
const chapterById = new Map();
for (const ch of chapterRows) chapterById.set(ch.id, ch.mkbCode);

// Map: block id → chapter roman
const blockToChapter = new Map();
for (const b of blockRows) {
  const chRoman = chapterById.get(b.idParent);
  if (chRoman) blockToChapter.set(b.id, chRoman);
}

// Walk parents to find chapter for each code
function findChapter(row) {
  let cur = row;
  let safety = 10;
  while (cur && safety-- > 0) {
    if (ROMAN.test(cur.mkbCode)) return cur.mkbCode;
    if (BLOCK.test(cur.mkbCode)) {
      const ch = blockToChapter.get(cur.id);
      if (ch) return ch;
    }
    if (!cur.idParent) return null;
    cur = rows.find(r => r.id === cur.idParent);
  }
  return null;
}

// Build chapter ranges + titles from blockRows + chapterRows
const chapters = chapterRows
  .sort((a, b) => parseInt(a.id) - parseInt(b.id))
  .map(ch => {
    // Range: смотрим первый и последний блок этой главы
    const blocks = blockRows.filter(b => b.idParent === ch.id);
    let range = '';
    if (blocks.length) {
      const first = blocks[0].mkbCode.split('-')[0];
      const last = blocks[blocks.length - 1].mkbCode.split('-')[1];
      range = `${first}-${last}`;
    }
    // Сохраняем человеческие заголовки из существующего файла, если есть
    return {
      id: ch.mkbCode,
      range,
      title: capitalizeRu(ch.mkbName),
    };
  });

function capitalizeRu(s) {
  // CSV содержит UPPERCASE; делаем нормальный регистр (sentence case)
  if (!s) return s;
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Build code list
const codes = [];
const seen = new Set();
for (const r of codeRows) {
  if (seen.has(r.mkbCode)) continue;
  const chapter = findChapter(r);
  if (!chapter) continue;
  seen.add(r.mkbCode);
  codes.push({
    code: r.mkbCode,
    title: capitalizeRu(r.mkbName),
    chapter,
  });
}

// Sort by chapter index, then code
codes.sort((a, b) => {
  if (a.chapter !== b.chapter) {
    const ai = chapters.findIndex(c => c.id === a.chapter);
    const bi = chapters.findIndex(c => c.id === b.chapter);
    return ai - bi;
  }
  return a.code.localeCompare(b.code, 'en');
});

const out = {
  version: '2.0.0',
  lastUpdated: '2026-05-06',
  source: 'Минздрав РФ (FRMR OID 1.2.643.5.1.13.13.11.1005, ред. 2.27); МКБ-10 ВОЗ перевод',
  chapters,
  codes,
};

const json = JSON.stringify(out, null, 2) + '\n';
fs.writeFileSync(outPath, json);
fs.writeFileSync(dPath, json);

const byCh = {};
for (const c of codes) byCh[c.chapter] = (byCh[c.chapter]||0)+1;

console.log('\n=== RESULT ===');
console.log(`Chapters: ${chapters.length}`);
console.log(`Codes:    ${codes.length}`);
console.log('Per chapter:', JSON.stringify(byCh));
console.log(`Written:  ${outPath} (${(json.length/1024/1024).toFixed(2)} MB)`);

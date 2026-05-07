// Импорт ICD-10-CA (Canadian Adaptation, v.2009/2012) из PDF.
// Источник: PDF от пользователя — "List of ICD Codes (v.2009 and v.2012 ICD-10-CA)".
// Формат строки (после pdftotext -layout):
//   A00       Cholera                Cholera
//   A000      Cholera dt 01...       Cholera due to Vibrio cholerae 01, biovar cholerae
//   A00-A09   ... (block — skip)
//   A0580     Foodborne...           Foodborne Vibrio vulnificus intoxication
import fs from 'node:fs';

const srcPath = './data/raw/icd10ca/icd10ca.txt';
const slimPath = './public/icd10ca-slim.json';
const detailsPath = './public/icd10ca-details.json';
const dSlimPath = './data/icd10ca-slim.json';
const dDetailsPath = './data/icd10ca-details.json';

// Стандартные главы ICD-10 (ВОЗ rev.10 — Canada использует тот же список)
const CHAPTERS = [
  { id: 'I',     range: 'A00-B99', title: 'Некоторые инфекционные и паразитарные болезни' },
  { id: 'II',    range: 'C00-D48', title: 'Новообразования' },
  { id: 'III',   range: 'D50-D89', title: 'Болезни крови и кроветворных органов' },
  { id: 'IV',    range: 'E00-E90', title: 'Эндокринные, алиментарные и метаболические нарушения' },
  { id: 'V',     range: 'F00-F99', title: 'Психические и поведенческие расстройства' },
  { id: 'VI',    range: 'G00-G99', title: 'Болезни нервной системы' },
  { id: 'VII',   range: 'H00-H59', title: 'Болезни глаза и его придатков' },
  { id: 'VIII',  range: 'H60-H95', title: 'Болезни уха и сосцевидного отростка' },
  { id: 'IX',    range: 'I00-I99', title: 'Болезни системы кровообращения' },
  { id: 'X',     range: 'J00-J99', title: 'Болезни органов дыхания' },
  { id: 'XI',    range: 'K00-K93', title: 'Болезни органов пищеварения' },
  { id: 'XII',   range: 'L00-L99', title: 'Болезни кожи и подкожной клетчатки' },
  { id: 'XIII',  range: 'M00-M99', title: 'Болезни костно-мышечной системы' },
  { id: 'XIV',   range: 'N00-N99', title: 'Болезни мочеполовой системы' },
  { id: 'XV',    range: 'O00-O99', title: 'Беременность, роды и послеродовой период' },
  { id: 'XVI',   range: 'P00-P96', title: 'Состояния перинатального периода' },
  { id: 'XVII',  range: 'Q00-Q99', title: 'Врождённые аномалии и хромосомные нарушения' },
  { id: 'XVIII', range: 'R00-R99', title: 'Симптомы и признаки, не классифицированные в других рубриках' },
  { id: 'XIX',   range: 'S00-T98', title: 'Травмы, отравления и последствия внешних причин' },
  { id: 'XX',    range: 'V01-Y98', title: 'Внешние причины заболеваемости и смертности' },
  { id: 'XXI',   range: 'Z00-Z99', title: 'Факторы, влияющие на здоровье' },
  { id: 'XXII',  range: 'U00-U85', title: 'Коды для специальных целей' },
];

function chapterOf(code) {
  // Strip dot if present для extraction главы (нужен только первый
  // letter + 2 digit prefix).
  const clean = code.replace('.', '');
  const letter = clean[0];
  const num = parseInt(clean.slice(1, 3));
  if (letter === 'A' || letter === 'B') return 'I';
  if (letter === 'C') return 'II';
  if (letter === 'D' && num <= 48) return 'II';
  if (letter === 'D') return 'III';
  if (letter === 'E') return 'IV';
  if (letter === 'F') return 'V';
  if (letter === 'G') return 'VI';
  if (letter === 'H' && num <= 59) return 'VII';
  if (letter === 'H') return 'VIII';
  if (letter === 'I') return 'IX';
  if (letter === 'J') return 'X';
  if (letter === 'K') return 'XI';
  if (letter === 'L') return 'XII';
  if (letter === 'M') return 'XIII';
  if (letter === 'N') return 'XIV';
  if (letter === 'O') return 'XV';
  if (letter === 'P') return 'XVI';
  if (letter === 'Q') return 'XVII';
  if (letter === 'R') return 'XVIII';
  if (letter === 'S' || letter === 'T') return 'XIX';
  if (letter === 'V' || letter === 'W' || letter === 'X' || letter === 'Y') return 'XX';
  if (letter === 'Z') return 'XXI';
  if (letter === 'U') return 'XXII';
  return null;
}

function restoreDot(code) {
  // Если точка уже есть → возвращаем как есть.
  if (code.includes('.')) return code;
  // A00 — без точки. A000 → A00.0. A0000 → A00.00.
  if (code.length <= 3) return code;
  return code.slice(0, 3) + '.' + code.slice(3);
}

const txt = fs.readFileSync(srcPath, 'utf8');
const lines = txt.split(/\r?\n/);

const codes = [];
const details = {};
const seen = new Set();

// Regex: code (3-7 chars no dash, опционально с точкой типа B20.0)
// + 2+ spaces + description (одно или два поля разделённых 2+ пробелами).
const codeRe = /^([A-Z][0-9]{2,5}|[A-Z][0-9]{2}\.[0-9]{1,3})\s{2,}(\S.+)$/;

for (const line of lines) {
  const trimmed = line.replace(/\s+$/, '');
  if (!trimmed) continue;

  const m = trimmed.match(codeRe);
  if (!m) continue;

  const rawCode = m[1];
  if (rawCode.includes('-')) continue;

  // Разбиваем оставшуюся часть строки на short/long если есть 2+ пробелов
  const rest = m[2];
  const splitMatch = rest.match(/^(\S.+?)\s{2,}(\S.+)$/);
  let shortDesc, longDesc;
  if (splitMatch) {
    shortDesc = splitMatch[1].trim();
    longDesc = splitMatch[2].trim();
  } else {
    // Одна колонка описания (short=long)
    shortDesc = rest.trim();
    longDesc = rest.trim();
  }

  const code = restoreDot(rawCode);
  if (seen.has(code)) continue;
  seen.add(code);

  const chapter = chapterOf(rawCode);
  if (!chapter) continue;

  codes.push({
    code,
    title: longDesc,
    chapter,
  });

  if (shortDesc.toLowerCase() !== longDesc.toLowerCase()) {
    details[code] = { codingNote: shortDesc };
  }
}

const slim = {
  version: '1.0.0',
  release: 'v.2009/2012',
  lastUpdated: '2013-06-24',
  source: 'ICD-10-CA (Canadian Institute for Health Information) — public PDF v.2009/2012',
  license: 'CIHI — некоммерческое использование с указанием авторства',
  chapters: CHAPTERS,
  codes,
};

fs.writeFileSync(slimPath, JSON.stringify(slim));
fs.writeFileSync(dSlimPath, JSON.stringify(slim));
fs.writeFileSync(detailsPath, JSON.stringify(details));
fs.writeFileSync(dDetailsPath, JSON.stringify(details));

const stats = {};
for (const c of codes) stats[c.chapter] = (stats[c.chapter]||0)+1;
const slimSize = fs.statSync(slimPath).size;

console.log('=== ICD-10-CA imported ===');
console.log(`Total codes: ${codes.length.toLocaleString()}`);
console.log(`Details: ${Object.keys(details).length.toLocaleString()} entries`);
console.log(`File: ${(slimSize / 1024 / 1024).toFixed(2)} MB raw`);
console.log('Per chapter:');
for (const ch of CHAPTERS) {
  console.log(`  ${ch.id.padEnd(5)}  ${(stats[ch.id] || 0).toString().padStart(5)}  ${ch.range.padEnd(8)}  ${ch.title}`);
}

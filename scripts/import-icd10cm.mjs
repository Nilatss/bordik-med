// Импорт ICD-10-CM (US Clinical Modification) FY2026 от CMS.
// Источник: https://www.cms.gov/files/zip/2026-code-descriptions-tabular-order.zip
// (public domain, US Federal).
//
// Формат входа (icd10cm_codes_2026.txt):
//   A000    Cholera due to Vibrio cholerae 01, biovar cholerae
//   ...
//
// Output: public/icd10cm-slim.json (формат как у МКБ-11 slim)
import fs from 'node:fs';

const srcPath = './data/raw/icd10cm-2026/icd10cm_codes_2026.txt';
const orderPath = './data/raw/icd10cm-2026/icd10cm_order_2026.txt';
const slimPath = './public/icd10cm-slim.json';
const detailsPath = './public/icd10cm-details.json';
const dSlimPath = './data/icd10cm-slim.json';
const dDetailsPath = './data/icd10cm-details.json';

// ICD-10-CM chapter ranges (стандартные FY2026)
const CHAPTERS = [
  { id: '01', range: 'A00-B99', title_en: 'Certain infectious and parasitic diseases', title_ru: 'Некоторые инфекционные и паразитарные болезни' },
  { id: '02', range: 'C00-D49', title_en: 'Neoplasms', title_ru: 'Новообразования' },
  { id: '03', range: 'D50-D89', title_en: 'Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism', title_ru: 'Болезни крови и кроветворных органов' },
  { id: '04', range: 'E00-E89', title_en: 'Endocrine, nutritional and metabolic diseases', title_ru: 'Эндокринные, алиментарные и метаболические нарушения' },
  { id: '05', range: 'F01-F99', title_en: 'Mental, Behavioral and Neurodevelopmental disorders', title_ru: 'Психические и поведенческие расстройства' },
  { id: '06', range: 'G00-G99', title_en: 'Diseases of the nervous system', title_ru: 'Болезни нервной системы' },
  { id: '07', range: 'H00-H59', title_en: 'Diseases of the eye and adnexa', title_ru: 'Болезни глаза и его придатков' },
  { id: '08', range: 'H60-H95', title_en: 'Diseases of the ear and mastoid process', title_ru: 'Болезни уха и сосцевидного отростка' },
  { id: '09', range: 'I00-I99', title_en: 'Diseases of the circulatory system', title_ru: 'Болезни системы кровообращения' },
  { id: '10', range: 'J00-J99', title_en: 'Diseases of the respiratory system', title_ru: 'Болезни органов дыхания' },
  { id: '11', range: 'K00-K95', title_en: 'Diseases of the digestive system', title_ru: 'Болезни органов пищеварения' },
  { id: '12', range: 'L00-L99', title_en: 'Diseases of the skin and subcutaneous tissue', title_ru: 'Болезни кожи и подкожной клетчатки' },
  { id: '13', range: 'M00-M99', title_en: 'Diseases of the musculoskeletal system and connective tissue', title_ru: 'Болезни костно-мышечной системы' },
  { id: '14', range: 'N00-N99', title_en: 'Diseases of the genitourinary system', title_ru: 'Болезни мочеполовой системы' },
  { id: '15', range: 'O00-O9A', title_en: 'Pregnancy, childbirth and the puerperium', title_ru: 'Беременность, роды и послеродовой период' },
  { id: '16', range: 'P00-P96', title_en: 'Certain conditions originating in the perinatal period', title_ru: 'Состояния перинатального периода' },
  { id: '17', range: 'Q00-Q99', title_en: 'Congenital malformations, deformations and chromosomal abnormalities', title_ru: 'Врождённые аномалии и хромосомные нарушения' },
  { id: '18', range: 'R00-R99', title_en: 'Symptoms, signs and abnormal findings, not elsewhere classified', title_ru: 'Симптомы и признаки, не классифицированные в других рубриках' },
  { id: '19', range: 'S00-T88', title_en: 'Injury, poisoning and certain other consequences of external causes', title_ru: 'Травмы, отравления и последствия внешних причин' },
  { id: '20', range: 'V00-Y99', title_en: 'External causes of morbidity', title_ru: 'Внешние причины заболеваемости' },
  { id: '21', range: 'Z00-Z99', title_en: 'Factors influencing health status and contact with health services', title_ru: 'Факторы, влияющие на здоровье' },
  { id: '22', range: 'U00-U85', title_en: 'Codes for special purposes', title_ru: 'Коды для специальных целей' },
];

/** Восстановить точку: A000 → A00.0, A0100 → A01.00, S82301A → S82.301A. */
function restoreDot(code) {
  if (code.length <= 3) return code; // A00 — без точки
  return code.slice(0, 3) + '.' + code.slice(3);
}

/** Определить главу по коду. */
function chapterOf(code) {
  const letter = code[0];
  const num = parseInt(code.slice(1, 3));
  if (letter === 'A' || letter === 'B') return '01';
  if (letter === 'C') return '02';
  if (letter === 'D' && num <= 49) return '02';
  if (letter === 'D') return '03';
  if (letter === 'E' && num <= 89) return '04';
  if (letter === 'F') return '05';
  if (letter === 'G') return '06';
  if (letter === 'H' && num <= 59) return '07';
  if (letter === 'H') return '08';
  if (letter === 'I') return '09';
  if (letter === 'J') return '10';
  if (letter === 'K' && num <= 95) return '11';
  if (letter === 'L') return '12';
  if (letter === 'M') return '13';
  if (letter === 'N') return '14';
  if (letter === 'O') return '15';
  if (letter === 'P') return '16';
  if (letter === 'Q') return '17';
  if (letter === 'R') return '18';
  if (letter === 'S' || letter === 'T') return '19';
  if (letter === 'V' || letter === 'W' || letter === 'X' || letter === 'Y') return '20';
  if (letter === 'Z') return '21';
  if (letter === 'U') return '22';
  return null;
}

const txt = fs.readFileSync(srcPath, 'utf8');
const lines = txt.split(/\r?\n/).filter(Boolean);

const codes = [];
for (const line of lines) {
  // Format: code, then whitespace, then description (rest of line)
  const m = line.match(/^(\S+)\s+(.+)$/);
  if (!m) continue;
  const rawCode = m[1];
  const desc = m[2].trim();
  const code = restoreDot(rawCode);
  const chapter = chapterOf(rawCode);
  if (!chapter) continue;
  codes.push({
    code,
    title: desc,
    chapter,
  });
}

// Slim output: chapters with English titles + Russian for nav
const slim = {
  version: '1.0.0',
  release: 'FY2026',
  lastUpdated: '2025-10-01',
  source: 'CMS ICD-10-CM FY2026 (effective October 1, 2025)',
  license: 'Public domain (US Federal — CMS / NCHS)',
  chapters: CHAPTERS.map(c => ({
    id: c.id,
    range: c.range,
    title: c.title_ru, // RU для навигации
    title_en: c.title_en,
  })),
  codes,
};

const slimJson = JSON.stringify(slim);
fs.writeFileSync(slimPath, slimJson);
fs.writeFileSync(dSlimPath, slimJson);

// ICD-10-CM не имеет definitions/inclusion/exclusion в свободном доступе
// (это есть только в платных Tabular List от AMA/AAPC). Details = пустой.
const detailsJson = JSON.stringify({});
fs.writeFileSync(detailsPath, detailsJson);
fs.writeFileSync(dDetailsPath, detailsJson);

const stats = {};
for (const c of codes) stats[c.chapter] = (stats[c.chapter]||0)+1;

console.log('=== ICD-10-CM FY2026 imported ===');
console.log(`Total codes: ${codes.length.toLocaleString()}`);
console.log(`File: ${(slimJson.length / 1024 / 1024).toFixed(2)} MB raw`);
console.log('Per chapter:');
for (const ch of CHAPTERS) {
  console.log(`  ${ch.id}  ${(stats[ch.id] || 0).toString().padStart(5)}  ${ch.range.padEnd(8)}  ${ch.title_ru}`);
}

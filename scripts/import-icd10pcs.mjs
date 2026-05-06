// Импорт ICD-10-PCS (Procedure Coding System) FY2026 от CMS.
// Источник: https://www.cms.gov/files/zip/2026-icd-10-pcs-codes-file.zip
// Лицензия: Public domain (US Federal — CMS).
//
// Формат: 7-character codes, без точек.
//   0016070 Bypass Cerebral Ventricle to Nasopharynx with Autologous Tissue Substitute, Open Approach
//
// Структура PCS-кода:
//   Pos 1: Section (0=Med/Surg, B=Imaging, ...)
//   Pos 2: Body System
//   Pos 3: Root Operation
//   Pos 4: Body Part
//   Pos 5: Approach (0=Open, 3=Percutaneous, etc.)
//   Pos 6: Device
//   Pos 7: Qualifier
//
// Sections служат "главами" в нашей UI-модели.
import fs from 'node:fs';

const srcPath = './data/raw/icd10pcs-2026/icd10pcs_codes_2026.txt';
const slimPath = './public/icd10pcs-slim.json';
const detailsPath = './public/icd10pcs-details.json';
const dSlimPath = './data/icd10pcs-slim.json';
const dDetailsPath = './data/icd10pcs-details.json';

// PCS sections — первая позиция кода → название
const SECTIONS = [
  { id: '0', range: '0xxxxxx', title_en: 'Medical and Surgical',                                     title_ru: 'Лечебные и хирургические процедуры' },
  { id: '1', range: '1xxxxxx', title_en: 'Obstetrics',                                                title_ru: 'Акушерство' },
  { id: '2', range: '2xxxxxx', title_en: 'Placement',                                                 title_ru: 'Размещение' },
  { id: '3', range: '3xxxxxx', title_en: 'Administration',                                            title_ru: 'Введение веществ' },
  { id: '4', range: '4xxxxxx', title_en: 'Measurement and Monitoring',                                title_ru: 'Измерения и мониторинг' },
  { id: '5', range: '5xxxxxx', title_en: 'Extracorporeal or Systemic Assistance and Performance',     title_ru: 'Экстракорпоральная поддержка' },
  { id: '6', range: '6xxxxxx', title_en: 'Extracorporeal or Systemic Therapies',                      title_ru: 'Экстракорпоральная терапия' },
  { id: '7', range: '7xxxxxx', title_en: 'Osteopathic',                                               title_ru: 'Остеопатические процедуры' },
  { id: '8', range: '8xxxxxx', title_en: 'Other Procedures',                                          title_ru: 'Другие процедуры' },
  { id: '9', range: '9xxxxxx', title_en: 'Chiropractic',                                              title_ru: 'Хиропрактика' },
  { id: 'B', range: 'Bxxxxxx', title_en: 'Imaging',                                                   title_ru: 'Лучевая диагностика' },
  { id: 'C', range: 'Cxxxxxx', title_en: 'Nuclear Medicine',                                          title_ru: 'Ядерная медицина' },
  { id: 'D', range: 'Dxxxxxx', title_en: 'Radiation Therapy',                                         title_ru: 'Лучевая терапия' },
  { id: 'F', range: 'Fxxxxxx', title_en: 'Physical Rehabilitation and Diagnostic Audiology',          title_ru: 'Реабилитация и диагностическая аудиология' },
  { id: 'G', range: 'Gxxxxxx', title_en: 'Mental Health',                                             title_ru: 'Психиатрические процедуры' },
  { id: 'H', range: 'Hxxxxxx', title_en: 'Substance Abuse Treatment',                                 title_ru: 'Лечение зависимостей' },
  { id: 'X', range: 'Xxxxxxx', title_en: 'New Technology',                                            title_ru: 'Новые технологии' },
];

const txt = fs.readFileSync(srcPath, 'utf8');
const lines = txt.split(/\r?\n/).filter(Boolean);

const codes = [];
for (const line of lines) {
  const m = line.match(/^(\S{7})\s+(.+)$/);
  if (!m) continue;
  const code = m[1];
  const desc = m[2].trim();
  const section = code[0];
  if (!SECTIONS.some((s) => s.id === section)) continue;
  codes.push({ code, title: desc, chapter: section });
}

const slim = {
  version: '1.0.0',
  release: 'FY2026',
  lastUpdated: '2025-10-01',
  source: 'CMS ICD-10-PCS FY2026 (effective October 1, 2025)',
  license: 'Public domain (US Federal — CMS)',
  chapters: SECTIONS.map(s => ({
    id: s.id,
    range: s.range,
    title: s.title_ru,
    title_en: s.title_en,
  })),
  codes,
};

fs.writeFileSync(slimPath, JSON.stringify(slim));
fs.writeFileSync(dSlimPath, JSON.stringify(slim));
fs.writeFileSync(detailsPath, '{}');
fs.writeFileSync(dDetailsPath, '{}');

const stats = {};
for (const c of codes) stats[c.chapter] = (stats[c.chapter]||0)+1;

const slimSize = fs.statSync(slimPath).size;
console.log('=== ICD-10-PCS FY2026 imported ===');
console.log(`Total codes: ${codes.length.toLocaleString()}`);
console.log(`File: ${(slimSize / 1024 / 1024).toFixed(2)} MB raw`);
console.log('Per section:');
for (const s of SECTIONS) {
  console.log(`  ${s.id}  ${(stats[s.id] || 0).toString().padStart(6)}  ${s.title_ru}`);
}

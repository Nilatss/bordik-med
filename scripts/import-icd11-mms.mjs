// Импорт МКБ-11 (ICD-11 MMS) из официального WHO simpleTabulation.xlsx.
// Версия 2018-12 (последняя в открытом доступе без регистрации).
// Источник: https://icd.who.int (официальный экспорт WHO).
//
// Создаёт public/icd11-mms.json + data/icd11-mms.json со структурой:
//   { version, lastUpdated, source, chapters[], codes[] }
// Где chapter = глава (1..26), code = MMS код (1A00, BA00 и т.п.).
//
// Definitions/descriptions WHO предоставляет только через REST API (auth),
// поэтому Phase 1 — без описаний; Phase 2 будет добавление definitions.

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Программный парсинг xlsx через npm-пакет (xlsx-cli ставит CSV-разделителем
// своё имя — баг — поэтому используем библиотеку напрямую).
const XLSX = require('xlsx');

const xlsxPath = './data/raw/icd11-mms.xlsx';
const outPath = './public/icd11-mms.json';
const dPath = './data/icd11-mms.json';

const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

console.log(`Total rows in xlsx: ${rows.length}`);
console.log(`Sample row keys: ${Object.keys(rows[0]).join(', ')}`);

// Названия столбцов (могут начинаться с BOM)
function col(row, ...names) {
  for (const n of names) {
    for (const k of Object.keys(row)) {
      if (k.replace(/^﻿/, '').trim() === n) return row[k];
    }
  }
  return null;
}

// Главы 01..26 — заголовки
const CHAPTER_TITLES_RU = {
  '01': 'Некоторые инфекционные или паразитарные болезни',
  '02': 'Новообразования',
  '03': 'Болезни крови или кроветворных органов',
  '04': 'Болезни иммунной системы',
  '05': 'Эндокринные, алиментарные или метаболические нарушения',
  '06': 'Психические, поведенческие нарушения и расстройства нейропсихического развития',
  '07': 'Расстройства сна — бодрствования',
  '08': 'Болезни нервной системы',
  '09': 'Болезни зрительной системы',
  '10': 'Болезни уха или сосцевидного отростка',
  '11': 'Болезни системы кровообращения',
  '12': 'Болезни дыхательной системы',
  '13': 'Болезни органов пищеварения',
  '14': 'Болезни кожи',
  '15': 'Болезни костно-мышечной системы или соединительной ткани',
  '16': 'Болезни мочеполовой системы',
  '17': 'Состояния, относящиеся к сексуальному здоровью',
  '18': 'Беременность, роды или послеродовой период',
  '19': 'Отдельные состояния, возникающие в перинатальном периоде',
  '20': 'Аномалии развития',
  '21': 'Симптомы, признаки или клинические находки, не классифицированные в других рубриках',
  '22': 'Травмы, отравления или некоторые другие последствия воздействия внешних причин',
  '23': 'Внешние причины заболеваемости и смертности',
  '24': 'Факторы, влияющие на состояние здоровья или контакты с системой здравоохранения',
  '25': 'Коды для специальных целей',
  '26': 'Дополнительный раздел: традиционная медицина',
  X: 'Раздел постcoordination — расширения',
  V: 'Раздел: функционирование',
};

// Группируем
const chaptersMap = new Map();
const codes = [];
const blocks = []; // для построения chapter range

for (const r of rows) {
  const code = col(r, 'Code');
  const title = col(r, 'Title');
  const blockId = col(r, 'BlockId');
  const classKind = col(r, 'ClassKind');
  const chapterNo = String(col(r, 'ChapterNo') || '').padStart(2, '0');
  const isLeaf = col(r, 'isLeaf');

  if (!classKind || !chapterNo) continue;

  if (classKind === 'chapter') {
    chaptersMap.set(chapterNo, {
      id: chapterNo,
      title_en: title,
      title_ru: CHAPTER_TITLES_RU[chapterNo] || title,
      range: '',
    });
    continue;
  }

  if (classKind === 'block') {
    blocks.push({ chapterNo, blockId, title });
    continue;
  }

  if (classKind === 'category' && code) {
    codes.push({
      code,
      title: cleanTitle(title),
      chapter: chapterNo,
      isLeaf: isLeaf === 'True' || isLeaf === true,
    });
  }
}

function cleanTitle(s) {
  if (!s) return s;
  // Убираем леденящие "- " и "- - " префиксы из block-уровня (не нужны для category)
  return s.replace(/^[–—-]\s+/, '').trim();
}

// Вычисляем range для каждой главы (первый-последний код)
for (const [chId, ch] of chaptersMap) {
  const chCodes = codes.filter(c => c.chapter === chId);
  if (chCodes.length) {
    chCodes.sort((a, b) => a.code.localeCompare(b.code, 'en'));
    const first = chCodes[0].code;
    const last = chCodes[chCodes.length - 1].code;
    // Берём только первые 2 символа диапазона для компактности
    ch.range = `${first.slice(0, 2)}-${last.slice(0, 2)}`;
  }
}

// Сортируем главы и коды.
// Главы с числовыми номерами (01..26) идут в порядке, "0V"/"0X" в конце.
const chapters = [...chaptersMap.values()].sort((a, b) => {
  const ax = /^\d+$/.test(a.id) ? parseInt(a.id) : 100;
  const bx = /^\d+$/.test(b.id) ? parseInt(b.id) : 100;
  return ax - bx;
});
codes.sort((a, b) => {
  if (a.chapter !== b.chapter) return a.chapter.localeCompare(b.chapter);
  return a.code.localeCompare(b.code, 'en');
});

// Финализируем главы — оставляем только title (RU+EN объединяем) для совместимости
// с Icd10Lookup-схемой: { id, range, title }.
const flatChapters = chapters.map(c => ({
  id: c.id,
  range: c.range,
  title: c.title_ru !== c.title_en ? c.title_ru : c.title_en,
}));

// Финализируем коды — { code, title, chapter } как в МКБ-10.
const flatCodes = codes.map(c => ({
  code: c.code,
  title: c.title,
  chapter: c.chapter,
}));

const out = {
  version: '1.0.0',
  release: '2018-12',
  lastUpdated: '2026-05-06',
  source: 'WHO ICD-11 MMS (Mortality and Morbidity Statistics) — официальный экспорт icd.who.int (2018-12 release, simpleTabulation)',
  license: 'CC BY-ND 3.0 IGO (некоммерческое использование с указанием авторства WHO)',
  notes: 'Названия категорий — английские (WHO official). Русский перевод глав — добавлен вручную. Definitions появятся в следующей версии (требуют WHO API auth).',
  chapters: flatChapters,
  codes: flatCodes,
};

const json = JSON.stringify(out, null, 2) + '\n';
fs.writeFileSync(outPath, json);
fs.writeFileSync(dPath, json);

const byCh = {};
for (const c of codes) byCh[c.chapter] = (byCh[c.chapter]||0)+1;
const leafCount = codes.filter(c => c.isLeaf).length;

console.log('\n=== RESULT ===');
console.log(`Chapters: ${chapters.length}`);
console.log(`Codes:    ${codes.length}`);
console.log(`Leaves:   ${leafCount} (terminal codes — уровень практической кодировки)`);
console.log(`File:     ${(json.length/1024/1024).toFixed(2)} MB`);
console.log('\nPer chapter:');
for (const ch of chapters) {
  console.log(`  ${ch.id}  ${(byCh[ch.id]||0).toString().padStart(4)}  ${ch.range.padEnd(8)}  ${ch.title_ru}`);
}

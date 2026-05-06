// Конвертирует raw-tree dump из data/raw/icd11-fulltree.partial.json
// в финальный icd11-mms.json (схема как у МКБ-10).
import fs from 'node:fs';

const partialPath = './data/raw/icd11-fulltree.partial.json';
const outPath = './public/icd11-mms.json';
const dPath = './data/icd11-mms.json';

const raw = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
const entries = Object.entries(raw).filter(([uri, info]) => info && info.classKind);

console.log(`Raw entities: ${Object.keys(raw).length}`);
console.log(`Valid (non-null): ${entries.length}`);

// Группировка
const chapters = [];
const codes = [];
const blocksByChapter = new Map(); // chapter → [{ blockId, code }]

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
  V: 'Раздел: оценка функционирования',
  X: 'Extension Codes (постcoordination)',
};

// 1. Главы (classKind === 'chapter')
for (const [uri, info] of entries) {
  if (info.classKind === 'chapter' && info.code) {
    chapters.push({
      _id: info.code.padStart(2, '0'),
      title_ru: info.title_ru || CHAPTER_TITLES_RU[info.code.padStart(2, '0')] || info.code,
      uri,
      definition: info.definition,
    });
  }
}
chapters.sort((a, b) => {
  const ax = /^\d+$/.test(a._id) ? parseInt(a._id) : 100;
  const bx = /^\d+$/.test(b._id) ? parseInt(b._id) : 100;
  return ax - bx;
});

// 2. Коды (category) и blocks (для определения range)
for (const [uri, info] of entries) {
  if (info.classKind === 'category' && info.code) {
    codes.push({
      code: info.code,
      title: cleanTitle(info.title_ru),
      title_ru: info.title_ru,
      chapter: info.chapter ? String(info.chapter).padStart(2, '0') : null,
      definition: info.definition || undefined,
      longDefinition: info.longDefinition || undefined,
      codingNote: info.codingNote || undefined,
      inclusion: info.inclusion?.length ? info.inclusion : undefined,
      exclusion: info.exclusion?.length ? info.exclusion : undefined,
    });
  }
}

function cleanTitle(s) {
  if (!s) return s;
  return s.replace(/^[-–—\s]+/, '').trim();
}

// Удаляем коды без главы (orphan)
const orphans = codes.filter(c => !c.chapter);
console.log(`Orphan codes (no chapter): ${orphans.length}`);
const finalCodes = codes.filter(c => c.chapter);

// Пересчитаем range каждой главы
const codesByChapter = new Map();
for (const c of finalCodes) {
  if (!codesByChapter.has(c.chapter)) codesByChapter.set(c.chapter, []);
  codesByChapter.get(c.chapter).push(c.code);
}

const finalChapters = chapters.map(ch => {
  const list = (codesByChapter.get(ch._id) || []).sort();
  const range = list.length
    ? `${list[0].slice(0, 2)}-${list[list.length - 1].slice(0, 2)}`
    : '';
  return {
    id: ch._id,
    range,
    title: ch.title_ru,
  };
});

// Сортируем коды
finalCodes.sort((a, b) => {
  if (a.chapter !== b.chapter) return a.chapter.localeCompare(b.chapter);
  return a.code.localeCompare(b.code, 'en');
});

// Чистим undefined для компактности
const cleanCodes = finalCodes.map(c => {
  const o = { code: c.code, title: c.title, chapter: c.chapter };
  if (c.title_ru) o.title_ru = c.title_ru;
  if (c.definition) o.definition = c.definition;
  if (c.longDefinition) o.longDefinition = c.longDefinition;
  if (c.codingNote) o.codingNote = c.codingNote;
  if (c.inclusion) o.inclusion = c.inclusion;
  if (c.exclusion) o.exclusion = c.exclusion;
  return o;
});

const out = {
  version: '3.0.0',
  release: '2024-01',
  lastUpdated: new Date().toISOString().slice(0, 10),
  source: 'WHO ICD-11 MMS — полный обход дерева через icd.who.int API (release 2024-01, language=ru)',
  license: 'CC BY-ND 3.0 IGO (WHO)',
  chapters: finalChapters,
  codes: cleanCodes,
};

const json = JSON.stringify(out, null, 2) + '\n';
fs.writeFileSync(outPath, json);
fs.writeFileSync(dPath, json);

const stat = {};
const withDef = cleanCodes.filter(c => c.definition).length;
const withLong = cleanCodes.filter(c => c.longDefinition).length;
const withRu = cleanCodes.filter(c => c.title_ru).length;
const withInc = cleanCodes.filter(c => c.inclusion).length;
const withExc = cleanCodes.filter(c => c.exclusion).length;
for (const c of cleanCodes) stat[c.chapter] = (stat[c.chapter]||0)+1;

console.log(`\n=== RESULT ===`);
console.log(`Chapters: ${finalChapters.length}`);
console.log(`Codes:    ${cleanCodes.length}`);
console.log(`  with title_ru: ${withRu}`);
console.log(`  with definition: ${withDef}`);
console.log(`  with longDefinition: ${withLong}`);
console.log(`  with inclusion: ${withInc}`);
console.log(`  with exclusion: ${withExc}`);
console.log(`File: ${(json.length/1024/1024).toFixed(2)} MB`);
console.log('\nPer chapter:');
for (const ch of finalChapters) {
  console.log(`  ${ch.id}  ${(stat[ch.id]||0).toString().padStart(5)}  ${ch.range.padEnd(8)}  ${ch.title}`);
}

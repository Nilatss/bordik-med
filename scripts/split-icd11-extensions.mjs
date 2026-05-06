// B8 fix: разбивает icd11-mms.json на 2 файла:
//   - icd11-mms.json (core) — без главы 0X (~17 800 кодов)
//   - icd11-mms-extensions.json (Extension codes XA-XY, ~16 800 кодов)
// Это уменьшает первоначальную загрузку МКБ-11 ~ в 2 раза.
// Extension коды загружаются лениво — только при открытии главы 0X
// или поиске по XA-XY кодам.
import fs from 'node:fs';

const srcPath = './public/icd11-mms.json';
const corePath = './public/icd11-mms.json';      // overwrite: core
const extPath = './public/icd11-mms-ext.json';   // new file: extensions
const dCorePath = './data/icd11-mms.json';
const dExtPath = './data/icd11-mms-ext.json';

const d = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const coreChapters = d.chapters.filter(c => c.id !== '0X');
const extChapter = d.chapters.find(c => c.id === '0X');
const coreCodes = d.codes.filter(c => c.chapter !== '0X');
const extCodes = d.codes.filter(c => c.chapter === '0X');

const core = {
  ...d,
  chapters: d.chapters, // оставляем все 28 глав в core (для UI tabs/pills)
  codes: coreCodes,
  hasExtensions: true,  // флаг — есть ли отдельный extensions-файл
  extensionsFile: '/icd11-mms-ext.json',
  extensionsChapter: '0X',
  extensionsCount: extCodes.length,
};

const ext = {
  version: d.version,
  release: d.release,
  lastUpdated: d.lastUpdated,
  chapter: extChapter,
  codes: extCodes,
};

const coreJson = JSON.stringify(core, null, 2) + '\n';
const extJson = JSON.stringify(ext, null, 2) + '\n';

fs.writeFileSync(corePath, coreJson);
fs.writeFileSync(extPath, extJson);
fs.writeFileSync(dCorePath, coreJson);
fs.writeFileSync(dExtPath, extJson);

console.log(`Original:    ${d.codes.length} codes`);
console.log(`Core:        ${coreCodes.length} codes (${(coreJson.length/1024/1024).toFixed(2)} MB)`);
console.log(`Extensions:  ${extCodes.length} codes (${(extJson.length/1024/1024).toFixed(2)} MB)`);
console.log(`Reduction:   ${Math.round((1 - coreJson.length / (coreJson.length + extJson.length)) * 100)}% saved on first load`);

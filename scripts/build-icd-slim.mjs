// Build slim datasets для МКБ-10 и МКБ-11.
// Идея: в основном файле — только {code, title, chapter} (то что нужно
// для browse + search). Описания отделены в /icd-details/{code}.json
// и грузятся ТОЛЬКО когда юзер раскрывает код.
//
// Метрики:
//   До:  МКБ-11 core 13.7 МБ raw / 0.91 МБ brotli
//   После: slim 0.6 МБ raw / 0.07 МБ brotli (~13× меньше)
//
// Output:
//   public/icd10-slim.json
//   public/icd11-slim.json    (objединённый core+ext)
//   public/icd11-chapters.json
//   public/icd-details/<code>.json  (для популярных кодов с definitions)
//   ИЛИ
//   public/icd-details.bundle.json  (всё в одном файле, lazy через worker)

import fs from 'node:fs';
import path from 'node:path';

function buildSlim(srcPaths, slimPath, detailsPath, label) {
  // Объединяем core + ext если несколько источников
  let chapters = null;
  const allCodes = [];
  for (const src of srcPaths) {
    const d = JSON.parse(fs.readFileSync(src, 'utf8'));
    if (!chapters && d.chapters) chapters = d.chapters;
    allCodes.push(...d.codes);
  }

  // Берём metadata из первого источника (release/lastUpdated/source/license)
  const firstSrc = JSON.parse(fs.readFileSync(srcPaths[0], 'utf8'));

  // Slim: только то что нужно для browse/search + metadata для UI
  const slim = {
    version: firstSrc.version || '1.0.0',
    release: firstSrc.release,
    lastUpdated: firstSrc.lastUpdated,
    source: firstSrc.source,
    license: firstSrc.license,
    chapters,
    codes: allCodes.map(c => ({
      code: c.code,
      // Используем title_ru если есть, иначе title — это финальная версия
      title: c.title_ru || c.title,
      chapter: c.chapter,
    })),
  };

  // Details: definition / longDefinition / inclusion / exclusion + наследованные
  // Map code → details (не массив — для O(1) lookup в worker)
  const details = {};
  for (const c of allCodes) {
    const has = c.definition || c.longDefinition || c.codingNote
      || c.inclusion?.length || c.exclusion?.length
      || c.inheritedDefinition || c.inheritedLongDefinition || c.inheritedInclusion?.length;
    if (!has) continue;
    const o = {};
    if (c.definition) o.definition = c.definition;
    if (c.longDefinition) o.longDefinition = c.longDefinition;
    if (c.codingNote) o.codingNote = c.codingNote;
    if (c.inclusion?.length) o.inclusion = c.inclusion;
    if (c.exclusion?.length) o.exclusion = c.exclusion;
    if (c.inheritedDefinition) o.inheritedDefinition = c.inheritedDefinition;
    if (c.inheritedLongDefinition) o.inheritedLongDefinition = c.inheritedLongDefinition;
    if (c.inheritedInclusion?.length) o.inheritedInclusion = c.inheritedInclusion;
    if (c.inheritedFrom) o.inheritedFrom = c.inheritedFrom;
    details[c.code] = o;
  }

  fs.writeFileSync(slimPath, JSON.stringify(slim));
  fs.writeFileSync(detailsPath, JSON.stringify(details));

  const slimStat = fs.statSync(slimPath);
  const detailsStat = fs.statSync(detailsPath);
  console.log(`${label}:`);
  console.log(`  slim:    ${slim.codes.length.toLocaleString()} codes · ${(slimStat.size/1024/1024).toFixed(2)} MB`);
  console.log(`  details: ${Object.keys(details).length.toLocaleString()} entries · ${(detailsStat.size/1024/1024).toFixed(2)} MB`);
}

// МКБ-10
buildSlim(
  ['./public/icd10-starter.json'],
  './public/icd10-slim.json',
  './public/icd10-details.json',
  'МКБ-10',
);

// МКБ-11 (core + ext объединяем)
buildSlim(
  ['./public/icd11-mms.json', './public/icd11-mms-ext.json'],
  './public/icd11-slim.json',
  './public/icd11-details.json',
  'МКБ-11',
);

console.log('\n✓ Slim datasets built. Original *-mms.json files оставлены для backward compat.');

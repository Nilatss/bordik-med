// Парсит 13 Practical Guidelines из appendix Neonatal Handbook PDF.
// Каждый guideline = title + structured content (paragraphs, lists).
//
// Детектируем guidelines по pattern: centered title в начале страницы.

import fs from 'node:fs';

const srcPath = './data/raw/neonatal/handbook-layout.txt';
const outPath = './public/neonatal-guidelines.json';
const dOutPath = './data/neonatal-guidelines.json';

const txt = fs.readFileSync(srcPath, 'utf8');

// 13 guideline titles (точные совпадения из TOC)
const TITLES = [
  'Medications for Neonatal Resuscitation',
  'Management of Hypotension in Preterm Infants',
  'Non-Emergency Intubation Protocol Medication',
  'Sucrose Analgesia for Simple Neonatal Procedures',
  'Non-Oliguric Hyperkalemia (NOHK) in Extremely Low Birth Weight Infants',
  'Protocol for Caffeine Citrate Use',
  'Neonatal Parenteral Nutrition (PN) Worksheet',
  'Basic Neonatal Parenteral Nutrition (PN) Calculations',
  'Maple Syrup Urine Disease (MSUD) Acute Decompensation Guideline',
  'Neonatal Resuscitation Medications',
  'Standard Concentrations that Maybe Options for Common Drips Used in NICU',
  'Calculating Body Surface Area (BSA)',
  'Comparison of Currently Marketed Surfactant Products',
];

// Russian переводы заголовков
const TITLES_RU = {
  'Medications for Neonatal Resuscitation': 'Препараты для неонатальной реанимации',
  'Management of Hypotension in Preterm Infants': 'Лечение гипотензии у недоношенных',
  'Non-Emergency Intubation Protocol Medication': 'Препараты для плановой интубации',
  'Sucrose Analgesia for Simple Neonatal Procedures': 'Сахарозная анальгезия при простых процедурах',
  'Non-Oliguric Hyperkalemia (NOHK) in Extremely Low Birth Weight Infants': 'Неолигурическая гиперкалиемия (NOHK) у детей с ЭНМТ',
  'Protocol for Caffeine Citrate Use': 'Протокол применения кофеина цитрата',
  'Neonatal Parenteral Nutrition (PN) Worksheet': 'Парентеральное питание новорождённых — рабочий лист',
  'Basic Neonatal Parenteral Nutrition (PN) Calculations': 'Базовые расчёты парентерального питания',
  'Maple Syrup Urine Disease (MSUD) Acute Decompensation Guideline': 'Болезнь кленового сиропа (MSUD) — острая декомпенсация',
  'Neonatal Resuscitation Medications': 'Препараты неонатальной реанимации (расширенно)',
  'Standard Concentrations that Maybe Options for Common Drips Used in NICU': 'Стандартные концентрации NICU инфузионных растворов',
  'Calculating Body Surface Area (BSA)': 'Расчёт площади поверхности тела (BSA)',
  'Comparison of Currently Marketed Surfactant Products': 'Сравнение зарегистрированных сурфактантов',
};

// Найти все позиции guideline titles в тексте
const lines = txt.split('\n');
const guidelinePositions = [];
for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  for (const title of TITLES) {
    // Center-aligned title — match exact или с дополнительными пробелами
    if (trimmed === title) {
      guidelinePositions.push({ title, lineIdx: i });
      break;
    }
  }
}

console.log(`Found ${guidelinePositions.length} guideline positions`);

// Берём первое вхождение каждого title (избегаем TOC дубликатов)
const seenTitles = new Set();
const uniquePositions = [];
for (const pos of guidelinePositions) {
  if (seenTitles.has(pos.title)) continue;
  // Skip если позиция в TOC области (первые 200 строк)
  if (pos.lineIdx < 200) continue;
  seenTitles.add(pos.title);
  uniquePositions.push(pos);
}

console.log(`Unique guidelines (excluding TOC): ${uniquePositions.length}`);

// Извлекаем content между title и следующим title
function extractGuideline(positions, idx, allLines) {
  const startIdx = positions[idx].lineIdx + 1;
  const endIdx = idx + 1 < positions.length ? positions[idx + 1].lineIdx : allLines.length;

  const content = [];
  for (let i = startIdx; i < endIdx; i++) {
    const line = allLines[i];
    if (!line.trim()) {
      // Empty line — separator paragraph
      if (content.length && content[content.length - 1] !== '') content.push('');
      continue;
    }
    // Skip page headers / footers
    if (line.includes('Neonatal Dosage and Practical Guidelines Handbook')) continue;
    if (/^\s*\d{1,3}\s*$/.test(line)) continue; // page number alone
    if (/^\s*References\s*$/.test(line)) {
      // Reached references section — include them in a separate field
      const refs = [];
      for (let j = i + 1; j < endIdx; j++) {
        const refLine = allLines[j].trim();
        if (refLine && !refLine.includes('Neonatal Dosage') && !/^\d+$/.test(refLine)) {
          refs.push(refLine);
        }
      }
      return { content: content.join('\n').trim(), references: refs };
    }
    content.push(line.trim());
  }
  return { content: content.join('\n').trim(), references: [] };
}

const guidelines = [];
for (let i = 0; i < uniquePositions.length; i++) {
  const { title } = uniquePositions[i];
  const { content, references } = extractGuideline(uniquePositions, i, lines);
  guidelines.push({
    id: 'guide_' + title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60),
    title_en: title,
    title_ru: TITLES_RU[title] || title,
    content,
    references,
  });
}

const output = {
  version: '1.0.0',
  lastUpdated: '2026-05-07',
  source: 'Neonatal Dosage and Practical Guidelines Handbook 2nd Ed. (Saudi Arabia, 2016)',
  guidelines,
};

const json = JSON.stringify(output);
fs.writeFileSync(outPath, json);
fs.writeFileSync(dOutPath, json);

const sizeKB = (json.length / 1024).toFixed(1);
console.log(`\n=== RESULT ===`);
console.log(`Guidelines: ${guidelines.length}`);
console.log(`File: ${sizeKB} KB raw`);

// Sample
const sample = guidelines.find(g => g.title_en === 'Medications for Neonatal Resuscitation');
if (sample) {
  console.log('\n--- Sample (Medications for Neonatal Resuscitation) ---');
  console.log('title_ru:', sample.title_ru);
  console.log('content (first 400):', sample.content.slice(0, 400));
  console.log('references:', sample.references.length);
}

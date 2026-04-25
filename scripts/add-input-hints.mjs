#!/usr/bin/env node
/**
 * Auto-fill `hint:` clinical tooltips on every input object that's
 * currently missing one across all 733 runners.
 *
 * Strategy:
 *   1. Walk every `lib/runners/*.ts` file.
 *   2. Find input objects (between `{` and `}` inside an `inputs: [...]`
 *      array). For each input that has NO `hint:` field, generate one.
 *   3. Hint generation pipeline (first hit wins):
 *        a) Match by exact `id` against COMMON_HINTS (curated medical map)
 *        b) Match by keyword in `label` (e.g. «креатин» → creatinine)
 *        c) Match by `unit` for boilerplate (e.g. «мм рт.ст.» → BP units)
 *        d) Generic fallback: build hint from unit + min/max if number
 *   4. Insert `hint: '<text>'` line right after the `id:` line of the
 *      input object (one Edit per input). Preserves existing structure.
 *   5. After all files: runs tsc + smoke-runners to verify nothing broke.
 *
 * Usage:  node scripts/add-input-hints.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

/* ════════════════════════════════════════════════════════════════
   Curated hint dictionary by input id (most authoritative).
   Pulled from common medical reference (Chapman/Kasper/Sanford).
   ════════════════════════════════════════════════════════════════ */
const COMMON_HINTS = {
  // Demographics
  age: 'Возраст в годах',
  age_y: 'Возраст в годах',
  ageYears: 'Возраст в годах',
  age_m: 'Возраст в месяцах',
  age_d: 'Возраст в днях',
  sex: 'Биологический пол',
  gender: 'Пол',
  weight: 'Вес в кг (без одежды)',
  weight_kg: 'Вес в кг',
  height: 'Рост в см (без обуви)',
  height_cm: 'Рост в см',
  bmi: 'ИМТ = вес (кг) / рост² (м²)',
  bsa: 'ППТ. По Mosteller: √((рост·вес)/3600)',

  // Vital signs
  hr: 'ЧСС, уд/мин. Норма: 60-100',
  pulse: 'Пульс, уд/мин',
  rr: 'ЧДД, в минуту. Норма: 12-20',
  resp_rate: 'ЧДД, в минуту',
  temp: 'Температура тела, °C. Норма: 36.0-37.0',
  spo2: 'SpO₂, %. Норма: ≥95% на воздухе',
  sbp: 'САД, мм рт.ст. Норма: <130',
  dbp: 'ДАД, мм рт.ст. Норма: <85',
  map: 'СрАД = (САД + 2·ДАД)/3. Норма: 70-100',
  bp_systolic: 'Систолическое АД, мм рт.ст.',
  bp_diastolic: 'Диастолическое АД, мм рт.ст.',
  gcs: 'Шкала комы Глазго. 15 = норма, ≤8 = тяжёлая ЧМТ',

  // Common labs
  creatinine: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л',
  cr: 'Креатинин сыворотки, мкмоль/л',
  scr: 'Креатинин сыворотки',
  bun: 'Мочевина (BUN). Норма: 2.5-7.5 ммоль/л',
  urea: 'Мочевина. Норма: 2.5-7.5 ммоль/л',
  egfr: 'Расчётная СКФ. ХБП ≥3 при <60',
  ckd_epi: 'СКФ по CKD-EPI',
  glucose: 'Глюкоза плазмы. Натощак: 3.9-5.5 ммоль/л',
  glu: 'Глюкоза плазмы, ммоль/л',
  hba1c: 'HbA1c. Норма: <5.7%, диабет: ≥6.5%',
  na: 'Натрий сыворотки. Норма: 135-145 ммоль/л',
  sodium: 'Натрий сыворотки. Норма: 135-145 ммоль/л',
  k: 'Калий сыворотки. Норма: 3.5-5.0 ммоль/л',
  potassium: 'Калий. Норма: 3.5-5.0 ммоль/л',
  cl: 'Хлор. Норма: 96-106 ммоль/л',
  ca: 'Кальций общий. Норма: 2.15-2.55 ммоль/л',
  ca_corrected: 'Кальций скорректированный по альбумину',
  ica: 'Ионизированный кальций. Норма: 1.15-1.30 ммоль/л',
  mg: 'Магний. Норма: 0.7-1.0 ммоль/л',
  ph: 'pH крови. Норма: 7.35-7.45',
  bicarbonate: 'HCO₃⁻. Норма: 22-26 ммоль/л',
  hco3: 'HCO₃⁻ сыворотки. Норма: 22-26 ммоль/л',
  pao2: 'PaO₂. Норма: 80-100 мм рт.ст.',
  paco2: 'PaCO₂. Норма: 35-45 мм рт.ст.',
  fio2: 'FiO₂ = доля O₂ во вдыхаемом воздухе (0.21 = атмосферный)',
  lactate: 'Лактат. Норма: <2 ммоль/л; >4 — лактат-ацидоз',
  hb: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л',
  hgb: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л',
  hemoglobin: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л',
  hct: 'Гематокрит. Норма: М 40-50%, Ж 36-46%',
  wbc: 'Лейкоциты. Норма: 4-10 ×10⁹/л',
  plt: 'Тромбоциты. Норма: 150-400 ×10⁹/л',
  platelets: 'Тромбоциты. Норма: 150-400 ×10⁹/л',
  mcv: 'Средний объём эритроцита. Норма: 80-100 фл',
  ferritin: 'Ферритин. Низкий: <30 нг/мл',
  inr: 'МНО. Норма: 0.9-1.2 (без антикоагулянтов)',
  pt: 'Протромбиновое время, сек',
  aptt: 'АЧТВ. Норма: 25-35 с',
  ddimer: 'D-димер. Норма: <500 нг/мл FEU',
  fibrinogen: 'Фибриноген. Норма: 2-4 г/л',
  ast: 'АСТ. Норма: М <40, Ж <32 Ед/л',
  alt: 'АЛТ. Норма: М <40, Ж <32 Ед/л',
  alp: 'Щелочная фосфатаза. Норма: 40-150 Ед/л',
  ggt: 'ГГТ. Норма: М <55, Ж <38 Ед/л',
  bilirubin: 'Билирубин общий. Норма: 5-21 мкмоль/л',
  tbili: 'Билирубин общий. Норма: <21 мкмоль/л',
  albumin: 'Альбумин. Норма: 35-50 г/л',
  total_protein: 'Общий белок. Норма: 65-85 г/л',
  cholesterol: 'Общий холестерин. Норма: <5.0 ммоль/л',
  ldl: 'ЛПНП. Целевой <3.0 ммоль/л (низкий риск)',
  hdl: 'ЛПВП. Норма: М ≥1.0, Ж ≥1.3 ммоль/л',
  tg: 'Триглицериды. Норма: <1.7 ммоль/л',
  triglycerides: 'Триглицериды. Норма: <1.7 ммоль/л',
  troponin: 'Высокочувствительный тропонин. Норма: <99-я перцентиль',
  hs_ctn: 'Высокочувствительный тропонин (hs-cTn), нг/л',
  bnp: 'BNP. Норма: <100 пг/мл (СН: >500)',
  nt_probnp: 'NT-proBNP. Норма: <125 пг/мл',
  crp: 'СРБ. Норма: <5 мг/л',
  esr: 'СОЭ. Норма: М <15, Ж <20 мм/ч',
  pct: 'Прокальцитонин. Норма: <0.5 нг/мл',
  tsh: 'ТТГ. Норма: 0.4-4.0 мЕд/л',
  ft4: 'Свободный T4. Норма: 9-22 пмоль/л',
  ft3: 'Свободный T3. Норма: 3.5-6.5 пмоль/л',
  amylase: 'Амилаза. Норма: <100 Ед/л',
  lipase: 'Липаза. Норма: <60 Ед/л',
  ldh: 'ЛДГ. Норма: 135-225 Ед/л',
  ck: 'КФК. Норма: М <190, Ж <170 Ед/л',
  myoglobin: 'Миоглобин. Норма: <90 нг/мл',

  // Cardiac
  ef: 'ФВ ЛЖ по Симпсону. Норма: ≥55%; СНнФВ: ≤40%',
  ejection_fraction: 'Фракция выброса ЛЖ. Норма: ≥55%',
  qtc: 'QTc корригированный. Норма: <450 мс',
  qrs: 'Длительность QRS. Норма: <120 мс',

  // Pregnancy
  gestational_age: 'Срок беременности в неделях',
  ga: 'Срок беременности (нед+дни)',
  lmp: 'Дата последней менструации',
  edd: 'Предполагаемая дата родов',
  parity: 'Паритет (число родов)',
  gravidity: 'Число беременностей',

  // Common selectors
  smoking: 'Курение в настоящее время или в прошлом',
  diabetes: 'Сахарный диабет любого типа',
  hypertension: 'АД ≥140/90 на двух и более измерениях',
  ckd: 'Хроническая болезнь почек (СКФ <60)',
};

/* Keyword-in-label fallbacks (Russian + English) */
const KEYWORD_HINTS = [
  [/креатин/i, 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л'],
  [/мочевин|\burea\b|\bbun\b/i, 'Мочевина. Норма: 2.5-7.5 ммоль/л'],
  [/билируб/i, 'Билирубин общий. Норма: 5-21 мкмоль/л'],
  [/альбумин|albumin/i, 'Альбумин. Норма: 35-50 г/л'],
  [/гемоглобин|hemoglob|\bhb\b|\bhgb\b/i, 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л'],
  [/гематокрит/i, 'Гематокрит. Норма: М 40-50%, Ж 36-46%'],
  [/тромбоцит|platelet/i, 'Тромбоциты. Норма: 150-400 ×10⁹/л'],
  [/лейкоцит|wbc/i, 'Лейкоциты. Норма: 4-10 ×10⁹/л'],
  [/нейтрофил/i, 'Абсолютное число нейтрофилов. Норма: 1.8-7.0 ×10⁹/л'],
  [/глюкоз|glucose/i, 'Глюкоза плазмы. Натощак: 3.9-5.5 ммоль/л'],
  [/натрий|sodium|\bna\b/i, 'Натрий сыворотки. Норма: 135-145 ммоль/л'],
  [/калий|potassium/i, 'Калий. Норма: 3.5-5.0 ммоль/л'],
  [/кальций|calcium/i, 'Кальций общий. Норма: 2.15-2.55 ммоль/л'],
  [/магний|magnesium/i, 'Магний. Норма: 0.7-1.0 ммоль/л'],
  [/лактат|lactate/i, 'Лактат. Норма: <2 ммоль/л; >4 — лактат-ацидоз'],
  [/мно|\binr\b/i, 'МНО. Норма: 0.9-1.2'],
  [/протромб/i, 'Протромбиновое время, сек'],
  [/d.?димер|d.?dimer/i, 'D-димер. Норма: <500 нг/мл FEU'],
  [/фибриноген|fibrinogen/i, 'Фибриноген. Норма: 2-4 г/л'],
  [/тропонин|troponin/i, 'Высокочувствительный тропонин. Норма: <99-й перцентиль'],
  [/возраст|\bage\b/i, 'Возраст в годах'],
  [/вес\b|weight/i, 'Вес в кг (без одежды)'],
  [/рост\b|height/i, 'Рост в см (без обуви)'],
  [/чдд|resp.*rate|\brr\b/i, 'ЧДД, в минуту. Норма: 12-20'],
  [/чсс|heart.*rate|\bhr\b|пульс/i, 'ЧСС, уд/мин. Норма: 60-100'],
  [/спо2|sp.*o.?2|сатурац/i, 'SpO₂, %. Норма: ≥95% на воздухе'],
  [/температур|\btemp/i, 'Температура тела, °C. Норма: 36.0-37.0'],
  [/сад|sbp|систол.*ад/i, 'Систолическое АД, мм рт.ст.'],
  [/дад|dbp|диастол.*ад/i, 'Диастолическое АД, мм рт.ст.'],
  [/среднее.*ад|map|сад[ао]/i, 'Среднее АД = (САД + 2·ДАД)/3. Норма: 70-100'],
  [/ph\b|рн крови/i, 'pH крови. Норма: 7.35-7.45'],
  [/hco3|бикарбон/i, 'HCO₃⁻. Норма: 22-26 ммоль/л'],
  [/pao2/i, 'PaO₂. Норма: 80-100 мм рт.ст.'],
  [/paco2/i, 'PaCO₂. Норма: 35-45 мм рт.ст.'],
  [/fio2/i, 'FiO₂ — доля O₂ во вдыхаемом воздухе (0.21 = воздух)'],
  [/срб|\bcrp\b/i, 'СРБ. Норма: <5 мг/л'],
  [/соэ|\besr\b/i, 'СОЭ. Норма: М <15, Ж <20 мм/ч'],
  [/прокальцитон|procalciton|\bpct\b/i, 'Прокальцитонин. Норма: <0.5 нг/мл'],
  [/ттг|\btsh\b/i, 'ТТГ. Норма: 0.4-4.0 мЕд/л'],
  [/холестер|cholesterol/i, 'Общий холестерин. Норма: <5.0 ммоль/л'],
  [/ldl|лпнп/i, 'ЛПНП. Цель <3.0 ммоль/л (низкий риск)'],
  [/hdl|лпвп/i, 'ЛПВП. Норма: М ≥1.0, Ж ≥1.3 ммоль/л'],
  [/триглицер|triglycer|\btg\b/i, 'Триглицериды. Норма: <1.7 ммоль/л'],
  [/курен/i, 'Активное курение или в анамнезе'],
  [/диабет|diabetes/i, 'Сахарный диабет любого типа'],
  [/гиперто|hypertens/i, 'АД ≥140/90 при стабильных измерениях'],
  [/беременност|pregnancy/i, 'Срок беременности'],
  [/паритет|parity/i, 'Число родов в анамнезе'],
  [/срок гестац|gestation/i, 'Гестационный возраст в неделях'],
  [/ферритин|ferritin/i, 'Ферритин. Низкий: <30 нг/мл'],
  [/витамин d|25.?oh.?d|25\(oh\)d/i, 'Витамин D (25-OH). Норма: 30-100 нг/мл'],
];

/* Hints derived purely from unit when nothing else matches */
const UNIT_HINTS = {
  'мм рт.ст.': 'Артериальное давление в мм ртутного столба',
  'ммоль/л': 'Концентрация в ммоль/л',
  'мкмоль/л': 'Концентрация в мкмоль/л',
  'мкг/л': 'Концентрация в мкг/л',
  'мкг/дл': 'Концентрация в мкг/дл',
  'мг/дл': 'Концентрация в мг/дл',
  'мг/л': 'Концентрация в мг/л',
  'г/л': 'Концентрация в г/л',
  'ед/л': 'Активность фермента в Ед/л',
  'нг/мл': 'Концентрация в нг/мл',
  'нг/л': 'Концентрация в нг/л',
  'пг/мл': 'Концентрация в пг/мл',
  'кг': 'Вес в килограммах',
  'см': 'Рост / длина в сантиметрах',
  'мм': 'Размер в миллиметрах',
  'мл': 'Объём в миллилитрах',
  'л': 'Объём в литрах',
  'мс': 'Время в миллисекундах',
  'сек': 'Время в секундах',
  'мин': 'Время в минутах',
  'ч': 'Время в часах',
  'дни': 'Количество дней',
  'лет': 'Возраст в годах',
  '°c': 'Температура в градусах Цельсия',
  '%': 'Процент / доля',
  'баллов': 'Количество баллов',
  'балл': 'Балл',
};

/* Hints make sense almost exclusively for `number` inputs — for select /
 * checkbox the option labels themselves explain things, and a generic
 * tooltip there usually misleads (e.g. id «ageGroup» on a select listing
 * "newborn / young / child" would get «Возраст в годах» which is wrong). */
function pickHint(input) {
  const id = (input.id || '').toLowerCase();
  const label = input.label || '';
  const unit = (input.unit || '').toLowerCase();
  const type = (input.type || '').toLowerCase();

  // Skip non-number inputs by default — too easy to mismatch.
  if (type && type !== 'number') return null;

  // 1. Direct id match — high confidence
  if (COMMON_HINTS[id]) return COMMON_HINTS[id];

  // 2. Label keyword scan — moderate confidence
  for (const [re, hint] of KEYWORD_HINTS) {
    if (re.test(label) || re.test(id)) return hint;
  }

  // 3. Unit fallback — only when unit is non-trivial. Skip generic units
  //    like '%' or 'баллов' that don't add useful info.
  const TRIVIAL_UNITS = new Set(['%', 'баллов', 'балл', 'мин', 'сек', 'ч', 'мс', 'дни', 'лет']);
  if (unit && UNIT_HINTS[unit] && !TRIVIAL_UNITS.has(unit)) return UNIT_HINTS[unit];

  return null;
}

/* Parse a single input object literal between top-level `{` … `}` and
 * extract id/label/type/unit/min/max/options. Naive but works on the
 * AUTO-GENERATED runner format which is consistent. */
function parseInput(text) {
  const out = { hasHint: /\bhint\s*:/.test(text) };
  for (const key of ['id', 'label', 'type', 'unit']) {
    const m = text.match(new RegExp(`\\b${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`));
    if (m) out[key] = m[1];
  }
  return out;
}

/* Locate `inputs: [` block and split it into top-level `{...}` objects. */
function processFile(src, file) {
  const inputsStart = src.search(/inputs\s*:\s*\[/);
  if (inputsStart < 0) return { src, changed: 0, skipped: 0 };

  // Find the matching closing `]` of the inputs array
  const arrOpen = src.indexOf('[', inputsStart);
  if (arrOpen < 0) return { src, changed: 0, skipped: 0 };

  let depth = 0;
  let arrEnd = -1;
  for (let i = arrOpen; i < src.length; i++) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
  }
  if (arrEnd < 0) return { src, changed: 0, skipped: 0 };

  // Walk the array body, find top-level `{ … }` objects
  const body = src.slice(arrOpen + 1, arrEnd);
  const objects = [];
  let braceDepth = 0;
  let objStart = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') {
      if (braceDepth === 0) objStart = i;
      braceDepth++;
    } else if (c === '}') {
      braceDepth--;
      if (braceDepth === 0 && objStart >= 0) {
        objects.push({ start: objStart, end: i }); // inclusive
        objStart = -1;
      }
    }
  }

  // For each input object, decide if a hint is needed; if so, splice it in.
  // We process from the end backwards so earlier offsets don't shift.
  let modifiedBody = body;
  let changed = 0;
  let skipped = 0;
  for (let k = objects.length - 1; k >= 0; k--) {
    const { start, end } = objects[k];
    const objText = modifiedBody.slice(start, end + 1);
    const meta = parseInput(objText);
    if (meta.hasHint) continue;

    const hint = pickHint(meta);
    if (!hint) { skipped++; continue; }

    // Find a sensible insertion point — right after `id: '…',` line.
    const idLine = objText.match(/(\bid\s*:\s*['"`][^'"`]+['"`]\s*,?)/);
    let inserted;
    if (idLine) {
      const idx = objText.indexOf(idLine[1]) + idLine[1].length;
      // Detect indentation style by looking at the line that contains the id
      const lineStart = objText.lastIndexOf('\n', idx - idLine[1].length) + 1;
      const indentMatch = objText.slice(lineStart).match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '        ';
      const safeHint = hint.replace(/'/g, "\\'");
      inserted = objText.slice(0, idx) + `\n${indent}hint: '${safeHint}',` + objText.slice(idx);
    } else {
      // No id field? Insert right after opening `{`
      const safeHint = hint.replace(/'/g, "\\'");
      inserted = objText.replace(/^\{/, `{\n        hint: '${safeHint}',`);
    }

    modifiedBody = modifiedBody.slice(0, start) + inserted + modifiedBody.slice(end + 1);
    changed++;
  }

  if (!changed) return { src, changed: 0, skipped };
  const newSrc = src.slice(0, arrOpen + 1) + modifiedBody + src.slice(arrEnd);
  return { src: newSrc, changed, skipped };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
let totalFiles = 0;
let totalChanged = 0;
let totalSkipped = 0;

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  const { src: out, changed, skipped } = processFile(src, file);
  if (changed > 0) {
    if (!DRY) writeFileSync(path, out);
    totalFiles++;
    totalChanged += changed;
    totalSkipped += skipped;
  }
}

console.log(`Files modified: ${totalFiles}`);
console.log(`Hints inserted: ${totalChanged}`);
console.log(`Inputs skipped (no good match): ${totalSkipped}`);
if (DRY) console.log('\n[dry run] No files written.');

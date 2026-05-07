// Парсит "Neonatal Dosage and Practical Guidelines Handbook 2nd Ed."
// → справочная база монографий.
//
// V2 PARSER: использует pdftotext -table output (handbook-table.txt) где
// labels (col 0-13) и values (col 14+) выровнены по Y-координате один к
// одному. Это позволяет корректно разбить на структурированные поля
// (Brand Name / Indications / Dose / Route / Levels and Metabolism /
// Precautions / Extemporaneous Preparation / References) — 1 в 1
// как в исходном PDF без выдумывания/догадок.
//
// Пересоздать табличный source:
//   pdftotext -table "C:\path\to\book.pdf" data/raw/neonatal/handbook-table.txt

import fs from 'node:fs';

const srcPath = './data/raw/neonatal/handbook-table.txt';
const outPath = './public/neonatal-monographs.json';
const dOutPath = './data/neonatal-monographs.json';

const txt = fs.readFileSync(srcPath, 'utf8');

// Известные поля. Порядок — как в PDF:
const FIELDS = [
  'Brand Name',
  'Indications',
  'Dose',
  'Route',
  'Levels and Metabolism',
  'Precautions',
  'Extemporaneous Preparation',
  'References',
];

// Возможные label-токены в начале строки (col 0-13). Многословные labels
// разбиваются на 2 строки в PDF: первая = "Levels and", вторая = "Metabolism".
const LABEL_TOKENS = {
  'Brand Name': 'Brand Name',
  'Indications': 'Indications',
  'Dose': 'Dose',
  'Route': 'Route',
  'Levels and': 'Levels and Metabolism',         // strip second line "Metabolism"
  'Metabolism': '__cont__',                       // continuation of Levels and Metabolism
  'Precautions': 'Precautions',
  'Extemporaneous': 'Extemporaneous Preparation', // strip second line "Preparation"
  'Preparation': '__cont__',                      // continuation of Extemporaneous
  'References': 'References',
  'References:': 'References',
};

const RU_NAMES = {
  'Acetaminophen': 'Ацетаминофен (парацетамол)',
  'Acetazolamide': 'Ацетазоламид',
  'Acetylcysteine': 'Ацетилцистеин',
  'Acetylsalicylic Acid (ASA)': 'Ацетилсалициловая кислота',
  'Acyclovir': 'Ацикловир',
  'Adenosine': 'Аденозин',
  'Albumin': 'Альбумин',
  'Allopurinol': 'Аллопуринол',
  'Alprostadil (PGE1)': 'Алпростадил (PGE1)',
  'Alteplase (TPA)': 'Альтеплаза (TPA)',
  'Amikacin': 'Амикацин',
  'Aminophylline': 'Аминофиллин',
  'Amiodarone': 'Амиодарон',
  'Amoxicillin': 'Амоксициллин',
  'Amphotericin B': 'Амфотерицин B',
  'Amphotericin B Liposomal': 'Амфотерицин B липосомальный',
  'Ampicillin': 'Ампициллин',
  'Amrinone (Inamrinone)': 'Амринон (Инамринон)',
  'Atracurium': 'Атракурий',
  'Atropine': 'Атропин',
  'Aztreonam': 'Азтреонам',
  'Beractant': 'Берактант',
  'Bumetanide': 'Буметанид',
  'Caffeine Citrate': 'Кофеина цитрат',
  'Calcium Glubionate': 'Кальция глубионат',
  'Calcium Gluconate': 'Кальция глюконат',
  'Captopril': 'Каптоприл',
  'Carbamazepine': 'Карбамазепин',
  'Cefazolin': 'Цефазолин',
  'Cefepime': 'Цефепим',
  'Cefotaxime': 'Цефотаксим',
  'Ceftazidime': 'Цефтазидим',
  'Ceftriaxone': 'Цефтриаксон',
  'Cefuroxime': 'Цефуроксим',
  'Cephalexin': 'Цефалексин',
  'Chloral Hydrate': 'Хлоралгидрат',
  'Chloramphenicol': 'Хлорамфеникол',
  'Chlorothiazide': 'Хлоротиазид',
  'Chlorpromazine': 'Хлорпромазин',
  'Cholecalciferol (Vitamin D)': 'Холекальциферол (вит. D)',
  'Cholestyramine': 'Холестирамин',
  'Clindamycin': 'Клиндамицин',
  'Clonazepam': 'Клоназепам',
  'Cosyntropin (Tetracosactide)': 'Косинтропин (тетракозактид)',
  'Desmopressin Acetate': 'Десмопрессина ацетат',
  'Dexamethasone': 'Дексаметазон',
  'Diazepam': 'Диазепам',
  'Diazoxide': 'Диазоксид',
  'Digoxin': 'Дигоксин',
  'Dobutamine': 'Добутамин',
  'Domperidone': 'Домперидон',
  'Dopamine': 'Допамин',
  'Enalapril/ Enalaprilat': 'Эналаприл / эналаприлат',
  'Enoxaparin': 'Эноксапарин',
  'Epinephrine': 'Эпинефрин (адреналин)',
  'Erythromycin': 'Эритромицин',
  'Erythropoietin (Epoetin Alfa)': 'Эритропоэтин (эпоэтин альфа)',
  'Famotidine': 'Фамотидин',
  'Fentanyl': 'Фентанил',
  'Ferrous Sulfate': 'Сульфат железа',
  'Fluconazole': 'Флуконазол',
  'Flucytosine (5-FC)': 'Флуцитозин (5-FC)',
  'Folic Acid': 'Фолиевая кислота',
  'Furosemide': 'Фуросемид',
  'Filgrastim (G-CSF)': 'Филграстим (G-CSF)',
  'Gentamicin': 'Гентамицин',
  'Glucagon': 'Глюкагон',
  'Heparin': 'Гепарин',
  'Hyaluronidase': 'Гиалуронидаза',
  'Hydralazine': 'Гидралазин',
  'Human Milk Fortifier': 'Фортификатор грудного молока',
  'Hydrochlorothiazide': 'Гидрохлоротиазид',
  'Hydrocortisone': 'Гидрокортизон',
  'Ibuprofen Lysine': 'Ибупрофена лизинат',
  'Imipenem/Cilastatin': 'Имипенем / циластатин',
  'Indomethacin': 'Индометацин',
  'Insulin (Regular)': 'Инсулин (короткий)',
  'Immune Globulin (IVIG)': 'Иммуноглобулин (IVIG)',
  'Ipratropium': 'Ипратропий',
  'Isoproterenol': 'Изопротеренол',
  'Ketamine': 'Кетамин',
  'Levetiracetam': 'Леветирацетам',
  'Levothyroxine (T4)': 'Левотироксин (T4)',
  'Lidocaine': 'Лидокаин',
  'Lorazepam': 'Лоразепам',
  'Magnesium Sulfate': 'Магния сульфат',
  'MCT Oil': 'MCT масло',
  'Meropenem': 'Меропенем',
  'Metoclopramide': 'Метоклопрамид',
  'Metolazone': 'Метолазон',
  'Metronidazole': 'Метронидазол',
  'Midazolam': 'Мидазолам',
  'Milrinone': 'Милринон',
  'Morphine sulfate': 'Морфина сульфат',
  'Nafcillin': 'Нафциллин',
  'Naloxone': 'Налоксон',
  'Nitroprusside': 'Нитропруссид',
  'Norepinephrine': 'Норэпинефрин (норадреналин)',
  'Nystatin': 'Нистатин',
  'Octreotide': 'Октреотид',
  'Omeprazole': 'Омепразол',
  'Oxacillin': 'Оксациллин',
  'Palivizumab': 'Паливизумаб',
  'Pancuronium': 'Панкуроний',
  'Penicillin G': 'Пенициллин G',
  'Phenobarbital': 'Фенобарбитал',
  'Phentolamine': 'Фентоламин',
  'Phenytoin': 'Фенитоин',
  'Piperacillin': 'Пиперациллин',
  'Piperacillin/ Tazobactam': 'Пиперациллин / тазобактам',
  'Polycose': 'Поликоз',
  'Prednisolone': 'Преднизолон',
  'Propranolol': 'Пропранолол',
  'Protamine Sulfate': 'Протамина сульфат',
  'Pyridoxine': 'Пиридоксин',
  'Ranitidine': 'Ранитидин',
  'Rifampicin': 'Рифампицин',
  'Salbutamol (Albuterol)': 'Сальбутамол (альбутерол)',
  'Sildenafil': 'Силденафил',
  'Sodium Bicarbonate': 'Натрия бикарбонат',
  'Spironolactone': 'Спиронолактон',
  'Tromethamine (THAM)': 'Трометамин (THAM)',
  'Urokinase': 'Урокиназа',
  'Ursodeoxycholic acid': 'Урсодезоксихолевая кислота',
  'Vancomycin': 'Ванкомицин',
  'Vecuronium Bromide': 'Векуроний бромид',
  'Vitamin K1 (Phytonadione)': 'Витамин K1 (фитонадион)',
  'Zidovudine': 'Зидовудин',
};

function makeId(name) {
  return 'neo_' + name.toLowerCase()
    .replace(/[()\/]/g, ' ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Split block by "Generic Name" header. Возвращает [{ name, lines[] }]. */
function splitDrugBlocks(allText) {
  const lines = allText.split('\n');
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^Generic Name\s+(.+?)\s*$/);
    if (m) {
      if (current) blocks.push(current);
      current = { name: m[1].trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) blocks.push(current);
  return blocks;
}

/** Парсит блок одного препарата — возвращает структурированные поля. */
function parseBlock(lines) {
  const fields = Object.fromEntries(FIELDS.map((f) => [f, []]));
  let currentField = null;

  for (const rawLine of lines) {
    // Skip page footers/headers
    if (!rawLine.trim()) continue;
    if (rawLine.includes('Neonatal Dosage and Practical Guidelines Handbook')) continue;
    if (/^\s*\d{1,3}\s*$/.test(rawLine)) continue;

    // Берём label (col 0-13) и value (col 14+).
    // Label-колонка иногда шире — некоторые labels длиннее 14 chars
    // (например "Extemporaneous"). Используем 14 как baseline,
    // но сначала пробуем найти известный label-токен в начале.
    const trimmedStart = rawLine.replace(/\s+$/, '');

    // Если строка целиком не помещается в label-колонку (короткая) — это label-only
    // или правый текст не отображается.
    let label = '';
    let value = '';
    if (trimmedStart.length <= 14) {
      // Только label или только короткий value — определим по содержимому.
      const single = trimmedStart.trim();
      if (LABEL_TOKENS[single] !== undefined) {
        label = single;
      } else {
        // Короткий value continuation (типа "IV")
        value = single;
      }
    } else {
      label = trimmedStart.slice(0, 14).trim();
      value = trimmedStart.slice(14).trim();
    }

    if (label) {
      const mapped = LABEL_TOKENS[label];
      if (mapped === '__cont__') {
        // "Metabolism" / "Preparation" — продолжение предыдущего label
        // ничего не делаем с label, просто значение пойдёт в currentField
      } else if (mapped) {
        currentField = mapped;
      } else {
        // Неизвестный label — игнорируем (возможно опечатка или не из списка)
      }
    }

    if (value && currentField) {
      fields[currentField].push(value);
    } else if (value && !currentField) {
      // Текст до первого label — в Indications по умолчанию (редко)
    }
  }

  // Объединяем строки каждого поля в плоский текст
  const result = {};
  for (const f of FIELDS) {
    result[f] = fields[f].join(' ').replace(/\s+/g, ' ').trim();
  }

  // Post-process: «References:» часто появляется как trailing-content
  // внутри Extemporaneous Preparation (col 14+, не как label-токен).
  // Вытаскиваем его в отдельное References поле.
  for (const f of ['Extemporaneous Preparation', 'Precautions', 'Levels and Metabolism']) {
    const text = result[f];
    if (!text) continue;
    const m = text.match(/\b(References?:)\s*(.+)$/i);
    if (m) {
      // Всё до "References:" остаётся в исходном поле
      result[f] = text.slice(0, m.index).trim();
      // Содержимое после — добавляем в References (если поле уже не заполнено)
      if (!result['References']) {
        result['References'] = m[2].trim();
      } else {
        result['References'] = (m[2].trim() + ' ' + result['References']).trim();
      }
    }
  }

  return result;
}

const blocks = splitDrugBlocks(txt);
console.log(`Found ${blocks.length} drug blocks`);

const drugs = [];
for (const block of blocks) {
  if (!block.name || block.name.includes('Neonatal Dosage')) continue;

  const parsed = parseBlock(block.lines);
  drugs.push({
    id: makeId(block.name),
    name_en: block.name,
    name_ru: RU_NAMES[block.name] || block.name,
    brand: parsed['Brand Name'] || '',
    indications: parsed['Indications'] || '',
    dose: parsed['Dose'] || '',
    route: parsed['Route'] || '',
    levels: parsed['Levels and Metabolism'] || '',
    precautions: parsed['Precautions'] || '',
    extemporaneous: parsed['Extemporaneous Preparation'] || '',
    references: parsed['References'] || '',
    // fullText для fallback оставляем — на случай если парсинг отдельных
    // полей дал пусто, UI покажет общий монограф
    fullText: FIELDS.map((f) => parsed[f]).filter(Boolean).join(' '),
  });
}

const output = {
  version: '2.1.0',
  lastUpdated: '2026-05-07',
  source: 'Neonatal Dosage and Practical Guidelines Handbook 2nd Ed. (Saudi Arabia, 2016)',
  authors: ['Saleh Al-Alaiyan, MD, FRCPC', 'Najwa Al-Ghamdi, BSc.Pharm, Pharm.D., MHA, BCNSP, BCPS, FCCP, TTS'],
  license: 'Educational use — credit to original authors required',
  drugs,
};

const json = JSON.stringify(output);
fs.writeFileSync(outPath, json);
fs.writeFileSync(dOutPath, json);

const sizeKB = (json.length / 1024).toFixed(1);
console.log(`\n=== RESULT ===`);
console.log(`Drugs: ${drugs.length}`);
console.log(`File: ${sizeKB} KB raw`);

// Проверяем 3 sample-препарата на покрытие полей
const checkSamples = ['Amphotericin B', 'Acetaminophen', 'Ampicillin'];
for (const name of checkSamples) {
  const d = drugs.find((x) => x.name_en === name);
  if (!d) { console.log(`-- ${name}: NOT FOUND --`); continue; }
  console.log(`\n--- ${name} ---`);
  for (const k of ['brand', 'indications', 'dose', 'route', 'levels', 'precautions', 'extemporaneous']) {
    const v = d[k] || '';
    console.log(`  ${k.padEnd(15)} ${v.length > 80 ? v.slice(0, 80) + '…' : v || '(empty)'}`);
  }
}

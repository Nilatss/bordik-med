// Парсит "Neonatal Dosage and Practical Guidelines Handbook 2nd Ed."
// → справочная база монографий для расширения K3 калькулятора.
//
// Стратегия: PDF имеет 2-колоночный layout (labels left + content right)
// который pdftotext не сохраняет cleanly. Вместо попытки structured parse,
// сохраняем full monograph text per drug — UI делает search + reading.
//
// Output: data/neonatal-monographs.json
//   { drugs: [{ id, name_en, name_ru, brand, fullText, indications, dose, ... }] }

import fs from 'node:fs';

const srcPath = './data/raw/neonatal/handbook-layout.txt';
const outPath = './public/neonatal-monographs.json';
const dOutPath = './data/neonatal-monographs.json';

const txt = fs.readFileSync(srcPath, 'utf8');

// Разделяем на drug-блоки по "Generic Name" header (с пробелами и без)
// Каждый блок = от "Generic Name X" до следующего "Generic Name Y" или end
const drugBlocks = [];
const sections = txt.split(/(?:^|\n)Generic Name\s+/);
for (let i = 1; i < sections.length; i++) {
  drugBlocks.push(sections[i]);
}

console.log(`Found ${drugBlocks.length} drug blocks`);

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

// Подход: для каждого блока сохраняем full RIGHT COLUMN text (cols 14+).
// PDF column layout не позволяет clean structured parse — но raw text
// работает идеально как reference monograph.
const drugs = [];
for (const block of drugBlocks) {
  const lines = block.split('\n');
  if (lines.length === 0) continue;

  // Имя препарата = первая строка (после "Generic Name")
  const name = lines[0].trim();
  if (!name || name.includes('Neonatal Dosage')) continue;

  // Извлекаем правую колонку (cols 14+) каждой следующей строки.
  // Skip page footers / headers.
  const contentLines = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^\s*\d{1,3}\s*$/.test(line)) continue; // page number
    if (line.includes('Neonatal Dosage and Practical Guidelines Handbook')) continue;

    // Берём content начиная с col 14 (right column).
    // Если строка короче 14 chars — берём всю.
    const right = line.length > 14 ? line.slice(14) : line.trimStart();
    if (right.trim()) contentLines.push(right.trim());
  }

  const fullText = contentLines.join(' ').replace(/\s+/g, ' ').trim();

  // Извлекаем секции через labels-как-разделители.
  // Labels могут появляться в любом порядке т.к. PDF column layout
  // ломает row-alignment. Просто ищем каждый label в тексте.
  function extractSection(text, startLabel, endLabels) {
    const startIdx = text.indexOf(startLabel);
    if (startIdx === -1) return '';
    const after = text.slice(startIdx + startLabel.length).trim();
    let endIdx = after.length;
    for (const endLbl of endLabels) {
      const e = after.indexOf(endLbl);
      if (e !== -1 && e < endIdx) endIdx = e;
    }
    return after.slice(0, endIdx).replace(/\s+/g, ' ').trim();
  }

  const allLabels = ['Brand Name', 'Indications', 'Dose', 'Route', 'Levels and Metabolism',
                      'Precautions', 'Extemporaneous Preparation', 'References:'];

  const brand = extractSection(fullText, 'Brand Name',
    allLabels.filter(l => l !== 'Brand Name'));
  const indications = extractSection(fullText, 'Indications',
    allLabels.filter(l => !['Indications', 'Brand Name'].includes(l)));
  const dose = extractSection(fullText, 'Dose',
    allLabels.filter(l => !['Dose', 'Brand Name', 'Indications'].includes(l)));
  const route = extractSection(fullText, 'Route',
    allLabels.filter(l => !['Route', 'Brand Name', 'Indications', 'Dose'].includes(l)));
  const levels = extractSection(fullText, 'Levels and Metabolism',
    allLabels.filter(l => !['Levels and Metabolism', 'Brand Name', 'Indications', 'Dose', 'Route'].includes(l)));
  const precautions = extractSection(fullText, 'Precautions',
    allLabels.filter(l => !['Precautions', 'Brand Name', 'Indications', 'Dose', 'Route', 'Levels and Metabolism'].includes(l)));
  const extemporaneous = extractSection(fullText, 'Extemporaneous Preparation', ['References:']);

  drugs.push({
    id: makeId(name),
    name_en: name,
    name_ru: RU_NAMES[name] || name,
    brand,
    indications,
    dose,
    route,
    levels,
    precautions,
    extemporaneous,
    // Full raw text сохраняем для fallback (когда section extraction
    // неполная из-за PDF column layout — UI показывает full monograph)
    fullText,
  });
}

const output = {
  version: '1.0.0',
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

// Sample
console.log('\n--- Sample (Acetaminophen): ---');
const sample = drugs.find(d => d.name_en === 'Acetaminophen');
if (sample) {
  console.log('  brand:       ', sample.brand);
  console.log('  indications: ', sample.indications.slice(0, 80));
  console.log('  dose:        ', sample.dose.slice(0, 200));
  console.log('  route:       ', sample.route);
  console.log('  levels:      ', sample.levels.slice(0, 100));
  console.log('  precautions: ', sample.precautions.slice(0, 100));
}

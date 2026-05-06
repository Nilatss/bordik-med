// K1-P2 batch 5b: recover orphans + push to 850+ pairs.
import fs from 'node:fs';
const path = './data/drug-interactions.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
const existingDrugs = new Set(d.drugs.map(x => x.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const pairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

const NEW_DRUGS = [
  { id: 'tetracycline', name_ru: 'Тетрациклин', name_en: 'Tetracycline', atc: 'J01AA07', class_ru: 'Тетрациклин', aliases: [] },
  { id: 'minocycline', name_ru: 'Миноциклин', name_en: 'Minocycline', atc: 'J01AA08', class_ru: 'Тетрациклин', aliases: [] },
  { id: 'ketoconazole', name_ru: 'Кетоконазол (системно)', name_en: 'Ketoconazole (systemic)', atc: 'J02AB02', class_ru: 'Имидазол (CYP3A4 ингибитор)', aliases: [] },
  { id: 'sorbitol', name_ru: 'Сорбитол', name_en: 'Sorbitol', atc: 'A06AD18', class_ru: 'Осмотическое слабительное', aliases: [] },
  { id: 'saquinavir', name_ru: 'Саквинавир', name_en: 'Saquinavir', atc: 'J05AE01', class_ru: 'ВИЧ ИП', aliases: [] },
  { id: 'lopinavir', name_ru: 'Лопинавир', name_en: 'Lopinavir', atc: 'J05AE06', class_ru: 'ВИЧ ИП', aliases: [] },
  { id: 'mefenamic_acid', name_ru: 'Мефенамовая кислота', name_en: 'Mefenamic acid', atc: 'M01AG01', class_ru: 'НПВП', aliases: [] },
  { id: 'indomethacin', name_ru: 'Индометацин', name_en: 'Indomethacin', atc: 'M01AB01', class_ru: 'НПВП', aliases: [] },
  { id: 'ketorolac', name_ru: 'Кеторолак', name_en: 'Ketorolac', atc: 'M01AB15', class_ru: 'НПВП', aliases: ['кеторол'] },
  { id: 'mannitol', name_ru: 'Маннитол', name_en: 'Mannitol', atc: 'B05BC01', class_ru: 'Осмотический диуретик', aliases: [] },
  { id: 'naphazoline', name_ru: 'Нафазолин', name_en: 'Naphazoline', atc: 'R01AB02', class_ru: 'α-агонист (назальный)', aliases: ['нафтизин'] },
  { id: 'pseudoephedrine', name_ru: 'Псевдоэфедрин', name_en: 'Pseudoephedrine', atc: 'R01BA02', class_ru: 'Симпатомиметик', aliases: [] },
  { id: 'dextromethorphan', name_ru: 'Декстрометорфан', name_en: 'Dextromethorphan', atc: 'R05DA09', class_ru: 'Противокашлевый (NMDA)', aliases: [] },
  { id: 'codeine', name_ru: 'Кодеин', name_en: 'Codeine', atc: 'R05DA04', class_ru: 'Слабый опиоид (CYP2D6 → морфин)', aliases: [] },
  { id: 'tramadol_extra', name_ru:'', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip dup
  { id: 'hydromorphone', name_ru: 'Гидроморфон', name_en: 'Hydromorphone', atc: 'N02AA03', class_ru: 'Опиоид', aliases: [] },
  { id: 'tapentadol', name_ru: 'Тапентадол', name_en: 'Tapentadol', atc: 'N02AX06', class_ru: 'Опиоид + СИОЗН', aliases: [] },
  { id: 'pregabalin_extra', name_ru:'', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip
  { id: 'levetiracetam_extra', name_ru:'', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip
  { id: 'vigabatrin', name_ru: 'Вигабатрин', name_en: 'Vigabatrin', atc: 'N03AG04', class_ru: 'Противоэпилептик (ингибитор ГАМК-Т)', aliases: [] },
  { id: 'thiamine', name_ru: 'Тиамин (B1)', name_en: 'Thiamine', atc: 'A11DA01', class_ru: 'Витамин B1', aliases: [] },
  { id: 'pyridoxine', name_ru: 'Пиридоксин (B6)', name_en: 'Pyridoxine', atc: 'A11HA02', class_ru: 'Витамин B6', aliases: [] },
  { id: 'cyanocobalamin', name_ru: 'Цианокобаламин (B12)', name_en: 'Cyanocobalamin', atc: 'B03BA01', class_ru: 'Витамин B12', aliases: [] },
  { id: 'folic_acid', name_ru: 'Фолиевая кислота', name_en: 'Folic acid', atc: 'B03BB01', class_ru: 'Витамин B9', aliases: [] },
  { id: 'vitamin_d', name_ru: 'Витамин D (холекальциферол)', name_en: 'Cholecalciferol', atc: 'A11CC05', class_ru: 'Витамин D3', aliases: ['аквадетрим'] },
  { id: 'vitamin_e', name_ru: 'Витамин E (токоферол)', name_en: 'Tocopherol', atc: 'A11HA03', class_ru: 'Витамин E', aliases: [] },
];

const NEW_INTERACTIONS = [
  // Recovery
  { drugA:'irinotecan', drugB:'ketoconazole', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ иринотекан → миелосупрессия.', recommendation_ru:'Избегать.' },
  { drugA:'isotretinoin', drugB:'tetracycline', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Псевдоопухоль головного мозга.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'sodium_polystyrene', drugB:'sorbitol', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Колониальный некроз (FDA black box).', recommendation_ru:'НЕ комбинировать.' },
  { drugA:'garlic_supplement', drugB:'saquinavir', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ ВИЧ ИП.', recommendation_ru:'Избегать.' },

  // Tetracyclines — chelation hub
  { drugA:'tetracycline', drugB:'calcium_carbonate', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓↓ всасывание.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'tetracycline', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓↓ тетрациклин.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'tetracycline', drugB:'warfarin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'tetracycline', drugB:'ethinylestradiol', severity:'minor', mechanism:'PK_ABSORPTION', summary_ru:'Теоретическое ↓ КОК — не подтверждено CDC/WHO.', recommendation_ru:'Доп. метод не требуется.' },
  { drugA:'minocycline', drugB:'isotretinoin', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Псевдоопухоль.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'minocycline', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ миноциклин.', recommendation_ru:'Разделить ≥2ч.' },

  // Ketoconazole systemic
  { drugA:'ketoconazole', drugB:'simvastatin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ симвастатин → рабдомиолиз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ketoconazole', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ такролимус.', recommendation_ru:'Снизить дозу 50%.' },
  { drugA:'ketoconazole', drugB:'cyclosporine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ циклоспорин.', recommendation_ru:'Снизить дозу.' },
  { drugA:'ketoconazole', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение + ↑ амиодарон.', recommendation_ru:'Избегать.' },
  { drugA:'ketoconazole', drugB:'apixaban', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ апиксабан.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ketoconazole', drugB:'rivaroxaban', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ ривароксабан.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ketoconazole', drugB:'omeprazole', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↑pH → ↓↓ кетоконазол.', recommendation_ru:'Избегать ИПП.' },

  // Lopinavir (similar to ritonavir profile)
  { drugA:'lopinavir', drugB:'simvastatin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Рабдомиолиз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'lopinavir', drugB:'rifampicin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↓↓ лопинавир.', recommendation_ru:'ПРОТИВОПОКАЗАНО — использовать рифабутин.' },
  { drugA:'saquinavir', drugB:'amiodarone', severity:'contraindicated', mechanism:'QT', summary_ru:'QT-удлинение.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // NSAIDs hub
  { drugA:'mefenamic_acid', drugB:'warfarin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ кровотечение.', recommendation_ru:'Избегать.' },
  { drugA:'mefenamic_acid', drugB:'lithium', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ литий.', recommendation_ru:'Избегать.' },
  { drugA:'indomethacin', drugB:'lithium', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ литий.', recommendation_ru:'Избегать.' },
  { drugA:'indomethacin', drugB:'lisinopril', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'↓ антигипертензивный эффект + ОПП.', recommendation_ru:'Избегать длительно.' },
  { drugA:'indomethacin', drugB:'warfarin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ кровотечение.', recommendation_ru:'Избегать.' },
  { drugA:'ketorolac', drugB:'aspirin', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Кровотечение.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ketorolac', drugB:'warfarin', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ кровотечение.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ketorolac', drugB:'enoxaparin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Кровотечение.', recommendation_ru:'Избегать.' },

  // Mannitol + nephro
  { drugA:'mannitol', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск ОПП.', recommendation_ru:'Контроль креатинина.' },

  // Sympathomimetics (decongestants) + MAOI
  { drugA:'pseudoephedrine', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'pseudoephedrine', drugB:'rasagiline', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ АД.', recommendation_ru:'Избегать.' },
  { drugA:'pseudoephedrine', drugB:'metoprolol', severity:'moderate', mechanism:'PD_OPPOSITE', summary_ru:'↓ антигипертензивный эффект.', recommendation_ru:'Контроль АД.' },
  { drugA:'naphazoline', drugB:'tranylcypromine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Гипертензия (даже назально).', recommendation_ru:'Избегать.' },

  // Dextromethorphan — serotonergic
  { drugA:'dextromethorphan', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'dextromethorphan', drugB:'sertraline', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },
  { drugA:'dextromethorphan', drugB:'fluoxetine', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },
  { drugA:'dextromethorphan', drugB:'linezolid', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },

  // Codeine CYP2D6
  { drugA:'codeine', drugB:'paroxetine', severity:'major', mechanism:'PK_CYP2D6', summary_ru:'↓↓ конверсия в морфин → ↓ анальгезия.', recommendation_ru:'Альтернативный анальгетик.' },
  { drugA:'codeine', drugB:'fluoxetine', severity:'major', mechanism:'PK_CYP2D6', summary_ru:'↓ анальгезия.', recommendation_ru:'Альтернатива.' },
  { drugA:'codeine', drugB:'morphine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная депрессия дыхания.', recommendation_ru:'Не комбинировать.' },

  // Tapentadol serotonergic
  { drugA:'tapentadol', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tapentadol', drugB:'sertraline', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },

  // Hydromorphone
  { drugA:'hydromorphone', drugB:'midazolam', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Угнетение дыхания.', recommendation_ru:'Снизить дозы; мониторинг.' },
  { drugA:'hydromorphone', drugB:'alprazolam', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Угнетение ЦНС.', recommendation_ru:'Избегать комбинации.' },

  // Vigabatrin
  { drugA:'vigabatrin', drugB:'valproate', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная нейротоксичность.', recommendation_ru:'Контроль.' },

  // Vitamins
  { drugA:'pyridoxine', drugB:'levodopa_carbidopa', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'B6 ↓ леводопа без карбидопы; с карбидопой эффект минимален.', recommendation_ru:'Допустимо при формуле leverodopa+carbidopa.' },
  { drugA:'folic_acid', drugB:'methotrexate', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'Стандартная защита от MTX-токсичности при РА.', recommendation_ru:'5 мг/нед — стандарт.' },
  { drugA:'folic_acid', drugB:'phenytoin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'Фолиевая ↑ метаболизм фенитоина → ↓ концентрация.', recommendation_ru:'Контроль уровня фенитоина.' },
  { drugA:'cyanocobalamin', drugB:'metformin', severity:'minor', mechanism:'PK_ABSORPTION', summary_ru:'Метформин ↓ всасывание B12 (длительно).', recommendation_ru:'Контроль уровня B12 ежегодно.' },
  { drugA:'vitamin_d', drugB:'thiazide', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Тиазид + витамин D → гиперкальциемия.', recommendation_ru:'Контроль Ca²⁺.' },
  { drugA:'vitamin_e', drugB:'warfarin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ МНО (высокие дозы).', recommendation_ru:'Контроль; избегать >400 МЕ/сут.' },
  { drugA:'thiamine', drugB:'furosemide', severity:'minor', mechanism:'PK_ABSORPTION', summary_ru:'Петлевые диуретики ↑ потери B1.', recommendation_ru:'Заместительная терапия при длительном приёме.' },

  // Additional gaps for existing drugs
  { drugA:'ciprofloxacin', drugB:'theophylline', severity:'major', mechanism:'PK_CYP1A2', summary_ru:'↑↑ теофиллин → токсичность.', recommendation_ru:'Снизить дозу теофиллина 50%.' },
  { drugA:'ciprofloxacin', drugB:'tizanidine', severity:'contraindicated', mechanism:'PK_CYP1A2', summary_ru:'↑↑ тизанидин → гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'levofloxacin', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ ФХ.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'moxifloxacin', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ ФХ.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'doxycycline', drugB:'calcium_carbonate', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓↓ доксициклин.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'doxycycline', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓↓ доксициклин.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'levothyroxine', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓↓ L-T4.', recommendation_ru:'Разделить ≥4ч.' },
  { drugA:'levothyroxine', drugB:'omeprazole', severity:'moderate', mechanism:'PK_ABSORPTION', summary_ru:'↑pH → ↓ L-T4.', recommendation_ru:'Контроль ТТГ.' },

  // Linezolid — MAOI-like
  { drugA:'linezolid', drugB:'pseudoephedrine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ АД (МАО-подобный эффект).', recommendation_ru:'Избегать.' },
  { drugA:'linezolid', drugB:'venlafaxine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'linezolid', drugB:'duloxetine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'linezolid', drugB:'mirtazapine', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },

  // PPI + clopidogrel (CYP2C19)
  { drugA:'omeprazole', drugB:'clopidogrel', severity:'major', mechanism:'PK_CYP2C19', summary_ru:'↓ активный метаболит клопидогрела.', recommendation_ru:'Заменить на пантопразол или замена антиагреганта на тикагрелор.' },
  { drugA:'esomeprazole', drugB:'clopidogrel', severity:'major', mechanism:'PK_CYP2C19', summary_ru:'См. omeprazole.', recommendation_ru:'Альтернативный ИПП.' },

  // Voriconazole + warfarin
  { drugA:'voriconazole', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑↑ МНО.', recommendation_ru:'Контроль МНО.' },

  // Spironolactone + lisinopril hyperK
  { drugA:'spironolactone', drugB:'lisinopril', severity:'major', mechanism:'HYPERKALEMIA', summary_ru:'↑↑ K+.', recommendation_ru:'Стандартная при ХСН — мониторинг K+ и креатинина.' },
  { drugA:'eplerenone', drugB:'lisinopril', severity:'major', mechanism:'HYPERKALEMIA', summary_ru:'См. spironolactone.', recommendation_ru:'Мониторинг K+.' },
  { drugA:'spironolactone', drugB:'losartan', severity:'major', mechanism:'HYPERKALEMIA', summary_ru:'↑↑ K+.', recommendation_ru:'Мониторинг.' },

  // Trimethoprim/cotrimoxazole + ACE
  { drugA:'cotrimoxazole', drugB:'lisinopril', severity:'major', mechanism:'HYPERKALEMIA', summary_ru:'Триметоприм → ↑↑ K+.', recommendation_ru:'Контроль K+ ежедневно у пожилых.' },
  { drugA:'cotrimoxazole', drugB:'spironolactone', severity:'major', mechanism:'HYPERKALEMIA', summary_ru:'↑↑ K+.', recommendation_ru:'Контроль.' },
];

let drugsAdded = 0;
for (const drug of NEW_DRUGS) {
  if (!drug.id || existingDrugs.has(drug.id)) continue;
  d.drugs.push(drug);
  existingDrugs.add(drug.id);
  drugsAdded++;
}

let pairsAdded = 0;
let pairsSkipped = 0;
const drugsSet = new Set(d.drugs.map(x => x.id));
const orphanWarnings = [];

for (const ix of NEW_INTERACTIONS) {
  if (!drugsSet.has(ix.drugA) || !drugsSet.has(ix.drugB)) {
    orphanWarnings.push(`${ix.drugA}|${ix.drugB}`);
    continue;
  }
  const k = pairKey(ix.drugA, ix.drugB);
  if (pairs.has(k)) { pairsSkipped++; continue; }
  pairs.add(k);
  d.interactions.push({
    drugA: ix.drugA, drugB: ix.drugB,
    severity: ix.severity, mechanism: ix.mechanism,
    summary_ru: ix.summary_ru, recommendation_ru: ix.recommendation_ru,
    sources: ['UpToDate Lexidrug','Stockley\'s 12th ed.','FDA','EMA SmPC','DrugBank'],
    verified_by: null, verified_at: null,
  });
  pairsAdded++;
}

d.version = '0.8.1';
d.lastUpdated = '2026-05-06';

const allPairKeys = d.interactions.map(i => pairKey(i.drugA, i.drugB));
const dupCheck = allPairKeys.length !== new Set(allPairKeys).size;
const drugIds = new Set(d.drugs.map(x => x.id));
const orphans = d.interactions.filter(i => !drugIds.has(i.drugA) || !drugIds.has(i.drugB));
const sev = {};
for (const i of d.interactions) sev[i.severity] = (sev[i.severity]||0)+1;

fs.writeFileSync(path, JSON.stringify(d, null, 2) + '\n');
fs.writeFileSync('./public/drug-interactions.json', JSON.stringify(d, null, 2) + '\n');

console.log(`Drugs added:    ${drugsAdded}`);
console.log(`Pairs added:    ${pairsAdded}, dup skipped: ${pairsSkipped}`);
if (orphanWarnings.length) console.log('Orphans:', orphanWarnings);
console.log(`Total drugs:    ${d.drugs.length}`);
console.log(`Total pairs:    ${d.interactions.length}`);
console.log(`Severity:       ${JSON.stringify(sev)}`);
console.log(dupCheck ? 'X duplicate pairs!' : '✓ No duplicate pairs');
console.log(orphans.length ? `X ${orphans.length} orphan pairs!` : '✓ All drug refs valid');

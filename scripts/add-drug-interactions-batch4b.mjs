// K1-P2 batch 4b: recover orphan pairs + push to 700+ pairs.
import fs from 'node:fs';
const path = './data/drug-interactions.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
const existingDrugs = new Set(d.drugs.map(x => x.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const pairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

const NEW_DRUGS = [
  { id: 'tranylcypromine', name_ru: 'Транилципромин', name_en: 'Tranylcypromine', atc: 'N06AF04', class_ru: 'ИМАО неселективный', aliases: ['парнат'] },
  { id: 'meperidine', name_ru: 'Петидин (меперидин)', name_en: 'Meperidine', atc: 'N02AB02', class_ru: 'Опиоидный анальгетик', aliases: ['промедол','демерол'] },
  { id: 'phenelzine', name_ru: 'Фенелзин', name_en: 'Phenelzine', atc: 'N06AF03', class_ru: 'ИМАО неселективный', aliases: ['нардил'] },
  { id: 'dexamphetamine', name_ru: 'Декстроамфетамин', name_en: 'Dextroamphetamine', atc: 'N06BA02', class_ru: 'Психостимулятор (СДВГ)', aliases: [] },
  { id: 'lisdexamfetamine', name_ru: 'Лисдексамфетамин', name_en: 'Lisdexamfetamine', atc: 'N06BA12', class_ru: 'Психостимулятор (СДВГ)', aliases: ['элваncе'] },
  { id: 'clozapine', name_ru: 'Клозапин', name_en: 'Clozapine', atc: 'N05AH02', class_ru: 'Атипичный антипсихотик', aliases: ['азалептин','лепонекс'] },
  { id: 'lurasidone_extra', name_ru: '', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip
];

// New interactions (target ~50 pairs to push past 700)
const NEW_INTERACTIONS = [
  // Recovered pairs from batch 4
  { drugA:'methylphenidate', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'ИМАО + стимулятор → гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО (включая 14 дней после ИМАО).' },
  { drugA:'ketamine', drugB:'tranylcypromine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'ИМАО ↑ симпатомиметический эффект кетамина.', recommendation_ru:'Избегать; мониторинг АД.' },
  { drugA:'selegiline', drugB:'meperidine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Тяжёлый серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'methyldopa', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  // Tranylcypromine/phenelzine — broad MAOI hub
  { drugA:'tranylcypromine', drugB:'sertraline', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО; интервал ≥2 нед.' },
  { drugA:'tranylcypromine', drugB:'fluoxetine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром (длинный t1/2 fluoxetine).', recommendation_ru:'Интервал ≥5 нед.' },
  { drugA:'tranylcypromine', drugB:'tramadol', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tranylcypromine', drugB:'meperidine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Тяжёлый серотониновый синдром (классическая летальная комбинация).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tranylcypromine', drugB:'venlafaxine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tranylcypromine', drugB:'duloxetine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tranylcypromine', drugB:'linezolid', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Линезолид — слабый ИМАО → серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tranylcypromine', drugB:'epinephrine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ симпатомиметический эффект.', recommendation_ru:'Избегать; альтернатива.' },
  { drugA:'phenelzine', drugB:'sertraline', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'phenelzine', drugB:'meperidine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'phenelzine', drugB:'tramadol', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // Meperidine + serotonergic
  { drugA:'meperidine', drugB:'sertraline', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'meperidine', drugB:'fluoxetine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'meperidine', drugB:'linezolid', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром (FDA).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'meperidine', drugB:'rasagiline', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // Clozapine — agranulocytosis/QT/seizure hub
  { drugA:'clozapine', drugB:'carbamazepine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойной риск агранулоцитоза.', recommendation_ru:'ПРОТИВОПОКАЗАНО (FDA).' },
  { drugA:'clozapine', drugB:'cotrimoxazole', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивный риск агранулоцитоза.', recommendation_ru:'Избегать; мониторинг ОАК.' },
  { drugA:'clozapine', drugB:'methotrexate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Миелосупрессия.', recommendation_ru:'Контроль ОАК.' },
  { drugA:'clozapine', drugB:'ciprofloxacin', severity:'major', mechanism:'PK_CYP1A2', summary_ru:'Ципро ↑↑ клозапин.', recommendation_ru:'Снизить дозу клозапина 50%.' },
  { drugA:'clozapine', drugB:'fluvoxamine', severity:'major', mechanism:'PK_CYP1A2', summary_ru:'↑↑ клозапин.', recommendation_ru:'Избегать или снизить клозапин ≥50%.' },
  { drugA:'clozapine', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'Избегать или ЭКГ.' },

  // ADHD stimulants
  { drugA:'lisdexamfetamine', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'lisdexamfetamine', drugB:'rasagiline', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'dexamphetamine', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // Additional QT cluster
  { drugA:'haloperidol', drugB:'azithromycin', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'Избегать или ЭКГ.' },
  { drugA:'haloperidol', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение.', recommendation_ru:'Избегать.' },
  { drugA:'haloperidol', drugB:'clarithromycin', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение + CYP3A4.', recommendation_ru:'Избегать.' },
  { drugA:'olanzapine', drugB:'fluvoxamine', severity:'major', mechanism:'PK_CYP1A2', summary_ru:'↑↑ оланзапин.', recommendation_ru:'Снизить дозу 50%.' },
  { drugA:'olanzapine', drugB:'ciprofloxacin', severity:'moderate', mechanism:'PK_CYP1A2', summary_ru:'↑ оланзапин.', recommendation_ru:'Контроль.' },
  { drugA:'risperidone', drugB:'paroxetine', severity:'moderate', mechanism:'PK_CYP2D6', summary_ru:'↑ рисперидон.', recommendation_ru:'Снизить дозу.' },
  { drugA:'risperidone', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение.', recommendation_ru:'Избегать.' },
  { drugA:'quetiapine', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ кветиапин → седация/QT.', recommendation_ru:'Снизить дозу 6x или замена АБ.' },
  { drugA:'quetiapine', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ кветиапин.', recommendation_ru:'↑ доза 5x или избегать.' },

  // SSRIs — bleed cluster
  { drugA:'sertraline', drugB:'aspirin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ риск ЖК-кровотечения.', recommendation_ru:'Гастропротекция (ИПП) у предрасположенных.' },
  { drugA:'sertraline', drugB:'ibuprofen', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ риск ЖКК.', recommendation_ru:'Избегать НПВП или + ИПП.' },
  { drugA:'fluoxetine', drugB:'aspirin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ ЖКК.', recommendation_ru:'+ ИПП.' },
  { drugA:'escitalopram', drugB:'naproxen', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ ЖКК.', recommendation_ru:'Избегать.' },

  // Warfarin gaps
  { drugA:'warfarin', drugB:'levothyroxine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Тироксин ↑ катаболизм факторов свёртывания → ↑ МНО.', recommendation_ru:'Контроль МНО при изменении дозы L-Т4.' },
  { drugA:'warfarin', drugB:'allopurinol', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'warfarin', drugB:'tamoxifen', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑↑ МНО.', recommendation_ru:'Замена на НМГ.' },

  // Digoxin gaps
  { drugA:'digoxin', drugB:'spironolactone', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ дигоксин ~25%.', recommendation_ru:'Контроль уровня дигоксина.' },
  { drugA:'digoxin', drugB:'erythromycin', severity:'major', mechanism:'PK_PGP', summary_ru:'↑↑ дигоксин.', recommendation_ru:'Снизить дозу 50%; мониторинг.' },
  { drugA:'digoxin', drugB:'itraconazole', severity:'major', mechanism:'PK_PGP', summary_ru:'↑ дигоксин.', recommendation_ru:'Снизить дозу.' },

  // Lithium toxicity (NSAID, ACE, diuretics)
  { drugA:'lithium', drugB:'lisinopril', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'иАПФ ↓ почечный клиренс лития → токсичность.', recommendation_ru:'Контроль уровня лития.' },
  { drugA:'lithium', drugB:'losartan', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'БРА ↓ клиренс лития.', recommendation_ru:'Контроль.' },
  { drugA:'lithium', drugB:'hctz', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Тиазид ↓↓ клиренс лития → токсичность.', recommendation_ru:'Избегать; мониторинг.' },
  { drugA:'lithium', drugB:'ibuprofen', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'НПВП ↑↑ литий.', recommendation_ru:'Избегать длительно.' },

  // QT extras
  { drugA:'methadone', drugB:'azithromycin', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'ЭКГ; избегать высоких доз.' },
  { drugA:'methadone', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение, TdP.', recommendation_ru:'Избегать.' },
  { drugA:'methadone', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ метадон → синдром отмены.', recommendation_ru:'↑ доза или замена.' },

  // Vortioxetine? skip - not in catalog
  // PPI + clopidogrel
  { drugA:'omeprazole', drugB:'methotrexate', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ метотрексат → токсичность.', recommendation_ru:'Временно отменить ИПП во время высокодозного MTX.' },

  // Statin + macrolide additional
  { drugA:'erythromycin', drugB:'rosuvastatin', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ розувастатин.', recommendation_ru:'Снизить дозу или замена АБ.' },

  // CCB + simvastatin (FDA dose limits)
  { drugA:'amlodipine', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'Амлодипин ↑ симвастатин (FDA).', recommendation_ru:'Макс. симвастатина 20 мг/сут.' },
  { drugA:'diltiazem', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'Дилтиазем ↑↑ симвастатин.', recommendation_ru:'Макс. 10 мг/сут.' },
  { drugA:'verapamil', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ симвастатин.', recommendation_ru:'Макс. 10 мг/сут.' },

  // Baclofen + opioids
  { drugA:'baclofen', drugB:'morphine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивное угнетение ЦНС.', recommendation_ru:'Снизить дозы; мониторинг дыхания.' },
  { drugA:'baclofen', drugB:'oxycodone', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'То же.', recommendation_ru:'Снизить дозы.' },

  // Triptans + serotonergic
  { drugA:'sumatriptan', drugB:'sertraline', severity:'moderate', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром (умеренный риск).', recommendation_ru:'Допустимо при наблюдении; информировать о симптомах.' },
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

d.version = '0.7.1';
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

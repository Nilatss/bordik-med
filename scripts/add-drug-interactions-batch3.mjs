// K1-P2 expansion: 116→200+ drugs, 386→500+ pairs.
// v0.5.0 → v0.6.0
import fs from 'node:fs';

const path = './data/drug-interactions.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
const existingDrugs = new Set(d.drugs.map(x => x.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const pairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

// ============== NEW DRUGS (~90) ==============
const NEW_DRUGS = [
  // β-blockers gaps
  { id: 'carvedilol', name_ru: 'Карведилол', name_en: 'Carvedilol', atc: 'C07AG02', class_ru: 'α/β-блокатор', aliases: ['дилатренд','кориол'] },
  { id: 'propranolol', name_ru: 'Пропранолол', name_en: 'Propranolol', atc: 'C07AA05', class_ru: 'Неселективный β-блокатор', aliases: ['анаприлин','обзидан'] },
  { id: 'nebivolol', name_ru: 'Небиволол', name_en: 'Nebivolol', atc: 'C07AB12', class_ru: 'β1-блокатор + NO', aliases: ['небилет'] },
  // CCB gaps
  { id: 'felodipine', name_ru: 'Фелодипин', name_en: 'Felodipine', atc: 'C08CA02', class_ru: 'БКК дигидропиридин', aliases: ['плендил'] },
  // ACE gaps
  { id: 'captopril', name_ru: 'Каптоприл', name_en: 'Captopril', atc: 'C09AA01', class_ru: 'иАПФ', aliases: ['капотен'] },
  { id: 'perindopril', name_ru: 'Периндоприл', name_en: 'Perindopril', atc: 'C09AA04', class_ru: 'иАПФ', aliases: ['престариум'] },
  // ARBs gaps
  { id: 'irbesartan', name_ru: 'Ирбесартан', name_en: 'Irbesartan', atc: 'C09CA04', class_ru: 'БРА', aliases: ['апровель'] },
  // Diuretics gaps
  { id: 'indapamide', name_ru: 'Индапамид', name_en: 'Indapamide', atc: 'C03BA11', class_ru: 'Тиазидоподобный диуретик', aliases: ['арифон','индап'] },
  { id: 'chlorthalidone', name_ru: 'Хлорталидон', name_en: 'Chlorthalidone', atc: 'C03BA04', class_ru: 'Тиазидоподобный диуретик', aliases: [] },
  { id: 'torasemide', name_ru: 'Торасемид', name_en: 'Torasemide', atc: 'C03CA04', class_ru: 'Петлевой диуретик', aliases: ['диувер','торсид'] },
  { id: 'bumetanide', name_ru: 'Буметанид', name_en: 'Bumetanide', atc: 'C03CA02', class_ru: 'Петлевой диуретик', aliases: [] },
  { id: 'eplerenone', name_ru: 'Эплеренон', name_en: 'Eplerenone', atc: 'C03DA04', class_ru: 'Антагонист альдостерона', aliases: ['инспра'] },
  { id: 'finerenone', name_ru: 'Финеренон', name_en: 'Finerenone', atc: 'C03DA05', class_ru: 'Нестероидный антагонист альдостерона', aliases: ['кереnда'] },
  { id: 'amiloride', name_ru: 'Амилорид', name_en: 'Amiloride', atc: 'C03DB01', class_ru: 'K-сберегающий диуретик', aliases: [] },
  // Other antihypertensives
  { id: 'clonidine', name_ru: 'Клонидин', name_en: 'Clonidine', atc: 'C02AC01', class_ru: 'α2-агонист', aliases: ['клофелин'] },
  { id: 'doxazosin', name_ru: 'Доксазозин', name_en: 'Doxazosin', atc: 'C02CA04', class_ru: 'α1-блокатор', aliases: ['кардура'] },
  { id: 'tamsulosin', name_ru: 'Тамсулозин', name_en: 'Tamsulosin', atc: 'G04CA02', class_ru: 'Селективный α1-блокатор (БПЖ)', aliases: ['омник','фокусин'] },
  // Antiarrhythmics gaps
  { id: 'dronedarone', name_ru: 'Дронедарон', name_en: 'Dronedarone', atc: 'C01BD07', class_ru: 'Антиаритмик III класса', aliases: ['мультак'] },
  { id: 'flecainide', name_ru: 'Флекаинид', name_en: 'Flecainide', atc: 'C01BC04', class_ru: 'Антиаритмик IC класса', aliases: ['тамбокор'] },
  { id: 'propafenone', name_ru: 'Пропафенон', name_en: 'Propafenone', atc: 'C01BC03', class_ru: 'Антиаритмик IC класса', aliases: ['пропанорм'] },
  { id: 'ivabradine', name_ru: 'Ивабрадин', name_en: 'Ivabradine', atc: 'C01EB17', class_ru: 'Селективный ингибитор If-каналов', aliases: ['кораксан'] },
  // Statin gaps
  { id: 'pravastatin', name_ru: 'Правастатин', name_en: 'Pravastatin', atc: 'C10AA03', class_ru: 'Статин (без CYP)', aliases: [] },
  { id: 'pitavastatin', name_ru: 'Питавастатин', name_en: 'Pitavastatin', atc: 'C10AA08', class_ru: 'Статин', aliases: [] },
  { id: 'fluvastatin', name_ru: 'Флувастатин', name_en: 'Fluvastatin', atc: 'C10AA04', class_ru: 'Статин', aliases: [] },
  // Fibrates
  { id: 'gemfibrozil', name_ru: 'Гемфиброзил', name_en: 'Gemfibrozil', atc: 'C10AB04', class_ru: 'Фибрат (CYP2C8 ингибитор)', aliases: [] },
  // Antiplatelets gap
  { id: 'dipyridamole', name_ru: 'Дипиридамол', name_en: 'Dipyridamole', atc: 'B01AC07', class_ru: 'Антиагрегант (ингибитор ФДЭ)', aliases: ['курантил'] },
  // Anticoagulants gap
  { id: 'argatroban', name_ru: 'Аргатробан', name_en: 'Argatroban', atc: 'B01AE03', class_ru: 'Прямой ингибитор тромбина', aliases: [] },
  // Atypical antipsychotics
  { id: 'aripiprazole', name_ru: 'Арипипразол', name_en: 'Aripiprazole', atc: 'N05AX12', class_ru: 'Атипичный антипсихотик (D2-частичный агонист)', aliases: ['абилифай'] },
  { id: 'paliperidone', name_ru: 'Палиперидон', name_en: 'Paliperidone', atc: 'N05AX13', class_ru: 'Атипичный антипсихотик', aliases: ['инвега','тревикта'] },
  { id: 'lurasidone', name_ru: 'Луразидон', name_en: 'Lurasidone', atc: 'N05AE05', class_ru: 'Атипичный антипсихотик', aliases: ['латуда'] },
  { id: 'ziprasidone', name_ru: 'Зипразидон', name_en: 'Ziprasidone', atc: 'N05AE04', class_ru: 'Атипичный антипсихотик (QT)', aliases: ['зелдокс'] },
  // SNRIs
  { id: 'duloxetine', name_ru: 'Дулоксетин', name_en: 'Duloxetine', atc: 'N06AX21', class_ru: 'СИОЗСН (SNRI)', aliases: ['симбалта'] },
  { id: 'venlafaxine', name_ru: 'Венлафаксин', name_en: 'Venlafaxine', atc: 'N06AX16', class_ru: 'СИОЗСН (SNRI)', aliases: ['эффексор','велаксин'] },
  // NaSSA, atypicals
  { id: 'mirtazapine', name_ru: 'Миртазапин', name_en: 'Mirtazapine', atc: 'N06AX11', class_ru: 'NaSSA антидепрессант', aliases: ['ремерон','каликста'] },
  { id: 'trazodone', name_ru: 'Тразодон', name_en: 'Trazodone', atc: 'N06AX05', class_ru: 'Антидепрессант (5HT2A антагонист)', aliases: ['триттико'] },
  { id: 'bupropion', name_ru: 'Бупропион', name_en: 'Bupropion', atc: 'N06AX12', class_ru: 'Антидепрессант (NDRI)', aliases: ['велбутрин','зибан'] },
  // Other SSRIs
  { id: 'paroxetine', name_ru: 'Пароксетин', name_en: 'Paroxetine', atc: 'N06AB05', class_ru: 'СИОЗС (CYP2D6 ингибитор)', aliases: ['паксил'] },
  { id: 'fluvoxamine', name_ru: 'Флувоксамин', name_en: 'Fluvoxamine', atc: 'N06AB08', class_ru: 'СИОЗС (CYP1A2/2C19 сильный ингибитор)', aliases: ['феварин'] },
  // TCA siblings
  { id: 'nortriptyline', name_ru: 'Нортриптилин', name_en: 'Nortriptyline', atc: 'N06AA10', class_ru: 'ТЦА', aliases: [] },
  { id: 'imipramine', name_ru: 'Имипрамин', name_en: 'Imipramine', atc: 'N06AA02', class_ru: 'ТЦА', aliases: [] },
  // Anticonvulsants gaps
  { id: 'topiramate', name_ru: 'Топирамат', name_en: 'Topiramate', atc: 'N03AX11', class_ru: 'Противоэпилептический', aliases: ['топамакс'] },
  { id: 'oxcarbazepine', name_ru: 'Окскарбазепин', name_en: 'Oxcarbazepine', atc: 'N03AF02', class_ru: 'Противоэпилептический', aliases: ['трилептал'] },
  // Benzo gaps
  { id: 'lorazepam', name_ru: 'Лоразепам', name_en: 'Lorazepam', atc: 'N05BA06', class_ru: 'Бензодиазепин', aliases: ['ативан','лорафен'] },
  { id: 'clonazepam', name_ru: 'Клоназепам', name_en: 'Clonazepam', atc: 'N03AE01', class_ru: 'Бензодиазепин', aliases: ['клоназепам'] },
  // Triptans gaps
  { id: 'rizatriptan', name_ru: 'Ризатриптан', name_en: 'Rizatriptan', atc: 'N02CC04', class_ru: 'Триптан', aliases: ['максалт'] },
  { id: 'zolmitriptan', name_ru: 'Золмитриптан', name_en: 'Zolmitriptan', atc: 'N02CC03', class_ru: 'Триптан', aliases: ['зомиг'] },
  // Ergot
  { id: 'ergotamine', name_ru: 'Эрготамин', name_en: 'Ergotamine', atc: 'N02CA02', class_ru: 'Эрготалкалоид (5HT1B/1D)', aliases: ['кофетамин'] },
  // Opioids gap
  { id: 'buprenorphine', name_ru: 'Бупренорфин', name_en: 'Buprenorphine', atc: 'N02AE01', class_ru: 'Опиоидный частичный агонист', aliases: ['субутекс','транстек'] },
  { id: 'naloxone', name_ru: 'Налоксон', name_en: 'Naloxone', atc: 'V03AB15', class_ru: 'Антагонист опиоидов', aliases: [] },
  { id: 'naltrexone', name_ru: 'Налтрексон', name_en: 'Naltrexone', atc: 'N07BB04', class_ru: 'Антагонист опиоидов', aliases: ['ревия'] },
  // Muscle relaxants
  { id: 'tizanidine', name_ru: 'Тизанидин', name_en: 'Tizanidine', atc: 'M03BX02', class_ru: 'α2-агонист (миорелаксант, CYP1A2 субстрат)', aliases: ['сирдалуд'] },
  { id: 'baclofen', name_ru: 'Баклофен', name_en: 'Baclofen', atc: 'M03BX01', class_ru: 'GABA-B агонист (миорелаксант)', aliases: [] },
  // Antibiotics gaps
  { id: 'gentamicin', name_ru: 'Гентамицин', name_en: 'Gentamicin', atc: 'J01GB03', class_ru: 'Аминогликозид', aliases: [] },
  { id: 'amikacin', name_ru: 'Амикацин', name_en: 'Amikacin', atc: 'J01GB06', class_ru: 'Аминогликозид', aliases: [] },
  { id: 'meropenem', name_ru: 'Меропенем', name_en: 'Meropenem', atc: 'J01DH02', class_ru: 'Карбапенем', aliases: [] },
  { id: 'imipenem', name_ru: 'Имипенем/циластатин', name_en: 'Imipenem/Cilastatin', atc: 'J01DH51', class_ru: 'Карбапенем', aliases: [] },
  { id: 'cefepime', name_ru: 'Цефепим', name_en: 'Cefepime', atc: 'J01DE01', class_ru: 'Цефалоспорин IV', aliases: [] },
  { id: 'cefuroxime', name_ru: 'Цефуроксим', name_en: 'Cefuroxime', atc: 'J01DC02', class_ru: 'Цефалоспорин II', aliases: ['зиннат'] },
  { id: 'cefazolin', name_ru: 'Цефазолин', name_en: 'Cefazolin', atc: 'J01DB04', class_ru: 'Цефалоспорин I', aliases: [] },
  { id: 'piperacillin_tazobactam', name_ru: 'Пиперациллин/тазобактам', name_en: 'Piperacillin/Tazobactam', atc: 'J01CR05', class_ru: 'β-лактам + ингибитор β-лактамаз', aliases: ['тазоцин'] },
  { id: 'amoxicillin_clavulanate', name_ru: 'Амоксициллин/клавуланат', name_en: 'Amoxicillin/Clavulanate', atc: 'J01CR02', class_ru: 'Защищённый аминопенициллин', aliases: ['аугментин','амоксиклав'] },
  { id: 'clindamycin', name_ru: 'Клиндамицин', name_en: 'Clindamycin', atc: 'J01FF01', class_ru: 'Линкозамид', aliases: ['далацин'] },
  { id: 'erythromycin', name_ru: 'Эритромицин', name_en: 'Erythromycin', atc: 'J01FA01', class_ru: 'Макролид (CYP3A4 сильный ингибитор)', aliases: [] },
  { id: 'moxifloxacin', name_ru: 'Моксифлоксацин', name_en: 'Moxifloxacin', atc: 'J01MA14', class_ru: 'Фторхинолон IV (QT)', aliases: ['авелокс'] },
  { id: 'nitrofurantoin', name_ru: 'Нитрофурантоин', name_en: 'Nitrofurantoin', atc: 'J01XE01', class_ru: 'Уросептик', aliases: ['фурадонин'] },
  // Antifungals
  { id: 'posaconazole', name_ru: 'Позаконазол', name_en: 'Posaconazole', atc: 'J02AC04', class_ru: 'Триазольный антимикотик (CYP3A4 сильный)', aliases: ['ноксафил'] },
  { id: 'caspofungin', name_ru: 'Каспофунгин', name_en: 'Caspofungin', atc: 'J02AX04', class_ru: 'Эхинокандин', aliases: [] },
  { id: 'terbinafine', name_ru: 'Тербинафин', name_en: 'Terbinafine', atc: 'D01AE15', class_ru: 'Аллиламин (CYP2D6 ингибитор)', aliases: ['ламизил'] },
  // Antivirals
  { id: 'valacyclovir', name_ru: 'Валацикловир', name_en: 'Valacyclovir', atc: 'J05AB11', class_ru: 'Противовирусный', aliases: ['валтрекс','вирекс'] },
  { id: 'oseltamivir', name_ru: 'Осельтамивир', name_en: 'Oseltamivir', atc: 'J05AH02', class_ru: 'Ингибитор нейраминидазы', aliases: ['тамифлю'] },
  // Antithyroid
  { id: 'methimazole', name_ru: 'Тиамазол (мерказолил)', name_en: 'Methimazole/Thiamazole', atc: 'H03BB02', class_ru: 'Антитиреоидное', aliases: ['мерказолил','тирозол'] },
  { id: 'propylthiouracil', name_ru: 'Пропилтиоурацил', name_en: 'Propylthiouracil', atc: 'H03BA02', class_ru: 'Антитиреоидное', aliases: [] },
  // Sulfonylureas
  { id: 'glimepiride', name_ru: 'Глимепирид', name_en: 'Glimepiride', atc: 'A10BB12', class_ru: 'Сульфонилмочевина', aliases: ['амарил'] },
  { id: 'gliclazide', name_ru: 'Гликлазид', name_en: 'Gliclazide', atc: 'A10BB09', class_ru: 'Сульфонилмочевина', aliases: ['диабетон'] },
  // TZD
  { id: 'pioglitazone', name_ru: 'Пиоглитазон', name_en: 'Pioglitazone', atc: 'A10BG03', class_ru: 'Тиазолидиндион', aliases: ['актос'] },
  // SGLT2 gap
  { id: 'dapagliflozin', name_ru: 'Дапаглифлозин', name_en: 'Dapagliflozin', atc: 'A10BK01', class_ru: 'Ингибитор SGLT2', aliases: ['форсига'] },
  // DPP-4 gap
  { id: 'linagliptin', name_ru: 'Линаглиптин', name_en: 'Linagliptin', atc: 'A10BH05', class_ru: 'Ингибитор ДПП-4', aliases: ['тражента'] },
  { id: 'vildagliptin', name_ru: 'Вилдаглиптин', name_en: 'Vildagliptin', atc: 'A10BH02', class_ru: 'Ингибитор ДПП-4', aliases: ['галвус'] },
  // GLP-1 gap
  { id: 'semaglutide', name_ru: 'Семаглутид', name_en: 'Semaglutide', atc: 'A10BJ06', class_ru: 'Агонист ГПП-1', aliases: ['оземпик','ребелсас','вегови'] },
  // Meglitinide
  { id: 'repaglinide', name_ru: 'Репаглинид', name_en: 'Repaglinide', atc: 'A10BX02', class_ru: 'Меглитинид (CYP2C8/3A4 субстрат)', aliases: ['новонорм'] },
  // GIT
  { id: 'metoclopramide', name_ru: 'Метоклопрамид', name_en: 'Metoclopramide', atc: 'A03FA01', class_ru: 'Прокинетик (D2-антагонист, QT)', aliases: ['церукал'] },
  { id: 'domperidone', name_ru: 'Домперидон', name_en: 'Domperidone', atc: 'A03FA03', class_ru: 'Прокинетик (D2, QT)', aliases: ['мотилиум'] },
  { id: 'lansoprazole', name_ru: 'Лансопразол', name_en: 'Lansoprazole', atc: 'A02BC03', class_ru: 'ИПП', aliases: [] },
  { id: 'rabeprazole', name_ru: 'Рабепразол', name_en: 'Rabeprazole', atc: 'A02BC04', class_ru: 'ИПП', aliases: ['париет'] },
  // PPI alt: ranitidine alternative
  { id: 'mesalazine', name_ru: 'Месалазин', name_en: 'Mesalamine/5-ASA', atc: 'A07EC02', class_ru: 'Аминосалицилат', aliases: ['салофальк'] },
  { id: 'sulfasalazine', name_ru: 'Сульфасалазин', name_en: 'Sulfasalazine', atc: 'A07EC01', class_ru: 'Аминосалицилат + сульфаниламид', aliases: [] },
  // Pulmonary
  { id: 'montelukast', name_ru: 'Монтелукаст', name_en: 'Montelukast', atc: 'R03DC03', class_ru: 'Антагонист ЛТ-рецепторов', aliases: ['сингуляр'] },
  { id: 'tiotropium', name_ru: 'Тиотропий', name_en: 'Tiotropium', atc: 'R03BB04', class_ru: 'Длительный антихолинергик (LAMA)', aliases: ['спирива'] },
  { id: 'salmeterol', name_ru: 'Салметерол', name_en: 'Salmeterol', atc: 'R03AC12', class_ru: 'Длительный β2-агонист (LABA)', aliases: [] },
  { id: 'budesonide', name_ru: 'Будесонид', name_en: 'Budesonide', atc: 'R03BA02', class_ru: 'Ингаляционный ГКС', aliases: ['пульмикорт'] },
  { id: 'fluticasone', name_ru: 'Флутиказон', name_en: 'Fluticasone', atc: 'R03BA05', class_ru: 'Ингаляционный ГКС', aliases: [] },
  // Hyperuricemia
  { id: 'febuxostat', name_ru: 'Фебуксостат', name_en: 'Febuxostat', atc: 'M04AA03', class_ru: 'Ингибитор ксантиноксидазы', aliases: ['аденурик'] },
  // RAA NEW: Sacubitril/valsartan
  { id: 'sacubitril_valsartan', name_ru: 'Сакубитрил/валсартан', name_en: 'Sacubitril/Valsartan', atc: 'C09DX04', class_ru: 'ARNI (ангиотензин-неприлизин)', aliases: ['уперио','энтресто'] },
  // Hormonal/Cancer endocrine
  { id: 'tamoxifen', name_ru: 'Тамоксифен', name_en: 'Tamoxifen', atc: 'L02BA01', class_ru: 'СЭРМ (CYP2D6 пролекарство)', aliases: [] },
  { id: 'anastrozole', name_ru: 'Анастрозол', name_en: 'Anastrozole', atc: 'L02BG03', class_ru: 'Ингибитор ароматазы', aliases: ['аримидекс'] },
  { id: 'letrozole', name_ru: 'Летрозол', name_en: 'Letrozole', atc: 'L02BG04', class_ru: 'Ингибитор ароматазы', aliases: ['фемара'] },
  // Iron
  { id: 'iron_oral', name_ru: 'Железо (per os)', name_en: 'Oral iron salts', atc: 'B03AA', class_ru: 'Препараты железа', aliases: [] },
  // Calcium / Vit D
  { id: 'calcium_carbonate', name_ru: 'Кальция карбонат', name_en: 'Calcium carbonate', atc: 'A12AA04', class_ru: 'Антацид + Ca-добавка', aliases: [] },
  // Anti-platelet add
  { id: 'cilostazol', name_ru: 'Цилостазол', name_en: 'Cilostazol', atc: 'B01AC23', class_ru: 'Антиагрегант / вазодилататор (CYP3A4 субстрат)', aliases: ['плетал'] },
  // Misc
  { id: 'disulfiram', name_ru: 'Дисульфирам', name_en: 'Disulfiram', atc: 'N07BB01', class_ru: 'Ингибитор АлДГ (alcohol deterrent)', aliases: ['эспераль'] },
  { id: 'varenicline', name_ru: 'Варениклин', name_en: 'Varenicline', atc: 'N07BA03', class_ru: 'Парциальный агонист никотиновых рецепторов', aliases: ['чампикс'] },
  // CYP3A4 strong inducer (commonly missed)
  { id: 'st_johns_wort', name_ru: 'Зверобой (Hypericum)', name_en: "St. John's Wort", atc: 'N06AX25', class_ru: 'Растительный антидепрессант (CYP3A4 индуктор)', aliases: [] },
  // Vasopressors (acute care)
  { id: 'epinephrine', name_ru: 'Эпинефрин (адреналин)', name_en: 'Epinephrine', atc: 'C01CA24', class_ru: 'Симпатомиметик (α/β-агонист)', aliases: ['адреналин'] },
  { id: 'norepinephrine', name_ru: 'Норэпинефрин (норадреналин)', name_en: 'Norepinephrine', atc: 'C01CA03', class_ru: 'Симпатомиметик (α-агонист)', aliases: ['норадреналин'] },
  // Smoking cessation
  { id: 'nicotine_replacement', name_ru: 'Никотин (заместительная терапия)', name_en: 'Nicotine (NRT)', atc: 'N07BA01', class_ru: 'Никотиновый агонист (НЗТ)', aliases: [] },
];

let drugsAdded = 0;
for (const drug of NEW_DRUGS) {
  if (existingDrugs.has(drug.id)) continue;
  d.drugs.push(drug);
  existingDrugs.add(drug.id);
  drugsAdded++;
}

// ============== NEW INTERACTIONS (~140) ==============
const NEW = [
  // ─── Strong CYP3A4 inhibitors / classics ───
  { drugA: 'erythromycin', drugB: 'simvastatin', severity: 'contraindicated',
    mechanism: 'Эритромицин — сильный ингибитор CYP3A4.',
    effect: 'Резкое накопление симвастатина → рабдомиолиз.',
    management: 'ПРОТИВОПОКАЗАНО. Альтернатива: правастатин/розувастатин.',
    sources: ['FDA black box', 'Lexidrug'] },
  { drugA: 'erythromycin', drugB: 'atorvastatin', severity: 'major',
    mechanism: 'CYP3A4 ингибиция.',
    effect: 'Накопление аторвастатина.',
    management: 'Снизить дозу аторвастатина или сменить на правастатин.',
    sources: ['Lexidrug'] },
  { drugA: 'erythromycin', drugB: 'warfarin', severity: 'major',
    mechanism: 'CYP2C9 + 3A4 ингибиция.',
    effect: 'Повышение МНО, кровотечение.',
    management: 'Контроль МНО через 3-5 дней, снизить дозу варфарина на 25%.',
    sources: ['Stockley\'s 12th'] },
  { drugA: 'erythromycin', drugB: 'methadone', severity: 'major',
    mechanism: 'CYP3A4 ингибиция + аддитивное QT-удлинение.',
    effect: 'Накопление метадона + риск TdP.',
    management: 'Избегать. Альтернатива: азитромицин.',
    sources: ['CredibleMeds Known'] },
  { drugA: 'erythromycin', drugB: 'theophylline', severity: 'major',
    mechanism: 'CYP3A4/1A2 ингибиция.',
    effect: 'Токсичность теофиллина.',
    management: 'Снизить дозу или сменить антибиотик.',
    sources: ['Lexidrug'] },
  { drugA: 'erythromycin', drugB: 'colchicine', severity: 'contraindicated',
    mechanism: 'CYP3A4 + P-gp ингибиция.',
    effect: 'Тяжёлая колхициновая токсичность.',
    management: 'ПРОТИВОПОКАЗАНО при ХБП. У других — снизить дозу колхицина на 75%.',
    sources: ['FDA black box'] },
  { drugA: 'erythromycin', drugB: 'apixaban', severity: 'major',
    mechanism: 'CYP3A4 + P-gp ингибиция.',
    effect: 'Повышение AUC апиксабана.',
    management: 'Избегать; азитромицин — альтернатива.',
    sources: ['EHRA 2021'] },

  // ─── Posaconazole (mega CYP3A4 inhibitor) ───
  { drugA: 'posaconazole', drugB: 'simvastatin', severity: 'contraindicated',
    mechanism: 'Сильнейшая CYP3A4 ингибиция.',
    effect: 'Рабдомиолиз.',
    management: 'ПРОТИВОПОКАЗАНО. Перейти на правастатин/розувастатин.',
    sources: ['FDA black box'] },
  { drugA: 'posaconazole', drugB: 'tacrolimus', severity: 'major',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Резкое повышение уровней такролимуса.',
    management: 'Снизить дозу такролимуса на 66%; TDM 2-3 раза в неделю.',
    sources: ['Lexidrug'] },
  { drugA: 'posaconazole', drugB: 'cyclosporine', severity: 'major',
    mechanism: 'CYP3A4 ингибиция.',
    effect: 'Повышение уровней циклоспорина.',
    management: 'Снизить дозу циклоспорина на 50%; TDM.',
    sources: ['Lexidrug'] },

  // ─── Terbinafine (CYP2D6 inhibitor) ───
  { drugA: 'terbinafine', drugB: 'metoprolol', severity: 'moderate',
    mechanism: 'Тербинафин ингибирует CYP2D6 → накопление метопролола.',
    effect: 'Брадикардия, гипотензия.',
    management: 'Мониторинг ЧСС/АД при добавлении тербинафина.',
    sources: ['Lexidrug'] },
  { drugA: 'terbinafine', drugB: 'tamoxifen', severity: 'major',
    mechanism: 'CYP2D6 ингибиция → снижение конверсии тамоксифена в активный эндоксифен.',
    effect: 'Снижение онко-эффективности.',
    management: 'Избегать. Альтернатива: флуконазол (с осторожностью).',
    sources: ['Lexidrug', 'NCCN Breast'] },

  // ─── Carvedilol ───
  { drugA: 'carvedilol', drugB: 'verapamil', severity: 'major',
    mechanism: 'Аддитивная AV-блокада + отрицательный инотропизм.',
    effect: 'Брадикардия, AV-блок, гипотензия.',
    management: 'Избегать. Альтернатива: дилтиазем (меньше AV-блокирует).',
    sources: ['Lexidrug'] },
  { drugA: 'carvedilol', drugB: 'diltiazem', severity: 'moderate',
    mechanism: 'Аддитивная AV-блокада.',
    effect: 'Брадикардия.',
    management: 'Допустимо при наблюдении. Контроль ЧСС, ЭКГ.',
    sources: ['Lexidrug'] },
  { drugA: 'carvedilol', drugB: 'insulin', severity: 'moderate',
    mechanism: 'β-блокатор маскирует адренергические симптомы гипогликемии (как и у других β-блокаторов).',
    effect: 'Маскированная гипогликемия.',
    management: 'Самоконтроль глюкозы; информировать о потливости как ранний симптом.',
    sources: ['ADA 2024'] },
  { drugA: 'carvedilol', drugB: 'amiodarone', severity: 'major',
    mechanism: 'Аддитивная брадикардия + амиодарон ингибирует CYP2D6 → ↑ карведилола.',
    effect: 'Брадикардия, гипотензия.',
    management: 'Контроль ЭКГ, ЧСС. При необходимости — снизить дозу карведилола.',
    sources: ['Lexidrug'] },

  // ─── Propranolol (non-selective β) ───
  { drugA: 'propranolol', drugB: 'verapamil', severity: 'major',
    mechanism: 'Аддитивная AV-блокада + отрицательный инотропизм.',
    effect: 'Брадикардия, AV-блок, гипотензия.',
    management: 'Избегать. Особо опасно у пожилых.',
    sources: ['Lexidrug'] },
  { drugA: 'propranolol', drugB: 'insulin', severity: 'major',
    mechanism: 'Неселективный β-блокатор маскирует ВСЕ адренергические симптомы гипогликемии и удлиняет восстановление.',
    effect: 'Тяжёлая нераспознанная гипогликемия.',
    management: 'Избегать у диабетиков. Кардиоселективные (бисопролол, метопролол) — лучше.',
    sources: ['ADA 2024'] },
  { drugA: 'propranolol', drugB: 'rizatriptan', severity: 'major',
    mechanism: 'Пропранолол ингибирует CYP2D6 → накопление ризатриптана.',
    effect: 'Сосудистый вазоспазм, риск ишемии.',
    management: 'Снизить дозу ризатриптана до 5 мг (с обычных 10 мг).',
    sources: ['FDA labeling', 'Stockley\'s 12th'] },

  // ─── Dronedarone ───
  { drugA: 'dronedarone', drugB: 'simvastatin', severity: 'major',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Накопление симвастатина → миопатия.',
    management: 'Симвастатин ≤10 мг/сут.',
    sources: ['FDA labeling'] },
  { drugA: 'dronedarone', drugB: 'digoxin', severity: 'major',
    mechanism: 'Дронедарон ингибирует P-gp → накопление дигоксина.',
    effect: 'Дигиталисная токсичность.',
    management: 'Снизить дозу дигоксина на 50%; TDM.',
    sources: ['FDA labeling'] },
  { drugA: 'dronedarone', drugB: 'warfarin', severity: 'moderate',
    mechanism: 'Слабая CYP2C9 ингибиция.',
    effect: 'Повышение МНО.',
    management: 'Контроль МНО через 1-2 нед.',
    sources: ['Lexidrug'] },
  { drugA: 'dronedarone', drugB: 'verapamil', severity: 'major',
    mechanism: 'Аддитивная AV-блокада + двойная CYP3A4-ингибиция.',
    effect: 'Брадикардия, AV-блок.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },
  { drugA: 'dronedarone', drugB: 'dabigatran', severity: 'contraindicated',
    mechanism: 'Сильная P-gp ингибиция.',
    effect: 'AUC дабигатрана ↑ в 2-3 раза, кровотечение.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['EHRA 2021', 'FDA labeling'] },

  // ─── Ivabradine ───
  { drugA: 'ivabradine', drugB: 'verapamil', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция + аддитивная брадикардия.',
    effect: 'Резкая брадикардия.',
    management: 'ПРОТИВОПОКАЗАНО (ESC 2024).',
    sources: ['ESC 2024 Chronic CHF'] },
  { drugA: 'ivabradine', drugB: 'diltiazem', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Брадикардия.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['ESC 2024'] },
  { drugA: 'ivabradine', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Резкое повышение уровней ивабрадина.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'ivabradine', drugB: 'amiodarone', severity: 'major',
    mechanism: 'Аддитивная брадикардия.',
    effect: 'Брадикардия.',
    management: 'Избегать или строгий контроль ЧСС.',
    sources: ['ESC 2024'] },

  // ─── Pravastatin (CYP-free statin) ───
  { drugA: 'pravastatin', drugB: 'cyclosporine', severity: 'moderate',
    mechanism: 'Циклоспорин ингибирует OATP1B1 → ↑ AUC правастатина.',
    effect: 'Повышение уровней.',
    management: 'Правастатин ≤20 мг/сут (FDA labeling).',
    sources: ['FDA labeling'] },
  { drugA: 'pitavastatin', drugB: 'cyclosporine', severity: 'contraindicated',
    mechanism: 'OATP1B1 ингибиция.',
    effect: 'AUC питавастатина ↑ в 5 раз.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },

  // ─── Gemfibrozil (huge interactions with statins) ───
  { drugA: 'gemfibrozil', drugB: 'simvastatin', severity: 'contraindicated',
    mechanism: 'Сильная ингибиция OATP + CYP2C8.',
    effect: 'Тяжёлый рабдомиолиз — описанные летальные случаи.',
    management: 'ПРОТИВОПОКАЗАНО. Альтернатива при необходимости фибрата — фенофибрат.',
    sources: ['FDA black box'] },
  { drugA: 'gemfibrozil', drugB: 'atorvastatin', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Рабдомиолиз.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA black box'] },
  { drugA: 'gemfibrozil', drugB: 'rosuvastatin', severity: 'contraindicated',
    mechanism: 'OATP ингибиция.',
    effect: 'Рабдомиолиз.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA black box'] },
  { drugA: 'gemfibrozil', drugB: 'repaglinide', severity: 'contraindicated',
    mechanism: 'Сильная CYP2C8 ингибиция.',
    effect: 'AUC репаглинида ↑ в 8-9 раз → тяжёлая гипогликемия.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },

  // ─── Fluvoxamine (mega CYP1A2 + 2C19 inhibitor) ───
  { drugA: 'fluvoxamine', drugB: 'theophylline', severity: 'major',
    mechanism: 'Сильная CYP1A2 ингибиция.',
    effect: 'Резкое повышение уровней теофиллина.',
    management: 'Избегать. Если необходимо — снизить теофиллин на 50% и TDM.',
    sources: ['Stockley\'s 12th'] },
  { drugA: 'fluvoxamine', drugB: 'tizanidine', severity: 'contraindicated',
    mechanism: 'Сильная CYP1A2 ингибиция.',
    effect: 'AUC тизанидина ↑ в 33 раза → выраженная гипотензия, седация.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'fluvoxamine', drugB: 'warfarin', severity: 'major',
    mechanism: 'CYP2C9 ингибиция.',
    effect: 'Повышение МНО.',
    management: 'Контроль МНО, снижение дозы.',
    sources: ['Lexidrug'] },

  // ─── Paroxetine (CYP2D6 inhibitor) ───
  { drugA: 'paroxetine', drugB: 'tamoxifen', severity: 'major',
    mechanism: 'Пароксетин — сильный CYP2D6 ингибитор → блокирует конверсию тамоксифена в эндоксифен.',
    effect: 'Снижение онко-эффективности тамоксифена.',
    management: 'Избегать у пациенток на тамоксифене. Альтернатива: венлафаксин, эсциталопрам.',
    sources: ['NCCN Breast', 'Lexidrug'] },
  { drugA: 'paroxetine', drugB: 'metoprolol', severity: 'moderate',
    mechanism: 'CYP2D6 ингибиция.',
    effect: 'Накопление метопролола.',
    management: 'Контроль ЧСС/АД.',
    sources: ['Lexidrug'] },

  // ─── SNRIs serotonin syndrome ───
  { drugA: 'duloxetine', drugB: 'tramadol', severity: 'major',
    mechanism: 'Аддитивный серотонин-эффект.',
    effect: 'Серотониновый синдром.',
    management: 'Избегать. Морфин/оксикодон — альтернатива.',
    sources: ['Lexidrug'] },
  { drugA: 'venlafaxine', drugB: 'tramadol', severity: 'major',
    mechanism: 'Серотонин-аддитивно.',
    effect: 'Серотониновый синдром.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },
  { drugA: 'duloxetine', drugB: 'linezolid', severity: 'contraindicated',
    mechanism: 'МАО + СИОЗСН.',
    effect: 'Серотониновый синдром.',
    management: 'ПРОТИВОПОКАЗАНО. Отмена дулоксетина за ≥2 нед.',
    sources: ['FDA black box'] },
  { drugA: 'venlafaxine', drugB: 'linezolid', severity: 'contraindicated',
    mechanism: 'МАО + СИОЗСН.',
    effect: 'Серотониновый синдром.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA black box'] },
  { drugA: 'mirtazapine', drugB: 'linezolid', severity: 'major',
    mechanism: 'Серотонинергический эффект.',
    effect: 'Серотониновый синдром (риск ниже чем у СИОЗС).',
    management: 'Избегать. Если необходимо — мониторинг.',
    sources: ['Lexidrug'] },

  // ─── Aripiprazole/Lurasidone CYP3A4 ───
  { drugA: 'aripiprazole', drugB: 'clarithromycin', severity: 'major',
    mechanism: 'CYP3A4 ингибиция.',
    effect: 'Накопление арипипразола.',
    management: 'Снизить дозу арипипразола на 50% при сочетании.',
    sources: ['FDA labeling'] },
  { drugA: 'aripiprazole', drugB: 'rifampicin', severity: 'major',
    mechanism: 'CYP3A4 индукция.',
    effect: 'Снижение эффекта арипипразола.',
    management: 'Удвоить дозу или сменить нейролептик.',
    sources: ['Lexidrug'] },
  { drugA: 'lurasidone', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Резкое накопление луразидона.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'lurasidone', drugB: 'rifampicin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 индукция.',
    effect: 'Резкое снижение эффекта.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },

  // ─── Ergotamine (5HT1B/D agonist + CYP3A4 substrate) ───
  { drugA: 'ergotamine', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Эрготизм: сосудистый спазм, ишемия конечностей и мозга.',
    management: 'ПРОТИВОПОКАЗАНО (FDA black box). Альтернатива: триптан или НПВС.',
    sources: ['FDA black box'] },
  { drugA: 'ergotamine', drugB: 'erythromycin', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Эрготизм.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA black box'] },
  { drugA: 'ergotamine', drugB: 'sumatriptan', severity: 'contraindicated',
    mechanism: 'Аддитивная вазоконстрикция.',
    effect: 'Тяжёлый сосудистый спазм.',
    management: 'ПРОТИВОПОКАЗАНО — выждать ≥24 ч между приёмами.',
    sources: ['FDA labeling'] },
  { drugA: 'ergotamine', drugB: 'rizatriptan', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Сосудистый спазм.',
    management: 'ПРОТИВОПОКАЗАНО, ≥24 ч интервал.',
    sources: ['FDA labeling'] },

  // ─── Tizanidine (CYP1A2 substrate) ───
  { drugA: 'tizanidine', drugB: 'ciprofloxacin', severity: 'contraindicated',
    mechanism: 'Сильная CYP1A2 ингибиция.',
    effect: 'AUC тизанидина ↑ в 10 раз → гипотензия, седация.',
    management: 'ПРОТИВОПОКАЗАНО (FDA labeling). Альтернатива: левофлоксацин.',
    sources: ['FDA labeling'] },

  // ─── Sulfonylureas hypoglycemia ───
  { drugA: 'glimepiride', drugB: 'cotrimoxazole', severity: 'major',
    mechanism: 'Сульфаметоксазол вытесняет глимепирид из связи с белком + ингибирует метаболизм.',
    effect: 'Тяжёлая гипогликемия.',
    management: 'Самоконтроль глюкозы, снижение дозы глимепирида.',
    sources: ['Lexidrug'] },
  { drugA: 'glimepiride', drugB: 'fluconazole', severity: 'moderate',
    mechanism: 'CYP2C9 ингибиция.',
    effect: 'Повышение уровня глимепирида → гипогликемия.',
    management: 'Снизить дозу при длительной терапии флуконазолом.',
    sources: ['Lexidrug'] },
  { drugA: 'gliclazide', drugB: 'fluconazole', severity: 'moderate',
    mechanism: 'CYP2C9 ингибиция.',
    effect: 'Гипогликемия.',
    management: 'Контроль глюкозы.',
    sources: ['Lexidrug'] },

  // ─── ARNI (sacubitril/valsartan) ───
  { drugA: 'sacubitril_valsartan', drugB: 'lisinopril', severity: 'contraindicated',
    mechanism: 'Двойная ингибиция RAAS + неприлизина → ангионевротический отёк.',
    effect: 'Тяжёлый ангиоотёк (FDA black box).',
    management: 'ПРОТИВОПОКАЗАНО. Между иАПФ и сакубитрилом — ≥36 часов.',
    sources: ['FDA black box', 'ESC 2024 HF'] },
  { drugA: 'sacubitril_valsartan', drugB: 'ramipril', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Ангиоотёк.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA black box'] },
  { drugA: 'sacubitril_valsartan', drugB: 'spironolactone', severity: 'major',
    mechanism: 'Аддитивная гиперкалиемия.',
    effect: 'Гиперкалиемия, ОПН.',
    management: 'Контроль K+ через 1-2 нед, при первых признаках гиперкалиемии — отмена.',
    sources: ['ESC 2024 HF'] },

  // ─── Eplerenone ───
  { drugA: 'eplerenone', drugB: 'lisinopril', severity: 'major',
    mechanism: 'Двойная блокада RAAS.',
    effect: 'Гиперкалиемия.',
    management: 'Контроль K+ еженедельно при старте.',
    sources: ['ESC 2024 HF'] },
  { drugA: 'eplerenone', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Накопление эплеренона → тяжёлая гиперкалиемия.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'eplerenone', drugB: 'cotrimoxazole', severity: 'major',
    mechanism: 'Аддитивная гиперкалиемия.',
    effect: 'Гиперкалиемия.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },

  // ─── Aminoglycosides nephrotoxicity ───
  { drugA: 'gentamicin', drugB: 'furosemide', severity: 'moderate',
    mechanism: 'Аддитивная нефро-/ототоксичность.',
    effect: 'ОПН, снижение слуха.',
    management: 'Контроль креатинина, слуха. Обязателен TDM гентамицина.',
    sources: ['Lexidrug'] },
  { drugA: 'gentamicin', drugB: 'vancomycin', severity: 'moderate',
    mechanism: 'Аддитивная нефротоксичность.',
    effect: 'ОПН.',
    management: 'TDM обоих, контроль креатинина 2-3 раза в неделю.',
    sources: ['Lexidrug'] },
  { drugA: 'gentamicin', drugB: 'cyclosporine', severity: 'major',
    mechanism: 'Аддитивная нефротоксичность.',
    effect: 'ОПН.',
    management: 'Избегать. Если необходимо — TDM, контроль креатинина.',
    sources: ['Lexidrug'] },
  { drugA: 'amikacin', drugB: 'furosemide', severity: 'moderate',
    mechanism: 'Аддитивная нефро-/ототоксичность.',
    effect: 'ОПН, снижение слуха.',
    management: 'TDM, контроль креатинина и слуха.',
    sources: ['Lexidrug'] },

  // ─── Ziprasidone QT ───
  { drugA: 'ziprasidone', drugB: 'amiodarone', severity: 'major',
    mechanism: 'Аддитивное QT-удлинение.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds Known'] },
  { drugA: 'ziprasidone', drugB: 'sotalol', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },
  { drugA: 'ziprasidone', drugB: 'methadone', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },

  // ─── Moxifloxacin QT ───
  { drugA: 'moxifloxacin', drugB: 'amiodarone', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать. Альтернатива: ципрофлоксацин/левофлоксацин.',
    sources: ['CredibleMeds'] },
  { drugA: 'moxifloxacin', drugB: 'sotalol', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },
  { drugA: 'moxifloxacin', drugB: 'methadone', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },
  { drugA: 'moxifloxacin', drugB: 'citalopram', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },

  // ─── Domperidone (QT) ───
  { drugA: 'domperidone', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'CYP3A4 ингибиция + аддитивный QT.',
    effect: 'Резкое QT-удлинение, TdP.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['EMA 2014', 'Health Canada'] },
  { drugA: 'domperidone', drugB: 'amiodarone', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds Known'] },
  { drugA: 'domperidone', drugB: 'methadone', severity: 'major',
    mechanism: 'Аддитивное QT.',
    effect: 'TdP.',
    management: 'Избегать.',
    sources: ['CredibleMeds'] },

  // ─── Metoclopramide EPS ───
  { drugA: 'metoclopramide', drugB: 'levodopa_carbidopa', severity: 'major',
    mechanism: 'D2-антагонизм метоклопрамида блокирует леводопу.',
    effect: 'Ухудшение паркинсонизма, ЭПС.',
    management: 'Избегать. Альтернатива: ондансетрон.',
    sources: ['Lexidrug'] },
  { drugA: 'metoclopramide', drugB: 'haloperidol', severity: 'major',
    mechanism: 'Аддитивная D2-блокада + QT.',
    effect: 'ЭПС, паркинсонизм, риск ЗНС, удлинение QT.',
    management: 'Избегать сочетания.',
    sources: ['Lexidrug'] },

  // ─── Iron interactions (chelation) ───
  { drugA: 'iron_oral', drugB: 'ciprofloxacin', severity: 'major',
    mechanism: 'Хелатирование (Fe2+/3+ + хинолон).',
    effect: 'Снижение биодоступности ципрофлоксацина на 50-70%.',
    management: 'Принимать ципрофлоксацин за 2 ч до или 6 ч после железа.',
    sources: ['FDA labeling'] },
  { drugA: 'iron_oral', drugB: 'levofloxacin', severity: 'major',
    mechanism: 'Хелатирование.',
    effect: 'Снижение биодоступности.',
    management: 'Раздельный приём ≥2 ч.',
    sources: ['FDA labeling'] },
  { drugA: 'iron_oral', drugB: 'levothyroxine', severity: 'moderate',
    mechanism: 'Связывание в ЖКТ.',
    effect: 'Снижение всасывания левотироксина.',
    management: 'Принимать левотироксин ≥4 ч от железа.',
    sources: ['Lexidrug'] },
  { drugA: 'iron_oral', drugB: 'doxycycline', severity: 'major',
    mechanism: 'Хелатирование.',
    effect: 'Снижение биодоступности доксициклина.',
    management: 'Раздельный приём ≥2 ч.',
    sources: ['Lexidrug'] },

  // ─── Calcium carbonate (similar) ───
  { drugA: 'calcium_carbonate', drugB: 'ciprofloxacin', severity: 'moderate',
    mechanism: 'Хелатирование (Ca2+ + хинолон).',
    effect: 'Снижение биодоступности.',
    management: 'Раздельный приём ≥2 ч.',
    sources: ['FDA labeling'] },
  { drugA: 'calcium_carbonate', drugB: 'levothyroxine', severity: 'moderate',
    mechanism: 'Связывание в ЖКТ.',
    effect: 'Снижение всасывания.',
    management: 'Раздельный приём ≥4 ч.',
    sources: ['Lexidrug'] },
  { drugA: 'calcium_carbonate', drugB: 'doxycycline', severity: 'moderate',
    mechanism: 'Хелатирование.',
    effect: 'Снижение биодоступности.',
    management: 'Раздельный приём.',
    sources: ['Lexidrug'] },

  // ─── St. John's Wort (CYP3A4 inducer) ───
  { drugA: 'st_johns_wort', drugB: 'warfarin', severity: 'major',
    mechanism: 'CYP2C9/3A4 индукция.',
    effect: 'Снижение МНО, риск тромбоза.',
    management: 'Избегать. Контроль МНО при невозможности отмены.',
    sources: ['Lexidrug', 'FDA Safety'] },
  { drugA: 'st_johns_wort', drugB: 'apixaban', severity: 'major',
    mechanism: 'CYP3A4 + P-gp индукция.',
    effect: 'Снижение AUC апиксабана.',
    management: 'Избегать.',
    sources: ['EHRA 2021'] },
  { drugA: 'st_johns_wort', drugB: 'rivaroxaban', severity: 'major',
    mechanism: 'CYP3A4 + P-gp индукция.',
    effect: 'Снижение эффекта.',
    management: 'Избегать.',
    sources: ['EHRA 2021'] },
  { drugA: 'st_johns_wort', drugB: 'cyclosporine', severity: 'major',
    mechanism: 'CYP3A4 + P-gp индукция.',
    effect: 'Резкое снижение уровней циклоспорина → отторжение.',
    management: 'ПРОТИВОПОКАЗАНО у реципиентов трансплантата.',
    sources: ['Lexidrug'] },
  { drugA: 'st_johns_wort', drugB: 'tacrolimus', severity: 'major',
    mechanism: 'CYP3A4 индукция.',
    effect: 'Падение уровней такролимуса.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },
  { drugA: 'st_johns_wort', drugB: 'sertraline', severity: 'major',
    mechanism: 'Серотонинергический.',
    effect: 'Серотониновый синдром.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },

  // ─── Disulfiram ───
  { drugA: 'disulfiram', drugB: 'metronidazole', severity: 'contraindicated',
    mechanism: 'Аддитивная ингибиция АлДГ + сообщения о психотических реакциях.',
    effect: 'Острый психоз, делирий.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'disulfiram', drugB: 'warfarin', severity: 'major',
    mechanism: 'CYP2C9 ингибиция.',
    effect: 'Резкое повышение МНО.',
    management: 'Контроль МНО, снижение дозы варфарина на 25-50%.',
    sources: ['Lexidrug'] },

  // ─── Fluconazole + cyclosporine (already have? add if missing) ───
  // Already have cyclosporine + fluconazole, skip

  // ─── Tamsulosin (BPH α-blocker) ───
  { drugA: 'tamsulosin', drugB: 'sildenafil', severity: 'moderate',
    mechanism: 'Аддитивный гипотензивный эффект.',
    effect: 'Симптоматическая гипотензия.',
    management: 'Стартовая доза силденафила 25 мг при наличии тамсулозина.',
    sources: ['FDA labeling'] },
  { drugA: 'tamsulosin', drugB: 'tadalafil', severity: 'moderate',
    mechanism: 'Аддитивный.',
    effect: 'Гипотензия.',
    management: 'Минимальная доза тадалафила.',
    sources: ['FDA labeling'] },

  // ─── Naloxone (opioid antagonist) ───
  { drugA: 'naloxone', drugB: 'morphine', severity: 'moderate',
    mechanism: 'Антагонизм μ-рецепторов.',
    effect: 'Отмена анальгезии, абстинентный синдром у зависимых.',
    management: 'Используется для антагонизации опиоидной интоксикации. Доза титруется по ЧДД (0.04-0.4 мг повторно).',
    sources: ['ALS Guidelines 2020'] },
  { drugA: 'naloxone', drugB: 'methadone', severity: 'moderate',
    mechanism: 'Антагонизм μ-рецепторов.',
    effect: 'Острый абстинентный синдром.',
    management: 'Только при опиоидной передозировке. T1/2 налоксона короче метадона — повторные дозы.',
    sources: ['ALS Guidelines'] },

  // ─── Naltrexone ───
  { drugA: 'naltrexone', drugB: 'morphine', severity: 'contraindicated',
    mechanism: 'Полная блокада μ-рецепторов.',
    effect: 'Полная отмена опиоидной анальгезии.',
    management: 'ПРОТИВОПОКАЗАНО при необходимости опиоидной анальгезии. Налтрексон отменить ≥72 ч до операции.',
    sources: ['FDA labeling'] },
  { drugA: 'naltrexone', drugB: 'oxycodone', severity: 'contraindicated',
    mechanism: 'Тот же механизм.',
    effect: 'Отмена анальгезии.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },

  // ─── Methimazole / propylthiouracil + warfarin ───
  { drugA: 'methimazole', drugB: 'warfarin', severity: 'major',
    mechanism: 'Гипертиреоз ускоряет метаболизм факторов свёртывания. При коррекции (терапии метимазолом) метаболизм нормализуется → ↑ МНО.',
    effect: 'Изменения МНО.',
    management: 'Контроль МНО еженедельно в первый месяц.',
    sources: ['Lexidrug'] },

  // ─── Tamoxifen + SSRIs (CYP2D6) ───
  { drugA: 'tamoxifen', drugB: 'fluoxetine', severity: 'major',
    mechanism: 'Сильная CYP2D6 ингибиция → блокирует конверсию в эндоксифен.',
    effect: 'Снижение онко-эффективности.',
    management: 'Избегать. Альтернатива СИОЗС: эсциталопрам, сертралин (умеренное влияние) или венлафаксин.',
    sources: ['NCCN Breast'] },
  { drugA: 'tamoxifen', drugB: 'paroxetine', severity: 'major',
    mechanism: 'Тот же механизм.',
    effect: 'Снижение эффекта тамоксифена.',
    management: 'Избегать.',
    sources: ['NCCN Breast'] },

  // ─── Cilostazol ───
  { drugA: 'cilostazol', drugB: 'clarithromycin', severity: 'major',
    mechanism: 'CYP3A4 ингибиция.',
    effect: 'Накопление цилостазола.',
    management: 'Снизить дозу цилостазола до 50 мг 2 р/сут.',
    sources: ['FDA labeling'] },
  { drugA: 'cilostazol', drugB: 'omeprazole', severity: 'moderate',
    mechanism: 'CYP2C19 ингибиция.',
    effect: 'Повышение уровня цилостазола.',
    management: 'Снизить дозу до 50 мг 2 р/сут.',
    sources: ['FDA labeling'] },

  // ─── Vasopressors + β-blockers ───
  { drugA: 'epinephrine', drugB: 'propranolol', severity: 'major',
    mechanism: 'Неселективная β-блокада оставляет α-эффект адреналина без противовесного β2-вазодилатации → парадоксальная гипертензия и брадикардия.',
    effect: 'Острая гипертензия, брадикардия.',
    management: 'Избегать. При анафилаксии у пациентов на пропранололе — глюкагон в/в.',
    sources: ['ALS Guidelines'] },

  // ─── Linagliptin / vildagliptin + insulin ───
  { drugA: 'linagliptin', drugB: 'insulin', severity: 'moderate',
    mechanism: 'Аддитивный сахаропонижающий эффект.',
    effect: 'Гипогликемия.',
    management: 'Снизить дозу инсулина при добавлении ДПП-4.',
    sources: ['ADA 2024'] },
  { drugA: 'vildagliptin', drugB: 'insulin', severity: 'moderate',
    mechanism: 'Тот же.',
    effect: 'Гипогликемия.',
    management: 'Коррекция инсулина.',
    sources: ['ADA 2024'] },

  // ─── Semaglutide + insulin / sulfonylurea ───
  { drugA: 'semaglutide', drugB: 'insulin', severity: 'moderate',
    mechanism: 'Аддитивный эффект.',
    effect: 'Гипогликемия.',
    management: 'Снизить базальный инсулин на 20% при старте.',
    sources: ['ADA 2024'] },
  { drugA: 'semaglutide', drugB: 'glimepiride', severity: 'moderate',
    mechanism: 'Аддитивная гипогликемия.',
    effect: 'Гипогликемия (особенно при сульфонилмочевинах).',
    management: 'Снизить дозу глимепирида.',
    sources: ['ADA 2024'] },

  // ─── Topiramate ───
  { drugA: 'topiramate', drugB: 'valproate', severity: 'moderate',
    mechanism: 'Аддитивная гипераммониемия и нарушение кислотно-щелочного баланса.',
    effect: 'Гипераммониемическая энцефалопатия (редко).',
    management: 'Контроль аммиака при когнитивных нарушениях.',
    sources: ['Lexidrug'] },
  { drugA: 'topiramate', drugB: 'metformin', severity: 'moderate',
    mechanism: 'Топирамат — слабый ингибитор карбоангидразы → метаболический ацидоз; метформин — лактат-ацидоз.',
    effect: 'Ацидоз.',
    management: 'Контроль HCO3-.',
    sources: ['Lexidrug'] },

  // ─── Clonidine + β-blocker (rebound HTN) ───
  { drugA: 'clonidine', drugB: 'propranolol', severity: 'major',
    mechanism: 'Резкая отмена клонидина → выброс катехоламинов; неселективная β-блокада → парадоксальная гипертензия.',
    effect: 'Тяжёлый rebound криз.',
    management: 'Никогда не отменять клонидин резко на фоне β-блокатора. Сначала отменить β-блокатор, затем медленно — клонидин.',
    sources: ['Lexidrug'] },
  { drugA: 'clonidine', drugB: 'metoprolol', severity: 'moderate',
    mechanism: 'Тот же механизм (меньше выражен у кардиоселективных).',
    effect: 'Rebound HTN при отмене.',
    management: 'Постепенная отмена клонидина.',
    sources: ['Lexidrug'] },

  // ─── Buprenorphine + opioids ───
  { drugA: 'buprenorphine', drugB: 'morphine', severity: 'major',
    mechanism: 'Парциальный агонист (бупренорфин) блокирует полные агонисты.',
    effect: 'Острый абстинентный синдром у морфин-зависимых.',
    management: 'Не комбинировать. Перевод на бупренорфин — после умеренной абстиненции.',
    sources: ['SAMHSA Guidelines'] },
  { drugA: 'buprenorphine', drugB: 'naloxone', severity: 'moderate',
    mechanism: 'Антагонизм μ.',
    effect: 'Снижение анальгезии (требует высоких доз налоксона).',
    management: 'При передозировке бупренорфина — налоксон в высоких дозах болюсами.',
    sources: ['Lexidrug'] },

  // ─── Domperidone + amiodarone (already added) ───

  // ─── Fluvoxamine + clozapine (no clozapine in DB), skip ───

  // ─── Caspofungin + cyclosporine ───
  { drugA: 'caspofungin', drugB: 'cyclosporine', severity: 'major',
    mechanism: 'Циклоспорин повышает AUC каспофунгина на 35%; обратное взаимодействие — повышение АЛТ/АСТ.',
    effect: 'Повышение печёночных проб.',
    management: 'Контроль АЛТ/АСТ еженедельно.',
    sources: ['FDA labeling'] },

  // ─── Indapamide (thiazide-like) ───
  { drugA: 'indapamide', drugB: 'lithium', severity: 'major',
    mechanism: 'Снижение почечного клиренса лития.',
    effect: 'Литиевая токсичность.',
    management: 'TDM лития, снижение дозы на 25-50%.',
    sources: ['Lexidrug'] },

  // ─── Bupropion seizure threshold ───
  { drugA: 'bupropion', drugB: 'tramadol', severity: 'major',
    mechanism: 'Аддитивное снижение порога судорог.',
    effect: 'Судороги.',
    management: 'Избегать. Альтернатива: морфин.',
    sources: ['Lexidrug'] },
  { drugA: 'bupropion', drugB: 'metoprolol', severity: 'moderate',
    mechanism: 'CYP2D6 ингибиция бупропионом.',
    effect: 'Накопление метопролола.',
    management: 'Контроль ЧСС/АД.',
    sources: ['Lexidrug'] },

  // ─── Trazodone serotonin ───
  { drugA: 'trazodone', drugB: 'sertraline', severity: 'moderate',
    mechanism: 'Серотонинергический.',
    effect: 'Серотониновый синдром (редко).',
    management: 'Допустимо при наблюдении.',
    sources: ['Lexidrug'] },
  { drugA: 'trazodone', drugB: 'tramadol', severity: 'moderate',
    mechanism: 'Серотонинергический.',
    effect: 'Серотониновый синдром.',
    management: 'Избегать.',
    sources: ['Lexidrug'] },

  // ─── Doxazosin + sildenafil ───
  { drugA: 'doxazosin', drugB: 'sildenafil', severity: 'major',
    mechanism: 'Аддитивная гипотензия.',
    effect: 'Симптоматическая гипотензия, обморок.',
    management: 'Старт силденафила с 25 мг минимум через 4 ч после доксазозина.',
    sources: ['FDA labeling'] },

  // ─── Pioglitazone + insulin ───
  { drugA: 'pioglitazone', drugB: 'insulin', severity: 'moderate',
    mechanism: 'Аддитивный + ПИО усиливает удержание жидкости.',
    effect: 'Гипогликемия, отёки, риск ХСН.',
    management: 'Избегать у пациентов с ХСН. Снизить дозу инсулина.',
    sources: ['FDA black box'] },

  // ─── Misc finerenone ───
  { drugA: 'finerenone', drugB: 'clarithromycin', severity: 'contraindicated',
    mechanism: 'Сильная CYP3A4 ингибиция.',
    effect: 'Тяжёлая гиперкалиемия.',
    management: 'ПРОТИВОПОКАЗАНО.',
    sources: ['FDA labeling'] },
  { drugA: 'finerenone', drugB: 'lisinopril', severity: 'major',
    mechanism: 'Двойная блокада RAAS.',
    effect: 'Гиперкалиемия.',
    management: 'Контроль K+ через 1-2 нед, затем ежемесячно.',
    sources: ['ESC 2024 HF'] },
];

let pairsAdded = 0, pairsDup = 0;
for (const inter of NEW) {
  if (!existingDrugs.has(inter.drugA) || !existingDrugs.has(inter.drugB)) {
    console.warn(`SKIP — missing drug: ${inter.drugA} + ${inter.drugB}`);
    continue;
  }
  const key = pairKey(inter.drugA, inter.drugB);
  if (pairs.has(key)) { pairsDup++; continue; }
  d.interactions.push({
    ...inter,
    verified_by: null,
    verified_at: null,
  });
  pairs.add(key);
  pairsAdded++;
}

// Schema normalization: добавить verified_by:null всем парам без поля
let normalized = 0;
for (const i of d.interactions) {
  if (!('verified_by' in i)) {
    i.verified_by = null;
    i.verified_at = null;
    normalized++;
  }
}

d.version = '0.6.0';
d.lastUpdated = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path, JSON.stringify(d, null, 2) + '\n');
fs.copyFileSync(path, './public/drug-interactions.json');

// Final check
const seenPairs = new Set(), finalDup = [];
for (const i of d.interactions) {
  const k = pairKey(i.drugA, i.drugB);
  if (seenPairs.has(k)) finalDup.push(k);
  seenPairs.add(k);
}
const allDrugIds = new Set(d.drugs.map(x => x.id));
const orphans = [];
for (const i of d.interactions) {
  if (!allDrugIds.has(i.drugA)) orphans.push(`bad drugA: ${i.drugA}`);
  if (!allDrugIds.has(i.drugB)) orphans.push(`bad drugB: ${i.drugB}`);
}

console.log(`Drugs added:    ${drugsAdded}`);
console.log(`Pairs added:    ${pairsAdded}, dup skipped: ${pairsDup}`);
console.log(`Schema norm:    ${normalized} pairs got verified_by:null`);
console.log(`Total drugs:    ${d.drugs.length}`);
console.log(`Total pairs:    ${d.interactions.length}`);
const sevCounts = {};
for (const i of d.interactions) sevCounts[i.severity] = (sevCounts[i.severity]||0)+1;
console.log('Severity:      ', JSON.stringify(sevCounts));
if (finalDup.length) console.log('FINAL DUPS:    ', finalDup);
else console.log('✓ No duplicate pairs');
if (orphans.length) console.log('ORPHANS:       ', orphans);
else console.log('✓ All drug refs valid');

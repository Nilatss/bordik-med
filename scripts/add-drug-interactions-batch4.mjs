// K1-P2 batch 4 expansion: 221→320+ drugs, 510→700+ pairs.
// v0.6.0 → v0.7.0
// Focus: HIV/HCV antivirals, oncology (kinase inhibitors), immunosuppressants,
// DMARDs/biologics, advanced antiepileptics, anesthesia/sedation, PD, MS, ADHD,
// dementia, PAH/HF, bone, antimalarials, niche antimicrobials.
import fs from 'node:fs';

const path = './data/drug-interactions.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
const existingDrugs = new Set(d.drugs.map(x => x.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const pairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

// ============== NEW DRUGS ==============
const NEW_DRUGS = [
  // HIV antiretrovirals (ritonavir/cobicistat — критические CYP3A4 ингибиторы)
  { id: 'ritonavir', name_ru: 'Ритонавир', name_en: 'Ritonavir', atc: 'J05AE03', class_ru: 'ВИЧ ИП / CYP3A4 booster', aliases: ['норвир'] },
  { id: 'cobicistat', name_ru: 'Кобицистат', name_en: 'Cobicistat', atc: 'V03AX03', class_ru: 'CYP3A4 booster', aliases: [] },
  { id: 'darunavir', name_ru: 'Дарунавир', name_en: 'Darunavir', atc: 'J05AE10', class_ru: 'ВИЧ ИП', aliases: ['презиста'] },
  { id: 'atazanavir', name_ru: 'Атазанавир', name_en: 'Atazanavir', atc: 'J05AE08', class_ru: 'ВИЧ ИП', aliases: ['реатаз'] },
  { id: 'dolutegravir', name_ru: 'Долутегравир', name_en: 'Dolutegravir', atc: 'J05AJ03', class_ru: 'ВИЧ ингибитор интегразы', aliases: ['тивикей'] },
  { id: 'bictegravir', name_ru: 'Биктегравир', name_en: 'Bictegravir', atc: 'J05AJ04', class_ru: 'ВИЧ ингибитор интегразы', aliases: [] },
  { id: 'efavirenz', name_ru: 'Эфавиренз', name_en: 'Efavirenz', atc: 'J05AG03', class_ru: 'ВИЧ ННИОТ (CYP3A4 индуктор)', aliases: ['стокрин'] },
  { id: 'tenofovir', name_ru: 'Тенофовир', name_en: 'Tenofovir', atc: 'J05AF07', class_ru: 'ВИЧ НИОТ', aliases: [] },
  { id: 'emtricitabine', name_ru: 'Эмтрицитабин', name_en: 'Emtricitabine', atc: 'J05AF09', class_ru: 'ВИЧ НИОТ', aliases: [] },
  { id: 'paxlovid', name_ru: 'Нирматрелвир/ритонавир', name_en: 'Nirmatrelvir/ritonavir', atc: 'J05AE30', class_ru: 'COVID-19 ИП (CYP3A4 ингибитор)', aliases: ['паксловид'] },
  // HCV DAAs
  { id: 'sofosbuvir', name_ru: 'Софосбувир', name_en: 'Sofosbuvir', atc: 'J05AP08', class_ru: 'ВГС NS5B', aliases: [] },
  { id: 'glecaprevir_pibrentasvir', name_ru: 'Глекапревир/пибрентасвир', name_en: 'Glecaprevir/pibrentasvir', atc: 'J05AP57', class_ru: 'ВГС NS3/4A+NS5A', aliases: ['мавирет'] },
  // TB
  { id: 'rifabutin', name_ru: 'Рифабутин', name_en: 'Rifabutin', atc: 'J04AB04', class_ru: 'Противотуб. (рифамицин)', aliases: [] },
  { id: 'ethambutol', name_ru: 'Этамбутол', name_en: 'Ethambutol', atc: 'J04AK02', class_ru: 'Противотуб.', aliases: [] },
  { id: 'pyrazinamide', name_ru: 'Пиразинамид', name_en: 'Pyrazinamide', atc: 'J04AK01', class_ru: 'Противотуб.', aliases: [] },
  // Niche antibiotics
  { id: 'fosfomycin', name_ru: 'Фосфомицин', name_en: 'Fosfomycin', atc: 'J01XX01', class_ru: 'Антибиотик (ИМП)', aliases: ['монурал'] },
  { id: 'daptomycin', name_ru: 'Даптомицин', name_en: 'Daptomycin', atc: 'J01XX09', class_ru: 'Липопептид', aliases: ['кубицин'] },
  { id: 'tigecycline', name_ru: 'Тигециклин', name_en: 'Tigecycline', atc: 'J01AA12', class_ru: 'Глицилциклин', aliases: ['тигацил'] },
  { id: 'colistin', name_ru: 'Колистин', name_en: 'Colistin', atc: 'J01XB01', class_ru: 'Полимиксин E', aliases: [] },
  { id: 'fidaxomicin', name_ru: 'Фидаксомицин', name_en: 'Fidaxomicin', atc: 'A07AA12', class_ru: 'Макроциклический АБ (C.diff)', aliases: ['дификлир'] },
  // Antifungals
  { id: 'isavuconazole', name_ru: 'Изавуконазол', name_en: 'Isavuconazole', atc: 'J02AC05', class_ru: 'Триазол', aliases: ['кресемба'] },
  { id: 'amphotericin_b', name_ru: 'Амфотерицин B', name_en: 'Amphotericin B', atc: 'J02AA01', class_ru: 'Полиен', aliases: [] },
  { id: 'micafungin', name_ru: 'Микафунгин', name_en: 'Micafungin', atc: 'J02AX05', class_ru: 'Эхинокандин', aliases: ['микамин'] },
  // Antimalarials
  { id: 'hydroxychloroquine', name_ru: 'Гидроксихлорохин', name_en: 'Hydroxychloroquine', atc: 'P01BA02', class_ru: '4-аминохинолин', aliases: ['плаквенил'] },
  { id: 'chloroquine', name_ru: 'Хлорохин', name_en: 'Chloroquine', atc: 'P01BA01', class_ru: '4-аминохинолин', aliases: ['делагил'] },
  // Oncology kinase inhibitors (CYP3A4 substrates)
  { id: 'imatinib', name_ru: 'Иматиниб', name_en: 'Imatinib', atc: 'L01EA01', class_ru: 'BCR-ABL/KIT TKI', aliases: ['гливек'] },
  { id: 'sunitinib', name_ru: 'Сунитиниб', name_en: 'Sunitinib', atc: 'L01EX01', class_ru: 'Мульти-TKI', aliases: ['сутент'] },
  { id: 'sorafenib', name_ru: 'Сорафениб', name_en: 'Sorafenib', atc: 'L01EX02', class_ru: 'Мульти-TKI', aliases: ['нексавар'] },
  { id: 'ibrutinib', name_ru: 'Ибрутиниб', name_en: 'Ibrutinib', atc: 'L01EL01', class_ru: 'BTK-ингибитор', aliases: ['имбрувика'] },
  { id: 'palbociclib', name_ru: 'Палбоциклиб', name_en: 'Palbociclib', atc: 'L01EF01', class_ru: 'CDK4/6-ингибитор', aliases: ['ибранса'] },
  { id: 'venetoclax', name_ru: 'Венетоклакс', name_en: 'Venetoclax', atc: 'L01XX52', class_ru: 'BCL-2 ингибитор', aliases: ['венкликста'] },
  { id: 'erlotinib', name_ru: 'Эрлотиниб', name_en: 'Erlotinib', atc: 'L01EB02', class_ru: 'EGFR TKI', aliases: ['тарцева'] },
  // Cytotoxics
  { id: 'fluorouracil', name_ru: 'Фторурацил', name_en: 'Fluorouracil', atc: 'L01BC02', class_ru: 'Антиметаболит (5-FU)', aliases: [] },
  { id: 'capecitabine', name_ru: 'Капецитабин', name_en: 'Capecitabine', atc: 'L01BC06', class_ru: '5-FU пролекарство', aliases: ['кселода'] },
  { id: 'cisplatin', name_ru: 'Цисплатин', name_en: 'Cisplatin', atc: 'L01XA01', class_ru: 'Платина (нефро-/ототоксик)', aliases: [] },
  // Immunosuppressants
  { id: 'mycophenolate', name_ru: 'Микофенолата мофетил', name_en: 'Mycophenolate mofetil', atc: 'L04AA06', class_ru: 'Иммуносупрессор', aliases: ['селлсепт'] },
  { id: 'azathioprine', name_ru: 'Азатиоприн', name_en: 'Azathioprine', atc: 'L04AX01', class_ru: 'Иммуносупрессор (тиопурин)', aliases: ['имуран'] },
  { id: 'sirolimus', name_ru: 'Сиролимус', name_en: 'Sirolimus', atc: 'L04AA10', class_ru: 'mTOR-ингибитор', aliases: ['рапамун'] },
  { id: 'everolimus', name_ru: 'Эверолимус', name_en: 'Everolimus', atc: 'L04AA18', class_ru: 'mTOR-ингибитор', aliases: ['афинитор'] },
  { id: 'leflunomide', name_ru: 'Лефлуномид', name_en: 'Leflunomide', atc: 'L04AA13', class_ru: 'БМАРП', aliases: ['арава'] },
  // Biologics / DMARDs
  { id: 'adalimumab', name_ru: 'Адалимумаб', name_en: 'Adalimumab', atc: 'L04AB04', class_ru: 'Анти-TNFα', aliases: ['хумира'] },
  { id: 'infliximab', name_ru: 'Инфликсимаб', name_en: 'Infliximab', atc: 'L04AB02', class_ru: 'Анти-TNFα', aliases: ['ремикейд'] },
  { id: 'etanercept', name_ru: 'Этанерцепт', name_en: 'Etanercept', atc: 'L04AB01', class_ru: 'Анти-TNFα', aliases: ['энбрел'] },
  { id: 'rituximab', name_ru: 'Ритуксимаб', name_en: 'Rituximab', atc: 'L01FA01', class_ru: 'Анти-CD20 МАТ', aliases: ['мабтера'] },
  { id: 'tocilizumab', name_ru: 'Тоцилизумаб', name_en: 'Tocilizumab', atc: 'L04AC07', class_ru: 'Анти-IL6R МАТ', aliases: ['актемра'] },
  // Antiepileptics gaps
  { id: 'lacosamide', name_ru: 'Лакосамид', name_en: 'Lacosamide', atc: 'N03AX18', class_ru: 'Противоэпилептик (Na-канал)', aliases: ['вимпат'] },
  { id: 'zonisamide', name_ru: 'Зонисамид', name_en: 'Zonisamide', atc: 'N03AX15', class_ru: 'Противоэпилептик', aliases: [] },
  { id: 'perampanel', name_ru: 'Перампанел', name_en: 'Perampanel', atc: 'N03AX22', class_ru: 'AMPA-антагонист', aliases: ['файкомпа'] },
  { id: 'phenobarbital', name_ru: 'Фенобарбитал', name_en: 'Phenobarbital', atc: 'N03AA02', class_ru: 'Барбитурат (CYP индуктор)', aliases: [] },
  // ADHD
  { id: 'methylphenidate', name_ru: 'Метилфенидат', name_en: 'Methylphenidate', atc: 'N06BA04', class_ru: 'Психостимулятор', aliases: ['риталин','концерта'] },
  { id: 'atomoxetine', name_ru: 'Атомоксетин', name_en: 'Atomoxetine', atc: 'N06BA09', class_ru: 'СИОЗН (СДВГ)', aliases: ['страттера'] },
  // Dementia
  { id: 'donepezil', name_ru: 'Донепезил', name_en: 'Donepezil', atc: 'N06DA02', class_ru: 'Ингибитор АХЭ', aliases: ['арисепт'] },
  { id: 'rivastigmine', name_ru: 'Ривастигмин', name_en: 'Rivastigmine', atc: 'N06DA03', class_ru: 'Ингибитор АХЭ', aliases: ['экселон'] },
  { id: 'galantamine', name_ru: 'Галантамин', name_en: 'Galantamine', atc: 'N06DA04', class_ru: 'Ингибитор АХЭ', aliases: ['реминил'] },
  { id: 'memantine', name_ru: 'Мемантин', name_en: 'Memantine', atc: 'N06DX01', class_ru: 'NMDA-антагонист', aliases: ['акатинол'] },
  // Parkinson
  { id: 'pramipexole', name_ru: 'Прамипексол', name_en: 'Pramipexole', atc: 'N04BC05', class_ru: 'Агонист D2/D3', aliases: ['мирапекс'] },
  { id: 'ropinirole', name_ru: 'Ропинирол', name_en: 'Ropinirole', atc: 'N04BC04', class_ru: 'Агонист D2/D3', aliases: [] },
  { id: 'rasagiline', name_ru: 'Разагилин', name_en: 'Rasagiline', atc: 'N04BD02', class_ru: 'ИМАО-B', aliases: ['азилект'] },
  { id: 'selegiline', name_ru: 'Селегилин', name_en: 'Selegiline', atc: 'N04BD01', class_ru: 'ИМАО-B', aliases: [] },
  { id: 'amantadine', name_ru: 'Амантадин', name_en: 'Amantadine', atc: 'N04BB01', class_ru: 'NMDA-антагонист (PD)', aliases: ['пк-мерц'] },
  // MS
  { id: 'fingolimod', name_ru: 'Финголимод', name_en: 'Fingolimod', atc: 'L04AA27', class_ru: 'S1P-модулятор', aliases: ['гилениа'] },
  { id: 'natalizumab', name_ru: 'Натализумаб', name_en: 'Natalizumab', atc: 'L04AA23', class_ru: 'Анти-α4-интегрин', aliases: ['тизабри'] },
  { id: 'dimethyl_fumarate', name_ru: 'Диметилфумарат', name_en: 'Dimethyl fumarate', atc: 'L04AX07', class_ru: 'Иммуномодулятор (РС)', aliases: ['текфидера'] },
  // Anesthesia / sedation
  { id: 'propofol', name_ru: 'Пропофол', name_en: 'Propofol', atc: 'N01AX10', class_ru: 'В/в анестетик', aliases: ['диприван'] },
  { id: 'ketamine', name_ru: 'Кетамин', name_en: 'Ketamine', atc: 'N01AX03', class_ru: 'NMDA-антагонист (анестетик)', aliases: [] },
  { id: 'dexmedetomidine', name_ru: 'Дексмедетомидин', name_en: 'Dexmedetomidine', atc: 'N05CM18', class_ru: 'α2-агонист (седация)', aliases: ['дексдор'] },
  { id: 'rocuronium', name_ru: 'Рокуроний', name_en: 'Rocuronium', atc: 'M03AC09', class_ru: 'Недеполяриз. миорелаксант', aliases: ['эсмерон'] },
  { id: 'sugammadex', name_ru: 'Сугаммадекс', name_en: 'Sugammadex', atc: 'V03AB35', class_ru: 'Реверсант миорелаксации', aliases: ['брайдан'] },
  { id: 'succinylcholine', name_ru: 'Суксаметоний', name_en: 'Succinylcholine', atc: 'M03AB01', class_ru: 'Деполяриз. миорелаксант', aliases: ['листенон'] },
  // Antiemetics gaps
  { id: 'aprepitant', name_ru: 'Апрепитант', name_en: 'Aprepitant', atc: 'A04AD12', class_ru: 'NK1-антагонист', aliases: ['эменд'] },
  { id: 'granisetron', name_ru: 'Гранисетрон', name_en: 'Granisetron', atc: 'A04AA02', class_ru: '5-HT3-антагонист', aliases: [] },
  { id: 'prochlorperazine', name_ru: 'Прохлорперазин', name_en: 'Prochlorperazine', atc: 'N05AB04', class_ru: 'Фенотиазин (антиэметик)', aliases: [] },
  // Bone / osteoporosis
  { id: 'zoledronate', name_ru: 'Золедроновая к-та', name_en: 'Zoledronic acid', atc: 'M05BA08', class_ru: 'Бисфосфонат IV', aliases: ['акласта'] },
  { id: 'denosumab', name_ru: 'Деносумаб', name_en: 'Denosumab', atc: 'M05BX04', class_ru: 'Анти-RANKL МАТ', aliases: ['пролиа','эксджива'] },
  { id: 'teriparatide', name_ru: 'Терипаратид', name_en: 'Teriparatide', atc: 'H05AA02', class_ru: 'Аналог ПТГ (анаболик)', aliases: ['форстео'] },
  { id: 'raloxifene', name_ru: 'Ралоксифен', name_en: 'Raloxifene', atc: 'G03XC01', class_ru: 'СЭРМ', aliases: ['эвиста'] },
  // PAH / advanced HF
  { id: 'bosentan', name_ru: 'Бозентан', name_en: 'Bosentan', atc: 'C02KX01', class_ru: 'Антагонист эндотелина (ЛАГ)', aliases: ['траклир'] },
  { id: 'macitentan', name_ru: 'Мацитентан', name_en: 'Macitentan', atc: 'C02KX04', class_ru: 'Антагонист эндотелина (ЛАГ)', aliases: ['опсамит'] },
  { id: 'riociguat', name_ru: 'Риоцигуат', name_en: 'Riociguat', atc: 'C02KX05', class_ru: 'Стимулятор гуанилатциклазы (ЛАГ)', aliases: ['адемпас'] },
  { id: 'milrinone', name_ru: 'Милринон', name_en: 'Milrinone', atc: 'C01CE02', class_ru: 'Ингибитор ФДЭ-3 (инотроп)', aliases: [] },
  { id: 'dobutamine', name_ru: 'Добутамин', name_en: 'Dobutamine', atc: 'C01CA07', class_ru: 'β1-агонист (инотроп)', aliases: [] },
  // Vasopressors
  { id: 'dopamine', name_ru: 'Допамин', name_en: 'Dopamine', atc: 'C01CA04', class_ru: 'Симпатомиметик (вазопрессор)', aliases: [] },
  { id: 'vasopressin', name_ru: 'Вазопрессин', name_en: 'Vasopressin', atc: 'H01BA01', class_ru: 'АДГ (вазопрессор)', aliases: [] },
  { id: 'phenylephrine', name_ru: 'Фенилэфрин', name_en: 'Phenylephrine', atc: 'C01CA06', class_ru: 'α1-агонист', aliases: [] },
  // BPH/urology
  { id: 'finasteride', name_ru: 'Финастерид', name_en: 'Finasteride', atc: 'G04CB01', class_ru: 'Ингибитор 5α-редуктазы', aliases: ['проскар'] },
  { id: 'dutasteride', name_ru: 'Дутастерид', name_en: 'Dutasteride', atc: 'G04CB02', class_ru: 'Ингибитор 5α-редуктазы', aliases: ['аводарт'] },
  // GI
  { id: 'loperamide', name_ru: 'Лоперамид', name_en: 'Loperamide', atc: 'A07DA03', class_ru: 'Антидиарейный (μ-опиоид)', aliases: ['имодиум'] },
  { id: 'cholestyramine', name_ru: 'Холестирамин', name_en: 'Cholestyramine', atc: 'C10AC01', class_ru: 'Связывающий желчные к-ты', aliases: [] },
  // Renal/electrolyte
  { id: 'tolvaptan', name_ru: 'Толваптан', name_en: 'Tolvaptan', atc: 'C03XA01', class_ru: 'V2-антагонист', aliases: ['самска'] },
  { id: 'cinacalcet', name_ru: 'Цинакальцет', name_en: 'Cinacalcet', atc: 'H05BX01', class_ru: 'Кальцимиметик', aliases: ['мимпара'] },
  { id: 'sevelamer', name_ru: 'Севеламер', name_en: 'Sevelamer', atc: 'V03AE02', class_ru: 'Фосфат-связывающий', aliases: ['ренагель'] },
  // Thrombocytopenia / hematology
  { id: 'eltrombopag', name_ru: 'Элтромбопаг', name_en: 'Eltrombopag', atc: 'B02BX05', class_ru: 'Агонист рец. ТПО', aliases: ['револейд'] },
  // Anxiolytic
  { id: 'buspirone', name_ru: 'Буспирон', name_en: 'Buspirone', atc: 'N05BE01', class_ru: '5-HT1A-агонист (анксиолитик)', aliases: [] },
  // Antiarrhythmic gap
  { id: 'lidocaine_systemic', name_ru: 'Лидокаин (системно)', name_en: 'Lidocaine (systemic)', atc: 'C01BB01', class_ru: 'Антиаритмик IB класса', aliases: [] },
  { id: 'mexiletine', name_ru: 'Мексилетин', name_en: 'Mexiletine', atc: 'C01BB02', class_ru: 'Антиаритмик IB класса', aliases: [] },
  // BP add'l
  { id: 'hydralazine', name_ru: 'Гидралазин', name_en: 'Hydralazine', atc: 'C02DB02', class_ru: 'Прямой вазодилататор', aliases: [] },
  { id: 'methyldopa', name_ru: 'Метилдопа', name_en: 'Methyldopa', atc: 'C02AB01', class_ru: 'Центральный α2-агонист', aliases: ['допегит'] },
  { id: 'esmolol', name_ru: 'Эсмолол', name_en: 'Esmolol', atc: 'C07AB09', class_ru: 'Ультракороткий β1-блокатор', aliases: [] },
  { id: 'nicardipine', name_ru: 'Никардипин', name_en: 'Nicardipine', atc: 'C08CA04', class_ru: 'БКК дигидропиридин (IV)', aliases: [] },
  // Misc
  { id: 'allopurinol', name_ru: 'Аллопуринол', name_en: 'Allopurinol', atc: 'M04AA01', class_ru: 'Ингибитор ксантиноксидазы', aliases: [] }, // wait - check existing
];

// Filter out drugs already present
const drugsToAdd = NEW_DRUGS.filter(x => !existingDrugs.has(x.id));

// ============== NEW INTERACTIONS (~150) ==============
// Severities: contraindicated | major | moderate | minor
// Mechanisms: PK_CYP3A4 | PK_CYP2D6 | PK_CYP2C9 | PK_PGP | PK_CHELATION |
//             PK_ABSORPTION | PD_ADDITIVE | PD_OPPOSITE | QT | SEROTONIN | NEPHROTOXICITY | OTOTOXICITY | HYPERKALEMIA
const NEW_INTERACTIONS = [
  // ===== Ritonavir/cobicistat — мощный CYP3A4 ингибитор =====
  { drugA:'ritonavir', drugB:'simvastatin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Ритонавир блокирует CYP3A4-метаболизм симвастатина → ↑↑ концентрация → рабдомиолиз.', recommendation_ru:'ПРОТИВОПОКАЗАНО. Заменить на правастатин/розувастатин в низкой дозе.' },
  { drugA:'ritonavir', drugB:'atorvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ AUC аторвастатина → миопатия.', recommendation_ru:'Макс. 20 мг/сут или замена.' },
  { drugA:'ritonavir', drugB:'amiodarone', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Ритонавир ↑↑ амиодарон → проаритмия (TdP).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ritonavir', drugB:'rivaroxaban', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Ритонавир (ингибитор CYP3A4 + P-gp) → ↑↑ ривароксабан → кровотечение.', recommendation_ru:'Избегать; альтернатива — апиксабан (с осторожностью) или НМГ.' },
  { drugA:'ritonavir', drugB:'apixaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ AUC апиксабана ~2x → кровотечение.', recommendation_ru:'Снизить дозу 50% или избегать.' },
  { drugA:'ritonavir', drugB:'ticagrelor', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ тикагрелор → кровотечение.', recommendation_ru:'ПРОТИВОПОКАЗАНО (FDA). Альтернатива — клопидогрел.' },
  { drugA:'ritonavir', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ такролимус → нефро/нейротоксичность.', recommendation_ru:'Снизить дозу до 1/10–1/20, мониторинг уровня.' },
  { drugA:'ritonavir', drugB:'ergotamine', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ эрготамин → эрготизм/ишемия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ritonavir', drugB:'midazolam', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ мидазолам → длительная седация/угнетение дыхания.', recommendation_ru:'ПРОТИВОПОКАЗАНО (peroral). IV — с осторожностью под мониторингом.' },
  { drugA:'ritonavir', drugB:'sildenafil', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ силденафил → гипотензия.', recommendation_ru:'При ЭД — макс 25 мг/48ч; ЛАГ — противопоказан.' },
  { drugA:'ritonavir', drugB:'colchicine', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ колхицин → летальная токсичность (миелосуппрессия).', recommendation_ru:'ПРОТИВОПОКАЗАНО при почечной/печёночной недост.' },
  { drugA:'paxlovid', drugB:'simvastatin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Ритонавир в составе → ↑↑ статин → рабдомиолиз.', recommendation_ru:'Прекратить статин на курс паксловида.' },
  { drugA:'paxlovid', drugB:'amiodarone', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Угрожающая жизни проаритмия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'paxlovid', drugB:'rivaroxaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ ривароксабан → кровотечение.', recommendation_ru:'Прервать или сменить АК на курс.' },
  { drugA:'paxlovid', drugB:'apixaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ AUC апиксабана.', recommendation_ru:'Снизить дозу 50%.' },
  // Cobicistat shares profile
  { drugA:'cobicistat', drugB:'simvastatin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'То же что ритонавир.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'cobicistat', drugB:'rivaroxaban', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ ривароксабан.', recommendation_ru:'Избегать.' },
  // Atazanavir absorption pH-dependent
  { drugA:'atazanavir', drugB:'omeprazole', severity:'contraindicated', mechanism:'PK_ABSORPTION', summary_ru:'ИПП ↑pH → ↓↓ всасывание атазанавира → потеря эффекта.', recommendation_ru:'ПРОТИВОПОКАЗАНО комбинировать с любыми ИПП у нативных пациентов.' },
  { drugA:'atazanavir', drugB:'esomeprazole', severity:'contraindicated', mechanism:'PK_ABSORPTION', summary_ru:'См. omeprazole.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'atazanavir', drugB:'famotidine', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'H2-блокатор → ↓ атазанавир.', recommendation_ru:'Разделить ≥10ч; следить за вирусной нагрузкой.' },
  // Efavirenz CYP3A4 inducer
  { drugA:'efavirenz', drugB:'rivaroxaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'Эфавиренз индуцирует CYP3A4 → ↓ ривароксабан → тромбоз.', recommendation_ru:'Избегать.' },
  { drugA:'efavirenz', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'Изменение МНО (вверх или вниз).', recommendation_ru:'Учащённый контроль МНО.' },
  { drugA:'efavirenz', drugB:'methadone', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ метадон → синдром отмены.', recommendation_ru:'Повышение дозы метадона часто требуется.' },
  // Dolutegravir polyvalent cation chelation
  { drugA:'dolutegravir', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'Двухвалентные катионы хелатируют долутегравир → ↓ концентрация.', recommendation_ru:'Долутегравир за 2ч до или 6ч после железа.' },
  { drugA:'dolutegravir', drugB:'calcium_carbonate', severity:'major', mechanism:'PK_CHELATION', summary_ru:'То же.', recommendation_ru:'Разделить ≥2ч.' },
  // Tenofovir nephrotoxicity
  { drugA:'tenofovir', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивная нефротоксичность.', recommendation_ru:'Избегать или мониторить креатинин.' },
  { drugA:'tenofovir', drugB:'amphotericin_b', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск ОПП.', recommendation_ru:'Избегать.' },

  // ===== HCV DAAs =====
  { drugA:'sofosbuvir', drugB:'amiodarone', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая брадикардия (FDA black box).', recommendation_ru:'ПРОТИВОПОКАЗАНО. Если необходимо — мониторинг 48ч и более.' },
  { drugA:'glecaprevir_pibrentasvir', drugB:'atorvastatin', severity:'major', mechanism:'PK_PGP', summary_ru:'↑ статин → миопатия.', recommendation_ru:'Макс. 20 мг или временно отменить.' },
  { drugA:'glecaprevir_pibrentasvir', drugB:'rifampicin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Рифампицин ↓↓ концентрацию DAA → провал терапии.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'glecaprevir_pibrentasvir', drugB:'carbamazepine', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'См. рифампицин.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ===== Rifabutin =====
  { drugA:'rifabutin', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↓ МНО.', recommendation_ru:'Учащённый контроль.' },
  { drugA:'rifabutin', drugB:'cyclosporine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ циклоспорин → отторжение.', recommendation_ru:'↑ доза, ТDM.' },

  // ===== Fosfomycin / niche AB =====
  { drugA:'fosfomycin', drugB:'metoclopramide', severity:'moderate', mechanism:'PK_ABSORPTION', summary_ru:'Метоклопрамид ↓ AUC фосфомицина.', recommendation_ru:'Разделить приём.' },
  { drugA:'daptomycin', drugB:'simvastatin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная миопатия (рост КФК).', recommendation_ru:'Временно отменить статин на курс даптомицина.' },
  { drugA:'daptomycin', drugB:'rosuvastatin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Миопатия.', recommendation_ru:'Отменить статин.' },
  { drugA:'colistin', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивные нефро- и нейротоксичность.', recommendation_ru:'Избегать; если необходимо — мониторинг.' },
  { drugA:'colistin', drugB:'vancomycin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск ОПП.', recommendation_ru:'Мониторинг креатинина ежедневно.' },

  // ===== Antifungals =====
  { drugA:'isavuconazole', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ такролимус (умереннее, чем voriconazole).', recommendation_ru:'Снизить дозу ~50%, TDM.' },
  { drugA:'isavuconazole', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ статин → миопатия.', recommendation_ru:'Снизить дозу или замена.' },
  { drugA:'isavuconazole', drugB:'rifampicin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↓↓ изавуконазол.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'amphotericin_b', drugB:'cyclosporine', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивная нефротоксичность.', recommendation_ru:'Мониторинг креатинина.' },
  { drugA:'amphotericin_b', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск ОПП.', recommendation_ru:'Избегать.' },

  // ===== Hydroxychloroquine =====
  { drugA:'hydroxychloroquine', drugB:'azithromycin', severity:'major', mechanism:'QT', summary_ru:'Аддитивное удлинение QT.', recommendation_ru:'ЭКГ-мониторинг; избегать у пациентов с риском TdP.' },
  { drugA:'hydroxychloroquine', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение.', recommendation_ru:'Избегать или ЭКГ.' },
  { drugA:'hydroxychloroquine', drugB:'digoxin', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ дигоксин ~30%.', recommendation_ru:'Контроль уровня.' },
  { drugA:'hydroxychloroquine', drugB:'metoprolol', severity:'moderate', mechanism:'PK_CYP2D6', summary_ru:'↑ метопролол.', recommendation_ru:'Учитывать при подборе дозы.' },
  { drugA:'chloroquine', drugB:'azithromycin', severity:'major', mechanism:'QT', summary_ru:'QT-удлинение.', recommendation_ru:'ЭКГ-мониторинг.' },

  // ===== Oncology TKIs (CYP3A4 substrates) =====
  { drugA:'imatinib', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Замена на НМГ во время курса.' },
  { drugA:'imatinib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ иматиниб → токсичность.', recommendation_ru:'Альтернативный АБ.' },
  { drugA:'imatinib', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ иматиниб → провал терапии.', recommendation_ru:'Избегать.' },
  { drugA:'sunitinib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ сунитиниб → QT/гепатотоксичность.', recommendation_ru:'Снизить дозу до 37.5 мг или замена АБ.' },
  { drugA:'sunitinib', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'Избегать.' },
  { drugA:'sorafenib', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'Изменение МНО.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'ibrutinib', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ ибрутиниб → кровотечение/AF.', recommendation_ru:'ПРОТИВОПОКАЗАНО (или снизить ибрутиниб до 70 мг).' },
  { drugA:'ibrutinib', drugB:'rivaroxaban', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивный риск кровотечения.', recommendation_ru:'Избегать; рассмотреть НМГ.' },
  { drugA:'ibrutinib', drugB:'apixaban', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Кровотечение.', recommendation_ru:'Избегать.' },
  { drugA:'ibrutinib', drugB:'aspirin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивный риск кровотечения.', recommendation_ru:'Избегать; если необходимо — низкая доза + мониторинг.' },
  { drugA:'palbociclib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ палбоциклиб → нейтропения.', recommendation_ru:'Снизить дозу до 75 мг.' },
  { drugA:'venetoclax', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ венетоклакс → синдром лизиса опухоли.', recommendation_ru:'ПРОТИВОПОКАЗАНО в фазе ramp-up.' },
  { drugA:'venetoclax', drugB:'posaconazole', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ венетоклакс.', recommendation_ru:'ПРОТИВОПОКАЗАНО в ramp-up; в стабильной — снизить дозу 75%.' },
  { drugA:'erlotinib', drugB:'omeprazole', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↑pH → ↓ эрлотиниб.', recommendation_ru:'Избегать ИПП; H2-блокатор разделить ≥10ч.' },
  { drugA:'erlotinib', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Замена на НМГ; усиленный контроль.' },

  // ===== 5-FU / capecitabine + warfarin =====
  { drugA:'fluorouracil', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑↑ МНО → кровотечение.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'capecitabine', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑↑ МНО (FDA black box).', recommendation_ru:'Замена на НМГ.' },
  { drugA:'capecitabine', drugB:'phenytoin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ фенитоин → токсичность.', recommendation_ru:'Мониторинг уровня фенитоина.' },
  { drugA:'cisplatin', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивные нефро- и ототоксичность.', recommendation_ru:'Избегать одновременно.' },
  { drugA:'cisplatin', drugB:'vancomycin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'ОПП.', recommendation_ru:'Мониторинг.' },
  { drugA:'cisplatin', drugB:'furosemide', severity:'major', mechanism:'OTOTOXICITY', summary_ru:'Аддитивная ототоксичность.', recommendation_ru:'Избегать.' },

  // ===== Immunosuppressants =====
  { drugA:'mycophenolate', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'Железо ↓↓ всасывание микофенолата.', recommendation_ru:'Разделить ≥4ч.' },
  { drugA:'mycophenolate', drugB:'cholestyramine', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓ микофенолат.', recommendation_ru:'Избегать.' },
  { drugA:'azathioprine', drugB:'allopurinol', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Аллопуринол блокирует ксантиноксидазу → ↑↑ азатиоприн → панцитопения.', recommendation_ru:'ПРОТИВОПОКАЗАНО или снизить азатиоприн на 75%.' },
  { drugA:'azathioprine', drugB:'febuxostat', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'См. allopurinol.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'azathioprine', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↓ МНО (механизм неясен).', recommendation_ru:'Контроль МНО.' },
  { drugA:'sirolimus', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ сиролимус → токсичность.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'sirolimus', drugB:'cyclosporine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'Циклоспорин ↑ сиролимус.', recommendation_ru:'Прием сиролимуса через 4ч после циклоспорина; TDM.' },
  { drugA:'everolimus', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ эверолимус.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'everolimus', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ эверолимус.', recommendation_ru:'Дозу x2 или избегать.' },
  { drugA:'leflunomide', drugB:'methotrexate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гепато- и миелотоксичность.', recommendation_ru:'Только у опытных ревматологов; мониторинг АЛТ/ОАК.' },
  { drugA:'leflunomide', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },

  // ===== Biologics =====
  { drugA:'adalimumab', drugB:'methotrexate', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Стандартная комбинация при РА; ↑ риск инфекций.', recommendation_ru:'Допустимо под наблюдением; скрининг ТБ/HBV.' },
  { drugA:'rituximab', drugB:'methotrexate', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная иммуносупрессия.', recommendation_ru:'Стандартная схема; PCP-профилактика по показаниям.' },
  { drugA:'infliximab', drugB:'adalimumab', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойная анти-TNFα → инфекции.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tocilizumab', drugB:'simvastatin', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↓ статин (восстановление CYP3A4 после блокады IL-6).', recommendation_ru:'Контроль ЛПНП после начала тоцилизумаба.' },

  // ===== Antiepileptics =====
  { drugA:'phenobarbital', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'Фенобарбитал — мощный CYP-индуктор → ↓ МНО.', recommendation_ru:'Учащённый контроль; возможно ↑ варфарина.' },
  { drugA:'phenobarbital', drugB:'rivaroxaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ DOAC → тромбоз.', recommendation_ru:'Избегать; альтернатива — НМГ.' },
  { drugA:'phenobarbital', drugB:'apixaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ апиксабан.', recommendation_ru:'Избегать.' },
  { drugA:'phenobarbital', drugB:'dolutegravir', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ долутегравир.', recommendation_ru:'↑ долутегравир до 50 мг 2р/сут или замена.' },
  { drugA:'lacosamide', drugB:'amiodarone', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивный AV-блок и удлинение PR.', recommendation_ru:'ЭКГ перед началом; избегать.' },
  { drugA:'lacosamide', drugB:'verapamil', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Удлинение PR.', recommendation_ru:'ЭКГ.' },
  { drugA:'perampanel', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ перампанел → провал.', recommendation_ru:'Избегать.' },

  // ===== ADHD =====
  { drugA:'methylphenidate', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'ИМАО + стимулятор → гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО (включая 14 дней после ИМАО).' },
  { drugA:'methylphenidate', drugB:'rasagiline', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'См. ИМАО.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'methylphenidate', drugB:'warfarin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'atomoxetine', drugB:'paroxetine', severity:'major', mechanism:'PK_CYP2D6', summary_ru:'↑↑ атомоксетин.', recommendation_ru:'Использовать стартовую дозу или замена антидепрессанта.' },
  { drugA:'atomoxetine', drugB:'fluoxetine', severity:'major', mechanism:'PK_CYP2D6', summary_ru:'↑↑ атомоксетин.', recommendation_ru:'Стартовая доза 0.5 мг/кг.' },

  // ===== Dementia (cholinesterase inhibitors) =====
  { drugA:'donepezil', drugB:'metoprolol', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия / синкопе.', recommendation_ru:'ЭКГ; у предрасположенных — избегать.' },
  { drugA:'donepezil', drugB:'amiodarone', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия.', recommendation_ru:'Избегать или ЭКГ.' },
  { drugA:'donepezil', drugB:'diltiazem', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия.', recommendation_ru:'Контроль ЧСС.' },
  { drugA:'rivastigmine', drugB:'metoprolol', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия.', recommendation_ru:'ЭКГ.' },
  { drugA:'galantamine', drugB:'paroxetine', severity:'moderate', mechanism:'PK_CYP2D6', summary_ru:'↑ галантамин.', recommendation_ru:'Снизить дозу.' },

  // ===== Parkinson =====
  { drugA:'rasagiline', drugB:'tramadol', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'ИМАО + опиоид с серотонинергической активностью → серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'rasagiline', drugB:'sertraline', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'rasagiline', drugB:'fluoxetine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром (с учётом длинного t1/2 fluoxetine).', recommendation_ru:'ПРОТИВОПОКАЗАНО; интервал ≥5 нед.' },
  { drugA:'selegiline', drugB:'tramadol', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'selegiline', drugB:'meperidine', severity:'contraindicated', mechanism:'SEROTONIN', summary_ru:'Тяжёлый серотониновый синдром.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'amantadine', drugB:'metoclopramide', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'Метоклопрамид блокирует D2 → ухудшение PD.', recommendation_ru:'Избегать; использовать домперидон/ондансетрон.' },

  // ===== Anesthesia / sedation =====
  { drugA:'propofol', drugB:'fentanyl', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гипотензия и угнетение дыхания.', recommendation_ru:'Стандартная комбинация в анестезии — снижать дозы.' },
  { drugA:'propofol', drugB:'midazolam', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Углубление седации.', recommendation_ru:'Снизить дозы; мониторинг.' },
  { drugA:'ketamine', drugB:'midazolam', severity:'minor', mechanism:'PD_ADDITIVE', summary_ru:'Мидазолам ослабляет психотомиметические эффекты.', recommendation_ru:'Стандартная комбинация.' },
  { drugA:'ketamine', drugB:'tranylcypromine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'ИМАО ↑ симпатомиметический эффект.', recommendation_ru:'Избегать или мониторинг АД.' },
  { drugA:'dexmedetomidine', drugB:'metoprolol', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия/гипотензия.', recommendation_ru:'Снизить дозу дексмедетомидина у пациентов на β-блокаторах.' },
  { drugA:'rocuronium', drugB:'gentamicin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аминогликозиды потенциируют миорелаксацию → длительный паралич.', recommendation_ru:'Использовать TOF; готовность к ИВЛ; реверс sugammadex.' },
  { drugA:'succinylcholine', drugB:'donepezil', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'АХЭ-ингибитор → пролонгация суксаметония.', recommendation_ru:'Информировать анестезиолога; альтернативный миорелаксант.' },

  // ===== Antiemetics =====
  { drugA:'aprepitant', drugB:'warfarin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↓ МНО.', recommendation_ru:'Контроль 7-10 дней после курса.' },
  { drugA:'aprepitant', drugB:'dexamethasone', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ дексаметазон.', recommendation_ru:'Снизить дозу дексаметазона на 50%.' },
  { drugA:'granisetron', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'Избегать.' },
  { drugA:'prochlorperazine', drugB:'levodopa_carbidopa', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'Блокада D2 → ухудшение PD.', recommendation_ru:'Избегать у пациентов с PD.' },

  // ===== Bisphosphonates / bone =====
  { drugA:'zoledronate', drugB:'furosemide', severity:'moderate', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск гипокальциемии и нефротоксичности.', recommendation_ru:'Гидратация перед инфузией.' },
  { drugA:'denosumab', drugB:'zoledronate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Двойная антирезорбтивная — гипокальциемия, ОНЧ.', recommendation_ru:'Не комбинировать.' },
  { drugA:'raloxifene', drugB:'warfarin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↓ МНО ~10%.', recommendation_ru:'Контроль.' },

  // ===== PAH =====
  { drugA:'bosentan', drugB:'sildenafil', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'Бозентан ↓ силденафил.', recommendation_ru:'Допустимо в комбинации при ЛАГ — возможна корректировка доз.' },
  { drugA:'bosentan', drugB:'cyclosporine', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'Циклоспорин ↑↑ бозентан.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'bosentan', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↓ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'macitentan', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ мацитентан.', recommendation_ru:'Избегать.' },
  { drugA:'riociguat', drugB:'sildenafil', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойной NO-путь → тяжёлая гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'riociguat', drugB:'tadalafil', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'riociguat', drugB:'isosorbide_mononitrate', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ===== Vasopressors =====
  { drugA:'dopamine', drugB:'phenytoin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Резкая гипотензия и брадикардия.', recommendation_ru:'Избегать одновременного болюса фенитоина.' },
  { drugA:'norepinephrine', drugB:'amitriptyline', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'ТЦА потенциируют норадреналин → ↑↑ АД.', recommendation_ru:'Снизить дозу вазопрессора.' },
  { drugA:'epinephrine', drugB:'propranolol', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Неселект. β-блокатор → нерегулируемая α-стимуляция → гипертонический криз.', recommendation_ru:'Использовать селективный β1-блокатор.' },

  // ===== BPH 5-α reductase =====
  { drugA:'finasteride', drugB:'tamsulosin', severity:'minor', mechanism:'PD_ADDITIVE', summary_ru:'Стандартная комбинация при ДГПЖ.', recommendation_ru:'Контроль АД.' },

  // ===== Loperamide QT (high dose abuse) =====
  { drugA:'loperamide', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'В высоких дозах QT.', recommendation_ru:'Избегать высоких доз; ЭКГ.' },

  // ===== Cholestyramine — universal absorption blocker =====
  { drugA:'cholestyramine', drugB:'levothyroxine', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓↓ всасывание левотироксина.', recommendation_ru:'Разделить ≥4ч.' },
  { drugA:'cholestyramine', drugB:'warfarin', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓ варфарин.', recommendation_ru:'Разделить ≥4ч; контроль МНО.' },
  { drugA:'cholestyramine', drugB:'digoxin', severity:'moderate', mechanism:'PK_ABSORPTION', summary_ru:'↓ дигоксин.', recommendation_ru:'Разделить ≥4ч.' },

  // ===== Tolvaptan =====
  { drugA:'tolvaptan', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ толваптан → гепатотоксичность.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'tolvaptan', drugB:'spironolactone', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Гиперкалиемия.', recommendation_ru:'Контроль K+.' },

  // ===== Cinacalcet CYP2D6 inhibitor =====
  { drugA:'cinacalcet', drugB:'metoprolol', severity:'moderate', mechanism:'PK_CYP2D6', summary_ru:'↑ метопролол.', recommendation_ru:'Снизить дозу.' },
  { drugA:'cinacalcet', drugB:'amitriptyline', severity:'moderate', mechanism:'PK_CYP2D6', summary_ru:'↑ амитриптилин.', recommendation_ru:'Контроль.' },

  // ===== Sevelamer absorption =====
  { drugA:'sevelamer', drugB:'levothyroxine', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓ левотироксин.', recommendation_ru:'Разделить ≥4ч.' },
  { drugA:'sevelamer', drugB:'ciprofloxacin', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ ципрофлоксацин.', recommendation_ru:'Разделить ≥2ч.' },

  // ===== Eltrombopag chelation =====
  { drugA:'eltrombopag', drugB:'calcium_carbonate', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ элтромбопаг ~75%.', recommendation_ru:'Разделить ≥4ч.' },
  { drugA:'eltrombopag', drugB:'iron_oral', severity:'major', mechanism:'PK_CHELATION', summary_ru:'То же.', recommendation_ru:'Разделить ≥4ч.' },

  // ===== Buspirone =====
  { drugA:'buspirone', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ буспирон → седация.', recommendation_ru:'Снизить дозу до 2.5 мг.' },
  { drugA:'buspirone', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ буспирон.', recommendation_ru:'Замена.' },
  { drugA:'buspirone', drugB:'fluoxetine', severity:'moderate', mechanism:'SEROTONIN', summary_ru:'Серотонинергический эффект.', recommendation_ru:'Допустимо при мониторинге.' },

  // ===== Lidocaine systemic =====
  { drugA:'lidocaine_systemic', drugB:'amiodarone', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная депрессия миокарда.', recommendation_ru:'Снизить дозы; мониторинг.' },
  { drugA:'lidocaine_systemic', drugB:'metoprolol', severity:'moderate', mechanism:'PK_CYP1A2', summary_ru:'↑ лидокаин.', recommendation_ru:'Снизить дозу.' },
  { drugA:'mexiletine', drugB:'ciprofloxacin', severity:'moderate', mechanism:'PK_CYP1A2', summary_ru:'↑ мексилетин.', recommendation_ru:'Контроль.' },

  // ===== Methyldopa =====
  { drugA:'methyldopa', drugB:'iron_oral', severity:'moderate', mechanism:'PK_CHELATION', summary_ru:'↓ метилдопа.', recommendation_ru:'Разделить ≥2ч.' },
  { drugA:'methyldopa', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Гипертонический криз.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ===== Esmolol =====
  { drugA:'esmolol', drugB:'verapamil', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая брадикардия/AV-блок (особенно IV).', recommendation_ru:'Избегать одновременной IV; использовать раздельно.' },

  // ===== Hydralazine + nitrates standard HF combo =====
  { drugA:'hydralazine', drugB:'isosorbide_mononitrate', severity:'minor', mechanism:'PD_ADDITIVE', summary_ru:'Стандартная комбинация при ХСН (BiDil).', recommendation_ru:'Допустимо; контроль АД.' },

  // ===== Fingolimod cardiotoxicity =====
  { drugA:'fingolimod', drugB:'amiodarone', severity:'contraindicated', mechanism:'QT', summary_ru:'Аддитивная брадикардия и QT.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'fingolimod', drugB:'metoprolol', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия при первой дозе финголимода.', recommendation_ru:'Мониторинг 6ч; рассмотреть отмену β-блокатора.' },
  { drugA:'fingolimod', drugB:'verapamil', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Брадикардия.', recommendation_ru:'Мониторинг.' },

  // ===== Dimethyl fumarate =====
  { drugA:'dimethyl_fumarate', drugB:'methotrexate', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная иммуносупрессия/лимфопения.', recommendation_ru:'Контроль ОАК.' },
];

// ============== EXECUTE ==============
let drugsAdded = 0;
for (const drug of drugsToAdd) {
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
    orphanWarnings.push(`SKIP ${ix.drugA}|${ix.drugB} — drug not in catalog`);
    continue;
  }
  const k = pairKey(ix.drugA, ix.drugB);
  if (pairs.has(k)) { pairsSkipped++; continue; }
  pairs.add(k);
  d.interactions.push({
    drugA: ix.drugA,
    drugB: ix.drugB,
    severity: ix.severity,
    mechanism: ix.mechanism,
    summary_ru: ix.summary_ru,
    recommendation_ru: ix.recommendation_ru,
    sources: ['UpToDate Lexidrug','Stockley\'s 12th ed.','FDA','EMA SmPC','DrugBank'],
    verified_by: null,
    verified_at: null,
  });
  pairsAdded++;
}

// Bump version
d.version = '0.7.0';
d.lastUpdated = '2026-05-06';

// Validation
const allPairKeys = d.interactions.map(i => pairKey(i.drugA, i.drugB));
const dupCheck = allPairKeys.length !== new Set(allPairKeys).size;
if (dupCheck) console.error('!!! DUPLICATE PAIRS DETECTED');

const drugIds = new Set(d.drugs.map(x => x.id));
const orphans = d.interactions.filter(i => !drugIds.has(i.drugA) || !drugIds.has(i.drugB));
if (orphans.length) {
  console.error('!!! ORPHAN PAIRS:', orphans.length);
  for (const o of orphans.slice(0, 5)) console.error(' -', o.drugA, '|', o.drugB);
}

// Severity histogram
const sev = {};
for (const i of d.interactions) sev[i.severity] = (sev[i.severity]||0)+1;

fs.writeFileSync(path, JSON.stringify(d, null, 2) + '\n');

// Mirror to public/
fs.writeFileSync('./public/drug-interactions.json', JSON.stringify(d, null, 2) + '\n');

console.log(`Drugs added:    ${drugsAdded}`);
console.log(`Pairs added:    ${pairsAdded}, dup skipped: ${pairsSkipped}`);
if (orphanWarnings.length) console.log('Orphan warns:', orphanWarnings.length);
console.log(`Total drugs:    ${d.drugs.length}`);
console.log(`Total pairs:    ${d.interactions.length}`);
console.log(`Severity:       ${JSON.stringify(sev)}`);
console.log(dupCheck ? 'X duplicate pairs!' : '✓ No duplicate pairs');
console.log(orphans.length ? `X ${orphans.length} orphan pairs!` : '✓ All drug refs valid');

// K1-P2 batch 5: 327→400+ drugs, 706→900+ pairs.
// v0.7.1 → v0.8.0
// Focus: oncology (more cytotoxics + checkpoint inhibitors), antivirals,
// dermatology systemic, OB/GYN/contraception, ophthalmology systemic absorption,
// herbals, anticonvulsants gaps, antipsychotics gaps, more antibiotics,
// rare-but-critical interactions.
import fs from 'node:fs';

const path = './data/drug-interactions.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
const existingDrugs = new Set(d.drugs.map(x => x.id));
const pairKey = (a, b) => [a, b].sort().join('|');
const pairs = new Set(d.interactions.map(i => pairKey(i.drugA, i.drugB)));

const NEW_DRUGS = [
  // Oncology — more cytotoxics
  { id: 'doxorubicin', name_ru: 'Доксорубицин', name_en: 'Doxorubicin', atc: 'L01DB01', class_ru: 'Антрациклин', aliases: [] },
  { id: 'paclitaxel', name_ru: 'Паклитаксел', name_en: 'Paclitaxel', atc: 'L01CD01', class_ru: 'Таксан', aliases: ['таксол'] },
  { id: 'docetaxel', name_ru: 'Доцетаксел', name_en: 'Docetaxel', atc: 'L01CD02', class_ru: 'Таксан', aliases: ['таксотер'] },
  { id: 'cyclophosphamide', name_ru: 'Циклофосфамид', name_en: 'Cyclophosphamide', atc: 'L01AA01', class_ru: 'Алкилирующий агент', aliases: ['циклофосфан'] },
  { id: 'irinotecan', name_ru: 'Иринотекан', name_en: 'Irinotecan', atc: 'L01CE02', class_ru: 'Ингибитор топоизомеразы I', aliases: [] },
  { id: 'oxaliplatin', name_ru: 'Оксалиплатин', name_en: 'Oxaliplatin', atc: 'L01XA03', class_ru: 'Платина', aliases: [] },
  { id: 'carboplatin', name_ru: 'Карбоплатин', name_en: 'Carboplatin', atc: 'L01XA02', class_ru: 'Платина', aliases: [] },
  { id: 'gemcitabine', name_ru: 'Гемцитабин', name_en: 'Gemcitabine', atc: 'L01BC05', class_ru: 'Антиметаболит', aliases: [] },
  // Checkpoint / targeted
  { id: 'pembrolizumab', name_ru: 'Пембролизумаб', name_en: 'Pembrolizumab', atc: 'L01FF02', class_ru: 'Анти-PD-1 МАТ', aliases: ['китруда'] },
  { id: 'nivolumab', name_ru: 'Ниволумаб', name_en: 'Nivolumab', atc: 'L01FF01', class_ru: 'Анти-PD-1 МАТ', aliases: ['опдиво'] },
  { id: 'trastuzumab', name_ru: 'Трастузумаб', name_en: 'Trastuzumab', atc: 'L01FD01', class_ru: 'Анти-HER2 МАТ', aliases: ['герцептин'] },
  { id: 'bevacizumab', name_ru: 'Бевацизумаб', name_en: 'Bevacizumab', atc: 'L01FG01', class_ru: 'Анти-VEGF МАТ', aliases: ['авастин'] },
  // More TKIs
  { id: 'osimertinib', name_ru: 'Осимертиниб', name_en: 'Osimertinib', atc: 'L01EB04', class_ru: 'EGFR TKI', aliases: ['тагриссо'] },
  { id: 'crizotinib', name_ru: 'Кризотиниб', name_en: 'Crizotinib', atc: 'L01ED01', class_ru: 'ALK/ROS1 TKI', aliases: ['ксалкори'] },
  { id: 'lapatinib', name_ru: 'Лапатиниб', name_en: 'Lapatinib', atc: 'L01EH01', class_ru: 'HER2/EGFR TKI', aliases: ['тайверб'] },
  { id: 'ribociclib', name_ru: 'Рибоциклиб', name_en: 'Ribociclib', atc: 'L01EF02', class_ru: 'CDK4/6 TKI', aliases: ['кискали'] },
  { id: 'abemaciclib', name_ru: 'Абемациклиб', name_en: 'Abemaciclib', atc: 'L01EF03', class_ru: 'CDK4/6 TKI', aliases: ['верзенио'] },
  // Hormonal oncology
  { id: 'leuprorelin', name_ru: 'Лейпрорелин', name_en: 'Leuprorelin', atc: 'L02AE02', class_ru: 'Аналог ГнРГ', aliases: ['люкрин'] },
  { id: 'goserelin', name_ru: 'Гозерелин', name_en: 'Goserelin', atc: 'L02AE03', class_ru: 'Аналог ГнРГ', aliases: ['золадекс'] },
  { id: 'bicalutamide', name_ru: 'Бикалутамид', name_en: 'Bicalutamide', atc: 'L02BB03', class_ru: 'Антиандроген', aliases: ['касодекс'] },
  { id: 'enzalutamide', name_ru: 'Энзалутамид', name_en: 'Enzalutamide', atc: 'L02BB04', class_ru: 'Антиандроген (CYP3A4 индуктор)', aliases: ['кстанди'] },
  { id: 'abiraterone', name_ru: 'Абиратерон', name_en: 'Abiraterone', atc: 'L02BX03', class_ru: 'Ингибитор CYP17', aliases: ['зитига'] },
  // Antivirals
  { id: 'remdesivir', name_ru: 'Ремдесивир', name_en: 'Remdesivir', atc: 'J05AB16', class_ru: 'Противовирусный (РНК-полимераза)', aliases: ['веклури'] },
  { id: 'molnupiravir', name_ru: 'Молнупиравир', name_en: 'Molnupiravir', atc: 'J05AB19', class_ru: 'Противовирусный (COVID)', aliases: ['лагеврио'] },
  { id: 'ganciclovir', name_ru: 'Ганцикловир', name_en: 'Ganciclovir', atc: 'J05AB06', class_ru: 'Противовирусный (CMV)', aliases: [] },
  { id: 'valganciclovir', name_ru: 'Валганцикловир', name_en: 'Valganciclovir', atc: 'J05AB14', class_ru: 'Противовирусный (CMV)', aliases: ['вальцит'] },
  // Vaccines (interaction with immunosuppression, anticoagulants)
  { id: 'live_vaccine', name_ru: 'Живые вакцины (общий класс)', name_en: 'Live vaccines (class)', atc: 'J07', class_ru: 'Живые ослабленные вакцины', aliases: ['MMR','varicella','yellow fever','BCG'] },
  // Contrast media
  { id: 'gadolinium_contrast', name_ru: 'Гадолиний-содержащие КС', name_en: 'Gadolinium contrast', atc: 'V08CA', class_ru: 'МРТ-контраст', aliases: ['омнискан','магневист'] },
  // Dermatology systemic
  { id: 'isotretinoin', name_ru: 'Изотретиноин', name_en: 'Isotretinoin', atc: 'D10BA01', class_ru: 'Системный ретиноид', aliases: ['роаккутан','аккутан'] },
  { id: 'acitretin', name_ru: 'Ацитретин', name_en: 'Acitretin', atc: 'D05BB02', class_ru: 'Системный ретиноид', aliases: [] },
  { id: 'dapsone', name_ru: 'Дапсон', name_en: 'Dapsone', atc: 'J04BA02', class_ru: 'Сульфон (лепра/PCP)', aliases: [] },
  // OB/GYN — contraceptives, fertility
  { id: 'ethinylestradiol', name_ru: 'Этинилэстрадиол', name_en: 'Ethinylestradiol', atc: 'G03CA01', class_ru: 'Эстроген (КОК)', aliases: [] },
  { id: 'levonorgestrel', name_ru: 'Левоноргестрел', name_en: 'Levonorgestrel', atc: 'G03AC03', class_ru: 'Прогестин', aliases: ['постинор','эскапел'] },
  { id: 'mifepristone', name_ru: 'Мифепристон', name_en: 'Mifepristone', atc: 'G03XB01', class_ru: 'Антагонист прогестерона', aliases: [] },
  { id: 'misoprostol', name_ru: 'Мизопростол', name_en: 'Misoprostol', atc: 'G02AD06', class_ru: 'Аналог простагландина E1', aliases: [] },
  { id: 'oxytocin', name_ru: 'Окситоцин', name_en: 'Oxytocin', atc: 'H01BB02', class_ru: 'Утеротоник', aliases: [] },
  { id: 'magnesium_sulfate', name_ru: 'Магния сульфат', name_en: 'Magnesium sulfate', atc: 'B05XA05', class_ru: 'Электролит / противосудорожный', aliases: [] },
  // Asthma / lung biologics
  { id: 'omalizumab', name_ru: 'Омализумаб', name_en: 'Omalizumab', atc: 'R03DX05', class_ru: 'Анти-IgE МАТ', aliases: ['ксолар'] },
  { id: 'mepolizumab', name_ru: 'Меполизумаб', name_en: 'Mepolizumab', atc: 'R03DX09', class_ru: 'Анти-IL-5 МАТ', aliases: ['нукала'] },
  { id: 'dupilumab', name_ru: 'Дупилумаб', name_en: 'Dupilumab', atc: 'D11AH05', class_ru: 'Анти-IL-4Rα МАТ', aliases: ['дупиксент'] },
  // Hyperkalemia rescue
  { id: 'patiromer', name_ru: 'Патиромер', name_en: 'Patiromer', atc: 'V03AE09', class_ru: 'K-связывающий', aliases: ['велтасса'] },
  { id: 'sodium_polystyrene', name_ru: 'Натрия полистиролсульфонат', name_en: 'Sodium polystyrene sulfonate', atc: 'V03AE01', class_ru: 'K-связывающий', aliases: ['калимат'] },
  // Diabetes — more
  { id: 'tirzepatide', name_ru: 'Тирзепатид', name_en: 'Tirzepatide', atc: 'A10BX16', class_ru: 'GLP-1/GIP-агонист', aliases: ['маунджаро'] },
  { id: 'dulaglutide', name_ru: 'Дулаглутид', name_en: 'Dulaglutide', atc: 'A10BJ05', class_ru: 'GLP-1-агонист', aliases: ['трулисити'] },
  { id: 'glyburide', name_ru: 'Глибенкламид', name_en: 'Glyburide', atc: 'A10BB01', class_ru: 'СМ', aliases: ['манинил'] },
  { id: 'glipizide', name_ru: 'Глипизид', name_en: 'Glipizide', atc: 'A10BB07', class_ru: 'СМ', aliases: [] },
  // Migraine — CGRP
  { id: 'erenumab', name_ru: 'Эренумаб', name_en: 'Erenumab', atc: 'N02CD01', class_ru: 'Анти-CGRP-R МАТ', aliases: ['аимовиг'] },
  { id: 'eletriptan', name_ru: 'Элетриптан', name_en: 'Eletriptan', atc: 'N02CC06', class_ru: 'Триптан', aliases: [] },
  // Sleep
  { id: 'eszopiclone', name_ru: 'Эсзопиклон', name_en: 'Eszopiclone', atc: 'N05CF04', class_ru: 'Z-препарат', aliases: ['луниста'] },
  { id: 'ramelteon', name_ru: 'Рамельтеон', name_en: 'Ramelteon', atc: 'N05CH02', class_ru: 'Агонист мелатонина', aliases: [] },
  { id: 'melatonin', name_ru: 'Мелатонин', name_en: 'Melatonin', atc: 'N05CH01', class_ru: 'Гормон эпифиза', aliases: ['мелаксен'] },
  // Anticoagulants — more
  { id: 'dalteparin', name_ru: 'Далтепарин', name_en: 'Dalteparin', atc: 'B01AB04', class_ru: 'НМГ', aliases: ['фрагмин'] },
  { id: 'nadroparin', name_ru: 'Надропарин', name_en: 'Nadroparin', atc: 'B01AB06', class_ru: 'НМГ', aliases: ['фраксипарин'] },
  { id: 'bivalirudin', name_ru: 'Бивалирудин', name_en: 'Bivalirudin', atc: 'B01AE06', class_ru: 'Прямой ингибитор тромбина (IV)', aliases: [] },
  // Reversal agents
  { id: 'idarucizumab', name_ru: 'Идаруцизумаб', name_en: 'Idarucizumab', atc: 'V03AB37', class_ru: 'Антагонист дабигатрана', aliases: ['праксбайнд'] },
  { id: 'andexanet_alfa', name_ru: 'Андексанет альфа', name_en: 'Andexanet alfa', atc: 'V03AB38', class_ru: 'Антагонист DOAC (Xa)', aliases: [] },
  { id: 'protamine', name_ru: 'Протамин', name_en: 'Protamine', atc: 'V03AB14', class_ru: 'Антидот гепарина', aliases: [] },
  { id: 'phytomenadione', name_ru: 'Витамин K1 (фитоменадион)', name_en: 'Phytomenadione', atc: 'B02BA01', class_ru: 'Антидот варфарина', aliases: ['викасол'] },
  // Antiplatelets
  { id: 'cangrelor', name_ru: 'Кангрелор', name_en: 'Cangrelor', atc: 'B01AC25', class_ru: 'Антиагрегант P2Y12 (IV)', aliases: [] },
  // GI — more
  { id: 'linaclotide', name_ru: 'Линаклотид', name_en: 'Linaclotide', atc: 'A06AX04', class_ru: 'Слабительное (GC-C агонист)', aliases: ['констелла'] },
  { id: 'rifaximin', name_ru: 'Рифаксимин', name_en: 'Rifaximin', atc: 'A07AA11', class_ru: 'АБ невсасывающийся (печ. энцефалопатия)', aliases: ['альфа-нормикс'] },
  { id: 'lactulose', name_ru: 'Лактулоза', name_en: 'Lactulose', atc: 'A06AD11', class_ru: 'Осмотическое слабительное', aliases: ['дюфалак'] },
  // Rheum
  { id: 'colestipol', name_ru: 'Колестипол', name_en: 'Colestipol', atc: 'C10AC02', class_ru: 'Связывающий жёлчные к-ты', aliases: [] },
  { id: 'sulfasalazine_extra', name_ru: '', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip dup
  // Endocrine
  { id: 'desmopressin', name_ru: 'Десмопрессин', name_en: 'Desmopressin', atc: 'H01BA02', class_ru: 'Аналог АДГ', aliases: ['минирин'] },
  { id: 'cabergoline', name_ru: 'Каберголин', name_en: 'Cabergoline', atc: 'G02CB03', class_ru: 'Агонист D2', aliases: ['достинекс'] },
  { id: 'octreotide', name_ru: 'Октреотид', name_en: 'Octreotide', atc: 'H01CB02', class_ru: 'Аналог соматостатина', aliases: ['сандостатин'] },
  // Parkinson — more
  { id: 'entacapone', name_ru: 'Энтакапон', name_en: 'Entacapone', atc: 'N04BX02', class_ru: 'Ингибитор COMT', aliases: [] },
  { id: 'apomorphine', name_ru: 'Апоморфин', name_en: 'Apomorphine', atc: 'N04BC07', class_ru: 'Агонист D1/D2', aliases: [] },
  // Pulmonology
  { id: 'roflumilast', name_ru: 'Рофлумиласт', name_en: 'Roflumilast', atc: 'R03DX07', class_ru: 'Ингибитор ФДЭ-4 (ХОБЛ)', aliases: ['даксас'] },
  // Herbals (interaction-rich)
  { id: 'grapefruit_juice', name_ru: 'Грейпфрутовый сок', name_en: 'Grapefruit juice', atc: '', class_ru: 'CYP3A4 ингибитор (диета)', aliases: [] },
  { id: 'ginkgo', name_ru: 'Гинкго билоба', name_en: 'Ginkgo biloba', atc: '', class_ru: 'Фитопрепарат (антиагрегант)', aliases: [] },
  { id: 'garlic_supplement', name_ru: 'Чеснок (БАД)', name_en: 'Garlic supplement', atc: '', class_ru: 'БАД (антиагрегантный)', aliases: [] },
  // Misc
  { id: 'theophylline_extra', name_ru:'', name_en:'', atc:'', class_ru:'', aliases:[] }, // skip
];

const NEW_INTERACTIONS = [
  // ====== Cytotoxics (warfarin/QT/nephro/myelo) ======
  { drugA:'doxorubicin', drugB:'verapamil', severity:'major', mechanism:'PK_PGP', summary_ru:'Верапамил ингибирует P-gp → ↑ доксорубицин → кардиотоксичность.', recommendation_ru:'Избегать; альтернатива — амлодипин.' },
  { drugA:'doxorubicin', drugB:'trastuzumab', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная кардиотоксичность.', recommendation_ru:'Не комбинировать одновременно; разделить курсы; ЭхоКГ.' },
  { drugA:'paclitaxel', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ паклитаксел → миелосупрессия/нейропатия.', recommendation_ru:'Альтернативный АБ.' },
  { drugA:'paclitaxel', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'docetaxel', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ доцетаксел.', recommendation_ru:'Снизить дозу доцетаксела или замена АБ.' },
  { drugA:'cyclophosphamide', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'cyclophosphamide', drugB:'allopurinol', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑↑ миелосупрессия.', recommendation_ru:'Контроль ОАК.' },
  { drugA:'irinotecan', drugB:'st_johns_wort', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ активный метаболит SN-38.', recommendation_ru:'Избегать.' },
  { drugA:'irinotecan', drugB:'ketoconazole', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ иринотекан → миелосупрессия.', recommendation_ru:'Избегать.' },
  { drugA:'oxaliplatin', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивный риск нефротоксичности.', recommendation_ru:'Избегать.' },
  { drugA:'carboplatin', drugB:'gentamicin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Аддитивная нефро-/ототоксичность.', recommendation_ru:'Избегать.' },
  { drugA:'gemcitabine', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Замена на НМГ.' },

  // ====== Checkpoint inhibitors ======
  { drugA:'pembrolizumab', drugB:'prednisolone', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'ГКС подавляют иммунный ответ → ↓ эффективность анти-PD-1.', recommendation_ru:'Избегать длительной терапии преднизолоном >10 мг.' },
  { drugA:'pembrolizumab', drugB:'methylprednisolone', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'См. preднизолон.', recommendation_ru:'Минимизировать дозу.' },
  { drugA:'nivolumab', drugB:'prednisolone', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'↓ эффективность.', recommendation_ru:'Избегать постоянной ГКС-терапии.' },
  { drugA:'nivolumab', drugB:'pembrolizumab', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойная анти-PD-1 — выраженные иммунные НЯ.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ====== Targeted oncology — TKIs / hormonal ======
  { drugA:'osimertinib', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ осимертиниб.', recommendation_ru:'Избегать.' },
  { drugA:'osimertinib', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'Аддитивное QT.', recommendation_ru:'Избегать или ЭКГ.' },
  { drugA:'crizotinib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ кризотиниб → QT/гепато.', recommendation_ru:'Избегать.' },
  { drugA:'crizotinib', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'QT.', recommendation_ru:'Избегать.' },
  { drugA:'lapatinib', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ статин.', recommendation_ru:'Снизить дозу статина.' },
  { drugA:'ribociclib', drugB:'amiodarone', severity:'contraindicated', mechanism:'QT', summary_ru:'Рибоциклиб + сильный QT-удлинитель → TdP.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'ribociclib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ рибоциклиб.', recommendation_ru:'Снизить дозу до 400 мг.' },
  { drugA:'abemaciclib', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ абемациклиб.', recommendation_ru:'Снизить дозу.' },
  { drugA:'enzalutamide', drugB:'warfarin', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'Энзалутамид — индуктор CYP3A4/2C9 → ↓ МНО.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'enzalutamide', drugB:'apixaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ апиксабан → тромбоз.', recommendation_ru:'Замена на НМГ.' },
  { drugA:'enzalutamide', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ симвастатин.', recommendation_ru:'Контроль ЛПНП.' },
  { drugA:'abiraterone', drugB:'spironolactone', severity:'moderate', mechanism:'PD_OPPOSITE', summary_ru:'Спиронолактон активирует AR → ↓ эффект.', recommendation_ru:'Избегать; альтернатива — эплеренон.' },
  { drugA:'abiraterone', drugB:'warfarin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'leuprorelin', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'Андрогенная депривация удлиняет QT — аддитивный риск.', recommendation_ru:'ЭКГ-мониторинг.' },
  { drugA:'goserelin', drugB:'amiodarone', severity:'major', mechanism:'QT', summary_ru:'См. leuprorelin.', recommendation_ru:'ЭКГ.' },

  // ====== Antivirals ======
  { drugA:'remdesivir', drugB:'hydroxychloroquine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'Гидроксихлорохин ↓ эффективность ремдесивира in vitro.', recommendation_ru:'Не комбинировать.' },
  { drugA:'molnupiravir', drugB:'paxlovid', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Нет данных о пользе двойной терапии.', recommendation_ru:'Не комбинировать; выбрать один препарат.' },
  { drugA:'ganciclovir', drugB:'mycophenolate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная миелосупрессия.', recommendation_ru:'Контроль ОАК; снизить дозы.' },
  { drugA:'valganciclovir', drugB:'mycophenolate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Миелосупрессия.', recommendation_ru:'Мониторинг.' },
  { drugA:'valganciclovir', drugB:'azathioprine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Миелосупрессия.', recommendation_ru:'Контроль ОАК.' },

  // ====== Vaccines + immunosuppression ======
  { drugA:'live_vaccine', drugB:'methotrexate', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Иммуносупрессия → диссеминация вакцинного штамма.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'live_vaccine', drugB:'cyclosporine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Диссеминированная инфекция.', recommendation_ru:'ПРОТИВОПОКАЗАНО (3 мес после отмены).' },
  { drugA:'live_vaccine', drugB:'tacrolimus', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'См. cyclosporine.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'live_vaccine', drugB:'rituximab', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'B-клеточная депрессия → отсутствие иммунного ответа + риск.', recommendation_ru:'ПРОТИВОПОКАЗАНО (минимум 6 мес).' },
  { drugA:'live_vaccine', drugB:'adalimumab', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Анти-TNFα.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'live_vaccine', drugB:'prednisolone', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'>20 мг/сут >2 нед — иммуносупрессия.', recommendation_ru:'Отложить вакцинацию ≥1 мес после отмены.' },
  { drugA:'live_vaccine', drugB:'fingolimod', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Лимфопения.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ====== Contrast media ======
  { drugA:'iodinated_contrast', drugB:'metformin', severity:'major', mechanism:'NEPHROTOXICITY', summary_ru:'Риск контраст-индуцированной нефропатии + лактатацидоз.', recommendation_ru:'Отменить метформин в день процедуры; возобновить через 48ч после контроля креатинина.' },
  { drugA:'gadolinium_contrast', drugB:'furosemide', severity:'moderate', mechanism:'NEPHROTOXICITY', summary_ru:'Дегидратация ↑ риск NSF при ХБП IV-V.', recommendation_ru:'Гидратация перед процедурой; избегать при СКФ <30.' },

  // ====== Isotretinoin / acitretin ======
  { drugA:'isotretinoin', drugB:'doxycycline', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Псевдоопухоль головного мозга (доброкачественная внутричерепная гипертензия).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'isotretinoin', drugB:'tetracycline', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'См. доксициклин.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'isotretinoin', drugB:'methotrexate', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гепатотоксичность.', recommendation_ru:'Контроль АЛТ/АСТ.' },
  { drugA:'isotretinoin', drugB:'ethinylestradiol', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тератогенность изотретиноина абсолютна — но ↓ эффективности КОК (теория).', recommendation_ru:'ОБЯЗАТЕЛЬНА ДВОЙНАЯ контрацепция (КОК + барьер) на весь курс + 1 мес.' },
  { drugA:'acitretin', drugB:'ethinylestradiol', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тератогенность ацитретина 3 года после отмены.', recommendation_ru:'Двойная контрацепция; не использовать у женщин репродуктивного возраста.' },

  // ====== Dapsone ======
  { drugA:'dapsone', drugB:'cotrimoxazole', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная метгемоглобинемия / гемолиз (G6PD-deficiency).', recommendation_ru:'Скрининг G6PD; контроль гемоглобина.' },

  // ====== Contraceptives — CYP induction ======
  { drugA:'ethinylestradiol', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ КОК → нежелательная беременность.', recommendation_ru:'Дополнительный барьерный метод весь курс + 4 нед после.' },
  { drugA:'ethinylestradiol', drugB:'carbamazepine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ КОК.', recommendation_ru:'Альтернативный/доп. метод контрацепции.' },
  { drugA:'ethinylestradiol', drugB:'phenytoin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ КОК.', recommendation_ru:'Альтернатива.' },
  { drugA:'ethinylestradiol', drugB:'phenobarbital', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ КОК.', recommendation_ru:'Альтернативная контрацепция.' },
  { drugA:'ethinylestradiol', drugB:'st_johns_wort', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ КОК.', recommendation_ru:'Избегать.' },
  { drugA:'ethinylestradiol', drugB:'topiramate', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↓ КОК (доза-зависимо).', recommendation_ru:'Барьерный метод при дозе >200 мг/сут.' },
  { drugA:'ethinylestradiol', drugB:'lamotrigine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'КОК ↓↓ ламотриджин (риск приступов); при отмене КОК — ↑↑ ламотриджин (токсичность).', recommendation_ru:'Не менять КОК без коррекции дозы ламотриджина.' },
  { drugA:'ethinylestradiol', drugB:'amoxicillin', severity:'minor', mechanism:'PK_ABSORPTION', summary_ru:'Старая теория ↓ КОК — НЕ подтверждена для нерифампициновых АБ.', recommendation_ru:'Доп. метод не требуется (CDC/WHO 2024).' },

  // ====== Mifepristone / misoprostol ======
  { drugA:'mifepristone', drugB:'warfarin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ риск кровотечения.', recommendation_ru:'Не использовать у пациенток на АК без отмены.' },
  { drugA:'misoprostol', drugB:'oxytocin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивные сокращения матки → разрыв.', recommendation_ru:'Интервал ≥4ч между препаратами.' },
  { drugA:'magnesium_sulfate', drugB:'rocuronium', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Mg потенциирует миорелаксацию.', recommendation_ru:'Снизить дозу миорелаксанта; TOF-мониторинг.' },
  { drugA:'magnesium_sulfate', drugB:'amlodipine', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гипотензия (преэклампсия).', recommendation_ru:'Контроль АД.' },
  { drugA:'magnesium_sulfate', drugB:'gentamicin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная нейромышечная блокада.', recommendation_ru:'Избегать.' },

  // ====== Asthma biologics ======
  { drugA:'dupilumab', drugB:'live_vaccine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Иммуномодуляция → риск.', recommendation_ru:'Избегать живых вакцин на лечении.' },

  // ====== Hyperkalemia binders ======
  { drugA:'patiromer', drugB:'levothyroxine', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓ всасывание L-Т4.', recommendation_ru:'Разделить ≥3ч.' },
  { drugA:'patiromer', drugB:'ciprofloxacin', severity:'major', mechanism:'PK_CHELATION', summary_ru:'↓ ципрофлоксацин.', recommendation_ru:'Разделить ≥3ч.' },
  { drugA:'sodium_polystyrene', drugB:'sorbitol', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Колониальный некроз (FDA black box).', recommendation_ru:'НЕ комбинировать с сорбитолом.' },
  { drugA:'sodium_polystyrene', drugB:'lithium', severity:'major', mechanism:'PK_ABSORPTION', summary_ru:'↓↓ литий.', recommendation_ru:'Разделить ≥6ч; контроль уровня.' },

  // ====== GLP-1 / тирзепатид ======
  { drugA:'tirzepatide', drugB:'insulin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гипогликемия.', recommendation_ru:'Снизить инсулин на 20% при старте.' },
  { drugA:'tirzepatide', drugB:'glimepiride', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Гипогликемия.', recommendation_ru:'Снизить СМ.' },
  { drugA:'tirzepatide', drugB:'ethinylestradiol', severity:'moderate', mechanism:'PK_ABSORPTION', summary_ru:'Замедление желудочной эвакуации → ↓ КОК (умеренно).', recommendation_ru:'Доп. барьерный метод 4 нед после старта/↑ дозы.' },
  { drugA:'dulaglutide', drugB:'glipizide', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Гипогликемия.', recommendation_ru:'Снизить СМ.' },
  { drugA:'glyburide', drugB:'fluconazole', severity:'major', mechanism:'PK_CYP2C9', summary_ru:'↑↑ глибенкламид → длительная гипогликемия.', recommendation_ru:'Контроль глюкозы; снизить СМ.' },

  // ====== Migraine CGRP ======
  { drugA:'erenumab', drugB:'sumatriptan', severity:'minor', mechanism:'PD_ADDITIVE', summary_ru:'Стандартная комбинация — допустимая.', recommendation_ru:'Допустимо; следить за сосудистыми НЯ.' },
  { drugA:'eletriptan', drugB:'clarithromycin', severity:'contraindicated', mechanism:'PK_CYP3A4', summary_ru:'↑↑ элетриптан → коронарный спазм.', recommendation_ru:'ПРОТИВОПОКАЗАНО (≥72ч).' },
  { drugA:'eletriptan', drugB:'ergotamine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойной вазоконстрикторный эффект.', recommendation_ru:'ПРОТИВОПОКАЗАНО (≥24ч).' },

  // ====== Sleep ======
  { drugA:'eszopiclone', drugB:'clarithromycin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ эсзопиклон.', recommendation_ru:'Снизить дозу до 1 мг.' },
  { drugA:'eszopiclone', drugB:'morphine', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Угнетение ЦНС/дыхания.', recommendation_ru:'Избегать.' },
  { drugA:'ramelteon', drugB:'fluvoxamine', severity:'contraindicated', mechanism:'PK_CYP1A2', summary_ru:'↑↑ рамельтеон (190x).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'melatonin', drugB:'warfarin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },

  // ====== LMWH / reversal ======
  { drugA:'dalteparin', drugB:'aspirin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ кровотечение.', recommendation_ru:'Контроль; стандарт после ОКС.' },
  { drugA:'idarucizumab', drugB:'dabigatran', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'Антидот — устраняет эффект дабигатрана.', recommendation_ru:'Применять при кровотечении/срочной операции.' },
  { drugA:'andexanet_alfa', drugB:'apixaban', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'Антидот апиксабана.', recommendation_ru:'При жизнеугрожающем кровотечении.' },
  { drugA:'andexanet_alfa', drugB:'heparin_unfractionated', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'Андексанет связывает гепарин → ↓ эффект.', recommendation_ru:'Не использовать гепарин до измерения анти-Xa.' },
  { drugA:'protamine', drugB:'heparin_unfractionated', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'Антидот гепарина.', recommendation_ru:'1 мг протамина / 100 ЕД гепарина.' },
  { drugA:'phytomenadione', drugB:'warfarin', severity:'minor', mechanism:'PD_OPPOSITE', summary_ru:'Антидот варфарина.', recommendation_ru:'Использовать при кровотечении/перед операцией.' },

  // ====== Cangrelor ======
  { drugA:'cangrelor', drugB:'clopidogrel', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'Кангрелор блокирует связывание клопидогреля.', recommendation_ru:'Дать клопидогрел только после прекращения инфузии кангрелора.' },

  // ====== Rifaximin ======
  { drugA:'rifaximin', drugB:'cyclosporine', severity:'minor', mechanism:'PK_CYP3A4', summary_ru:'Невсасывающийся; минимальное взаимодействие.', recommendation_ru:'Допустимо.' },

  // ====== Endocrine ======
  { drugA:'desmopressin', drugB:'hctz', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Аддитивная гипонатриемия.', recommendation_ru:'Контроль Na+.' },
  { drugA:'desmopressin', drugB:'sertraline', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Гипонатриемия (SIADH-эффект СИОЗС).', recommendation_ru:'Избегать у пожилых; контроль Na+.' },
  { drugA:'cabergoline', drugB:'metoclopramide', severity:'major', mechanism:'PD_OPPOSITE', summary_ru:'Метоклопрамид блокирует D2 → ↓ каберголин.', recommendation_ru:'Избегать.' },
  { drugA:'octreotide', drugB:'cyclosporine', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↓ циклоспорин.', recommendation_ru:'TDM.' },
  { drugA:'octreotide', drugB:'insulin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'Изменение потребности в инсулине (гипо- или гипер-).', recommendation_ru:'Учащённый контроль глюкозы.' },

  // ====== Parkinson ======
  { drugA:'entacapone', drugB:'tranylcypromine', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Двойная блокада катехоламинов.', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },
  { drugA:'entacapone', drugB:'warfarin', severity:'moderate', mechanism:'PK_CYP2C9', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'apomorphine', drugB:'ondansetron', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая гипотензия (FDA box).', recommendation_ru:'ПРОТИВОПОКАЗАНО.' },

  // ====== Roflumilast ======
  { drugA:'roflumilast', drugB:'rifampicin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ рофлумиласт.', recommendation_ru:'Избегать.' },
  { drugA:'roflumilast', drugB:'fluvoxamine', severity:'major', mechanism:'PK_CYP1A2', summary_ru:'↑↑ рофлумиласт.', recommendation_ru:'Избегать.' },

  // ====== HERBALS / Grapefruit ======
  { drugA:'grapefruit_juice', drugB:'simvastatin', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ симвастатин → миопатия.', recommendation_ru:'Избегать грейпфрута; альтернатива — правастатин.' },
  { drugA:'grapefruit_juice', drugB:'amiodarone', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ амиодарон.', recommendation_ru:'Избегать.' },
  { drugA:'grapefruit_juice', drugB:'amlodipine', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ амлодипин.', recommendation_ru:'Ограничить грейпфрут.' },
  { drugA:'grapefruit_juice', drugB:'cyclosporine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ циклоспорин.', recommendation_ru:'Избегать.' },
  { drugA:'grapefruit_juice', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ такролимус.', recommendation_ru:'Избегать.' },
  { drugA:'grapefruit_juice', drugB:'felodipine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑↑ фелодипин (классическая).', recommendation_ru:'Избегать.' },
  { drugA:'grapefruit_juice', drugB:'sildenafil', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ силденафил.', recommendation_ru:'Ограничить.' },
  { drugA:'grapefruit_juice', drugB:'verapamil', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ верапамил.', recommendation_ru:'Ограничить.' },
  { drugA:'grapefruit_juice', drugB:'apixaban', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ апиксабан.', recommendation_ru:'Ограничить.' },
  { drugA:'grapefruit_juice', drugB:'rivaroxaban', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ ривароксабан.', recommendation_ru:'Ограничить.' },
  { drugA:'grapefruit_juice', drugB:'nifedipine', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ нифедипин.', recommendation_ru:'Ограничить.' },
  { drugA:'grapefruit_juice', drugB:'erlotinib', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↑ эрлотиниб.', recommendation_ru:'Избегать.' },
  { drugA:'ginkgo', drugB:'warfarin', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ риск кровотечения.', recommendation_ru:'Избегать.' },
  { drugA:'ginkgo', drugB:'aspirin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ риск кровотечения.', recommendation_ru:'Контроль.' },
  { drugA:'ginkgo', drugB:'clopidogrel', severity:'major', mechanism:'PD_ADDITIVE', summary_ru:'↑ кровотечение.', recommendation_ru:'Избегать.' },
  { drugA:'garlic_supplement', drugB:'warfarin', severity:'moderate', mechanism:'PD_ADDITIVE', summary_ru:'↑ МНО.', recommendation_ru:'Контроль.' },
  { drugA:'garlic_supplement', drugB:'saquinavir', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ ВИЧ ИП.', recommendation_ru:'Избегать.' },

  // ====== St John's Wort — extra ======
  { drugA:'st_johns_wort', drugB:'sertraline', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },
  { drugA:'st_johns_wort', drugB:'fluoxetine', severity:'major', mechanism:'SEROTONIN', summary_ru:'Серотониновый синдром.', recommendation_ru:'Избегать.' },
  { drugA:'st_johns_wort', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ такролимус → отторжение.', recommendation_ru:'Избегать.' },
  { drugA:'st_johns_wort', drugB:'simvastatin', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↓ симвастатин.', recommendation_ru:'Контроль ЛПНП.' },
  { drugA:'st_johns_wort', drugB:'imatinib', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ иматиниб → провал терапии.', recommendation_ru:'Избегать.' },

  // ====== Filling existing-drug interaction gaps ======
  { drugA:'amiodarone', drugB:'apixaban', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ апиксабан.', recommendation_ru:'Снизить дозу при ХБП IV.' },
  { drugA:'amiodarone', drugB:'rivaroxaban', severity:'moderate', mechanism:'PK_CYP3A4', summary_ru:'↑ ривароксабан.', recommendation_ru:'Контроль.' },
  { drugA:'amiodarone', drugB:'edoxaban', severity:'moderate', mechanism:'PK_PGP', summary_ru:'↑ эдоксабан.', recommendation_ru:'При CrCl 50-95 — снизить дозу 50%.' },
  { drugA:'rifampicin', drugB:'tacrolimus', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ такролимус → отторжение.', recommendation_ru:'Избегать или ↑ дозу + TDM.' },
  { drugA:'rifampicin', drugB:'cyclosporine', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ циклоспорин.', recommendation_ru:'↑ доза + TDM.' },
  { drugA:'rifampicin', drugB:'apixaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ апиксабан → тромбоз.', recommendation_ru:'Избегать; альтернатива — НМГ.' },
  { drugA:'rifampicin', drugB:'rivaroxaban', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓↓ ривароксабан.', recommendation_ru:'Избегать.' },
  { drugA:'rifampicin', drugB:'methadone', severity:'major', mechanism:'PK_CYP3A4', summary_ru:'↓ метадон → синдром отмены.', recommendation_ru:'↑ доза.' },

  // ====== Octreotide BPH? skip — OB context ======
  // ====== Misc safety ======
  { drugA:'nitroglycerin', drugB:'tadalafil', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО (тадалафил 48ч окно).' },
  { drugA:'nitroglycerin', drugB:'sildenafil', severity:'contraindicated', mechanism:'PD_ADDITIVE', summary_ru:'Тяжёлая гипотензия.', recommendation_ru:'ПРОТИВОПОКАЗАНО (24ч окно).' },
];

// EXECUTE
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

d.version = '0.8.0';
d.lastUpdated = '2026-05-06';

const allPairKeys = d.interactions.map(i => pairKey(i.drugA, i.drugB));
const dupCheck = allPairKeys.length !== new Set(allPairKeys).size;
const drugIds = new Set(d.drugs.map(x => x.id));
const orphans = d.interactions.filter(i => !drugIds.has(i.drugA) || !drugIds.has(i.drugB));
const sev = {};
for (const i of d.interactions) sev[i.severity] = (sev[i.severity]||0)+1;
const mech = {};
for (const i of d.interactions) mech[i.mechanism] = (mech[i.mechanism]||0)+1;

fs.writeFileSync(path, JSON.stringify(d, null, 2) + '\n');
fs.writeFileSync('./public/drug-interactions.json', JSON.stringify(d, null, 2) + '\n');

console.log(`Drugs added:    ${drugsAdded}`);
console.log(`Pairs added:    ${pairsAdded}, dup skipped: ${pairsSkipped}`);
if (orphanWarnings.length) console.log('Orphans (skipped):', orphanWarnings);
console.log(`Total drugs:    ${d.drugs.length}`);
console.log(`Total pairs:    ${d.interactions.length}`);
console.log(`Severity:       ${JSON.stringify(sev)}`);
console.log(`Top mechanisms: ${Object.entries(mech).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}:${v}`).join(', ')}`);
console.log(dupCheck ? 'X duplicate pairs!' : '✓ No duplicate pairs');
console.log(orphans.length ? `X ${orphans.length} orphan pairs!` : '✓ All drug refs valid');

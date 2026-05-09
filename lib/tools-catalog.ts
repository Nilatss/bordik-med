/**
 * Comprehensive catalog of clinical tools, scales, calculators and protocols.
 * Based on the global medical reference (22 sections, 500+ tools).
 * Structure: id, title, description, category, subcategory, available.
 */

export interface CatalogTool {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  available: boolean;
}

export const TOOL_CATEGORIES: string[] = [
  '1. Клинические калькуляторы',
  '2. Диагностические шкалы',
  '3. Педиатрические инструменты',
  '4. Кардиология и сосуды',
  '5. Неврология и нейрохирургия',
  '6. Анестезиология и ICU',
  '7. Травматология и военная медицина',
  '8. Акушерство и гинекология',
  '9. Психиатрия и психология',
  '10. Онкология',
  '11. Инфекционные болезни',
  '12. Нефрология и урология',
  '13. Пульмонология',
  '14. Фармакология и лекарства',
  '15. Лабораторная медицина',
  '16. Справочники и классификаторы',
  '17. Протоколы экстренной помощи',
  '18. Учебные инструменты',
  '19. Региональные стандарты',
  '20. Ветеринарная медицина',
  '21. Стоматология',
  '22. Прочие специальности',
];

const T = (
  id: string, title: string, description: string,
  category: string, subcategory: string, available = false
): CatalogTool => ({ id, title, description, category, subcategory, available });

export const CATALOG_TOOLS: CatalogTool[] = [
  // ═══════════════════════════════════════════════
  // 1. КЛИНИЧЕСКИЕ КАЛЬКУЛЯТОРЫ
  // ═══════════════════════════════════════════════

  // Антропометрия и состав тела
  T('bmi', 'BMI / Индекс массы тела (Quetelet)', 'Скрининг избыточной массы тела и ожирения у взрослых.', '1. Клинические калькуляторы', 'Антропометрия', true),
  T('bsa-dubois', 'BSA - Du Bois & Du Bois (1916)', 'Площадь поверхности тела для дозирования химиотерапии и индексации ЭхоКГ.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('bsa-mosteller', 'BSA - Mosteller', 'Площадь поверхности тела - стандарт в онкологии.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('bsa-haycock', 'BSA - Haycock / Gehan-George / Boyd', 'Альтернативные формулы BSA для детей и специальных популяций.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('ibw-devine', 'IBW - Devine', 'Идеальная масса тела для дозирования анестетиков и нутритивной поддержки.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('ibw-robinson', 'IBW - Robinson / Miller / Hamwi', 'Альтернативные формулы идеальной массы тела.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('abw', 'Adjusted Body Weight', 'Скорректированная масса тела для дозирования при ожирении.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('lbw', 'Lean Body Weight (Janmahasatian)', 'Тощая масса тела - современная формула для анестезиологии.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('whr', 'Waist-to-hip ratio (ВОЗ)', 'Оценка кардиометаболического риска по распределению жира.', '1. Клинические калькуляторы', 'Антропометрия'),
  T('bodyfat', '% Body Fat (Jackson-Pollock, Navy)', 'Оценка процента жировой ткани в спортивной и военной медицине.', '1. Клинические калькуляторы', 'Антропометрия'),

  // Дозирование и инфузии
  T('mg-kg', 'mg/kg dosing', 'Расчёт дозы препарата по массе тела (педиатрия и интенсивная терапия).', '1. Клинические калькуляторы', 'Дозирование'),
  T('bsa-dose', 'BSA-based dosing (mg/m²)', 'Расчёт дозы по площади поверхности тела (онкология, педиатрия).', '1. Клинические калькуляторы', 'Дозирование'),
  T('holliday-segar', 'Holliday-Segar (4-2-1 rule)', 'Поддерживающая инфузия у детей и взрослых по массе тела.', '1. Клинические калькуляторы', 'Дозирование'),
  T('parkland', 'Parkland formula', 'Расчёт инфузионной терапии при ожогах в первые 24 часа.', '1. Клинические калькуляторы', 'Дозирование'),
  T('modified-brooke', 'Modified Brooke / Galveston (Shriners) / ABLS', 'Альтернативные схемы инфузии при ожогах у взрослых и детей.', '1. Клинические калькуляторы', 'Дозирование'),
  T('rule-nines', 'Rule of Nines / Lund-Browder', 'Оценка площади ожога у взрослых и детей.', '1. Клинические калькуляторы', 'Дозирование'),
  T('drip-rate', 'Drip rate (gtt/min)', 'Расчёт скорости в каплях в минуту для капельной инфузии.', '1. Клинические калькуляторы', 'Дозирование'),
  T('iv-dilution', 'IV concentration / dilution calculators', 'Разведение и подготовка растворов для внутривенного введения.', '1. Клинические калькуляторы', 'Дозирование'),
  T('insulin-correction', 'Insulin correction factor (1700/1800) + I:C ratio', 'Индивидуальные коэффициенты инсулина для коррекции гликемии и ХЕ.', '1. Клинические калькуляторы', 'Дозирование'),
  T('dka', 'DKA fluid/insulin protocols (JBDS, ISPAD, ADA)', 'Протоколы инфузии и инсулина при диабетическом кетоацидозе.', '1. Клинические калькуляторы', 'Дозирование'),
  T('raschke', 'Raschke (heparin) nomogram', 'Инициация и коррекция дозы нефракционированного гепарина по aPTT.', '1. Клинические калькуляторы', 'Дозирование'),
  T('warfarin', 'Warfarin dosing (IWPC, Gage)', 'Стартовая доза варфарина с учётом клинических и генетических факторов.', '1. Клинические калькуляторы', 'Дозирование'),
  T('doac', 'DOAC dose adjustment', 'Коррекция дозы прямых оральных антикоагулянтов по CrCl, возрасту, массе.', '1. Клинические калькуляторы', 'Дозирование'),
  T('vanco-auc', 'Vancomycin AUC/MIC calculator', 'Таргетное дозирование ванкомицина по площади под кривой.', '1. Клинические калькуляторы', 'Дозирование'),
  T('aminoglycoside', 'Aminoglycoside dosing (Hartford nomogram)', 'Дозирование аминогликозидов с учётом функции почек.', '1. Клинические калькуляторы', 'Дозирование'),
  T('calvert', 'Chemotherapy dose by AUC (Calvert)', 'Расчёт дозы карбоплатина по AUC и функции почек.', '1. Клинические калькуляторы', 'Дозирование'),

  // Электролиты / КЩС
  T('anion-gap', 'Anion gap', 'Дифф. диагностика метаболического ацидоза (MUDPILES, GOLD MARK).', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('plasma-osm', 'Plasma osmolality', 'Расчёт осмолярности плазмы для оценки водно-электролитных нарушений.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('osm-gap', 'Osmolar gap', 'Выявление токсических спиртов (метанол, этиленгликоль).', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('ca-corrected', 'Corrected Ca²⁺ (Payne)', 'Коррекция общего кальция на уровень альбумина.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('na-corrected', 'Corrected Na⁺ для гипергликемии', 'Истинный натрий при выраженной гипергликемии.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('adrogue-madias', 'Adrogué-Madias', 'Прогноз изменения натрия при инфузии раствора.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('water-deficit', 'Free water deficit, Na deficit', 'Расчёт дефицита воды и натрия при дизнатриемиях.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('henderson', 'Henderson-Hasselbalch / Stewart', 'Анализ кислотно-щелочного состояния.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('winter', 'Winter formula', 'Расчёт ожидаемого pCO₂ при метаболическом ацидозе.', '1. Клинические калькуляторы', 'Электролиты / КЩС', true),
  T('aa-gradient', 'A-a gradient / SF / OI', 'Оценка газообмена и тяжести дыхательной недостаточности.', '1. Клинические калькуляторы', 'Электролиты / КЩС'),
  T('pf-ratio', 'PaO₂/FiO₂ ratio', 'Индекс оксигенации и градация ARDS (Berlin).', '1. Клинические калькуляторы', 'Электролиты / КЩС', true),

  // Функция почек
  T('cockcroft', 'Cockcroft-Gault (CrCl)', 'Клиренс креатинина - стандарт FDA/EMA для дозирования лекарств.', '1. Клинические калькуляторы', 'Функция почек', true),
  T('mdrd', 'MDRD (4-var)', 'Оценка СКФ (историческая, заменена на CKD-EPI).', '1. Клинические калькуляторы', 'Функция почек'),
  T('ckd-epi', 'CKD-EPI 2009 / 2021 (race-free)', 'Современный стандарт стадирования хронической болезни почек.', '1. Клинические калькуляторы', 'Функция почек'),
  T('schwartz', 'Schwartz (bedside, 2009)', 'Расчёт СКФ у детей по росту и креатинину.', '1. Клинические калькуляторы', 'Функция почек'),
  T('lund-malmo', 'Revised Lund-Malmö / BIS1 / BIS2', 'Европейские формулы СКФ, точнее у пожилых.', '1. Клинические калькуляторы', 'Функция почек'),
  T('cystatin', 'Цистатин C (CKD-EPI cys)', 'Уточнение СКФ - не зависит от мышечной массы.', '1. Клинические калькуляторы', 'Функция почек'),
  T('fena', 'FENa / FEUrea', 'Дифф. диагностика преренальной и ренальной ОПП.', '1. Клинические калькуляторы', 'Функция почек'),

  // Конверсии единиц
  T('unit-glucose', 'Глюкоза', 'Конверсия глюкозы между mg/dL (США) и ммоль/л (СИ).', '1. Клинические калькуляторы', 'Конверсии единиц'),
  T('unit-creatinine', 'Креатинин', 'Конверсия креатинина между mg/dL и мкмоль/л.', '1. Клинические калькуляторы', 'Конверсии единиц'),
  T('unit-chol', 'Холестерин / триглицериды', 'Конверсия липидов между mg/dL и ммоль/л.', '1. Клинические калькуляторы', 'Конверсии единиц'),
  T('unit-hb', 'Гемоглобин', 'Конверсия гемоглобина между g/dL и g/L.', '1. Клинические калькуляторы', 'Конверсии единиц'),
  T('unit-bili', 'Билирубин', 'Конверсия билирубина между mg/dL и мкмоль/л.', '1. Клинические калькуляторы', 'Конверсии единиц'),

  // ═══════════════════════════════════════════════
  // 2. ДИАГНОСТИЧЕСКИЕ ШКАЛЫ И СКОРИНГ
  // ═══════════════════════════════════════════════

  // Триаж
  T('esi', 'ESI v.5 (Emergency Severity Index)', 'Сортировка пациентов в отделении неотложной помощи (стандарт США).', '2. Диагностические шкалы', 'Триаж'),
  T('mts', 'Manchester Triage System (MTS)', 'Сортировка пациентов по приоритету - стандарт UK и Европы.', '2. Диагностические шкалы', 'Триаж'),
  T('ctas', 'CTAS (Canadian Triage and Acuity Scale)', 'Канадский стандарт триажа в отделениях неотложной помощи.', '2. Диагностические шкалы', 'Триаж'),
  T('ats', 'ATS (Australasian Triage Scale)', 'Австралийский стандарт сортировки пациентов.', '2. Диагностические шкалы', 'Триаж'),
  T('start', 'START / JumpSTART / SALT / SIEVE / SORT', 'Триаж при массовых поражениях и чрезвычайных ситуациях.', '2. Диагностические шкалы', 'Триаж'),

  // Раннее распознавание ухудшения
  T('news2', 'NEWS2', 'Раннее распознавание клинического ухудшения - стандарт NHS.', '2. Диагностические шкалы', 'Раннее распознавание'),
  T('mews', 'MEWS', 'Базовая шкала раннего предупреждения (предшественник NEWS).', '2. Диагностические шкалы', 'Раннее распознавание'),
  T('qsofa', 'qSOFA', 'Прикроватный скрининг сепсиса вне ICU.', '2. Диагностические шкалы', 'Раннее распознавание'),
  T('sofa', 'SOFA (0-24)', 'Оценка органной дисфункции и прогноза в ICU.', '2. Диагностические шкалы', 'Раннее распознавание'),
  T('pews', 'PEWS / Bedside PEWS / RCPCH PEWS', 'Шкалы раннего распознавания ухудшения у детей.', '2. Диагностические шкалы', 'Раннее распознавание'),
  T('meows', 'MEOWS', 'Раннее распознавание ухудшения в акушерстве.', '2. Диагностические шкалы', 'Раннее распознавание'),

  // Боль
  T('vas', 'VAS (0-100 мм) / NRS (0-10)', 'Базовая оценка интенсивности боли у взрослых.', '2. Диагностические шкалы', 'Боль'),
  T('wong-baker', 'Wong-Baker FACES', 'Оценка боли по выражению лица у детей и лиц с когнитивными нарушениями.', '2. Диагностические шкалы', 'Боль'),
  T('flacc', 'FLACC (2 мес-7 лет)', 'Поведенческая оценка боли у невербальных детей.', '2. Диагностические шкалы', 'Боль'),
  T('fps-r', 'FPS-R (Faces Pain Scale Revised)', 'Оценка боли у детей 4-12 лет по лицам.', '2. Диагностические шкалы', 'Боль'),
  T('nips', 'NIPS / CRIES / N-PASS / PIPP-R', 'Оценка боли у новорождённых.', '2. Диагностические шкалы', 'Боль'),
  T('painad', 'PAINAD', 'Оценка боли у пациентов с деменцией.', '2. Диагностические шкалы', 'Боль'),
  T('mcgill', 'McGill Pain Questionnaire', 'Качественная характеристика болевого синдрома.', '2. Диагностические шкалы', 'Боль'),
  T('bpi', 'Brief Pain Inventory', 'Многомерная оценка боли и её влияния на жизнь.', '2. Диагностические шкалы', 'Боль'),
  T('dn4', 'DN4 / LANSS / painDETECT', 'Скрининг нейропатического компонента боли.', '2. Диагностические шкалы', 'Боль'),
  T('cpot', 'CPOT / BPS', 'Оценка боли у интубированных пациентов в ICU.', '2. Диагностические шкалы', 'Боль'),

  // Функциональный статус и гериатрия
  T('kps', 'Karnofsky Performance Status (0-100)', 'Функциональный статус в онкологии.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('ecog', 'ECOG / WHO / Zubrod (0-5)', 'Упрощённая оценка функционального статуса в онкологии.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('barthel', 'Barthel Index / Modified Barthel', 'Оценка самообслуживания и базовых ADL.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('katz-adl', 'Katz ADL / Lawton IADL / FIM', 'Оценка повседневной активности и независимости.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('mrs', 'Modified Rankin Scale (0-6)', 'Оценка инвалидизации после инсульта.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('cfs', 'Clinical Frailty Scale (Rockwood, 1-9)', 'Оценка хрупкости в гериатрии, ICU, предоперационно.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('edmonton-frail', 'Edmonton Frail / FRAIL / Fried / PRISMA-7 / Tilburg', 'Комплексная оценка синдрома хрупкости у пожилых.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('morse', 'Morse Fall Scale / Hendrich II / STRATIFY', 'Оценка риска падений у стационарных пациентов.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('tinetti', 'Tinetti POMA / Berg Balance / TUG / DGI', 'Оценка равновесия и походки.', '2. Диагностические шкалы', 'Функциональный статус'),
  T('braden', 'Braden / Norton / Waterlow', 'Оценка риска развития пролежней.', '2. Диагностические шкалы', 'Функциональный статус'),

  // Питание
  T('must', 'MUST', 'Скрининг недоедания у взрослых (стандарт UK).', '2. Диагностические шкалы', 'Питание'),
  T('nrs2002', 'NRS-2002', 'Скрининг нутритивного риска в стационаре (ESPEN).', '2. Диагностические шкалы', 'Питание'),
  T('mna', 'MNA / MNA-SF', 'Оценка нутритивного статуса у пожилых.', '2. Диагностические шкалы', 'Питание'),
  T('sga', 'SGA (Subjective Global Assessment)', 'Клиническая оценка нутритивного статуса.', '2. Диагностические шкалы', 'Питание'),
  T('glim', 'GLIM criteria (2019)', 'Международные критерии диагностики недоедания.', '2. Диагностические шкалы', 'Питание'),
  T('strongkids', 'STRONGkids / STAMP', 'Скрининг нутритивного риска у детей.', '2. Диагностические шкалы', 'Питание'),
  T('nutric', 'NUTRIC', 'Оценка нутритивного риска в ICU.', '2. Диагностические шкалы', 'Питание'),

  // ВТЭ / тромбоз / кровотечение
  T('wells-dvt', 'Wells DVT', 'Предтестовая вероятность ТГВ.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение', true),
  T('wells-pe', 'Wells PE', 'Предтестовая вероятность ТЭЛА.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение', true),
  T('geneva', 'Geneva revised / simplified', 'Альтернативная шкала вероятности ТЭЛА.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('perc', 'PERC rule', 'Исключение ТЭЛА у пациентов с низкой вероятностью без D-димера.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('years', 'YEARS', 'Упрощённый алгоритм исключения ТЭЛА.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('4t', '4T score', 'Оценка вероятности гепарин-индуцированной тромбоцитопении.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('padua', 'Padua (IMPROVE)', 'Оценка риска ВТЭ у терапевтических стационарных пациентов.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('caprini', 'Caprini', 'Оценка риска ВТЭ у хирургических пациентов.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('rcog-vte', 'RCOG VTE в беременности', 'Оценка риска ВТЭ у беременных и в послеродовом периоде.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('khorana', 'Khorana', 'Оценка риска ВТЭ у онкологических пациентов на химиотерапии.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('improve-bleed', 'IMPROVE bleeding', 'Оценка риска кровотечения у стационарных пациентов.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('has-bled', 'HAS-BLED / ORBIT / ATRIA / HEMORR2HAGES', 'Оценка риска большого кровотечения на антикоагулянтах при ФП.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),
  T('pesi', 'PESI / sPESI', 'Оценка 30-дневной смертности при подтверждённой ТЭЛА.', '2. Диагностические шкалы', 'ВТЭ / Кровотечение'),

  // Хирургия / периоперационная
  T('asa-ps', 'ASA Physical Status (I-VI)', 'Предоперационная оценка физического состояния пациента.', '2. Диагностические шкалы', 'Периоперационная'),
  T('charlson', 'Charlson Comorbidity Index / Elixhauser / Van Walraven', 'Оценка коморбидности и долгосрочного прогноза.', '2. Диагностические шкалы', 'Периоперационная'),
  T('possum', 'POSSUM / P-POSSUM / CR-POSSUM', 'Оценка риска смертности и осложнений после хирургии.', '2. Диагностические шкалы', 'Периоперационная'),
  T('nsqip', 'ACS NSQIP Risk Calculator', 'Расчёт риска хирургических осложнений (стандарт США).', '2. Диагностические шкалы', 'Периоперационная'),
  T('rcri', 'Revised Cardiac Risk Index (Lee) / Gupta MICA', 'Оценка кардиологического риска при несердечной хирургии.', '2. Диагностические шкалы', 'Периоперационная'),
  T('clavien', 'Clavien-Dindo + CCI', 'Стандартная классификация тяжести послеоперационных осложнений.', '2. Диагностические шкалы', 'Периоперационная'),

  // Делирий
  T('cam', 'CAM (Inouye) / CAM-ICU / 3D-CAM / b-CAM', 'Скрининг и диагностика делирия.', '2. Диагностические шкалы', 'Делирий'),
  T('4at', '4AT / DOS / ICDSC / Nu-DESC / DRS-R-98', 'Альтернативные шкалы скрининга делирия.', '2. Диагностические шкалы', 'Делирий'),

  // ═══════════════════════════════════════════════
  // 3. ПЕДИАТРИЧЕСКИЕ ИНСТРУМЕНТЫ
  // ═══════════════════════════════════════════════

  // Новорождённые
  T('apgar', 'Apgar score (1 и 5 мин)', 'Оценка состояния новорождённого в первые минуты жизни.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('silverman', 'Silverman-Anderson', 'Оценка тяжести респираторного дистресс-синдрома у новорождённого.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('downes', 'Downes score', 'Альтернативная оценка дыхательной недостаточности у новорождённых.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('ballard', 'Ballard / New Ballard Score', 'Определение гестационного возраста после рождения.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('dubowitz', 'Dubowitz', 'Классическая шкала оценки гестационного возраста.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('finnegan', 'Finnegan NAS/FNAS', 'Оценка синдрома неонатальной абстиненции.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('thompson', 'Thompson Score / Sarnat staging', 'Оценка тяжести гипоксически-ишемической энцефалопатии.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('kramer', 'Kramer scale / Bhutani nomogram', 'Оценка желтухи и показаний к фототерапии у новорождённого.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('crib', 'CRIB-II / SNAP-II / SNAPPE-II', 'Оценка тяжести состояния в неонатальной реанимации.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-fluid', 'Жидкость новорождённому по дням', 'Стартовый расчёт суточного объёма (60-160 мл/кг) с поправками на фототерапию, открытый кювез, лихорадку. ESPGHAN 2018 + КР МЗ РФ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-gir', 'GIR (Glucose Infusion Rate)', 'Скорость поступления глюкозы мг/кг/мин из непрерывной инфузии. Bands 4-12 для роста, >12.5 — центральный доступ. ESPGHAN 2018 + PES 2015.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-ett', 'Размер ЭТТ + глубина введения', 'Внутренний диаметр трубки и глубина по массе/GA. NRP 8 ed.; Takeuchi 2020 для ELBW <750 г; ERC 2021; МЗ РФ 04.03.2020.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-resus-doses', 'Реанимационные дозы новорождённого', 'Эпинефрин, NaHCO3, глюкоза D10, налоксон, volume expander. Переключатель региона: NRP 8 ed. / ERC 2021 / МЗ РФ 04.03.2020.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-uvc-uac', 'Размер UVC/UAC + глубина (Shukla)', 'Размер пуповинных катетеров (3.5-5 Fr) и глубина введения по формуле Shukla (3×weight+9). Целевые позиции T8-T9 / T6-T9 / L3-L4. NRP 8 ed.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-fenton', 'Fenton 2025 growth (преэрмы 22-50 нед PMA)', 'Перцентили и Z-scores по обновлённым кривым роста для преждевременно родившихся. Cut-offs SGA <10/AGA 10-90/LGA >90. Pediatrics 2025;155:e2024069896.', '3. Педиатрические инструменты', 'Рост и развитие', true),
  T('neo-bili-2022', 'Bili-2022 AAP / NICE / КР РФ ГБН (≥35 нед)', 'Пороги фототерапии и обмена при гипербилирубинемии у новорождённого ≥35 нед. 3 региона: AAP 2022 / NICE CG98 (2023) / КР МЗ РФ ГБН.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-kaiser-eos', 'Kaiser EOS calculator (3-region)', 'Bayesian risk калькулятор раннего неонатального сепсиса. 3 переключателя: Kaiser (Bayesian) / NICE NG195 (категориальный) / КР МЗ РФ. Применим для GA ≥34 нед.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-bell-nec', 'Bell staging НЭК (modified Walsh-Kliegman)', 'Стадирование некротизирующего энтероколита I-IIIB. Mortality 5-80%. Treatment thresholds (NPO/abx/surgery). Bell 1978; Walsh-Kliegman 1986.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-papile', 'Papile ВЖК (intraventricular hemorrhage I-IV)', 'Степени внутрижелудочкового кровоизлияния по head US у недоношенных. Grade IV = PVHI (Volpe 2018). NDI risk 3-75% по grade. Papile 1978.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-bpd-nih', 'NIH BPD consensus (бронхолёгочная дисплазия)', 'Severity grading BPD у преждевременно родившихся @ 36 нед PMA: No / Mild / Moderate / Severe. Jobe-Bancalari 2001 + Higgins 2018 update.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-icrop3', 'ICROP3 ROP staging (ретинопатия недоношенных)', 'Международная classification ROP 2021: zone 1-3 + stage 0-5 + plus disease + AROP. Type 1 (treat в 72ч) vs Type 2 (observe). Anti-VEGF / laser. Chiang Ophthalmology 2021.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-hie-cooling', 'Therapeutic Hypothermia eligibility (HIE)', 'Критерии охлаждения при гипоксически-ишемической энцефалопатии (NICHD/TOBY: A — physiologic, B — perinatal event, C — clinical/Sarnat). Окно ≤ 6 ч. КР МЗ РФ ХИЭ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-pipp-r', 'PIPP-R (Premature Infant Pain Profile - Revised)', 'Шкала боли у недоношенных. 7 показателей × 0-3 балла, max 21. Bands: 0-6 нет / 7-12 умеренная / ≥ 13 сильная боль. Stevens 2014.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-npass', 'N-PASS (Neonatal Pain, Agitation & Sedation)', 'Бимодальная шкала боли (+) и седации (−). 5 показателей × ±2 балла, диапазон −10…+10. Hummel 2008.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-newt', 'NEWT — потеря массы у эксклюзивно-грудных', 'Newborn Weight Tool (Flaherman 2015): отслеживание % потери массы. Cut-offs: < peak, до 9.9 % — мониторинг, ≥ 10 % — оценка вскармливания.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-enteral', 'Enteral feed advancement (VLBW/ELBW)', 'Темпы продвижения энтерального питания по массе и фазе (трофическое / advance / full): 15-40 мл/кг/сут. ESPGHAN 2022 EN Position.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-tpn', 'TPN macronutrient calculator (ESPGHAN PN 2018)', 'Расчёт белка, липидов, GIR, ккал/кг/сут с ramp-up по дням. ESPGHAN/ESPEN/ESPR/CSPEN 2018 (Clin Nutr 37:2306-2308).', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-who-growth', 'WHO Growth Standards 0-24 мес (term)', 'Перцентили и Z-scores массы по возрасту 0-24 мес для доношенных. WHO Multicentre Growth Reference 2006. Cut-offs −3 / −2 / +2 / +3 SD.', '3. Педиатрические инструменты', 'Рост и развитие', true),
  T('neo-downes', 'Downes Score (RDS severity)', 'Шкала тяжести синдрома дыхательных расстройств у новорождённого. 5 параметров × 0-2, max 10. Lab бэнды: ≤3 лёгкая / 4-6 умеренная / ≥7 тяжёлая. Downes 1970.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-finnegan', 'Modified Finnegan (NAS)', 'Modified Finnegan Score — оценка неонатального абстинентного синдрома. 22 признака, max 47. Триггер фармакотерапии: 3 ≥8 ИЛИ 2 ≥12.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-nips', 'NIPS (Neonatal Infant Pain Scale)', 'Шкала боли у доношенных новорождённых: 6 индикаторов (face/cry/breathing/arms/legs/state), диапазон 0-7. Lawrence 1993.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-partial-exchange', 'Partial Exchange (полицитемия)', 'Расчёт объёма частичного обменного переливания 0.9 % NaCl при симптомной полицитемии (Hct ≥ 65 %). Rawlings 1982.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-resp-indices', 'Респираторные индексы (OI / OSI / A-aDO₂ / P/F)', 'A-aDO₂, OI, OSI, SF, P/F ratio. Decision-making по iNO, HFOV, ECMO. ELSO criteria (OI ≥ 40).', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-tcb-conversion', 'TcB → TSB конверсия + скрининг', 'Конверсия транскутанного билирубина в TSB и оценка необходимости подтверждения серологически. Maisels 2006; NICE CG98; AAP 2022.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-exchange-volume', 'Double Volume Exchange (ОПК)', 'Расчёт объёма обменного переливания при тяжёлой гипербилирубинемии / ГБН. DVET = 2 × BV ≈ 160-170 мл/кг. AAP 2022 / NICE CG98 / КР РФ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-photo-preterm', 'Phototherapy thresholds 28-34 нед', 'Пороги фототерапии и обмена для умеренно/глубоко недоношенных. Упрощённая аппроксимация по NICE addendum 2023 + Maisels 2012. Для ≥35 нед использовать Bili-2022.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-abg', 'Acid-base / ABG interpretation (н/р)', 'Систематическая интерпретация газов крови у новорождённого: pH, PaCO₂, HCO₃, BE, AG. Алгоритм 4 шагов; permissive hypercapnia стратегия. Tin 2017; КР РФ КЩС.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-puopolo-eos', 'Puopolo EOS (≤ 34 нед, AAP 2018)', 'Категориальная стратификация раннего неонатального сепсиса для GA ≤ 34 нед. 3-tiered (low/intermediate/high) по AAP COFN 2018. Дополняет Kaiser ≥ 34 нед.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-hypothermia-transport', 'Гипотермия — управление при транспорте', 'Классификация WHO (норма / стресс / умеренная / тяжёлая) и тактика согревания. Cap, polyethylene wrap, servo-controlled инкубатор. WHO 2017; NRP 8 ed.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-nsofa', 'Neonatal SOFA (nSOFA)', 'Шкала органной недостаточности у н/р при сепсисе: респ + CV + гематология. nSOFA ≥ 4 — высокий риск смерти от LOS. Wynn JAMA Peds 2020.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-petrussa', 'Petrussa Score (упрощ. GA)', 'Упрощённая оценка GA по 5 morphologic критериям. Альтернатива Ballard в условиях ограниченных ресурсов. GA ≈ score + 30. Точность ± 2 нед.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-surfactant-dose', 'Сурфактант — расчёт дозы', 'Curosurf 100-200 мг/кг; Survanta 100 мг/кг (4 мл/кг); Infasurf 105 мг/кг (3 мл/кг). LISA / INSURE / bolus. European Consensus 2022.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-caffeine-dose', 'Кофеин цитрат (AOP)', 'Loading 20-40 мг/кг + maintenance 5-10 мг/кг q24h. Стандарт у GA < 32 нед. CAP trial (Schmidt NEJM 2007). Therapeutic 5-25 мкг/мл.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-ampicillin-dose', 'Ампициллин н/р (sepsis / meningitis)', '50 мг/кг (sepsis) / 100 мг/кг (meningitis), q12h-q8h по PMA + PNA. First-line с гентамицином для EOS. AAP Red Book; NeoFax; КР РФ.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-gentamicin-dose', 'Гентамицин н/р (extended-interval)', '4-5 мг/кг q24-48h по PMA + PNA. Pair с ампициллином для EOS/LOS. TDM: trough < 1, peak 5-12 мг/л. AAP; NeoFax; Cochrane EID 2011.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-vancomycin-dose', 'Ванкомицин н/р (CONS / MRSA)', '10-15 мг/кг q6-24h по PMA + PNA. Loading 20 мг/кг при meningitis. AUC₂₄/MIC 400-600 (ASHP/IDSA 2020); trough 10-20 мг/л.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-fentanyl-dose', 'Фентанил н/р (анальгезия / седация)', 'Болюс 0.5-2 мкг/кг IV; инфузия 0.5-4 мкг/кг/ч. ~75-125× potency morphine. NEOPAIN trial; AAP CFN 2016.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-pge1-dose', 'PGE1 (alprostadil) — duct-dependent ВПС', '0.01-0.1 мкг/кг/мин IV continuous для поддержания PDA при cyanotic CHD / left-sided obstructive. AAP/AHA 2018; Cochrane 2018.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-morphine-dose', 'Морфин н/р (analgesia / NAS)', 'IV болюс 0.05-0.1 мг/кг q4-6h; инфузия 10-30 мкг/кг/ч; PO 0.04-0.16 мг/кг q3-4h для NAS. NEOPAIN; AAP CFN 2016; Hudak/Tan AAP 2012.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-dopamine-dose', 'Допамин н/р (inotrope / vasopressor)', 'Dose-dependent: dopa 1-3 → β1 4-10 → α1 10-20 мкг/кг/мин. First-line shock. AAP CFN 2018; Saugstad Acta Paediatr 2018.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-hydrocortisone-dose', 'Гидрокортизон н/р', 'Refractory hypotension 1 мг/кг q8h × 5 дней; CAH replacement 15 мг/м²/сут; BPD prevention controversial. PRINCETON-2; NICHD 2022.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-ibuprofen-pda-dose', 'Ибупрофен PDA closure', 'Standard 10/5/5 мг/кг q24h × 3 дня; high-dose 20/10/10 для < 27 нед. Mitra JAMA 2018; Cochrane 2020. Альтернатива indomethacin.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-furosemide-dose', 'Фуросемид н/р (loop diuretic)', '1-2 мг/кг IV q12-24h (acute) или 1-4 мг/кг PO q12h (BPD chronic). Combine с spironolactone + KCl. Cochrane Diuretics BPD 2017.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-epinephrine-infusion', 'Адреналин continuous infusion н/р', '0.05-1 мкг/кг/мин IV continuous для refractory shock. β1+β2+α1 dose-dependent. Switch к vasopressin > 1 мкг/кг/мин. AAP CFN 2018; SSC Pediatric 2020.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-phenobarbital-dose', 'Фенобарбитал н/р (anticonvulsant + NAS)', 'Loading 20 мг/кг IV (max 40); maintenance 3-5 мг/кг q24h. NAS adjunct 5 мг/кг q12h PO. WHO 2011; NeoLEV2 2020.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-vitk-dose', 'Витамин K profilaxis (VKDB prevention)', '1 мг IM term ≥ 1500 г; 0.5 мг IM преэрм < 1500 г. PO option 3 doses (NICE). Treatment 1-2 мг IV. AAP COFN 2022.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-prematurity-class', 'Классификация недоношенности (GA + weight)', 'Late/moderate/very/extremely preterm + LBW/VLBW/ELBW. Combined risk score. WHO ICD-11 P07; AAP/Engle 2009; КР МЗ РФ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-asphyxia-criteria', 'Критерии асфиксии (P21 МКБ-10)', '4 critirium AAP/ACOG 2014: pH/BE + Apgar + encephalopathy + multi-organ. P21.0 (severe) — критерий для TH. КР МЗ РФ ХИЭ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-glucose-bolus-dose', 'Глюкоза болюс (гипогликемия)', '2 мл/кг D10W IV slow + start GIR 6-8 мг/кг/мин. PES 2015 thresholds: < 1.8 / 2.0 / 2.6 ммоль/л по часам жизни. AAP CFN 2011; BAPM 2017.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-milrinone-dose', 'Милринон (PDE3i для PPHN)', 'Loading 50 мкг/кг IV (controversial у н/р); maintenance 0.25-0.75 мкг/кг/мин. Inodilator: ↑contractility + ↓SVR/PVR. AHA 2019 PPHN; Khanna CHEST 2017.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-vasopressin-dose', 'Вазопрессин (refractory shock)', '0.0001-0.001 ед/кг/мин IV continuous. V1 vasoconstriction для catecholamine-resistant warm shock. SSC Pediatric 2020; Choong NEJM 2009.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-zvur-class', 'ЗВУР / SGA / AGA / LGA (Fenton/Olsen/IG-21)', 'Перцентили массы для GA. Symmetric vs asymmetric IUGR. SGA severe < 3-й — high-risk. ACOG Committee 800 (2020); КР МЗ РФ.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-rds-class', 'RDS classification (X-ray + FiO₂)', 'Радиологические степени I-IV: ретикулогранулярный → confluent → "white lung". Combined с FiO₂ для tactic. КР МЗ РФ; Sweet European Consensus 2022.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-perinatal-infections-class', 'Перинатальные инфекции (P35-P39 МКБ-10)', '5 групп: TORCH (P35), bacterial sepsis (P36), other congenital (P37), omphalitis (P38), other perinatal (P39). Empiric ABX по группе. WHO ICD-10; AAP Red Book.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-hdn-class', 'ГБН — гемолитическая болезнь (тяжесть)', 'Классификация по AB0/Rh/Kell/minor + тяжесть (лёгкая/средняя/тяжёлая/hydrops). IVIG/DVET indications. КР МЗ РФ; AAP 2022; NICE CG98.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-norepinephrine-dose', 'Норэпинефрин (warm shock)', '0.05-1 мкг/кг/мин IV continuous. α1+β1 dominant. Preferred для warm shock (low SVR). Surviving Sepsis Campaign Pediatric 2020.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-clonidine-dose', 'Клонидин (NAS adjunct + sedation)', 'NAS PO 0.5-2 мкг/кг q3-4h; infusion 0.5-2 мкг/кг/ч. α2-агонист. Hudak/Tan AAP 2012; Agthe Pediatrics 2009.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-levetiracetam-dose', 'Леветирацетам (anticonvulsant)', 'Loading 40-100 мг/кг IV; maintenance 20-40 мг/кг q12h. SV2A binder; alternative phenobarb с лучшим side-effect profile. NeoLEV2 trial 2020.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-midazolam-dose', 'Мидазолам (sedation + refractory seizures)', 'Bolus 0.05-0.15 мг/кг IV; infusion 0.06-0.4 мг/кг/ч. Benzodiazepine. ⚠️ Anand 2004 — adverse neurodev в preterm. AAP CFN 2016.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-metronidazole-dose', 'Метронидазол (anaerobic / NEC)', '7.5 мг/кг IV q8-24h по PMA+PNA. Triple-therapy для NEC IIB+ (с ампициллином + гентамицином). AAP Red Book; Cochrane NEC 2017.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-low-flow-o2', 'Low-flow O₂ → Effective FiO₂', 'Расчёт effective FiO₂ при low-flow nasal cannula у новорождённого. Finer 1996; NICUtools. Wean strategy + SpO₂ targets (NeOProM 2018).', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-naloxone-dose', 'Налоксон (opioid antagonist)', '0.1 мг/кг IV/IM/IO/ETT для opioid reversal. ⚠️ NRP 8 ed. removed from routine. CONTRAINDICATED у opioid-dependent matери.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-cagluconate-dose', 'Кальций глюконат (hypocalcemia)', 'Acute 1-2 мл/кг 10% IV slow push 5-10 мин; maintenance 200-800 мг/кг/сут TPN. AAP CFN; Demarini neonatal Ca homeostasis.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-insulin-dose', 'Инсулин (hyperglycemia of prematurity)', '0.01-0.2 ед/кг/ч continuous; first-line ↓ GIR. ⚠️ NIRTURE 2008 — routine early insulin no benefit, ↑ hypoglycemia. Pre-prime tubing critical.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-ino-dose', 'Inhaled NO (PPHN)', '20 ppm initial, wean к 5-10 ppm, off ≥ 1 ppm. PPHN term/late preterm с OI ≥ 15-25. Methemoglobinemia + NO₂ monitoring. NINOS 1997.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-mgso4-dose', 'Магний сульфат (hypoMg + neuroprotection)', 'Hypomagnesemia 25-50 мг/кг IV slow 30 мин; HIE neuroprotection 250 мг/кг (controversial). Maternal antenatal 4 г + 1 г/ч (Doyle Cochrane 2009 evidence-based).', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-sildenafil-dose', 'Силденафил (PPHN PO/IV)', 'PO 0.5-3 мг/кг q6-8h; IV LOAD-SUSTAIN 0.4 мг/кг loading + 1.6 мг/кг/сут. PDE5 inhibitor — alternative/adjunct iNO. Baquero Pediatrics 2006.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-erythropoietin-dose', 'Эритропоэтин (AOP / neuroprotection)', 'AOP rhEpo 250-500 ед/кг 3×/нед SC ИЛИ darbepoetin 10 мкг/кг/нед. Neuroprotection PENUT 1000 ед/кг IV q48h × 6. Iron OBLIGATORY.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-erythromycin-dose', 'Эритромицин (prokinetic + abx)', 'Prokinetic 12.5 мг/кг q6h PO для feeding intolerance (Cochrane 2014). Antibiotic для pertussis/chlamydia 14 дней. ⚠️ IHPS risk у < 2 нед / ELBW.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-discharge-criteria', 'Критерии выписки н/р из NICU', 'AAP COFN 2008 5-criteria: physiologic stability + feeding + thermoregulation + routine care + parental readiness. Все обязательны.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-indomethacin-pda-dose', 'Индометацин (PDA / IVH prophy)', 'PDA closure age-adjusted (Heymann); IVH prophy 0.1 мг/кг q24h × 3 (TIPP). Vs ибупрофен: больше renal/NEC effects (Mitra JAMA 2018).', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-glucagon-dose', 'Глюкагон (CHI emergency)', '0.1-0.3 мг/кг IM/IV emergency; 0.005-0.02 мг/кг/ч infusion bridge to diazoxide. Refractory hypoglycemia с GIR ≥ 12. PES 2015.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-iron-dose', 'Железо (preterm + AOP supplementation)', 'Preterm 2-4 мг/кг/сут elemental PO с 2-4 нед age. AOP+Epo 6 мг/кг/сут obligatory. Term breastfed 1 мг/кг с 4-6 мес. AAP COFN 2010; ESPGHAN 2014.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-vitamin-d-dose', 'Витамин D (rickets prevention / deficiency)', 'Profilaxis term 400 ед/сут; preterm 800-1000 ед/сут. Deficiency treatment 2000-10000 ед/сут × 4-12 нед. AAP COFN 2008; ESPGHAN 2013.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-rop-screen-timing', 'ROP screening timing (когда первый осмотр)', 'GA ≤ 27: 31 нед PMA. GA 28-32: 4 нед chronologic age. Whichever LATER. AAP/AAO/AAPOS 2018. Treatment threshold (Type 1) — laser/anti-VEGF в 72 ч.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-omeprazole-dose', 'Омепразол (GERD у preterm)', '0.5-1.5 мг/кг q24h PO/IV. Use selectively — большинство GERD у preterm physiologic. ⚠️ NEC risk у preterm. NASPGHAN/ESPGHAN 2018.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-folic-acid-dose', 'Фолиевая кислота (preterm + AOP)', '50 мкг/кг/сут PO preterm supplementation; 100-300 мкг/сут treatment megaloblastic. Co-administration с iron + Epo. AAP COFN; ESPGHAN 2010.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-cholestasis-criteria', 'Cholestasis у н/р (criteria + workup)', 'Conjugated bili > 1.0 мг/дл — cholestasis. ⚠️ Biliary atresia — most urgent (Kasai в 30-60 d). NASPGHAN/ESPGHAN 2017 (Fawaz JPGN).', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-pphn-screen', 'PPHN screening / criteria', 'Differential cyanosis (pre>post по 5-10%) + OI ≥ 15 + echo. iNO 20 ppm trial first; escalation милринон/sildenafil/ECMO. AHA 2019.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-vaccination-calendar', 'Календарь вакцинации (РФ/UZ/Intl)', 'HepB-1 + БЦЖ в 24 ч; DTP/IPV/Hib/PCV/Rotavirus по schedule по региону. Приказ МЗ РФ № 1122н; UZ нацкалендарь; WHO/CDC.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-fluconazole-dose', 'Флуконазол (antifungal)', 'Prophylaxis ELBW 3 мг/кг 2×/нед; treatment 12 мг/кг q24-72h по PMA. Kaufman NEJM 2001; Manzoni NEJM 2007. PO bioavailability ~ 100 %.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-cefotaxime-dose', 'Цефотаксим (sepsis / meningitis)', '50 мг/кг q6-12h IV по PMA + PNA. ⚠️ Preferred over ceftriaxone у н/р (no bilirubin displacement, no Ca precipitation).', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-levothyroxine-dose', 'Левотироксин (congenital hypothyroidism)', 'Initial 10-15 мкг/кг/сут PO term. ⚠️ Start в первые 2 нед — IQ critical. AAP/ESPGHAN 2014; ATA 2014.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-rsv-palivizumab', 'Palivizumab (RSV passive immunization)', '15 мг/кг IM monthly RSV season; max 5 doses. AAP COFN 2014/2023: GA < 29 нед, CLD/BPD, CHD. ⚠️ Nirsevimab (FDA 2023) replacing.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-cchd-pulse-oximetry', 'CCHD pulse oximetry screening', 'Pre/post-ductal SpO₂ в 24-48 ч. Pass: ≥ 95 % + diff < 3 %. Fail: < 90 % или persistent abnormalities → echo обязательно. AAP/AHA 2018.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-acyclovir-dose', 'Ацикловир (neonatal HSV)', '20 мг/кг IV q8h × 14-21 d (SEM 14, CNS/disseminated 21). PO suppression 300 мг/м² q8h × 6 мес. ⚠️ EMERGENCY — start empirically. CASG-103 NEJM 2011.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-meropenem-dose', 'Меропенем (broad-spectrum / MDR)', '20-40 мг/кг IV q8-12h по PMA + PNA + indication. Reserve antibiotic для MDR / NEC perforation / meningitis. AAP Red Book.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-immunoglobulin-ivig-dose', 'IVIG (HDN / NAIT / PID)', 'HDN 0.5-1 г/кг IV; NAIT 1 г/кг q24h × 1-3; PID replacement 400-600 мг/кг q3-4 нед. ⚠️ INIS 2011: NOT routine для sepsis.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-feeding-readiness', 'Oral Feeding Readiness (preterm)', '5-criteria PIOFRAS-style: physiologic + behavioral + oral motor + sucking + swallow safety. PMA 32-38 нед transition. Lau / Howe.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-newborn-screening', 'Newborn Metabolic Screening (timing)', 'Heel-prick blood spot 24-72 ч (optimal 48-72). РФ расширенный с 2023: 36 заболеваний (PKU, CH, CAH, galactosemia, CF, MCAD, MSUD, и др).', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-octreotide-dose', 'Октреотид (CHI KATP-resistant)', '5-25 мкг/кг/сут SC q6-8h (после diazoxide failure). Synthetic somatostatin → suppresses insulin. Long-acting LAR for chronic. Arnoux CHI guidelines.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-diazoxide-dose', 'Диазоксид (CHI maintenance)', '5-15 мг/кг/сут PO q8h + chlorothiazide 7-10 мг/кг q12h. KATP channel opener. Trial × 5-7 дней. Stanley Pediatrics 122:1124.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-paracetamol-dose', 'Парацетамол (analgesia + alt PDA closure)', '10-15 мг/кг q6-8h PO/IV/PR analgesia; PDA closure 15 мг/кг q6h × 3-7 дней (3-я линия). Allegaert Pediatrics 2014;134:e253.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-tof-spell-management', 'TOF tet spell management (cyanotic spell)', 'Step-wise: knee-to-chest → O₂ → calm → morphine → volume → bicarb → phenylephrine → esmolol → surgery. Park\'s; AHA/AAP.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-thermal-management', 'Thermal management (Golden hour)', 'QI bundle: OR temp ≥ 25 °C + polyethylene wrap (<32 нед без drying) + cap + chemical mattress + servo-controlled. Goal admission 36.5-37.5 °C. WHO/NRP/HBS.', '3. Педиатрические инструменты', 'Новорождённые', true),
  T('neo-budesonide-dose', 'Будесонид (BPD inhaled / intratracheal)', 'Yeh intratracheal 0.25 мг/кг + surfactant (NEJM 2016). Inhaled 200-500 мкг q12h. ⚠️ Bassler NEUROSIS 2015: ↑ mortality (controversial).', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-dexamethasone-dose', 'Дексаметазон (BPD systemic / DART)', 'DART regimen 0.075 → 0.05 → 0.025 → 0.01 мг/кг q12h × 10 d (cumulative 0.89 мг/кг). ⚠️ Yeh 1998 cerebral palsy concerns у ELBW < 7 d.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-azithromycin-dose', 'Азитромицин (alt erythromycin)', 'Pertussis 10 мг/кг q24h × 5 d; chlamydia 20 мг/кг q24h × 3 d (CDC 2021). Less IHPS risk vs erythromycin. Once-daily, shorter course.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-pyridoxine-dose', 'Пиридоксин (B6 refractory seizures)', 'Acute 50-100 мг IV slow + EEG monitoring; maintenance 15-30 мг/кг/сут PO PDE confirmed. ⚠️ Apnea risk acute. ALDH7A1 gene.', '3. Педиатрические инструменты', 'Дозирование', true),
  T('neo-extubation-readiness', 'Готовность к extubation (preterm)', '6-criteria: spontaneous breath + hemodynamic + FiO₂ ≤ 30% + minimal vent + caffeine + SBT. ↓ failure 30-40% → 10-20% с protocol. Caffeine + CPAP critical.', '3. Педиатрические инструменты', 'Новорождённые', true),

  // Дозирование
  T('pediatric-dose', 'Педиатрические дозы (mg/кг)', 'Расчёт безопасных доз 30 препаратов для детей по mg/кг с проверкой максимума. WHO · BNFc · AAP · APLS.', '3. Педиатрические инструменты', 'Дозирование', true),

  // Рост и развитие
  T('who-growth', 'WHO Growth Standards (0-5 лет)', 'Международные стандарты роста и веса у детей до 5 лет.', '3. Педиатрические инструменты', 'Рост и развитие', true),
  T('cdc-growth', 'CDC Growth Charts (2-20 лет)', 'Американские перцентили роста и развития детей и подростков.', '3. Педиатрические инструменты', 'Рост и развитие'),
  T('uk-who', 'UK-WHO charts (RCPCH)', 'Британские кривые роста для детей.', '3. Педиатрические инструменты', 'Рост и развитие'),
  T('ru-growth', 'Национальные таблицы РФ (Мазурин, Воронцов)', 'Российские нормативы роста и развития детей.', '3. Педиатрические инструменты', 'Рост и развитие'),
  T('intergrowth', 'Интергроуз-21 / Fenton chart', 'Кривые роста для недоношенных и после рождения.', '3. Педиатрические инструменты', 'Рост и развитие', true),
  T('tanner', 'Tanner stages (SMR I-V)', 'Оценка стадий полового созревания.', '3. Педиатрические инструменты', 'Рост и развитие'),
  T('head-growth', 'Рост головы / МПК / Z-score / BMI-for-age', 'Антропометрические нормы у детей и подростков.', '3. Педиатрические инструменты', 'Рост и развитие'),

  // Психомоторное развитие / скрининг
  T('denver', 'Denver II / ASQ-3 / Bayley-III/4 / Griffiths / PARS (РФ)', 'Скрининг психомоторного развития у детей.', '3. Педиатрические инструменты', 'Психомоторное развитие'),
  T('mchat', 'M-CHAT-R/F', 'Скрининг расстройств аутистического спектра у детей 16-30 месяцев.', '3. Педиатрические инструменты', 'Психомоторное развитие'),
  T('vanderbilt', 'Vanderbilt / Conners / SNAP-IV', 'Скрининг синдрома дефицита внимания и гиперактивности.', '3. Педиатрические инструменты', 'Психомоторное развитие'),

  // Экстренная педиатрия
  T('pat', 'Pediatric Assessment Triangle (PAT)', 'Быстрая визуальная оценка тяжести состояния ребёнка.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('pgcs', 'Pediatric GCS (pGCS) / AVPU', 'Оценка уровня сознания у детей.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('pecarn-head', 'PECARN head injury algorithm (<2 и ≥2 лет)', 'Показания к КТ головы у детей с ЧМТ.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('pecarn-cspine', 'PECARN C-spine / PECARN abdominal', 'Правила визуализации при травме у детей.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('kocher', 'Kocher criteria', 'Дифференциация септического артрита и транзиторного синовиита у детей.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('alvarado-pas', 'Alvarado / PAS (Samuel) / AIR', 'Оценка вероятности острого аппендицита.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('broselow', 'Broselow-Luten Tape', 'Быстрый подбор дозы и оборудования по росту ребёнка.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),
  T('pals', 'PALS algorithms', 'Алгоритмы расширенной педиатрической реанимации AHA.', '3. Педиатрические инструменты', 'Экстренная педиатрия'),

  // Дегидратация / гастроэнтерит
  T('who-dehydr', 'WHO (severe/some/no) / CDC / Gorelick / CDS', 'Оценка степени дегидратации у детей.', '3. Педиатрические инструменты', 'Дегидратация'),

  // Респираторные
  T('westley', 'Westley croup score', 'Оценка тяжести крупа (ларинготрахеита) у детей.', '3. Педиатрические инструменты', 'Респираторные'),
  T('pram', 'PRAM / PASS / PRESS / Wood-Downes', 'Оценка тяжести обострения астмы и бронхиолита у детей.', '3. Педиатрические инструменты', 'Респираторные'),
  T('tal', 'Tal / Wang score', 'Клиническая оценка тяжести бронхиолита.', '3. Педиатрические инструменты', 'Респираторные'),

  // Лихорадка младенцев
  T('rochester', 'Rochester / Philadelphia / Boston / Step-by-Step / PECARN febrile', 'Оценка риска серьёзной бактериальной инфекции у младенцев с лихорадкой.', '3. Педиатрические инструменты', 'Лихорадка'),
  T('imci', 'IMCI (WHO)', 'Интегрированное ведение болезней детского возраста в странах с ограниченными ресурсами.', '3. Педиатрические инструменты', 'Лихорадка'),

  // Шок / травма у детей
  T('sipa', 'SIPA (Shock Index Pediatric Age-adjusted)', 'Возраст-скорректированный индекс шока у детей.', '3. Педиатрические инструменты', 'Шок / Травма'),
  T('pts', 'Pediatric Trauma Score (PTS) / TRISS pediatric', 'Оценка тяжести и прогноза травмы у детей.', '3. Педиатрические инструменты', 'Шок / Травма'),

  // Иммунизация
  T('cdc-acip', 'CDC/ACIP (США)', 'Американский календарь профилактических прививок.', '3. Педиатрические инструменты', 'Иммунизация'),
  T('uk-green', 'UK Green Book', 'Британский календарь вакцинации.', '3. Педиатрические инструменты', 'Иммунизация'),
  T('ru-vaccine', 'Национальный календарь прививок РФ', 'Российский календарь профилактических прививок.', '3. Педиатрические инструменты', 'Иммунизация'),
  T('epi-who', 'EPI WHO / STIKO (Германия) / HAS (Франция)', 'Международные и национальные схемы вакцинации.', '3. Педиатрические инструменты', 'Иммунизация'),

  // ═══════════════════════════════════════════════
  // 4. КАРДИОЛОГИЯ И СОСУДЫ
  // ═══════════════════════════════════════════════

  // Оценка ССС-риска
  T('framingham', 'Framingham Risk Score (FRS)', 'Оценка 10-летнего риска ИБС (историческая шкала США).', '4. Кардиология и сосуды', 'ССС-риск'),
  T('ascvd', 'ASCVD Pooled Cohort Equations (ACC/AHA)', 'Оценка 10-летнего и пожизненного риска атеросклеротических ССЗ.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('prevent', 'PREVENT (AHA 2023)', 'Современная шкала риска ССЗ с учётом функции почек и метаболических факторов.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('score2', 'SCORE2 / SCORE2-OP (ESC 2021)', 'Оценка риска ССЗ в европейской популяции по регионам.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('qrisk3', 'QRISK3', 'Британская шкала риска ССЗ с учётом СКВ, мигрени, ВИЧ и др.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('reynolds', 'Reynolds Risk Score', 'Оценка ССС-риска с включением высокочувствительного CRP.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('who-ish', 'WHO/ISH risk charts', 'Оценка ССС-риска для стран с ограниченными ресурсами.', '4. Кардиология и сосуды', 'ССС-риск'),
  T('score2-ru', 'SCORE2 + GLOBORISK (РФ)', 'Оценка ССС-риска по рекомендациям РКО.', '4. Кардиология и сосуды', 'ССС-риск'),

  // Фибрилляция предсердий
  T('chads-vasc', 'CHA₂DS₂-VASc', 'Оценка риска инсульта и показаний к антикоагуляции при ФП.', '4. Кардиология и сосуды', 'Фибрилляция предсердий', true),
  T('ehra', 'EHRA symptom class (I-IV)', 'Классификация выраженности симптомов фибрилляции предсердий.', '4. Кардиология и сосуды', 'Фибрилляция предсердий'),
  T('4s-af', '4S-AF characterization (ESC)', 'Комплексная характеристика ФП для выбора стратегии лечения.', '4. Кардиология и сосуды', 'Фибрилляция предсердий'),

  // ОКС / ИМ
  T('timi', 'TIMI (UA/NSTEMI, STEMI)', 'Риск-стратификация при остром коронарном синдроме.', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('grace', 'GRACE 2.0', 'Оценка госпитальной и 6-месячной смертности при ОКС.', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('heart', 'HEART score / HEART Pathway', 'Триаж пациентов с болью в груди в отделении неотложной помощи.', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('edacs', 'EDACS-ADP', 'Ускоренный протокол оценки боли в груди (австралийский).', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('killip', 'Killip class (I-IV)', 'Классификация острой сердечной недостаточности при ИМ.', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('esc-nste', 'ESC 0/1-h и 0/2-h hs-cTn', 'Ускоренный алгоритм исключения ИМ по тропонину.', '4. Кардиология и сосуды', 'ОКС / ИМ'),
  T('sgarbossa', 'Sgarbossa / Smith modified', 'ЭКГ-критерии ИМ при блокаде левой ножки пучка Гиса.', '4. Кардиология и сосуды', 'ОКС / ИМ'),

  // Сердечная недостаточность
  T('nyha', 'NYHA I-IV', 'Функциональный класс хронической сердечной недостаточности.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),
  T('acc-aha-hf', 'ACC/AHA stages A-D', 'Стадии прогрессирования сердечной недостаточности.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),
  T('framingham-hf', 'Framingham HF criteria (Boston)', 'Клинические критерии диагностики ХСН.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),
  T('maggic', 'MAGGIC / Seattle HF / OPTIMIZE-HF / GWTG-HF', 'Оценка прогноза и выживаемости при ХСН.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),
  T('h2fpef', 'H2FPEF / HFA-PEFF', 'Диагностика ХСН с сохранённой фракцией выброса.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),
  T('forrester', 'Forrester / Nohria-Stevenson', 'Гемодинамические профили для выбора терапии ХСН.', '4. Кардиология и сосуды', 'Сердечная недостаточность'),

  // ТЭЛА
  T('bova', 'Bova / FAST score', 'Выявление пациентов промежуточно-высокого риска при ТЭЛА.', '4. Кардиология и сосуды', 'ТЭЛА'),
  T('esc-pe', 'ESC PE 2019/2024', 'Стратификация риска и выбор тактики при ТЭЛА.', '4. Кардиология и сосуды', 'ТЭЛА'),

  // Эндокардит / клапаны
  T('duke', 'Modified Duke Criteria (2023 ISCVID)', 'Диагностика инфекционного эндокардита.', '4. Кардиология и сосуды', 'Эндокардит / Клапаны'),
  T('euroscore', 'EuroSCORE II / STS Risk Score', 'Оценка риска смерти при кардиохирургических операциях.', '4. Кардиология и сосуды', 'Эндокардит / Клапаны'),
  T('wilkins', 'Wilkins / Cormier', 'Оценка пригодности митрального клапана для вальвулопластики.', '4. Кардиология и сосуды', 'Эндокардит / Клапаны'),

  // Стенокардия / ишемия
  T('ccs', 'CCS (Canadian Cardiovascular Society) I-IV', 'Классификация функциональных классов стенокардии.', '4. Кардиология и сосуды', 'Стенокардия'),
  T('diamond-forrester', 'Diamond-Forrester / CAD Consortium / ESC 2019', 'Оценка предтестовой вероятности ИБС.', '4. Кардиология и сосуды', 'Стенокардия'),
  T('duke-treadmill', 'Duke Treadmill Score', 'Прогноз по результатам нагрузочной пробы.', '4. Кардиология и сосуды', 'Стенокардия'),

  // Сосуды / аорта
  T('rutherford', 'Rutherford (0-6) / Fontaine (I-IV)', 'Классификация хронической ишемии нижних конечностей.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('abi', 'ABI / TBI / WIfI classification', 'Диагностика и стратификация риска при заболеваниях периферических артерий.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('stanford', 'Stanford (A/B) / DeBakey', 'Классификация расслоения аорты.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('crawford', 'Crawford', 'Классификация торакоабдоминальных аневризм аорты.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('aaa', 'AAA - аневризма брюшной аорты', 'Показания к плановому оперативному лечению аневризмы.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('ceap', 'CEAP', 'Классификация хронической венозной недостаточности.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),
  T('villalta', 'Villalta', 'Диагностика и тяжесть посттромботического синдрома.', '4. Кардиология и сосуды', 'Сосуды / Аорта'),

  // Гипертензия
  T('bp-guidelines', 'Целевые уровни АД (ACC/AHA, ESC, NICE, РКО)', 'Сравнение международных рекомендаций по целевому АД.', '4. Кардиология и сосуды', 'Гипертензия'),
  T('abpm', 'Ambulatory BP / HBPM критерии', 'Интерпретация суточного и домашнего мониторинга АД.', '4. Кардиология и сосуды', 'Гипертензия'),
  T('htn-tod', 'Поражение органов-мишеней (LVH, UACR)', 'Выявление поражения органов-мишеней при гипертензии.', '4. Кардиология и сосуды', 'Гипертензия'),

  // ЭКГ / ритм
  T('qtc', 'QTc: Bazett / Fridericia / Framingham / Hodges', 'Коррекция интервала QT на частоту сердечных сокращений.', '4. Кардиология и сосуды', 'ЭКГ / Ритм'),
  T('tisdale', 'Tisdale score', 'Оценка риска лекарственного удлинения QT.', '4. Кардиология и сосуды', 'ЭКГ / Ритм'),
  T('brugada', 'Brugada criteria', 'Дифф. диагностика тахикардии с широким QRS.', '4. Кардиология и сосуды', 'ЭКГ / Ритм'),
  T('lqts', 'Синдромы удлинённого QT (Romano-Ward, Jervell-Lange-Nielsen)', 'Диагностика наследственных каналопатий.', '4. Кардиология и сосуды', 'ЭКГ / Ритм'),

  // ═══════════════════════════════════════════════
  // 5. НЕВРОЛОГИЯ И НЕЙРОХИРУРГИЯ
  // ═══════════════════════════════════════════════

  // Сознание и кома
  T('gcs', 'Glasgow Coma Scale (GCS) + педиатрическая', 'Оценка уровня сознания при ЧМТ, инсульте, коме.', '5. Неврология и нейрохирургия', 'Сознание', true),
  T('four', 'FOUR Score (0-16)', 'Оценка сознания у интубированных пациентов (альтернатива GCS).', '5. Неврология и нейрохирургия', 'Сознание'),
  T('avpu', 'AVPU', 'Быстрая догоспитальная оценка уровня сознания.', '5. Неврология и нейрохирургия', 'Сознание'),
  T('acdu', 'ACDU / Grady / Jouvet / Glasgow-Liege', 'Альтернативные шкалы оценки сознания и комы.', '5. Неврология и нейрохирургия', 'Сознание'),

  // Инсульт
  T('nihss', 'NIHSS (0-42)', 'Оценка тяжести неврологического дефицита при инсульте.', '5. Неврология и нейрохирургия', 'Инсульт', true),
  T('mrs-stroke', 'mRS (0-6)', 'Оценка функциональных исходов после инсульта.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('abcd2', 'ABCD2 / ABCD3-I', 'Оценка риска инсульта в течение 2 суток после ТИА.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('aspects', 'ASPECTS / pc-ASPECTS', 'Оценка ранних ишемических изменений на КТ.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('fast', 'FAST / BE-FAST / CPSS / LAPSS / RACE / LAMS / VAN', 'Догоспитальный скрининг инсульта.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('toast', 'TOAST classification', 'Классификация этиологии ишемического инсульта.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('ich', 'ICH Score / FUNC / MICH', 'Прогноз при внутримозговом кровоизлиянии.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('hunt-hess', 'Hunt-Hess / Fisher / modified Fisher / PAASH', 'Тяжесть и прогноз субарахноидального кровоизлияния.', '5. Неврология и нейрохирургия', 'Инсульт'),
  T('wfns', 'WFNS SAH grading', 'Градация тяжести САК по шкале WFNS.', '5. Неврология и нейрохирургия', 'Инсульт', true),
  T('dragon', 'DRAGON / MRS-DRAGON / THRIVE / iScore / SPAN-100', 'Прогноз исходов после тромболизиса.', '5. Неврология и нейрохирургия', 'Инсульт'),

  // ЧМТ
  T('can-ct-head', 'Canadian CT Head Rule / New Orleans / NICE', 'Показания к КТ головы у взрослых при лёгкой ЧМТ.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('pecarn-chalice', 'PECARN / CHALICE / CATCH', 'Показания к КТ головы у детей при травме.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('marshall-ct', 'Marshall CT / Rotterdam / Stockholm / Helsinki', 'КТ-классификация тяжести ЧМТ.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('impact', 'IMPACT / CRASH', 'Прогноз исходов при тяжёлой ЧМТ.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('rancho', 'Rancho Los Amigos (I-X)', 'Оценка когнитивного восстановления после ЧМТ.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('drs', 'Disability Rating Scale (DRS)', 'Оценка инвалидизации после тяжёлой ЧМТ.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('scat', 'SCAT5 / SCAT6 / Child-SCAT', 'Оценка спортивного сотрясения мозга.', '5. Неврология и нейрохирургия', 'ЧМТ'),
  T('mace2', 'MACE 2', 'Военная оценка сотрясения мозга на поле боя.', '5. Неврология и нейрохирургия', 'ЧМТ'),

  // Эпилепсия
  T('ilae', 'ILAE 2017 classification', 'Классификация типов эпилептических припадков и эпилепсий.', '5. Неврология и нейрохирургия', 'Эпилепсия'),
  T('stess', 'STESS / EMSE / END-IT', 'Прогноз исходов при эпилептическом статусе.', '5. Неврология и нейрохирургия', 'Эпилепсия'),
  T('engel', 'Engel / ILAE outcome', 'Оценка исходов эпилептической хирургии.', '5. Неврология и нейрохирургия', 'Эпилепсия'),

  // Головная боль
  T('ichd3', 'ICHD-3', 'Международная классификация головных болей.', '5. Неврология и нейрохирургия', 'Головная боль'),
  T('midas', 'MIDAS / HIT-6 / MSQ', 'Оценка влияния мигрени на качество жизни.', '5. Неврология и нейрохирургия', 'Головная боль'),
  T('snoop', 'POUND / SNOOP(10) red flags', 'Скрининг опасных причин головной боли.', '5. Неврология и нейрохирургия', 'Головная боль'),

  // Деменция / когнитивные
  T('mmse', 'MMSE (Folstein, 0-30)', 'Скрининг когнитивных нарушений и деменции.', '5. Неврология и нейрохирургия', 'Деменция', true),
  T('moca', 'MoCA (0-30)', 'Скрининг лёгких когнитивных нарушений.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('mini-cog', 'Mini-Cog / GPCOG / AD8 / IQCODE', 'Короткий скрининг когнитивных нарушений.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('ace3', 'ACE-III / Addenbrooke\'s', 'Комплексная оценка когнитивных функций.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('cdr', 'CDR / FAST / GDS-Reisberg', 'Стадирование тяжести деменции.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('npi', 'NPI', 'Оценка нейропсихиатрических симптомов при деменции.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('hachinski', 'Hachinski Ischemic Score', 'Дифференциация сосудистой деменции и болезни Альцгеймера.', '5. Неврология и нейрохирургия', 'Деменция'),
  T('slums', 'SLUMS', 'Скрининг когнитивных нарушений (адаптация для США).', '5. Неврология и нейрохирургия', 'Деменция'),

  // Паркинсон
  T('updrs', 'UPDRS / MDS-UPDRS (I-IV)', 'Комплексная оценка двигательных нарушений при болезни Паркинсона.', '5. Неврология и нейрохирургия', 'Паркинсон'),
  T('hoehn', 'Hoehn and Yahr (1-5)', 'Стадирование болезни Паркинсона.', '5. Неврология и нейрохирургия', 'Паркинсон'),
  T('schwab', 'Schwab and England ADL', 'Оценка повседневной активности при болезни Паркинсона.', '5. Неврология и нейрохирургия', 'Паркинсон'),
  T('pdq39', 'PDQ-39', 'Оценка качества жизни при болезни Паркинсона.', '5. Неврология и нейрохирургия', 'Паркинсон'),

  // Рассеянный склероз
  T('edss', 'EDSS Kurtzke (0-10)', 'Оценка инвалидизации при рассеянном склерозе.', '5. Неврология и нейрохирургия', 'Рассеянный склероз'),
  T('msfc', 'MSFC / MSSS / ARMSS', 'Функциональные индексы при рассеянном склерозе.', '5. Неврология и нейрохирургия', 'Рассеянный склероз'),
  T('mcdonald', 'McDonald criteria 2017', 'Диагностические критерии рассеянного склероза.', '5. Неврология и нейрохирургия', 'Рассеянный склероз'),

  // Нейропатическая боль
  T('npsi', 'DN4 / LANSS / painDETECT / NPSI', 'Скрининг и характеристика нейропатической боли.', '5. Неврология и нейрохирургия', 'Нейропатическая боль'),
  T('tcns', 'TCNS / MNSI / NDS', 'Скрининг диабетической нейропатии.', '5. Неврология и нейрохирургия', 'Нейропатическая боль'),
  T('house-brackmann', 'House-Brackmann (I-VI) / Sunnybrook', 'Оценка тяжести пареза лицевого нерва.', '5. Неврология и нейрохирургия', 'Нейропатическая боль'),
  T('ctcae-neuro', 'CTCAE neuropathy grading', 'Градация химиотерапия-индуцированной нейропатии.', '5. Неврология и нейрохирургия', 'Нейропатическая боль'),

  // Миастения / ALS / GBS
  T('mgfa', 'MGFA (I-V) / MG-ADL / QMG / MG-QOL15', 'Классификация и оценка тяжести миастении.', '5. Неврология и нейрохирургия', 'Миастения / ALS / GBS'),
  T('alsfrs', 'ALSFRS-R (0-48) / King\'s / MiToS', 'Оценка функционального состояния при БАС.', '5. Неврология и нейрохирургия', 'Миастения / ALS / GBS'),
  T('hughes-gbs', 'Hughes GBS (0-6) / EGOS / mEGOS', 'Оценка тяжести и прогноза синдрома Гийена-Барре.', '5. Неврология и нейрохирургия', 'Миастения / ALS / GBS'),

  // Спинальная травма
  T('asia', 'ASIA / Frankel / ISNCSCI', 'Классификация спинальной травмы и неврологического дефицита.', '5. Неврология и нейрохирургия', 'Спинальная травма'),
  T('slic', 'SLIC / TLICS', 'Классификация переломов позвоночника и выбора тактики.', '5. Неврология и нейрохирургия', 'Спинальная травма'),

  // Нейрохирургия
  T('spetzler', 'Spetzler-Martin / Spetzler-Ponce', 'Оценка риска операции при артериовенозных мальформациях.', '5. Неврология и нейрохирургия', 'Нейрохирургия'),
  T('simpson', 'Simpson Grade (I-V)', 'Классификация радикальности резекции менингиомы.', '5. Неврология и нейрохирургия', 'Нейрохирургия'),
  T('evans', 'Evans index', 'КТ-индекс для диагностики гидроцефалии.', '5. Неврология и нейрохирургия', 'Нейрохирургия'),

  // Сон
  T('epworth', 'Epworth Sleepiness Scale (ESS)', 'Скрининг дневной сонливости.', '5. Неврология и нейрохирургия', 'Сон'),
  T('stop-bang', 'STOP-BANG / Berlin', 'Скрининг синдрома обструктивного апноэ сна.', '5. Неврология и нейрохирургия', 'Сон'),
  T('psqi', 'PSQI / ISI / SATED', 'Оценка качества сна и инсомнии.', '5. Неврология и нейрохирургия', 'Сон'),

  // ═══════════════════════════════════════════════
  // 6. АНЕСТЕЗИОЛОГИЯ И ICU
  // ═══════════════════════════════════════════════

  // Предоперационная
  T('asa-e', 'Предоперационные шкалы риска (ASA, RCRI, ACS NSQIP, METS, DASI)', 'Комплексная предоперационная оценка риска.', '6. Анестезиология и ICU', 'Предоперационная'),
  T('apfel', 'Apfel PONV (0-4)', 'Оценка риска послеоперационной тошноты и рвоты.', '6. Анестезиология и ICU', 'Предоперационная'),
  T('mallampati', 'Mallampati / Cormack-Lehane / LEMON / MACOCHA', 'Прогноз трудной интубации.', '6. Анестезиология и ICU', 'Предоперационная'),
  T('wilson-arne', 'Wilson / Arné / Naguib', 'Альтернативные шкалы прогноза трудной интубации.', '6. Анестезиология и ICU', 'Предоперационная'),
  T('bromage', 'Bromage scale', 'Оценка глубины моторного блока при эпидуральной анестезии.', '6. Анестезиология и ICU', 'Предоперационная'),
  T('aldrete', 'Aldrete / Modified Aldrete / PADSS / White-Song', 'Критерии выхода из анестезии и перевода из PACU.', '6. Анестезиология и ICU', 'Предоперационная'),

  // Тяжесть в ICU
  T('apache', 'APACHE II / III / IV', 'Оценка тяжести состояния и прогноза смертности в ICU.', '6. Анестезиология и ICU', 'Тяжесть в ICU'),
  T('saps', 'SAPS II / 3', 'Упрощённая оценка тяжести в ICU.', '6. Анестезиология и ICU', 'Тяжесть в ICU'),
  T('mpm', 'MPM II-0 / 24', 'Модель предсказания смертности в ICU.', '6. Анестезиология и ICU', 'Тяжесть в ICU'),
  T('mods-lods', 'SOFA / MODS / LODS / TISS-28 / NEMS', 'Оценка полиорганной дисфункции в ICU.', '6. Анестезиология и ICU', 'Тяжесть в ICU'),

  // Седация / делирий / боль
  T('rass', 'RASS / SAS Riker / Ramsay / MAAS', 'Оценка уровня седации в ICU.', '6. Анестезиология и ICU', 'Седация / Делирий'),
  T('cam-icu', 'CAM-ICU / ICDSC / Nu-DESC / 4AT', 'Скрининг делирия у пациентов в ICU.', '6. Анестезиология и ICU', 'Седация / Делирий'),
  T('bps-icu', 'BPS / CPOT / NVPS / ESCID', 'Оценка боли у невербальных пациентов в ICU.', '6. Анестезиология и ICU', 'Седация / Делирий'),

  // Сепсис
  T('sepsis3', 'Sepsis-3 (SOFA ≥ 2) / qSOFA', 'Современные критерии диагностики сепсиса.', '6. Анестезиология и ICU', 'Сепсис'),
  T('sirs', 'NEWS2 / MEDS / SIRS / PIRO / SIS / Shapiro', 'Скрининг и стратификация риска сепсиса.', '6. Анестезиология и ICU', 'Сепсис'),

  // ARDS
  T('berlin-ards', 'Berlin 2012 + Global 2023', 'Диагностические критерии и тяжесть ОРДС.', '6. Анестезиология и ICU', 'ARDS'),
  T('kigali', 'Kigali modification', 'Адаптация критериев ОРДС для стран с ограниченными ресурсами.', '6. Анестезиология и ICU', 'ARDS'),
  T('murray', 'Murray Lung Injury Score', 'Оценка тяжести острого повреждения лёгких.', '6. Анестезиология и ICU', 'ARDS'),
  T('rox', 'ROX index', 'Прогноз успешности высокопоточной кислородотерапии.', '6. Анестезиология и ICU', 'ARDS'),
  T('hacor', 'HACOR', 'Прогноз неудачи неинвазивной вентиляции лёгких.', '6. Анестезиология и ICU', 'ARDS'),
  T('rsbi', 'RSBI (Tobin)', 'Оценка готовности пациента к экстубации.', '6. Анестезиология и ICU', 'ARDS'),
  T('curb65', 'CURB-65 / PSI / SMART-COP / A-DROP', 'Оценка тяжести внебольничной пневмонии.', '6. Анестезиология и ICU', 'ARDS'),

  // AKI
  T('rifle', 'RIFLE / AKIN / KDIGO 2012', 'Диагностика и стадирование острого повреждения почек.', '6. Анестезиология и ICU', 'AKI'),
  T('mehta', 'Mehta / Cleveland Clinic', 'Оценка риска ОПП после кардиохирургии.', '6. Анестезиология и ICU', 'AKI'),
  T('fst', 'Furosemide stress test (FST)', 'Функциональный тест для прогноза прогрессии ОПП.', '6. Анестезиология и ICU', 'AKI'),

  // ECMO
  T('resp', 'RESP / SAVE', 'Прогноз выживаемости на VV-ECMO и VA-ECMO.', '6. Анестезиология и ICU', 'ECMO'),
  T('preserve', 'PRESERVE / ECMOnet / ENCOURAGE', 'Альтернативные шкалы прогноза при ECMO.', '6. Анестезиология и ICU', 'ECMO'),
  T('murray-ecmo', 'Murray score', 'Показания к началу ECMO при тяжёлом ОРДС.', '6. Анестезиология и ICU', 'ECMO'),

  // Ожоги
  T('rule-9', 'Rule of Nines / Lund-Browder / Wallace', 'Оценка площади ожогов.', '6. Анестезиология и ICU', 'Ожоги'),
  T('parkland-brooke', 'Parkland / Modified Brooke / Galveston', 'Расчёт инфузионной терапии при ожогах.', '6. Анестезиология и ICU', 'Ожоги'),
  T('absi', 'ABSI / Baux / Revised Baux / BOBI', 'Оценка тяжести и прогноза при ожогах.', '6. Анестезиология и ICU', 'Ожоги'),

  // Трансфузия
  T('trali', 'TRALI / TACO criteria (ISBT 2019)', 'Диагностика посттрансфузионных лёгочных осложнений.', '6. Анестезиология и ICU', 'Трансфузия'),
  T('mtp', 'Массивная трансфузия 1:1:1 (PROPPR) / TIC', 'Протоколы массивной трансфузии при кровопотере.', '6. Анестезиология и ICU', 'Трансфузия'),
  T('abc-tash', 'ABC / TASH / McLaughlin / RABT', 'Показания к активации протокола массивной трансфузии.', '6. Анестезиология и ICU', 'Трансфузия'),

  // Нейроинтенсив
  T('cpp', 'Церебральное перфузионное давление (CPP)', 'Расчёт перфузии мозга и целевые уровни при нейроинтенсиве.', '6. Анестезиология и ICU', 'Нейроинтенсив'),
  T('rap-prx', 'RAP / PRx', 'Оценка ауторегуляции мозгового кровотока.', '6. Анестезиология и ICU', 'Нейроинтенсив'),
  T('lund-rosner', 'Lund / Rosner concepts', 'Стратегии коррекции внутричерепной гипертензии.', '6. Анестезиология и ICU', 'Нейроинтенсив'),

  // Водно-электролитный
  T('plr', 'Passive leg raise / PLR + CO', 'Оценка волемической преднагрузки и ответа на инфузию.', '6. Анестезиология и ICU', 'Водно-электролитный'),
  T('svv', 'SVV / PPV / IVC collapsibility / Mini-fluid challenge', 'Динамические показатели волемического статуса.', '6. Анестезиология и ICU', 'Водно-электролитный'),

  // Остановка сердца
  T('ohca', 'OHCA / GO-FAR / CAHP / TTM / NULL-PLEASE', 'Прогноз выживаемости после остановки сердца.', '6. Анестезиология и ICU', 'Остановка сердца'),
  T('bis', 'BIS / SSEP / NSE', 'Оценка неврологического прогноза после остановки сердца.', '6. Анестезиология и ICU', 'Остановка сердца'),

  // ═══════════════════════════════════════════════
  // 7. ТРАВМАТОЛОГИЯ И ВОЕННАЯ МЕДИЦИНА
  // ═══════════════════════════════════════════════

  // Триаж массовых потерь
  T('start-civ', 'START / JumpSTART / SALT', 'Американские протоколы сортировки пострадавших при массовых поражениях.', '7. Травматология и военная медицина', 'Триаж MASCAL'),
  T('sieve-sort', 'SIEVE + SORT / MPTT-24', 'Британские военные протоколы сортировки при массовых поражениях.', '7. Травматология и военная медицина', 'Триаж MASCAL'),
  T('mchs-russia', 'МЧС РФ (I-IV цветовая)', 'Российский цветовой триаж при чрезвычайных ситуациях.', '7. Травматология и военная медицина', 'Триаж MASCAL'),
  T('stanag', 'NATO STANAG 2879', 'Натовский стандарт полевой сортировки раненых.', '7. Травматология и военная медицина', 'Триаж MASCAL'),

  // Оценка тяжести травмы
  T('iss', 'Injury Severity Score (ISS)', 'Общая оценка тяжести множественной травмы.', '7. Травматология и военная медицина', 'Тяжесть травмы'),
  T('niss', 'New ISS / AIS 2015 / ICISS / TMPM', 'Альтернативные шкалы тяжести травмы.', '7. Травматология и военная медицина', 'Тяжесть травмы'),
  T('triss', 'TRISS / ASCOT', 'Прогноз выживаемости при травме.', '7. Травматология и военная медицина', 'Тяжесть травмы'),
  T('rts', 'Revised Trauma Score / Triage RTS', 'Быстрая оценка тяжести и триаж при травме.', '7. Травматология и военная медицина', 'Тяжесть травмы'),
  T('kts', 'Kampala Trauma Score', 'Оценка травмы для стран с ограниченными ресурсами.', '7. Травматология и военная медицина', 'Тяжесть травмы'),
  T('shock-index', 'Shock Index / Modified SI / Age-SI', 'Ранняя оценка шока по ЧСС и АД.', '7. Травматология и военная медицина', 'Тяжесть травмы'),

  // Голова / шея / позвоночник
  T('can-cspine', 'Canadian C-Spine Rule / NEXUS C-spine', 'Показания к визуализации шейного отдела при травме.', '7. Травматология и военная медицина', 'Голова / Позвоночник'),
  T('ao-spine', 'TLICS / SLIC / AO Spine classification', 'Классификация переломов позвоночника и выбор тактики.', '7. Травматология и военная медицина', 'Голова / Позвоночник'),

  // Ортопедия
  T('ottawa-ankle', 'Ottawa Ankle/Foot Rules', 'Показания к рентгенографии при травме голеностопа и стопы.', '7. Травматология и военная медицина', 'Ортопедия', true),
  T('ottawa-knee', 'Ottawa Knee Rule', 'Показания к рентгенографии при травме коленного сустава у взрослых.', '7. Травматология и военная медицина', 'Ортопедия', true),
  T('ao-ota', 'AO/OTA 2018', 'Универсальная классификация переломов длинных костей.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('gustilo', 'Gustilo-Anderson (I-IIIC)', 'Классификация открытых переломов.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('tscherne', 'Tscherne', 'Классификация закрытых переломов по повреждению мягких тканей.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('salter-harris', 'Salter-Harris (I-V)', 'Классификация переломов ростковой зоны у детей.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('garden', 'Garden (I-IV) / Pauwels', 'Классификация переломов шейки бедренной кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('weber', 'Weber (A/B/C) / Lauge-Hansen', 'Классификация переломов голеностопного сустава.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('schatzker', 'Schatzker (I-VI)', 'Классификация переломов мыщелков большеберцовой кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('pipkin', 'Pipkin', 'Классификация переломов головки бедренной кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('neer', 'Neer / Codman', 'Классификация переломов проксимального отдела плечевой кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('mason-mayo', 'Mason / Mayo', 'Классификация переломов головки лучевой кости и локтевого отростка.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('frykman', 'Frykman', 'Классификация переломов дистального отдела лучевой кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('sanders', 'Sanders / Essex-Lopresti', 'Классификация переломов пяточной кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('russe', 'Russe', 'Классификация переломов ладьевидной кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('rockwood', 'Rockwood', 'Классификация повреждений акромиально-ключичного сустава.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('hawkins', 'Hawkins', 'Классификация переломов таранной кости.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('denis', 'Denis three-column', 'Трёхколонная классификация травм позвоночника.', '7. Травматология и военная медицина', 'Ортопедия'),
  T('young-burgess', 'Young-Burgess / Tile', 'Классификация переломов костей таза.', '7. Травматология и военная медицина', 'Ортопедия'),

  // Суставы / хрящ
  T('outerbridge', 'Outerbridge / ICRS', 'Классификация повреждений суставного хряща.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('kellgren', 'Kellgren-Lawrence (0-4)', 'Рентгенологическая оценка тяжести остеоартроза.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('tonnis', 'Tönnis', 'Рентгенологическая оценка остеоартроза тазобедренного сустава.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('insall-salvati', 'Insall-Salvati / Caton-Deschamps', 'Индексы положения надколенника на рентгене.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('ikdc', 'IKDC / Lysholm / Tegner / KOOS / WOMAC', 'Оценка функции коленного сустава и исходов.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('ucla-shoulder', 'UCLA / ASES / Constant-Murley / DASH / QuickDASH', 'Оценка функции плеча и верхней конечности.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),
  T('harris-hip', 'Harris Hip / Oxford Hip/Knee', 'Оценка функции тазобедренного и коленного суставов.', '7. Травматология и военная медицина', 'Суставы / Хрящ'),

  // Абдоминальная травма
  T('fast-us', 'FAST / eFAST', 'Ультразвуковой протокол оценки травмы.', '7. Травматология и военная медицина', 'Абдоминальная травма'),
  T('aast', 'AAST OIS', 'Классификация степени повреждения внутренних органов.', '7. Травматология и военная медицина', 'Абдоминальная травма'),
  T('big', 'BIG score', 'Оценка риска смертности при тупой травме у детей.', '7. Травматология и военная медицина', 'Абдоминальная травма'),

  // Общая / неотложная хирургия
  T('alvarado', 'Alvarado (MANTRELS) / AIR / RIPASA / PAS', 'Оценка вероятности острого аппендицита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('tokyo', 'Tokyo Guidelines TG18/TG24', 'Диагностика и оценка тяжести холецистита и холангита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('ranson', 'Ranson / Glasgow-Imrie / APACHE II / HAPS', 'Оценка тяжести и прогноза острого панкреатита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('bisap', 'BISAP', 'Шкала тяжести острого панкреатита за 24 ч.', '7. Травматология и военная медицина', 'Неотложная хирургия', true),
  T('atlanta', 'Revised Atlanta 2012 / Balthazar CTSI', 'Классификация тяжести острого панкреатита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('rockall', 'Rockall', 'Оценка риска при кровотечении из верхних отделов ЖКТ.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('gbs', 'Glasgow-Blatchford score', 'Оценка риска и необходимости эндоскопии при UGIB.', '7. Травматология и военная медицина', 'Неотложная хирургия', true),
  T('aims65', 'AIMS65', 'Шкала прогноза смертности при UGIB.', '7. Травматология и военная медицина', 'Неотложная хирургия', true),
  T('forrest', 'Forrest classification', 'Эндоскопическая классификация язвенного кровотечения.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('boey', 'Boey / ASA + Boey', 'Оценка риска смертности при перфоративной язве.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('mpi', 'Mannheim Peritonitis Index', 'Прогноз смертности при перитоните.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('hinchey', 'Hinchey (I-IV)', 'Классификация острого дивертикулита и выбор тактики.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('mayo-uc', 'Mayo / Truelove-Witts', 'Оценка тяжести язвенного колита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('cdai', 'Harvey-Bradshaw / CDAI', 'Оценка активности болезни Крона.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('child-meld', 'Child-Pugh / MELD / MELD-Na / MELD 3.0', 'Оценка тяжести цирроза и приоритета трансплантации печени.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('maddrey', 'Maddrey DF / ABIC / GAHS', 'Оценка тяжести алкогольного гепатита.', '7. Травматология и военная медицина', 'Неотложная хирургия'),
  T('lille', 'Lille model', 'Оценка ответа на ГКС через 7 дней при алкогольном гепатите.', '7. Травматология и военная медицина', 'Неотложная хирургия', true),
  T('fib4', 'FIB-4 / APRI / NAFLD FS / FibroTest / FibroScan', 'Неинвазивная оценка фиброза печени.', '7. Травматология и военная медицина', 'Неотложная хирургия'),

  // Военная медицина / TCCC
  T('tccc', 'TCCC (Tactical Combat Casualty Care)', 'Стандартный протокол тактической медицины на поле боя.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('march-paws', 'MARCH-PAWS', 'Мнемоника алгоритма оказания тактической помощи при травме.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('tecc', 'TECC', 'Протокол тактической помощи в гражданских условиях.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('phtls', 'PHTLS / ITLS (NAEMT)', 'Стандарты догоспитальной помощи при травме.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('9-line', '9-Line MEDEVAC / MIST / SBAR / AT-MIST', 'Стандартные форматы передачи информации при эвакуации.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('red-blood', 'Combat Pulse Check / R.E.D. whole blood', 'Протоколы переливания цельной крови в тактической медицине.', '7. Травматология и военная медицина', 'Военная медицина'),
  T('ru-military', '«Защита» / Гуманенко ВПХ / Указания МО РФ', 'Российские протоколы военно-полевой хирургии.', '7. Травматология и военная медицина', 'Военная медицина'),

  // ═══════════════════════════════════════════════
  // 8. АКУШЕРСТВО И ГИНЕКОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('naegele', 'Naegele\'s rule', 'Расчёт предполагаемой даты родов.', '8. Акушерство и гинекология', 'Беременность'),
  T('us-dates', 'CRL (Hadlock) / BPD / AC / FL', 'УЗ-датирование беременности и оценка размеров плода.', '8. Акушерство и гинекология', 'Беременность'),
  T('bishop', 'Bishop score (0-13) / modified / simplified', 'Оценка зрелости шейки матки перед индукцией родов.', '8. Акушерство и гинекология', 'Беременность'),
  T('ctg', 'FIGO / NICHD CTG (I/II/III)', 'Интерпретация кардиотокограммы плода.', '8. Акушерство и гинекология', 'Беременность'),
  T('stan', 'STAN ST-analysis', 'Оценка ЭКГ плода в родах.', '8. Акушерство и гинекология', 'Беременность'),
  T('acog-preeclampsia', 'ACOG 2020 / ISSHP 2018/2021', 'Современные критерии диагностики преэклампсии.', '8. Акушерство и гинекология', 'Преэклампсия'),
  T('hellp', 'HELLP Mississippi / Tennessee', 'Классификация тяжести HELLP-синдрома.', '8. Акушерство и гинекология', 'Преэклампсия'),
  T('pierce', 'fullPIERS / miniPIERS', 'Прогноз неблагоприятных исходов при преэклампсии.', '8. Акушерство и гинекология', 'Преэклампсия'),
  T('sflt', 'sFlt-1/PlGF ratio', 'Биомаркеры для исключения преэклампсии в ближайшую неделю.', '8. Акушерство и гинекология', 'Преэклампсия'),
  T('iadpsg', 'IADPSG / WHO / Carpenter-Coustan / NICE / РОАГ', 'Критерии диагностики гестационного сахарного диабета.', '8. Акушерство и гинекология', 'Диабет беременных'),
  T('cmqcc', 'CMQCC / AWHONN / RCOG 52', 'Протоколы профилактики и ведения послеродового кровотечения.', '8. Акушерство и гинекология', 'ПРК'),
  T('4t-pph', '«4 T»: Tone, Trauma, Tissue, Thrombin', 'Дифф. диагностика причин послеродового кровотечения.', '8. Акушерство и гинекология', 'ПРК'),
  T('epds', 'EPDS', 'Скрининг послеродовой депрессии.', '8. Акушерство и гинекология', 'Депрессия'),
  T('figo-staging', 'FIGO 2018 staging', 'Стадирование онкогинекологических заболеваний.', '8. Акушерство и гинекология', 'Гинекология'),
  T('iota', 'IOTA Simple Rules / ADNEX / RMI / ROMA', 'Оценка злокачественности образований яичников.', '8. Акушерство и гинекология', 'Гинекология'),
  T('bethesda-cyto', 'Bethesda System 2014', 'Классификация цитологии шейки матки.', '8. Акушерство и гинекология', 'Гинекология'),
  T('asccp', 'ASCCP 2019 risk-based', 'Управление рисками при патологии шейки матки.', '8. Акушерство и гинекология', 'Гинекология'),
  T('palm-coein', 'RCOG HMB / PALM-COEIN (FIGO)', 'Классификация аномальных маточных кровотечений.', '8. Акушерство и гинекология', 'Гинекология'),
  T('rotterdam', 'Rotterdam 2003 / AE-PCOS Society', 'Диагностические критерии синдрома поликистозных яичников.', '8. Акушерство и гинекология', 'Гинекология'),
  T('afs-enzian', 'AFS / rASRM / ENZIAN / #Enzian 2021', 'Классификация стадий и тяжести эндометриоза.', '8. Акушерство и гинекология', 'Гинекология'),
  T('popq', 'POP-Q', 'Классификация пролапса тазовых органов.', '8. Акушерство и гинекология', 'Гинекология'),
  T('who-mec', 'WHO MEC / CDC U.S. MEC 2024 / SPR', 'Критерии приемлемости методов контрацепции.', '8. Акушерство и гинекология', 'Контрацепция'),
  T('greene', 'Greene / Kupperman / MRS', 'Оценка выраженности климактерических симптомов.', '8. Акушерство и гинекология', 'Менопауза'),
  T('straw10', 'STRAW+10', 'Стадирование репродуктивного старения и менопаузы.', '8. Акушерство и гинекология', 'Менопауза'),
  T('frax-men', 'FRAX', 'Оценка 10-летнего риска остеопоротических переломов.', '8. Акушерство и гинекология', 'Менопауза'),
  T('rcog-37a', 'RCOG Green-top 37a', 'Оценка риска ВТЭ у беременных и родильниц.', '8. Акушерство и гинекология', 'ВТЭ и беременность'),

  // ═══════════════════════════════════════════════
  // 9. ПСИХИАТРИЯ И ПСИХОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('phq9', 'PHQ-9 / PHQ-2', 'Скрининг и мониторинг тяжести депрессии.', '9. Психиатрия и психология', 'Депрессия', true),
  T('bdi', 'BDI-II / BDI-Fast', 'Оценка выраженности симптомов депрессии.', '9. Психиатрия и психология', 'Депрессия'),
  T('ham-d', 'HAM-D / MADRS / QIDS / Zung / CES-D', 'Клинические шкалы тяжести депрессии.', '9. Психиатрия и психология', 'Депрессия'),
  T('gds', 'EPDS / GDS (гериатрия) / CDI (дети) / Kutcher', 'Специализированные шкалы депрессии по возрастным группам.', '9. Психиатрия и психология', 'Депрессия'),
  T('gad7', 'GAD-7', 'Скрининг генерализованного тревожного расстройства.', '9. Психиатрия и психология', 'Тревога', true),
  T('ham-a', 'HAM-A / BAI / STAI / PSWQ', 'Клинические шкалы тревожных расстройств.', '9. Психиатрия и психология', 'Тревога'),
  T('spin', 'SPIN / LSAS / Y-BOCS / OCI-R / PDSS / HARS', 'Оценка специфических тревожных расстройств.', '9. Психиатрия и психология', 'Тревога'),
  T('ymrs', 'YMRS / MDQ / HCL-32 / ASRM', 'Скрининг и оценка мании и биполярного расстройства.', '9. Психиатрия и психология', 'Биполярное'),
  T('panss', 'PANSS / BPRS / SAPS / SANS / CGI / GAF', 'Оценка тяжести симптомов психоза и общего функционирования.', '9. Психиатрия и психология', 'Психоз'),
  T('c-ssrs', 'C-SSRS (Columbia)', 'Оценка суицидальных идеаций и поведения (стандарт FDA).', '9. Психиатрия и психология', 'Суицид'),
  T('beck-ssi', 'Beck SSI / SAD PERSONS / P4 / NGASR / Sheehan-STS', 'Альтернативные шкалы оценки суицидального риска.', '9. Психиатрия и психология', 'Суицид'),
  T('cage-audit', 'AUDIT / MAST / T-ACE', 'Скрининг употребления алкоголя (расширенные шкалы).', '9. Психиатрия и психология', 'Зависимости'),
  T('cage', 'CAGE', 'Быстрый скрининг алкоголизма (4 вопроса).', '9. Психиатрия и психология', 'Зависимости', true),
  T('audit-c', 'AUDIT-C', 'Короткий скрининг проблемного употребления алкоголя (3 вопроса).', '9. Психиатрия и психология', 'Зависимости', true),
  T('ciwa', 'CIWA-Ar', 'Оценка тяжести алкогольного абстинентного синдрома.', '9. Психиатрия и психология', 'Зависимости'),
  T('dast', 'DAST-10/20 / ASSIST (WHO)', 'Скрининг употребления психоактивных веществ.', '9. Психиатрия и психология', 'Зависимости'),
  T('cows', 'COWS / SOWS / ClinOWS', 'Оценка тяжести опиоидного абстинентного синдрома.', '9. Психиатрия и психология', 'Зависимости'),
  T('fagerstrom', 'Fagerström (FTND/FTCD)', 'Оценка степени никотиновой зависимости.', '9. Психиатрия и психология', 'Зависимости'),
  T('crafft', 'CRAFFT', 'Скрининг употребления ПАВ у подростков.', '9. Психиатрия и психология', 'Зависимости'),
  T('pcl5', 'PCL-5 / CAPS-5 / PC-PTSD-5 / IES-R / DTS / ACE', 'Скрининг и диагностика ПТСР и травматических переживаний.', '9. Психиатрия и психология', 'ПТСР'),
  T('asrs', 'ASRS v1.1 (WHO)', 'Скрининг СДВГ у взрослых.', '9. Психиатрия и психология', 'СДВГ'),
  T('conners', 'Conners-3 / Vanderbilt / SNAP-IV / ADHD-RS-5', 'Оценка СДВГ у детей и подростков.', '9. Психиатрия и психология', 'СДВГ'),
  T('eat26', 'EAT-26 / SCOFF / EDE-Q / ChEAT / ANSOCQ', 'Скрининг расстройств пищевого поведения.', '9. Психиатрия и психология', 'Пищевое поведение'),
  T('mchat-autism', 'M-CHAT-R/F / ADOS-2 / ADI-R / CARS-2 / AQ / SRS-2', 'Скрининг и диагностика расстройств аутистического спектра.', '9. Психиатрия и психология', 'Аутизм'),
  T('mmpi', 'MMPI / PAI / MCMI / SCID-5-PD / PID-5 / Rorschach / TAT / 16PF / NEO-PI-R', 'Оценка личности и личностных расстройств.', '9. Психиатрия и психология', 'Личность'),
  T('scid', 'SCID-5 / MINI / CIDI / K-SADS-PL', 'Структурированные диагностические интервью по DSM.', '9. Психиатрия и психология', 'Общий скрининг'),
  T('dsm-icd', 'DSM-5-TR / МКБ-10 F / МКБ-11 / РБК', 'Основные международные классификации психических расстройств.', '9. Психиатрия и психология', 'Общий скрининг'),
  T('hcr20', 'HCR-20 V3 / VRAG / START / Brøset', 'Оценка риска насильственного поведения.', '9. Психиатрия и психология', 'Риск насилия'),
  T('cbcl', 'CBCL / YSR / TRF (Achenbach) / SDQ / PSC-17/35', 'Оценка эмоциональных и поведенческих проблем у детей и подростков.', '9. Психиатрия и психология', 'Дети и подростки'),
  T('whodas', 'GAF / WHODAS 2.0 / SOFAS / GAS', 'Оценка общего уровня функционирования при психических расстройствах.', '9. Психиатрия и психология', 'Функционирование'),

  // ═══════════════════════════════════════════════
  // 10. ОНКОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('tnm', 'TNM / AJCC 8th Ed. / UICC', 'Международная классификация стадий злокачественных новообразований.', '10. Онкология', 'Стадирование', true),
  T('figo-onco', 'FIGO', 'Стадирование гинекологических злокачественных опухолей.', '10. Онкология', 'Стадирование'),
  T('enneking', 'Enneking', 'Стадирование сарком мягких тканей и костей.', '10. Онкология', 'Стадирование'),
  T('ann-arbor', 'Ann Arbor / Lugano', 'Стадирование лимфом Ходжкина и неходжкинских.', '10. Онкология', 'Стадирование'),
  T('binet-rai', 'Binet / Rai', 'Стадирование хронического лимфолейкоза.', '10. Онкология', 'Стадирование'),
  T('iss-mm', 'ISS / R-ISS / R2-ISS / Durie-Salmon', 'Стадирование множественной миеломы.', '10. Онкология', 'Стадирование'),
  T('ecog-kps', 'ECOG PS / KPS / Lansky', 'Оценка общего функционального статуса онкологического больного.', '10. Онкология', 'Общий статус'),
  T('recist', 'RECIST 1.1 / iRECIST / irRC / mRECIST', 'Оценка ответа на противоопухолевое лечение.', '10. Онкология', 'Ответ на лечение'),
  T('cheson', 'Cheson / Lugano / IWG / IMWG', 'Оценка ответа на лечение лимфом и миеломы.', '10. Онкология', 'Ответ на лечение'),
  T('percist', 'PERCIST', 'Оценка метаболического ответа по ПЭТ.', '10. Онкология', 'Ответ на лечение'),
  T('ctcae', 'CTCAE v5.0 (NCI)', 'Градация побочных эффектов онкологической терапии.', '10. Онкология', 'Токсичность'),
  T('rtog-eortc', 'RTOG/EORTC late effects', 'Оценка поздних лучевых повреждений.', '10. Онкология', 'Токсичность'),
  T('gleason', 'Gleason / ISUP Grade', 'Гистологическая классификация рака простаты.', '10. Онкология', 'Специфические'),
  T('d-amico', 'D\'Amico / NCCN risk groups', 'Стратификация риска при раке простаты.', '10. Онкология', 'Специфические'),
  T('nottingham', 'Nottingham / HER2 ASCO/CAP / Ki-67 / IHC4', 'Гистологические показатели рака молочной железы.', '10. Онкология', 'Специфические'),
  T('oncotype', 'Oncotype DX / MammaPrint / BCI', 'Молекулярные тесты рецидива при раке молочной железы.', '10. Онкология', 'Специфические'),
  T('npi-breast', 'Nottingham Prognostic Index (NPI)', 'Прогностический индекс при раке молочной железы.', '10. Онкология', 'Специфические'),
  T('birads', 'BI-RADS (ACR)', 'Стандартизированная оценка маммографии, УЗИ и МРТ молочных желёз.', '10. Онкология', 'Специфические'),
  T('tirads', 'TI-RADS (ACR/EU/K)', 'Стандартизированная оценка узлов щитовидной железы.', '10. Онкология', 'Специфические'),
  T('lirads', 'LI-RADS', 'Стандартизированная оценка очаговых образований печени.', '10. Онкология', 'Специфические'),
  T('pirads', 'PI-RADS v2.1', 'Стандартизированная оценка МРТ простаты.', '10. Онкология', 'Специфические'),
  T('orads', 'O-RADS', 'Стандартизированная оценка образований яичников.', '10. Онкология', 'Специфические'),
  T('lungrads', 'Lung-RADS', 'Стандартизированная оценка узлов в лёгких при скрининге.', '10. Онкология', 'Специфические'),
  T('gail', 'Gail / Tyrer-Cuzick (IBIS) / BOADICEA / CanRisk', 'Оценка индивидуального риска рака молочной железы.', '10. Онкология', 'Скрининг рисков'),
  T('brca-models', 'BRCA1/2 risk models / Manchester / Myriad', 'Оценка вероятности наследственных мутаций BRCA.', '10. Онкология', 'Скрининг рисков'),
  T('mascc', 'MASCC / CINV / Hesketh', 'Оценка риска тошноты и рвоты при химиотерапии.', '10. Онкология', 'Профилактика'),
  T('khorana-onco', 'Khorana / ONKOTEV', 'Оценка риска ВТЭ у онкологических пациентов.', '10. Онкология', 'Профилактика'),
  T('febrile-neutro', 'MASCC / CISNE', 'Оценка риска осложнений при фебрильной нейтропении.', '10. Онкология', 'Профилактика'),
  T('pps', 'PPS / PPI / ESAS / FACIT-F / EORTC QLQ-C30 / PaP', 'Оценка статуса и качества жизни в паллиативе.', '10. Онкология', 'Паллиатив'),
  T('who-ladder', 'WHO Analgesic Ladder', 'Ступенчатая схема обезболивания по ВОЗ.', '10. Онкология', 'Паллиатив'),
  T('aor-ru', 'КР АОР / Минздрав РФ', 'Российские клинические рекомендации по онкологии.', '10. Онкология', 'Российские стандарты'),

  // ═══════════════════════════════════════════════
  // 11. ИНФЕКЦИОННЫЕ БОЛЕЗНИ
  // ═══════════════════════════════════════════════
  T('ssc', 'Surviving Sepsis Campaign bundles', 'Международные протоколы ведения сепсиса и септического шока.', '11. Инфекционные болезни', 'Сепсис'),
  T('cap-scores', 'CURB-65 / CRB-65 / PSI / PORT / SMART-COP / A-DROP', 'Оценка тяжести внебольничной пневмонии.', '11. Инфекционные болезни', 'Пневмония'),
  T('covid', '4C Mortality / COVID-GRAM / NEWS2 COVID / CO-RADS', 'Оценка тяжести и прогноза при COVID-19.', '11. Инфекционные болезни', 'COVID-19'),
  T('hiv-who', 'WHO clinical staging / CDC A/B/C + CD4', 'Клиническое и иммунологическое стадирование ВИЧ-инфекции.', '11. Инфекционные болезни', 'ВИЧ'),
  T('vacs', 'VACS Index / D:A:D', 'Оценка сердечно-сосудистого и общего риска у пациентов с ВИЧ.', '11. Инфекционные болезни', 'ВИЧ'),
  T('apri-hep', 'APRI / FIB-4 / NAFLD FS', 'Неинвазивная оценка фиброза печени при гепатитах.', '11. Инфекционные болезни', 'Гепатиты'),
  T('aasld', 'AASLD / EASL / РНОГ protocols', 'Международные и российские рекомендации по гепатитам.', '11. Инфекционные болезни', 'Гепатиты'),
  T('centor', 'Centor / McIsaac', 'Оценка вероятности стрептококкового фарингита и показаний к антибиотикам.', '11. Инфекционные болезни', 'Бактериальные'),
  T('feverpain', 'FeverPAIN', 'Британская шкала оценки фарингита и показаний к антибиотикам.', '11. Инфекционные болезни', 'Бактериальные'),
  T('who-tb', 'WHO IMCI + TB scoring / Bandim / Wejse', 'Скрининг и диагностика туберкулёза.', '11. Инфекционные болезни', 'ТБ'),
  T('nigrovic', 'Bacterial Meningitis Score (Nigrovic)', 'Дифференциация бактериального и вирусного менингита у детей.', '11. Инфекционные болезни', 'Менингит'),
  T('thwaites', 'Thwaites\' score', 'Дифф. диагностика туберкулёзного и бактериального менингита.', '11. Инфекционные болезни', 'Менингит'),
  T('gmsps', 'Glasgow Meningococcal Septicaemia (GMSPS)', 'Оценка тяжести менингококкового сепсиса.', '11. Инфекционные болезни', 'Менингит'),
  T('who-malaria', 'WHO severe malaria / COMA scores', 'Критерии тяжёлой малярии и оценка церебральной формы.', '11. Инфекционные болезни', 'Малярия'),
  T('bristol', 'Bristol Stool Scale', 'Визуальная классификация формы стула.', '11. Инфекционные болезни', 'Контроль инфекций'),
  T('mccabe', 'McCabe-Jackson', 'Оценка прогноза основного заболевания у пациентов с инфекциями.', '11. Инфекционные болезни', 'Контроль инфекций'),
  T('senic', 'SENIC / CDC NHSN', 'Эпидемиологический мониторинг госпитальных инфекций.', '11. Инфекционные болезни', 'Контроль инфекций'),

  // ═══════════════════════════════════════════════
  // 12. НЕФРОЛОГИЯ И УРОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('kdigo', 'RIFLE / AKIN / KDIGO 2012', 'Диагностика и стадирование острого повреждения почек.', '12. Нефрология и урология', 'ОПП'),
  T('kdigo-ckd', 'KDIGO категории G1-G5 + A1-A3', 'Классификация хронической болезни почек.', '12. Нефрология и урология', 'ХБП'),
  T('kfre', 'Kidney Failure Risk Equation (Tangri)', 'Оценка риска развития терминальной ХБП за 2-5 лет.', '12. Нефрология и урология', 'ХБП'),
  T('renal-dose', 'Коррекция доз при ХБП/ХПБ', 'Подбор дозы препаратов с учётом стадии ХБП. KDIGO 2024 · EHRA 2021 · FDA · ГРЛС РФ.', '12. Нефрология и урология', 'ХБП', true),
  T('ktv', 'Kt/V / URR', 'Оценка адекватности процедуры гемодиализа.', '12. Нефрология и урология', 'Диализ'),
  T('renal', 'RENAL / PADUA / ESA / STONE', 'Нефрометрическая оценка сложности удаления опухоли почки.', '12. Нефрология и урология', 'Урология'),
  T('ipss', 'IPSS (AUA Symptom Score)', 'Оценка тяжести симптомов нижних мочевыводящих путей при ДГПЖ.', '12. Нефрология и урология', 'Урология'),
  T('iief', 'IIEF-5 (SHIM)', 'Скрининг и оценка тяжести эректильной дисфункции.', '12. Нефрология и урология', 'Урология'),
  T('iciq', 'ICIQ / MESA / BFLUTS / OABSS', 'Оценка недержания мочи и гиперактивного мочевого пузыря.', '12. Нефрология и урология', 'Урология'),
  T('capra', 'D\'Amico / CAPRA / Partin tables', 'Стратификация риска и прогноз при раке простаты.', '12. Нефрология и урология', 'Урология'),
  T('psa', 'PSA velocity / density / free PSA ratio', 'Интерпретация динамики ПСА для выявления рака простаты.', '12. Нефрология и урология', 'Урология'),
  T('nmibc', 'EAU NMIBC risk (EORTC, CUETO)', 'Оценка риска рецидива и прогрессии немышечно-инвазивного рака мочевого пузыря.', '12. Нефрология и урология', 'Урология'),
  T('stone', 'S.T.O.N.E. / Guy\'s / RIRS', 'Оценка сложности и выбор тактики при мочекаменной болезни.', '12. Нефрология и урология', 'Урология'),
  T('pvr', 'EAU post-void residual / Prostate Volume', 'Оценка остаточной мочи и объёма простаты.', '12. Нефрология и урология', 'Урология'),

  // ═══════════════════════════════════════════════
  // 13. ПУЛЬМОНОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('gold', 'GOLD 2024 ABE / ABCD', 'Классификация групп риска и выбор терапии ХОБЛ.', '13. Пульмонология', 'ХОБЛ'),
  T('mmrc', 'mMRC / CAT', 'Оценка выраженности симптомов при ХОБЛ.', '13. Пульмонология', 'ХОБЛ'),
  T('bode', 'BODE index / ADO / DOSE', 'Оценка прогноза выживаемости при ХОБЛ.', '13. Пульмонология', 'ХОБЛ'),
  T('act', 'Asthma Control Test (ACT)', 'Оценка контроля бронхиальной астмы за последние 4 недели.', '13. Пульмонология', 'Астма', true),
  T('gli', 'FEV₁/FVC / GLI reference', 'Интерпретация спирометрии с учётом возраста, пола и роста.', '13. Пульмонология', 'ХОБЛ'),
  T('gina', 'GINA 2024 control / ACT / ACQ-7 / PAQLQ', 'Оценка контроля бронхиальной астмы.', '13. Пульмонология', 'Астма'),
  T('faced', 'FACED / BSI', 'Оценка тяжести и прогноза при бронхоэктатической болезни.', '13. Пульмонология', 'Бронхоэктазы'),
  T('gap-ild', 'GAP index / ILD-GAP', 'Прогноз выживаемости при идиопатическом лёгочном фиброзе.', '13. Пульмонология', 'ИЛФ / ILD'),
  T('reveal', 'WHO FC / REVEAL 2.0 / Lite2 / COMPERA / SPAHR', 'Стратификация риска при лёгочной артериальной гипертензии.', '13. Пульмонология', 'Лёгочная гипертензия'),
  T('ralph', 'X-ray (Ralph, Timika) / Simplified TB / Wejse / Bandim', 'Рентгенологическая и клиническая оценка туберкулёза.', '13. Пульмонология', 'ТБ'),
  T('ahi', 'STOP-BANG / Berlin / ESS / NoSAS / AHI', 'Скрининг и стратификация тяжести обструктивного апноэ сна.', '13. Пульмонология', 'СОАС'),
  T('o2-cylinder', 'Время работы кислородного баллона', 'Сколько минут хватит баллона при заданном потоке (E/D/M/H, ISO).', '13. Пульмонология', 'Оксигенотерапия', true),

  // ═══════════════════════════════════════════════
  // 14. ФАРМАКОЛОГИЯ И ЛЕКАРСТВА
  // ═══════════════════════════════════════════════
  T('lexicomp', 'Lexicomp / Micromedex / UpToDate / Epocrates', 'Американские лекарственные справочники и базы взаимодействий.', '14. Фармакология и лекарства', 'Справочники'),
  T('stockley', 'Stockley\'s Drug Interactions', 'Британский справочник клинически значимых взаимодействий.', '14. Фармакология и лекарства', 'Справочники'),
  T('bnf', 'BNF / BNFc', 'Официальный британский формуляр лекарственных средств.', '14. Фармакология и лекарства', 'Справочники'),
  T('martindale', 'Martindale / Medscape / Davis\'s Drug Guide', 'Общие лекарственные справочники.', '14. Фармакология и лекарства', 'Справочники'),
  T('rote-liste', 'ABDATA / Rote Liste', 'Немецкий лекарственный справочник.', '14. Фармакология и лекарства', 'Справочники'),
  T('vidal', 'Vidal', 'Французский лекарственный справочник, адаптированный в России.', '14. Фармакология и лекарства', 'Справочники'),
  T('rls-ru', 'РЛС / Видаль РФ / Машковский', 'Российские лекарственные справочники.', '14. Фармакология и лекарства', 'Справочники'),
  T('mims', 'MIMS', 'Лекарственный справочник Австралии и стран Азии.', '14. Фармакология и лекарства', 'Справочники'),
  T('asia-drug', 'JADD / KIMS / China Pharmacopoeia / ChemoMeds', 'Азиатские лекарственные справочники (Япония, Корея, Китай, Индия).', '14. Фармакология и лекарства', 'Справочники'),
  T('sanford', 'Sanford Guide / Johns Hopkins ABX / eTG / AMH', 'Справочники по антибиотикотерапии.', '14. Фармакология и лекарства', 'Антибиотики'),
  T('credmeds', 'CredibleMeds (Arizona CERT) / Tisdale', 'База препаратов, удлиняющих QT и вызывающих Torsades.', '14. Фармакология и лекарства', 'QT-prolongation'),
  T('cpic', 'CPIC / DPWG / CPNDS / PharmGKB', 'Рекомендации по фармакогенетическому дозированию.', '14. Фармакология и лекарства', 'Фармакогеномика'),
  T('beers', 'Beers / STOPP/START / FORTA / PRISCUS', 'Критерии потенциально неподходящих лекарств у пожилых.', '14. Фармакология и лекарства', 'Гериатрия'),
  T('pllr', 'FDA PLLR / ADEC / Hale\'s Lactation / LactMed', 'Справочники безопасности препаратов при беременности и лактации.', '14. Фармакология и лекарства', 'Беременность / Лактация'),
  T('harriet-lane', 'Frank Shann / Harriet Lane / Nelson Pediatric Antimicrobial', 'Справочники детских дозировок препаратов.', '14. Фармакология и лекарства', 'Детские дозы'),
  T('who-eml', 'WHO Model List of Essential Medicines', 'Перечень жизненно важных лекарственных средств ВОЗ.', '14. Фармакология и лекарства', 'Поддержка'),
  T('vernakalant-dose', 'Vernakalant (Brinavess) — доза', 'Расчёт дозы вернакаланта для фармакологической кардиоверсии ФП.', '14. Фармакология и лекарства', 'Дозирование', true),
  T('bac-widmark', 'BAC / Widmark — расчёт промилле алкоголя', 'Концентрация этанола в крови по формуле Видмарка.', '14. Фармакология и лекарства', 'Токсикология', true),

  // ═══════════════════════════════════════════════
  // 15. ЛАБОРАТОРНАЯ МЕДИЦИНА
  // ═══════════════════════════════════════════════
  T('clsi', 'CLSI C28-A3 / IFCC / Common Reference / CALIPER (peds)', 'Международные стандарты лабораторных референсных интервалов.', '15. Лабораторная медицина', 'Референсы'),
  T('mayo-arup', 'Mayo Clinic / ARUP / Quest / LabCorp', 'Американские лабораторные справочники и референсы.', '15. Лабораторная медицина', 'Референсы'),
  T('ru-lab', 'РФ: МР 3.3.1.4-04, приказы МЗ', 'Российские нормативные референсные интервалы.', '15. Лабораторная медицина', 'Референсы'),
  T('meld', 'MELD / MELD-Na / MELD 3.0 / PELD / UKELD', 'Оценка тяжести заболеваний печени и приоритета трансплантации.', '15. Лабораторная медицина', 'Печень', true),
  T('maddrey-lab', 'Maddrey DF / Lille / Glasgow AH', 'Оценка тяжести алкогольного гепатита и ответа на ГКС.', '15. Лабораторная медицина', 'Печень'),
  T('fib4-lab', 'FIB-4 / APRI', 'Неинвазивная оценка фиброза печени по лабораторным данным.', '15. Лабораторная медицина', 'Печень'),
  T('guci', 'GUCI (Göteborg University Cirrhosis Index)', 'Неинвазивная оценка цирроза при HCV — шведская разработка.', '15. Лабораторная медицина', 'Печень', true),
  T('nafld-fs', 'NAFLD FS / BARD / HAIR / NAFL-PT', 'Оценка фиброза при неалкогольной жировой болезни печени.', '15. Лабораторная медицина', 'Печень'),
  T('fibrotest', 'FibroTest / FibroSure / ELF test / FibroScan', 'Неинвазивная оценка стеатоза и фиброза печени.', '15. Лабораторная медицина', 'Печень'),
  T('wintrobe', 'Эритроцитарные индексы (MCV / MCH / MCHC / RDW)', 'Дифференциальная диагностика анемий.', '15. Лабораторная медицина', 'Гематология'),
  T('rpi', 'RPI / Absolute reticulocyte / CHr', 'Оценка регенераторной активности костного мозга.', '15. Лабораторная медицина', 'Гематология'),
  T('tibc', 'TIBC / transferrin saturation / ferritin', 'Оценка обмена железа и диагностика железодефицита.', '15. Лабораторная медицина', 'Гематология'),
  T('plasmic', 'PLASMIC / French score', 'Оценка вероятности тромботической тромбоцитопенической пурпуры.', '15. Лабораторная медицина', 'Гематология'),
  T('dic', 'ISTH DIC / JMHW DIC / JAAM DIC', 'Диагностика синдрома диссеминированного внутрисосудистого свёртывания.', '15. Лабораторная медицина', 'Гематология'),
  T('hit-lab', '4T / HEP score', 'Оценка вероятности гепарин-индуцированной тромбоцитопении.', '15. Лабораторная медицина', 'Гематология'),
  T('agapss', 'Adjusted Global APS Score (aGAPSS)', 'Оценка риска тромбоза при антифосфолипидном синдроме.', '15. Лабораторная медицина', 'Гематология'),
  T('inr-coag', 'INR / aPTT / TT / Anti-Xa / TEG / ROTEM', 'Оценка системы свёртывания крови.', '15. Лабораторная медицина', 'Коагуляция'),
  T('age-ddimer', 'Age-adjusted D-dimer', 'Возраст-скорректированный порог D-димера у пациентов > 50 лет.', '15. Лабораторная медицина', 'Коагуляция'),
  T('homa-ir', 'HOMA-IR / QUICKI / Matsuda / HOMA-β', 'Оценка инсулинорезистентности и функции β-клеток.', '15. Лабораторная медицина', 'Эндокринология'),
  T('hba1c', 'HbA1c ↔ eAG', 'Перевод HbA1c в среднюю глюкозу за 2-3 месяца.', '15. Лабораторная медицина', 'Эндокринология'),
  T('tsh', 'TSH reflex / FT4 / FT3 / antiTPO', 'Диагностика патологии щитовидной железы.', '15. Лабораторная медицина', 'Эндокринология'),
  T('cortisol', 'ACTH stim / LDST / HDST / Midnight salivary', 'Диагностика гипер- и гипокортизолизма.', '15. Лабораторная медицина', 'Эндокринология'),
  T('arr', 'Aldosterone/Renin Ratio (ARR)', 'Скрининг первичного гиперальдостеронизма.', '15. Лабораторная медицина', 'Эндокринология'),
  T('calcium-pth', 'Calcium correction / PTH / vitamin D', 'Диагностика нарушений кальциевого обмена.', '15. Лабораторная медицина', 'Эндокринология'),
  T('friedewald', 'Friedewald LDL', 'Расчёт ЛПНП по липидному профилю.', '15. Лабораторная медицина', 'Липиды'),
  T('martin-hopkins', 'Martin-Hopkins / Sampson', 'Точные формулы расчёта ЛПНП при высоких триглицеридах.', '15. Лабораторная медицина', 'Липиды'),
  T('non-hdl', 'Non-HDL / ApoB / Lp(a)', 'Современные маркеры атерогенности.', '15. Лабораторная медицина', 'Липиды'),
  T('henderson-lab', 'Henderson-Hasselbalch / Winter / Albert / delta-delta', 'Анализ кислотно-щелочного состояния.', '15. Лабораторная медицина', 'Газы крови'),
  T('spot-urine', 'Spot UPCR / UACR / FENa / FEUrea / Urine osm gap / TTKG', 'Разовые анализы мочи для диагностики патологии почек.', '15. Лабораторная медицина', 'Моча'),
  T('hs-ctn', 'hs-cTn cutoffs', 'Пороговые значения высокочувствительного тропонина.', '15. Лабораторная медицина', 'Сердечные маркеры'),
  T('nt-probnp', 'NT-proBNP / BNP cutoffs', 'Возраст-скорректированные пороги для диагностики острой ХСН.', '15. Лабораторная медицина', 'Сердечные маркеры'),
  T('tumor-markers', 'CEA / CA 19-9 / CA 125 / AFP / hCG / PSA и др.', 'Онкомаркеры в диагностике и мониторинге.', '15. Лабораторная медицина', 'Опухолевые маркеры'),

  // ═══════════════════════════════════════════════
  // 16. СПРАВОЧНИКИ И КЛАССИФИКАТОРЫ
  // ═══════════════════════════════════════════════
  T('icd10', 'ICD-10 / МКБ-10 (WHO)', 'Международная классификация болезней 10-го пересмотра.', '16. Справочники и классификаторы', 'Диагнозы'),
  T('icd10cm', 'ICD-10-CM', 'Клиническая модификация МКБ-10, используемая в США.', '16. Справочники и классификаторы', 'Диагнозы'),
  T('icd11', 'ICD-11 (WHO)', 'Международная классификация болезней 11-го пересмотра.', '16. Справочники и классификаторы', 'Диагнозы'),
  T('dsm5tr', 'DSM-5-TR (APA)', 'Диагностическое и статистическое руководство по психическим расстройствам.', '16. Справочники и классификаторы', 'Диагнозы'),
  T('icpc', 'ICPC-2 / ICPC-3 (WONCA)', 'Международная классификация в первичной медицинской помощи.', '16. Справочники и классификаторы', 'Диагнозы'),
  T('icd10-pcs', 'ICD-10-PCS / CPT / HCPCS / OPCS-4 / Номенклатура 804н', 'Классификации и номенклатуры медицинских процедур.', '16. Справочники и классификаторы', 'Процедуры'),
  T('snomed', 'SNOMED CT', 'Мультиязычная стандартизированная медицинская терминология.', '16. Справочники и классификаторы', 'Терминологии'),
  T('loinc', 'LOINC', 'Стандартная терминология лабораторных и клинических наблюдений.', '16. Справочники и классификаторы', 'Терминологии'),
  T('rxnorm', 'RxNorm / NDC / ATC/DDD / DM+D / ЕСКЛП', 'Стандартизированные классификации лекарственных средств.', '16. Справочники и классификаторы', 'Терминологии'),
  T('umls', 'UMLS Metathesaurus / MeSH', 'Метасловарь и тезаурус медицинских терминов.', '16. Справочники и классификаторы', 'Терминологии'),
  T('nanda', 'NANDA-I / NIC / NOC / ICNP / Omaha System', 'Классификации сестринских диагнозов и вмешательств.', '16. Справочники и классификаторы', 'Сестринство'),
  T('icd-o', 'ICD-O-3.2 / TNM AJCC / WHO Classification of Tumours', 'Онкологические классификаторы и номенклатуры.', '16. Справочники и классификаторы', 'Онкология'),
  T('fdi', 'FDI / Universal Numbering (ADA) / Palmer', 'Системы нумерации зубов.', '16. Справочники и классификаторы', 'Стоматология'),
  T('icd10-da', 'ICD-10-DA / SNODENT', 'Стандартизированные стоматологические классификаторы.', '16. Справочники и классификаторы', 'Стоматология'),
  T('icf', 'ICF / ICF-CY (WHO)', 'Международная классификация функционирования и ограничений.', '16. Справочники и классификаторы', 'Функционирование'),
  T('ru-kr', 'Клинические рекомендации Минздрава РФ', 'Российские клинические рекомендации, обязательные с 2025 года.', '16. Справочники и классификаторы', 'Российские'),

  // ═══════════════════════════════════════════════
  // 17. ПРОТОКОЛЫ ЭКСТРЕННОЙ ПОМОЩИ
  // ═══════════════════════════════════════════════
  T('bls-acls', 'BLS / ACLS / PALS (AHA)', 'Американские алгоритмы базовой и расширенной реанимации.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('erc', 'ERC Guidelines', 'Европейские протоколы реанимации ALS, BLS, PLS.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('ilcor', 'ILCOR CoSTR', 'Международный научный консенсус по реанимации.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('anzcor', 'ANZCOR', 'Протоколы реанимации Австралии и Новой Зеландии.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('nrp', 'NRP (AAP)', 'Американский алгоритм реанимации новорождённых.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('epals', 'EPALS / APLS / EPLS / EHAC', 'Европейские педиатрические протоколы реанимации.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('hbb', 'Helping Babies Breathe / Helping Babies Survive', 'Программа реанимации новорождённых для стран с ограниченными ресурсами.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('eceb', 'Essential Care for Every Baby (ECEB) / ECSB', 'Пакеты ВОЗ по базовой помощи новорождённым.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('far-ru', 'Клинические рекомендации ФАР по СЛР', 'Российские рекомендации по сердечно-лёгочной реанимации.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('pears', 'PEARS', 'Упрощённый курс распознавания педиатрических неотложных состояний.', '17. Протоколы экстренной помощи', 'Реанимация'),
  T('atls', 'ATLS (ACS-COT)', 'Стандарт оказания помощи при тяжёлой травме.', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('etc', 'ETC (European Trauma Course)', 'Европейский курс по ведению травмы.', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('phtls-nm', 'PHTLS / ITLS (NAEMT)', 'Догоспитальные протоколы ведения травмы.', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('tccc-17', 'TCCC (CoTCCC, JTS)', 'Протокол тактической помощи на поле боя (Care Under Fire / TFC / TACEVAC).', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('tecc-17', 'TECC (C-TECC)', 'Протокол тактической помощи в гражданских условиях.', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('ems-assess', 'OPQRST / SAMPLE / DCAP-BTLS / AVPU', 'Стандартные алгоритмы оценки пациента догоспитально.', '17. Протоколы экстренной помощи', 'Догоспитальная травма'),
  T('ahs-ecc', 'AHA ECC / ERC / Resuscitation Council UK / HEMS / SAMU', 'Протоколы международных служб неотложной помощи.', '17. Протоколы экстренной помощи', 'Догоспитальные алгоритмы'),
  T('sf-syncope', 'San Francisco Syncope Rule', 'Прогноз серьёзных событий в течение 7 дней после обморока (CHESS).', '17. Протоколы экстренной помощи', 'Кардио-неотложка', true),
  T('ru-skoraya', 'Приказ МЗ РФ 388н / ННПОСМП / Багненко', 'Российские протоколы скорой медицинской помощи.', '17. Протоколы экстренной помощи', 'Догоспитальные алгоритмы'),
  T('anaphylaxis', 'NIAID/FAAN / WAO / Ring-Messmer / Sampson / EAACI', 'Диагностические критерии и ведение анафилаксии.', '17. Протоколы экстренной помощи', 'Анафилаксия'),
  T('gwtg', 'Get With The Guidelines (AHA)', 'Госпитальные протоколы AHA по инсульту, ХСН, реанимации.', '17. Протоколы экстренной помощи', 'Госпитальные pathways'),
  T('code-stemi', 'Code STEMI / Code Stroke / Sepsis Bundle', 'Ускоренные госпитальные протоколы при ИМ, инсульте, сепсисе.', '17. Протоколы экстренной помощи', 'Госпитальные pathways'),
  T('door-to', 'Door-to-needle / Door-to-balloon', 'Временные стандарты оказания помощи при ИМ и инсульте.', '17. Протоколы экстренной помощи', 'Госпитальные pathways'),
  T('ahls', 'AHLS (Advanced HazMat Life Support)', 'Расширенная помощь при воздействии опасных веществ.', '17. Протоколы экстренной помощи', 'CBRN / Токсикология'),
  T('poisindex', 'POISINDEX / TOXBASE / IPCS INTOX / Toxbase РФ', 'Токсикологические базы данных.', '17. Протоколы экстренной помощи', 'CBRN / Токсикология'),
  T('antidote', 'Antidote stocking (ACEP/AACT) / CHEMM / REMM', 'Рекомендации по запасам и применению антидотов.', '17. Протоколы экстренной помощи', 'CBRN / Токсикология'),
  T('hics', 'HICS / HEICS / NATO CIMIC / NHS major incident / МЧС «Защита»', 'Системы управления при массовых потерях и ЧС.', '17. Протоколы экстренной помощи', 'Массовые потери'),

  // ═══════════════════════════════════════════════
  // 18. УЧЕБНЫЕ ИНСТРУМЕНТЫ
  // ═══════════════════════════════════════════════
  T('uptodate', 'UpToDate / DynaMed / BMJ Best Practice / ClinicalKey / Medscape', 'Клинические базы знаний для поддержки принятия решений.', '18. Учебные инструменты', 'Базы знаний'),
  T('nice-cks', 'NICE CKS / NHS Clinical Guidance', 'Британские клинические резюме и рекомендации NHS.', '18. Учебные инструменты', 'Базы знаний'),
  T('prescrire', 'Prescrire / HAS', 'Французские независимые источники доказательной медицины.', '18. Учебные инструменты', 'Базы знаний'),
  T('awmf', 'AWMF Leitlinien', 'Немецкие клинические рекомендации по специальностям.', '18. Учебные инструменты', 'Базы знаний'),
  T('cochrane', 'Cochrane Library / BMJ Evidence / JAMA / NEJM', 'Источники систематических обзоров и доказательной медицины.', '18. Учебные инструменты', 'Базы знаний'),
  T('pubmed', 'PubMed / MEDLINE / Embase / Scopus / Web of Science', 'Основные поисковые системы научной медицинской литературы.', '18. Учебные инструменты', 'Базы знаний'),
  T('consmed', 'Рубрикатор КР Минздрава РФ / ConsMed / Consilium Medicum', 'Российские клинические базы знаний.', '18. Учебные инструменты', 'Базы знаний'),
  T('mdcalc', 'MDCalc', 'Крупнейший агрегатор клинических калькуляторов и шкал.', '18. Учебные инструменты', 'Калькуляторы'),
  T('qxmd', 'QxMD Calculate / Medscape Calculators / MedCalX / PediStat', 'Мобильные приложения с клиническими калькуляторами.', '18. Учебные инструменты', 'Калькуляторы'),
  T('evidencepoint', 'EvidencePoint / Omni Calculator Medical', 'Альтернативные веб-калькуляторы для клинической практики.', '18. Учебные инструменты', 'Калькуляторы'),
  T('osmosis', 'Osmosis / AMBOSS / UWorld / Kaplan / Lecturio / Sketchy', 'Учебные платформы для студентов и ординаторов.', '18. Учебные инструменты', 'Образование'),
  T('simman', 'SimMan / Laerdal / Gaumard / CAE Healthcare', 'Медицинские симуляторы для обучения.', '18. Учебные инструменты', 'Образование'),
  T('netter', 'Netter / Gray\'s / Sobotta / Prometheus', 'Классические атласы анатомии.', '18. Учебные инструменты', 'Визуализация / Анатомия'),
  T('complete-anatomy', 'Complete Anatomy / Visible Body / BioDigital / Anatomy.app', 'Интерактивные 3D-приложения анатомии.', '18. Учебные инструменты', 'Визуализация / Анатомия'),
  T('osce', 'OSCE / Mini-CEX / DOPS / CBD / Milestones / EPAs', 'Инструменты оценки клинических компетенций.', '18. Учебные инструменты', 'Оценка компетенций'),

  // ═══════════════════════════════════════════════
  // 19. РЕГИОНАЛЬНЫЕ СТАНДАРТЫ
  // ═══════════════════════════════════════════════
  T('mz-ru', 'Клинические рекомендации Минздрава РФ', 'Обязательные клинические рекомендации в России с 2025 года.', '19. Региональные стандарты', 'Россия'),
  T('mz-standards', 'Стандарты и порядки оказания медпомощи', 'Федеральные стандарты оказания медицинской помощи в России.', '19. Региональные стандарты', 'Россия'),
  T('formular-ru', 'Формулярный комитет РАН / РЛС / Видаль РФ / Машковский', 'Российские формулярные справочники лекарственных средств.', '19. Региональные стандарты', 'Россия'),
  T('geotar', 'Национальные руководства «ГЭОТАР-Медиа»', 'Российские национальные руководства по специальностям.', '19. Региональные стандарты', 'Россия'),
  T('ru-societies', 'ФАР / РОАГ / РКО / ОНИ / АОР / РОДВК / РСА', 'Рекомендации ведущих российских медицинских обществ.', '19. Региональные стандарты', 'Россия'),
  T('ru-scales', 'Шкала Ваганова / Сидоренко / Харитонова / Светухина', 'Российские клинические шкалы и адаптации.', '19. Региональные стандарты', 'Россия'),
  T('ketle', 'Индекс Кетле / Эрисмана', 'Российские антропометрические индексы.', '19. Региональные стандарты', 'Россия'),
  T('cis', 'Украина / Беларусь / Казахстан: локальные КР МЗ', 'Клинические рекомендации стран СНГ.', '19. Региональные стандарты', 'СНГ'),
  T('nice-uk', 'NICE / SIGN / BNF / BNFc', 'Британские клинические рекомендации и формуляры.', '19. Региональные стандарты', 'Европа'),
  T('has-fr', 'HAS / Vidal', 'Французские клинические рекомендации и лекарственный справочник.', '19. Региональные стандарты', 'Европа'),
  T('awmf-de', 'AWMF / Rote Liste / Arzneimittelkursbuch', 'Немецкие клинические рекомендации и фармацевтические справочники.', '19. Региональные стандарты', 'Европа'),
  T('smb-ch', 'Swiss Medical Board / SMI / FOPH', 'Швейцарские клинические стандарты.', '19. Региональные стандарты', 'Европа'),
  T('aifa-simg', 'AIFA / SIMG / SEMES', 'Итальянские и испанские клинические рекомендации.', '19. Региональные стандарты', 'Европа'),
  T('esc-eu', 'ESC / ESMO / ESICM / ESA / ESPEN / ESGE / EAU / ERS / ESO', 'Рекомендации европейских медицинских обществ по специальностям.', '19. Региональные стандарты', 'Европа'),
  T('nhg', 'NHG-standards / NVVC / Farmacotherapeutisch Kompas', 'Нидерландские клинические стандарты.', '19. Региональные стандарты', 'Европа'),
  T('nordic', 'Felleskatalogen / FASS / Pro.medicin.dk', 'Скандинавские лекарственные и клинические справочники.', '19. Региональные стандарты', 'Европа'),
  T('china', 'Chinese Medical Association / Chinese Pharmacopoeia / NRDL', 'Китайские клинические рекомендации и фармакопея.', '19. Региональные стандарты', 'Китай'),
  T('jcs', 'Japanese Circulation Society / JSH / JSGE / JGCA / JAAM DIC', 'Рекомендации японских медицинских обществ.', '19. Региональные стандарты', 'Япония'),
  T('tokyo-19', 'Tokyo Guidelines', 'Международные рекомендации по диагностике и лечению холецистита и холангита.', '19. Региональные стандарты', 'Япония'),
  T('ktas', 'KIMS / KAMJE / KoreaMed / Korean Guidelines / KTAS', 'Корейские клинические рекомендации и триаж.', '19. Региональные стандарты', 'Корея'),
  T('iap', 'IAP growth / Indian National Formulary / NICE ICMR / MCI / NMC', 'Индийские клинические стандарты и руководства.', '19. Региональные стандарты', 'Индия'),
  T('etg', 'eTG Australia / AMH / RACGP / ANZICS', 'Австралийские и новозеландские клинические рекомендации.', '19. Региональные стандарты', 'Австралия / ЮВА'),
  T('asean', 'ASEAN Clinical Guidelines', 'Клинические рекомендации стран Юго-Восточной Азии.', '19. Региональные стандарты', 'Австралия / ЮВА'),
  T('pcdt-br', 'Ministerio da Saúde Brazil PCDT / AMB / SBC / SBP', 'Бразильские клинические протоколы.', '19. Региональные стандарты', 'Латинская Америка'),
  T('imss', 'IMSS Guías de Práctica Clínica', 'Мексиканские клинические рекомендации.', '19. Региональные стандарты', 'Латинская Америка'),
  T('sap-sac', 'Argentina SAP / SAC / Colombia MSPS', 'Клинические рекомендации Южной Америки.', '19. Региональные стандарты', 'Латинская Америка'),
  T('paho', 'WHO/PAHO IMCI / AIEPI / Manchester SUS', 'Панамериканские и ВОЗ-адаптированные протоколы.', '19. Региональные стандарты', 'Латинская Америка'),
  T('saudi', 'Saudi MOH / Iran MOHME / Egyptian MOH / Africa CDC / MSF', 'Клинические стандарты стран Ближнего Востока и Африки.', '19. Региональные стандарты', 'Ближний Восток / Африка'),
  T('imci-africa', 'IMCI / IMPAC / IMAI / IMCA / ETAT (WHO)', 'Пакеты ВОЗ для стран с ограниченными ресурсами.', '19. Региональные стандарты', 'Ближний Восток / Африка'),

  // ═══════════════════════════════════════════════
  // 20. ВЕТЕРИНАРНАЯ МЕДИЦИНА
  // ═══════════════════════════════════════════════
  T('cmps-sf', 'Modified Glasgow Composite Pain (CMPS-SF)', 'Оценка боли у собак и кошек по поведенческим признакам.', '20. Ветеринарная медицина', 'Боль'),
  T('colorado-pain', 'Colorado State Pain / UNESP-Botucatu Feline / Grimace Scale', 'Альтернативные шкалы оценки боли у животных.', '20. Ветеринарная медицина', 'Боль'),
  T('bcs', 'BCS (WSAVA) / Muscle Condition Score', 'Оценка упитанности и мышечной массы у животных.', '20. Ветеринарная медицина', 'Общее'),
  T('purina-fediaf', 'Purina Life Plan / FEDIAF / AAFCO', 'Стандарты нутритивной поддержки домашних животных.', '20. Ветеринарная медицина', 'Общее'),
  T('asa-vet', 'ASA для ветеринарии / APPLE / SPI', 'Оценка анестезиологического и критического риска у животных.', '20. Ветеринарная медицина', 'Анестезия / Критикал'),
  T('vetcot', 'ATLS Veterinary / VetCOT / VETS / Kirby\'s Rule of 20', 'Триаж и оценка тяжести травмы у животных.', '20. Ветеринарная медицина', 'Триаж'),
  T('vcog', 'VCOG-CTCAE / WHO TNM for animals', 'Классификация и оценка токсичности в ветеринарной онкологии.', '20. Ветеринарная медицина', 'Онкология'),
  T('acvim', 'ACVIM / ISACHC', 'Стадирование хронической сердечной недостаточности у собак.', '20. Ветеринарная медицина', 'Кардиология'),
  T('vhs', 'VHS / VLAS', 'Рентгенологическая оценка размеров сердца у собак.', '20. Ветеринарная медицина', 'Кардиология'),
  T('cbpi', 'CBPI / LOAD / HCPI', 'Оценка хронической боли при заболеваниях суставов у собак.', '20. Ветеринарная медицина', 'Ортопедия'),
  T('ofa', 'OFA / PennHIP / FCI hip scores', 'Оценка дисплазии тазобедренного сустава у собак.', '20. Ветеринарная медицина', 'Ортопедия'),
  T('cite', 'FIV/FeLV CITE / FIP AGP/ALB / Tick-borne IDEXX 4Dx', 'Экспресс-диагностика ветеринарных инфекций.', '20. Ветеринарная медицина', 'Инфекционные'),
  T('rer', 'RER / MER / BMR', 'Расчёт энергетических потребностей у животных.', '20. Ветеринарная медицина', 'Формулы'),
  T('cri-vet', 'Drip rates / CRI / Allometric dosing', 'Дозирование и инфузионная терапия в ветеринарии.', '20. Ветеринарная медицина', 'Формулы'),
  T('plumbs', 'Plumb\'s Veterinary Drug Handbook / BSAVA Formulary / CVP', 'Ветеринарные фармакологические справочники.', '20. Ветеринарная медицина', 'Формулы'),
  T('merck-vet', 'Merck Veterinary Manual / AAHA / AAFP / WSAVA', 'Крупнейшие ветеринарные клинические справочники.', '20. Ветеринарная медицина', 'Справочники'),

  // ═══════════════════════════════════════════════
  // 21. СТОМАТОЛОГИЯ
  // ═══════════════════════════════════════════════
  T('fdi-dent', 'FDI / Universal Numbering (ADA) / Palmer', 'Системы нумерации и обозначения зубов.', '21. Стоматология', 'Классификации'),
  T('dmft', 'DMFT / DMFS / dmft / deft (WHO)', 'Индексы распространённости и интенсивности кариеса.', '21. Стоматология', 'Классификации'),
  T('cast-icdas', 'CAST / ICDAS II', 'Визуальная диагностика и классификация кариозных поражений.', '21. Стоматология', 'Классификации'),
  T('blacks', 'Black\'s classification', 'Классификация кариозных полостей по локализации.', '21. Стоматология', 'Классификации'),
  T('aap-efp', 'AAP/EFP 2017 Staging and Grading', 'Современная классификация тяжести и прогрессии пародонтита.', '21. Стоматология', 'Периодонтология'),
  T('cpi', 'CPI / CPITN / PSR', 'Оценка пародонтологического статуса в популяционных исследованиях.', '21. Стоматология', 'Периодонтология'),
  T('gingival', 'Gingival Index / Plaque Index / OHI-S', 'Индексы гигиены полости рта и воспаления дёсен.', '21. Стоматология', 'Периодонтология'),
  T('bop', 'BOP% / PPD', 'Основные пародонтальные измерения (кровоточивость и глубина карманов).', '21. Стоматология', 'Периодонтология'),
  T('angle', 'Angle\'s / IOTN / PAR / ICON', 'Классификация окклюзии и потребности в ортодонтическом лечении.', '21. Стоматология', 'Ортодонтия'),
  T('abo-ce', 'ABO Cast-Radiograph Evaluation', 'Оценка качества ортодонтического лечения.', '21. Стоматология', 'Ортодонтия'),
  T('bolton', 'Bolton / Little\'s irregularity index', 'Ортодонтические анализы моделей челюстей.', '21. Стоматология', 'Ортодонтия'),
  T('anb', 'ANB / WITS / Steiner cephalometric', 'Цефалометрические параметры для ортодонтии.', '21. Стоматология', 'Ортодонтия'),
  T('pell-gregory', 'Pell-Gregory / Winter', 'Классификация ретенции нижних моляров.', '21. Стоматология', 'Хирургия полости рта'),
  T('ao-cmf', 'Mandibular fractures AO CMF', 'Классификация переломов нижней челюсти.', '21. Стоматология', 'Хирургия полости рта'),
  T('lefort', 'Lefort I/II/III', 'Классификация переломов средней зоны лица.', '21. Стоматология', 'Хирургия полости рта'),
  T('vertucci', 'Vertucci canal / Weine', 'Классификация анатомии корневых каналов.', '21. Стоматология', 'Эндодонтия'),
  T('pai', 'PAI (Periapical Index)', 'Рентгенологическая оценка периапикальных изменений.', '21. Стоматология', 'Эндодонтия'),
  T('asa-dental', 'ASA modifications / Misch bone D1-D4', 'Оценка риска и качества костной ткани перед имплантацией.', '21. Стоматология', 'Протезирование'),
  T('sac-iti', 'SAC classification (ITI)', 'Оценка сложности имплантологического лечения.', '21. Стоматология', 'Протезирование'),
  T('frankl', 'Frankl / Venham\'s / Cuthbert-Melamed', 'Оценка поведения ребёнка на стоматологическом приёме.', '21. Стоматология', 'Детская стоматология'),
  T('nolla', 'Nolla / Demirjian', 'Оценка стадий развития зубов у детей.', '21. Стоматология', 'Детская стоматология'),
  T('andreasen', 'Andreasen classification / IADT Dental Trauma', 'Классификация и ведение травм зубов.', '21. Стоматология', 'Травма зубов'),
  T('tnm-hn', 'TNM AJCC head & neck', 'Стадирование злокачественных опухолей головы и шеи.', '21. Стоматология', 'Оральный рак'),
  T('velscope', 'VELscope / OralCDx / WHO OPMD', 'Скрининг потенциально злокачественных поражений полости рта.', '21. Стоматология', 'Оральный рак'),
  T('ada-cdt', 'ADA CDT / SNODENT / ICD-10-DA / NICE CKS dental / РСА КР', 'Стоматологические справочники и кодификаторы.', '21. Стоматология', 'Справочники'),

  // ═══════════════════════════════════════════════
  // 22. ПРОЧИЕ СПЕЦИАЛЬНОСТИ
  // ═══════════════════════════════════════════════

  // ЛОР
  T('friedman', 'Friedman staging', 'Прогноз эффективности хирургического лечения СОАС.', '22. Прочие специальности', 'ЛОР'),
  T('dhi', 'DHI / Vertigo Symptom Scale', 'Оценка влияния головокружения на жизнь пациента.', '22. Прочие специальности', 'ЛОР'),
  T('snot22', 'SNOT-22', 'Оценка симптомов хронического риносинусита.', '22. Прочие специальности', 'ЛОР'),
  T('lund-mackay', 'Lund-Mackay CT', 'Рентгенологическая оценка тяжести хронического синусита.', '22. Прочие специальности', 'ЛОР'),
  T('aphab', 'APHAB / SADL / IOI-HA / GHABP / COSI', 'Оценка эффективности слуховых аппаратов.', '22. Прочие специальности', 'ЛОР'),
  T('pta', 'Pure Tone Average / Fletcher / ASHA / BSA grading', 'Классификация степени тугоухости по аудиометрии.', '22. Прочие специальности', 'ЛОР'),
  T('meniere', 'Ménière AAO-HNS staging', 'Стадирование и оценка тяжести болезни Меньера.', '22. Прочие специальности', 'ЛОР'),
  T('dix-hallpike', 'Dix-Hallpike / HINTS / HINTS plus', 'Дифф. диагностика периферического и центрального вертиго.', '22. Прочие специальности', 'ЛОР'),
  T('rsi-rfs', 'Reflux Symptom Index (RSI) / Reflux Finding Score (RFS)', 'Диагностика ларингофарингеального рефлюкса.', '22. Прочие специальности', 'ЛОР'),
  T('vhi', 'Voice Handicap Index (VHI-10)', 'Оценка влияния нарушений голоса на жизнь пациента.', '22. Прочие специальности', 'ЛОР'),
  T('bipss', 'BIPSS / TUBA / TEOA / DPOAE', 'Методы объективного скрининга слуха.', '22. Прочие специальности', 'ЛОР'),

  // Офтальмология
  T('snellen', 'Snellen / logMAR / ETDRS / Decimal', 'Измерение остроты зрения различными шкалами.', '22. Прочие специальности', 'Офтальмология'),
  T('amsler', 'Amsler grid', 'Скрининг макулярной патологии по искажению сетки.', '22. Прочие специальности', 'Офтальмология'),
  T('iop', 'IOP (Goldmann, iCare, Tonopen)', 'Измерение внутриглазного давления разными методами.', '22. Прочие специальности', 'Офтальмология'),
  T('hodapp', 'Hodapp-Parrish-Anderson / GSS2', 'Классификация тяжести глаукомного поражения полей зрения.', '22. Прочие специальности', 'Офтальмология'),
  T('oct-normative', 'RNFL / Macular OCT normative', 'Нормативные базы для анализа оптической когерентной томографии.', '22. Прочие специальности', 'Офтальмология'),
  T('schirmer', 'Schirmer / TBUT / OSDI', 'Диагностика синдрома сухого глаза.', '22. Прочие специальности', 'Офтальмология'),
  T('seidel', 'Seidel test', 'Диагностика проникающей травмы или перфорации глазного яблока.', '22. Прочие специальности', 'Офтальмология'),
  T('etdrs-dr', 'ETDRS DR / ICO International DR/DME', 'Классификация диабетической ретинопатии и макулярного отёка.', '22. Прочие специальности', 'Офтальмология'),
  T('areds', 'AREDS / AREDS2 simplified', 'Классификация и стратификация риска возрастной макулярной дегенерации.', '22. Прочие специальности', 'Офтальмология'),
  T('rop', 'ROP International Classification / Plus disease', 'Классификация ретинопатии недоношенных.', '22. Прочие специальности', 'Офтальмология'),
  T('ots', 'Ocular Trauma Score (Kuhn)', 'Прогноз остроты зрения после травмы глаза.', '22. Прочие специальности', 'Офтальмология'),
  T('sun', 'SUN Uveitis criteria', 'Стандартизация диагностики и классификации увеитов.', '22. Прочие специальности', 'Офтальмология'),

  // Дерматология
  T('fitzpatrick', 'Fitzpatrick Skin Type (I-VI)', 'Классификация фототипов кожи по реакции на УФ-излучение.', '22. Прочие специальности', 'Дерматология'),
  T('scorad', 'SCORAD / EASI / oSCORAD / PO-SCORAD / IGA', 'Оценка тяжести атопического дерматита.', '22. Прочие специальности', 'Дерматология'),
  T('pasi', 'PASI / BSA / PGA / DLQI / CDLQI', 'Оценка тяжести псориаза и качества жизни.', '22. Прочие специальности', 'Дерматология'),
  T('hurley', 'Hurley / IHS4 / HiSCR', 'Классификация и оценка гидраденита.', '22. Прочие специальности', 'Дерматология'),
  T('salt', 'SALT', 'Оценка площади поражения при гнёздной алопеции.', '22. Прочие специальности', 'Дерматология'),
  T('uas7', 'UAS7 / CU-Q2oL', 'Оценка активности и качества жизни при хронической крапивнице.', '22. Прочие специальности', 'Дерматология'),
  T('masi', 'MASI / VASI', 'Оценка тяжести мелазмы и витилиго.', '22. Прочие специальности', 'Дерматология'),
  T('abcde', 'ABCDE / 7-point Glasgow / Menzies / pattern analysis', 'Клиническая диагностика меланомы.', '22. Прочие специальности', 'Дерматология'),
  T('breslow', 'Breslow thickness / Clark / AJCC', 'Гистологическое стадирование меланомы.', '22. Прочие специальности', 'Дерматология'),
  T('posas', 'POSAS / Vancouver / Manchester', 'Оценка рубцов после заживления.', '22. Прочие специальности', 'Дерматология'),
  T('scorten', 'SCORTEN', 'Прогноз смертности при синдроме Стивенса-Джонсона и токсическом эпидермальном некролизе.', '22. Прочие специальности', 'Дерматология'),
  T('casi', 'CASI / CCCA staging', 'Оценка тяжести центральной центробежной рубцовой алопеции.', '22. Прочие специальности', 'Дерматология'),
  T('rosacea', 'Rosacea IGA / GFSS', 'Оценка тяжести розацеа.', '22. Прочие специальности', 'Дерматология'),
  T('acne', 'GAGS / Cook / Leeds / IGA', 'Оценка тяжести акне.', '22. Прочие специальности', 'Дерматология'),
  T('dlqi', 'DLQI / Skindex-16/29', 'Оценка качества жизни при кожных заболеваниях.', '22. Прочие специальности', 'Дерматология'),

  // Физиотерапия / реабилитация
  T('fim-rehab', 'FIM / Barthel / mRS / GOS-E', 'Оценка функциональной независимости и исходов реабилитации.', '22. Прочие специальности', 'Реабилитация'),
  T('berg-balance', 'Berg Balance / TUG / DGI / Tinetti', 'Оценка равновесия и риска падений.', '22. Прочие специальности', 'Реабилитация'),
  T('6mwt', '6-Minute Walk Test / Incremental Shuttle Walk', 'Оценка функциональной выносливости и переносимости нагрузки.', '22. Прочие специальности', 'Реабилитация'),
  T('borg', 'Borg CR-10 / 6-20 RPE', 'Субъективная оценка интенсивности физической нагрузки.', '22. Прочие специальности', 'Реабилитация'),
  T('womac-rehab', 'WOMAC / KOOS / HOOS / DASH / QuickDASH / Oxford', 'Оценка функции суставов и качества жизни (PROMs).', '22. Прочие специальности', 'Реабилитация'),
  T('odi', 'ODI (Oswestry) / RMDQ / NDI', 'Оценка ограничений при болях в спине и шее.', '22. Прочие специальности', 'Реабилитация'),
  T('foto', 'FOTO outcomes / PROMIS CATs', 'Адаптивные компьютеризированные измерения исходов.', '22. Прочие специальности', 'Реабилитация'),

  // Аудиология / речевая терапия
  T('grbas', 'GRBAS / CAPE-V', 'Перцептивная оценка качества голоса.', '22. Прочие специальности', 'Аудиология / Речь'),
  T('frenchay', 'Frenchay Dysarthria / BDAE / WAB-R / AAT / MTDDA', 'Оценка дизартрии и афазии.', '22. Прочие специальности', 'Аудиология / Речь'),
  T('pas', 'MBSImP / FEES / Rosenbek PAS', 'Оценка функции глотания.', '22. Прочие специальности', 'Аудиология / Речь'),

  // Фармация
  T('mai', 'Medication Appropriateness Index (MAI)', 'Оценка рациональности назначения лекарственных средств.', '22. Прочие специальности', 'Фармация'),
  T('naranjo', 'Naranjo / WHO-UMC causality', 'Оценка причинно-следственной связи побочной реакции на лекарство.', '22. Прочие специальности', 'Фармация'),
  T('pcne', 'PCNE classification', 'Классификация проблем, связанных с лекарственной терапией.', '22. Прочие специальности', 'Фармация'),
  T('medwatch', 'FDA MedWatch / EudraVigilance / Yellow Card / Росздравнадзор', 'Системы фармаконадзора и отчётности о побочных реакциях.', '22. Прочие специальности', 'Фармация'),

  // Медсестринство
  T('sbar', 'SBAR', 'Стандартизированная структура передачи информации о пациенте.', '22. Прочие специальности', 'Медсестринство'),

  // Гастроэнтерология
  T('rome-iv', 'Rome IV criteria', 'Диагностические критерии функциональных расстройств ЖКТ.', '22. Прочие специальности', 'Гастроэнтерология'),
  T('uceis', 'Mayo / partial Mayo / UCEIS', 'Оценка активности язвенного колита.', '22. Прочие специальности', 'Гастроэнтерология'),
  T('ses-cd', 'CDAI / HBI / SES-CD', 'Оценка активности болезни Крона по клиническим и эндоскопическим данным.', '22. Прочие специальности', 'Гастроэнтерология'),
  T('la-grade', 'LA grade A-D / Savary-Miller', 'Эндоскопическая классификация рефлюкс-эзофагита.', '22. Прочие специальности', 'Гастроэнтерология'),
  T('oakland', 'Oakland score', 'Оценка риска при нижнем ЖКТ-кровотечении.', '22. Прочие специальности', 'Гастроэнтерология'),

  // Эндокринология
  T('ata', 'ATA risk / Bethesda TBSRTC', 'Оценка риска рака щитовидной железы и цитологии.', '22. Прочие специальности', 'Эндокринология'),
  T('frax-e', 'FRAX', 'Оценка 10-летнего риска остеопоротических переломов.', '22. Прочие специальности', 'Эндокринология'),
  T('ada-easd', 'ADA/EASD diabetes algorithm', 'Современный алгоритм лечения сахарного диабета 2 типа.', '22. Прочие специальности', 'Эндокринология'),
  T('idf-ms', 'IDF Metabolic Syndrome', 'Диагностические критерии метаболического синдрома.', '22. Прочие специальности', 'Эндокринология'),
  T('ferriman', 'Ferriman-Gallwey', 'Оценка выраженности гирсутизма у женщин.', '22. Прочие специальности', 'Эндокринология'),

  // Ревматология
  T('acr-eular', 'ACR/EULAR classification criteria', 'Международные классификационные критерии ревматологических заболеваний.', '22. Прочие специальности', 'Ревматология'),
  T('das28', 'DAS28 / CDAI / SDAI / RAPID3', 'Оценка активности ревматоидного артрита.', '22. Прочие специальности', 'Ревматология'),
  T('basdai', 'BASDAI / BASFI / ASDAS', 'Оценка активности и функции при аксиальном спондилоартрите.', '22. Прочие специальности', 'Ревматология'),
  T('sledai', 'SLEDAI-2K / BILAG-2004', 'Оценка активности системной красной волчанки.', '22. Прочие специальности', 'Ревматология'),
  T('rodnan', 'Rodnan skin score', 'Оценка кожного поражения при системной склеродермии.', '22. Прочие специальности', 'Ревматология'),
  T('fms-wpi', 'ACR Fibromyalgia / FMS WPI + SS', 'Диагностические критерии и оценка тяжести фибромиалгии.', '22. Прочие специальности', 'Ревматология'),

  // Аллергология
  T('gell-coombs', 'Gell-Coombs / EAACI / Ring-Messmer / WAO', 'Классификация типов реакций гиперчувствительности.', '22. Прочие специальности', 'Аллергология'),
  T('niaid', 'NIAID food allergy criteria', 'Критерии диагностики пищевой аллергии.', '22. Прочие специальности', 'Аллергология'),
  T('mathews', 'Mathews / Mackaness (angioedema)', 'Классификация и диагностика ангионевротического отёка.', '22. Прочие специальности', 'Аллергология'),
];

/** Group tools by category for the UI */
export function groupByCategory(tools: CatalogTool[]): Record<string, CatalogTool[]> {
  const groups: Record<string, CatalogTool[]> = {};
  for (const t of tools) {
    const bucket = groups[t.category] ?? (groups[t.category] = []);
    bucket.push(t);
  }
  return groups;
}

/** Further group by subcategory within a category */
export function groupBySubcategory(tools: CatalogTool[]): Record<string, CatalogTool[]> {
  const groups: Record<string, CatalogTool[]> = {};
  for (const t of tools) {
    const bucket = groups[t.subcategory] ?? (groups[t.subcategory] = []);
    bucket.push(t);
  }
  return groups;
}

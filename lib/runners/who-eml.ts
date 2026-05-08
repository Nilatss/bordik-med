/** Runner: who-eml */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'area',
      label: 'Терапевтическая область',
      type: 'select',
      options: [
        { value: 'antibacterial', label: 'Антибактериальные (Access/Watch/Reserve — AWaRe)' },
        { value: 'antimalarial', label: 'Противомалярийные' },
        { value: 'antitb', label: 'Противотуберкулёзные' },
        { value: 'antiviral-hiv', label: 'АРВТ (ВИЧ)' },
        { value: 'analgesic', label: 'Анальгетики / паллиатив' },
        { value: 'cv', label: 'Сердечно-сосудистые' },
        { value: 'diabetes', label: 'Диабет' },
        { value: 'mental', label: 'Психиатрия' },
        { value: 'oncology', label: 'Онкология' },
        { value: 'maternal', label: 'Акушерство / материнское здоровье' },
        { value: 'vaccine', label: 'Вакцины' },
      ],
    },
    {
      id: 'population',
      label: 'Популяция',
      type: 'select',
      options: [
        { value: 'adult', label: 'Взрослые (EML)' },
        { value: 'children', label: 'Дети (EMLc)' },
        { value: 'both', label: 'Оба' },
      ],
    },
  ],
  compute: (v) => {
    const a = String(v.area);
    const p = String(v.population);

    type Entry = { meds: string; rationale: string; notes: string };
    const map: Record<string, Entry> = {
      antibacterial: { meds: '**Access**: амоксициллин, амокс./клав., цефалексин, нитрофурантоин, ТМП/СМК, доксициклин, клиндамицин, метронидазол, бензилпенициллин.\n**Watch**: цефтриаксон, ципрофлоксацин, азитромицин, ванкомицин, меропенем (ограниченно).\n**Reserve**: колистин, линезолид, цефтазидим/авибактам, фосфомицин в/в.', rationale: 'AWaRe classification (2019) — цель: > 60% потребления из категории Access для снижения резистентности.', notes: 'WHO AWaRe Antibiotic Book (2022) — клинические алгоритмы для 35 синдромов.' },
      antimalarial: { meds: 'Артеметер/люмефантрин (ACT), артесунат в/в (тяжёлая), хлорохин (P. vivax), примахин (радикальное излечение P. vivax/ovale), тафенохин.', rationale: 'ACT — первая линия неосложнённой P. falciparum во всех эндемичных регионах.', notes: 'Артесунат в/в заменил хинин при тяжёлой малярии (AQUAMAT, SEAQUAMAT).' },
      antitb: { meds: 'Первая линия: изониазид, рифампицин, пиразинамид, этамбутол (HRZE). MDR: бедаквилин, претоманид, линезолид, деламанид (BPaL/BPaLM режим).', rationale: 'WHO 2022 — BPaL(M) 6-месячный режим для MDR/RR-ТБ вместо 18-24 мес.', notes: 'Фиксированные комбинации (FDC) для улучшения комплаенса.' },
      'antiviral-hiv': { meds: 'Долутегравир (DTG) + ламивудин + тенофовир (TLD) — первая линия для взрослых и детей ≥ 20 кг. Для новорождённых: зидовудин + ламивудин + невирапин / лопинавир/ритонавир.', rationale: 'TLD — одна таблетка в день, высокий барьер резистентности.', notes: 'WHO HIV guidelines 2021 update.' },
      analgesic: { meds: 'Парацетамол, ибупрофен, ибупрофен+парацетамол, морфин (перорально и инъекционно), кодеин (ограниченно), метадон (паллиатив).', rationale: 'Лестница ВОЗ по боли: 1-я ступень НПВП → 2-я слабые опиоиды → 3-я морфин.', notes: 'Морфин — ключевой препарат, но недоступен в > 100 странах (опиоидный разрыв).' },
      cv: { meds: 'АГ: амлодипин, гидрохлоротиазид, эналаприл/лозартан. СН: фуросемид, спиронолактон, бисопролол. ИБС: ацетилсалициловая кислота, симвастатин, атенолол. Антикоагулянты: варфарин, гепарин, эноксапарин.', rationale: 'Fixed-dose combinations (polypill) рекомендованы для вторичной профилактики.', notes: 'DOAC (дабигатран, ривароксабан) добавлены в EML 2019.' },
      diabetes: { meds: 'Метформин, глибенкламид, глимепирид, гликлазид, инсулин (человеческий short/NPH, аналоги: гларгин). Эмпаглифлозин добавлен 2021.', rationale: 'Аналоги инсулина только при гипогликемиях на человеческом.', notes: 'Эмпаглифлозин / дапаглифлозин — для СН и ХБП.' },
      mental: { meds: 'Депрессия: амитриптилин, флуоксетин. Биполярка: литий, вальпроат. Психоз: галоперидол, хлорпромазин, клозапин, рисперидон. Тревога: диазепам (кратко).', rationale: 'mhGAP — интеграция психиатрии в первичное звено LMIC.', notes: 'Клозапин — единственный EML-вариант при резистентной шизофрении.' },
      oncology: { meds: 'Цитостатики: цисплатин, карбоплатин, доксорубицин, 5-ФУ, паклитаксел, метотрексат. Гормональные: тамоксифен, анастрозол. Таргетные: иматиниб, ритуксимаб, трастузумаб.', rationale: 'WHO Essential Cancer Medicines — фокус на детскую онкологию и излечимые опухоли.', notes: 'Иматиниб и ритуксимаб — биосимиляры радикально снизили цену.' },
      maternal: { meds: 'Окситоцин, мизопростол (ПАК), сульфат магния (эклампсия), метилдопа, нифедипин, дексаметазон (RDS), гидралазин.', rationale: 'MgSO4 — препарат выбора при эклампсии (MAGPIE trial).', notes: 'Окситоцин — термолабилен, требует cold chain; мизопростол — термостабильная альтернатива.' },
      vaccine: { meds: 'БЦЖ, КПК, АКДС, полиомиелит, гепатит B, ротавирус, пневмококковая (PCV), HPV, ковид, жёлтая лихорадка.', rationale: 'EPI (Expanded Programme on Immunization) — основа EML-вакцин.', notes: 'HPV — 1-дозовая схема одобрена WHO 2022.' },
    };

    const e = map[a] || { meds: 'См. WHO EML 23rd list (2023)', rationale: '—', notes: '—' };

    return {
      value: p === 'children' ? 'WHO EMLc 2023' : 'WHO EML 2023',
      unit: '23-я редакция',
      interpretation: `${a} — ключевые эссенциальные препараты для ${p === 'children' ? 'детей' : p === 'both' ? 'взрослых и детей' : 'взрослых'}`,
      color: '#4B8DF5',
      details: `Область: ${a}. Популяция: ${p}.\n\nПрепараты EML:\n${e.meds}\n\nОбоснование WHO: ${e.rationale}\n\nЗаметки: ${e.notes}\n\n*WHO Model List of Essential Medicines (EML) — минимальный список препаратов для базовой системы здравоохранения. Обновляется каждые 2 года Expert Committee on Selection and Use of Essential Medicines.*`,
      actions: [
        'Открыть WHO EML (https://list.essentialmeds.org/) — онлайн база с поиском',
        'Сверить с национальным формуляром (EML большинства LMIC основаны на WHO EML)',
        'Для антибиотиков — использовать AWaRe Antibiotic Book 2022 (клинические алгоритмы)',
        'Для детей использовать отдельный EMLc (возрастные ограничения)',
        'Проверить Model Formulary WHO для доз и инструкций',
      ],
      caveats: [
        'EML — рекомендательный список; в разных странах локальный формуляр может отличаться',
        'Доступность препарата в LMIC ≠ включение в EML (часто дефицит onkology/рестрикционных)',
        'Обновления каждые 2 года — текущая 23-я редакция (июль 2023)',
        'Для РФ — Перечень ЖНВЛП (жизненно необходимых и важнейших лекарственных препаратов)',
        'Для ЕС — national essential medicines list + EMA centralized authorization',
      ],
      related: [
        { id: 'aware', title: 'AWaRe антибиотики' },
        { id: 'jnvlp', title: 'ЖНВЛП (РФ)' },
        { id: 'nhs-bnf', title: 'BNF (UK)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '305.2', title: 'Рациональная антибиотикотерапия' },
      ],
    };
  },
  reference: 'World Health Organization. WHO Model List of Essential Medicines – 23rd list, 2023. Geneva: WHO; 2023.',
  countries: 'Международный (WHO) · используется в 155+ странах',
  presets: [
    { label: 'Антибиотики AWaRe', values: { area: 'antibacterial', population: 'adult' } },
    { label: 'Противотуберкулёзные', values: { area: 'antitb', population: 'both' } },
    { label: 'Педиатрические анальгетики', values: { area: 'analgesic', population: 'children' } },
  ],
  info: `### Для чего используется\n**WHO Model List of Essential Medicines (EML)** — минимальный перечень препаратов, которые должны быть доступны во всех системах здравоохранения. Обновляется каждые 2 года с 1977 г.\n\n### EML / EMLc\n- **EML** — для взрослых (23-я редакция, 2023, ~500 препаратов)\n- **EMLc** — для детей (9-я редакция, 2023) с возрастными ограничениями\n\n### AWaRe (антибиотики)\n| Категория | Цель |\n|---|---|\n| **Access** | Первая линия для распространённых инфекций, > 60% потребления |\n| **Watch** | Более широкий спектр, риск резистентности |\n| **Reserve** | Последняя линия, только для MDR |\n\n### Критерии включения\n- Доказанная эффективность и безопасность\n- Сравнительная стоимость-эффективность\n- Актуальность для глобальных приоритетов (NCDs, AMR, material health)\n\n### Когда применять\n- Планирование закупок LMIC\n- Разработка национальных формуляров\n- Образование медицинских специалистов\n- Оценка доступности препаратов (Health Action International)`,
};
export default runner;

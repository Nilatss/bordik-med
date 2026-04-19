// @ts-nocheck
/** Runner: antidote — Antidote dosing reference */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'weight',
      label: 'Масса тела',
      type: 'number',
      unit: 'кг',
      min: 3,
      max: 200,
      step: 0.5,
      quickValues: [10, 20, 50, 70, 80],
    },
    {
      id: 'antidote',
      label: 'Антидот / токсин',
      type: 'select',
      options: [
        { value: 'naloxone', label: 'Налоксон (опиоиды)' },
        { value: 'flumazenil', label: 'Флумазенил (бензодиазепины)' },
        { value: 'nac', label: 'N-ацетилцистеин (APAP)' },
        { value: 'fomepizole', label: 'Фомепизол (EG/метанол)' },
        { value: 'atropine', label: 'Атропин (ФОС)' },
        { value: 'pralidoxime', label: 'Пралидоксим (ФОС)' },
        { value: 'cyanokit', label: 'Hydroxocobalamin (цианид)' },
        { value: 'digifab', label: 'Digoxin Fab' },
        { value: 'calcium', label: 'Ca-глюконат (CCB/HF-блокаторы)' },
        { value: 'glucagon', label: 'Глюкагон (β-блокаторы)' },
      ],
    },
    {
      id: 'severity',
      label: 'Тяжесть',
      type: 'select',
      options: [
        { value: 'mild', label: 'Лёгкая' },
        { value: 'moderate', label: 'Средняя' },
        { value: 'severe', label: 'Тяжёлая / арест' },
      ],
    },
  ],
  compute: (v) => {
    const w = Number(v.weight) || 70;
    const a = String(v.antidote || 'naloxone');
    const sev = String(v.severity || 'moderate');

    let dose = '';
    let repeat = '';
    let route = 'в/в';
    let caveat = '';

    if (a === 'naloxone') {
      if (sev === 'severe') { dose = `${(0.4).toFixed(2)}–2 мг в/в болюс (начать с 0.4 мг)`; repeat = 'Повтор каждые 2–3 мин, max 10 мг. Инфузия: 2/3 дозы восстановления × ч'; }
      else { dose = '0.04–0.4 мг в/в (titrate до частоты дыхания ≥ 12)'; repeat = 'Повтор каждые 2 мин'; }
      caveat = 'При фентаниле / карфентаниле требуются бóльшие дозы. Длительность действия 20–90 мин — мониторить возврат депрессии.';
    } else if (a === 'flumazenil') {
      dose = '0.2 мг в/в за 30 с, затем 0.3 мг через 30 с, затем 0.5 мг каждую мин, max 3 мг';
      repeat = 'Инфузия 0.1–0.4 мг/ч при рецидиве';
      caveat = 'ПРОТИВОПОКАЗАН: BZD-зависимость, коингредиент ТЦА, судорожные расстройства — риск status epilepticus.';
    } else if (a === 'nac') {
      const loading = (150 * w).toFixed(0);
      const phase2 = (50 * w).toFixed(0);
      const phase3 = (100 * w).toFixed(0);
      dose = `Loading: ${loading} мг (150 мг/кг) в/в за 1 ч`;
      repeat = `Phase 2: ${phase2} мг (50 мг/кг) за 4 ч; Phase 3: ${phase3} мг (100 мг/кг) за 16 ч. PO: 140 мг/кг → 70 мг/кг × 17 доз каждые 4 ч`;
      caveat = '21-часовой IV протокол (Prescott). Pseudoallergic reaction (wheezing, rash) на loading — замедлить инфузию, дифенгидрамин.';
    } else if (a === 'fomepizole') {
      const loading = (15 * w).toFixed(0);
      const maint = (10 * w).toFixed(0);
      dose = `Loading: ${loading} мг (15 мг/кг) в/в за 30 мин`;
      repeat = `Maintenance: ${maint} мг (10 мг/кг) в/в каждые 12 ч × 4 доз, затем 15 мг/кг до уровня < 20 мг/дл. Во время диализа: каждые 4 ч`;
      caveat = 'Блокирует алкогольдегидрогеназу. Параллельно: тиамин 100 мг (метанол) или пиридоксин + тиамин (EG).';
    } else if (a === 'atropine') {
      const startDose = sev === 'severe' ? 6 : sev === 'moderate' ? 2 : 1;
      dose = `Старт: ${startDose} мг в/в`;
      repeat = 'УДВАИВАТЬ каждые 3–5 мин до высыхания секретов (не ориентироваться на ЧСС / зрачки). Инфузия: 10–20% суммарной дозы/ч';
      caveat = 'Endpoint: сухие бронх секреты, нормальная SpO₂. Может потребоваться > 100 мг/сутки при тяжёлых ФОС.';
    } else if (a === 'pralidoxime') {
      const loading = (30 * w).toFixed(0);
      dose = `${loading} мг (30 мг/кг, max 2 г) в/в за 30 мин`;
      repeat = 'Инфузия 8 мг/кг/ч × 48–72 ч или болюсы каждые 4–6 ч';
      caveat = 'Эффективен в первые 24–48 ч до старения АХЭ. Вводить ВМЕСТЕ с атропином.';
    } else if (a === 'cyanokit') {
      dose = 'Hydroxocobalamin 5 г в/в за 15 мин (детям 70 мг/кг, max 5 г)';
      repeat = 'Повтор 5 г при тяжёлой интоксикации (max 10 г)';
      caveat = 'Красно-оранжевая моча / кожа (48–72 ч), интерференция с лаб. Альтернатива: тиосульфат натрия 12.5 г в/в + натрия нитрит 300 мг в/в (взрослый).';
    } else if (a === 'digifab') {
      dose = sev === 'severe' ? '10–20 vials эмпирически при аресте' : 'По формуле: vials = (serum дигоксин × вес) / 100, или (ingested мг × 0.8) / 0.5';
      repeat = 'Повтор если симптомы сохраняются через 30 мин';
      caveat = 'Каждый vial связывает 0.5 мг дигоксина. Показания: К > 5 мЭкв/л (острый), жизнеугрожающая аритмия, уровень > 10 нг/мл, доза > 10 мг (взрослый) / > 4 мг (ребёнок).';
    } else if (a === 'calcium') {
      const dose1 = (60 * w).toFixed(0);
      dose = `Ca-глюконат 10% ${dose1} мг (0.6 мл/кг, max 30 мл) в/в за 10 мин`;
      repeat = 'Повтор каждые 10–20 мин × 3–4 дозы. Инфузия 0.5–2 мл/кг/ч';
      caveat = 'CCB / HF-блокаторы overdose: Ca + глюкагон + high-dose insulin euglycemia + intralipid + вазопрессоры. CaCl₂ в 3× concentrated vs глюконат — только через центральный доступ.';
    } else if (a === 'glucagon') {
      const loading = (0.05 * w).toFixed(1);
      dose = `Loading: ${loading} мг (0.05 мг/кг, обычно 3–10 мг) в/в болюс`;
      repeat = `Инфузия ${(0.05 * w).toFixed(2)} мг/кг/ч (обычно 2–10 мг/ч)`;
      caveat = 'Рвота часто — подготовить противорвотное. Параллельно Ca, HDI (high-dose insulin), intralipid при CCB/BB микст.';
    }

    const color = sev === 'severe' ? '#EF4444' : sev === 'moderate' ? '#F59E0B' : '#22C55E';

    return {
      value: dose,
      unit: '',
      interpretation: `${a}: ${dose}. ${repeat}`,
      color,
      details: `Масса ${w} кг, тяжесть ${sev}. ${caveat}`,
      actions: [
        `Старт: ${dose}`,
        `Повтор/инфузия: ${repeat}`,
        `Путь: ${route}`,
        'Мониторинг: ЭКГ, SpO₂, АД, гликемия, диурез',
        'Контакт: токсцентр / POISINDEX при неясной картине',
        'Decon: активированный уголь если < 1–2 ч (только при сохранении сознания / защиты дых путей)',
        caveat,
      ],
      caveats: [
        'Все дозы требуют верификации в локальных протоколах + Micromedex / POISINDEX',
        'Педиатрические дозы могут отличаться — использовать Broselow / Handtevy',
        'Интубация приоритетнее флумазенила при неясной этиологии',
        'Передозировка антидота тоже опасна: атропинический делирий, NAC-pseudoallergy, Ca-aritмogenesis',
        'Intralipid 20% 1.5 мл/кг болюс + 0.25 мл/кг/мин — lipid rescue для липофильных кардиотоксикантов',
      ],
      scale: {
        segments: [
          { label: 'Лёгкая', min: 1, max: 1, color: '#22C55E', description: 'Минимальная доза' },
          { label: 'Средняя', min: 2, max: 2, color: '#F59E0B', description: 'Стандартная' },
          { label: 'Тяжёлая', min: 3, max: 3, color: '#EF4444', description: 'Max доза + ICU' },
        ],
        current: sev === 'severe' ? 3 : sev === 'moderate' ? 2 : 1,
        unit: '',
      },
      related: [
        { id: 'poisindex', title: 'POISINDEX' },
        { id: 'ahls', title: 'AHLS' },
        { id: 'rumack-matthew', title: 'Rumack-Matthew (APAP)' },
      ],
      relatedCourses: [
        { id: '303.6', title: 'Токсикология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Nelson LS, Howland MA, Lewin NA, et al. Goldfrank\'s Toxicologic Emergencies, 11th ed. McGraw-Hill 2019. American Academy of Clinical Toxicology Position Statements. Micromedex POISINDEX.',
  countries: 'Международные референсы (USA, ЕС)',
  presets: [
    { label: 'Налоксон 70 кг severe', values: { weight: 70, antidote: 'naloxone', severity: 'severe' } },
    { label: 'NAC 70 кг', values: { weight: 70, antidote: 'nac', severity: 'moderate' } },
    { label: 'Атропин ФОС 80 кг', values: { weight: 80, antidote: 'atropine', severity: 'severe' } },
    { label: 'Фомепизол 70 кг', values: { weight: 70, antidote: 'fomepizole', severity: 'severe' } },
    { label: 'Cyanokit 70 кг', values: { weight: 70, antidote: 'cyanokit', severity: 'severe' } },
    { label: 'Digifab arest', values: { weight: 70, antidote: 'digifab', severity: 'severe' } },
    { label: 'Ca CCB overdose 80 кг', values: { weight: 80, antidote: 'calcium', severity: 'severe' } },
  ],
  info: `### Для чего используется
Быстрый калькулятор **доз антидотов** при распространённых отравлениях.

### Таблица ключевых антидотов
| Токсин | Антидот | Доза |
|---|---|---|
| Опиоиды | Налоксон | 0.04–2 мг в/в |
| BZD | Флумазенил | 0.2 мг в/в → 3 мг |
| APAP | NAC | 150 / 50 / 100 мг/кг |
| EG/метанол | Фомепизол | 15 мг/кг |
| ФОС | Атропин + пралидоксим | 2–6 мг / 30 мг/кг |
| Цианид | Hydroxocobalamin | 5 г в/в |
| Дигоксин | Digoxin Fab | 10–20 vials |
| CCB/BB | Ca + глюкагон + HDI | см. расчёт |

### Ключевые принципы
- Decon: уголь < 1–2 ч, если нет ПП
- ABC перед антидотом
- Intralipid rescue: липофильные
- HDIE (high-dose insulin euglycemia) при CCB/BB

### Источники
Goldfrank's Toxicologic Emergencies 11 ed.
AACT Position Statements.
Micromedex POISINDEX.
`,
};
export default runner;

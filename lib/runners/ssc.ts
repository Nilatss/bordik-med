// @ts-nocheck
/** Runner: ssc — Surviving Sepsis Campaign 2021 Hour-1 Bundle */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'lactate',
      hint: 'Лактат. Норма: <2 ммоль/л; >4 — лактат-ацидоз',
      label: 'Лактат',
      type: 'number',
      unit: 'ммоль/л',
      min: 0,
      max: 30,
      step: 0.1,
      quickValues: [1, 2, 2.5, 4, 6, 8],
    },
    {
      id: 'map',
      hint: 'СрАД = (САД + 2·ДАД)/3. Норма: 70-100',
      label: 'MAP (среднее АД) после инфузии',
      type: 'number',
      unit: 'мм рт.ст.',
      min: 20,
      max: 150,
      step: 1,
      quickValues: [50, 60, 65, 70, 80, 90],
    },
    {
      id: 'source',
      label: 'Предполагаемый источник инфекции',
      type: 'select',
      options: [
        { value: 'pulm', label: 'Пневмония' },
        { value: 'uti', label: 'Мочевая инфекция' },
        { value: 'abdo', label: 'Интраабдоминальная' },
        { value: 'skin', label: 'Кожа/мягкие ткани' },
        { value: 'cns', label: 'ЦНС (менингит)' },
        { value: 'cath', label: 'Катетер-ассоциированная' },
        { value: 'unknown', label: 'Неизвестен' },
      ],
    },
    {
      id: 'cultures',
      label: 'Гемокультуры × 2 взяты до АБ',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'abx',
      label: 'Антибиотики широкого спектра введены в течение 1 ч',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'fluids',
      label: 'Кристаллоиды 30 мл/кг начаты (при гипотензии или лактат ≥4)',
      type: 'checkbox',
      points: 1,
    },
  ],
  compute: (v) => {
    const lactate = Number(v.lactate);
    const map = Number(v.map);
    const source = String(v.source || 'unknown');
    const cultures = Boolean(v.cultures);
    const abx = Boolean(v.abx);
    const fluids = Boolean(v.fluids);

    const hypotension = map < 65;
    const highLactate = lactate >= 4;
    const needFluids = hypotension || highLactate;
    const needVaso = hypotension;

    let done = 0;
    const checklist = [];
    // 1. Lactate measured
    if (!Number.isNaN(lactate)) { done++; checklist.push('✓ Лактат измерен'); }
    else checklist.push('✗ Лактат не измерен');
    // 2. Cultures
    if (cultures) { done++; checklist.push('✓ Гемокультуры × 2 до АБ'); }
    else checklist.push('✗ Гемокультуры × 2 не взяты');
    // 3. Antibiotics
    if (abx) { done++; checklist.push('✓ АБ широкого спектра ≤ 1 ч'); }
    else checklist.push('✗ АБ не введены в течение 1 ч');
    // 4. Fluids (if indicated)
    if (needFluids) {
      if (fluids) { done++; checklist.push('✓ Кристаллоиды 30 мл/кг начаты'); }
      else checklist.push('✗ Нужны кристаллоиды 30 мл/кг (лактат ≥ 4 или MAP < 65)');
    } else {
      done++; checklist.push('— Инфузия 30 мл/кг не требуется (нормоволемия, лактат < 4)');
    }
    // 5. Vasopressors if persistent hypotension (monitored)
    const vasoNote = needVaso
      ? '✗ MAP < 65 после инфузии → норэпинефрин до MAP ≥ 65'
      : '— Вазопрессоры не требуются';
    checklist.push(vasoNote);

    const total = 4; // out of 4 core items (excl. vaso which is conditional)
    const pct = Math.round((done / total) * 100);
    let color = '#EF4444';
    let interpretation = 'Bundle не выполнен';
    if (pct === 100) { color = '#22C55E'; interpretation = 'Bundle выполнен полностью'; }
    else if (pct >= 75) { color = '#84CC16'; interpretation = 'Bundle почти выполнен'; }
    else if (pct >= 50) { color = '#F59E0B'; interpretation = 'Bundle частично выполнен'; }

    const empiric: Record<string, string> = {
      pulm: 'Цефтриаксон + азитромицин (± ванкомицин при MRSA)',
      uti: 'Цефтриаксон или пиперациллин-тазобактам',
      abdo: 'Пиперациллин-тазобактам или меропенем (± метронидазол)',
      skin: 'Ванкомицин + пиперациллин-тазобактам',
      cns: 'Цефтриаксон 2 г × 2 + ванкомицин + дексаметазон (± ампициллин >50 лет)',
      cath: 'Ванкомицин + цефепим (снять катетер)',
      unknown: 'Пиперациллин-тазобактам + ванкомицин',
    };

    const actions = [
      `Эмпирические АБ (${source}): ${empiric[source]}`,
      'Повторный лактат через 2–4 ч (цель: снижение / клиренс)',
      needVaso ? 'Норэпинефрин первой линии, цель MAP ≥ 65' : 'Мониторинг MAP, ЧСС, диуреза',
      'Контроль источника в первые 6–12 ч (дренирование абсцесса, санация, удаление катетера)',
      'Деэскалация АБ после идентификации возбудителя и чувствительности',
    ];

    return {
      value: `${done}/${total}`,
      unit: 'выполнено',
      interpretation,
      color,
      details: `Surviving Sepsis Campaign 2021 Hour-1 Bundle: ${pct}% выполнения. Каждый час задержки антибиотиков при септическом шоке повышает смертность на ~7,6% (Kumar 2006).\n\nЧек-лист:\n${checklist.join('\n')}`,
      actions,
      caveats: [
        'Hour-1 Bundle: начать все 5 шагов в течение 1 часа от распознавания сепсиса',
        'Инфузия 30 мл/кг — ориентир, не догма; у пациентов с ХСН/ХБП титровать по ответу',
        'При лактате ≥ 2 повторять каждые 2–4 ч до нормализации',
        'Вазопрессоры можно через периферический доступ краткосрочно (< 6 ч) до центрального',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0–1 шаг', color: '#EF4444' },
          { min: 1, max: 2, label: '2 шага', color: '#F59E0B' },
          { min: 2, max: 3, label: '3 шага', color: '#84CC16' },
          { min: 3, max: 4, label: '4/4', color: '#22C55E' },
        ],
        current: done,
        unit: 'выполнено',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
      related: [
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'sofa', title: 'SOFA' },
        { id: 'news2', title: 'NEWS2' },
      ],
    };
  },
  reference: 'Surviving Sepsis Campaign 2021 (Evans et al., Crit Care Med). Hour-1 Bundle.',
  countries: 'Международный (SSC / SCCM / ESICM)',
  presets: [
    {
      label: 'Септический шок (лактат 6, MAP 55)',
      values: { lactate: 6, map: 55, source: 'abdo', cultures: true, abx: true, fluids: true },
    },
    {
      label: 'Сепсис без шока (лактат 2, MAP 75)',
      values: { lactate: 2, map: 75, source: 'pulm', cultures: true, abx: true, fluids: false },
    },
    {
      label: 'Пропущенные шаги (АБ задержаны)',
      values: { lactate: 4.5, map: 60, source: 'uti', cultures: false, abx: false, fluids: false },
    },
  ],
  info: `### Для чего используется
**Surviving Sepsis Campaign (SSC) 2021 Hour-1 Bundle** — международный стандарт ранней терапии сепсиса и септического шока. Все 5 шагов должны быть начаты в течение **1 часа** от распознавания.

### 5 шагов Hour-1 Bundle
| # | Действие | Когда |
|---|---|---|
| 1 | Измерить **лактат**; повторить, если > 2 | Все пациенты |
| 2 | Взять **гемокультуры × 2** до АБ | Все |
| 3 | Ввести **АБ широкого спектра** | Все (в течение 1 ч) |
| 4 | **Кристаллоиды 30 мл/кг** | Гипотензия или лактат ≥ 4 |
| 5 | **Вазопрессоры** (норэпинефрин) | MAP < 65 после инфузии |

### Определения Sepsis-3
- **Сепсис** = инфекция + ΔSOFA ≥ 2
- **Септический шок** = вазопрессоры для MAP ≥ 65 + лактат > 2 несмотря на инфузию

### Формула
Compliance = выполненные шаги / применимые шаги × 100%

### Ограничения
- Инфузия 30 мл/кг: ориентир, у ХСН/ХБП — титровать
- qSOFA/SIRS — скрининг, не диагностика
- Вазопрессоры через периферию краткосрочно допустимы`,
};

export default runner;

/** Runner: tumor-markers - Tumor marker interpretation (CEA, AFP, CA 19-9, CA 125, PSA, HCG) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'marker', label: 'Онкомаркёр', type: 'select', options: [
      { value: 'cea', label: 'CEA - колоректальный, лёгочный' },
      { value: 'afp', label: 'AFP - гепатоцеллюлярный, герминогенные опухоли' },
      { value: 'ca199', label: 'CA 19-9 - поджелудочная, билиарная' },
      { value: 'ca125', label: 'CA 125 - яичниковый' },
      { value: 'ca153', label: 'CA 15-3 - молочная железа' },
      { value: 'psa', label: 'PSA - простата' },
      { value: 'hcg', label: 'β-hCG - хориокарцинома, герминогенные' },
      { value: 'chromogranin', label: 'Хромогранин A - NET' },
      { value: 'calcitonin', label: 'Кальцитонин - медуллярный рак ЩЖ' },
    ] },
    { id: 'value', label: 'Значение', type: 'number', unit: '', min: 0, max: 100000, step: 0.1, quickValues: [5, 20, 100, 500, 1000] },
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 110, step: 1, quickValues: [40, 55, 70] },
  ],
  compute: (v) => {
    const marker = String(v.marker);
    const val = Number(v.value);
    const age = Number(v.age);

    type MarkerData = { unit: string; norm: number; abnormal: number; veryHigh: number; uses: string; falses: string; smoker?: number };
    const data: Record<string, MarkerData> = {
      cea: { unit: 'нг/мл', norm: 5, abnormal: 10, veryHigh: 50, smoker: 10,
        uses: 'Мониторинг КРР, метастазы, прогрессия. Не для скрининга.',
        falses: 'Курение (≤10 норма), ХОБЛ, цирроз, панкреатит, ВЗК, доброк.' },
      afp: { unit: 'нг/мл', norm: 10, abnormal: 20, veryHigh: 400,
        uses: 'ГЦР (при циррозе), герминогенные опухоли, скрининг пороков плода.',
        falses: 'Беременность, цирроз, гепатит, доброкач.' },
      ca199: { unit: 'Ед/мл', norm: 37, abnormal: 100, veryHigh: 1000,
        uses: 'Панкреатический рак (Se 80 %, Sp 90 %), холангиокарцинома.',
        falses: 'Холестаз (любой генез), панкреатит, цирроз, Lewis-отриц. (5-10 %) - ложно-норма.' },
      ca125: { unit: 'Ед/мл', norm: 35, abnormal: 100, veryHigh: 1000,
        uses: 'Эпителиальный рак яичников (мониторинг), перитонеальный карциноматоз.',
        falses: 'Менструация, беременность, эндометриоз, цирроз, панкреатит.' },
      ca153: { unit: 'Ед/мл', norm: 30, abnormal: 50, veryHigh: 200,
        uses: 'Метастатический рак молочной железы (мониторинг).',
        falses: 'Цирроз, ВЗК, бенигн. мастопатия.' },
      psa: { unit: 'нг/мл', norm: age >= 70 ? 6.5 : age >= 60 ? 4.5 : 4, abnormal: age >= 70 ? 10 : 6.5, veryHigh: 20,
        uses: 'Скрининг + мониторинг рака простаты. ИПАП (PSA density), velocity.',
        falses: 'ДГПЖ, простатит, катетеризация, эякуляция (48 ч), езда на велосипеде.' },
      hcg: { unit: 'мМЕ/мл', norm: 5, abnormal: 25, veryHigh: 10000,
        uses: 'Беременность, хориокарцинома, герминогенные опухоли (семинома NOT, эмбриональный, тератома).',
        falses: 'Беременность.' },
      chromogranin: { unit: 'мкг/л', norm: 100, abnormal: 300, veryHigh: 1000,
        uses: 'Нейроэндокринные опухоли (NET, GI/панкреат/лёгочные).',
        falses: 'ИПП ≥ 2 нед, почечная недостаточность, АГ, ХОБЛ.' },
      calcitonin: { unit: 'пг/мл', norm: 10, abnormal: 50, veryHigh: 500,
        uses: 'Медуллярный рак ЩЖ, MEN2.',
        falses: 'ХБП, ингибиторы протонной помпы.' },
    };
    const d = data[marker]!;
    const norm = d.norm;

    let band = '', color = '#22C55E', details = '', actions = [];
    if (val < norm) {
      band = 'Норма'; color = '#22C55E';
      details = `${marker.toUpperCase()} ${val} ${d.unit} в норме (< ${norm}).`;
      actions = ['Продолжать обычное наблюдение', d.uses];
    } else if (val < d.abnormal) {
      band = 'Слегка повышен'; color = '#F59E0B';
      details = `${marker.toUpperCase()} ${val} ${d.unit} слегка повышен (${norm}-${d.abnormal}). Возможно пограничное значение.`;
      actions = ['Повторить через 4-6 нед', 'Рассмотреть ложно-положительные причины: ' + d.falses, d.uses];
    } else if (val < d.veryHigh) {
      band = 'Повышен'; color = '#EF4444';
      details = `${marker.toUpperCase()} ${val} ${d.unit} значительно повышен (> ${d.abnormal}). Требуется визуализация для поиска опухоли.`;
      actions = ['КТ/МРТ по локализации', 'Онколог', d.uses];
    } else {
      band = 'Очень высокий'; color = '#991B1B';
      details = `${marker.toUpperCase()} ${val} ${d.unit} очень высокий (> ${d.veryHigh}). Вероятен диссеминированный процесс.`;
      actions = ['Полное стадирование (КТ body, ПЭТ-КТ)', 'Онколог срочно', d.uses];
    }

    return {
      value: val.toString(), unit: d.unit,
      interpretation: band, color,
      details,
      actions,
      caveats: [
        'Онкомаркёры - инструмент МОНИТОРИНГА, не скрининга (кроме PSA, AFP при циррозе)',
        'Один тест не даёт диагноза - динамика важнее абсолютного значения',
        'Ложно-положительные частые: ' + d.falses.split('.').slice(0, 2).join('.'),
        'Онкомаркёр не заменяет визуализацию и гистологию',
      ],
      scale: {
        segments: [
          { min: 0, max: norm, label: '≤' + norm + ' норма', color: '#22C55E' },
          { min: norm, max: d.abnormal, label: 'Слегка ↑', color: '#F59E0B' },
          { min: d.abnormal, max: d.veryHigh, label: 'Повышен', color: '#EF4444' },
          { min: d.veryHigh, max: d.veryHigh * 3, label: 'Оч. высокий', color: '#991B1B' },
        ],
        current: Math.min(val, d.veryHigh * 3),
        unit: d.unit,
      },
      related: [
        { id: 'tnm', title: 'TNM' },
        { id: 'recist', title: 'RECIST' },
        { id: 'ecog-kps', title: 'ECOG/KPS' },
      ],
      relatedCourses: [
        { id: '309.x', title: 'Онкология' },
        { id: '304.5', title: 'Онкомаркёры' },
      ],
    };
  },
  reference: 'Sturgeon CM et al. NACB LMPG: Use of Tumor Markers. Clin Chem 2008;54:e11. ESMO Clinical Practice Guidelines.',
  countries: 'Международный (NACB · ESMO · ASCO)',
  presets: [
    { label: 'CEA 3.2 (норма)', values: { marker: 'cea', value: 3.2, age: 55 } },
    { label: 'CA 19-9 250 (панкр. рак)', values: { marker: 'ca199', value: 250, age: 65 } },
    { label: 'PSA 12 (прост.)', values: { marker: 'psa', value: 12, age: 68 } },
  ],
  info: `### Для чего используется
Интерпретация онкомаркёров - биохимических индикаторов опухолевых заболеваний. Применяются для МОНИТОРИНГА лечения, выявления прогрессии, редко - для скрининга.

### Основные маркёры
| Маркёр | Норма | Основные показания |
|---|---|---|
| CEA | < 5 нг/мл (<10 курящ.) | КРР, лёгкое, щитовидная |
| AFP | < 10 нг/мл | ГЦР (при циррозе), герминогенные |
| CA 19-9 | < 37 Ед/мл | Панкреатический, билиарный |
| CA 125 | < 35 Ед/мл | Яичниковый, перитонеальный |
| CA 15-3 | < 30 Ед/мл | Молочная железа (мониторинг метастазов) |
| PSA | <4 (возраст-корр) | Простата (скрининг + мониторинг) |
| β-hCG | < 5 мМЕ/мл | Хориокарцинома, герминогенные |
| Chromogranin A | < 100 мкг/л | NET (нейроэндокринные) |
| Calcitonin | < 10 пг/мл | Медуллярный рак ЩЖ |

### Ложно-положительные
Любой маркёр может быть повышен при:
- Беременности
- Воспалительных процессах
- Циррозе
- Почечной недостаточности
- Доброкачественных новообразованиях`,
};

export default runner;

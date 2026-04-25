// @ts-nocheck
/** Runner: age-ddimer - Age-adjusted D-dimer cut-off for PE/DVT exclusion */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 110, step: 1, quickValues: [30, 50, 65, 75, 85] },
    { id: 'dd',
hint: 'D-димер. Норма: <500 нг/мл FEU', label: 'D-димер (FEU)', type: 'number', unit: 'мкг/л', min: 0, max: 20000, step: 10, quickValues: [300, 500, 800, 1200, 2000] },
    { id: 'unit', label: 'Единицы D-димера', type: 'select', options: [
      { value: 'feu', label: 'FEU (Fibrinogen Equivalent Units, мкг/л)' },
      { value: 'ddu', label: 'DDU (D-Dimer Units, мкг/л) - делить FEU на 2' },
    ] },
    { id: 'ptp', label: 'Предтестовая вероятность (Wells / Geneva)', type: 'select', options: [
      { value: 'low', label: 'Низкая / маловероятная ТЭЛА' },
      { value: 'moderate', label: 'Промежуточная' },
      { value: 'high', label: 'Высокая' },
    ] },
  ],
  compute: (v) => {
    const age = Number(v.age);
    const dd = Number(v.dd);
    const unit = String(v.unit);
    const ptp = String(v.ptp);

    // Age-adjusted cut-off (FEU): 500 if age ≤ 50, else age × 10 (µg/L FEU)
    // For DDU: divide by 2 → 250 or age × 5
    const cutoffFeuStd = 500;
    const cutoffFeuAdj = age > 50 ? age * 10 : 500;
    const cutoff = unit === 'ddu' ? cutoffFeuAdj / 2 : cutoffFeuAdj;
    const stdCutoff = unit === 'ddu' ? cutoffFeuStd / 2 : cutoffFeuStd;

    const belowStd = dd < stdCutoff;
    const belowAdjusted = dd < cutoff;

    let band = '', color = '#22C55E', details = '', actions = [];

    if (ptp === 'high') {
      band = 'D-димер не применим'; color = '#EF4444';
      details = `Высокая ПТВ ТЭЛА - D-димер НЕ используется для исключения (отрицательный тест не снимает диагноз). Независимо от уровня - требуется КТ-ангиография лёгочных артерий.`;
      actions = [
        'КТ-ангиография лёгочных артерий (CTPA) немедленно',
        'При невозможности CTPA: V/Q-сканирование, ЭхоКГ (правый желудочек)',
        'При массивной ТЭЛА + шок - рассмотреть тромболизис (альтеплаза 100 мг/2 ч)',
        'Немедленная антикоагуляция (НФГ в/в болюс 80 ЕД/кг) при подозрении',
      ];
    } else if (belowAdjusted) {
      band = 'ТЭЛА исключена'; color = '#22C55E';
      details = `D-димер ${dd} ${unit === 'ddu' ? 'мкг/л DDU' : 'мкг/л FEU'} НИЖЕ возраст-корректированного порога ${cutoff.toFixed(0)} (возраст ${age} × 10 для FEU или × 5 для DDU). При низкой/промежуточной ПТВ - ТЭЛА можно исключить без визуализации.`;
      actions = [
        'Визуализация НЕ требуется',
        'Искать альтернативный диагноз (пневмония, сердечная недостаточность, мышечно-скелетная)',
        'Если клиника сохраняется - повторить оценку или CTPA при нарастании',
      ];
    } else if (belowStd) {
      band = 'Выше возраст-адапт.'; color = '#F59E0B';
      details = `D-димер ${dd} между стандартным порогом ${stdCutoff} и возраст-корректированным ${cutoff.toFixed(0)}. Стандартный тест "положителен", но age-adjusted - "отрицателен" (если используется протокол ADJUST-PE / YEARS).`;
      actions = [
        'При применении age-adjusted (ADJUST-PE) - ТЭЛА исключена, визуализация НЕ требуется',
        'При стандартном порогу - требуется CTPA',
        'Обсудить с командой принятые локально протоколы',
      ];
    } else {
      band = 'D-димер повышен'; color = '#EF4444';
      details = `D-димер ${dd} ВЫШЕ возраст-корректированного порога ${cutoff.toFixed(0)}. Требуется визуализация для подтверждения/исключения ТЭЛА.`;
      actions = [
        'КТ-ангиография лёгочных артерий (CTPA) - золотой стандарт',
        'При беременности, ХБП, аллергии на контраст - V/Q-сканирование',
        'До получения результата - профилактическая антикоагуляция НФГ/НМГ',
        'Оценить альтернативные причины D-димера: инфекция, травма, хирургия, рак, беременность',
      ];
    }

    return {
      value: dd.toFixed(0), unit: unit === 'ddu' ? 'мкг/л DDU' : 'мкг/л FEU',
      interpretation: band, color,
      details, actions,
      caveats: [
        'Age-adjusted cut-off валидизирован в исследованиях ADJUST-PE (2014) и YEARS (2017)',
        'Применим только при НИЗКОЙ/ПРОМЕЖУТОЧНОЙ ПТВ (Wells/Geneva/PERC отриц.)',
        'ВЫСОКАЯ ПТВ → всегда визуализация, независимо от D-димера',
        'FEU ≈ 2 × DDU (разные единицы, проверять тест-систему лаборатории)',
        'D-димер повышен при: инфекция, рак, беременность, ДВС, после операций, у пожилых',
      ],
      scale: {
        // Visible range capped at 3× cutoff. D-dimer values in the thousands
        // are clinically «high» regardless of how much higher; no need to
        // stretch the bar to 10× which would squash the decision band.
        segments: [
          { min: 0, max: stdCutoff, label: 'Норма', color: '#22C55E' },
          { min: stdCutoff, max: cutoff, label: 'Age-adj OK', color: '#F59E0B' },
          { min: cutoff, max: cutoff * 2, label: 'Повышен', color: '#EF4444' },
          { min: cutoff * 2, max: cutoff * 3, label: 'Выс. повыш.', color: '#991B1B' },
        ],
        current: Math.min(dd, cutoff * 3),
        unit: unit === 'ddu' ? 'мкг/л DDU' : 'мкг/л FEU',
      },
      related: [
        { id: 'wells-pe', title: 'Wells PE' },
        { id: 'geneva', title: 'Geneva revised' },
        { id: 'perc', title: 'PERC' },
        { id: 'years', title: 'YEARS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '303.2', title: 'Гемостаз' },
      ],
    };
  },
  reference: 'Righini M et al. ADJUST-PE. JAMA 2014;311:1117. van der Hulle T et al. YEARS. Lancet 2017;390:289.',
  countries: 'Международный (ESC · ACCP)',
  presets: [
    { label: '70 лет, D-димер 600 (age-cut 700)', values: { age: 70, dd: 600, unit: 'feu', ptp: 'low' } },
    { label: '50 лет, D-димер 480 (в норме)', values: { age: 50, dd: 480, unit: 'feu', ptp: 'low' } },
    { label: '85 лет, D-димер 900', values: { age: 85, dd: 900, unit: 'feu', ptp: 'moderate' } },
  ],
  info: `### Для чего используется
Возраст-корректированный порог D-димера для исключения ТЭЛА у пациентов старше 50 лет. Стандартный порог 500 мкг/л FEU даёт много ложно-положительных результатов в пожилом возрасте.

### Формула
Age-adjusted cutoff (FEU) = возраст (лет) × 10   (для возраста > 50)
Age-adjusted cutoff (DDU) = возраст (лет) × 5    (DDU = FEU / 2)

Пример: 75-летний пациент - порог 750 мкг/л FEU (вместо 500).

### Применимость
Только при НИЗКОЙ/ПРОМЕЖУТОЧНОЙ предтестовой вероятности (ПТВ) ТЭЛА.
При ВЫСОКОЙ ПТВ - D-димер НЕ используется (отрицательный не исключает), сразу CTPA.

### Преимущества
- ADJUST-PE (JAMA 2014): специфичность ↑ с 35 % до 44 %, безопасность сохранена
- YEARS (Lancet 2017): ещё меньше CTPA без пропущенных ТЭЛА
- Снижает радиационную нагрузку и контрастные осложнения у пожилых

### Ограничения
- НЕ применим при беременности (используйте YEARS-pregnancy или CTPA)
- НЕ применим при онкологии с активной химиотерапией
- Локальные протоколы могут отличаться - согласуйте с командой`,
};

export default runner;

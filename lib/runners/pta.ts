/** Runner: pta - Pure Tone Average / hearing loss grading */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'f500',
      label: 'Порог на 500 Гц (dB HL)',
      type: 'number',
      min: -10,
      max: 120,
      step: 5,
      quickValues: [10, 30, 50, 80],
    },
    {
      id: 'f1000',
      label: 'Порог на 1000 Гц (dB HL)',
      type: 'number',
      min: -10,
      max: 120,
      step: 5,
      quickValues: [10, 30, 50, 80],
    },
    {
      id: 'f2000',
      label: 'Порог на 2000 Гц (dB HL)',
      type: 'number',
      min: -10,
      max: 120,
      step: 5,
      quickValues: [10, 30, 50, 80],
    },
    {
      id: 'f4000',
      label: 'Порог на 4000 Гц (dB HL, опционально для PTA4)',
      type: 'number',
      min: -10,
      max: 120,
      step: 5,
      quickValues: [10, 40, 60, 90],
    },
  ],
  compute: (v) => {
    const f500 = Number(v.f500) || 0;
    const f1000 = Number(v.f1000) || 0;
    const f2000 = Number(v.f2000) || 0;
    const f4000 = Number(v.f4000) || 0;
    const pta3 = (f500 + f1000 + f2000) / 3;
    const pta4 = f4000 > 0 ? (f500 + f1000 + f2000 + f4000) / 4 : null;
    const pta = pta3;

    // WHO grading 2021
    let band = '', color = '#22C55E', details = '';
    if (pta <= 19) {
      band = 'Норма';
      color = '#22C55E';
      details = `PTA ${pta.toFixed(0)} dB - слух в пределах нормы (WHO 2021: < 20 dB).`;
    } else if (pta <= 34) {
      band = 'Лёгкая (mild)';
      color = '#84CC16';
      details = `PTA ${pta.toFixed(0)} dB - лёгкая тугоухость (WHO 20-34). Трудности в шуме, тихая речь.`;
    } else if (pta <= 49) {
      band = 'Умеренная (moderate)';
      color = '#F59E0B';
      details = `PTA ${pta.toFixed(0)} dB - умеренная (WHO 35-49). Показаны СА.`;
    } else if (pta <= 64) {
      band = 'Умер-тяж (mod-severe)';
      color = '#FB923C';
      details = `PTA ${pta.toFixed(0)} dB - умеренно-тяжёлая (WHO 50-64). СА обязательны.`;
    } else if (pta <= 79) {
      band = 'Тяжёлая (severe)';
      color = '#EF4444';
      details = `PTA ${pta.toFixed(0)} dB - тяжёлая (WHO 65-79). Мощные СА, рассмотреть CI.`;
    } else if (pta <= 94) {
      band = 'Глубокая (profound)';
      color = '#991B1B';
      details = `PTA ${pta.toFixed(0)} dB - глубокая (WHO 80-94). Показана кохлеарная имплантация.`;
    } else {
      band = 'Полная (complete)';
      color = '#4C1D24';
      details = `PTA ${pta.toFixed(0)} dB - полная потеря (WHO ≥ 95). CI, слухоречевая реабилитация.`;
    }

    return {
      value: pta.toFixed(0),
      unit: 'dB HL (PTA3)',
      interpretation: band,
      color,
      details: `${details}${pta4 !== null ? ` PTA4 (500/1k/2k/4k) = ${pta4.toFixed(0)} dB.` : ''}`,
      actions: [
        'Тимпанометрия, акустические рефлексы - тип тугоухости (конд./сенсоневр./смешанная)',
        'Речевая аудиометрия (SRT, WRS) - разборчивость речи',
        pta >= 35 ? 'Подбор слуховых аппаратов (СА)' : 'Мониторинг 1 раз/год',
        pta >= 65 ? 'Кандидатура на кохлеарную имплантацию (CI): PTA ≥ 70 двустор. + WRS ≤ 50% с СА' : '',
        'Генетическое тестирование при врождённой СНТ (GJB2, GJB6, Pendred)',
        'МРТ внутр. уха при односторонней СНТ - исключить вестибулярную шванному',
        'Воздействие шума: дБ-экспозиция и СИЗ',
      ].filter(Boolean),
      caveats: [
        'PTA3 = среднее 500/1000/2000 Гц - стандарт WHO',
        'PTA4 = +4000 Гц - лучше для оценки влияния на речь',
        'PTA6 = 250/500/1000/2000/4000/8000 - подробно',
        'Обязательная костная проводимость - дифф. кондуктивной/сенсорной',
        'Критерий WRS (word recognition score) - ключ при CI отборе',
        'ASHA / AAO-HNS градации отличаются: нормальный <25, лёгкий 26-40',
        'Клиническая единица - dB HL (hearing level), не dB SPL',
      ],
      scale: {
        segments: [
          { min: -10, max: 19, label: 'Норма', color: '#22C55E' },
          { min: 20, max: 34, label: 'Лёгкая', color: '#84CC16' },
          { min: 35, max: 49, label: 'Умер.', color: '#F59E0B' },
          { min: 50, max: 64, label: 'Умер-тяж', color: '#FB923C' },
          { min: 65, max: 79, label: 'Тяжёлая', color: '#EF4444' },
          { min: 80, max: 94, label: 'Глубокая', color: '#991B1B' },
          { min: 95, max: 120, label: 'Полная', color: '#4C1D24' },
        ],
        current: Math.round(pta),
        unit: 'dB HL',
      },
      related: [
        { id: 'aphab', title: 'APHAB' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'WHO World Report on Hearing 2021. Pure tone audiometry grading. ISO 7029. AAO-HNS / ASHA классификации.',
  countries: 'Международный (WHO / ISO 7029)',
  presets: [
    { label: 'Норма (12 dB)', values: { f500: 10, f1000: 10, f2000: 15, f4000: 20 } },
    { label: 'Умеренная СНТ (42 dB)', values: { f500: 35, f1000: 40, f2000: 50, f4000: 65 } },
    { label: 'Тяжёлая (75 dB)', values: { f500: 70, f1000: 75, f2000: 80, f4000: 90 } },
    { label: 'Профундная (95 dB)', values: { f500: 90, f1000: 95, f2000: 100, f4000: 110 } },
  ],
  info: `### Для чего используется
**PTA (Pure Tone Average)** - среднее порогов слуха на речевых частотах. Основная единица градации **тугоухости**.

### Формулы
| Вариант | Частоты (Гц) | Применение |
|---|---|---|
| PTA3 | 500, 1000, 2000 | WHO стандарт |
| PTA4 | 500, 1000, 2000, 4000 | AAO-HNS, речь |
| PTA6 | 250, 500, 1000, 2000, 4000, 8000 | Расширенная |
| Fletcher | 500, 1000, 2000 | Исторический |

### Классификация WHO 2021
| PTA (dB HL) | Степень |
|---|---|
| < 20 | Норма |
| 20-34 | Лёгкая (mild) |
| 35-49 | Умеренная (moderate) |
| 50-64 | Умер.-тяж. |
| 65-79 | Тяжёлая (severe) |
| 80-94 | Глубокая (profound) |
| ≥ 95 | Полная (complete) |

### ASHA / AAO-HNS (США)
- Норма < 25 dB
- Лёгкая 26-40
- Умеренная 41-55
- Умер-тяж 56-70
- Тяжёлая 71-90
- Глубокая > 90

### Клиническое применение
- Степень тугоухости → подбор СА
- Мониторинг (возрастная СНТ, ототоксичность)
- Отбор на кохлеарную имплантацию: PTA ≥ 70 двусторонне + WRS ≤ 50% с СА
- Документация для инвалидности (AMA guidelines)

### Типы тугоухости (по ABG)
- **Кондуктивная**: ABG ≥ 15 dB (воздушн.-костн. зазор)
- **Сенсоневральная**: ABG < 10 dB
- **Смешанная**: оба компонента

### Источник
WHO World Report on Hearing 2021. ISO 7029:2017.`,
};

export default runner;

// @ts-nocheck
/** Runner: ahi */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'apneas', label: 'Количество апноэ за ночь', type: 'number', unit: 'эпизодов', min: 0, max: 500, step: 1, quickValues: [5, 20, 60] },
    { id: 'hypopneas', label: 'Количество гипопноэ за ночь', type: 'number', unit: 'эпизодов', min: 0, max: 500, step: 1, quickValues: [10, 30, 80] },
    { id: 'sleepHours', label: 'Общее время сна (TST)', type: 'number', unit: 'ч', min: 1, max: 14, step: 0.1, quickValues: [6, 7, 8] },
  ],
  compute: (v) => {
    const apn = Number(v.apneas) || 0;
    const hyp = Number(v.hypopneas) || 0;
    const hrs = Number(v.sleepHours) || 1;
    const tst = hrs > 0 ? hrs : 1;
    const ahi = (apn + hyp) / tst;

    let severity = '', color = '', interp = '', rec = '';
    if (ahi < 5) {
      severity = 'Нет СОАС';
      color = '#10B981';
      interp = 'AHI < 5: синдром обструктивного апноэ сна отсутствует.';
      rec = 'Общие рекомендации по гигиене сна. Переоценка при появлении симптомов.';
    } else if (ahi < 15) {
      severity = 'Лёгкий СОАС';
      color = '#84CC16';
      interp = 'AHI 5-14: лёгкая степень СОАС.';
      rec = 'При симптомах или коморбидностях (АГ, СД) — рассмотреть CPAP. Позиционная терапия, снижение веса, исключение алкоголя/седативных.';
    } else if (ahi < 30) {
      severity = 'Умеренный СОАС';
      color = '#F59E0B';
      interp = 'AHI 15-29: умеренная степень СОАС.';
      rec = 'CPAP — терапия первой линии. Альтернативы: MAD (мандибулярное устройство), гипоглоссальная нейростимуляция.';
    } else {
      severity = 'Тяжёлый СОАС';
      color = '#EF4444';
      interp = 'AHI ≥ 30: тяжёлая степень СОАС. Высокий сердечно-сосудистый риск.';
      rec = 'CPAP обязателен. Оценка сопутствующей патологии (АГ, ФП, СН, инсульт). Контроль приверженности > 4 ч/ночь ≥ 70 % ночей.';
    }

    return {
      value: ahi.toFixed(1) + ' /ч',
      unit: 'событий/ч',
      interpretation: interp,
      color,
      details: `Апноэ: ${apn} + гипопноэ: ${hyp} = ${apn + hyp} событий за ${tst.toFixed(1)} ч сна. AHI = ${ahi.toFixed(1)} /ч. ${severity}.`,
      actions: [
        rec,
        ahi >= 15 ? 'Титрация CPAP (auto-CPAP дома или в лаборатории сна)' : 'Позиционная терапия, снижение веса на 5-10 %',
        'Оценка дневной сонливости (ESS), скрининг депрессии',
        ahi >= 30 ? 'Контроль АД, ЭКГ (ФП), липидный профиль, HbA1c' : 'Контроль факторов риска ССЗ',
      ],
      caveats: [
        'Стандартное определение гипопноэ (AASM 2012): ↓ потока ≥ 30 % + десатурация ≥ 3 % или микропробуждение',
        'Альтернатива — RDI (Respiratory Disturbance Index) с учётом RERA',
        'HSAT (домашний тест) может недооценить AHI на 10-30 % vs PSG',
        'У детей AHI ≥ 1 считается патологическим',
        'AHI не отражает тяжесть симптомов — дополните ESS, оксиметрией',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: 'нет', color: '#10B981' },
          { min: 5, max: 15, label: 'лёгкий', color: '#84CC16' },
          { min: 15, max: 30, label: 'умеренный', color: '#F59E0B' },
          { min: 30, max: 100, label: 'тяжёлый', color: '#EF4444' },
        ],
        current: Math.min(100, ahi),
        unit: '/ч',
      },
      related: [
        { id: 'stop-bang', title: 'STOP-BANG' },
        { id: 'bmi', title: 'BMI' },
        { id: 'mmrc', title: 'mMRC' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
      ],
    };
  },
  reference: 'AASM Scoring Manual 2020. ICSD-3 classification of sleep disorders.',
  countries: 'Международный (AASM)',
  presets: [
    { label: 'Норма (AHI 2)', values: { apneas: 3, hypopneas: 11, sleepHours: 7 } },
    { label: 'Лёгкий (AHI 10)', values: { apneas: 20, hypopneas: 50, sleepHours: 7 } },
    { label: 'Умеренный (AHI 22)', values: { apneas: 50, hypopneas: 104, sleepHours: 7 } },
    { label: 'Тяжёлый (AHI 45)', values: { apneas: 120, hypopneas: 195, sleepHours: 7 } },
  ],
  info: `### Для чего используется
**AHI (Apnea-Hypopnea Index)** — основной индекс тяжести обструктивного апноэ сна. Число событий апноэ + гипопноэ на час сна по данным полисомнографии (PSG) или домашнего теста (HSAT).

### Формула
\`\`\`
AHI = (количество апноэ + гипопноэ) / время сна в часах
\`\`\`

### Классификация (AASM)
| AHI (/ч) | Тяжесть |
|---|---|
| < 5 | Норма |
| 5-14 | Лёгкий СОАС |
| 15-29 | Умеренный СОАС |
| ≥ 30 | Тяжёлый СОАС |

### Определения (AASM 2020)
- **Апноэ** — остановка потока ≥ 90 % на ≥ 10 с
- **Гипопноэ** — ↓ потока ≥ 30 % на ≥ 10 с + десатурация ≥ 3 % или микропробуждение
- **RERA** — усилие дыхания без критериев гипопноэ, с пробуждением

### Показания к CPAP
| Ситуация | Рекомендация |
|---|---|
| AHI ≥ 15 | CPAP независимо от симптомов |
| AHI 5-14 + симптомы/коморбидность | CPAP |
| AHI < 5 | Не требуется |

### Альтернативы CPAP
- **MAD** (мандибулярное устройство) — лёгкий/умеренный СОАС
- **Гипоглоссальная нейростимуляция** (Inspire) — при непереносимости CPAP, AHI 15-65, BMI < 32
- **Хирургия** — увулопалатофарингопластика (UPPP), максилломандибулярная остеотомия
- **Снижение веса** — при BMI > 30 может снизить AHI на 30-50 %

### Связанные индексы
| Индекс | Описание |
|---|---|
| **RDI** | + RERA (Respiratory Disturbance Index) |
| **ODI** | Oxygen Desaturation Index |
| **T90** | Время с SpO₂ < 90 % |

### Ограничения
- Не учитывает длительность событий
- Не отражает сонливость (ESS дополняет)
- HSAT может недооценить AHI (отсутствие ЭЭГ → event count / recording time, а не /TST)

### Источник
AASM Scoring Manual v2.6 (2020). ICSD-3.`,
};

export default runner;

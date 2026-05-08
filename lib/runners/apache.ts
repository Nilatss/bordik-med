/**
 * Runner: apache — APACHE II Acute Physiology And Chronic Health Evaluation
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Knaus WA, Draper EA, Wagner DP, Zimmerman JE. APACHE II:
 *               a severity of disease classification system. Crit Care Med.
 *               1985;13(10):818-829. PMID: 3928249
 *   GUIDELINE:  Используется как ICU benchmarking standard worldwide;
 *               входит в SAPS / MPM / SOFA сравнительные studies.
 *
 * 12 physiological variables (worst 24h values, 0-4 each):
 *   1. Temperature (rectal)
 *   2. Mean arterial pressure
 *   3. Heart rate
 *   4. Respiratory rate
 *   5. Oxygenation: PaO2 (если FiO2 <0.5) OR A-a gradient (если ≥0.5)
 *   6. Arterial pH
 *   7. Sodium
 *   8. Potassium
 *   9. Creatinine (×2 если acute renal failure)
 *  10. Hematocrit
 *  11. WBC count
 *  12. GCS (15 - actual GCS)
 *
 * Plus age points:
 *   <44 → 0       45-54 → 2     55-64 → 3     65-74 → 5     ≥75 → 6
 *
 * Plus chronic health points (severe organ insufficiency / immunocompromised):
 *   2 — elective post-op
 *   5 — emergency post-op OR non-op patient
 *
 * Total: max 71. Mortality bands (1985 cohort, Modern adjusted lower):
 *   0-4   → ~4%
 *   5-9   → ~8%
 *   10-14 → ~15%
 *   15-19 → ~25%
 *   20-24 → ~40%
 *   25-29 → ~55%
 *   30-34 → ~75%
 *   ≥35   → ~85%
 *
 * Caveats:
 *   - Designed для ICU admission scoring (within 24h)
 *   - Calculated ONCE — не для serial trends (для этого SOFA)
 *   - Modern alternatives: APACHE III (1991), APACHE IV (2006), SAPS II,
 *     SAPS 3, MPM-III. APACHE-IV more accurate но proprietary.
 *
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'aps',
      label: 'APS - Acute Physiology Score (12 переменных)',
      type: 'number',
      unit: 'баллов',
      min: 0,
      max: 60,
      step: 1,
      quickValues: [0, 5, 10, 15, 20, 25, 30],
      hint: 'Сумма 12 физиологических параметров (Tº, MAP, HR, RR, A-a, pH, Na, K, Cr, Hct, WBC, GCS - через 15 − GCS)',
    },
    {
      id: 'age',
      hint: 'Возраст в годах',
      label: 'Возраст',
      type: 'number',
      unit: 'лет',
      min: 0,
      max: 120,
      step: 1,
      quickValues: [30, 50, 65, 75, 85],
    },
    {
      id: 'chronic',
      label: 'Хронические заболевания',
      type: 'select',
      options: [
        { value: '0', label: 'Нет тяжёлой хронической патологии', points: 0 },
        { value: '2', label: 'Есть, плановая послеоперационная', points: 2 },
        { value: '5', label: 'Есть + экстренная/терапевтическая', points: 5 },
      ],
      hint: 'Тяжёлая патология: цирроз, ХСН IV, ХОБЛ с CO₂-ретенцией, диализ, иммуносупрессия',
    },
  ],
  compute: (v) => {
    const aps = Math.min(Math.max(Number(v.aps || 0), 0), 60);
    const age = Number(v.age || 0);
    const agePts = age < 45 ? 0 : age < 55 ? 2 : age < 65 ? 3 : age < 75 ? 5 : 6;
    const chronic = Number(v.chronic || 0);
    const total = aps + agePts + chronic;

    let mortality = '', color = '#22C55E', details = '', actions: string[] = [];
    if (total <= 4) {
      mortality = '≈ 4%';
      color = '#22C55E';
      details = 'Низкая прогнозируемая госпитальная смертность. Стандартное ведение в ICU.';
      actions = ['Рутинный мониторинг', 'Ранняя мобилизация', 'Daily ICU rounds'];
    } else if (total <= 9) {
      mortality = '≈ 8%';
      color = '#84CC16';
      details = 'Низкая-умеренная смертность. Активная поддержка органных систем, мониторинг.';
      actions = ['Агрессивная оптимизация гемодинамики', 'Контроль глюкозы, нутриция'];
    } else if (total <= 14) {
      mortality = '≈ 15%';
      color = '#F59E0B';
      details = 'Умеренная смертность. Ранняя целенаправленная терапия, поиск обратимых причин.';
      actions = ['Sepsis bundle при подозрении', 'Ежедневная оценка SOFA', 'Возможен multi-disciplinary консилиум'];
    } else if (total <= 19) {
      mortality = '≈ 25%';
      color = '#F97316';
      details = 'Высокая смертность. Интенсивная поддержка, обсуждение целей терапии с семьёй.';
      actions = [
        'Агрессивное лечение причины',
        'Обсуждение goals of care с семьёй',
        'Ранний палиативный консультант по показаниям',
      ];
    } else if (total <= 24) {
      mortality = '≈ 40%';
      color = '#EF4444';
      details = 'Очень высокая смертность. Требуется мультидисциплинарный подход.';
      actions = ['Полная органная поддержка', 'Document advance directives', 'Family meeting'];
    } else if (total <= 29) {
      mortality = '≈ 55%';
      color = '#DC2626';
      details = 'Критическая смертность. Более половины пациентов не выживут.';
      actions = ['Продолжить активное лечение при наличии обратимых причин', 'Палиативная консультация'];
    } else if (total <= 34) {
      mortality = '≈ 73%';
      color = '#991B1B';
      details = 'Очень высокая смертность. Обсудить ограничение лечения при необратимой патологии.';
      actions = ['Seriously consider comfort care', 'Family discussions ежедневно'];
    } else {
      mortality = '> 85%';
      color = '#7F1D1D';
      details = 'Крайне высокая смертность. Большинство случаев - конец жизни.';
      actions = ['Comfort-focused care обычно', 'End-of-life discussions'];
    }

    return {
      value: String(total),
      unit: 'баллов',
      interpretation: `Прогнозируемая госпитальная смертность ${mortality}`,
      color,
      details,
      actions,
      caveats: [
        'APACHE II рассчитывается в первые 24 ч поступления в ICU - не для динамики',
        'Не валидизирован для ожоговых, кардиохирургических и пациентов после АКШ',
        'Переоценивает смертность у септических пациентов в современной эре (lead-time bias)',
        'Для динамического мониторинга использовать SOFA',
        'Более точны APACHE III/IV (платные, проприетарные)',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: '0-4', color: '#22C55E' },
          { min: 5, max: 10, label: '5-9', color: '#84CC16' },
          { min: 10, max: 15, label: '10-14', color: '#F59E0B' },
          { min: 15, max: 20, label: '15-19', color: '#F97316' },
          { min: 20, max: 25, label: '20-24', color: '#EF4444' },
          { min: 25, max: 30, label: '25-29', color: '#DC2626' },
          { min: 30, max: 35, label: '30-34', color: '#991B1B' },
          { min: 35, max: 71, label: '≥ 35', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'sofa', title: 'SOFA' },
        { id: 'saps', title: 'SAPS II' },
        { id: 'mpm', title: 'MPM II' },
        { id: 'mods-lods', title: 'MODS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.9', title: 'Инфекционные болезни' },
      ],
    };
  },
  reference: 'Knaus WA et al. APACHE II: a severity of disease classification system. Crit Care Med 1985;13:818-29.',
  countries: 'Международный (оригинал США)',
  presets: [
    { label: 'Молодой стабильный', values: { aps: 4, age: 35, chronic: '0' } },
    { label: 'Пожилой с сепсисом', values: { aps: 20, age: 72, chronic: '5' } },
    { label: 'Критический', values: { aps: 35, age: 80, chronic: '5' } },
  ],
  info: `### Для чего используется
**APACHE II (Knaus 1985)** - прогностическая шкала **госпитальной смертности пациентов ICU**, рассчитываемая по данным первых 24 часов.

### Компоненты (итого 0-71)
| Компонент | Диапазон |
|---|---|
| **APS** (Acute Physiology Score) - 12 переменных | 0-60 |
| **Возраст** | 0-6 |
| **Хронические заболевания** | 0 / 2 / 5 |

### APS - 12 физиологических параметров
1. Температура (ректально)
2. Среднее АД
3. ЧСС
4. Частота дыхания
5. Оксигенация (A-a gradient или PaO₂)
6. pH артериальной крови
7. Na⁺
8. K⁺
9. Креатинин (×2 при ОПП)
10. Гематокрит
11. WBC
12. GCS (15 − GCS)

Каждый параметр даёт 0-4 балла по отклонению от нормы.

### Прогноз смертности
| Баллы | Смертность |
|---|---|
| 0-4 | ≈ 4% |
| 5-9 | ≈ 8% |
| 10-14 | ≈ 15% |
| 15-19 | ≈ 25% |
| 20-24 | ≈ 40% |
| 25-29 | ≈ 55% |
| 30-34 | ≈ 73% |
| ≥ 35 | > 85% |

### Применение
- Стратификация тяжести для исследований и benchmarking ICU
- Оценка исходного прогноза
- НЕ для индивидуальных решений об ограничении терапии

### Сравнение с другими
| Шкала | Особенность |
|---|---|
| **APACHE II** | Стандарт, бесплатна, 1985 |
| **APACHE III/IV** | Точнее, проприетарные |
| **SAPS II** | Проще, европейский стандарт |
| **SOFA** | Динамическая, для органной дисфункции |
| **MPM II** | Логистическая регрессия, 0/24/48/72 ч |

### Ограничения
- Lead-time bias: пациенты, стабилизированные до ICU, получают «ниже» балл
- Устарела vs современных методов лечения (снижение смертности сепсиса на 50% с 1985)
- Не для ожогов, кардиохирургии, АКШ, детей`,
};

export default runner;

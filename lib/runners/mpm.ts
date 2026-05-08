/**
 * Runner: mpm
 * MPM II - Mortality Probability Model (Lemeshow 1993).
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
      id: 'variant',
      label: 'Временная точка',
      type: 'select',
      options: [
        { value: '0', label: 'MPM₀ - при поступлении в ICU', points: 0 },
        { value: '24', label: 'MPM₂₄ - через 24 часа', points: 0 },
      ],
    },
    {
      id: 'logit',
      label: 'Логит (сумма коэффициентов × переменных + интерсепт)',
      type: 'number',
      unit: '',
      min: -10,
      max: 10,
      step: 0.01,
      quickValues: [-3, -2, -1, 0, 1, 2],
      hint: 'Рассчитывается по оригинальной формуле Lemeshow 1993. MPM₀ intercept = −5.46643; MPM₂₄ intercept = −5.64592',
    },
  ],
  compute: (v) => {
    const logit = Number(v.logit || 0);
    const variant = String(v.variant || '0');
    const p = 1 / (1 + Math.exp(-logit));
    const pct = p * 100;
    const pctStr = pct < 1 ? pct.toFixed(2) : pct.toFixed(1);

    let interpretation = '', color = '#22C55E', details = '', actions: string[] = [];
    if (pct < 10) {
      interpretation = 'Низкая прогнозируемая госпитальная смертность';
      color = '#22C55E';
      details = 'Низкий риск. Стандартное ведение, ранняя деэскалация при стабилизации.';
      actions = ['Рутинный ICU-мониторинг', 'Screening для перевода'];
    } else if (pct < 30) {
      interpretation = 'Умеренная смертность';
      color = '#F59E0B';
      details = 'Умеренный риск. Активная поддержка, daily SOFA, целенаправленная терапия.';
      actions = ['Целенаправленная реанимация', 'Sepsis bundle при подозрении', 'Ежедневная оценка органной дисфункции'];
    } else if (pct < 60) {
      interpretation = 'Высокая смертность';
      color = '#EF4444';
      details = 'Высокий риск. Мультидисциплинарный подход, early goals-of-care обсуждение.';
      actions = [
        'Полная органная поддержка',
        'Family meeting с обсуждением прогноза',
        'Ранняя палиативная консультация',
      ];
    } else {
      interpretation = 'Критическая смертность';
      color = '#991B1B';
      details = 'Критически высокий риск - большинство пациентов не выживут. Обсуждение ограничения терапии.';
      actions = [
        'Daily family meetings',
        'Advance directives',
        'Consider transition to comfort care',
      ];
    }

    const modelNote = variant === '24' ? 'MPM₂₄ (через 24 ч)' : 'MPM₀ (при поступлении)';

    return {
      value: pctStr,
      unit: '%',
      interpretation: `${interpretation} · ${modelNote}`,
      color,
      details,
      actions,
      caveats: [
        'MPM требует правильного расчёта логита по 15 (MPM₀) или 14 (MPM₂₄) переменным',
        'Модель 1993 года - переоценивает смертность в современной эре (MPM III Higgins 2007 более актуален)',
        'Не валидизирован у ожоговых, кардиохирургических, < 18 лет',
        'MPM₂₄ требует данных на 24 ч (не только при поступлении)',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: '< 10%', color: '#22C55E' },
          { min: 10, max: 30, label: '10-30', color: '#F59E0B' },
          { min: 30, max: 60, label: '30-60', color: '#EF4444' },
          { min: 60, max: 100, label: '> 60', color: '#991B1B' },
        ],
        current: pct,
        unit: '%',
      },
      related: [
        { id: 'apache', title: 'APACHE II' },
        { id: 'saps', title: 'SAPS II' },
        { id: 'sofa', title: 'SOFA' },
        { id: 'mods-lods', title: 'MODS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.9', title: 'Инфекционные болезни' },
      ],
    };
  },
  reference: 'Lemeshow S et al. Mortality Probability Models (MPM II) based on an international cohort. JAMA 1993;270:2478-86.',
  countries: 'Международный',
  presets: [
    { label: 'Низкий риск', values: { variant: '0', logit: -3 } },
    { label: 'Умеренный', values: { variant: '0', logit: -1 } },
    { label: 'Высокий', values: { variant: '24', logit: 0.5 } },
  ],
  info: `### Для чего используется
**MPM II (Mortality Probability Model, Lemeshow 1993)** - логистическая модель прогноза **госпитальной смертности пациентов ICU** с использованием легко доступных переменных.

### Два варианта
| Модель | Момент расчёта | Переменных |
|---|---|---|
| **MPM₀** | При поступлении в ICU | 15 |
| **MPM₂₄** | Через 24 ч | 14 |
| **MPM₄₈ / MPM₇₂** | Через 48/72 ч | 15 |

### Формула
\`\`\`
logit = β₀ + Σ(βᵢ × xᵢ)
P(смерть) = 1 / (1 + e^−logit)
\`\`\`

**Intercepts (Lemeshow 1993):**
- MPM₀: β₀ = −5,46643
- MPM₂₄: β₀ = −5,64592

### Переменные MPM₀ (15)
1. Возраст (за каждый год × 0,03057)
2. Кома / глубокий ступор
3. ЧСС ≥ 150
4. САД < 90
5. Хронические: ХПН / цирроз / метастазы
6. Острая: ОПН
7. Сердечная аритмия
8. ЦВЗ
9. GI кровотечение
10. Внутричерепное образование
11. CPR до поступления
12. Механическая вентиляция
13. Тип поступления (хирург / терапевт)
14. Инфекция

### Сравнение с APACHE II / SAPS II
| Шкала | Момент | Точки данных |
|---|---|---|
| **APACHE II** | 24 ч | 14 |
| **SAPS II** | 24 ч | 17 |
| **MPM₀ II** | Поступление | 15 |
| **MPM₂₄ II** | 24 ч | 14 |

MPM удобен тем, что переменные **бинарные** (yes/no) для большинства - проще собирать.

### MPM III (Higgins 2007)
Обновлённая калибровка на современной когорте ICU США. Включает:
- 16 переменных (MPM₀ III)
- Лучшая discrimination (AUC ≈ 0,82)

### Ограничения
- Модели 1993 года устарели для современных результатов sepsis bundles
- Переменные бинарны - теряется градация тяжести
- Не заменяет клиническое суждение и динамический мониторинг (SOFA)`,
};

export default runner;

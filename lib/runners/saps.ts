/**
 * Runner: saps
 * SAPS II - Simplified Acute Physiology Score (Le Gall 1993).
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
      id: 'score',
      label: 'Сумма баллов SAPS II',
      type: 'number',
      unit: 'баллов',
      min: 0,
      max: 163,
      step: 1,
      quickValues: [10, 25, 40, 55, 70, 90],
      hint: 'Складывается из 17 переменных: возраст, 12 физиологических параметров, 3 хронические патологии, тип поступления',
    },
  ],
  compute: (v) => {
    const score = Math.min(Math.max(Number(v.score || 0), 0), 163);
    // Оригинальная формула Le Gall 1993:
    // logit = -7.7631 + 0.0737 × SAPS + 0.9971 × ln(SAPS + 1)
    const logit = -7.7631 + 0.0737 * score + 0.9971 * Math.log(score + 1);
    const p = Math.exp(logit) / (1 + Math.exp(logit));
    const pct = p * 100;
    const pctStr = pct < 1 ? pct.toFixed(2) : pct.toFixed(1);

    let interpretation = '', color = '#22C55E', details = '', actions: string[] = [];
    if (pct < 10) {
      interpretation = 'Низкая прогнозируемая госпитальная смертность';
      color = '#22C55E';
      details = 'Низкий риск. Стандартное ведение в ICU, ранняя мобилизация, деэскалация при стабилизации.';
      actions = ['Стандартный ICU-протокол', 'Ежедневный screening для перевода'];
    } else if (pct < 30) {
      interpretation = 'Умеренная смертность';
      color = '#F59E0B';
      details = 'Умеренный риск. Активная оптимизация органной поддержки, ежедневный SOFA.';
      actions = ['Целенаправленная терапия (MAP, SvO₂, lactate clearance)', 'Ранняя нутритивная поддержка', 'Антибиотики по стратегии'];
    } else if (pct < 60) {
      interpretation = 'Высокая смертность';
      color = '#EF4444';
      details = 'Высокий риск. Мультидисциплинарный подход, обсуждение целей терапии с семьёй.';
      actions = [
        'Полная органная поддержка',
        'Обсуждение goals of care',
        'Ранняя палиативная консультация',
      ];
    } else {
      interpretation = 'Критическая смертность';
      color = '#991B1B';
      details = 'Критически высокий риск. Большинство пациентов не выживут. Обсудить ограничение терапии при необратимых процессах.';
      actions = [
        'Daily family meetings',
        'Consider comfort care',
        'Advance directives',
      ];
    }

    return {
      value: String(score),
      unit: 'баллов',
      interpretation: `${interpretation} (${pctStr}%)`,
      color,
      details,
      actions,
      caveats: [
        'SAPS II рассчитывается по данным первых 24 ч поступления в ICU',
        'Переоценивает смертность в современной эре (lead-time bias, улучшение протоколов)',
        'Не для ожогов, кардиохирургии, АКШ, пациентов < 18 лет',
        'Для динамики использовать SOFA, для уточнённого прогноза - SAPS 3 (Moreno 2005)',
      ],
      scale: {
        segments: [
          { min: 0, max: 29, label: '< 30%', color: '#22C55E' },
          { min: 30, max: 49, label: '30-50', color: '#F59E0B' },
          { min: 50, max: 79, label: '50-80', color: '#EF4444' },
          { min: 80, max: 163, label: '> 80', color: '#991B1B' },
        ],
        current: score,
        unit: 'баллов',
      },
      related: [
        { id: 'apache', title: 'APACHE II' },
        { id: 'sofa', title: 'SOFA' },
        { id: 'mpm', title: 'MPM II' },
        { id: 'mods-lods', title: 'MODS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.9', title: 'Инфекционные болезни' },
      ],
    };
  },
  reference: 'Le Gall JR, Lemeshow S, Saulnier F. A new Simplified Acute Physiology Score (SAPS II). JAMA 1993;270:2957-63.',
  countries: 'Международный (European standard)',
  presets: [
    { label: 'Молодой стабильный', values: { score: 15 } },
    { label: 'Септический взрослый', values: { score: 45 } },
    { label: 'Критический', values: { score: 80 } },
  ],
  info: `### Для чего используется
**SAPS II (Le Gall 1993)** - европейский стандарт прогностической оценки **госпитальной смертности пациентов ICU** по данным первых 24 часов. Упрощённая альтернатива APACHE II/III.

### Формула логистической регрессии
\`\`\`
logit = −7,7631 + 0,0737 × SAPS + 0,9971 × ln(SAPS + 1)
P(смерть) = e^logit / (1 + e^logit)
\`\`\`

### 17 переменных (сумма 0-163)
**Физиология (12):**
- Возраст
- ЧСС
- АД систолическое
- Температура
- PaO₂/FiO₂ (если ИВЛ / CPAP)
- Диурез
- Мочевина крови
- WBC
- K⁺
- Na⁺
- HCO₃⁻
- Билирубин
- GCS

**Хронические (3):**
- Метастазирующий рак
- Гематологические злокачественные
- СПИД

**Тип поступления:**
- Плановая хирургия
- Терапевтическое
- Экстренная хирургия

### Калибровка прогноза
| SAPS II | Смертность |
|---|---|
| 10 | ≈ 4% |
| 30 | ≈ 15% |
| 50 | ≈ 46% |
| 70 | ≈ 80% |
| 90 | ≈ 95% |

### Применение
- Benchmarking ICU performance
- Стратификация пациентов в клинических исследованиях
- Сравнение между центрами

### SAPS 3 (Moreno 2005)
Обновлённая версия:
- Рассчитывается по данным первого часа (не 24 ч)
- 20 переменных
- Региональные калибровки (Европа, Центр./Южн. Америка, Сев. Америка, Австралия, Центр./Зап. Европа)

### Ограничения
- Lead-time bias
- Не валидизирован для ожогов, АКШ, детей
- Устарела в эре ранней sepsis bundles
- Не заменяет клиническое суждение`,
};

export default runner;

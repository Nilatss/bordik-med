/** Runner: snot22 - Sino-Nasal Outcome Test 22 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'rhinologic',
      label: 'Риногенные симптомы (5 пунктов × 0-5 = 0-25): заложенность, выделения, стекание, чихание, потеря обоняния',
      type: 'number',
      min: 0,
      max: 25,
      step: 1,
      quickValues: [0, 8, 15, 22],
    },
    {
      id: 'extranasal',
      label: 'Внерhiнальные (2 × 0-5 = 0-10): ушная боль, давление в лице',
      type: 'number',
      min: 0,
      max: 10,
      step: 1,
      quickValues: [0, 3, 6, 9],
    },
    {
      id: 'ear_facial',
      label: 'Слуховые/лицевые (5 × 0-5 = 0-25): головокружение, боль в ухе, заложенность уха и пр.',
      type: 'number',
      min: 0,
      max: 25,
      step: 1,
      quickValues: [0, 7, 14, 20],
    },
    {
      id: 'sleep',
      label: 'Нарушения сна (4 × 0-5 = 0-20): сон, пробуждения, усталость',
      type: 'number',
      min: 0,
      max: 20,
      step: 1,
      quickValues: [0, 6, 12, 18],
    },
    {
      id: 'psychological',
      label: 'Психологические (6 × 0-5 = 0-30): концентрация, фрустрация, грусть',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      quickValues: [0, 10, 20, 28],
    },
  ],
  compute: (v) => {
    const r = Math.min(25, Number(v.rhinologic) || 0);
    const e = Math.min(10, Number(v.extranasal) || 0);
    const ef = Math.min(25, Number(v.ear_facial) || 0);
    const s = Math.min(20, Number(v.sleep) || 0);
    const psy = Math.min(30, Number(v.psychological) || 0);
    const total = r + e + ef + s + psy;

    let band = '', color = '#22C55E', details = '';
    if (total < 20) {
      band = 'Лёгкое';
      color = '#22C55E';
      details = `SNOT-22 ${total}/110 - лёгкое влияние ХРС на качество жизни.`;
    } else if (total <= 50) {
      band = 'Умеренное';
      color = '#F59E0B';
      details = `SNOT-22 ${total}/110 - умеренное. Показана медикаментозная терапия, возможна хирургия (FESS).`;
    } else {
      band = 'Тяжёлое';
      color = '#EF4444';
      details = `SNOT-22 ${total}/110 - тяжёлое снижение качества жизни. Показана FESS при неэффективности консервативной терапии.`;
    }

    return {
      value: String(total),
      unit: '/110',
      interpretation: band,
      color,
      details,
      actions: [
        'Интраназальные ГКС (мометазон, флутиказон) - первая линия ХРС',
        'Солевой лаваж высокого объёма (Netti pot, 240 мл × 2/день)',
        'При ХРС с полипами: доксициклин 100 мг × 3 нед или пероральный преднизолон short-course',
        total >= 20 ? 'КТ-ППН (оценить Lund-Mackay), направление к ЛОРу' : 'Клинический мониторинг',
        total > 50 ? 'FESS (функциональная эндоскопическая синус-хирургия)' : '',
        'При ХРС с полипами + тип 2 воспаление: биологики (dupilumab, omalizumab, mepolizumab)',
        'MCID: 8.9 баллов (Hopkins 2009)',
      ].filter(Boolean),
      caveats: [
        'SNOT-22 - золотой стандарт оценки QoL при ХРС',
        'Обобщает ринологические, сонные, психологические домены',
        '22 пункта × 0-5 (не беспокоит - чрезвычайно беспокоит) = 0-110',
        'Не диагностический - не заменяет эндоскопию и КТ',
        'Минимальное клинически значимое изменение (MCID): 8.9 (чувствительность к терапии)',
        'Менее специфичен к астме, сопутствующим факторам',
      ],
      scale: {
        segments: [
          { min: 0, max: 19, label: 'Лёгкое', color: '#22C55E' },
          { min: 20, max: 50, label: 'Умеренное', color: '#F59E0B' },
          { min: 51, max: 110, label: 'Тяжёлое', color: '#EF4444' },
        ],
        current: total,
        unit: 'SNOT-22',
      },
      related: [
        { id: 'lund-mackay', title: 'Lund-Mackay' },
        { id: 'act', title: 'ACT (астма)' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Hopkins C, Gillett S, Slack R et al. Psychometric validity of the 22-item Sinonasal Outcome Test. Clin Otolaryngol 2009;34:447-54.',
  countries: 'Международный (EPOS / ERS)',
  presets: [
    { label: 'Лёгкий (SNOT 15)', values: { rhinologic: 6, extranasal: 2, ear_facial: 3, sleep: 2, psychological: 2 } },
    { label: 'Умеренный (SNOT 40)', values: { rhinologic: 12, extranasal: 4, ear_facial: 8, sleep: 8, psychological: 8 } },
    { label: 'Тяжёлый (SNOT 75)', values: { rhinologic: 20, extranasal: 7, ear_facial: 15, sleep: 15, psychological: 18 } },
  ],
  info: `### Для чего используется
**SNOT-22 (Sino-Nasal Outcome Test, Hopkins 2009)** - валидированный 22-пунктовый опросник качества жизни при **хроническом риносинусите (ХРС)** и аллергическом рините.

### Структура
22 пункта × 0-5 (0 = не беспокоит, 5 = чрезвычайно). 5 доменов:
1. **Риногенные** (5): заложенность, выделения, postnasal drip, чихание, потеря обоняния
2. **Внериннальные** (2): ушная боль, давление в лице
3. **Слуховые/лицевые** (5): головокружение, боль в ухе и др.
4. **Сон** (4): нарушения сна, усталость
5. **Психологические** (6): концентрация, фрустрация, грусть

### Интерпретация (общий балл 0-110)
| SNOT-22 | Тяжесть |
|---|---|
| < 20 | Лёгкое |
| 20-50 | Умеренное |
| > 50 | Тяжёлое |

### MCID (Minimal Clinically Important Difference)
**8.9 баллов** (Hopkins 2009).

### Применение
- Скрининг тяжести ХРС, AR
- Отбор кандидатов на FESS
- Оценка эффективности биологиков (dupilumab) при CRSwNP
- Мониторинг терапии

### В EPOS 2020 guidelines
SNOT-22 рекомендован для оценки контроля ХРС. Наряду с Lund-Mackay и эндоскопией Lund-Kennedy.

### Источник
Hopkins C et al. Clin Otolaryngol 2009;34:447.`,
};

export default runner;

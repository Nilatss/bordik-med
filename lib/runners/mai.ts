// @ts-nocheck
/** Runner: mai - Medication Appropriateness Index */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const opts = [
  { value: 1, label: 'A — уместно (1)' },
  { value: 2, label: 'B — незначительная проблема (2)' },
  { value: 3, label: 'C — неуместно (3)' },
];

// MAI weights (Hanlon 1992)
const weights = {
  indication: 3, effectiveness: 3, dosage: 2, correctDir: 2,
  practicalDir: 1, drugDrug: 2, drugDisease: 2, duplication: 1,
  duration: 1, cost: 1,
};

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'indication', label: '1. Показание (есть ли медицинское обоснование?)', type: 'select', options: opts },
    { id: 'effectiveness', label: '2. Эффективность препарата для этого состояния', type: 'select', options: opts },
    { id: 'dosage', label: '3. Корректность дозировки (возраст, вес, СКФ)', type: 'select', options: opts },
    { id: 'correctDir', label: '4. Правильность инструкций приёма', type: 'select', options: opts },
    { id: 'practicalDir', label: '5. Практичность инструкций для пациента', type: 'select', options: opts },
    { id: 'drugDrug', label: '6. Клинически значимые drug-drug взаимодействия', type: 'select', options: opts },
    { id: 'drugDisease', label: '7. Drug-disease взаимодействия (сопутствующие)', type: 'select', options: opts },
    { id: 'duplication', label: '8. Дублирование с другими препаратами', type: 'select', options: opts },
    { id: 'duration', label: '9. Приемлемая длительность терапии', type: 'select', options: opts },
    { id: 'cost', label: '10. Стоимость по сравнению с альтернативами', type: 'select', options: opts },
  ],
  compute: (v) => {
    // Score: A=0, B=1, C=2 penalty multiplied by weight
    const fields: Array<[keyof typeof weights, number]> = [
      ['indication', Number(v.indication) || 1],
      ['effectiveness', Number(v.effectiveness) || 1],
      ['dosage', Number(v.dosage) || 1],
      ['correctDir', Number(v.correctDir) || 1],
      ['practicalDir', Number(v.practicalDir) || 1],
      ['drugDrug', Number(v.drugDrug) || 1],
      ['drugDisease', Number(v.drugDisease) || 1],
      ['duplication', Number(v.duplication) || 1],
      ['duration', Number(v.duration) || 1],
      ['cost', Number(v.cost) || 1],
    ];
    let score = 0;
    const issues: string[] = [];
    fields.forEach(([k, val]) => {
      const penalty = val === 3 ? 2 : val === 2 ? 1 : 0;
      score += penalty * weights[k];
      if (val === 3) issues.push(k);
    });
    // Max score: sum(weights)*2 = 18*2 = 36
    const max = 36;

    let band = '', color = '#22C55E', details = '';
    if (score === 0) { band = 'Препарат уместен'; color = '#22C55E'; details = 'MAI = 0 — назначение полностью уместно.'; }
    else if (score <= 5) { band = 'Незначительные замечания'; color = '#84CC16'; details = 'Лёгкие отклонения — требуется оптимизация.'; }
    else if (score <= 10) { band = 'Умеренно неуместно'; color = '#F59E0B'; details = 'Несколько проблем — пересмотр назначения.'; }
    else { band = 'Значительно неуместно'; color = '#EF4444'; details = 'Существенные проблемы — подумать об отмене или замене (deprescribing).'; }

    return {
      value: String(score),
      unit: `/${max}`,
      interpretation: band,
      color,
      details: `${details}${issues.length ? ' Критические пункты (C): ' + issues.join(', ') + '.' : ''}`,
      actions: [
        'Повторить MAI для каждого препарата в режиме пациента (полипрагмазия)',
        'Применить критерии Beers / STOPP-START для пожилых',
        score > 5 ? 'Провести structured medication review (SMR) с клиническим фармацевтом' : '',
        issues.includes('indication') ? 'Отсутствует показание → deprescribing' : '',
        issues.includes('drugDrug') ? 'Проверить в Lexicomp/UpToDate Drug Interactions' : '',
        issues.includes('dosage') ? 'Пересчитать дозу по СКФ (Cockcroft-Gault), возрасту, весу' : '',
        'Документировать план deprescribing с пациентом (shared decision-making)',
      ].filter(Boolean),
      caveats: [
        'MAI оценивает ОДИН препарат за раз — применять ко всем в полипрагмазии',
        'Субъективен — межэкспертная κ 0.4-0.8 (лучше у клинфармацевтов)',
        'Не заменяет Beers / STOPP-START (явные критерии)',
        'Не учитывает подготовку / форму выпуска / adherence',
        'Оригинальная шкала: 10 вопросов с весами 1-3; суммарный штраф 0-18 (некоторые версии 0-36)',
      ],
      scale: {
        segments: [
          { min: 0, max: 0, label: 'Уместен', color: '#22C55E' },
          { min: 1, max: 5, label: 'Лёгкие', color: '#84CC16' },
          { min: 6, max: 10, label: 'Умеренные', color: '#F59E0B' },
          { min: 11, max: 36, label: 'Тяжёлые', color: '#EF4444' },
        ],
        current: score,
        unit: 'MAI',
      },
      related: [
        { id: 'beers', title: 'Beers Criteria' },
        { id: 'stopp-start', title: 'STOPP/START' },
        { id: 'lexicomp', title: 'Lexicomp interactions' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '304.1', title: 'Гериатрия' },
      ],
    };
  },
  reference: 'Hanlon JT, Schmader KE, Samsa GP, et al. A method for assessing drug therapy appropriateness. J Clin Epidemiol. 1992;45(10):1045-1051.',
  countries: 'Международный (US / EU)',
  presets: [
    { label: 'Уместно', values: { indication: 1, effectiveness: 1, dosage: 1, correctDir: 1, practicalDir: 1, drugDrug: 1, drugDisease: 1, duplication: 1, duration: 1, cost: 1 } },
    { label: 'НПВП у пожилого с ХБП', values: { indication: 2, effectiveness: 2, dosage: 3, correctDir: 1, practicalDir: 1, drugDrug: 2, drugDisease: 3, duplication: 1, duration: 2, cost: 1 } },
    { label: 'Дублирование ИПП', values: { indication: 3, effectiveness: 2, dosage: 1, correctDir: 1, practicalDir: 1, drugDrug: 1, drugDisease: 1, duplication: 3, duration: 3, cost: 2 } },
  ],
  info: `### Для чего используется
**Medication Appropriateness Index (MAI, Hanlon 1992)** — **имплицитная** (экспертная) шкала оценки уместности назначения препарата у пожилых с полипрагмазией.

### 10 критериев с весами
| # | Критерий | Вес |
|---|---|---|
| 1 | Показание | 3 |
| 2 | Эффективность | 3 |
| 3 | Дозировка | 2 |
| 4 | Правильные инструкции | 2 |
| 5 | Практичные инструкции | 1 |
| 6 | Drug-drug взаимодействия | 2 |
| 7 | Drug-disease взаимодействия | 2 |
| 8 | Дублирование | 1 |
| 9 | Длительность | 1 |
| 10 | Стоимость | 1 |

Каждый: A (уместно, 0) / B (незнач., 1) / C (неуместно, 2) × вес.

### Интерпретация (per drug)
| MAI | Значение |
|---|---|
| 0 | Полностью уместно |
| 1-5 | Лёгкие проблемы |
| 6-10 | Умеренные |
| 11+ | Тяжёлые |

### Применение
- Гериатрия, полипрагмазия (5+ препаратов)
- Структурированный обзор лекарств (SMR)
- Deprescribing при переходе из стационара в амбулаторию
- Работа клинического фармацевта

### Комбинировать с эксплицитными критериями
- **Beers Criteria** (AGS, США)
- **STOPP/START** (Ирландия/EU)
- Критерии FORTA, PRISCUS

### Источник
Hanlon JT et al. J Clin Epidemiol 1992;45:1045.`,
};

export default runner;

// @ts-nocheck
/** Runner: naranjo - Naranjo ADR Probability Scale */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const yesNoUnk = (yesP: number, noP: number) => [
  { value: yesP, label: `Да (${yesP > 0 ? '+' : ''}${yesP})` },
  { value: noP, label: `Нет (${noP > 0 ? '+' : ''}${noP})` },
  { value: 0, label: 'Неизвестно (0)' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'q1', label: '1. Есть ли предыдущие сообщения об этой реакции?', type: 'select', options: yesNoUnk(1, 0) },
    { id: 'q2', label: '2. Возникла ли реакция после введения препарата?', type: 'select', options: yesNoUnk(2, -1) },
    { id: 'q3', label: '3. Улучшение при отмене или специфическом антидоте?', type: 'select', options: yesNoUnk(1, 0) },
    { id: 'q4', label: '4. Реакция возобновилась при повторном введении?', type: 'select', options: yesNoUnk(2, -1) },
    { id: 'q5', label: '5. Есть ли альтернативные причины реакции?', type: 'select', options: [{ value: -1, label: 'Да (-1)' }, { value: 2, label: 'Нет (+2)' }, { value: 0, label: 'Неизвестно (0)' }] },
    { id: 'q6', label: '6. Реакция появилась при плацебо?', type: 'select', options: [{ value: -1, label: 'Да (-1)' }, { value: 1, label: 'Нет (+1)' }, { value: 0, label: 'Неизвестно (0)' }] },
    { id: 'q7', label: '7. Определена ли концентрация препарата в крови как токсическая?', type: 'select', options: yesNoUnk(1, 0) },
    { id: 'q8', label: '8. Усиление реакции при увеличении дозы / ослабление при снижении?', type: 'select', options: yesNoUnk(1, 0) },
    { id: 'q9', label: '9. Была ли аналогичная реакция ранее на этот/похожий препарат?', type: 'select', options: yesNoUnk(1, 0) },
    { id: 'q10', label: '10. Реакция подтверждена объективными данными?', type: 'select', options: yesNoUnk(1, 0) },
  ],
  compute: (v) => {
    const keys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'] as const;
    const total = keys.reduce((s, k) => s + (Number(v[k]) || 0), 0);

    let band = '', color = '#22C55E', details = '';
    if (total >= 9) { band = 'Определённая (Definite)'; color = '#991B1B'; details = 'Связь с препаратом несомненна.'; }
    else if (total >= 5) { band = 'Вероятная (Probable)'; color = '#EF4444'; details = 'Связь с препаратом высоко вероятна.'; }
    else if (total >= 1) { band = 'Возможная (Possible)'; color = '#F59E0B'; details = 'Связь возможна, но не исключены другие причины.'; }
    else { band = 'Сомнительная (Doubtful)'; color = '#84CC16'; details = 'Связь с препаратом маловероятна.'; }

    return {
      value: String(total),
      unit: 'баллов',
      interpretation: band,
      color,
      details: `Naranjo = ${total}. ${details}`,
      actions: [
        total >= 5 ? 'Отменить подозреваемый препарат; документировать в аллергоанамнезе' : 'Продолжить наблюдение; оценить альтернативные причины',
        'Сообщить в фармаконадзор (Росздравнадзор / FDA MedWatch / EudraVigilance / WHO VigiBase)',
        total >= 9 ? 'Рассмотреть как абсолютное противопоказание к повторному назначению' : '',
        'Добавить аллергию/непереносимость в ЭМК (структурированно, с DRA-кодом)',
        'Уведомить пациента и выдать карточку с указанием препарата и реакции',
        'При серьёзной ADR — разобрать случай на M&M конференции',
      ].filter(Boolean),
      caveats: [
        'Naranjo (1981) — наиболее валидизированная шкала причинности ADR',
        'Альтернативы: WHO-UMC, Liverpool ADR Causality Assessment Tool',
        'Шкала не отражает тяжесть реакции — оценивать отдельно (CTCAE / Hartwig)',
        'Rechallenge (q4) — не всегда этичен; не использовать при серьёзных реакциях',
        'Неизвестные ответы снижают дискриминативную способность',
      ],
      scale: {
        segments: [
          { min: -4, max: 0, label: 'Сомнит.', color: '#84CC16' },
          { min: 1, max: 4, label: 'Возможная', color: '#F59E0B' },
          { min: 5, max: 8, label: 'Вероятная', color: '#EF4444' },
          { min: 9, max: 13, label: 'Определ.', color: '#991B1B' },
        ],
        current: total,
        unit: 'Naranjo',
      },
      related: [
        { id: 'medwatch', title: 'FDA MedWatch' },
        { id: 'pcne', title: 'PCNE DRP' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '308.1', title: 'Клиническая фармакология' },
      ],
    };
  },
  reference: 'Naranjo CA, Busto U, Sellers EM, et al. A method for estimating the probability of adverse drug reactions. Clin Pharmacol Ther. 1981;30(2):239-245.',
  countries: 'Международный (WHO / FDA)',
  presets: [
    { label: 'Классическая НПР', values: { q1: 1, q2: 2, q3: 1, q4: 0, q5: 2, q6: 0, q7: 0, q8: 1, q9: 1, q10: 1 } },
    { label: 'Сомнительная', values: { q1: 0, q2: -1, q3: 0, q4: 0, q5: -1, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 } },
    { label: 'Определённая (definite)', values: { q1: 1, q2: 2, q3: 1, q4: 2, q5: 2, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 } },
  ],
  info: `### Для чего используется
**Шкала Naranjo (1981)** — оценка **вероятности причинно-следственной связи** между препаратом и нежелательной реакцией (ADR).

### 10 вопросов
Баллы +2 / +1 / 0 / -1 в зависимости от вопроса. Суммарно: -4 до +13.

### Интерпретация
| Баллы | Категория |
|---|---|
| ≥9 | Определённая (Definite) |
| 5-8 | Вероятная (Probable) |
| 1-4 | Возможная (Possible) |
| ≤0 | Сомнительная (Doubtful) |

### Ключевые факторы
- **Q2 (+2):** реакция после введения
- **Q4 (+2):** возобновление при rechallenge
- **Q5 (+2):** нет альтернативных причин
- **Q4, Q5 (-1):** противоположно

### Применение
- Оценка случаев ADR в клинике
- Фармаконадзор (Росздравнадзор, FDA MedWatch, EudraVigilance)
- Решение о повторном назначении препарата
- Клинические испытания (оценка причинности)

### Альтернативы
- **WHO-UMC causality** — 6 категорий (certain/probable/possible/unlikely/conditional/unassessable)
- **Liverpool ADR CAT** — педиатрия, онкология
- **Kramer / Karch & Lasagna** — исторические

### Источник
Naranjo CA et al. Clin Pharmacol Ther 1981;30:239.`,
};

export default runner;

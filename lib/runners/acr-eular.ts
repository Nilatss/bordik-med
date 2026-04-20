// @ts-nocheck
/** Runner: acr-eular — ACR/EULAR 2010 RA classification criteria */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'joints',
      label: 'Вовлечение суставов (A)',
      type: 'select',
      options: [
        { value: 0, label: '1 крупный сустав — 0 баллов', points: 0 },
        { value: 1, label: '2-10 крупных суставов — 1', points: 1 },
        { value: 2, label: '1-3 мелких сустава — 2', points: 2 },
        { value: 3, label: '4-10 мелких суставов — 3', points: 3 },
        { value: 5, label: '> 10 суставов (≥ 1 мелкий) — 5', points: 5 },
      ],
    },
    {
      id: 'sero',
      label: 'Серология (B) — РФ и АЦЦП',
      type: 'select',
      options: [
        { value: 0, label: 'РФ и АЦЦП отрицательны — 0', points: 0 },
        { value: 2, label: 'Слабо + (≤ 3× ВГН) — 2', points: 2 },
        { value: 3, label: 'Сильно + (> 3× ВГН) — 3', points: 3 },
      ],
    },
    {
      id: 'acute',
      label: 'Острофазовые показатели (C)',
      type: 'select',
      options: [
        { value: 0, label: 'СРБ и СОЭ в норме — 0', points: 0 },
        { value: 1, label: 'СРБ или СОЭ повышены — 1', points: 1 },
      ],
    },
    {
      id: 'duration',
      label: 'Длительность симптомов (D)',
      type: 'select',
      options: [
        { value: 0, label: '< 6 недель — 0', points: 0 },
        { value: 1, label: '≥ 6 недель — 1', points: 1 },
      ],
    },
  ],
  compute: (v) => {
    const a = Number(v.joints) || 0;
    const b = Number(v.sero) || 0;
    const c = Number(v.acute) || 0;
    const d = Number(v.duration) || 0;
    const total = a + b + c + d;
    const ra = total >= 6;

    let interpretation = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (ra) {
      interpretation = `Определённый РА (≥ 6 баллов) · ${total}/10`;
      color = '#EF4444';
      actions.push('Начать метотрексат 10-15 мг/нед с эскалацией до 25 мг/нед');
      actions.push('Фолиевая кислота 5 мг/нед (не в день МТХ)');
      actions.push('Коротким курсом — преднизолон 10-15 мг/сут как мост до эффекта МТХ');
      actions.push('Оценка DAS28 каждые 1-3 мес (treat-to-target → ремиссия/низкая акт.)');
      actions.push('Скрининг до биологии: ТБ (IGRA), HBV/HCV, вакцинация (пневмокок, грипп)');
      actions.push('Рентген кистей/стоп, УЗИ активных суставов для базиса');
    } else if (total >= 4) {
      interpretation = `Возможный РА, но критерии не выполнены (${total}/10) — динам. наблюдение`;
      color = '#F59E0B';
      actions.push('Повторная оценка через 6-12 нед');
      actions.push('Дифдиагноз: псориатический артрит, СКВ, реактивный артрит, подагра');
      actions.push('МРТ / УЗИ кистей для выявления субклинического синовита');
    } else {
      interpretation = `Критерии РА не выполнены (${total}/10)`;
      color = '#10B981';
      actions.push('Искать альтернативный диагноз');
      actions.push('Анамнез/осмотр на другие ревматические и неревматические причины');
    }

    return {
      value: `${total}/10`,
      unit: 'ACR/EULAR 2010',
      interpretation,
      color,
      details: `**Критерии ACR/EULAR 2010** (применимо при наличии ≥ 1 сустава с определённым клиническим синовитом + отсутствии альтернативного диагноза):\n\n- **A. Суставы:** ${a} балл(ов)\n- **B. Серология:** ${b} балл(ов)\n- **C. Острофазовые:** ${c} балл(ов)\n- **D. Длительность:** ${d} балл(ов)\n\n**Итого: ${total}/10** — порог ≥ 6.`,
      actions,
      caveats: [
        'Критерии классификационные, не диагностические (для РКИ, когорт)',
        'Требуется ≥ 1 сустав с достоверным синовитом при осмотре',
        'Диагноз может быть установлен раньше при эрозиях типичной локализации',
        'АЦЦП более специфичен (95-98 %) чем РФ (70-80 %)',
        'РФ ложно + при ВГС, СКВ, Шёгрена, эндокардите',
      ],
      scale: {
        segments: [
          { min: 0, max: 4, label: 'Нет РА', color: '#10B981' },
          { min: 4, max: 6, label: 'Возможный', color: '#F59E0B' },
          { min: 6, max: 10, label: 'РА', color: '#EF4444' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'das28', title: 'DAS28' },
        { id: 'cdai', title: 'CDAI' },
      ],
      relatedCourses: [
        { id: '301.8', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Aletaha D et al. 2010 ACR/EULAR Classification Criteria for RA. Arthritis Rheum 2010;62:2569-81.',
  countries: 'Международный (ACR/EULAR)',
  presets: [
    { label: 'Типичный РА', values: { joints: 5, sero: 3, acute: 1, duration: 1 } },
    { label: 'Ранний серонег.', values: { joints: 3, sero: 0, acute: 1, duration: 1 } },
    { label: 'Моноартрит круп. сустава', values: { joints: 0, sero: 0, acute: 0, duration: 0 } },
  ],
  info: `### Для чего используется
**ACR/EULAR 2010** — классификационные критерии раннего РА (замена критериев 1987 г., которые ловили только поздний эрозивный РА).

### Баллы (макс. 10) — порог ≥ 6
| Домен | Вариант | Баллы |
|---|---|---|
| **A. Суставы** | 1 крупный | 0 |
| | 2-10 крупных | 1 |
| | 1-3 мелких | 2 |
| | 4-10 мелких | 3 |
| | > 10 (≥ 1 мелкий) | 5 |
| **B. Серология** | РФ− и АЦЦП− | 0 |
| | Слабо + | 2 |
| | Сильно + | 3 |
| **C. Остроф.** | Норма | 0 |
| | Повышение СРБ/СОЭ | 1 |
| **D. Длительн.** | < 6 нед | 0 |
| | ≥ 6 нед | 1 |

### «Мелкие» суставы
ПФ, ПИФ (не ДИФ!), МПФ 1-5, лучезапястный, межфаланг. большого пальца.

### Источник
Aletaha D et al. Arthritis Rheum 2010;62:2569-81.`,
};

export default runner;

// @ts-nocheck
/**
 * Runner: rass — Richmond Agitation-Sedation Scale (Sessler 2002)
 */
import type {
  ScoreTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'rass',
      label: 'Уровень седации/ажитации',
      type: 'select',
      options: [
        { value: '-5', label: '−5 Unarousable — нет реакции на голос и боль', points: -5 },
        { value: '-4', label: '−4 Глубокая седация — движение на боль, нет на голос', points: -4 },
        { value: '-3', label: '−3 Умеренная седация — движение на голос, без контакта глаз', points: -3 },
        { value: '-2', label: '−2 Лёгкая седация — контакт глаз <10 сек', points: -2 },
        { value: '-1', label: '−1 Сонливость — контакт глаз >10 сек', points: -1 },
        { value: '0', label: '0 Спокоен и внимателен', points: 0 },
        { value: '1', label: '+1 Беспокоен', points: 1 },
        { value: '2', label: '+2 Ажитация — частые нецеленаправленные движения', points: 2 },
        { value: '3', label: '+3 Выраженная ажитация — тянет катетеры/трубку', points: 3 },
        { value: '4', label: '+4 Combative — агрессия, опасен для персонала', points: 4 },
      ],
    },
  ],
  bands: [
    { min: -5, max: -4, label: '−5…−4', color: '#991B1B', description: 'Глубокая седация — переседация.' },
    { min: -3, max: -3, label: '−3', color: '#EF4444', description: 'Умеренная седация — часто избыточна для ICU.' },
    { min: -2, max: 0, label: '−2…0', color: '#22C55E', description: 'Целевой диапазон для большинства вентилируемых пациентов ICU.' },
    { min: 1, max: 2, label: '+1…+2', color: '#F59E0B', description: 'Беспокойство/ажитация — оценить причины (боль, делирий, гипоксия).' },
    { min: 3, max: 4, label: '+3…+4', color: '#991B1B', description: 'Тяжёлая ажитация — угроза безопасности, требуется вмешательство.' },
  ],
  caveats: [
    'RASS оценивается в 3 шага: наблюдение → голосовая стимуляция → физическая стимуляция',
    'Целевой уровень для большинства ICU-пациентов: −2…0 (light sedation, SCCM PADIS 2018)',
    'Оценивать каждые 4 часа и после смены инфузии седации',
    'Если пациент RASS ≠ 0 — невозможна оценка CAM-ICU feature 2',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Интенсивная терапия' },
    { id: '301.1', title: 'Анестезиология' },
  ],
  related: [
    { id: 'cam-icu', title: 'CAM-ICU (делирий)' },
    { id: 'bps-icu', title: 'BPS (боль в ICU)' },
    { id: 'gcs', title: 'GCS' },
    { id: 'four', title: 'FOUR score' },
  ],
  reference: 'Sessler CN, Gosnell MS, et al. Am J Respir Crit Care Med 2002;166:1338–1344.',
  countries: 'Международный (SCCM PADIS 2018)',
  info: `### Для чего используется
**Richmond Agitation-Sedation Scale (RASS, Sessler 2002)** — 10-балльная шкала (−5…+4) для динамической оценки уровня седации и ажитации у взрослых в ICU. Золотой стандарт титрования седативной терапии (SCCM PADIS 2018).

### Алгоритм оценки
1. **Наблюдение 10 сек** — спокоен (0), беспокоен (+1…+4)
2. **Голосовой зов** — реакция → −1…−3
3. **Физическая стимуляция** — реакция → −4/−5

### Целевой RASS
| Клиническая ситуация | Цель |
|---|---|
| Рутинная ICU, ИВЛ | −2…0 (light sedation) |
| Тяжёлый ARDS, прон | −3…−4 (глубокая, короткие периоды) |
| Статус эпилептикус (burst suppression) | −5 |
| Weaning / SBT | 0 |

### Альтернативы
| Шкала | Диапазон | Особенность |
|---|---|---|
| **SAS (Riker)** | 1–7 | 4 = оптимум, также валидирована |
| **Ramsay** | 1–6 | Исторически, менее дискриминативна |
| **MAAS** | 0–6 | Motor Activity Assessment Scale |

### Источник
Sessler CN et al. The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients. Am J Respir Crit Care Med 2002;166:1338–44.`,
};

export default runner;

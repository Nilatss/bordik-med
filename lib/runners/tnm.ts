/** Runner: tnm */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 't',
      label: 'T — первичная опухоль',
      type: 'select',
      options: [
        { value: '0', label: 'T0 — нет признаков первичной опухоли' },
        { value: 'is', label: 'Tis — carcinoma in situ' },
        { value: '1', label: 'T1 — ограниченная, малый размер' },
        { value: '2', label: 'T2 — умеренный размер / локальная инвазия' },
        { value: '3', label: 'T3 — значительное распространение' },
        { value: '4', label: 'T4 — инвазия в соседние структуры' },
      ],
    },
    {
      id: 'n',
      label: 'N — регионарные ЛУ',
      type: 'select',
      options: [
        { value: '0', label: 'N0 — метастазов в регионарные ЛУ нет' },
        { value: '1', label: 'N1 — ограниченное поражение ЛУ' },
        { value: '2', label: 'N2 — умеренное поражение ЛУ' },
        { value: '3', label: 'N3 — обширное поражение регионарных ЛУ' },
      ],
    },
    {
      id: 'm',
      label: 'M — отдалённые метастазы',
      type: 'select',
      options: [
        { value: '0', label: 'M0 — отдалённых метастазов нет' },
        { value: '1', label: 'M1 — отдалённые метастазы есть' },
      ],
    },
  ],
  compute: (v) => {
    const t = String(v.t);
    const n = String(v.n);
    const m = String(v.m);
    let stage = '';
    let stageNum = 0;
    let color = '';
    let details = '';
    if (m === '1') {
      stage = 'IV';
      stageNum = 4;
      color = '#991B1B';
      details = 'Наличие отдалённых метастазов. Прогноз серьёзный, лечение преимущественно системное.';
    } else if (t === 'is') {
      stage = '0';
      stageNum = 0;
      color = '#22C55E';
      details = 'Carcinoma in situ. Локальное лечение с отличным прогнозом.';
    } else if (n === '3' || t === '4') {
      stage = 'III';
      stageNum = 3;
      color = '#EF4444';
      details = 'Местно-распространённая опухоль или обширное поражение регионарных ЛУ.';
    } else if (n === '2' || t === '3') {
      stage = 'III';
      stageNum = 3;
      color = '#EF4444';
      details = 'Местно-распространённая опухоль.';
    } else if (n === '1' || t === '2') {
      stage = 'II';
      stageNum = 2;
      color = '#F59E0B';
      details = 'Ранний инвазивный рак с ограниченным поражением.';
    } else if (t === '1' && n === '0') {
      stage = 'I';
      stageNum = 1;
      color = '#84CC16';
      details = 'Ранняя стадия; хороший прогноз при радикальном лечении.';
    } else {
      stage = 'I';
      stageNum = 1;
      color = '#84CC16';
      details = 'Ранняя стадия.';
    }

    return {
      value: `Stage ${stage}`,
      interpretation: `Стадия ${stage} (T${t}N${n}M${m})`,
      color,
      details,
      actions: [
        'Мультидисциплинарный онкоконсилиум (MDT)',
        'Оценка ECOG / KPS, коморбидности (Charlson)',
        'Морфологическая верификация, молекулярное/иммуногистохимическое тестирование',
        'Визуализация: КТ ОГК/ОБП/малого таза ± ПЭТ-КТ по показаниям',
        'Выбор плана лечения в зависимости от локализации и стадии',
      ],
      caveats: [
        'AJCC 8th edition (2017): для каждой локализации своя T/N/M-классификация',
        'Клиническая (cTNM) и патологическая (pTNM) классификации различаются',
        'Префиксы: y (после неоадъювантной терапии), r (рецидив), a (посмертно)',
        'Для некоторых локализаций (молочная железа, простата) учитываются биомаркеры (ER/PR/HER2, PSA, Gleason)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Stage 0-I', color: '#22C55E' },
          { min: 1, max: 2, label: 'Stage II', color: '#F59E0B' },
          { min: 2, max: 3, label: 'Stage III', color: '#EF4444' },
          { min: 3, max: 4, label: 'Stage IV', color: '#991B1B' },
        ],
        current: stageNum,
        unit: 'stage',
      },
      related: [
        { id: 'figo-onco', title: 'FIGO' },
        { id: 'ecog-kps', title: 'ECOG / KPS' },
        { id: 'charlson', title: 'Charlson' },
        { id: 'recist', title: 'RECIST 1.1' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'AJCC Cancer Staging Manual, 8th edition (2017). UICC TNM Classification of Malignant Tumours, 8th ed.',
  countries: 'Международный (AJCC / UICC)',
  presets: [
    { label: 'T2N1M0', values: { t: '2', n: '1', m: '0' } },
    { label: 'T4N2M1', values: { t: '4', n: '2', m: '1' } },
    { label: 'Tis N0 M0', values: { t: 'is', n: '0', m: '0' } },
  ],
  info: `### Для чего используется
**TNM-классификация (AJCC/UICC 8th edition, 2017)** — универсальная система стадирования злокачественных опухолей по трём параметрам: T (первичная опухоль), N (регионарные лимфоузлы), M (отдалённые метастазы).

### Компоненты
| Буква | Значение |
|---|---|
| **T** | Размер и локальная распространённость первичной опухоли (Tis, T1-T4) |
| **N** | Вовлечение регионарных лимфоузлов (N0-N3) |
| **M** | Отдалённые метастазы (M0/M1) |

### Префиксы
- **c** — клиническая классификация (до лечения)
- **p** — патологическая (после резекции)
- **y** — после неоадъювантной терапии
- **r** — рецидив
- **a** — посмертная

### Группировка в стадии (общий принцип)
| Стадия | Характеристика |
|---|---|
| **0** | Tis N0 M0 — carcinoma in situ |
| **I** | T1 N0 M0 — ранняя локализованная |
| **II** | T2 / N1 — местная инвазия или минимальное поражение ЛУ |
| **III** | T3-T4 / N2-N3 — местно-распространённая |
| **IV** | M1 — отдалённые метастазы |

> Конкретные правила группировки зависят от локализации опухоли.

### Биомаркеры в 8-й редакции
- **Молочная железа** — ER/PR, HER2, Ki-67, grade, Oncotype Dx
- **Простата** — PSA, Gleason grade group
- **Колоректальный** — KRAS/NRAS/BRAF, MSI
- **Лёгкое** — EGFR, ALK, ROS1, PD-L1

### Ограничения
- Не заменяет молекулярное стадирование
- Для лимфом (Ann Arbor), лейкозов (Binet/Rai), миеломы (ISS) и гинекологических опухолей (FIGO) используются отдельные системы
- Для сарком — Enneking / AJCC с grade`,
};
export default runner;

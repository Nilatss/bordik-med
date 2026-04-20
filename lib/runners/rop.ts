// @ts-nocheck
/** Runner: rop - Retinopathy of Prematurity (ICROP) classification */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'zone', label: 'Зона', type: 'select', options: [
      { value: '1', label: 'Zone I (вокруг ДЗН, радиус 2×ДЗН-fovea)' },
      { value: '2', label: 'Zone II (до ora serrata назально)' },
      { value: '3', label: 'Zone III (височный серп остаток)' },
    ] },
    { id: 'stage', label: 'Стадия', type: 'select', options: [
      { value: '0', label: 'Stage 0 (незрелая сетчатка, без ROP)' },
      { value: '1', label: 'Stage 1 (демаркационная линия)' },
      { value: '2', label: 'Stage 2 (вал / ridge)' },
      { value: '3', label: 'Stage 3 (экстраретинальная пролиферация)' },
      { value: '4a', label: 'Stage 4A (частичная ОС вне фовеа)' },
      { value: '4b', label: 'Stage 4B (частичная ОС с фовеа)' },
      { value: '5', label: 'Stage 5 (полная отслойка)' },
    ] },
    { id: 'plus', label: 'Plus-disease', type: 'select', options: [
      { value: 'none', label: 'Нет' },
      { value: 'pre', label: 'Pre-Plus' },
      { value: 'plus', label: 'Plus (извитость + дилятация в ≥ 2 квадрантах)' },
    ] },
    { id: 'aprop', label: 'AP-ROP (агрессивная задняя)', type: 'checkbox' },
  ],
  compute: (v) => {
    const zone = String(v.zone || '2');
    const stage = String(v.stage || '0');
    const plus = String(v.plus || 'none');
    const aprop = !!v.aprop;

    // Type 1 ROP (treatment-warranted): Zone I any stage with plus, Zone I stage 3 no plus,
    // Zone II stage 2-3 with plus. AP-ROP always treat.
    let type = 0;
    if (aprop) type = 1;
    else if (zone === '1' && plus === 'plus') type = 1;
    else if (zone === '1' && stage === '3') type = 1;
    else if (zone === '2' && (stage === '2' || stage === '3') && plus === 'plus') type = 1;
    else if (zone === '1' && (stage === '1' || stage === '2') && plus !== 'plus') type = 2;
    else if (zone === '2' && stage === '3' && plus !== 'plus') type = 2;

    let color = '#22C55E', band = 'Наблюдение', details = '', actions: string[] = [];
    let score = 0;
    if (stage === '0') { score = 0; color = '#22C55E'; band = 'Нет ROP'; details = 'Незрелая сетчатка, продолжить скрининг по протоколу.'; }
    else if (type === 1) {
      score = 3; color = '#EF4444'; band = 'Type 1 — лечение';
      details = 'Treatment-warranted ROP: показано лечение в течение 48-72 часов.';
      actions = [
        'Анти-VEGF (бевацизумаб / ранибизумаб) интравитреально — Zone I / AP-ROP',
        'Лазерная коагуляция аваскулярной сетчатки — альтернатива / Zone II',
        'При Stage 4-5 — витреоретинальная хирургия (vitrectomy, scleral buckle)',
        'Повторный осмотр через 3-7 дней после лечения',
      ];
    } else if (type === 2) {
      score = 2; color = '#F59E0B'; band = 'Type 2 — наблюдение';
      details = 'Pre-threshold / Type 2: осмотр 1 раз в неделю, лечение при прогрессии.';
      actions = ['Офтальмоскопия еженедельно', 'Готовность к лечению в пределах 48 ч при переходе в Type 1'];
    } else {
      score = 1; color = '#84CC16'; band = 'Mild ROP';
      details = 'ROP без threshold-критериев. Осмотр каждые 1-2 недели до регрессии или достижения васкуляризации Zone III.';
    }

    return {
      value: `Zone ${zone}, Stage ${stage}${plus === 'plus' ? ' +' : plus === 'pre' ? ' pre+' : ''}${aprop ? ', AP-ROP' : ''}`,
      unit: '',
      interpretation: band,
      color,
      details,
      actions,
      caveats: [
        'ICROP 3 (2021) — действующая классификация',
        'AP-ROP (aggressive posterior ROP) — быстрая прогрессия, plus без классических стадий',
        'Скрининг: все дети < 30 нед ГВ или < 1500 г, первое ОГ в 4-6 нед жизни (но не ранее 31 нед PMA)',
        'Timing лечения — в пределах 48-72 ч от диагноза Type 1',
        'Анти-VEGF имеет риск системной экспозиции — данные о долгосрочной безопасности ограничены',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет / Mild', color: '#22C55E' },
          { min: 1, max: 2, label: 'Type 2', color: '#F59E0B' },
          { min: 2, max: 3, label: 'Type 1', color: '#EF4444' },
        ],
        current: score,
        unit: 'ROP type',
      },
      related: [{ id: 'areds', title: 'AREDS' }, { id: 'etdrs-dr', title: 'ETDRS DR' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'International Committee for the Classification of Retinopathy of Prematurity. ICROP 3. Ophthalmology 2021;128:e51-e68. ETROP Study. Arch Ophthalmol 2003;121:1684.',
  countries: 'Международный (ICROP 3 / AAO)',
  presets: [
    { label: 'Stage 0', values: { zone: '2', stage: '0', plus: 'none', aprop: false } },
    { label: 'Type 1 (Zone I, stage 3)', values: { zone: '1', stage: '3', plus: 'plus', aprop: false } },
    { label: 'AP-ROP', values: { zone: '1', stage: '3', plus: 'plus', aprop: true } },
  ],
  info: `### Для чего используется
**ROP (Retinopathy of Prematurity)** — классификация по ICROP 3 (2021): зона + стадия + plus-disease. Используется для определения риска и показаний к лечению у недоношенных детей.

### Зоны
| Зона | Граница |
|---|---|
| Zone I | Круг радиусом 2× расстояние ДЗН–fovea |
| Zone II | До ora serrata с назальной стороны |
| Zone III | Височный полумесяц остаток |

### Стадии
| Stage | Признак |
|---|---|
| 0 | Незрелая сетчатка, без ROP |
| 1 | Демаркационная линия |
| 2 | Вал (ridge) |
| 3 | Экстраретинальная фиброваскулярная пролиферация |
| 4A | Частичная отслойка вне fovea |
| 4B | Частичная отслойка с fovea |
| 5 | Полная отслойка |

### Type 1 (treatment-warranted) — ETROP
- Zone I любая стадия + plus
- Zone I stage 3 без plus
- Zone II stage 2 или 3 + plus
- AP-ROP — всегда лечение

### Тактика
- Type 1 → анти-VEGF или лазер в 48–72 ч
- Type 2 → наблюдение 1×/нед
- Stage 4-5 → витреоретинальная хирургия

### Скрининг
Все дети ГВ < 30 нед или < 1500 г. Первое обследование в 4–6 нед постнатально (но не ранее 31 нед PMA).

### Источник
ICROP 3 (2021). ETROP (2003).`,
};

export default runner;

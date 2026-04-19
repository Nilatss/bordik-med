// @ts-nocheck
/** Runner: cpp — Cerebral Perfusion Pressure (BTF 2016) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'map', label: 'MAP (среднее АД)', type: 'number', unit: 'мм рт.ст.', min: 30, max: 180, step: 1, quickValues: [60, 70, 80, 90, 100] },
    { id: 'icp', label: 'ICP (внутричерепное давление)', type: 'number', unit: 'мм рт.ст.', min: 0, max: 80, step: 1, quickValues: [10, 15, 20, 25, 30] },
    {
      id: 'age',
      label: 'Возрастная группа',
      type: 'select',
      options: [
        { value: 'adult', label: 'Взрослый' },
        { value: 'child', label: 'Ребёнок (2–16 лет)' },
        { value: 'infant', label: 'Младенец (<2 лет)' },
      ],
    },
  ],
  compute: (v) => {
    const map = Number(v.map);
    const icp = Number(v.icp);
    const cpp = map - icp;
    const age = String(v.age || 'adult');

    let low = 60, high = 70, minLabel = 'взрослый';
    if (age === 'child') { low = 50; high = 60; minLabel = 'ребёнок ≥40'; }
    if (age === 'infant') { low = 40; high = 55; minLabel = 'младенец ≥40–50'; }

    let interpretation = '', color = '', details = '';
    const actions: string[] = [];

    if (cpp < low) {
      interpretation = 'CPP ниже целевого — риск вторичной ишемии';
      color = '#DC2626';
      details = `CPP <${low} мм рт.ст. — риск ишемического повреждения. Цель для данной группы: ${low}–${high} (${minLabel}).`;
      actions.push('Поднять MAP: норэпинефрин, фенилэфрин', 'Снизить ICP: ГМ-положение 30°, нормоСО₂ (35–40), осмотерапия (3% NaCl, маннитол)', 'Поддерживать Na 145–155, T ≤37', 'Декомпрессионная краниоэктомия при рефрактерной ВЧД');
    } else if (cpp > high + 20) {
      interpretation = 'CPP избыточно высокий';
      color = '#F59E0B';
      details = 'CPP >90 у взрослого повышает риск ARDS/CPP-индуцированной дисрегуляции и TRALI-подобных осложнений (BTF 2016 — избегать рутинной агрессивной цели >70).';
      actions.push('Снизить вазопрессоры', 'Переоценить PRx — есть ли авторегуляция', 'Индивидуальный CPP-opt по PRx');
    } else {
      interpretation = 'CPP в оптимальном диапазоне';
      color = '#22C55E';
      details = `CPP ${low}–${high} — оптимум для данной возрастной группы (BTF 2016 / Kochanek 2019 для педиатрии).`;
      actions.push('Поддерживать текущие параметры', 'Мониторинг PRx для индивидуального CPP-opt', 'Целевая Na, нормотермия, нормогликемия');
    }

    return {
      value: cpp.toFixed(0),
      unit: 'мм рт.ст.',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'CPP = MAP − ICP (датчики на уровне козелка / Monro)',
        'BTF 2016: цель 60–70 для взрослых, избегать <50 и >90',
        'Педиатрия (Kochanek 2019): ≥40 у детей, ≥50 у младенцев',
        'Индивидуальный CPP-opt рассчитывается по PRx (Czosnyka 1997)',
      ],
      related: [
        { id: 'rap-prx', title: 'PRx / RAP' },
        { id: 'lund-rosner', title: 'Lund vs Rosner' },
        { id: 'gcs', title: 'GCS' },
        { id: 'four', title: 'FOUR score' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.5', title: 'Нейроанестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: low, label: 'Низкий', color: '#DC2626' },
          { min: low, max: high, label: 'Оптимум', color: '#22C55E' },
          { min: high, max: 120, label: 'Избыток', color: '#F59E0B' },
        ],
        current: cpp,
        unit: 'мм рт.ст.',
      },
    };
  },
  reference: 'Brain Trauma Foundation 2016 (4th ed.); Kochanek et al. Pediatr Crit Care Med 2019.',
  countries: 'Международный',
  presets: [
    { label: 'Оптимум взрослый', values: { map: 85, icp: 20, age: 'adult' } },
    { label: 'Рефр.ВЧГ взрослого', values: { map: 75, icp: 30, age: 'adult' } },
    { label: 'Ребёнок', values: { map: 70, icp: 15, age: 'child' } },
  ],
  caveats: [
    'CPP — суррогат мозгового кровотока; при нарушенной авторегуляции может не отражать перфузию',
  ],
  info: `### Для чего используется
**Cerebral Perfusion Pressure (CPP)** — основной показатель мозгового перфузионного давления у пациентов с ЧМТ, САК, ОНМК. Цель интенсивной терапии — поддержание адекватной мозговой перфузии при снижении/нормализации ICP.

### Формула
\`CPP = MAP − ICP\`

### Возрастные цели (BTF 2016, Kochanek 2019)
| Группа | Цель CPP |
|---|---|
| Взрослый | 60–70 мм рт.ст. |
| Подросток/ребёнок | 50–60 |
| Младенец <2 лет | 40–50 |

### Концепции
- **BTF 2016** — избегать CPP <50 и >90; индивидуализация в диапазоне 60–70
- **Индивидуальный CPP-opt** — рассчитывается по PRx (см. отдельный калькулятор), обычно лежит в окне ±5 от 70
- **Rosner** — MAP вверх до достижения CPP ≥70 (исторически)
- **Lund** — фокус на снижении ICP, допускается CPP >50

### Тактика при низком CPP
1. Поднять MAP (вазопрессор — норэпинефрин)
2. Снизить ICP (головной конец 30°, нормокапния, осмотерапия, седация, ликвор-дренаж)
3. При рефрактерной ВЧГ — декомпрессионная краниотомия`,
};

export default runner;

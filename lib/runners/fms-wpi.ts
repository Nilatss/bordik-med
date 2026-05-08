/** Runner: fms-wpi — ACR 2016 Fibromyalgia diagnostic criteria (WPI + SSS) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const wpiAreas: { id: string; label: string }[] = [
  { id: 'ljaw', label: 'Челюсть (L)' },
  { id: 'rjaw', label: 'Челюсть (R)' },
  { id: 'neck', label: 'Шея' },
  { id: 'lshoulder', label: 'Плечо (L)' },
  { id: 'rshoulder', label: 'Плечо (R)' },
  { id: 'lua', label: 'Верхняя рука (L)' },
  { id: 'rua', label: 'Верхняя рука (R)' },
  { id: 'lla', label: 'Предплечье (L)' },
  { id: 'rla', label: 'Предплечье (R)' },
  { id: 'chest', label: 'Грудная клетка' },
  { id: 'abdomen', label: 'Живот' },
  { id: 'upperback', label: 'Верх спины' },
  { id: 'lowerback', label: 'Поясница' },
  { id: 'lhip', label: 'Бедро/ягодица (L)' },
  { id: 'rhip', label: 'Бедро/ягодица (R)' },
  { id: 'lul', label: 'Верхн. нога (L)' },
  { id: 'rul', label: 'Верхн. нога (R)' },
  { id: 'lll', label: 'Голень (L)' },
  { id: 'rll', label: 'Голень (R)' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    ...wpiAreas.map<ToolInput>((a) => ({ id: a.id, label: `WPI — ${a.label}`, type: 'checkbox', points: 1 })),
    {
      id: 'fatigue',
      label: 'SS — Усталость',
      type: 'select',
      options: [
        { value: 0, label: '0 — нет', points: 0 },
        { value: 1, label: '1 — лёгкая', points: 1 },
        { value: 2, label: '2 — умеренная', points: 2 },
        { value: 3, label: '3 — тяжёлая', points: 3 },
      ],
    },
    {
      id: 'waking',
      label: 'SS — Просыпание без ощущения отдыха',
      type: 'select',
      options: [
        { value: 0, label: '0 — нет', points: 0 },
        { value: 1, label: '1', points: 1 },
        { value: 2, label: '2', points: 2 },
        { value: 3, label: '3 — тяжёлое', points: 3 },
      ],
    },
    {
      id: 'cog',
      label: 'SS — Когнитивные симптомы',
      type: 'select',
      options: [
        { value: 0, label: '0 — нет', points: 0 },
        { value: 1, label: '1', points: 1 },
        { value: 2, label: '2', points: 2 },
        { value: 3, label: '3 — тяжёлые', points: 3 },
      ],
    },
    {
      id: 'somatic',
      label: 'SS — Соматические симптомы (ГБ, депрессия, боль в животе, 3 мес)',
      type: 'select',
      options: [
        { value: 0, label: 'Ни одного', points: 0 },
        { value: 1, label: '1 — головная боль', points: 1 },
        { value: 2, label: '2 — + боль в животе', points: 2 },
        { value: 3, label: '3 — + депрессия', points: 3 },
      ],
    },
    { id: 'duration', label: 'Длительность ≥ 3 мес', type: 'checkbox' },
  ],
  compute: (v) => {
    const wpi = wpiAreas.reduce((acc, a) => acc + (v[a.id] ? 1 : 0), 0);
    const fatigue = Number(v.fatigue) || 0;
    const waking = Number(v.waking) || 0;
    const cog = Number(v.cog) || 0;
    const somatic = Number(v.somatic) || 0;
    const ss = fatigue + waking + cog + somatic;
    const duration = !!v.duration;

    // ACR 2016: (WPI ≥ 7 + SS ≥ 5) OR (WPI 4-6 + SS ≥ 9)  AND duration ≥ 3 mo
    const pathA = wpi >= 7 && ss >= 5;
    const pathB = wpi >= 4 && wpi <= 6 && ss >= 9;
    const meets = (pathA || pathB) && duration;

    let verdict = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (meets) {
      verdict = `Фибромиалгия подтверждена (ACR 2016) · WPI ${wpi} / SSS ${ss}`;
      color = '#EF4444';
      actions.push('Обучение пациента (PSE), градуированные аэробные упражнения 30 мин × 3 р/нед');
      actions.push('Когнитивно-поведенческая терапия (КПТ)');
      actions.push('Амитриптилин 10-25 мг на ночь / дулоксетин 60 мг / прегабалин 300-450 мг/сут');
      actions.push('Избегать опиоидов и долгосрочных НПВП (неэффективны)');
      actions.push('Коморбидности: депрессия, тревога, СРК, ГЭРБ');
    } else if ((pathA || pathB) && !duration) {
      verdict = `Критерии по симптомам выполнены, но длительность < 3 мес — наблюдать`;
      color = '#F59E0B';
      actions.push('Повторная оценка через 3 мес');
    } else if (wpi >= 3 || ss >= 3) {
      verdict = `Критерии не выполнены (WPI ${wpi} / SSS ${ss}) — дифдиагноз`;
      color = '#F59E0B';
      actions.push('Исключить: гипотиреоз, СКВ, РА, полимиозит, B12/D-дефицит, OSAS');
      actions.push('ТТГ, АНА, РФ, КФК, ферритин, витамин D, полисомнография по клинике');
    } else {
      verdict = `Критерии ФМ не выполнены (WPI ${wpi} / SSS ${ss})`;
      color = '#10B981';
      actions.push('Искать альтернативные причины боли');
    }

    return {
      value: `WPI ${wpi}/19 · SSS ${ss}/12`,
      unit: 'ACR 2016',
      interpretation: verdict,
      color,
      details: `ACR 2016 критерии фибромиалгии:\n- Путь A: WPI ≥ 7 + SSS ≥ 5 → ${pathA ? '✅' : '❌'}\n- Путь B: WPI 4-6 + SSS ≥ 9 → ${pathB ? '✅' : '❌'}\n- Длительность ≥ 3 мес → ${duration ? '✅' : '❌'}\n\nWPI (индекс распростр. боли): ${wpi}/19 зон\nSSS (шкала тяжести симптомов): ${ss}/12\n- Усталость: ${fatigue}\n- Просыпание: ${waking}\n- Когнитивные: ${cog}\n- Соматические: ${somatic}`,
      actions,
      caveats: [
        'Диагноз не исключает сопутствующих ревматических заболеваний (ФМ может сосуществовать с РА, СКВ)',
        'Не применять у детей (используйте Juvenile FM criteria)',
        'Опиоиды неэффективны и усиливают центральную сенситизацию — НЕ НАЗНАЧАТЬ',
        'Центральная сенситизация — ключевой механизм (не «психогенное»)',
        'SCID скрининг на депрессию и ПТСР (до 60 % пациентов)',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Нет', color: '#10B981' },
          { min: 3, max: 7, label: 'Погранично', color: '#F59E0B' },
          { min: 7, max: 19, label: 'Высокий WPI', color: '#EF4444' },
        ],
        current: wpi,
        unit: 'WPI баллов',
      },
      related: [
        { id: 'fiqr', title: 'FIQR' },
        { id: 'phq9', title: 'PHQ-9' },
      ],
      relatedCourses: [
        { id: '301.8', title: 'Ревматология' },
        { id: '401.1', title: 'Болевой синдром' },
      ],
    };
  },
  reference: 'Wolfe F et al. 2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria. Semin Arthritis Rheum 2016;46:319-29.',
  countries: 'Международный (ACR 2016)',
  presets: [
    { label: 'Типичная ФМ', values: { ...Object.fromEntries(wpiAreas.map((a) => [a.id, true])), fatigue: 3, waking: 3, cog: 2, somatic: 2, duration: true } },
    { label: 'Не ФМ', values: { ...Object.fromEntries(wpiAreas.map((a) => [a.id, false])), fatigue: 0, waking: 0, cog: 0, somatic: 0, duration: false } },
    {
      label: 'Путь B (4-6 зон + высокий SSS)',
      values: {
        ljaw: true, neck: true, chest: true, lowerback: true, rhip: true, lhip: true,
        fatigue: 3, waking: 3, cog: 3, somatic: 2, duration: true,
      },
    },
  ],
  info: `### Для чего используется
**ACR 2016** — диагностические критерии фибромиалгии (самозаполняемые, без точек болезненности).

### Критерии (все три необходимы)
1. **WPI ≥ 7 и SSS ≥ 5** ИЛИ **WPI 4-6 и SSS ≥ 9**
2. Длительность ≥ 3 мес
3. Общая боль (боль ≥ 4 из 5 регионов: L верх, R верх, L низ, R низ, аксиальный)
4. Диагноз ФМ не исключает сопутствующих заболеваний

### WPI — 19 зон × 1 балл
Челюсть (L/R), шея, плечо (L/R), плечо-локоть (L/R), локоть-кисть (L/R), грудь, живот, верх спины, поясница, бедро (L/R), бедро-колено (L/R), голень (L/R).

### SSS — 4 домена × 0-3 + соматические
- Усталость (0-3)
- Просыпание без отдыха (0-3)
- Когнитивные симптомы (0-3)
- Соматические (ГБ, боль живота, депрессия — 0-3)

### Терапия (EULAR 2016)
1. Обучение + градуированные аэробные упр. (сила A)
2. КПТ (сила A)
3. Амитриптилин, дулоксетин, прегабалин (сила A)
4. Избегать опиоидов и хронических НПВП

### Источник
Wolfe F et al. Semin Arthritis Rheum 2016;46:319-29.`,
};

export default runner;

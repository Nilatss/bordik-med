// @ts-nocheck
/** Runner: who-mec - критерии приемлемости контрацепции (WHO MEC 5e 2015 / CDC US MEC 2024) */
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
      id: 'method',
      label: 'Метод',
      type: 'select',
      options: [
        { value: 'coc', label: 'КОК (комбинированные оральные)' },
        { value: 'patch', label: 'Пластырь / кольцо (комб.)' },
        { value: 'pop', label: 'Прогестин-only pill (POP)' },
        { value: 'dmpa', label: 'DMPA инъекция' },
        { value: 'implant', label: 'Имплант (этоногестрел)' },
        { value: 'lngIud', label: 'ЛНГ-ВМС' },
        { value: 'copperIud', label: 'Медная ВМС' },
      ],
    },
    {
      id: 'condition',
      label: 'Состояние',
      type: 'select',
      options: [
        { value: 'healthy', label: 'Здоровая, нерожавшая' },
        { value: 'smoke35', label: 'Курение ≥ 15 сигарет и возраст ≥ 35' },
        { value: 'htnCtrl', label: 'АГ контролируемая (140-159/90-99)' },
        { value: 'htnSevere', label: 'АГ ≥ 160/100' },
        { value: 'vteHx', label: 'ВТЭ в анамнезе' },
        { value: 'migraineAura', label: 'Мигрень с аурой' },
        { value: 'migraineNoAura', label: 'Мигрень без ауры, < 35' },
        { value: 'bc', label: 'Рак молочной железы' },
        { value: 'dmUncx', label: 'СД без осложнений' },
        { value: 'pp6w', label: 'Послеродовый период < 6 нед, кормит грудью' },
        { value: 'liver', label: 'Тяжёлое заболевание печени' },
        { value: 'lupus', label: 'СКВ с антифосфолипидными АТ' },
      ],
    },
  ],
  compute: (v) => {
    const m = v.method;
    const c = v.condition;
    const combined = m === 'coc' || m === 'patch';
    let cat = 1;
    let note = '';
    if (c === 'healthy') cat = 1;
    else if (c === 'smoke35') cat = combined ? 4 : 1;
    else if (c === 'htnCtrl') cat = combined ? 3 : m === 'dmpa' ? 2 : 1;
    else if (c === 'htnSevere') cat = combined ? 4 : m === 'dmpa' ? 3 : 1;
    else if (c === 'vteHx') cat = combined ? 4 : m === 'dmpa' ? 2 : 1;
    else if (c === 'migraineAura') cat = combined ? 4 : 2;
    else if (c === 'migraineNoAura') cat = combined ? 2 : 1;
    else if (c === 'bc') cat = 4;
    else if (c === 'dmUncx') cat = 2;
    else if (c === 'pp6w') cat = combined ? 4 : m === 'implant' ? 2 : m === 'dmpa' ? 2 : 1;
    else if (c === 'liver') cat = combined ? 4 : m === 'pop' || m === 'implant' ? 3 : 2;
    else if (c === 'lupus') cat = combined ? 4 : 3;
    const colors: Record<number, string> = { 1: '#22C55E', 2: '#86EFAC', 3: '#F59E0B', 4: '#DC2626' };
    const titles: Record<number, string> = {
      1: 'Категория 1 - без ограничений',
      2: 'Категория 2 - польза > риски (применять)',
      3: 'Категория 3 - риски обычно > польза (не рекомендовать, если нет альтернатив)',
      4: 'Категория 4 - недопустимый риск',
    };
    return {
      value: `Категория ${cat}`,
      unit: '',
      interpretation: titles[cat],
      color: colors[cat],
      details:
        cat === 4
          ? 'Метод противопоказан при данном состоянии. Выбрать альтернативу (LARC, барьер, стерилизация).'
          : cat === 3
            ? 'Использование допускается только если другие методы недоступны и под клиническим наблюдением.'
            : cat === 2
              ? 'Метод применим, польза превышает теоретические или доказанные риски.'
              : 'Нет ограничений для использования.',
      actions: [
        'Использовать полный WHO MEC или CDC US MEC для точной классификации',
        'При категориях 3/4 - выбор LARC (ЛНГ-ВМС, имплант) обычно предпочтителен',
      ],
      caveats: [
        'WHO MEC 5th edition 2015 (обновление) / US MEC 2024',
        'Категории оцениваются индивидуально - суммарный эффект нескольких состояний',
        'Экстренная контрацепция (UPA, LNG) имеет отдельные категории',
        'Послеродовый период и грудное вскармливание меняют категории',
      ],
      related: [
        { id: 'chads-vasc', title: 'CHA₂DS₂-VASc' },
        { id: 'wells-pe', title: 'Wells PE' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Гинекология' },
        { id: '200.5', title: 'Семейная медицина' },
      ],
    };
  },
  reference:
    'World Health Organization. Medical eligibility criteria for contraceptive use, 5th edition, 2015 + 2019 update. Centers for Disease Control and Prevention. U.S. MEC 2024.',
  countries: 'Международный (WHO); США (CDC US MEC 2024)',
  presets: [
    { label: 'Здоровая + КОК', values: { method: 'coc', condition: 'healthy' } },
    { label: 'Курение ≥ 35 + КОК', values: { method: 'coc', condition: 'smoke35' } },
    { label: 'Мигрень с аурой + КОК', values: { method: 'coc', condition: 'migraineAura' } },
    { label: 'ВТЭ + ЛНГ-ВМС', values: { method: 'lngIud', condition: 'vteHx' } },
  ],
  caveats: ['Пример расчёта; полный справочник - WHO MEC App / US MEC'],
  related: [
    { id: 'chads-vasc', title: 'CHA₂DS₂-VASc' },
    { id: 'wells-pe', title: 'Wells PE' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '200.5', title: 'Семейная медицина' },
  ],
  info: `### WHO MEC / US MEC
Критерии приемлемости методов контрацепции в зависимости от состояния пациентки.

### Категории
1. Нет ограничений
2. Польза > риски
3. Риски > польза (использовать с осторожностью при отсутствии альтернатив)
4. Недопустимый риск

### Примеры категории 4 для КОК
- Курение ≥ 15 сиг/сут + возраст ≥ 35
- АГ ≥ 160/100
- ВТЭ в анамнезе
- Мигрень с аурой
- Текущий рак молочной железы
- Послеродовый период < 6 нед + грудное вскармливание

### Источники
WHO MEC 5th 2015 (+ 2019 update). CDC US MEC 2024.`,
};

export default runner;

// @ts-nocheck
/** Runner: popq - количественная оценка пролапса тазовых органов (Bump 1996) */
import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    { id: 'aa', label: 'Aa (передняя стенка, 3 см от hymen), см (от −3 до +3)', type: 'number', min: -3, max: 3, step: 0.5 },
    { id: 'ba', label: 'Ba (наиболее выступающая точка передней стенки), см', type: 'number', min: -3, max: 12, step: 0.5 },
    { id: 'c', label: 'C (шейка матки или купол), см', type: 'number', min: -12, max: 12, step: 0.5 },
    { id: 'd', label: 'D (задний свод, при наличии матки), см', type: 'number', min: -12, max: 12, step: 0.5 },
    { id: 'ap', label: 'Ap (задняя стенка, 3 см от hymen), см (от −3 до +3)', type: 'number', min: -3, max: 3, step: 0.5 },
    { id: 'bp', label: 'Bp (наиболее выступающая точка задней стенки), см', type: 'number', min: -3, max: 12, step: 0.5 },
    { id: 'gh', label: 'GH (генитальный hiatus), см', type: 'number', min: 0, max: 12, step: 0.5 },
    { id: 'pb', label: 'PB (перинеальное тело), см', type: 'number', min: 0, max: 10, step: 0.5 },
    { id: 'tvl', label: 'TVL (общая длина влагалища), см', type: 'number', min: 4, max: 14, step: 0.5 },
  ],
  bands: [
    { min: 0, max: 0, label: 'Стадия 0 - пролапса нет', color: '#22C55E', interpretation: 'Все точки Aa/Ba/Ap/Bp = −3; C/D не ниже (TVL − 2) см.', actions: ['Наблюдение', 'Упражнения Кегеля профилактически'] },
    { min: 1, max: 1, label: 'Стадия I', color: '#86EFAC', interpretation: 'Наиболее выступающая точка > 1 см выше hymen.', actions: ['Поведенческая терапия, тренировка мышц тазового дна'] },
    { min: 2, max: 2, label: 'Стадия II', color: '#F59E0B', interpretation: 'Точка в пределах ± 1 см от hymen.', actions: ['Пессарий при симптомах', 'PT тазового дна'] },
    { min: 3, max: 3, label: 'Стадия III', color: '#EF4444', interpretation: 'Точка > 1 см ниже hymen, но не достигает (TVL − 2) см.', actions: ['Хирургическая коррекция обсуждается', 'Пессарий как альтернатива'] },
    { min: 4, max: 4, label: 'Стадия IV - полная эверсия', color: '#DC2626', interpretation: 'Полное выворачивание; выступает (TVL − 2) см.', actions: ['Хирургия (кольпопексия, коррекция цистоцеле/ректоцеле)', 'Пессарий при противопоказаниях к хирургии'] },
  ],
  compute: (v) => {
    const points = [Number(v.aa), Number(v.ba), Number(v.c), Number(v.ap), Number(v.bp)].filter((n) => !isNaN(n));
    const d = Number(v.d);
    const tvl = Number(v.tvl) || 8;
    const maxPoint = points.length ? Math.max(...points, isNaN(d) ? -99 : d) : -3;
    let stage = 0;
    const allMinus3 = points.every((p) => p === -3);
    const cLim = -(tvl - 2);
    if (allMinus3 && (!isNaN(d) ? d <= cLim : Number(v.c) <= cLim)) stage = 0;
    else if (maxPoint < -1) stage = 1;
    else if (maxPoint <= 1) stage = 2;
    else if (maxPoint < tvl - 2) stage = 3;
    else stage = 4;
    const labels = ['0 - нет', 'I', 'II', 'III', 'IV'];
    const colors = ['#22C55E', '#86EFAC', '#F59E0B', '#EF4444', '#DC2626'];
    return {
      value: `Стадия ${labels[stage]}`,
      unit: '',
      score: stage,
      interpretation: `POP-Q stage ${labels[stage]}. Наиболее выступающая точка: ${maxPoint.toFixed(1)} см.`,
      color: colors[stage],
      details: `GH ${v.gh} см · PB ${v.pb} см · TVL ${v.tvl} см. Aa ${v.aa}, Ba ${v.ba}, C ${v.c}, D ${v.d}, Ap ${v.ap}, Bp ${v.bp}.`,
      actions:
        stage >= 3
          ? ['Хирургическая коррекция обсуждается', 'Пессарий как альтернатива', 'PT тазового дна']
          : stage === 2
            ? ['Пессарий при симптомах', 'PT тазового дна']
            : ['Наблюдение, PT тазового дна'],
      caveats: [
        'Измерение проводится при пробе Вальсальвы / натуживании',
        'Отрицательные значения - выше hymen; положительные - ниже',
        'D отсутствует после гистерэктомии',
        'POP-Q - анатомическая оценка, не эквивалентна тяжести симптомов',
      ],
      related: [
        { id: 'palm-coein', title: 'PALM-COEIN' },
        { id: 'straw10', title: 'STRAW+10' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Гинекология' },
        { id: '301.7', title: 'Интранатальная медицина' },
      ],
    };
  },
  reference:
    'Bump RC et al. The standardization of terminology of female pelvic organ prolapse and pelvic floor dysfunction. Am J Obstet Gynecol 1996;175:10-17.',
  countries: 'Международный (ICS, IUGA)',
  presets: [
    { label: 'Стадия 0 - норма', values: { aa: -3, ba: -3, c: -7, d: -8, ap: -3, bp: -3, gh: 3, pb: 3, tvl: 9 } },
    { label: 'Стадия II цистоцеле', values: { aa: 0, ba: 0, c: -5, d: -7, ap: -3, bp: -3, gh: 4, pb: 3, tvl: 9 } },
    { label: 'Стадия III', values: { aa: 2, ba: 4, c: -3, d: -5, ap: -1, bp: 0, gh: 5, pb: 3, tvl: 9 } },
    { label: 'Стадия IV полная эверсия', values: { aa: 3, ba: 8, c: 7, d: 7, ap: 3, bp: 8, gh: 6, pb: 2, tvl: 9 } },
  ],
  caveats: ['POP-Q - анатомия; симптомы оцениваются опросниками (PFDI-20, PISQ-IR)'],
  related: [
    { id: 'palm-coein', title: 'PALM-COEIN' },
    { id: 'straw10', title: 'STRAW+10' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '301.7', title: 'Интранатальная медицина' },
  ],
  info: `### POP-Q (Bump 1996)
Количественная система описания пролапса тазовых органов по 6 точкам + 3 измерениям.

### Точки
- **Aa** - передняя стенка, 3 см проксимальнее hymen (−3 до +3)
- **Ba** - наиболее выступающая точка передней стенки
- **C** - шейка матки / купол влагалища
- **D** - задний свод (задний форникс; при гистерэктомии отсутствует)
- **Ap** - задняя стенка, 3 см проксимальнее hymen
- **Bp** - наиболее выступающая точка задней стенки

### Измерения
GH (genital hiatus), PB (perineal body), TVL (total vaginal length).

### Стадии 0-IV
0 - нет пролапса. I - > 1 см выше hymen. II - ± 1 см от hymen. III - > 1 см ниже, но ≤ TVL − 2. IV - полная эверсия.

### Источник
Bump RC et al. Am J Obstet Gynecol 1996.`,
};

export default runner;

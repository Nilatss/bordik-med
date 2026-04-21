// @ts-nocheck
/** Runner: blacks — G.V. Black Class I-VI caries classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный · классика (G.V. Black, 1908)',
  reference: 'Black GV. A Work on Operative Dentistry. Chicago: Medico-Dental Publishing; 1908. (Классы I-V); Class VI — Simon W, 1956.',
  inputs: [
    { id: 'cls', label: 'Класс Black', type: 'select', options: [
      { value: 'I', label: 'Class I — фиссуры/ямки окклюзионные' },
      { value: 'II', label: 'Class II — проксим. моляров/премоляров' },
      { value: 'III', label: 'Class III — проксим. резцов/клыков БЕЗ угла' },
      { value: 'IV', label: 'Class IV — проксим. резцов/клыков С углом' },
      { value: 'V', label: 'Class V — пришеечные (буккальные/язычные)' },
      { value: 'VI', label: 'Class VI — бугры моляров / режущие края' },
    ]},
  ],
  presets: [
    { label: 'Class I окклюз. моляра', values: { cls: 'I' } },
    { label: 'Class II MOD моляр', values: { cls: 'II' } },
    { label: 'Class V пришеечный', values: { cls: 'V' } },
  ],
  compute: (v) => {
    const c = String(v.cls || 'I');
    const map: Record<string, { loc: string; rest: string; color: string }> = {
      'I':   { loc: 'Фиссуры и ямки окклюзивных поверхностей моляров/премоляров; щёчные/язычные ямки моляров; cingulum pit резцов', rest: 'Композит, амальгама; герметизация (превентивно)', color: '#F59E0B' },
      'II':  { loc: 'Проксимальные (мезиальная/дистальная) поверхности моляров и премоляров', rest: 'Композит (matrix + wedge); MOD inlay/onlay при обширных', color: '#EF4444' },
      'III': { loc: 'Проксимальные поверхности резцов и клыков БЕЗ вовлечения режущего угла', rest: 'Композит (эстетичный, adhesive, slot prep)', color: '#84CC16' },
      'IV':  { loc: 'Проксимальные резцов/клыков С вовлечением режущего угла', rest: 'Композит с построением угла; при большом дефекте — винир/коронка', color: '#EF4444' },
      'V':   { loc: 'Пришеечная треть вестибулярной/язычной поверхности всех зубов (часто абфракция/эрозия)', rest: 'Стеклоиономер (влага), композит; CPP-ACP для профилактики', color: '#F59E0B' },
      'VI':  { loc: 'Бугры моляров/премоляров и режущие края резцов (износ/абразия/кариес)', rest: 'Композит, onlay; защита от абразии (каппа при бруксизме)', color: '#84CC16' },
    };
    const e = map[c];
    return {
      value: c,
      unit: 'Black',
      color: e.color,
      interpretation: `Class ${c}: ${e.loc.split(';')[0]}`,
      details: `Class ${c} (Black)\nЛокализация: ${e.loc}\n\nТипичная реставрация: ${e.rest}`,
      actions: [
        'Препарирование — minimally invasive (adhesive dentistry)',
        'Матрица + клин для Class II/III/IV (контактный пункт)',
        'Rubber dam при композите (изоляция от влаги)',
        'Финишная полировка для профилактики вторичного кариеса',
      ],
      caveats: [
        'Black (1908) — классическая, но ориентирована на амальгаму с extension for prevention',
        'Современная концепция — adhesive/minimally invasive, экономия тканей',
        'Class VI добавлен позже (Simon 1956), некоторые школы не выделяют',
        'Не отражает глубину / активность — используйте ICDAS/CAST параллельно',
      ],
      related: [
        { id: 'cast-icdas', title: 'ICDAS / CAST' },
        { id: 'dmft', title: 'DMFT index' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Классификация G.V. Black** (1908) — топографическая классификация кариозных полостей и реставраций. Основа традиционного препарирования ("extension for prevention"). Классы I-V — Black; VI — Simon 1956.

### Классы
| Класс | Локализация |
|---|---|
| **I** | Фиссуры/ямки (окклюзивные моляров/премоляров; щёчные, язычные ямки) |
| **II** | Проксимальные поверхности моляров/премоляров |
| **III** | Проксимальные резцов/клыков БЕЗ угла |
| **IV** | Проксимальные резцов/клыков С углом |
| **V** | Пришеечная треть (вестибулярная/язычная) |
| **VI** | Бугры / режущие края (износ/абразия) |

### Ограничения
- Ориентирована на амальгаму (extension for prevention) — устарела для адгезивной стоматологии
- Не учитывает активность кариеса — комбинировать с ICDAS/CAST
- Class VI не всегда выделяется

### Источник
Black GV. A Work on Operative Dentistry. 1908.`,
};
export default runner;

// @ts-nocheck
/** Runner: aap-efp — AAP/EFP 2017/2018 periodontitis classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США/ЕС (AAP/EFP 2017 World Workshop · J Periodontol/J Clin Periodontol 2018)',
  reference: 'Tonetti MS, Greenwell H, Kornman KS. Staging and grading of periodontitis: framework and proposal. J Periodontol. 2018;89(Suppl 1):S159-S172.',
  inputs: [
    { id: 'stage', label: 'Stage (по тяжести/сложности)', type: 'select', options: [
      { value: 'I', label: 'Stage I — начальный (CAL 1-2 мм)' },
      { value: 'II', label: 'Stage II — умеренный (CAL 3-4 мм)' },
      { value: 'III', label: 'Stage III — тяжёлый (CAL ≥5 мм, потеря зуба ≤4)' },
      { value: 'IV', label: 'Stage IV — распространённый (CAL ≥5 мм, потеря ≥5 зубов)' },
    ]},
    { id: 'grade', label: 'Grade (скорость прогрессии/факторы риска)', type: 'select', options: [
      { value: 'A', label: 'Grade A — медленная (без потери за 5 лет)' },
      { value: 'B', label: 'Grade B — умеренная (<2 мм / 5 лет)' },
      { value: 'C', label: 'Grade C — быстрая (≥2 мм / 5 лет; курение ≥10/д; DM HbA1c ≥7%)' },
    ]},
    { id: 'extent', label: 'Распространённость', type: 'select', options: [
      { value: 'loc', label: 'Локализованный (<30% зубов)' },
      { value: 'gen', label: 'Генерализованный (≥30%)' },
      { value: 'mi', label: 'Molar-incisor pattern' },
    ]},
  ],
  presets: [
    { label: 'Stage II Grade B локализ.', values: { stage: 'II', grade: 'B', extent: 'loc' } },
    { label: 'Stage III Grade C генерал.', values: { stage: 'III', grade: 'C', extent: 'gen' } },
    { label: 'Stage IV Grade C molar-incisor', values: { stage: 'IV', grade: 'C', extent: 'mi' } },
  ],
  compute: (v) => {
    const s = String(v.stage || 'II');
    const g = String(v.grade || 'B');
    const ext = String(v.extent || 'gen');
    const extLabel = ext === 'loc' ? 'Localized' : ext === 'mi' ? 'Molar-incisor' : 'Generalized';
    const colors: Record<string,string> = { I:'#84CC16', II:'#F59E0B', III:'#EF4444', IV:'#B91C1C' };
    const severity = { I:'начальный', II:'умеренный', III:'тяжёлый', IV:'распространённый/тяжёлый' }[s];
    const rate = { A:'медленная', B:'умеренная', C:'быстрая' }[g];
    return {
      value: `${s}${g}`,
      unit: 'AAP/EFP',
      color: colors[s],
      interpretation: `Periodontitis Stage ${s}, Grade ${g}, ${extLabel}`,
      details: `**Диагноз:** Periodontitis Stage **${s}** (${severity}), Grade **${g}** (${rate} прогрессия), **${extLabel}**\n\n**Stage** оценивает тяжесть + сложность (CAL, потеря зубов, глубина кармана, furcation, mobility).\n**Grade** — скорость прогрессии + модифицирующие факторы (курение, СД).\n**Extent** — локализованный (<30%), генерализованный (≥30%), molar-incisor.`,
      actions: [
        'Stage I-II: нехирургическая терапия (scaling/root planing), гигиена, мотивация',
        'Stage III: SRP + хирургическая пародонтология (flap, GTR, bone graft)',
        'Stage IV: комплексное (хирургия + протезирование/имплантация + реабилитация)',
        'Grade C: более агрессивное SRP + AB (амокс+метро 500/400 3×/д 7 дней при необходимости)',
        'Контроль курения и СД (HbA1c <7%) — обязательно',
      ],
      caveats: [
        'Классификация 2017 заменила старую (chronic/aggressive periodontitis)',
        'Агрессивный пародонтит → Stage III/IV, Grade C (обычно molar-incisor)',
        'CAL (clinical attachment loss) — ключевой параметр стадирования',
        'Для postопределения эффекта терапии — BoP <10%, carman ≤4мм',
      ],
      related: [
        { id: 'cpi', title: 'CPI (WHO)' },
        { id: 'bop', title: 'Bleeding on Probing' },
        { id: 'gingival', title: 'Gingival Index' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**AAP/EFP 2017 World Workshop** classification — современная классификация пародонтита по **Stage** (тяжесть) + **Grade** (прогрессия) + **Extent** (распространённость). Заменила старую (chronic/aggressive).

### Stage (тяжесть)
| Stage | CAL (мм) | Потеря зубов (пародонт.) | Сложность |
|---|---|---|---|
| **I** | 1-2 | 0 | Макс глубина кармана ≤4мм, гориз. потеря |
| **II** | 3-4 | 0 | До 5мм карманы, гориз. потеря |
| **III** | ≥5 | ≤4 | Верт. потеря, furcation II/III, дефект CAL ≥5 |
| **IV** | ≥5 | ≥5 | + mobility ≥2, bite collapse, <20 зубов |

### Grade (скорость)
| Grade | Прогрессия / факторы |
|---|---|
| **A** | Медленная (нет CAL-потери 5 лет) |
| **B** | Умеренная (<2мм/5л) |
| **C** | Быстрая (≥2мм/5л; курение ≥10/д; СД HbA1c≥7%) |

### Extent
- **Localized** <30% зубов, **Generalized** ≥30%, **Molar-incisor** pattern

### Источник
J Periodontol 2018;89(S1) — весь выпуск посвящён классификации.`,
};
export default runner;

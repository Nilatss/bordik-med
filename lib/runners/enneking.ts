// @ts-nocheck
/** Runner: enneking */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'grade',
      label: 'Grade опухоли (G)',
      type: 'select',
      options: [
        { value: 'G1', label: 'G1 — низкая степень злокачественности' },
        { value: 'G2', label: 'G2 — высокая степень злокачественности' },
      ],
    },
    {
      id: 'compartment',
      label: 'Анатомический компартмент (T)',
      type: 'select',
      options: [
        { value: 'T1', label: 'T1 — внутри анатомического компартмента' },
        { value: 'T2', label: 'T2 — за пределами компартмента / экстракомпартментная' },
      ],
    },
    {
      id: 'mets',
      label: 'M1 — регионарные или отдалённые метастазы',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const g = String(v.grade);
    const t = String(v.compartment);
    const m = v.mets === true || v.mets === 'true';

    let stage = '';
    let stageNum = 0;
    let color = '';
    let details = '';
    let survival = '';

    if (m) {
      stage = 'III';
      stageNum = 3;
      color = '#991B1B';
      details = 'Наличие метастазов — любой grade и любой компартмент.';
      survival = '5-летняя выживаемость < 25%';
    } else if (g === 'G1') {
      if (t === 'T1') {
        stage = 'IA';
        stageNum = 1;
        color = '#22C55E';
        details = 'Низкозлокачественная (G1), интракомпартментная (T1).';
        survival = '5-летняя выживаемость > 90%';
      } else {
        stage = 'IB';
        stageNum = 1.5;
        color = '#84CC16';
        details = 'Низкозлокачественная (G1), экстракомпартментная (T2).';
        survival = '5-летняя выживаемость 80-90%';
      }
    } else {
      if (t === 'T1') {
        stage = 'IIA';
        stageNum = 2;
        color = '#F59E0B';
        details = 'Высокозлокачественная (G2), интракомпартментная (T1).';
        survival = '5-летняя выживаемость 60-75%';
      } else {
        stage = 'IIB';
        stageNum = 2.5;
        color = '#EF4444';
        details = 'Высокозлокачественная (G2), экстракомпартментная (T2).';
        survival = '5-летняя выживаемость 40-60%';
      }
    }

    return {
      value: `Stage ${stage}`,
      interpretation: `Enneking stage ${stage}`,
      color,
      details: `${details} ${survival}.`,
      actions: [
        'МРТ всей кости с контрастом — оценка мягкотканного компонента',
        'КТ ОГК — исключение лёгочных метастазов (наиболее частая локализация)',
        'Сцинтиграфия костей / ПЭТ-КТ',
        'Биопсия в специализированном центре (риск загрязнения тракта!)',
        'Мультидисциплинарный консилиум (ортопед-онколог, химиотерапевт, радиолог)',
        'Для high-grade sarcoma: неоадъювантная ХТ (остеосаркома, саркома Юинга) → резекция → адъювантная ХТ',
      ],
      caveats: [
        'Enneking/MSTS — классическая система для костных и мягкотканных сарком',
        'Альтернатива: AJCC TNM для сарком (8-е изд.) — учитывает глубину и размер',
        'Обычно используется вместе с гистологическим типом (остеосаркома, хондросаркома, Юинг, MFH/UPS)',
        'Биопсия должна выполняться командой, которая будет делать резекцию — неправильный тракт компрометирует органосохранную операцию',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'I (low)', color: '#22C55E' },
          { min: 2, max: 3, label: 'II (high)', color: '#EF4444' },
          { min: 3, max: 4, label: 'III (mets)', color: '#991B1B' },
        ],
        current: stageNum,
        unit: 'stage',
      },
      related: [
        { id: 'tnm', title: 'TNM' },
        { id: 'ecog-kps', title: 'ECOG / KPS' },
        { id: 'recist', title: 'RECIST 1.1' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Enneking WF, Spanier SS, Goodman MA. A system for the surgical staging of musculoskeletal sarcoma. Clin Orthop Relat Res 1980;153:106-120.',
  countries: 'Международный (MSTS / Enneking)',
  presets: [
    { label: 'IA: G1 T1 M0', values: { grade: 'G1', compartment: 'T1', mets: false } },
    { label: 'IIB: G2 T2 M0', values: { grade: 'G2', compartment: 'T2', mets: false } },
    { label: 'III: любая + M1', values: { grade: 'G2', compartment: 'T2', mets: true } },
  ],
  info: `### Для чего используется
**Enneking / MSTS-стадирование (1980)** — хирургическая система стадирования **костных и мягкотканных сарком** опорно-двигательного аппарата. Основана на трёх параметрах: grade (G), compartment (T), metastasis (M).

### Параметры
| Буква | Значение |
|---|---|
| **G1** | Low-grade (низкая злокачественность) |
| **G2** | High-grade (высокая злокачественность) |
| **T1** | Intracompartmental — внутри одного анатомического компартмента |
| **T2** | Extracompartmental — вышла за пределы компартмента |
| **M0** | Нет регионарных или отдалённых метастазов |
| **M1** | Есть метастазы (любые) |

### Стадии
| Стадия | G | T | M | 5-летняя выживаемость |
|---|---|---|---|---|
| **IA** | G1 | T1 | M0 | > 90% |
| **IB** | G1 | T2 | M0 | 80-90% |
| **IIA** | G2 | T1 | M0 | 60-75% |
| **IIB** | G2 | T2 | M0 | 40-60% |
| **III** | любой | любой | M1 | < 25% |

### Хирургические границы (Enneking)
| Тип резекции | Описание |
|---|---|
| **Intralesional** | Через опухоль (обычно неадекватно) |
| **Marginal** | По реактивной зоне (часто остаётся опухоль) |
| **Wide** | В пределах здоровых тканей, но внутри компартмента |
| **Radical** | Удаление всего компартмента (ампутация / дезартикуляция) |

### Отличия от AJCC TNM для сарком
- Enneking — хирургически ориентированная, проще
- AJCC учитывает размер (≤ 5, 5-10, 10-15, > 15 см) и глубину (поверхностная/глубокая)
- Для современной клинической практики часто используется AJCC 8th edition

### Типы сарком
| Тип | Особенность |
|---|---|
| **Остеосаркома** | Подростки, метафизы длинных костей; неоадъювантная ХТ |
| **Саркома Юинга** | Дети/подростки, диафизы; ХТ + ЛТ + хирургия |
| **Хондросаркома** | Взрослые, таз / проксимальный бедро; ХТ малоэффективна |
| **UPS / MFH** | Взрослые, мягкие ткани; широкая резекция + ЛТ |
| **GIST** | ЖКТ; иматиниб по c-KIT/PDGFRA |

### Ограничения
- Разработана до эры молекулярной диагностики
- Не включает размер опухоли напрямую
- Для мягкотканных сарком чаще используется AJCC / French FNCLCC grading

### Источник
Enneking WF, Spanier SS, Goodman MA. **A system for the surgical staging of musculoskeletal sarcoma.** *Clin Orthop* 1980;153:106-120.`,
};
export default runner;

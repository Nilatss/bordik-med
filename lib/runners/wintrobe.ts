// @ts-nocheck
/** Runner: wintrobe — Wintrobe indices (MCV, MCH, MCHC) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'hb',
hint: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л', label: 'Гемоглобин', type: 'number', unit: 'г/л', min: 30, max: 250, quickValues: [80, 120, 140, 170] },
    { id: 'hct',
hint: 'Гематокрит. Норма: М 40-50%, Ж 36-46%', label: 'Гематокрит', type: 'number', unit: '%', min: 10, max: 70, step: 0.1, quickValues: [25, 36, 42, 50] },
    { id: 'rbc', label: 'Эритроциты', type: 'number', unit: '×10¹²/л', min: 1, max: 8, step: 0.01, quickValues: [3.5, 4.2, 4.8, 5.5] },
  ],
  compute: (v) => {
    const hb = Number(v.hb) || 0;        // g/L
    const hct = Number(v.hct) || 0;      // %
    const rbc = Number(v.rbc) || 0.01;   // 10^12/L

    const mcv = (hct / rbc) * 10;                  // fL
    const mch = hb / rbc;                          // pg
    const mchc = (hb / hct) * 10;                  // g/L (как *10 от g/dL)

    let anemiaType = 'Нормоцитарная';
    let color = '#22C55E';
    if (mcv < 80) { anemiaType = 'Микроцитарная'; color = '#F59E0B'; }
    else if (mcv > 100) { anemiaType = 'Макроцитарная'; color = '#F59E0B'; }

    const anemic = hb < 120;
    if (!anemic) { anemiaType = `Без анемии (${anemiaType.toLowerCase()} эритроциты)`; }

    let hypoHyper = 'нормохромные';
    if (mchc < 320) hypoHyper = 'гипохромные';
    else if (mchc > 360) hypoHyper = 'гиперхромные';

    return {
      value: `MCV ${mcv.toFixed(1)}`,
      unit: `MCH ${mch.toFixed(1)} · MCHC ${mchc.toFixed(0)}`,
      interpretation: `${anemiaType}, ${hypoHyper}`,
      color,
      details: `Индексы Винтроба:
- MCV = HCT/RBC × 10 = ${mcv.toFixed(1)} fL (норма 80–100)
- MCH = Hb/RBC = ${mch.toFixed(1)} pg (норма 27–33)
- MCHC = Hb/HCT × 10 = ${mchc.toFixed(0)} г/л (норма 320–360)`,
      actions: [
        mcv < 80 && anemic ? 'Микроцитарная: ферритин, железо, ОЖСС; исключить ЖДА, талассемию, сидеробластную' : null,
        mcv > 100 && anemic ? 'Макроцитарная: B12, фолат, ТТГ, ретикулоциты; исключить MDS, алкоголь' : null,
        mcv >= 80 && mcv <= 100 && anemic ? 'Нормоцитарная: ретикулоциты, креатинин, СРБ; исключить анемию хр. заболеваний, гемолиз, ОПЖ' : null,
        mchc > 360 ? 'Гиперхромия: наследственный сфероцитоз, аутоиммунная гемолитическая, криоагглютинины' : null,
        mchc < 320 ? 'Гипохромия: ЖДА, талассемия, сидеробластная' : null,
      ].filter(Boolean),
      caveats: [
        'Гиперхромия (MCHC > 360) физиологически не встречается; проверить на преаналитику (холодовые агглютинины, гемолиз, липемия)',
        'При сильной анизоцитозе (высокий RDW) средний MCV может вводить в заблуждение — смотреть гистограмму',
        'В смешанной анемии (ЖДА + В12-дефицит) MCV может быть нормальным, но RDW резко повышен',
        'Автоанализаторы дают RBC с погрешностью ±1–2 % — влияет на расчётные индексы',
      ],
      relatedCourses: [
        { id: '303.1', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'rpi', title: 'RPI ретик.' },
        { id: 'tibc', title: 'TIBC/железо' },
      ],
    };
  },
  reference: 'Wintrobe MM. Clinical Hematology 13th ed. CLSI H26-A2. Bain BJ. Blood Cells: Practical Guide 5th ed.',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { hb: 140, hct: 42, rbc: 4.7 } },
    { label: 'Микроцитарная ЖДА', values: { hb: 95, hct: 30, rbc: 4.5 } },
    { label: 'Макроцитарная B12', values: { hb: 90, hct: 28, rbc: 2.4 } },
  ],
  info: `### Для чего используется
**Индексы Винтроба** (MCV, MCH, MCHC) — первый шаг морфологической классификации анемий.

### Формулы
| Индекс | Формула | Норма |
|---|---|---|
| MCV | HCT (%) / RBC (10¹²/л) × 10 | 80–100 fL |
| MCH | Hb (г/л) / RBC (10¹²/л) | 27–33 pg |
| MCHC | Hb (г/л) / HCT (%) × 10 | 320–360 г/л |

### Классификация анемий по MCV
| MCV | Тип | Частые причины |
|---|---|---|
| < 80 | Микроцитарная | ЖДА, талассемия, сидеробластная, свинец |
| 80–100 | Нормоцитарная | Хр. заболеваний, гемолиз, ОПЖ, острая кровопотеря, апластическая |
| > 100 | Макроцитарная | B12/фолат-дефицит, MDS, алкоголь, гипотиреоз, ретикулоцитоз |

### Классификация по MCHC
| MCHC | Тип |
|---|---|
| < 320 | Гипохромная (ЖДА, талассемия) |
| 320–360 | Нормохромная |
| > 360 | «Гиперхромия» — физиологически нереальна; сфероцитоз, холод. агглютинины, артефакт |

### Алгоритм (упрощённый)
1. **Hb** — есть ли анемия? (Ж < 120, М < 130)
2. **MCV** — микро / нормо / макро
3. **Ретикулоциты/RPI** — гипо- или гиперпролиферативная
4. Микроцитарная → ферритин + СЖ + ОЖСС
5. Нормоцитарная → креатинин, СРБ, ретикулоциты, Coombs
6. Макроцитарная → B12, фолат, ТТГ

### RDW как дополнение
- RDW > 15 % + MCV < 80 → скорее ЖДА
- RDW нормальный + MCV < 80 → скорее талассемия
- RDW высокий + MCV высокий → смешанный дефицит или MDS

### Ограничения
- Холодовые агглютинины повышают MCV и MCHC (артефакт)
- Гипергликемия > 30 ммоль/л → осмотический отёк эритроцитов, ↑MCV
- Ранний ретикулоцитоз (гемолиз) → ↑MCV (ретикулоциты больше зрелых)`,
};

export default runner;

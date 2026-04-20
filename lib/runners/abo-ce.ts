// @ts-nocheck
/** Runner: abo-ce — ABO Cast-Radiograph Evaluation (CR-Eval) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (American Board of Orthodontics) · Am J Orthod Dentofacial Orthop',
  reference: 'Casko JS, Vaden JL, et al. Objective grading system for dental casts and panoramic radiographs. American Board of Orthodontics. Am J Orthod Dentofacial Orthop. 1998;114(5):589-99.',
  inputs: [
    { id: 'alignment', label: '1. Alignment (выравнивание)', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'marginal', label: '2. Marginal ridges (краевые гребни)', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'buccolingual', label: '3. Buccolingual inclination (щёчно-язык. наклон)', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'overjet', label: '4. Overjet', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'occlusal', label: '5. Occlusal contacts', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'occlRel', label: '6. Occlusal relationships', type: 'number', min: 0, max: 30, step: 1 },
    { id: 'interproximal', label: '7. Interproximal + root angulation (panoramic)', type: 'number', min: 0, max: 30, step: 1 },
  ],
  presets: [
    { label: 'Отличный (<20, Board pass)', values: { alignment: 2, marginal: 3, buccolingual: 2, overjet: 3, occlusal: 2, occlRel: 3, interproximal: 3 } },
    { label: 'Пограничный (≈30)', values: { alignment: 5, marginal: 5, buccolingual: 4, overjet: 4, occlusal: 4, occlRel: 4, interproximal: 4 } },
    { label: 'Неудача (>30)', values: { alignment: 8, marginal: 7, buccolingual: 6, overjet: 6, occlusal: 5, occlRel: 5, interproximal: 5 } },
  ],
  compute: (v) => {
    const a = Number(v.alignment || 0);
    const m = Number(v.marginal || 0);
    const b = Number(v.buccolingual || 0);
    const oj = Number(v.overjet || 0);
    const oc = Number(v.occlusal || 0);
    const rel = Number(v.occlRel || 0);
    const ip = Number(v.interproximal || 0);
    const total = a + m + b + oj + oc + rel + ip;
    let label = 'Отлично (Board pass)', color = '#22C55E';
    if (total > 30) { label = 'Не соответствует ABO (fail)'; color = '#B91C1C'; }
    else if (total >= 20) { label = 'Пограничный'; color = '#F59E0B'; }
    return {
      value: total,
      unit: 'баллов',
      color,
      interpretation: `ABO CR-Eval ${total} — ${label}`,
      details: `**ABO Cast-Radiograph Evaluation:**\n1. Alignment: ${a}\n2. Marginal ridges: ${m}\n3. Buccolingual: ${b}\n4. Overjet: ${oj}\n5. Occlusal contacts: ${oc}\n6. Occlusal relationships: ${rel}\n7. Interproximal (panoramic): ${ip}\n\n**Итого:** ${total} штрафных баллов\n**Порог Board:** ≤20 отлично, 21-30 пограничный, >30 неудача (не проходит сертификацию ABO)`,
      actions: [
        'ABO CR-Eval — применяется на post-treatment моделях и панорамном снимке',
        'Для сертификации ABO требуется 6 законченных случаев ≤30 баллов',
        'Наибольший вес обычно дают alignment, marginal ridges, occlusal contacts',
      ],
      caveats: [
        'CR-Eval не оценивает эстетику лица — дополнять ABO DI (Discrepancy Index) на preTx',
        'Требует калиброванного ABO-measuring gauge',
        'Panoramic часть (root angulation) требует не старше 3 мес post-Tx',
        'Не заменяет цефалометрический анализ',
      ],
      scale: {
        segments: [
          { min: 0, max: 20, label: '≤20 Отлично', color: '#22C55E' },
          { min: 20, max: 30, label: '21-30 Погран', color: '#F59E0B' },
          { min: 30, max: 210, label: '>30 Не пройд', color: '#B91C1C' },
        ],
        value: total,
      },
      related: [
        { id: 'angle', title: "Angle's class" },
        { id: 'anb', title: 'ANB angle' },
        { id: 'bolton', title: 'Bolton analysis' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**ABO CR-Eval** (Cast-Radiograph Evaluation) — объективная система оценки результата ортодонтического лечения American Board of Orthodontics (1998). Используется для сертификационных кейсов ABO.

### 7 категорий оценки
1. **Alignment** — выравнивание зубов
2. **Marginal ridges** — краевые гребни
3. **Buccolingual inclination** — щёчно-язычный наклон
4. **Overjet**
5. **Occlusal contacts**
6. **Occlusal relationships**
7. **Interproximal + root angulation** (по panoramic X-ray)

Каждая оценивается по специальному gauge, сумма = общий штраф.

### Интерпретация
| Баллы | Оценка |
|---|---|
| ≤20 | Отлично (easily passes ABO) |
| 21-30 | Пограничный |
| >30 | Не проходит ABO |

### Дополняющие инструменты
- **ABO DI** (Discrepancy Index) — сложность до лечения
- **PAR** (Peer Assessment Rating) — альтернативный европейский

### Источник
Casko JS, Vaden JL et al. Am J Orthod Dentofacial Orthop 1998;114(5):589-99.`,
};
export default runner;

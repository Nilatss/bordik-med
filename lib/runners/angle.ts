// @ts-nocheck
/** Runner: angle — Angle's malocclusion classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Edward Angle, 1899)',
  reference: 'Angle EH. Classification of malocclusion. Dent Cosmos. 1899;41:248-64, 350-57.',
  inputs: [
    { id: 'molar', label: 'Соотношение 1-го моляра', type: 'select', options: [
      { value: 'I', label: 'Class I — mesiobuccal cusp в межбугр. ниж. 1-го моляра' },
      { value: 'II', label: 'Class II — mesiobuccal cusp МЕЗИАЛЬНЕЕ (дистоокклюзия)' },
      { value: 'III', label: 'Class III — mesiobuccal cusp ДИСТАЛЬНЕЕ (мезиоокклюзия)' },
    ]},
    { id: 'div', label: 'Division (только для Class II)', type: 'select', options: [
      { value: 'none', label: '— (не применимо)' },
      { value: '1', label: 'Division 1 — протрузия верхних резцов, overjet ≥ 4 мм' },
      { value: '2', label: 'Division 2 — ретрузия центральных верх. резцов, deep bite' },
    ]},
    { id: 'overjet', label: 'Overjet (мм, сагитт. перекрытие)', type: 'number', min: -10, max: 20, step: 0.5 },
    { id: 'overbite', label: 'Overbite (мм, вертик. перекрытие)', type: 'number', min: -10, max: 15, step: 0.5 },
  ],
  presets: [
    { label: 'Class I нормальный (OJ 2, OB 2)', values: { molar: 'I', div: 'none', overjet: 2, overbite: 2 } },
    { label: 'Class II div 1 (OJ 8)', values: { molar: 'II', div: '1', overjet: 8, overbite: 4 } },
    { label: 'Class III (OJ -2)', values: { molar: 'III', div: 'none', overjet: -2, overbite: 0 } },
  ],
  compute: (v) => {
    const m = String(v.molar || 'I');
    const d = String(v.div || 'none');
    const oj = Number(v.overjet || 0);
    const ob = Number(v.overbite || 0);
    const colors: Record<string,string> = { I:'#22C55E', II:'#F59E0B', III:'#EF4444' };
    const baseLabel = m === 'I' ? 'Нейтроокклюзия' : m === 'II' ? 'Дистоокклюзия' : 'Мезиоокклюзия';
    let full = `Class ${m}`;
    if (m === 'II' && d !== 'none') full += ` div ${d}`;
    const ojNote = oj < 0 ? 'обратный резцовый перекрытие (crossbite)' : oj > 4 ? 'увеличенный overjet' : 'в норме (2-4 мм)';
    const obNote = ob < 0 ? 'открытый прикус (open bite)' : ob > 4 ? 'глубокий прикус (deep bite)' : 'в норме (1-3 мм)';
    return {
      value: full,
      unit: 'Angle',
      color: colors[m],
      interpretation: `${full} — ${baseLabel}`,
      details: `**Класс Angle:** ${full}\n**Соотношение моляров:** ${baseLabel}\n**Overjet:** ${oj} мм (${ojNote})\n**Overbite:** ${ob} мм (${obNote})\n\n- **Class I** — mesiobuccal cusp верхнего 1-го моляра попадает в buccal groove нижнего (нейтральное соотношение, но могут быть аномалии положения зубов)\n- **Class II** — mesiobuccal cusp мезиальнее buccal groove (нижняя челюсть ретружирована)\n  - Div 1 — протрузия верх. резцов\n  - Div 2 — ретрузия центральных, норма/ретрузия латеральных\n- **Class III** — mesiobuccal cusp дистальнее (нижняя челюсть выступает)`,
      actions: [
        'Class I с crowding: ортодонт. выравнивание (брекеты / элайнеры)',
        'Class II div 1: Twin-block, Herbst, extraction-nonextraction, surgery (тяжёлый)',
        'Class II div 2: intrusion центр. резцов, опен bite-lift',
        'Class III: reverse headgear (ребёнок), ортогнат. хирургия (взрослые)',
        'Дополнить цефалометрией (ANB, SNA, SNB)',
      ],
      caveats: [
        'Angle оценивает только сагиттальное соотношение моляров — не всю окклюзию',
        'Не учитывает асимметрию, трансверзальную плоскость',
        'Кодируется в ICD-10 K07.2 (аномалии прикуса)',
        'Дополнять Ackerman-Proffit классификацией (3D)',
      ],
      related: [
        { id: 'anb', title: 'ANB angle' },
        { id: 'bolton', title: 'Bolton analysis' },
        { id: 'abo-ce', title: 'ABO complexity' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Классификация Angle** (1899) — базовая классификация аномалий прикуса по сагиттальному соотношению первых моляров.

### Классы
| Класс | Соотношение 1-го моляра | Название |
|---|---|---|
| **I** | MB cusp верх. 1М в buccal groove ниж. 1М | Нейтроокклюзия |
| **II** | MB cusp верх. 1М мезиальнее groove | Дистоокклюзия |
| **III** | MB cusp верх. 1М дистальнее groove | Мезиоокклюзия |

### Class II divisions
- **Div 1** — протрузия верхних резцов, overjet ≥4мм
- **Div 2** — ретрузия центральных верхних резцов, deep bite

### Нормы
- Overjet: 2-4 мм (сагитт. перекрытие)
- Overbite: 1-3 мм (1/3 высоты коронки)
- Open bite: OB<0; Deep bite: OB>4
- Crossbite: OJ<0 (обратное перекрытие)

### Источник
Angle EH. Dent Cosmos 1899;41:248.`,
};
export default runner;

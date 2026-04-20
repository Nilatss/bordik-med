// @ts-nocheck
/** Runner: anb — ANB cephalometric angle (Steiner) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Steiner CC, Am J Orthod, 1953)',
  reference: 'Steiner CC. Cephalometrics for you and me. Am J Orthod. 1953;39(10):729-55. Riedel RA. Angle Orthod 1952;22:142.',
  inputs: [
    { id: 'sna', label: 'SNA (°)', type: 'number', min: 60, max: 100, step: 0.5 },
    { id: 'snb', label: 'SNB (°)', type: 'number', min: 60, max: 100, step: 0.5 },
  ],
  presets: [
    { label: 'Class I (SNA 82, SNB 80)', values: { sna: 82, snb: 80 } },
    { label: 'Class II (ANB 6)', values: { sna: 84, snb: 78 } },
    { label: 'Class III (ANB -2)', values: { sna: 80, snb: 82 } },
  ],
  compute: (v) => {
    const sna = Number(v.sna || 82);
    const snb = Number(v.snb || 80);
    const anb = Math.round((sna - snb) * 10) / 10;
    let label = 'Скелетный Class I', color = '#22C55E';
    if (anb > 4) { label = 'Скелетный Class II (ретрогнатия нижней / прогнатия верхней)'; color = '#F59E0B'; }
    else if (anb < 0) { label = 'Скелетный Class III (прогнатия нижней / ретрогнатия верхней)'; color = '#EF4444'; }
    else if (anb < 2) { label = 'Тенденция к Class III'; color = '#84CC16'; }
    const snaNote = sna > 84 ? 'прогнатия верх. челюсти' : sna < 80 ? 'ретрогнатия верх.' : 'норма верх. (82±2°)';
    const snbNote = snb > 82 ? 'прогнатия нижн. челюсти' : snb < 78 ? 'ретрогнатия нижн.' : 'норма нижн. (80±2°)';
    return {
      value: anb.toFixed(1),
      unit: '°',
      color,
      interpretation: `ANB ${anb.toFixed(1)}° — ${label}`,
      details: `**SNA** = ${sna}° (${snaNote})\n**SNB** = ${snb}° (${snbNote})\n**ANB** = SNA − SNB = **${anb.toFixed(1)}°**\n\n**Норма ANB:** 2° ± 2° (0-4°)\n**Интерпретация:**\n- 0-4°: Class I\n- >4°: Class II (скелетный)\n- <0°: Class III (скелетный)\n\n**Метод Steiner (1953)** — SNA, SNB, ANB + Y-axis, occlusal plane, incisor angulation. Риф. точка N-S (передняя основа черепа).`,
      actions: [
        'ANB 0-4° и хороший мол. класс: ортодонт. alignment (брекеты, aligners)',
        'ANB >7° ребёнок: Twin-block / Herbst для стимуляции роста нижней',
        'ANB >7° взрослый: LeFort I impaction/setback, BSSO advancement',
        'ANB <0° ребёнок: reverse headgear (facemask) до 10 лет',
        'ANB <0° взрослый: ортогнат. хирургия (mandibular setback + Le Fort I advance)',
      ],
      caveats: [
        'ANB зависит от положения нас. точки N — ротация SN-плоскости искажает',
        'Wits appraisal (Jacobson) — альтернатива при нестандартной SN',
        'ANB не заменяет анализ мягких тканей (Ricketts, Arnett)',
        'У детей ANB выше (3-5°) — учитывать рост',
      ],
      scale: {
        segments: [
          { min: -5, max: 0, label: 'Class III', color: '#EF4444' },
          { min: 0, max: 4, label: 'Class I', color: '#22C55E' },
          { min: 4, max: 12, label: 'Class II', color: '#F59E0B' },
        ],
        value: anb,
      },
      related: [
        { id: 'angle', title: 'Angle class' },
        { id: 'abo-ce', title: 'ABO CR-Eval' },
        { id: 'bolton', title: 'Bolton analysis' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**ANB angle** — основной цефалометрический параметр скелетного класса по Steiner (1953).

### Точки
- **S** — Sella (центр турецкого седла)
- **N** — Nasion (передне-верхняя точка nasofrontal suture)
- **A** — субспиналная (глубочайшая точка контура верх. челюсти между ANS и prosthion)
- **B** — супраментальная (глубочайшая точка контура нижн. челюсти между infradentale и pogonion)

### Нормы
| Параметр | Норма |
|---|---|
| SNA | 82° ± 2° |
| SNB | 80° ± 2° |
| **ANB** | **2° ± 2°** |

### Интерпретация ANB
| ANB | Класс |
|---|---|
| 0-4° | Скелетный Class I |
| >4° | Скелетный Class II |
| <0° | Скелетный Class III |

### Ограничения
- Зависит от положения N → Wits appraisal как альтернатива
- У детей норма выше (3-5°)
- Дополнять анализом мягких тканей (Ricketts E-line, Arnett)

### Источник
Steiner CC. Am J Orthod 1953;39(10):729. Riedel RA. Angle Orthod 1952;22:142.`,
};
export default runner;

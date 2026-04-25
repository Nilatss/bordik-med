// @ts-nocheck
/** Runner: cri-vet */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'lidocaine', label: 'Лидокаин (только собаки)' },
        { value: 'ketamine',  label: 'Кетамин' },
        { value: 'fentanyl',  label: 'Фентанил' },
        { value: 'morphine',  label: 'Морфин' },
        { value: 'dexmed',    label: 'Дексмедетомидин' },
      ],
    },
    { id: 'weight',
hint: 'Вес в кг (без одежды)', label: 'Масса тела (кг)', type: 'number', min: 0.5, max: 80, step: 0.1, unit: 'кг' },
    { id: 'dose',   label: 'Доза (мкг/кг/мин)', type: 'number', min: 0.01, max: 100, step: 0.01, unit: 'мкг/кг/мин' },
    {
      id: 'conc',
      label: 'Концентрация в мешке (мг/мл)',
      type: 'number',
      min: 0.001,
      max: 100,
      step: 0.01,
      unit: 'мг/мл',
      hint: 'Лидокаин 2% = 20 мг/мл; Кетамин 50 = 50 мг/мл',
    },
  ],
  compute: (v) => {
    const drug = String(v.drug);
    const w = Number(v.weight) || 0;
    const d = Number(v.dose) || 0;
    const c = Number(v.conc) || 0;

    // мкг/кг/мин × кг × 60 мин / 1000 (в мг/ч) / (мг/мл) = мл/ч
    const mlPerHr = w > 0 && d > 0 && c > 0 ? (d * w * 60 / 1000) / c : 0;
    const mlR = +mlPerHr.toFixed(2);

    const safeRanges: Record<string, { min: number; max: number; note: string }> = {
      lidocaine: { min: 25, max: 75,  note: 'НЕ применять у кошек (токсичность)!' },
      ketamine:  { min: 2,  max: 20,  note: 'Анестетическая/анальгетическая доза' },
      fentanyl:  { min: 0.1, max: 0.7, note: 'Сильный опиоид — мониторинг дыхания' },
      morphine:  { min: 0.1, max: 0.5, note: 'Вазодилатация, возможная рвота при болюсе' },
      dexmed:    { min: 0.5, max: 3,   note: 'Кардиодепрессия — мониторинг АД/ЧСС' },
    };
    const r = safeRanges[drug] || { min: 0, max: 100, note: '' };

    let color = '#22C55E';
    let safety = 'Доза в безопасном диапазоне';
    if (d < r.min) { color = '#F59E0B'; safety = 'Доза ниже рекомендуемой'; }
    if (d > r.max) { color = '#EF4444'; safety = 'Доза выше рекомендуемой — проверьте!'; }

    return {
      value: `${mlR}`,
      unit: 'мл/ч',
      interpretation: `CRI ${mlR} мл/ч · ${safety}`,
      color,
      details: `Препарат: ${drug}\nМасса: ${w} кг\nДоза: ${d} мкг/кг/мин\nКонцентрация: ${c} мг/мл\n\nРасчёт:\n${d} × ${w} × 60 / 1000 / ${c} = ${mlR} мл/ч\n\nБезопасный диапазон: ${r.min}-${r.max} мкг/кг/мин\n${r.note}`,
      actions: [
        'Использовать инфузомат (шприцевый насос) — не капельницу',
        'Титровать по клиническому ответу (анальгезия, ЧСС, АД)',
        drug === 'lidocaine' ? '⚠ НЕ применять у кошек (токсичность, судороги)' : '',
        drug === 'fentanyl' ? 'Мониторинг дыхания + SpO₂; готовность налоксона' : '',
        drug === 'dexmed' ? 'Мониторинг АД — брадикардия типична, ожидаемая реакция' : '',
        'Мультимодально: часто MLK = Morphine + Lidocaine + Ketamine для собак',
      ].filter(Boolean),
      caveats: [
        'Формула мл/ч = (доза × масса × 60) / (1000 × концентрация)',
        'Точная доза зависит от показания (анальгезия vs анестезия)',
        'Кошки: НЕ лидокаин; морфин — осторожно (возбуждение)',
        'При долгом CRI (> 24 ч) — риск тахифилаксии, нужна ротация',
        'Совместимость: MLK совместим; дексмед отдельно',
      ],
      scale: {
        segments: [
          { min: 0, max: r.min, label: 'Низкая', color: '#F59E0B' },
          { min: r.min, max: r.max, label: 'Норма', color: '#22C55E' },
          { min: r.max, max: 200, label: 'Высокая', color: '#EF4444' },
        ],
        current: d,
        unit: 'мкг/кг/мин',
      },
      related: [
        { id: 'cmps-sf', title: 'CMPS-SF' },
        { id: 'colorado-pain', title: 'Colorado Pain' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Plumb\'s Veterinary Drug Handbook 10th ed. · BSAVA Manual of Canine and Feline Anaesthesia and Analgesia 3rd ed.',
  countries: 'Международный (ACVAA · BSAVA)',
  presets: [
    { label: 'Лидокаин 25 кг 50 мкг', values: { drug: 'lidocaine', weight: 25, dose: 50, conc: 20 } },
    { label: 'Кетамин 5 кг 10 мкг', values: { drug: 'ketamine', weight: 5, dose: 10, conc: 10 } },
    { label: 'Фентанил 30 кг 0,4 мкг', values: { drug: 'fentanyl', weight: 30, dose: 0.4, conc: 0.05 } },
  ],
  info: `### Для чего используется
**Constant Rate Infusion (CRI)** — непрерывная инфузия анальгетиков / анестетиков у собак и кошек. Обеспечивает стабильный уровень препарата без пиков.

### Формула расчёта
\`\`\`
мл/ч = (доза мкг/кг/мин × масса кг × 60) / (1000 × конц. мг/мл)
\`\`\`

### Безопасные диапазоны
| Препарат | Доза (мкг/кг/мин) | Примечание |
|---|---|---|
| Лидокаин | 25-75 | ТОЛЬКО СОБАКИ |
| Кетамин | 2-20 | Анальгезия / TIVA |
| Фентанил | 0,1-0,7 | Мониторинг дыхания |
| Морфин | 0,1-0,5 | Осторожно при болюсе |
| Дексмедетомидин | 0,5-3 | Брадикардия |

### Популярные протоколы
**MLK (собаки)**: Морфин 0,2 + Лидокаин 50 + Кетамин 10 мкг/кг/мин\nДля пост-оп анальгезии абдоминальной хирургии.

**FLK (кошки)**: Фентанил + Лидокаин (не рекомендуется) + Кетамин → **только FK** у кошек.

**Dexmed CRI**: 0,5-1 мкг/кг/ч (не мин!) для седации в ICU.

### Ограничения
- Требуется инфузомат
- Кошки — НЕ лидокаин (токсичность)
- Титровать по клинике, не по формуле

### Источник
Plumb's 10th ed · BSAVA Manual · Grimm Veterinary Anesthesia 5th ed.`,
};
export default runner;

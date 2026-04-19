// @ts-nocheck
/** Runner: nrp — AAP NRP 8th edition 2021 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Шаг NRP',
      type: 'select',
      options: [
        { value: 'initial', label: 'Initial steps (warm/dry/stimulate) — 30 с' },
        { value: 'ppv', label: 'PPV (при апноэ / ЧСС <100)' },
        { value: 'mrsopa', label: 'MR SOPA (если PPV неэффективна)' },
        { value: 'cc', label: 'Chest compressions (при ЧСС <60)' },
        { value: 'epi', label: 'Эпинефрин (при ЧСС <60 после CC)' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.step);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      initial: {
        title: 'Initial steps',
        c: '#22C55E',
        details: 'Первые 30 с жизни: тепло, проходимость дыхательных путей, просушивание, стимуляция. Оценка: дыхание и ЧСС.',
        actions: [
          'Тепло: radiant warmer 36.5–37.5 °C; у недоношенных <32 нед — полиэтиленовая плёнка + шапка',
          'Позиция "sniffing" (лёгкое разгибание шеи)',
          'Отсасывание рот → нос только при обструкции',
          'Просушить, стимулировать (растереть спину, подошвы)',
          'Оценить: дыхание, ЧСС, тонус',
        ],
      },
      ppv: {
        title: 'Positive Pressure Ventilation',
        c: '#F59E0B',
        details: 'Апноэ / gasping / ЧСС <100 после initial steps → PPV. FiO₂: 21% (термин ≥35 нед), 21–30% (преждевременные <35 нед). PIP 20–25, PEEP 5, частота 40–60/мин.',
        actions: [
          'Маска подходящего размера, герметичность',
          'FiO₂ 21% (≥35 нед), 21–30% (<35 нед), титровать по SpO₂ preductal',
          'PIP начальный 20–25 см H₂O (до 30–40 при необходимости)',
          'PEEP 5 см H₂O',
          'Частота 40–60 вдохов/мин',
          'Оценка: подъём грудной клетки, ЧСС через 15 с',
          'Pulse oximetry на правой руке (preductal)',
        ],
      },
      mrsopa: {
        title: 'MR SOPA (коррекция PPV)',
        c: '#EF4444',
        details: 'Если PPV неэффективна (нет подъёма грудной клетки, ЧСС не растёт) — алгоритм коррекции MR SOPA.',
        actions: [
          'M — Mask adjustment: переустановить маску, проверить герметичность',
          'R — Reposition head: нейтральная / sniffing позиция',
          'S — Suction: отсасывание рот, затем нос',
          'O — Open mouth: слегка открыть рот',
          'P — Pressure: увеличить PIP (30–40 см H₂O)',
          'A — Airway alternative: SGA (LMA) или интубация ETT',
        ],
      },
      cc: {
        title: 'Chest compressions',
        c: '#991B1B',
        details: 'ЧСС <60 после 30 с эффективной PPV (с видимым подъёмом грудной клетки, предпочтительно через ETT/LMA) → компрессии 3:1.',
        actions: [
          'Повысить FiO₂ до 100%',
          'Интубация (желательно) — свободные руки для CC',
          'Техника: 2 больших пальца, охват грудной клетки',
          'Глубина: 1/3 AP диаметра грудной клетки',
          'Соотношение 3:1 (3 компрессии : 1 вдох), 90 компрессий + 30 вдохов = 120 событий/мин',
          'Оценка ЧСС каждые 60 с (ЭКГ 3-lead предпочтительно)',
        ],
      },
      epi: {
        title: 'Epinephrine',
        c: '#7C2D12',
        details: 'ЧСС <60 после 60 с эффективных компрессий + PPV → эпинефрин IV/IO предпочтительно.',
        actions: [
          'IV/IO (пупочная вена катетер UVC): 0.01–0.03 мг/кг (0.1–0.3 мл/кг концентрации 1:10 000 = 0.1 мг/мл)',
          'ETT (если IV ещё нет): 0.05–0.1 мг/кг',
          'Промыть 0.5–1 мл физ. р-ром',
          'Повтор каждые 3–5 мин',
          'Volume expansion: физ. р-р 10 мл/кг при подозрении на гиповолемию',
          'Искать причины: PTX (игольная декомпрессия), тампонада, hypovolaemia',
        ],
      },
    };
    const r = map[s] || map.initial;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'NRP 8th ed 2021: при чистых околоплодных водах рутинное отсасывание НЕ показано',
        'Мекониальные воды: НЕ рутинная интубация/отсасывание (NRP 7th/8th), только при обструкции',
        'SpO₂ цели: 60% (1 мин) → 70% (3 мин) → 85% (5 мин) → 90% (10 мин)',
        '99% новорождённых стабилизируются только initial steps + PPV',
      ],
      related: [
        { id: 'hbb', title: 'Helping Babies Breathe' },
        { id: 'eceb', title: 'ECEB / ECSB' },
        { id: 'ilcor', title: 'ILCOR Neonatal Task Force' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'ballard', title: 'Ballard (срок гестации)' },
        { id: 'erc', title: 'ERC Neonatal' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Неонатология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Weiner GM (ed). Textbook of Neonatal Resuscitation. 8th ed. American Academy of Pediatrics / AHA, 2021. Aziz K et al. Part 5: Neonatal Resuscitation. 2020 AHA Guidelines. Circulation 2020;142(16_suppl_2):S524–S550.',
  countries: 'AAP (США), международно адаптируется',
  presets: [
    { label: 'Initial steps', values: { step: 'initial' } },
    { label: 'PPV', values: { step: 'ppv' } },
    { label: 'MR SOPA', values: { step: 'mrsopa' } },
    { label: 'Chest compressions', values: { step: 'cc' } },
    { label: 'Эпинефрин', values: { step: 'epi' } },
  ],
  info: `### Для чего используется
**NRP (Neonatal Resuscitation Program) 8th edition 2021** — AAP/AHA стандарт реанимации новорождённых в родзале. Основан на ILCOR Neonatal CoSTR.

### Ключевые изменения NRP 8th ed
- ЭКГ 3-lead — предпочтительно для оценки ЧСС
- Pulse oximetry preductal (правая рука)
- Мекониальные воды — НЕ рутинная интубация/отсасывание
- Отложенное пережатие пуповины ≥60 с (при стабильности)
- Symptom-driven approach к решениям

### SpO₂ preductal цели (AAP)
| Возраст | SpO₂ (%) |
|---|---|
| 1 мин | 60–65 |
| 2 мин | 65–70 |
| 3 мин | 70–75 |
| 4 мин | 75–80 |
| 5 мин | 80–85 |
| 10 мин | 85–95 |

### MR SOPA
- **M** Mask adjustment
- **R** Reposition head
- **S** Suction
- **O** Open mouth
- **P** Pressure (↑ PIP)
- **A** Airway alternative

### FiO₂ initial
- ≥35 нед: 21%
- <35 нед: 21–30%
- При CC: 100%

### Эпинефрин
- IV/IO: 0.01–0.03 мг/кг (1:10 000)
- ETT: 0.05–0.1 мг/кг
- Повтор каждые 3–5 мин

### Источники
Weiner GM (ed). *Textbook of NR*, 8th ed. AAP 2021.
Aziz K et al. 2020 AHA Guidelines, Part 5: Neonatal Resuscitation.
`,
};

export default runner;

// @ts-nocheck
/** Runner: cbpi */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'severity',     label: 'Тяжесть боли (сумма 4 пунктов, 0-40)',      type: 'number', min: 0, max: 40, step: 1, hint: 'Худшая + наименьшая + средняя + текущая' },
    { id: 'interference', label: 'Интерференция с активностью (0-60)',         type: 'number', min: 0, max: 60, step: 1, hint: 'Сумма 6 аспектов качества жизни' },
    { id: 'qol',          label: 'Общее качество жизни (0-4)',                  type: 'select',
      options: [
        { value: 0, label: '0 — Отличное' },
        { value: 1, label: '1 — Хорошее' },
        { value: 2, label: '2 — Удовлетворительное' },
        { value: 3, label: '3 — Плохое' },
        { value: 4, label: '4 — Очень плохое' },
      ],
    },
  ],
  compute: (v) => {
    const pSev = Number(v.severity) || 0;
    const pInt = Number(v.interference) || 0;
    const qol = Number(v.qol) || 0;

    const psScore = +(pSev / 4).toFixed(2);
    const piScore = +(pInt / 6).toFixed(2);

    let color = '#22C55E';
    let cat = 'Боль контролируется';
    if (psScore >= 2 || piScore >= 2) { color = '#F59E0B'; cat = 'Умеренная — требуется коррекция'; }
    if (psScore >= 4 || piScore >= 4) { color = '#EF4444'; cat = 'Значительная боль'; }
    if (psScore >= 7 || piScore >= 7) { color = '#991B1B'; cat = 'Сильная — немедленное вмешательство'; }

    return {
      value: `PS ${psScore} · PI ${piScore}`,
      unit: 'CBPI (0-10 ср.)',
      interpretation: `PS ${psScore} · PI ${piScore} · QoL ${qol} — ${cat}`,
      color,
      details: `CBPI (Canine Brief Pain Inventory, Purdue):\n- Pain Severity = ${pSev} / 40 → среднее ${psScore} / 10\n- Pain Interference = ${pInt} / 60 → среднее ${piScore} / 10\n- QoL = ${qol} / 4\n\nМинимальное клинически значимое изменение (MCID): ΔPS ≥ 1, ΔPI ≥ 2.`,
      actions: [
        psScore >= 2 ? 'НПВС (карпрофен 4 мг/кг/сут, мелоксикам 0,1 мг/кг/сут, деракоксиб)' : '',
        psScore >= 4 ? 'Мультимодально: НПВС + габапентин 10 мг/кг × 2-3 + амантадин 3-5 мг/кг/сут' : '',
        psScore >= 4 ? 'Бедалимабин / Либрела (анти-NGF МАТ) 1×/мес при ОА' : '',
        psScore >= 7 ? 'Трамадол противоречив; оп рассмотреть; физиотерапия, снижение веса' : '',
        'Повтор CBPI через 2-4 нед для оценки ответа (MCID PS ≥ 1)',
      ].filter(Boolean),
      caveats: [
        'CBPI заполняется владельцем — субъективная оценка',
        'Валидирован для хронической боли при остеоартрите и онкологии',
        'НЕ применять для острой (послеоперационной) боли — используйте CMPS-SF',
        'Только собаки; для кошек — FMPI (Feline Musculoskeletal Pain Index)',
        'MCID: PS ≥ 1, PI ≥ 2 — ниже не считается значимым улучшением',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Контроль', color: '#22C55E' },
          { min: 2, max: 4, label: 'Умеренная', color: '#F59E0B' },
          { min: 4, max: 7, label: 'Значительная', color: '#EF4444' },
          { min: 7, max: 11, label: 'Сильная', color: '#991B1B' },
        ],
        current: Math.max(psScore, piScore),
        unit: '0-10',
      },
      related: [
        { id: 'cmps-sf', title: 'CMPS-SF (Glasgow)' },
        { id: 'colorado-pain', title: 'Colorado Pain' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Brown DC, Boston RC, Coyne JC, Farrar JT. Development and psychometric testing of an instrument designed to measure chronic pain in dogs with osteoarthritis. Am J Vet Res 2007;68:631-7.',
  countries: 'США (Purdue University)',
  presets: [
    { label: 'Лёгкая ОА', values: { severity: 6, interference: 9, qol: 1 } },
    { label: 'Умеренная ОА', values: { severity: 14, interference: 21, qol: 2 } },
    { label: 'Тяжёлая онко', values: { severity: 28, interference: 42, qol: 3 } },
  ],
  info: `### Для чего используется
**Canine Brief Pain Inventory (CBPI)** — валидированный опросник для владельцев собак с хронической болью (чаще всего остеоартрит, онкология). Разработан в Purdue University на основе человеческого Brief Pain Inventory.

### Структура
1. **Pain Severity (PS)** — 4 пункта × 0-10 = **0-40**
   - Худшая боль за 7 дней
   - Наименьшая боль
   - Средняя боль
   - Боль прямо сейчас
2. **Pain Interference (PI)** — 6 пунктов × 0-10 = **0-60**
   - Общая активность, удовольствие от жизни
   - Способность вставать / ложиться / бегать / ходить
3. **Quality of Life** — 0-4 (5-точечная)

### Нормализация
- PS score = Σ / 4 (диапазон 0-10)
- PI score = Σ / 6 (диапазон 0-10)

### MCID (minimal clinically important difference)
| Параметр | MCID |
|---|---|
| ΔPS | ≥ 1,0 |
| ΔPI | ≥ 2,0 |

### Применение
- Исходная оценка хронической боли у собаки
- Оценка ответа на терапию (НПВС, Либрела, физиотерапия)
- Клинические исследования (FDA использует CBPI для регистрации препаратов ОА)

### Ограничения
- Только собаки; кошки — FMPI / Feline Grimace Scale
- Только хроническая боль (не послеоперационная)
- Заполняется владельцем — субъективно

### Источник
Brown et al. 2007, 2008 (валидация); Brown 2013 (Liberty Mutual MCID).`,
};
export default runner;

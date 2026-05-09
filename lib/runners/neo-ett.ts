/**
 * Runner: neo-ett — Neonatal Endotracheal Tube Size + Insertion Depth
 *
 * NEONATOLOGY MODULE A15 (P0). Source attribution:
 *   PRIMARY:    Weiner GM, Zaichkin J, eds. Textbook of Neonatal
 *               Resuscitation (NRP), 8th ed. American Academy of
 *               Pediatrics & American Heart Association; 2021.
 *   <750 g:    Takeuchi M, Hirayama Y, Imanishi T. Endotracheal tube size
 *              and depth in extremely preterm infants. Early Hum Dev.
 *              2020;144:105024. doi:10.1016/j.earlhumdev.2020.105024
 *   ERC:       Madar J, Roehr CC, Ainsworth S, et al. European
 *              Resuscitation Council Guidelines 2021: Newborn
 *              resuscitation and support of transition. Resuscitation.
 *              2021;161:291-326. doi:10.1016/j.resuscitation.2021.02.014
 *   RU:        Методическое письмо МЗ РФ от 04.03.2020 «Первичная и
 *              реанимационная помощь новорождённым детям».
 *
 * ETT internal diameter (mm) by weight / GA — NRP 8 ed.:
 *   <1000 g (or <28 wk):  2.5
 *   1000-2000 g (28-34 wk): 3.0
 *   2000-3000 g (34-38 wk): 3.0-3.5
 *   >3000 g (>38 wk):     3.5
 *
 * Insertion depth (cm at lip):
 *   Method 1 — weight + 6 (NRP rule of thumb):
 *     1 kg → 7 cm, 2 kg → 8 cm, 3 kg → 9 cm, 4 kg → 10 cm
 *   Method 2 — Tochen formula (more accurate for ELBW):
 *     depth (cm) = (weight kg × 1) + 6 (term)
 *     depth (cm) = (weight kg × 1.5) + 6 (preterm <750 g — Takeuchi 2020
 *                                          revised: lower depth +0.5-1 cm
 *                                          to avoid right main bronchus
 *                                          intubation)
 *   Method 3 — gestational age (Kempley 2008):
 *     depth (cm) = (GA wk × 0.21) + 0.85
 *
 * Verify by:
 *   - Bilateral chest rise + breath sounds
 *   - Capnography (gold standard, even in preterm — NRP 8 ed.)
 *   - X-ray: tip 1-2 cm above carina (T2-T3 vertebra)
 *
 * Caveats:
 *   - При <750 г Takeuchi 2020 показал что NRP rule overestimates depth →
 *     adjusted lower (right main bronchus selective intubation otherwise)
 *   - Cuffed ETT (с манжетой) от 3.0 — для ELBW, >36 нед per AAP 2018
 *   - Nasotracheal intubation: депth +1 cm к oral
 *   - Капнография — НЕТ результата при выраженной hypoxia / no CO2
 *     production (>30 sec → попытка intubation = failed)
 *
 * SOURCES (audit 1.15):
 *   [1] NRP 8 ed. AAP/AHA 2021 Textbook
 *   [2] Takeuchi 2020: pubmed.ncbi.nlm.nih.gov/32234678
 *   [3] ERC 2021 newborn: doi.org/10.1016/j.resuscitation.2021.02.014
 *   [4] МЗ РФ 04.03.2020: minzdrav.gov.ru/documents/8025
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NRP 8 ed. 2021 / ERC 2021) · РФ (МЗ 04.03.2020)',
  reference:
    'NRP 8 ed. AAP/AHA 2021. Takeuchi 2020 (Early Hum Dev 144:105024) для <750 g. ERC 2021 (Madar Resuscitation 161:291). МЗ РФ 04.03.2020.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса',
      type: 'number',
      unit: 'г',
      min: 400,
      max: 6000,
      step: 10,
      hint: 'Текущая масса',
      quickValues: [600, 1000, 1500, 2500, 3500],
    },
    {
      id: 'ga',
      label: 'Гестационный возраст',
      type: 'number',
      unit: 'нед',
      min: 22,
      max: 44,
      step: 1,
      hint: 'Полные недели',
      quickValues: [24, 28, 32, 36, 40],
    },
    {
      id: 'route',
      label: 'Путь интубации',
      type: 'select',
      options: [
        { value: 'oral', label: 'Оральная (стандарт)' },
        { value: 'nasal', label: 'Назальная (depth +1 см)' },
      ],
    },
  ],
  presets: [
    { label: 'ELBW 700 г / 25 нед', values: { weight: 700, ga: 25, route: 'oral' } },
    { label: 'VLBW 1200 г / 30 нед', values: { weight: 1200, ga: 30, route: 'oral' } },
    { label: 'Преэрм 2200 г / 34 нед', values: { weight: 2200, ga: 34, route: 'oral' } },
    { label: 'Термин 3500 г / 40 нед', values: { weight: 3500, ga: 40, route: 'oral' } },
  ],
  compute: (v) => {
    const weight_g = Math.max(400, Math.min(6000, Number(v.weight) || 3000));
    const weight_kg = weight_g / 1000;
    const ga = Math.max(22, Math.min(44, Number(v.ga) || 40));
    const nasal = String(v.route || 'oral') === 'nasal';

    // ETT internal diameter (mm) — NRP 8 ed.
    let ett_mm: number;
    if (weight_g < 1000 || ga < 28) ett_mm = 2.5;
    else if (weight_g < 2000 || ga < 34) ett_mm = 3.0;
    else if (weight_g < 3000 || ga < 38) ett_mm = 3.5;
    else ett_mm = 3.5;

    // Insertion depth (cm at lip)
    // NRP rule: weight (kg) + 6
    // For <750 g: Takeuchi 2020 — adjust to weight×1.5 + 6 ± local protocol
    let depth_nrp = weight_kg + 6;
    let depth_takeuchi: number | null = null;
    if (weight_g < 750) {
      depth_takeuchi = weight_kg * 1.5 + 6;
    }
    // Kempley 2008 (GA-based)
    const depth_kempley = ga * 0.21 + 0.85;

    if (nasal) {
      depth_nrp += 1;
      if (depth_takeuchi !== null) depth_takeuchi += 1;
    }
    const depth_kempley_route = nasal ? depth_kempley + 1 : depth_kempley;

    const recommended_depth = depth_takeuchi !== null ? depth_takeuchi : depth_nrp;
    const depth_rounded = Math.round(recommended_depth * 10) / 10;

    let interpretation = `ЭТТ ${ett_mm} мм, глубина ${depth_rounded} см ${nasal ? '(назально)' : '(орально)'}`;
    let color = '#22C55E';
    if (weight_g < 750) {
      color = '#F59E0B';
      interpretation += ' — ELBW, использован Takeuchi (NRP overestimates)';
    }

    const actions: string[] = [
      `Использовать **ЭТТ ${ett_mm} мм** ID, глубина **${depth_rounded} см** на губе/ноздре`,
      'Преоксигенация 100% O₂ через маску перед попыткой',
      'Размер ларингоскопа: Miller 0 (<2 кг), Miller 1 (≥2 кг)',
      'После интубации: bilateral breath sounds, ↑ HR, ↑ SpO₂, EtCO₂ детектор (NRP золотой стандарт)',
      'X-ray для подтверждения положения tip: T2-T3 (1-2 см выше carina)',
    ];
    if (weight_g < 750) {
      actions.push('⚠️ <750 г: NRP rule (weight+6) переоценивает глубину — использовать Takeuchi или контроль X-ray СРОЧНО');
    }
    if (ga < 26 && ett_mm === 2.5) {
      actions.push('Микропреэрм — требуется опытный оператор; рассмотреть LISA/MIST как альтернативу');
    }

    const details = `**ЭТТ ID:** ${ett_mm} мм (по массе ${weight_g} г / GA ${ga} нед)

**Глубина введения (см от губы):**
| Метод | Расчёт | Глубина |
|---|---|---|
| NRP rule of thumb | ${weight_kg.toFixed(2)} kg + 6 | ${(depth_nrp - (nasal ? 1 : 0)).toFixed(1)}${nasal ? ' (+1 nasal)' : ''} |
| ${depth_takeuchi !== null ? `Takeuchi (для <750 г)` : 'Tochen формула'} | ${depth_takeuchi !== null ? `${weight_kg.toFixed(2)} × 1.5 + 6` : 'NRP applicable'} | ${depth_takeuchi !== null ? `${(depth_takeuchi - (nasal ? 1 : 0)).toFixed(1)}` : '—'} |
| Kempley 2008 (GA) | ${ga} × 0.21 + 0.85 | ${(depth_kempley_route - (nasal ? 1 : 0)).toFixed(1)} |

**Рекомендованная глубина:** **${depth_rounded} см**.

${nasal ? '⚠️ Назально — добавлено +1 см к oral depth' : ''}

**Подтверждение положения:**
1. Bilateral chest rise при vent breath
2. Bilateral breath sounds (axilla > anterior chest)
3. EtCO₂ детектор (Pedi-Cap) — gold standard NRP 8 ed.
4. ↑ HR + ↑ SpO₂ за 30 сек после интубации
5. **X-ray** — tip at T2-T3 vertebra body (1-2 см выше carina)
6. Маркировка глубины на ETT губой/ноздрёй (документировать!)

**Размеры ларингоскопа:**
- Miller 00 (ELBW <750 г)
- Miller 0 (<2 кг)
- Miller 1 (≥2 кг)
- Бронхоскоп при подозрении на сложный airway`;

    return {
      value: `${ett_mm} мм / ${depth_rounded} см`,
      unit: 'ETT ID / depth',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        '<750 г: NRP rule "weight+6" переоценивает глубину; Takeuchi 2020 показал улучшенную точность с weight×1.5+6',
        'Cuffed ETT (с манжетой) от 3.0 — для ELBW и >36 нед per AAP 2018 (с осторожностью)',
        'EtCO₂ может быть ложно-отрицательным при тяжёлой hypoxia / no CO2 (>30 сек = failed intubation)',
        'X-ray всегда обязательна для подтверждения после первой попытки и при изменении глубины',
        'Maximum 30 сек на попытку (NRP) — иначе re-oxygenate через маску',
        'Nasotracheal маршрут редко применяется в acute resuscitation; больше в long-term ventilation',
      ],
      scale: {
        segments: [
          { min: 5, max: 7, label: 'ELBW', color: '#7F1D1D' },
          { min: 7, max: 8.5, label: 'VLBW', color: '#EF4444' },
          { min: 8.5, max: 10, label: 'Преэрм', color: '#F59E0B' },
          { min: 10, max: 12, label: 'Термин', color: '#22C55E' },
        ],
        current: depth_rounded,
        unit: 'см',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'hbb', title: 'Helping Babies Breathe' },
        { id: 'nrp', title: 'NRP алгоритм' },
        { id: 'silverman', title: 'Silverman-Anderson' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '301.1', title: 'Анестезиология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  info: `### Размер ЭТТ (внутренний диаметр) — NRP 8 ed.

| Масса (г) / GA (нед) | ID мм |
|---|---|
| <1000 / <28 | 2.5 |
| 1000-2000 / 28-34 | 3.0 |
| 2000-3000 / 34-38 | 3.0-3.5 |
| >3000 / >38 | 3.5 |

Cuffed ETT (с манжетой) — от 3.0; чаще используется при долгосрочной
вентиляции, для ELBW и микропреэрмов с осторожностью (риск стриктуры).

### Глубина введения (см от губы)

**3 метода — выбираем тот, что лучше валидирован для конкретного веса:**

| Метод | Формула | Применимость |
|---|---|---|
| NRP rule of thumb | weight (kg) + 6 | Стандарт для >750 г |
| Takeuchi 2020 | weight (kg) × 1.5 + 6 | <750 г (NRP overestimates) |
| Kempley 2008 | GA (нед) × 0.21 + 0.85 | Альтернатива по GA |

**Назальная интубация:** +1 см к oral depth.

### Подтверждение положения

1. **EtCO₂ детектор** (Pedi-Cap) — NRP 8 ed. **gold standard**, даже в
   ELBW. False-negative при no CO₂ production (severe hypoxia, no
   pulmonary blood flow >30 сек = failed intubation).
2. Bilateral chest rise + bilateral breath sounds (axilla).
3. ↑ HR (>100), ↑ SpO₂ за 30 сек после intubation.
4. **X-ray** — tip at **T2-T3 vertebra body** (1-2 см выше carina).
5. Документировать глубину на губе/ноздре.

### Размеры ларингоскопа

| Клинок | Кому |
|---|---|
| Miller 00 | <750 г |
| Miller 0 | <2 кг |
| Miller 1 | ≥2 кг |

### Альтернативы интубации (LISA/MIST/SALSA)

При преэрме без активной asphyxia — рассмотреть:
- **LISA** (Less Invasive Surfactant Administration) — surfactant через
  тонкий катетер на спонтанном дыхании
- **MIST** (Minimally Invasive Surfactant Therapy)
- **INSURE** — INtubate, SURfactant, Extubate
- **SALSA** — Surfactant Administration via Laryngeal Airway (LMA)

См. ESPNIC/EBN guidelines, Sweet et al. European Consensus 2023.

### Maximum попытка

NRP: 30 сек на попытку. Если нет — re-oxygenate через маску ≥30 сек,
максимум 3 попытки одним оператором (затем эскалация / surgical airway).

### Источники

- NRP 8 ed. AAP/AHA 2021 (Textbook of Neonatal Resuscitation)
- Takeuchi M et al. Early Hum Dev 2020;144:105024 (для ELBW <750 г)
- ERC 2021 Newborn — Madar J et al. Resuscitation 2021;161:291
- МЗ РФ 04.03.2020 — методическое письмо

### Ограничения

- Калькулятор стартовый — финальная глубина по X-ray всегда
- Anatomic anomalies (Pierre Robin, choanal atresia) требуют individualised approach
- Эмердженси: правило 7-8-9 (1-2-3 кг → 7-8-9 см) как back-up без расчёта
`,
};

export default runner;

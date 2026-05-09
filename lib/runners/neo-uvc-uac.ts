/**
 * Runner: neo-uvc-uac — Umbilical Catheter Size + Insertion Depth
 *
 * NEONATOLOGY MODULE A16 (P0). Source attribution:
 *   PRIMARY:    Weiner GM, Zaichkin J, eds. Textbook of Neonatal
 *               Resuscitation (NRP), 8th ed. AAP & AHA; 2021.
 *               Chapter 10: Umbilical catheter placement.
 *   FORMULA:    Shukla HK, Ferrara A. Rapid estimation of insertion
 *               length of umbilical catheters. Am J Dis Child.
 *               1986;140(8):786-788.
 *   ALT:        Verheij GH, Te Pas AB, Witlox RS, Smits-Wintjens VE,
 *               Walther FJ, Lopriore E. Poor accuracy of methods
 *               currently used to determine umbilical catheter
 *               insertion length. Int J Pediatr. 2010:873167.
 *               (Recommends radiographic verification — formulas
 *                only as initial estimate)
 *
 * Catheter sizes (Fr) by weight:
 *   <1500 g:        UVC 3.5 Fr, UAC 3.5 Fr (или 2.5 для micro-preterm)
 *   ≥1500 g:        UVC 5 Fr, UAC 5 Fr
 *
 * Insertion depth — Shukla formula (cm):
 *   UVC depth = (3 × birth_weight_kg) + 9
 *   UAC depth = (3 × birth_weight_kg) + 9 (high) — same as UVC
 *               OR (3 × birth_weight_kg) + 9 — but for UAC HIGH (T6-T9)
 *               LOW UAC = birth_weight_kg + 7 (L3-L4) — emergency only
 *
 * Add cord stump length to total insertion (typically ~2 cm).
 *
 * Target positions (X-ray verification mandatory):
 *   UVC tip — IVC just above diaphragm (T8-T9 vertebra body)
 *   UAC HIGH tip — descending aorta T6-T9 (above mesenteric arteries)
 *   UAC LOW tip — descending aorta L3-L4 (below renal arteries)
 *
 * Caveats:
 *   - Shukla formula tends to OVER-estimate by 0.5-1 cm — pull back при
 *     X-ray верификации
 *   - UAC LOW position контра-indicated при NEC risk (mesenteric perfusion)
 *   - UVC removal в течение 7-14 дней (sepsis risk) — заменить на PICC
 *   - UAC removal в течение 5-10 дней (thrombosis risk)
 *   - Не использовать UVC при omphalitis / omphalocele / gastroschisis
 *   - Maximum dwell time UVC 14 дней per CDC
 *
 * SOURCES (audit 1.15):
 *   [1] NRP 8 ed. AAP/AHA 2021 Chapter 10
 *   [2] Shukla 1986: pubmed.ncbi.nlm.nih.gov/3728406
 *   [3] Verheij 2010: pubmed.ncbi.nlm.nih.gov/20862391
 *   [4] CDC NHSN central-line-associated bloodstream infection (CLABSI)
 *       prevention guidelines: cdc.gov/nhsn
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NRP 8 ed. 2021 / NICUtools)',
  reference:
    'NRP 8 ed. AAP/AHA 2021 Chapter 10. Shukla HK, Ferrara A. Am J Dis Child 1986;140:786 (формула). Verheij 2010 — точность только X-ray.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса при рождении',
      type: 'number',
      unit: 'г',
      min: 400,
      max: 6000,
      step: 10,
      hint: 'Birth weight в граммах',
      quickValues: [600, 1000, 1500, 2500, 3500],
    },
    {
      id: 'cord',
      label: 'Длина культи пуповины',
      type: 'number',
      unit: 'см',
      min: 0,
      max: 5,
      step: 0.5,
      hint: 'От abdominal wall до точки введения (обычно 2 см)',
      quickValues: [1, 2, 2.5, 3],
    },
    {
      id: 'uac_position',
      label: 'Положение UAC',
      type: 'select',
      options: [
        { value: 'high', label: 'HIGH (T6-T9) — стандарт, дольше dwell' },
        { value: 'low', label: 'LOW (L3-L4) — emergency / коротко' },
      ],
    },
  ],
  presets: [
    { label: 'ELBW 700 г', values: { weight: 700, cord: 2, uac_position: 'high' } },
    { label: 'VLBW 1200 г', values: { weight: 1200, cord: 2, uac_position: 'high' } },
    { label: 'Преэрм 2200 г', values: { weight: 2200, cord: 2, uac_position: 'high' } },
    { label: 'Термин 3500 г', values: { weight: 3500, cord: 2, uac_position: 'high' } },
  ],
  compute: (v) => {
    const weight_g = Math.max(400, Math.min(6000, Number(v.weight) || 3000));
    const weight_kg = weight_g / 1000;
    const cord_cm = Math.max(0, Math.min(5, Number(v.cord) || 2));
    const uac_low = String(v.uac_position || 'high') === 'low';

    // Catheter size (Fr)
    let uvc_size: string;
    let uac_size: string;
    if (weight_g < 1000) {
      uvc_size = '3.5'; // или 2.5 при micro-preterm
      uac_size = '3.5';
    } else if (weight_g < 1500) {
      uvc_size = '3.5-5';
      uac_size = '3.5-5';
    } else {
      uvc_size = '5';
      uac_size = '5';
    }

    // Shukla formula
    const uvc_depth = 3 * weight_kg + 9 + cord_cm;
    const uac_high_depth = 3 * weight_kg + 9 + cord_cm;
    const uac_low_depth = weight_kg + 7 + cord_cm;
    const uac_depth = uac_low ? uac_low_depth : uac_high_depth;

    const uvc_rounded = Math.round(uvc_depth * 10) / 10;
    const uac_rounded = Math.round(uac_depth * 10) / 10;

    let interpretation = `UVC ${uvc_size} Fr на ${uvc_rounded} см · UAC ${uac_size} Fr на ${uac_rounded} см (${uac_low ? 'LOW' : 'HIGH'})`;
    let color = '#22C55E';
    if (uac_low) {
      color = '#F59E0B';
      interpretation += ' — LOW position только emergency';
    }

    const details = `### Размеры катетеров (Fr) для ${weight_g} г

| Катетер | Размер | Просвет |
|---|---|---|
| UVC | **${uvc_size} Fr** | для лекарств, инфузии, экстренного volume |
| UAC | **${uac_size} Fr** | для постоянного arterial access, ABG, BP |

### Глубина введения (Shukla формула + культя)

\`\`\`
UVC depth (cm) = (3 × ${weight_kg.toFixed(2)}) + 9 + ${cord_cm} (cord) = ${uvc_rounded}
UAC HIGH depth = (3 × ${weight_kg.toFixed(2)}) + 9 + ${cord_cm} = ${(3 * weight_kg + 9 + cord_cm).toFixed(1)}
UAC LOW depth = (${weight_kg.toFixed(2)}) + 7 + ${cord_cm} = ${(weight_kg + 7 + cord_cm).toFixed(1)}
\`\`\`

**Рекомендованная глубина:** UVC **${uvc_rounded} см**, UAC **${uac_rounded} см** (${uac_low ? 'LOW' : 'HIGH'}).

### Целевые позиции (X-ray verification ОБЯЗАТЕЛЬНА)

| Катетер | Позиция | Vertebra |
|---|---|---|
| UVC tip | IVC чуть выше диафрагмы | **T8-T9** body |
| UAC HIGH tip | descending aorta | **T6-T9** (выше mesenteric) |
| UAC LOW tip | descending aorta | **L3-L4** (ниже renal arteries) |

### Проверка положения

1. **X-ray AP** — ОБЯЗАТЕЛЬНА после установки
2. UVC: tip на уровне diaphragm — outside heart
3. UAC: tip между T6-T9 (HIGH) или L3-L4 (LOW)
4. Если UVC слишком глубоко (heart) → подтянуть; если в portal vein
   → подтянуть и переустановить
5. Если UAC между T10-L2 — небезопасно (renal/mesenteric arteries) →
   переустановить выше или ниже

### Когда удалять

| Катетер | Maximum dwell time |
|---|---|
| UVC | 7-14 дней (CDC), затем перейти на PICC |
| UAC HIGH | 5-10 дней (риск тромбоза > чем PICC) |
| UAC LOW | 24-72 ч (NEC risk) |

### Противопоказания

- Omphalitis (инфекция пуповины)
- Omphalocele / gastroschisis
- Vasa previa или peritonitis
- Возраст >7 дней (vessels constricted)`;

    const actions = [
      `**UVC ${uvc_size} Fr на ${uvc_rounded} см** — для лекарств, инфузии, exchange transfusion`,
      `**UAC ${uac_size} Fr на ${uac_rounded} см** (${uac_low ? 'LOW' : 'HIGH'}) — для ABG, BP мониторинга`,
      'Стерильная техника: gown + glove + drapes (CLABSI prevention)',
      '**X-ray AP** ОБЯЗАТЕЛЬНА после установки — корректировать tip position',
      'UVC tip target: T8-T9 (diaphragm); UAC HIGH: T6-T9; UAC LOW: L3-L4',
      uac_low
        ? '⚠️ UAC LOW — только emergency (NEC risk выше); переустановить HIGH в течение 24-72 ч'
        : '',
      'Документировать: время установки, fr, глубину, X-ray confirmation, gauze marker',
    ].filter(Boolean);

    return {
      value: `UVC ${uvc_rounded} см / UAC ${uac_rounded} см`,
      unit: `${uvc_size} Fr / ${uac_size} Fr`,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Shukla формула чаще OVER-estimates на 0.5-1 см — после X-ray всегда корректировать',
        'X-ray AP positioning — sole reliable method (Verheij 2010 — клинические знаки ненадёжны)',
        'UVC dwell >14 дней — резкий ↑ CLABSI; перейти на PICC',
        'UAC LOW (L3-L4) только при невозможности HIGH — выше NEC + thrombosis risks',
        'При micro-preterm (<750 г) рассмотреть UVC 2.5 Fr (если доступен) — меньше травмы',
        'Cord stump length добавить к Shukla — не забыть в расчёте',
      ],
      scale: {
        segments: [
          { min: 0, max: 9, label: 'ELBW', color: '#7F1D1D' },
          { min: 9, max: 11, label: 'VLBW', color: '#EF4444' },
          { min: 11, max: 14, label: 'Преэрм', color: '#F59E0B' },
          { min: 14, max: 20, label: 'Термин', color: '#22C55E' },
        ],
        current: uvc_rounded,
        unit: 'см UVC',
      },
      related: [
        { id: 'neo-ett', title: 'Размер ЭТТ' },
        { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  info: `### Размеры катетеров (Fr) по массе

| Масса | UVC | UAC |
|---|---|---|
| <1000 г (micro-preterm) | 3.5 (2.5 если доступен) | 3.5 |
| 1000-1500 г | 3.5-5 | 3.5-5 |
| ≥1500 г | 5 | 5 |

### Формула Shukla (1986)

\`\`\`
UVC depth (cm)      = (3 × birth_weight_kg) + 9 + cord_length
UAC HIGH depth (cm) = (3 × birth_weight_kg) + 9 + cord_length  (T6-T9)
UAC LOW depth (cm)  = birth_weight_kg + 7 + cord_length        (L3-L4)
\`\`\`

**Cord length** — обычно 2 см (от abdominal wall до точки введения).

### Целевые позиции tip (X-ray)

| Катетер | Vertebra | Анатомия |
|---|---|---|
| UVC | T8-T9 body | IVC чуть выше диафрагмы, outside heart |
| UAC HIGH | T6-T9 | descending aorta выше mesenteric arteries |
| UAC LOW | L3-L4 | descending aorta ниже renal arteries |

### UAC HIGH vs LOW

| Параметр | HIGH | LOW |
|---|---|---|
| Позиция tip | T6-T9 (грудная аорта) | L3-L4 (брюшная) |
| Dwell time | 5-10 дней | 24-72 ч (NEC risk) |
| Thrombosis risk | Ниже | Выше (slower flow) |
| Mesenteric perfusion | Не страдает | Может ухудшаться |
| Indications | Стандарт | Emergency / временно |

**Стандарт = HIGH.** LOW только если HIGH невозможно (anomalies, technical
failure) — пересадить на HIGH в течение 24-72 ч.

### Установка (стерильная техника)

1. Подготовка: gown + sterile gloves + cap + mask + drapes (full barrier)
2. Asepsis: chlorhexidine (>2 мес возраст) или povidone-iodine (<2 мес)
3. Cord stump cut перпендикулярно на 1-2 см от abdominal wall
4. Identify 1 vein (large, thin-walled) + 2 arteries (smaller, thicker)
5. UVC: вена 12 o'clock; UAC: артерии 4 / 8 o'clock
6. Введение catheter с медленным advance, без force
7. Проверка blood return (UAC — pulsatile, UVC — non-pulsatile)
8. **Suture / anchor** + sterile dressing
9. **X-ray AP** — мandatory
10. Корректировка глубины при необходимости (подтянуть, не толкать!)

### Когда удалять (CDC NHSN)

| Катетер | Maximum dwell | Замена |
|---|---|---|
| UVC | 7-14 дней | PICC |
| UAC HIGH | 5-10 дней | Periph. arterial line |
| UAC LOW | 24-72 ч | Pull, переустановить HIGH |

### Противопоказания

- Omphalitis
- Omphalocele / gastroschisis (кожа отсутствует)
- Peritonitis или подозрение на NEC
- Vasa previa
- Возраст >7 дней (vessels constricted, technical fail)

### Осложнения (мониторинг)

- **CLABSI** — sepsis at insertion site, fever, ↑ CRP
- **Thrombosis** — leg ischemia (UAC), liver dysfunction (UVC portal vein)
- **Cardiac arrhythmia** при UVC слишком глубоко (right atrium)
- **Hepatic hematoma** — UVC mispositioned в portal/hepatic vein
- **NEC** — особенно UAC LOW position
- **Catheter migration** — daily X-ray check first 24h

### Источники

- NRP 8 ed. AAP/AHA 2021 Chapter 10
- Shukla HK, Ferrara A. Am J Dis Child 1986;140:786 (исходная формула)
- Verheij GH et al. Int J Pediatr 2010 (точность только X-ray)
- CDC NHSN CLABSI prevention guidelines

### Ограничения

- Калькулятор — только стартовая оценка глубины; X-ray всегда обязателен
- Shukla over-estimates у LBW (<1500 г) на 0.5-1 см
- Anatomic anomalies (heterotaxy, single ventricle, IVC агенезия) требуют
  индивидуального approach
- При неудаче ‒ переход на PICC / centrally-inserted line
`,
};

export default runner;

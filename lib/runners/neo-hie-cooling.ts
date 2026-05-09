/**
 * Runner: neo-hie-cooling — Therapeutic Hypothermia (TH) Eligibility for HIE
 *
 * NEONATOLOGY MODULE A26 (P1).
 *
 * Source attribution:
 *   PRIMARY:    Shankaran S et al. NICHD Whole-body hypothermia for
 *               neonates with hypoxic-ischemic encephalopathy. NEJM
 *               2005;353(15):1574-1584. doi:10.1056/NEJMcps050929
 *   COMPANION:  Azzopardi DV et al. TOBY trial — selective head cooling.
 *               NEJM 2009;361(14):1349-1358.
 *   GUIDELINE:  Jacobs SE et al. Cochrane 2013 — TH benefits NDI + mortality.
 *               doi:10.1002/14651858.CD003311.pub3
 *               ILCOR 2020 — TH standard care для moderate-severe HIE
 *               ≥36 нед GA + criteria A/B/C met.
 *
 * Eligibility criteria (NICHD + TOBY combined):
 *   A. GA ≥36 weeks AND BW ≥1800 g
 *   B. Evidence of perinatal asphyxia (≥1):
 *      - Apgar ≤5 at 10 min
 *      - Continued resuscitation требуется at 10 min
 *      - Cord pH <7.0 OR base deficit ≥16 mEq/L
 *      - Acute perinatal event (placental abruption, cord prolapse, etc)
 *   C. Moderate or severe encephalopathy (clinical exam):
 *      - Sarnat stage II OR III
 *      - OR ≥3 of: lethargy, abnormal tone, weak/absent suck,
 *        hyperalert/decreased reflexes, abnormal pupils, seizures
 *
 * Initiation window: within 6 hours of birth (preferable <3h).
 * Duration: 72 hours of cooling at 33.5°C (whole-body) or 34.5°C
 *           (selective head). Then 4-hour rewarming at 0.5°C/h.
 *
 * Caveats:
 *   - GA <36 OR BW <1800 g: not standard of care; growing evidence для
 *     borderline preterm 33-35 нед в research protocols
 *   - Initiation >6h: limited benefit, может рассмотреть до 12h в severe
 *   - Contraindications: severe coagulopathy + bleeding, surgical needs
 *     (NEC, congenital anomalies), moribund (Apgar 0 at 20 min)
 *   - Hyperthermia (T° >38°C) ВРЕДНА — actively cool to normothermia
 *
 * SOURCES (audit 1.15):
 *   [1] NICHD Shankaran NEJM 2005: doi.org/10.1056/NEJMcps050929
 *   [2] TOBY Azzopardi NEJM 2009: doi.org/10.1056/NEJMoa0900854
 *   [3] Cochrane 2013: doi.org/10.1002/14651858.CD003311.pub3
 *   [4] ILCOR 2020 Newborn: doi.org/10.1542/peds.2020-038505E
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NICHD / TOBY / ILCOR 2020)',
  reference:
    'Shankaran S et al. NEJM 2005;353:1574 (NICHD). Azzopardi DV et al. NEJM 2009;361:1349 (TOBY). Cochrane 2013. ILCOR 2020.',
  inputs: [
    { id: 'ga', label: 'GA при рождении (нед)', type: 'number', min: 32, max: 42, step: 1, quickValues: [34, 36, 38, 40] },
    { id: 'bw', label: 'BW при рождении (г)', type: 'number', min: 1000, max: 5000, step: 50, quickValues: [1500, 1800, 2500, 3500] },
    { id: 'age_hours', label: 'Возраст ребёнка (часов от рождения)', type: 'number', min: 0, max: 24, step: 0.5, hint: 'Cooling должен начаться ≤6ч (NICHD)', quickValues: [1, 3, 5, 6, 8] },
    { id: 'apgar10', label: 'Apgar at 10 min ≤5', type: 'checkbox' },
    { id: 'resus10', label: 'Reanimation продолжается at 10 min', type: 'checkbox' },
    { id: 'ph_low', label: 'Cord pH <7.0', type: 'checkbox' },
    { id: 'be_high', label: 'Cord base deficit ≥16 mEq/L', type: 'checkbox' },
    { id: 'acute_event', label: 'Острое перинатальное событие (отслойка / пролапс / разрыв матки)', type: 'checkbox' },
    { id: 'sarnat', label: 'Стадия Sarnat (клиническая оценка)', type: 'select', options: [
      { value: '0', label: 'Norma / Stage I (mild) — НЕ показание' },
      { value: '2', label: 'Stage II (moderate) — показание' },
      { value: '3', label: 'Stage III (severe) — показание' },
    ] },
    { id: 'contra', label: 'Противопоказания (severe coagulopathy + кровотечение / surgical needs / moribund Apgar 0 на 20 мин)', type: 'checkbox' },
  ],
  presets: [
    { label: 'Eligible: term + perinatal asphyxia + moderate HIE', values: { ga: 40, bw: 3500, age_hours: 3, apgar10: true, resus10: false, ph_low: true, be_high: false, acute_event: true, sarnat: '2', contra: false } },
    { label: 'NOT eligible: <36 нед', values: { ga: 35, bw: 2200, age_hours: 4, apgar10: true, resus10: false, ph_low: true, be_high: false, acute_event: false, sarnat: '2', contra: false } },
    { label: 'NOT eligible: window >6h', values: { ga: 38, bw: 3200, age_hours: 8, apgar10: true, resus10: false, ph_low: false, be_high: true, acute_event: true, sarnat: '3', contra: false } },
  ],
  compute: (v) => {
    const ga = Number(v.ga) || 38;
    const bw = Number(v.bw) || 3000;
    const age_hours = Number(v.age_hours) || 0;
    const apgar10 = v.apgar10 === true;
    const resus10 = v.resus10 === true;
    const ph_low = v.ph_low === true;
    const be_high = v.be_high === true;
    const acute_event = v.acute_event === true;
    const sarnat = String(v.sarnat || '0');
    const contra = v.contra === true;

    // Criterion A
    const A_ga_bw = ga >= 36 && bw >= 1800;

    // Criterion B (≥1 of perinatal asphyxia evidence)
    const B_evidence = apgar10 || resus10 || ph_low || be_high || acute_event;

    // Criterion C (moderate or severe HIE)
    const C_hie = sarnat === '2' || sarnat === '3';

    // Window
    const window_ok = age_hours <= 6;

    const eligible = A_ga_bw && B_evidence && C_hie && window_ok && !contra;

    let interpretation = '';
    let color = '#22C55E';
    let value = '';
    const actions: string[] = [];

    if (eligible) {
      value = 'ELIGIBLE';
      color = '#7F1D1D';
      interpretation = 'Кандидат для therapeutic hypothermia (TH) — начать ≤6ч от рождения';
      actions.push(
        '⚠️ TH ПОКАЗАНА — начать в течение 6 ч от рождения (NICHD/TOBY)',
        'Whole-body cooling target 33.5°C × 72 ч (NICHD protocol)',
        'ИЛИ selective head cooling 34.5°C × 72 ч (TOBY protocol)',
        'Continuous monitoring: temperature core (esophageal/rectal), HR, SpO₂, BP',
        'aEEG (amplitude-integrated EEG) — оценка severity и detection seizures',
        'Avoid hyperthermia (T° >38°C) — actively cool на normothermia если cooling недоступно',
        'Re-warm 0.5°C/h × 4 ч после 72 ч cooling',
        'MRI brain в TEA (term-equivalent age, GA 40 нед) для prognosis',
        'Family counselling — discuss outcomes (50% mortality reduction; ~50% NDI у survivors)',
      );
    } else {
      value = 'NOT ELIGIBLE';
      color = '#F59E0B';
      const reasons: string[] = [];
      if (!A_ga_bw) reasons.push(`GA ${ga} нед / BW ${bw} г не соответствует ≥36 нед + ≥1800 г`);
      if (!B_evidence) reasons.push('Нет evidence перинатальной асфиксии (Apgar≤5 at 10, продолжающаяся реанимация, pH<7.0, BE≥16, острое событие)');
      if (!C_hie) reasons.push('HIE отсутствует или mild (Sarnat I) — TH не показана');
      if (!window_ok) reasons.push(`Возраст ${age_hours} ч > 6 ч — окно TH propušče (limited benefit; рассмотреть до 12 ч в severe)`);
      if (contra) reasons.push('Противопоказания — severe coagulopathy с кровотечением / surgical needs / moribund');

      interpretation = `TH не показана: ${reasons.join('; ')}`;
      actions.push(
        ...reasons.map((r) => `• ${r}`),
        'Если возраст близок к 6 ч и есть HIE: обсудить с центром cooling — возможна late initiation до 12 ч',
        'Avoid hyperthermia в любом случае — actively cool на normothermia',
        'Продолжить supportive care: ventilation, glucose, BP, seizure management',
        'aEEG для assessment severity даже без TH',
      );
    }

    const details = `### Critеria для TH (NICHD/TOBY combined)

**Criterion A — Demographics:**
- GA ≥36 weeks: ${ga >= 36 ? '✅' : '❌'} (актуально ${ga} нед)
- BW ≥1800 g: ${bw >= 1800 ? '✅' : '❌'} (актуально ${bw} г)

**Criterion B — Evidence перинатальной асфиксии (≥1):**
- Apgar ≤5 at 10 min: ${apgar10 ? '✅' : '—'}
- Resuscitation @ 10 min: ${resus10 ? '✅' : '—'}
- Cord pH <7.0: ${ph_low ? '✅' : '—'}
- Cord BE ≥16: ${be_high ? '✅' : '—'}
- Acute event: ${acute_event ? '✅' : '—'}
- B met: ${B_evidence ? '✅' : '❌'}

**Criterion C — Moderate/severe HIE:**
- Sarnat stage: ${sarnat === '0' ? 'Normal/I' : sarnat === '2' ? 'II (moderate)' : 'III (severe)'}
- C met: ${C_hie ? '✅' : '❌'}

**Window:**
- Age ${age_hours} ч ≤ 6 ч: ${window_ok ? '✅' : '❌ окно прошло'}

**Contraindications:**
- ${contra ? '⚠️ Yes — TH противопоказана' : 'None'}

### Treatment protocol

| Method | Target T° | Duration |
|---|---|---|
| Whole-body (NICHD) | **33.5°C** | 72 ч + 4 ч rewarming |
| Selective head (TOBY) | **34.5°C** core | 72 ч + 4 ч rewarming |

### Monitoring during TH

- Continuous core temperature (esophageal или rectal probe)
- aEEG для detection seizures + severity assessment
- ECG, BP, SpO₂, ETCO₂ (если intubated)
- Glucose q4-6 ч (cooling может вызвать hyperglycemia)
- Coagulation, electrolytes, lactate q12 ч
- Serial neurology exam — daily

### Outcomes (NICHD/TOBY meta-analysis)

| Outcome | TH benefit |
|---|---|
| Mortality | ~25% relative reduction |
| Major NDI | ~30% relative reduction |
| CP (any) | ~30% relative reduction |
| NNT | ~7-9 to prevent 1 death/major NDI |

### Side effects

- Bradycardia (expected, не treat если HR >80, BP stable)
- Mild thrombocytopenia (~30%)
- Subcutaneous fat necrosis (rare, late)
- Hypotension (управляемо vasopressors)
- Hyperglycemia (insulin rare, prefer fluid management)`;

    return {
      value,
      unit: eligible ? 'TH в 6ч' : 'reason listed',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'GA <36 нед — не standard care; growing evidence для 33-35 нед research protocols',
        'Initiation >6ч — limited benefit; может рассмотреть до 12ч в severe HIE',
        'Hyperthermia (T° >38°C) ВРЕДНА — actively cool на normothermia',
        'aEEG критично для real-time assessment severity и seizures',
        'MRI brain в TEA — gold standard prognosis',
        'NICHD whole-body vs TOBY selective head — equivalent outcomes; whole-body easier',
        'TH не "cure" — supportive care + neuroprotection; ~50% survivors имеют NDI',
        'Cooling без protocol/team experience — увеличивает risk; transfer to cooling center при необходимости',
      ],
      scale: {
        segments: [
          { min: 0, max: 6, label: 'TH window', color: '#22C55E' },
          { min: 6, max: 12, label: 'Late (limited)', color: '#F59E0B' },
          { min: 12, max: 24, label: 'Closed', color: '#EF4444' },
        ],
        current: age_hours,
        unit: 'ч от рождения',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'thompson', title: 'Thompson / Sarnat' },
        { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
        { id: 'neo-papile', title: 'Papile ВЖК' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '301.6', title: 'Детская неврология' },
      ],
    };
  },
  info: `### Что такое TH (Therapeutic Hypothermia)

Стандартное вмешательство для **moderate-severe** гипоксически-ишемической
энцефалопатии (HIE) у термин/late preterm новорождённых. Снижает
mortality ~25% и major NDI ~30% (Cochrane 2013).

### Eligibility criteria (NICHD + TOBY combined)

**A. Demographics:**
- GA ≥36 нед AND BW ≥1800 г

**B. Evidence перинатальной асфиксии (≥1):**
- Apgar ≤5 at 10 min
- Continued resuscitation at 10 min
- Cord pH <7.0
- Cord base deficit ≥16 mEq/L
- Acute perinatal event (placental abruption, cord prolapse, ruptured uterus)

**C. Moderate/severe HIE (clinical exam):**
- Sarnat stage II или III
- ИЛИ ≥3 признаков: lethargy, abnormal tone, weak/absent suck,
  hyperalert/decreased reflexes, abnormal pupils, seizures

**Window: ≤6 hours от рождения** (preferable <3h).

### Protocols

| Protocol | Method | Target T° | Duration |
|---|---|---|---|
| **NICHD** (Shankaran 2005) | Whole-body cooling blanket | 33.5°C | 72 ч + 4 ч rewarming |
| **TOBY** (Azzopardi 2009) | Selective head (cool cap) | 34.5°C core | 72 ч + 4 ч rewarming |

Outcomes equivalent — choice по locallu protocol/equipment.

### Outcomes (Cochrane 2013 meta)

| Outcome | RR (95% CI) | NNT |
|---|---|---|
| Mortality | 0.75 (0.65-0.86) | ~9 |
| Major NDI | 0.74 (0.62-0.88) | ~7 |
| Death + major NDI | 0.75 (0.68-0.83) | ~7 |
| CP | 0.66 (0.54-0.82) | ~9 |

### Contraindications

- Severe coagulopathy + active bleeding
- Significant surgical needs (NEC, congenital anomalies requiring early surgery)
- Moribund (Apgar 0 на 20 min) — futility
- Severe IUGR (relative — local protocol)

### Adjunctive therapies

- **Erythropoietin** (EPO) — neuroprotection trials в progress
- **Magnesium sulfate** — ongoing research
- **Allopurinol** — оксидантный stress reduction, mixed evidence
- **Stem cells** — research only

### Источники

- NICHD Shankaran NEJM 2005 (whole-body)
- TOBY Azzopardi NEJM 2009 (selective head)
- Cochrane Jacobs 2013 — meta-analysis
- ILCOR 2020 — TH standard recommendation
- AAP COFN 2014 reaffirmation

### Ограничения

- GA <36 — research protocols только
- Initiation >6h — limited benefit; до 12h в severe можно рассмотреть
- Cooling без team experience увеличивает risk — transfer to centre
- TH не "cure" — supportive care critical
`,
};

export default runner;

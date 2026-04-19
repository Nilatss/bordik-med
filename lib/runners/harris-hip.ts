// @ts-nocheck
/** Runner: harris-hip — Harris Hip Score / Oxford Hip / Oxford Knee */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'scale',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'hhs', label: 'Harris Hip Score (0–100, выше = лучше)' },
        { value: 'oxford-hip', label: 'Oxford Hip Score (0–48, выше = лучше)' },
        { value: 'oxford-knee', label: 'Oxford Knee Score (0–48, выше = лучше)' },
      ],
    },
    {
      id: 'score',
      label: 'Суммарный балл',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      quickValues: [0, 12, 20, 30, 40, 60, 80, 100],
    },
  ],
  compute: (v) => {
    const scale = String(v.scale);
    const score = Number(v.score);
    let interpretation = '', color = '#22C55E', details = '', unit = 'баллов';
    let actions: string[] = [];

    if (scale === 'hhs') {
      if (score >= 90) { interpretation = 'Отличный (HHS ≥ 90)'; color = '#22C55E'; }
      else if (score >= 80) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 70) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой (< 70)'; color = '#EF4444'; }
      details = 'Harris Hip Score (1969) — Pain (44) + Function (47: gait 33 + activities 14) + Absence of deformity (4) + ROM (5). Сумма 0–100. Золотой стандарт для THA с 1970-х. MCID ≈ 18; PASS ≈ 73.';
      actions = [
        'Исторически завышает у пожилых малоактивных → рассмотреть Oxford',
        'Pre-op HHS обычно 40–55, через 1 год post-THA 85–95',
        'Чувствителен к ROM и gait — требует осмотра',
      ];
    } else if (scale === 'oxford-hip') {
      unit = '(0–48)';
      if (score >= 42) { interpretation = 'Отличный (Oxford Hip ≥ 42)'; color = '#22C55E'; }
      else if (score >= 34) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 27) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой / выраженная дисфункция'; color = '#EF4444'; }
      details = 'Oxford Hip Score (Dawson, 1996) — 12 пунктов, каждый 0–4. Сумма 0–48, выше = лучше. Самозаполняемая. MCID ≈ 5; PASS ≈ 42. Основа UK National Joint Registry для THA.';
      actions = [
        'Простая, самозаполняемая — подходит для телефонных/почтовых опросов',
        'Используется в NJR Англии/Уэльса',
      ];
    } else if (scale === 'oxford-knee') {
      unit = '(0–48)';
      if (score >= 41) { interpretation = 'Отличный (Oxford Knee ≥ 41)'; color = '#22C55E'; }
      else if (score >= 34) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 27) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой'; color = '#EF4444'; }
      details = 'Oxford Knee Score (Dawson, 1998) — 12 пунктов × 0–4 = 0–48. MCID ≈ 5; PASS ≈ 37. Для оценки TKA/UKA.';
      actions = [
        'Дополнительно: KOOS / WOMAC для более детальной оценки OA',
        'Oxford 0–19 «плохо» — рассмотреть revision',
      ];
    }

    return {
      value: String(score),
      unit,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'HHS — требует физикального осмотра (ROM, gait); Oxford — полностью самозаполняемые',
        'Oxford Hip/Knee — стандарт в UK NJR (реестре) из-за простоты и валидности',
        'HHS не учитывает психологические и социальные аспекты',
        'WOMAC/KOOS/HOOS — дополнение при детальной оценке OA',
        'MCID: HHS ≈ 18, Oxford Hip/Knee ≈ 5 — интерпретировать в контексте',
      ],
      related: [
        { id: 'tonnis', title: 'Tönnis (hip OA)' },
        { id: 'kellgren', title: 'Kellgren-Lawrence' },
        { id: 'garden', title: 'Garden (femoral neck)' },
        { id: 'ikdc', title: 'IKDC / KOOS / WOMAC (knee)' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
        { id: '201.3', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Harris WH. Traumatic arthritis of the hip after dislocation and acetabular fractures: treatment by mold arthroplasty. J Bone Joint Surg Am 1969;51:737–55. Dawson J et al. Questionnaire on the perceptions of patients about total hip replacement. J Bone Joint Surg Br 1996;78:185–90. Dawson J et al. Questionnaire on the perceptions of patients about total knee replacement. J Bone Joint Surg Br 1998;80:63–9.',
  countries: 'Международный (Oxford — UK NJR стандарт)',
  presets: [
    { label: 'HHS pre-op (конечная стадия OA)', values: { scale: 'hhs', score: 45 } },
    { label: 'HHS 1 год post-THA — отлично', values: { scale: 'hhs', score: 92 } },
    { label: 'Oxford Hip отличный post-THA', values: { scale: 'oxford-hip', score: 44 } },
    { label: 'Oxford Knee pre-TKA', values: { scale: 'oxford-knee', score: 20 } },
  ],
  info: `### Для чего используется
PROMs для **тазобедренного и коленного сустава**. Применяются в оценке исходов **THA/TKA/UKA**, консервативного лечения OA, повреждений.

### Harris Hip Score (HHS, 1969)
- **Pain 44** + **Function 47** (gait 33 + activities 14) + **Deformity 4** + **ROM 5** = **0–100**
- ≥90 отлично, 80–89 хорошо, 70–79 удовл., <70 плохо
- MCID ≈ 18; PASS ≈ 73
- Требует физикального осмотра (ROM, gait)
- **Золотой стандарт для THA** с 1970-х

### Oxford Hip Score (1996) / Knee Score (1998)
- **12 пунктов × 0–4 = 0–48**, ВЫШЕ = лучше
- Полностью самозаполняемые (12 min)
- MCID ≈ 5; PASS Hip ≈ 42, Knee ≈ 37
- Интерпретация:
  - 40–48: удовлетворительная функция
  - 30–39: лёгкая-умеренная
  - 20–29: умеренная-тяжёлая, рассмотреть хирургию
  - <20: тяжёлая, THA/TKA показана
- Основа **UK National Joint Registry** (>3 млн операций)

### Сравнение HHS vs Oxford
| Параметр | HHS | Oxford |
|---|---|---|
| Диапазон | 0–100 | 0–48 |
| Домены | Pain + Function + Deform + ROM | Unidimensional |
| Заполнение | Клиницист + осмотр | Самозаполнение |
| Применение | Клинические исследования | Регистры, рутина |
| MCID | ≈ 18 | ≈ 5 |

### Альтернативы
- **KOOS / HOOS** (Roos, 1998) — для молодых активных
- **WOMAC** — стандарт OA knee/hip
- **HOS** (Hip Outcome Score) — FAI/arthroscopy
- **Forgotten Joint Score** (FJS-12) — «успешное» TJA (>85)

### Источники
Harris WH. *JBJS Am* 1969;51:737. Dawson J et al. *JBJS Br* 1996;78:185 (hip), 1998;80:63 (knee).
`,
};

export default runner;

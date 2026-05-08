/** Runner: mmpi — Minnesota Multiphasic Personality Inventory (MMPI-2 / MMPI-2-RF) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный',
  reference:
    'Butcher JN, Dahlstrom WG, Graham JR, Tellegen A, Kaemmer B. Manual for the Restandardized Minnesota Multiphasic Personality Inventory: MMPI-2. University of Minnesota Press; 1989. Ben-Porath YS, Tellegen A. MMPI-2-RF Manual. 2008/2020.',
  inputs: [
    {
      id: 'scaleType',
      label: 'Тип шкалы',
      type: 'select',
      options: [
        { value: 'validity', label: 'Шкала валидности (L/F/K/VRIN/TRIN)', points: 0 },
        { value: 'clinical', label: 'Клиническая шкала (Hs, D, Hy, Pd, Mf, Pa, Pt, Sc, Ma, Si)', points: 0 },
        { value: 'content', label: 'Контент-шкала (ANX, DEP, HEA, BIZ, ANG, ...)', points: 0 },
        { value: 'rc', label: 'Restructured Clinical (RCd, RC1-9)', points: 0 },
        { value: 'supplementary', label: 'Дополнительная (MAC-R, PK, AAS, ...)', points: 0 },
      ],
    },
    {
      id: 'tscore',
      label: 'T-score (норма M=50, SD=10)',
      type: 'number',
      min: 30,
      max: 120,
      step: 1,
      quickValues: [45, 60, 65, 75, 90],
      hint: 'MMPI-2 стандартизован: T≥65 клинически значимо, T≥75 выраженное повышение.',
    },
    {
      id: 'fScaleElevated',
      label: 'F-шкала T ≥80 (инфрекуэнт-симуляция/случайные ответы)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'lScaleElevated',
      label: 'L-шкала T ≥65 (чрезмерная нормативность)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (T=55)', values: { scaleType: 'clinical', tscore: 55, fScaleElevated: false, lScaleElevated: false } },
    { label: 'Значимое повышение (T=70)', values: { scaleType: 'clinical', tscore: 70, fScaleElevated: false, lScaleElevated: false } },
    { label: 'Подозрение симуляции', values: { scaleType: 'validity', tscore: 95, fScaleElevated: true, lScaleElevated: false } },
  ],
  compute: (v) => {
    const scaleType = String(v.scaleType || 'clinical');
    const t = Math.max(30, Math.min(120, Number(v.tscore) || 0));
    const fElev = v.fScaleElevated === true;
    const lElev = v.lScaleElevated === true;

    let color = '#22C55E';
    let label = 'В пределах нормы (<65)';
    let details = 'T-score в норме — выраженных психопатологических признаков по данной шкале нет.';
    const actions: string[] = [];

    if (t >= 75) {
      color = '#991B1B';
      label = 'Клиническое значение (T≥75)';
      details = 'T-score ≥75 — выраженное повышение, клинически значимо.';
      actions.push(
        'Интерпретация в контексте профиля всех шкал (не одной!)',
        'Сопоставление с клиническим интервью, анамнезом',
        'Code types (2-point, 3-point) — например, 2-7 (депрессия+тревога), 4-9 (антисоциальность)',
        'Оценка необходимости психиатрического вмешательства',
      );
    } else if (t >= 65) {
      color = '#F59E0B';
      label = 'Значительное повышение (T 65-74)';
      details = 'T-score 65-74 — клинически значимое повышение (MMPI-2 cut-off).';
      actions.push(
        'Анализ в контексте полного профиля',
        'Сбор клинической информации для подтверждения',
        'Повторное тестирование через 6-12 мес при необходимости',
      );
    } else {
      actions.push('Шкала в пределах нормы — продолжить анализ остальных шкал');
    }

    if (fElev) {
      color = '#991B1B';
      actions.unshift('⚠️ F-шкала T ≥80 — подозрение на симуляцию, случайные ответы или тяжёлую психопатологию. Fp-шкала для дифференциации');
    }
    if (lElev) {
      actions.unshift('⚠️ L-шкала T ≥65 — возможна диссимуляция ("faking good"), протокол может быть недостоверным');
    }
    if (scaleType === 'validity') {
      actions.push('Валидность шкалы — оценить достоверность всего протокола перед интерпретацией клинических');
    }

    return {
      value: String(t),
      unit: 'T-score',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'MMPI-2 (567 пунктов), MMPI-2-RF (338), MMPI-3 (335, 2020)',
        'Интерпретация ТОЛЬКО квалифицированным психологом/психиатром с обучением',
        'Всегда оценивать валидность (VRIN, TRIN, F, Fb, Fp, L, K) ДО клинических',
        'Одиночные шкалы не интерпретируются — только код-типы и профиль',
        'T-score ≥65 (MMPI-2) / ≥65 (MMPI-2-RF) — клиническое значение',
        'Этнокультурные различия — учитывать валидизацию в популяции',
        'Не используется для детей (для них — MMPI-A, 14-18 лет)',
      ],
      scale: {
        segments: [
          { min: 30, max: 64, label: '<65 норма', color: '#22C55E' },
          { min: 65, max: 74, label: '65-74 знач.', color: '#F59E0B' },
          { min: 75, max: 120, label: '≥75 клиниче.', color: '#991B1B' },
        ],
        current: t,
        unit: 'T-score',
      },
      related: [
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'pcl5', title: 'PCL-5' },
      ],
      relatedCourses: [{ id: '306.6', title: 'Психиатрия — личностные' }],
    };
  },
  info: `### Для чего используется
**MMPI-2 (Minnesota Multiphasic Personality Inventory-2; Butcher 1989)** — наиболее широко используемый объективный тест личности и психопатологии у взрослых (≥18 лет). 567 пунктов (да/нет).

**MMPI-2-RF** (Ben-Porath & Tellegen 2008/2020) — реструктурированная версия, 338 пунктов.
**MMPI-3** (2020) — последняя версия, 335 пунктов.

### Структура MMPI-2
| Группа | Шкалы |
|---|---|
| **Валидности** | L, F, K, VRIN, TRIN, Fb, Fp, S |
| **Клинические (10)** | 1-Hs, 2-D, 3-Hy, 4-Pd, 5-Mf, 6-Pa, 7-Pt, 8-Sc, 9-Ma, 0-Si |
| **Контент (15)** | ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN, ASP, TPA, LSE, SOD, FAM, WRK, TRT |
| **Supplementary** | MAC-R, PK, AAS, APS, MDS, ... |
| **RC (RC-шкалы)** | RCd, RC1-9 (MMPI-2-RF) |

### T-score интерпретация
| T-score | Уровень | Действие |
|---|---|---|
| <65 | Норма | — |
| **65-74** | **Значительное повышение** | Клинически значимо |
| **≥75** | **Клиническое значение** | Сильный клинический сигнал |

### Валидность протокола
| Шкала | Что ловит | Cut-off |
|---|---|---|
| **L** (Lie) | "Faking good", нормативность | T≥65 |
| **F** (Infrequency) | Симуляция, случайные ответы | T≥80 сомнительно, ≥100 невалидно |
| **Fp** (Fb-p psychopathology) | Симуляция психоза | T≥100 |
| **K** (Correction) | Защитность | T≥65 |
| **VRIN** | Случайные ответы | T≥80 |
| **TRIN** | Тенденция "да/нет" | T≥80 |

### Code types (2-point elevations)
- **1-3** (Hs-Hy): конверсионное V, соматизация
- **2-7** (D-Pt): депрессия + тревога
- **4-9** (Pd-Ma): антисоциальность, импульсивность
- **6-8** (Pa-Sc): шизофрения, параноидное
- **8-9** (Sc-Ma): манический, возможный психоз

### Ограничения
- Требует квалифицированной интерпретации (psychologist)
- Долгий (1-2 ч)
- Чтение на уровне 6-го класса минимум
- Для подростков — MMPI-A
- MMPI-3 — новая стандартизация (более разнообразная выборка)`,
};

export default runner;

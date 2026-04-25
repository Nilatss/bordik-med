// @ts-nocheck
/**
 * Runner: rifle - RIFLE / AKIN / KDIGO 2012 для острого повреждения почек (AKI)
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'baseCr',
hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л', label: 'Базовый креатинин', type: 'number', unit: 'мкмоль/л', min: 20, max: 1500, step: 1, quickValues: [60, 80, 100, 120, 150, 200] },
    { id: 'curCr',
hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л', label: 'Текущий креатинин', type: 'number', unit: 'мкмоль/л', min: 20, max: 3000, step: 1, quickValues: [100, 150, 200, 300, 400, 600] },
    {
      id: 'uo', label: 'Диурез (лучший из критериев)', type: 'select',
      options: [
        { value: 'normal', label: '≥ 0,5 мл/кг/ч > 12 ч (норма)' },
        { value: 's1', label: '< 0,5 мл/кг/ч 6-12 ч' },
        { value: 's2', label: '< 0,5 мл/кг/ч ≥ 12 ч' },
        { value: 's3', label: '< 0,3 мл/кг/ч ≥ 24 ч или анурия ≥ 12 ч' },
      ],
    },
    { id: 'rrt', label: 'Начата ЗПТ (RRT)', type: 'checkbox' },
  ],
  compute: (v) => {
    const base = Number(v.baseCr), cur = Number(v.curCr);
    const ratio = cur / base;
    const absInc = cur - base; // мкмоль/л; порог KDIGO 1 = ≥ 26,5 мкмоль/л за 48 ч
    let crStage = 0;
    if (ratio >= 3.0 || cur >= 354 || absInc >= 354) crStage = 3;
    else if (ratio >= 2.0) crStage = 2;
    else if (ratio >= 1.5 || absInc >= 26.5) crStage = 1;

    const uo = String(v.uo || 'normal');
    let uoStage = 0;
    if (uo === 's3') uoStage = 3;
    else if (uo === 's2') uoStage = 2;
    else if (uo === 's1') uoStage = 1;

    let stage = Math.max(crStage, uoStage);
    if (v.rrt) stage = 3;

    const rifleMap = ['Нет AKI', 'Risk (R)', 'Injury (I)', 'Failure (F)'];
    const colorMap = ['#22C55E', '#F59E0B', '#EF4444', '#991B1B'];
    const label = stage === 0 ? 'Нет AKI' : `KDIGO ${stage} · RIFLE ${rifleMap[stage]}`;
    const actions: string[] = [];
    if (stage >= 1) {
      actions.push('Отменить нефротоксичные препараты (NSAID, аминогликозиды, контраст)');
      actions.push('Скорректировать дозы по КК, проверить лекарственные взаимодействия');
      actions.push('Оценить волемический статус; цель: эуволемия');
    }
    if (stage >= 2) {
      actions.push('Нефролог; ежедневный контроль Cr, K⁺, HCO₃⁻, диуреза');
      actions.push('Поиск причины (ischemia, sepsis, obstruction, nephrotoxins, glomerular)');
    }
    if (stage >= 3) {
      actions.push('Рассмотреть ЗПТ по показаниям AEIOU (acidosis, electrolytes, intoxication, overload, uremia)');
      actions.push('Furosemide stress test для прогноза прогрессирования');
    }
    return {
      value: label,
      interpretation: label,
      color: colorMap[stage],
      details: stage === 0
        ? 'Критерии AKI (KDIGO 2012) не выполнены.'
        : `Стадия определена по ${crStage >= uoStage ? 'креатинину' : 'диурезу'}. RIFLE эквивалент: ${rifleMap[stage]}.`,
      actions,
      caveats: [
        'KDIGO 2012 объединил RIFLE и AKIN; порог стадии 1 = ↑Cr ≥ 26,5 мкмоль/л за 48 ч ИЛИ ×1,5 за 7 сут',
        'Диурез оценивается за скользящее окно; требует точного учёта',
        'Базовый Cr: лучший из последних 3 мес; при отсутствии - MDRD назад с eGFR 75',
        'RIFLE исходно включал категории Loss (> 4 нед) и ESRD (> 3 мес)',
      ],
      related: [
        { id: 'fst', title: 'Furosemide stress test' },
        { id: 'fena', title: 'FENa' },
        { id: 'cockcroft', title: 'Cockcroft-Gault' },
        { id: 'ckd-epi', title: 'CKD-EPI' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.2', title: 'Нефрология' },
      ],
    };
  },
  reference: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1-138. Bellomo R et al. (ADQI) Crit Care 2004 (RIFLE). Mehta R et al. (AKIN) Crit Care 2007.',
  countries: 'Международный (KDIGO)',
  presets: [
    { label: 'Нет AKI', values: { baseCr: 80, curCr: 90, uo: 'normal' } },
    { label: 'KDIGO 1 (Risk)', values: { baseCr: 80, curCr: 130, uo: 's1' } },
    { label: 'KDIGO 2 (Injury)', values: { baseCr: 80, curCr: 180, uo: 's2' } },
    { label: 'KDIGO 3 (Failure)', values: { baseCr: 80, curCr: 360, uo: 's3' } },
  ],
  caveats: [
    'Стадия - максимум из Cr-критерия и диуреза',
    'ЗПТ автоматически = стадия 3',
    'Не применимо при стабильной ХПН без острого ухудшения',
  ],
  info: `### Для чего используется
**KDIGO 2012 AKI Definition** - унифицированные критерии острого повреждения почек, объединяющие RIFLE (2004) и AKIN (2007).

### Критерии AKI (любой из)
- ↑ Cr ≥ 26,5 мкмоль/л (0,3 мг/дл) за 48 ч
- ↑ Cr ≥ 1,5× от базового за 7 сут
- Диурез < 0,5 мл/кг/ч ≥ 6 ч

### Стадии KDIGO / эквивалент RIFLE
| Стадия | Креатинин | Диурез | RIFLE |
|---|---|---|---|
| 1 | ×1,5-1,9 или +≥ 26,5 мкмоль/л | < 0,5 мл/кг/ч 6-12 ч | **R**isk |
| 2 | ×2,0-2,9 | < 0,5 мл/кг/ч ≥ 12 ч | **I**njury |
| 3 | ×3,0 или Cr ≥ 354 мкмоль/л или ЗПТ | < 0,3 мл/кг/ч ≥ 24 ч или анурия ≥ 12 ч | **F**ailure |

RIFLE также выделяет **L**oss (> 4 нед) и **E**SRD (> 3 мес).

### Источники
- KDIGO AKI Guideline. Kidney Int Suppl 2012.
- Bellomo R (ADQI). Crit Care 2004.`,
};

export default runner;

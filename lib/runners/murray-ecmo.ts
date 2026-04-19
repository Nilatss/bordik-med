// @ts-nocheck
/**
 * Runner: murray-ecmo — Murray LIS в контексте показаний к VV-ECMO (CESAR / EOLIA)
 * Базовая шкала повторяет Murray 1988; здесь — интерпретация отбора на ECMO.
 * Для «чистой» шкалы Murray — см. отдельный runner `murray`.
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'cxr', label: 'Инфильтраты на рентгенограмме (квадранты)', type: 'select',
      options: [
        { value: '0', label: 'Нет консолидаций' },
        { value: '1', label: '1 квадрант' },
        { value: '2', label: '2 квадранта' },
        { value: '3', label: '3 квадранта' },
        { value: '4', label: '4 квадранта' },
      ],
    },
    {
      id: 'pf', label: 'Гипоксемия (PaO₂/FiO₂)', type: 'select',
      options: [
        { value: '0', label: '≥ 300' },
        { value: '1', label: '225–299' },
        { value: '2', label: '175–224' },
        { value: '3', label: '100–174' },
        { value: '4', label: '< 100' },
      ],
    },
    {
      id: 'peep', label: 'PEEP (см H₂O)', type: 'select',
      options: [
        { value: '0', label: '≤ 5' },
        { value: '1', label: '6–8' },
        { value: '2', label: '9–11' },
        { value: '3', label: '12–14' },
        { value: '4', label: '≥ 15' },
      ],
    },
    {
      id: 'compl', label: 'Комплаенс (мл/см H₂O)', type: 'select',
      options: [
        { value: '0', label: '≥ 80' },
        { value: '1', label: '60–79' },
        { value: '2', label: '40–59' },
        { value: '3', label: '20–39' },
        { value: '4', label: '≤ 19' },
      ],
    },
  ],
  compute: (v) => {
    const a = Number(v.cxr), b = Number(v.pf), c = Number(v.peep), d = Number(v.compl);
    const mean = (a + b + c + d) / 4;
    let interp = '', color = '', details = '', actions: string[] = [];
    if (mean >= 3) {
      interp = 'Критерии CESAR/EOLIA выполнены — обсудить VV-ECMO';
      color = '#991B1B';
      details = 'LIS ≥ 3 — исторический порог CESAR (UK 2009). В EOLIA (NEJM 2018) ECMO рассматривается при P/F < 50 (3 ч) или < 80 (6 ч) либо pH < 7,25 + PaCO₂ ≥ 60 (6 ч) несмотря на оптимальную ИВЛ и прон.';
      actions = [
        'Связаться с центром ECMO, MDT',
        'Прон-позиция ≥ 16 ч, NMB ≤ 48 ч',
        'Оптимизация PEEP, Vt 6 мл/кг IBW, Plateau ≤ 30',
        'Исключить обратимые причины',
      ];
    } else if (mean >= 2.5) {
      interp = 'Тяжёлое повреждение лёгких (порог ECMO близок)';
      color = '#EF4444';
      details = 'LIS 2,5–2,9 — тяжёлый ARDS, готовность к эскалации.';
      actions = ['Прон-позиция', 'Оценка EOLIA-критериев', 'Связь с ECMO-центром'];
    } else {
      interp = 'Не показан ECMO по LIS';
      color = '#22C55E';
      details = 'LIS < 2,5 — ECMO не показан. Оптимизация ИВЛ и лечение причины.';
      actions = ['Vt 6 мл/кг IBW', 'PEEP-таблица ARDSnet', 'Консервативная инфузия'];
    }
    return {
      value: `LIS ${mean.toFixed(2)}`,
      unit: 'LIS',
      interpretation: interp,
      color,
      details,
      actions,
      caveats: [
        'CESAR: LIS > 3 — порог для перевода в ECMO-центр',
        'EOLIA: современные критерии включают P/F, pH, PaCO₂ при оптимальной ИВЛ',
        'LIS требует ИВЛ (PEEP, комплаенс)',
        'Для полного описания шкалы — см. runner `murray`',
      ],
      related: [
        { id: 'murray', title: 'Murray LIS (базовая)' },
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'resp', title: 'RESP Score' },
        { id: 'preserve', title: 'PRESERVE' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 2.5, label: 'Нет/лёгкий', color: '#22C55E' },
          { min: 2.5, max: 3, label: 'Тяжёлый', color: '#EF4444' },
          { min: 3, max: 4, label: 'ECMO-кандидат', color: '#991B1B' },
        ],
        current: Number(mean.toFixed(2)),
        unit: 'LIS',
      },
    };
  },
  reference: 'Murray JF et al. Am Rev Respir Dis 1988;138:720–3. Peek GJ et al. (CESAR) Lancet 2009;374:1351–63. Combes A et al. (EOLIA) N Engl J Med 2018;378:1965–75.',
  countries: 'Международный (ELSO)',
  presets: [
    { label: 'ECMO-кандидат (LIS 4)', values: { cxr: '4', pf: '4', peep: '4', compl: '4' } },
    { label: 'Пороговый (LIS 3)', values: { cxr: '3', pf: '3', peep: '3', compl: '3' } },
    { label: 'Не кандидат (LIS 1)', values: { cxr: '1', pf: '1', peep: '1', compl: '1' } },
  ],
  caveats: [
    'Только для интерпретации в контексте ECMO',
    'Использовать совместно с критериями EOLIA',
    'Базовая шкала: см. `murray`',
  ],
  info: `### Для чего используется
Интерпретация **Murray Lung Injury Score (1988)** как критерия отбора на **VV-ECMO** (CESAR 2009, EOLIA 2018).

### Критерии отбора
| Источник | Порог |
|---|---|
| CESAR (UK 2009) | LIS > 3 → перевод в ECMO-центр |
| EOLIA (NEJM 2018) | P/F < 50 × 3 ч ИЛИ P/F < 80 × 6 ч ИЛИ pH < 7,25 + PaCO₂ ≥ 60 × 6 ч при оптимальной ИВЛ и прон |

### LIS = (CXR + P/F + PEEP + комплаенс) / 4
| Балл | Интерпретация |
|---|---|
| 0 | Нет повреждения |
| 0,1–2,5 | Лёгкий/умеренный |
| > 2,5 | Тяжёлый |
| ≥ 3 | ECMO-кандидат (CESAR) |

### См. также
Полное описание компонентов и расчёт — в runner **murray**.

### Источники
- Murray JF et al. Am Rev Respir Dis 1988;138:720–3.
- Peek GJ et al. Lancet 2009;374:1351–63 (CESAR).
- Combes A et al. NEJM 2018;378:1965–75 (EOLIA).`,
};

export default runner;

/** Runner: gwtg - AHA Get With The Guidelines */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'program',
      label: 'Программа GWTG',
      type: 'select',
      options: [
        { value: 'stroke', label: 'Stroke - инсульт' },
        { value: 'hf', label: 'Heart Failure - ХСН' },
        { value: 'resus', label: 'Resuscitation - реанимация' },
        { value: 'cad', label: 'CAD / NSTEMI-STEMI' },
      ],
    },
    {
      id: 'doorToNeedle',
      label: 'Door-to-Needle (инсульт, tPA)',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 300,
      step: 1,
      quickValues: [30, 45, 60, 90, 120],
    },
    {
      id: 'doorToBalloon',
      label: 'Door-to-Balloon (STEMI, PCI)',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 300,
      step: 1,
      quickValues: [60, 75, 90, 120],
    },
    {
      id: 'asa24',
      label: 'ASA ≤ 24 ч от поступления',
      type: 'select',
      options: [
        { value: '1', label: 'Да' },
        { value: '0', label: 'Нет' },
      ],
    },
  ],
  compute: (v) => {
    const program = String(v.program || 'stroke');
    const dtn = Number(v.doorToNeedle) || 0;
    const dtb = Number(v.doorToBalloon) || 0;
    const asa = String(v.asa24) === '1';

    let metrics = 0;
    let total = 0;
    const checks: string[] = [];

    if (program === 'stroke') {
      total = 2;
      if (dtn > 0 && dtn <= 60) { metrics++; checks.push(`D2N ${dtn} мин ≤ 60 - OK`); }
      else if (dtn > 0) checks.push(`D2N ${dtn} мин > 60 - МИСС`);
      if (asa) { metrics++; checks.push('ASA ≤ 24 ч - OK'); }
      else checks.push('ASA не задана - МИСС');
    } else if (program === 'cad') {
      total = 2;
      if (dtb > 0 && dtb <= 90) { metrics++; checks.push(`D2B ${dtb} мин ≤ 90 - OK`); }
      else if (dtb > 0) checks.push(`D2B ${dtb} мин > 90 - МИСС`);
      if (asa) { metrics++; checks.push('ASA ≤ 24 ч - OK'); }
      else checks.push('ASA не задана - МИСС');
    } else {
      total = 1;
      if (asa) { metrics++; checks.push('ASA/антикоагулянт ≤ 24 ч - OK'); }
    }

    const pct = total ? Math.round((metrics / total) * 100) : 0;
    let color = '#EF4444';
    let tier = 'Не аккредитован';
    if (pct >= 85) { color = '#22C55E'; tier = 'Gold Plus'; }
    else if (pct >= 75) { color = '#10B981'; tier = 'Gold'; }
    else if (pct >= 50) { color = '#F59E0B'; tier = 'Silver'; }

    return {
      value: `${pct}%`,
      unit: 'compliance',
      interpretation: `GWTG ${program.toUpperCase()}: выполнено ${metrics}/${total} метрик (${pct}%). Уровень: ${tier}.`,
      color,
      details: `AHA Get With The Guidelines - программа непрерывного улучшения качества. Целевые метрики:\n• Инсульт: D2N ≤ 60 мин (tPA), ASA ≤ 24 ч, DVT prophylaxis, LDL screening, smoking cessation.\n• CAD: D2B ≤ 90 мин (PCI), ASA ≤ 24 ч, β-блокатор, statin, ACE/ARB при EF < 40%.\n• HF: ACE/ARB/ARNI, β-блокатор (evidence-based), MRA, смена диеты, follow-up ≤ 7 дней.\n• Resus: CPR ≤ 1 мин от ареста, дефибрилляция ≤ 2 мин, ROSC metrics.`,
      actions: [
        ...checks,
        'Audit: ежеквартальный отчёт в AHA GWTG registry',
        'Target: Gold Plus (≥ 85% compliance на 24 месяца подряд)',
        'Quality improvement huddle: еженедельно',
      ],
      caveats: [
        'GWTG - добровольная программа (США), требует регистрации в AHA',
        'Метрики обновляются ежегодно (последнее крупное обновление - 2023)',
        'D2N ≤ 45 мин и ≤ 30 мин - Target: Stroke Honor Roll (Elite, Elite Plus)',
        'Exclusion: не все пациенты попадают в знаменатель (см. AHA spec)',
      ],
      scale: {
        segments: [
          { label: '0-49%', min: 0, max: 49, color: '#EF4444', description: 'Не аккредитован' },
          { label: '50-74%', min: 50, max: 74, color: '#F59E0B', description: 'Silver' },
          { label: '75-84%', min: 75, max: 84, color: '#10B981', description: 'Gold' },
          { label: '≥ 85%', min: 85, max: 100, color: '#22C55E', description: 'Gold Plus' },
        ],
        current: pct,
        unit: '%',
      },
      related: [
        { id: 'code-stemi', title: 'Code STEMI' },
        { id: 'door-to', title: 'Door-to-X metrics' },
        { id: 'nihss', title: 'NIHSS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.2', title: 'Кардиология' },
      ],
    };
  },
  reference: 'American Heart Association. Get With The Guidelines® Program Specifications. AHA, 2023. Fonarow GC et al. GWTG-HF program outcomes. Circulation 2010;122:585-596.',
  countries: 'США (AHA), применяется в 2600+ госпиталях',
  presets: [
    { label: 'Stroke D2N 45 мин + ASA', values: { program: 'stroke', doorToNeedle: 45, asa24: '1' } },
    { label: 'STEMI D2B 75 мин + ASA', values: { program: 'cad', doorToBalloon: 75, asa24: '1' } },
    { label: 'Stroke D2N 90 мин (fail)', values: { program: 'stroke', doorToNeedle: 90, asa24: '0' } },
    { label: 'Resus - ASA/antikoag', values: { program: 'resus', asa24: '1' } },
  ],
  info: `### Для чего используется
**AHA Get With The Guidelines (GWTG)** - общенациональная программа непрерывного улучшения качества AHA для 4 доменов: **Stroke, Heart Failure, Resuscitation, CAD**.

### Ключевые метрики
| Программа | Основные метрики |
|---|---|
| Stroke | D2N ≤ 60 мин (tPA), ASA ≤ 24 ч, DVT prophylaxis, LDL, cessation |
| CAD/STEMI | D2B ≤ 90 мин (PCI), ASA ≤ 24 ч, β-блокатор, statin |
| HF | ACE/ARB/ARNI, β-блокатор, MRA, follow-up ≤ 7 дн |
| Resus | CPR ≤ 1 мин, дефибрилляция ≤ 2 мин, ROSC care |

### Уровни аккредитации
- **Bronze** - 1 квартал ≥ 75%
- **Silver** - 12 мес ≥ 75%
- **Gold** - 24 мес ≥ 75%
- **Gold Plus** / **Honor Roll** - расширенные метрики ≥ 85%

### Источники
AHA GWTG Program Specs 2023.
Fonarow GC et al. *Circulation* 2010;122:585.
`,
};
export default runner;

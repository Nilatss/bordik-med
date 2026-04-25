// @ts-nocheck
/** Runner: sieve-sort - UK Triage SIEVE + SORT + MPTT-24 */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'stage',
      label: 'Этап сортировки',
      type: 'select',
      options: [
        { value: 'sieve', label: 'SIEVE (первичная, догоспитальная)' },
        { value: 'sort', label: 'SORT (вторичная, на CCP по RTS)' },
      ],
    },
    { id: 'walks', label: 'Способен идти (SIEVE)', type: 'checkbox' },
    { id: 'rr',
hint: 'ЧДД, в минуту. Норма: 12-20', label: 'ЧДД', type: 'number', unit: '/мин', min: 0, max: 80, step: 1, quickValues: [0, 8, 12, 20, 30, 40] },
    { id: 'hr',
hint: 'ЧСС, уд/мин. Норма: 60-100', label: 'ЧСС', type: 'number', unit: '/мин', min: 0, max: 220, step: 1, quickValues: [60, 90, 110, 120, 140] },
    { id: 'crt_high', label: 'CRT > 2 с', type: 'checkbox' },
    {
      id: 'gcs',
      label: 'GCS (для SORT/MPTT)',
      type: 'select',
      options: [
        { value: '15', label: '13-15' },
        { value: '12', label: '9-12' },
        { value: '8', label: '6-8' },
        { value: '5', label: '4-5' },
        { value: '3', label: '3' },
      ],
    },
    {
      id: 'sbp',
      label: 'АД систолическое',
      type: 'select',
      options: [
        { value: '4', label: '≥ 90 мм рт.ст.' },
        { value: '3', label: '76-89' },
        { value: '2', label: '50-75' },
        { value: '1', label: '1-49' },
        { value: '0', label: '0' },
      ],
    },
  ],
  compute: (v) => {
    const stage = String(v.stage || 'sieve');
    const walks = v.walks === true;
    const rr = Number(v.rr) || 0;
    const hr = Number(v.hr) || 0;
    const crtHigh = v.crt_high === true;
    let cat = 'T3'; let label = 'T3 Green (Minor)'; let color = '#22C55E';
    if (stage === 'sieve') {
      if (walks) { cat = 'T3'; label = 'T3 Green - Minor (walking)'; color = '#22C55E'; }
      else if (rr === 0) { cat = 'DEAD'; label = 'Dead / Expectant (нет дыхания после ДП)'; color = '#000000'; }
      else if (rr < 10 || rr > 30) { cat = 'T1'; label = 'T1 Red - Immediate (ЧДД)'; color = '#DC2626'; }
      else if (crtHigh || hr > 120) { cat = 'T1'; label = 'T1 Red - Immediate (перфузия)'; color = '#DC2626'; }
      else { cat = 'T2'; label = 'T2 Yellow - Urgent'; color = '#FACC15'; }
    } else {
      // SORT: RTS = coded GCS + coded SBP + coded RR
      const gcsC = (() => {
        const g = Number(v.gcs);
        if (g >= 13) return 4; if (g >= 9) return 3; if (g >= 6) return 2; if (g >= 4) return 1; return 0;
      })();
      const sbpC = Number(v.sbp);
      const rrC = rr > 29 ? 3 : rr >= 10 ? 4 : rr >= 6 ? 2 : rr >= 1 ? 1 : 0;
      const rts = gcsC + sbpC + rrC;
      if (rts <= 10) { cat = 'T1'; label = `T1 Red - Immediate (RTS ${rts})`; color = '#DC2626'; }
      else if (rts === 11) { cat = 'T2'; label = `T2 Yellow - Urgent (RTS ${rts})`; color = '#FACC15'; }
      else { cat = 'T3'; label = `T3 Green - Delayed (RTS ${rts})`; color = '#22C55E'; }
    }
    return {
      value: cat,
      interpretation: label,
      color,
      details: 'UK Triage SIEVE (первичная) / SORT (вторичная по RTS). MPTT-24 - модификация Военно-медицинской академии NHS для сокращения over-triage.',
      actions: cat === 'T1'
        ? ['Приоритет эвакуации, life-saving interventions немедленно', 'Trauma team activation', 'Повторная оценка каждые 5 мин']
        : cat === 'T2' ? ['Стабилен, требует вмешательства в ближайший час', 'Эвакуация во 2-ю волну']
        : cat === 'T3' ? ['Отсроченное лечение', 'Сборный пункт', 'Периодическая переоценка']
        : ['Expectant: ресурсы не тратить при MCI', 'Документация'],
      caveats: [
        'UK civilian standard (NHS England major incident plan)',
        'MPTT-24: аналог для военных, снижает over-triage',
        'Для детей - Paediatric Triage Tape (вес-ориентированные пороги)',
      ],
      related: [
        { id: 'start-civ', title: 'START / JumpSTART / SALT' },
        { id: 'rts', title: 'RTS (основа SORT)' },
        { id: 'mchs-russia', title: 'МЧС РФ 4-цветная' },
        { id: 'stanag', title: 'NATO STANAG 2879' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'UK Major Trauma Triage Tool / NARU Triage SIEVE & SORT, 2013. Vassallo J et al. Major incident triage: a consensus based definition of the essential life-saving interventions. MPTT-24 - Military Pre-Hospital Trauma Triage Tool.',
  countries: 'Великобритания · NHS England',
  presets: [
    { label: 'SIEVE: идёт', values: { stage: 'sieve', walks: true, rr: 18, hr: 90, crt_high: false, gcs: '15', sbp: '4' } },
    { label: 'SIEVE: ЧДД 36', values: { stage: 'sieve', walks: false, rr: 36, hr: 130, crt_high: true, gcs: '12', sbp: '3' } },
    { label: 'SORT: RTS 10', values: { stage: 'sort', walks: false, rr: 28, hr: 110, crt_high: false, gcs: '12', sbp: '3' } },
  ],
  info: `### Для чего используется
**UK Triage SIEVE + SORT** - двухэтапная NHS-модель MCI-сортировки.

### SIEVE (догоспитальный, 30 c на пострадавшего)
1. Идёт → **T3 Green** (Minor)
2. ЧДД < 10 или > 30 → **T1 Red**
3. CRT > 2 с или ЧСС > 120 → **T1 Red**
4. Иначе → **T2 Yellow**
5. Апноэ после открытия ДП → **Dead**

### SORT (вторичный, на CCP)
Основан на **Revised Trauma Score (Champion 1989)**:
- RTS = GCS-coded (0-4) + SBP-coded (0-4) + RR-coded (0-4)
- RTS ≤ 10 → **T1**; 11 → **T2**; 12 → **T3**

### MPTT-24
Военная модификация: использует единый набор критериев (ЧДД 12-23, systolic palpable carotid only, GCS motor 6). Доказанно снижает over-triage vs SIEVE.

### Pediatric Triage Tape (PTT)
Для детей - ламинированная лента: пороги ЧДД/ЧСС/CRT по длине тела. Brown et al. 2020.

### Источники
- NARU. Major Incident Medical Management and Support (MIMMS) 4th ed, 2020
- Vassallo J et al. Emerg Med J 2017;34:269
- Garner A et al. Comparative analysis of multiple triage systems. Ann Emerg Med 2001
`,
};

export default runner;

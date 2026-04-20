// @ts-nocheck
/** Runner: hs-ctn - High-sensitivity cardiac troponin interpretation */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'assay', label: 'Анализатор', type: 'select', options: [
      { value: 't-roche', label: 'hs-cTnT Roche (URL 14 нг/л)' },
      { value: 'i-abbott', label: 'hs-cTnI Abbott (URL М 34, Ж 16 нг/л)' },
      { value: 'i-siemens', label: 'hs-cTnI Siemens (URL 45 нг/л)' },
      { value: 'i-beckman', label: 'hs-cTnI Beckman (URL 18 нг/л)' },
    ] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'M', label: 'Мужской' },
      { value: 'F', label: 'Женский' },
    ] },
    { id: 'val0', label: '0 ч значение (нг/л)', type: 'number', unit: 'нг/л', min: 0, max: 100000, step: 0.1, quickValues: [3, 10, 30, 100, 500] },
    { id: 'val1', label: '1 ч (или 3 ч) значение (нг/л)', type: 'number', unit: 'нг/л', min: 0, max: 100000, step: 0.1, quickValues: [3, 10, 30, 100, 500] },
    { id: 'interval', label: 'Интервал между заборами', type: 'select', options: [
      { value: '0', label: 'Нет 2-го забора (использовать только 0 ч)' },
      { value: '1', label: '0/1 ч алгоритм (ESC)' },
      { value: '3', label: '0/3 ч алгоритм' },
    ] },
  ],
  compute: (v) => {
    const assay = String(v.assay);
    const sex = String(v.sex);
    const val0 = Number(v.val0);
    const val1 = Number(v.val1);
    const interval = String(v.interval);

    // URLs (99th percentile) and ruleout/rulein thresholds (0/1 h algorithm ESC 2020)
    const thresholds = {
      't-roche': { rule_out: 5, low: 12, rule_in_single: 52, delta1: 5, delta3: 5 },
      'i-abbott': { rule_out: 4, low: sex === 'F' ? 16 : 34, rule_in_single: 64, delta1: 6, delta3: 12 },
      'i-siemens': { rule_out: 3, low: 45, rule_in_single: 120, delta1: 6, delta3: 12 },
      'i-beckman': { rule_out: 4, low: 18, rule_in_single: 50, delta1: 5, delta3: 10 },
    };
    const t = thresholds[assay];
    const deltaAbs = Math.abs(val1 - val0);
    const relevantDelta = interval === '1' ? t.delta1 : t.delta3;

    let band = '', color = '#22C55E', details = '';

    if (interval === '0') {
      // Single sample
      if (val0 < t.rule_out) {
        band = 'Rule-out ИМ'; color = '#22C55E';
        details = `Тропонин ${val0} нг/л ниже rule-out порога (${t.rule_out}). При симптомах > 3 ч и низком HEART - ИМ исключён.`;
      } else if (val0 > t.rule_in_single) {
        band = 'Rule-in ИМ'; color = '#EF4444';
        details = `Тропонин ${val0} нг/л выше rule-in порога (${t.rule_in_single}). Вероятен ИМ (NSTEMI).`;
      } else {
        band = 'Серая зона'; color = '#F59E0B';
        details = `Тропонин ${val0} нг/л в серой зоне. Требуется 2-й забор через 1 или 3 ч.`;
      }
    } else {
      // 0/1 h or 0/3 h algorithm
      if (val0 < t.rule_out && deltaAbs < relevantDelta) {
        band = 'Rule-out ИМ'; color = '#22C55E';
        details = `Baseline ${val0} < ${t.rule_out} и дельта ${deltaAbs.toFixed(1)} < ${relevantDelta} нг/л - ИМ исключён (NPV > 99 %).`;
      } else if (val0 > t.rule_in_single || deltaAbs > relevantDelta * 5) {
        band = 'Rule-in ИМ'; color = '#EF4444';
        details = `Baseline > ${t.rule_in_single} ИЛИ дельта ${deltaAbs.toFixed(1)} > 5× threshold - ИМ (NSTEMI) вероятен.`;
      } else {
        band = 'Observe'; color = '#F59E0B';
        details = `Промежуточные значения - 3 ч забор, ЭхоКГ, КАГ по HEART, GRACE, TIMI.`;
      }
    }

    const causes = val0 > t.low ? [
      'ИМ I типа (атеротромбоз) - КАГ при нестабильной гемодинамике/ЭКГ',
      'ИМ II типа (дисбаланс потребности/доставки) - анемия, тахикардия, сепсис',
      'Миокардит, Takotsubo, ТЭЛА, ХСН, ХПН, кардиохирургия',
      'Повторная ЭКГ + ЭхоКГ + клиника определяют дальнейшую тактику',
    ] : ['Низкие значения - неотложные причины ИМ маловероятны'];

    return {
      value: val0.toFixed(1), unit: 'нг/л hs-cTn',
      interpretation: band, color,
      details,
      actions: [
        `Анализатор ${assay}: URL = ${t.low} нг/л (99-й процентиль), rule-out ${t.rule_out}, rule-in ${t.rule_in_single}`,
        `Дельта за ${interval === '1' ? '1 ч' : '3 ч'}: ${deltaAbs.toFixed(1)} нг/л (threshold ${relevantDelta})`,
        ...causes,
      ],
      caveats: [
        'ESC 0/1 ч алгоритм применим если симптомы > 3 ч от начала',
        'HEART Score + тропонин - стратификация низкого риска ACS',
        'ХБП (eGFR < 30) - базальные тропонины повышены, использовать ∆',
        'Универсальное определение ИМ (Thygesen 4th): ↑ тропонин + 1 из: ишемия, ЭКГ, визуализация, тромб',
      ],
      scale: {
        segments: [
          { min: 0, max: t.rule_out, label: 'Rule-out', color: '#22C55E' },
          { min: t.rule_out, max: t.low, label: 'Ниже URL', color: '#84CC16' },
          { min: t.low, max: t.rule_in_single, label: 'Серая зона', color: '#F59E0B' },
          { min: t.rule_in_single, max: 1000, label: 'Rule-in', color: '#EF4444' },
        ],
        current: Math.min(val0, 1000),
        unit: 'нг/л',
      },
      related: [
        { id: 'heart', title: 'HEART Score' },
        { id: 'timi', title: 'TIMI' },
        { id: 'grace', title: 'GRACE' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'ACS' },
        { id: '304.4', title: 'Кардиомаркёры' },
      ],
    };
  },
  reference: 'Collet JP et al. 2020 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation. Eur Heart J 2021;42:1289.',
  countries: 'Международный (ESC · ACC)',
  presets: [
    { label: 'Rule-out (Roche 0/1 h)', values: { assay: 't-roche', sex: 'M', val0: 3, val1: 4, interval: '1' } },
    { label: 'NSTEMI (Roche rule-in)', values: { assay: 't-roche', sex: 'M', val0: 80, val1: 150, interval: '1' } },
    { label: 'Серая зона (Abbott 0 h)', values: { assay: 'i-abbott', sex: 'F', val0: 20, val1: 0, interval: '0' } },
  ],
  info: `### Для чего используется
Интерпретация высокочувствительных тропонинов в протоколе ESC 0/1 ч или 0/3 ч для исключения / подтверждения NSTEMI.

### Пороги по анализаторам (99-й процентиль URL)
| Assay | URL (М/Ж) | Rule-out | Rule-in single | ∆ 1 ч |
|---|---|---|---|---|
| hs-cTnT Roche | 14 | < 5 | > 52 | > 5 |
| hs-cTnI Abbott | 34 / 16 | < 4 | > 64 | > 6 |
| hs-cTnI Siemens | 45 | < 3 | > 120 | > 6 |
| hs-cTnI Beckman | 18 | < 4 | > 50 | > 5 |

### Алгоритм ESC 0/1 ч
**Rule-out** (ИМ маловероятен):
- baseline < rule-out threshold И симптомы > 3 ч
- ИЛИ baseline < URL И ∆ за 1 ч < threshold

**Rule-in** (вероятен NSTEMI):
- baseline > rule-in single threshold
- ИЛИ ∆ за 1 ч > 5× threshold

**Observe** (серая зона): повторить через 3 ч или дополнительно ЭхоКГ, HEART, КАГ при нестабильности.`,
};

export default runner;

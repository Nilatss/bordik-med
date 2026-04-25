// @ts-nocheck
/** Runner: ada-easd — ADA/EASD 2023 consensus T2DM management decision */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'hba1c',
hint: 'HbA1c. Норма: <5.7%, диабет: ≥6.5%', label: 'HbA1c', type: 'number', unit: '%', min: 5, max: 14, step: 0.1, quickValues: [6.5, 7.0, 7.5, 8.5, 10, 12] },
    { id: 'target', label: 'Целевой HbA1c', type: 'number', unit: '%', min: 6, max: 9, step: 0.1, quickValues: [6.5, 7.0, 7.5, 8.0] },
    { id: 'ascvd', label: 'Установленный ASCVD или высокий риск', type: 'checkbox' },
    { id: 'hf', label: 'Сердечная недостаточность (HFrEF или HFpEF)', type: 'checkbox' },
    { id: 'ckd', label: 'ХБП (рСКФ < 60 или альбуминурия)', type: 'checkbox' },
    { id: 'obesity', label: 'ИМТ ≥ 30 (избыток массы как приоритет)', type: 'checkbox' },
    { id: 'egfr',
hint: 'Расчётная СКФ. ХБП ≥3 при <60', label: 'рСКФ', type: 'number', unit: 'мл/мин/1,73м²', min: 10, max: 120, step: 5, quickValues: [30, 45, 60, 90] },
  ],
  compute: (v) => {
    const a1c = Number(v.hba1c) || 7;
    const target = Number(v.target) || 7;
    const ascvd = !!v.ascvd;
    const hf = !!v.hf;
    const ckd = !!v.ckd;
    const obesity = !!v.obesity;
    const egfr = Number(v.egfr) || 90;

    const gap = a1c - target;
    const firstLine: string[] = [];
    const addOn: string[] = [];
    const actions: string[] = [];
    const caveats: string[] = [];

    // Base: lifestyle + metformin (unless CI)
    if (egfr >= 30) firstLine.push('Метформин 500-2000 мг/сут (постепенный титр.)');
    else { firstLine.push('Метформин противопоказан (рСКФ < 30)'); caveats.push('При рСКФ < 30 метформин отменить'); }
    firstLine.push('Модификация образа жизни (DASH/средиземн. диета, 150 мин/нед физ. активности)');

    // Compelling indications (independent of A1c)
    if (hf) {
      addOn.push('SGLT2-ингибитор (эмпаглифлозин 10 мг, дапаглифлозин 10 мг) — снижает госпитализации при ХСН');
      actions.push('SGLT2i обязателен при ХСН (рСКФ ≥ 20)');
    }
    if (ckd) {
      if (egfr >= 20) addOn.push('SGLT2i (дапаглифлозин/эмпаглифлозин) — замедляет прогрессию ХБП');
      addOn.push('Финеренон 10-20 мг при альбуминурии и рСКФ ≥ 25');
      actions.push('iАПФ/БРА до макс. переносимой дозы');
    }
    if (ascvd) {
      addOn.push('GLP-1 RA (семаглутид / дулаглутид / лираглутид) — снижает MACE');
      addOn.push('SGLT2i (эмпаглифлозин, канаглифлозин) — снижает MACE');
    }
    if (obesity && !addOn.some((x) => x.includes('GLP-1'))) {
      addOn.push('GLP-1 RA (семаглутид 1-2 мг) или GIP/GLP-1 (тирзепатид) — снижение массы 10-20 %');
    }

    // Glycaemic intensification by gap
    let verdict = '';
    let color = '#10B981';
    if (gap <= 0) {
      verdict = 'Целевой HbA1c достигнут — поддерживающая терапия';
      color = '#10B981';
      actions.push('Продолжить текущую схему, переоценка через 3-6 мес');
    } else if (gap < 1.5) {
      verdict = 'Умеренный разрыв (< 1,5 %) — добавить 2-й препарат';
      color = '#F59E0B';
      if (!addOn.length) addOn.push('SGLT2i или GLP-1 RA или ДПП-4 или СМ (по приоритету)');
      actions.push('Переоценка через 3 мес');
    } else if (gap < 3) {
      verdict = 'Большой разрыв (1,5-3 %) — дуальная/тройная терапия';
      color = '#F97316';
      if (!addOn.length) addOn.push('GLP-1 RA или SGLT2i (предпочтит.) + возможен 3-й препарат');
      actions.push('Рассмотреть раннюю комбинированную терапию');
    } else {
      verdict = 'HbA1c ≥ 10 % — рассмотреть инсулин ± GLP-1 RA';
      color = '#EF4444';
      addOn.push('Базальный инсулин (гларгин/деглудек 10 ЕД или 0,1-0,2 ЕД/кг)');
      addOn.push('GLP-1 RA в комбинации — снижает дозу инсулина, массу');
      actions.push('Рассмотреть госпитализацию при кетозе/симптомах');
      actions.push('Обучение самоконтролю глюкозы');
    }

    caveats.push('SGLT2i: риск урогенит. инфекций, DKA, ампутаций (канаглифлозин)');
    caveats.push('GLP-1 RA: ЖКТ побочные, противопоказан при МТС медуллярного рака ЩЖ (MEN2)');
    caveats.push('СМ / инсулин: гипогликемия, увеличение массы — избегать в приоритете при ожирении');

    return {
      value: `Δ HbA1c ${gap >= 0 ? '+' : ''}${gap.toFixed(1)} %`,
      unit: 'ADA/EASD 2023',
      interpretation: verdict,
      color,
      details: `HbA1c ${a1c} % vs цель ${target} % (разрыв ${gap.toFixed(1)} %)\n\n1-я линия:\n${firstLine.map((x) => `- ${x}`).join('\n')}\n\nДобавочная терапия:\n${addOn.length ? addOn.map((x) => `- ${x}`).join('\n') : '- зависит от HbA1c-разрыва'}\n\nПриоритеты ADA/EASD 2023:\n- При ASCVD / ХСН / ХБП — SGLT2i и/или GLP-1 RA независимо от HbA1c\n- При ожирении — GLP-1 RA / тирзепатид\n- При стоимости — СМ / пиоглитазон (вторичная линия)`,
      actions,
      caveats,
      scale: {
        segments: [
          { min: 5, max: 7, label: 'Целевой', color: '#10B981' },
          { min: 7, max: 8.5, label: 'Умеренно', color: '#F59E0B' },
          { min: 8.5, max: 10, label: 'Высокий', color: '#F97316' },
          { min: 10, max: 14, label: 'Оч. высокий', color: '#EF4444' },
        ],
        current: a1c,
        unit: 'HbA1c %',
      },
      related: [
        { id: 'insulin-dose', title: 'Доза инсулина' },
        { id: 'hba1c-eag', title: 'HbA1c → eAG' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Эндокринология' },
        { id: '201.3', title: 'Кардиология' },
      ],
    };
  },
  reference: 'Davies MJ et al. ADA/EASD Consensus Report 2022/2023. Diabetes Care 2022;45:2753-86.',
  countries: 'Международный (ADA/EASD)',
  presets: [
    { label: 'HbA1c 8 % + ASCVD', values: { hba1c: 8.0, target: 7.0, ascvd: true, hf: false, ckd: false, obesity: false, egfr: 75 } },
    { label: 'HbA1c 9 % + ХСН + ХБП', values: { hba1c: 9.0, target: 7.5, ascvd: false, hf: true, ckd: true, obesity: false, egfr: 45 } },
    { label: 'HbA1c 11 % + ожирение', values: { hba1c: 11.0, target: 7.0, ascvd: false, hf: false, ckd: false, obesity: true, egfr: 90 } },
  ],
  info: `### Для чего используется
**ADA/EASD консенсус 2022-2023** — алгоритм подбора сахароснижающей терапии при СД 2 с приоритетом препаратов с доказанной органопротекцией.

### Приоритеты (независимо от HbA1c)
| Состояние | Препарат 1-й линии добавления |
|---|---|
| ASCVD / высокий риск | GLP-1 RA или SGLT2i с CVOT-доказательствами |
| Сердечная недостаточность | SGLT2i (эмпа-/дапа-/канаглифлозин) |
| ХБП (рСКФ 25-60 или альбуминурия) | SGLT2i, финеренон |
| Ожирение | GLP-1 RA (семаглутид), тирзепатид |

### Препараты с CVOT-доказательствами
- **GLP-1 RA с MACE-снижением:** лираглутид (LEADER), семаглутид (SUSTAIN-6), дулаглутид (REWIND)
- **SGLT2i с MACE-снижением:** эмпаглифлозин (EMPA-REG), канаглифлозин (CANVAS)
- **SGLT2i с ХСН/ХБП:** дапаглифлозин (DAPA-HF, DAPA-CKD), эмпаглифлозин (EMPEROR)

### Источник
Davies MJ et al. Diabetes Care 2022;45:2753-86.`,
};

export default runner;

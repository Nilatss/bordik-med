// @ts-nocheck
/** Runner: idf-ms — IDF 2006 Metabolic Syndrome criteria */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'waist',
hint: 'Рост / длина в сантиметрах', label: 'Окружность талии', type: 'number', unit: 'см', min: 50, max: 180, step: 1, quickValues: [80, 90, 94, 100, 110] },
    {
      id: 'ethnicity',
      label: 'Этнический порог окружности талии',
      type: 'select',
      options: [
        { value: 'euro_m', label: 'Европеоиды / средизем. / ближн.восток — ♂ ≥ 94 см' },
        { value: 'euro_f', label: 'Европеоиды / средизем. / ближн.восток — ♀ ≥ 80 см' },
        { value: 'south_m', label: 'Южно-азиаты / китайцы / юж.америк. — ♂ ≥ 90 см' },
        { value: 'south_f', label: 'Южно-азиаты / китайцы / юж.америк. — ♀ ≥ 80 см' },
        { value: 'japan_m', label: 'Японцы — ♂ ≥ 85 см' },
        { value: 'japan_f', label: 'Японцы — ♀ ≥ 90 см' },
      ],
    },
    { id: 'tg',
hint: 'Триглицериды. Норма: <1.7 ммоль/л', label: 'Триглицериды', type: 'number', unit: 'ммоль/л', min: 0.2, max: 10, step: 0.1, quickValues: [1.0, 1.7, 2.5, 4.0] },
    { id: 'hdl',
hint: 'ЛПВП. Норма: М ≥1.0, Ж ≥1.3 ммоль/л', label: 'ХС-ЛПВП', type: 'number', unit: 'ммоль/л', min: 0.3, max: 3, step: 0.05, quickValues: [0.8, 1.0, 1.3, 1.5] },
    { id: 'female', label: 'Женский пол (для HDL-порога)', type: 'checkbox' },
    { id: 'sbp',
hint: 'САД, мм рт.ст. Норма: <130', label: 'Систол. АД', type: 'number', unit: 'мм рт.ст.', min: 80, max: 220, step: 1, quickValues: [120, 130, 135, 145, 160] },
    { id: 'dbp',
hint: 'ДАД, мм рт.ст. Норма: <85', label: 'Диастол. АД', type: 'number', unit: 'мм рт.ст.', min: 40, max: 130, step: 1, quickValues: [75, 85, 90, 95, 100] },
    { id: 'bphigh', label: 'Принимает антигипертензивные', type: 'checkbox' },
    { id: 'fpg',
hint: 'Глюкоза плазмы. Натощак: 3.9-5.5 ммоль/л', label: 'Глюкоза натощак', type: 'number', unit: 'ммоль/л', min: 3, max: 20, step: 0.1, quickValues: [5.0, 5.6, 6.1, 7.0, 9.0] },
    { id: 'dm', label: 'СД 2 типа диагностирован', type: 'checkbox' },
  ],
  compute: (v) => {
    const waist = Number(v.waist) || 0;
    const eth = String(v.ethnicity || 'euro_m');
    const thresholds: Record<string, number> = {
      euro_m: 94, euro_f: 80, south_m: 90, south_f: 80, japan_m: 85, japan_f: 90,
    };
    const th = thresholds[eth];
    const waistPos = waist >= th;

    const tg = Number(v.tg) || 0;
    const tgPos = tg >= 1.7;

    const hdl = Number(v.hdl) || 0;
    const female = !!v.female;
    const hdlPos = female ? hdl < 1.29 : hdl < 1.03;

    const sbp = Number(v.sbp) || 0;
    const dbp = Number(v.dbp) || 0;
    const bpPos = sbp >= 130 || dbp >= 85 || !!v.bphigh;

    const fpg = Number(v.fpg) || 0;
    const glyPos = fpg >= 5.6 || !!v.dm;

    const crit = [
      { name: 'Абдоминальное ожирение', met: waistPos, val: `${waist} см ≥ ${th} см` },
      { name: 'Триглицериды', met: tgPos, val: `${tg.toFixed(1)} ммоль/л ≥ 1,7` },
      { name: 'Низкий HDL', met: hdlPos, val: `${hdl.toFixed(2)} < ${female ? '1,29' : '1,03'} ммоль/л` },
      { name: 'АД ≥ 130/85', met: bpPos, val: `${sbp}/${dbp} мм рт.ст.` },
      { name: 'Глюкоза натощак ≥ 5,6', met: glyPos, val: `${fpg.toFixed(1)} ммоль/л` },
    ];

    // IDF: waist is obligatory + 2 more (total ≥ 3 including waist)
    // ATP III alt: any 3 of 5
    const total = crit.filter((c) => c.met).length;
    const idf = waistPos && total >= 3;

    let verdict = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (idf) {
      verdict = `Метаболический синдром подтверждён (IDF): ${total}/5 критериев`;
      color = '#EF4444';
      actions.push('Снижение массы тела на 5-10 % за 6 мес');
      actions.push('Средиземноморская/DASH-диета, 150 мин/нед аэробных + силовых упр.');
      actions.push('Контроль АД: цель < 130/80');
      actions.push('Статин при LDL ≥ 2,6 или ASCVD ≥ 7,5 %');
      actions.push('Метформин при IFG/IGT + высоком риске СД 2');
      actions.push('Скрининг NAFLD (УЗИ печени, FibroScan)');
    } else if (total >= 3) {
      verdict = `ATP III-МС: ${total}/5 (но без обязат. абдом. ожирения по IDF)`;
      color = '#F59E0B';
      actions.push('Высокий риск СД 2 и ССЗ — модификация образа жизни');
      actions.push('Периодический контроль (HbA1c, липиды, АД) 1 р/год');
    } else if (total === 2) {
      verdict = `Предметаболич. состояние: ${total}/5 критериев`;
      color = '#F59E0B';
      actions.push('Модификация образа жизни, контроль через 12 мес');
    } else {
      verdict = `Критерии МС не выполнены: ${total}/5`;
      color = '#10B981';
      actions.push('Поддерживающая терапия, общий скрининг');
    }

    return {
      value: `${total}/5 критериев`,
      unit: 'IDF 2006',
      interpretation: verdict,
      color,
      details: crit.map((c) => `${c.met ? '✅' : '◻'} **${c.name}** — ${c.val}`).join('\n'),
      actions,
      caveats: [
        'IDF требует абдоминального ожирения как обязательного критерия',
        'ATP III (NCEP) — любые 3 из 5, не требует обязательного критерия',
        'Гармонизированные критерии (JIS 2009) — 3 из 5, этнич. пороги талии',
        'У азиатов пороги талии ниже (90/80), у японцев специфич. (85 ♂ / 90 ♀)',
        'МС повышает риск СД 2 в 5× и ССЗ в 2×',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Нет МС', color: '#10B981' },
          { min: 2, max: 3, label: 'Предмет.', color: '#F59E0B' },
          { min: 3, max: 5, label: 'МС', color: '#EF4444' },
        ],
        current: total,
        unit: 'критериев',
      },
      related: [
        { id: 'homa-ir', title: 'HOMA-IR' },
        { id: 'findrisc', title: 'FINDRISC' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Эндокринология' },
      ],
    };
  },
  reference: 'Alberti KG et al. IDF Consensus Definition of Metabolic Syndrome. Lancet 2005;366:1059-62.',
  countries: 'Международный (IDF 2006 / JIS 2009)',
  presets: [
    { label: 'Классический МС (5/5)', values: { waist: 110, ethnicity: 'euro_m', tg: 2.5, hdl: 0.9, female: false, sbp: 145, dbp: 92, bphigh: false, fpg: 6.5, dm: false } },
    { label: 'Пограничный (2/5)', values: { waist: 88, ethnicity: 'euro_m', tg: 1.9, hdl: 1.1, female: false, sbp: 125, dbp: 80, bphigh: false, fpg: 5.4, dm: false } },
    { label: 'Нет МС', values: { waist: 82, ethnicity: 'euro_m', tg: 1.0, hdl: 1.4, female: false, sbp: 118, dbp: 75, bphigh: false, fpg: 5.0, dm: false } },
  ],
  info: `### Для чего используется
**Метаболический синдром (IDF 2006)** — кластер ФР ССЗ/СД2: абдоминальное ожирение + ≥ 2 из 4.

### Критерии IDF (обязательный + 2)
1. **Абдоминальное ожирение** (талия, этнич. порог) — обязательный
2. Триглицериды ≥ 1,7 ммоль/л (или терапия)
3. HDL < 1,03 (♂) / < 1,29 (♀) ммоль/л (или терапия)
4. АД ≥ 130/85 (или антигипертензивные)
5. Глюкоза натощак ≥ 5,6 ммоль/л (или СД 2)

### Этнические пороги талии
| Популяция | ♂ | ♀ |
|---|---|---|
| Европеоиды | ≥ 94 | ≥ 80 |
| Юж.азиаты / китайцы | ≥ 90 | ≥ 80 |
| Японцы | ≥ 85 | ≥ 90 |

### Источник
IDF Consensus. Lancet 2005;366:1059-62.`,
};

export default runner;

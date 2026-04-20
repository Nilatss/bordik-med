// @ts-nocheck
/** Runner: arr - Aldosterone/Renin Ratio for primary aldosteronism */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ald', label: 'Альдостерон', type: 'number', unit: 'нг/дл', min: 0, max: 200, step: 0.5, quickValues: [5, 10, 15, 25, 40] },
    { id: 'renin', label: 'Ренин (PRA или DRC)', type: 'number', unit: 'нг/мл/ч или мкМЕ/мл', min: 0.01, max: 50, step: 0.01, quickValues: [0.1, 0.5, 1.0, 2.0, 5.0] },
    { id: 'type', label: 'Тип ренина', type: 'select', options: [
      { value: 'pra', label: 'PRA (ActiveProf Renin Activity, нг/мл/ч)' },
      { value: 'drc', label: 'DRC (Direct Renin Concentration, мкМЕ/мл)' },
    ] },
    { id: 'hk', label: 'Гипокалиемия (K < 3.5 ммоль/л)', type: 'checkbox' },
    { id: 'htn', label: 'Резистентная гипертензия (3+ гипотензивных)', type: 'checkbox' },
  ],
  compute: (v) => {
    const ald = Number(v.ald);
    const renin = Number(v.renin);
    const type = String(v.type);
    const hk = !!v.hk;
    const htn = !!v.htn;

    const arr = ald / renin;

    // Cut-offs: PRA-based ARR > 30 (ng/dL / ng/mL/h) suggestive
    //           DRC-based ARR > 3.7 (ng/dL / µIU/mL) suggestive
    const threshold = type === 'pra' ? 30 : 3.7;
    const aldThreshold = 15; // nmol/L aldosterone threshold

    let band = '', color = '#22C55E', details = '', actions = [];

    if (arr > threshold && ald >= aldThreshold) {
      band = 'Первичный альдостеронизм'; color = '#EF4444';
      details = `ARR ${arr.toFixed(1)} > ${threshold} + альдостерон ${ald} нг/дл ≥ 15 - высокая вероятность первичного альдостеронизма (ПА).`;
      actions = [
        'Подтверждающий тест: нагрузка физраствором (2 л 0.9 % NaCl за 4 ч), альдостерон < 5 исключает ПА',
        'Или: флудрокортизоновый супрессивный тест, пероральная соль',
        'Исключить медикаменты: β-блокаторы ↑ ARR (ложно+), ИАПФ/сартаны ↓ ARR (ложно-)',
        'КТ надпочечников при подтверждении',
        'Селективная венозная катетеризация (AVS) для латерализации при планировании адреналэктомии',
      ];
    } else if (arr > threshold) {
      band = 'ARR повышен'; color = '#F59E0B';
      details = `ARR ${arr.toFixed(1)} > ${threshold}, но альдостерон ${ald} нг/дл < 15. Пограничный случай - повторить.`;
      actions = ['Повторить ARR + альдостерон', 'Подтверждающий тест при стойком повышении', 'Откорректировать медикаменты (отменить спиронолактон на 4-6 нед)'];
    } else {
      band = 'ПА маловероятен'; color = '#22C55E';
      details = `ARR ${arr.toFixed(1)} < ${threshold} - первичный альдостеронизм маловероятен.`;
      actions = hk || htn
        ? ['Искать другие причины гипокалиемии / резистентной АГ', 'Исключить: феохромоцитому (метанефрины), Cushing (DST), стеноз почечной артерии (УЗИ)', 'При повторной клинике - повторный ARR после отмены β-блокаторов, ИАПФ, диуретиков']
        : ['ПА не подтверждён, искать иные причины АГ'];
    }

    if (hk) {
      details += ' Гипокалиемия К < 3.5 повышает вероятность ПА (классический признак).';
    }
    if (htn) {
      details += ' Резистентная АГ - показание к скринингу ПА (Endocrine Society 2016).';
    }

    return {
      value: arr.toFixed(1), unit: type === 'pra' ? '(нг/дл) / (нг/мл/ч)' : '(нг/дл) / (мкМЕ/мл)',
      interpretation: band, color,
      details, actions,
      caveats: [
        'Отменить спиронолактон, эплеренон, амилорид за 4-6 нед до теста',
        'β-блокаторы повышают ARR ложно+, ИАПФ/сартаны ↓ ложно-',
        'Забор утром в положении сидя после 2 ч вертикального положения',
        'Гипокалиемию скорректировать до теста (калий < 3.5 ↓ альдостерон)',
        'ПА - причина вторичной АГ у 5-10 % пациентов с АГ, у 20 % при резистентной',
      ],
      scale: {
        segments: [
          { min: 0, max: threshold / 2, label: 'Норма', color: '#22C55E' },
          { min: threshold / 2, max: threshold, label: 'Погран.', color: '#84CC16' },
          { min: threshold, max: threshold * 3, label: 'Повышен', color: '#F59E0B' },
          { min: threshold * 3, max: threshold * 10, label: 'Высокий', color: '#EF4444' },
        ],
        current: Math.min(arr, threshold * 10),
        unit: 'ARR',
      },
      related: [
        { id: 'tsh', title: 'TSH панель' },
        { id: 'cortisol', title: 'Cortisol screen' },
        { id: 'who-ish', title: 'WHO-ISH CVD risk' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Эндокринология' },
        { id: '308.5', title: 'Надпочечники и гипертензия' },
      ],
    };
  },
  reference: 'Funder JW et al. The Management of Primary Aldosteronism. J Clin Endocrinol Metab 2016;101:1889.',
  countries: 'Международный (Endocrine Society · РАЭ)',
  presets: [
    { label: 'ARR 45 / ald 22 (ПА)', values: { ald: 22, renin: 0.5, type: 'pra', hk: true, htn: true } },
    { label: 'ARR 10 (норма)', values: { ald: 10, renin: 1.0, type: 'pra', hk: false, htn: false } },
    { label: 'DRC: ARR 12 / ald 28', values: { ald: 28, renin: 2.3, type: 'drc', hk: false, htn: true } },
  ],
  info: `### Для чего используется
Скрининг первичного альдостеронизма (ПА) у пациентов с:
- Резистентной АГ (3+ гипотензивных)
- АГ + гипокалиемия
- АГ + инциденталома надпочечника
- АГ + семейный анамнез ПА < 40 лет
- АГ + апноэ сна

### Формула
ARR = альдостерон (нг/дл) / ренин

### Cut-offs
| Метод ренина | Порог ARR |
|---|---|
| PRA (нг/мл/ч) | > 30 подозрителен на ПА |
| DRC (мкМЕ/мл) | > 3.7 |

Дополнительный критерий: альдостерон ≥ 15 нг/дл (> 420 пмоль/л).

### Подготовка к тесту
- Скорректировать K до > 4.0
- Отменить спиронолактон / эплеренон / амилорид за 4-6 нед
- Отменить β-блокаторы, центральные α-агонисты за 2 нед (если возможно)
- Норм. потребление соли (5-6 г/сут, без диет без соли)
- Забор утром, сидя 2 ч

### Подтверждение (при ARR+)
1. Нагрузка физраствором 2 л/4 ч - кортизол < 5 исключает ПА
2. Флудрокортизоновый супрессивный тест 4 дня
3. Каптоприловый тест (амбулаторно)

### Источник
Funder JW et al. Endocrine Society CPG on PA. J Clin Endocrinol Metab 2016;101:1889.`,
};

export default runner;

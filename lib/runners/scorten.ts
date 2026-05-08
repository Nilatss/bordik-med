/** Runner: scorten — SCORTEN (SJS/TEN mortality) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст ≥ 40 лет', type: 'checkbox' },
    { id: 'malig', label: 'Сопутствующая малигнизация', type: 'checkbox' },
    { id: 'hr', label: 'ЧСС ≥ 120/мин', type: 'checkbox' },
    { id: 'bsa', label: 'BSA отслоения ≥ 10 %', type: 'checkbox' },
    { id: 'bun', label: 'Мочевина крови > 10 ммоль/л', type: 'checkbox' },
    { id: 'gluc', label: 'Глюкоза > 14 ммоль/л', type: 'checkbox' },
    { id: 'bicarb', label: 'Бикарбонат < 20 ммоль/л', type: 'checkbox' },
  ],
  compute: (v) => {
    const keys = ['age','malig','hr','bsa','bun','gluc','bicarb'];
    const score = keys.reduce((s, k) => s + (v[k] ? 1 : 0), 0);
    let color = '#22C55E', mort = '3 %', interp = 'Низкий риск';
    if (score >= 5) { color = '#7F1D1D'; mort = '≥ 90 %'; interp = 'Критический риск'; }
    else if (score === 4) { color = '#EF4444'; mort = '58 %'; interp = 'Очень высокий риск'; }
    else if (score === 3) { color = '#EF4444'; mort = '35 %'; interp = 'Высокий риск'; }
    else if (score === 2) { color = '#F59E0B'; mort = '12 %'; interp = 'Умеренный риск'; }
    return {
      value: String(score),
      unit: 'SCORTEN',
      interpretation: `${interp} — летальность ${mort}.`,
      color,
      details: 'SCORTEN рассчитывается в первые 24 ч и повторно на 3-и сутки. Каждый из 7 параметров = 1 балл.',
      actions: [
        'Немедленная отмена причинного препарата (HLA-скрининг при аллопуриноле/карбамазепине/абакавире)',
        'Перевод в ожоговое/реанимационное отделение при BSA ≥ 10 % или SCORTEN ≥ 2',
        'Инфузионная терапия 2 мл/кг/%BSA, контроль электролитов, нутритивная поддержка',
        score >= 3 ? 'Рассмотреть циклоспорин 3-5 мг/кг/сут или этанерцепт 50 мг п/к однократно' : '',
        'Офтальмологическая консультация в первые 24 ч (риск симблефарона/слепоты)',
        'Уход за раной без дебридемента, силиконовые сетки, профилактика ВТЭ',
      ].filter(Boolean),
      caveats: [
        'Валидирован для SJS/TEN взрослых; для детей — ABCD-10',
        'Недооценивает смертность при сопутствующей бактериемии / сепсисе',
        'Оценка в 1-е и 3-и сутки — повторный SCORTEN точнее прогнозирует исход',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: '0-1 (3 %)', color: '#22C55E' },
          { min: 2, max: 3, label: '2 (12 %)', color: '#F59E0B' },
          { min: 3, max: 4, label: '3 (35 %)', color: '#EF4444' },
          { min: 4, max: 5, label: '4 (58 %)', color: '#EF4444' },
          { min: 5, max: 8, label: '≥ 5 (90 %)', color: '#7F1D1D' },
        ],
        current: score,
        unit: 'SCORTEN',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'dlqi', title: 'DLQI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Bastuji-Garin S et al. SCORTEN: a severity-of-illness score for toxic epidermal necrolysis. J Invest Dermatol 2000;115:149-153.',
  countries: 'Международный',
  presets: [
    { label: 'Низкий риск', values: { age:false,malig:false,hr:false,bsa:false,bun:false,gluc:false,bicarb:false } },
    { label: 'Умеренный риск', values: { age:true,malig:false,hr:true,bsa:false,bun:false,gluc:false,bicarb:false } },
    { label: 'Критический', values: { age:true,malig:true,hr:true,bsa:true,bun:true,gluc:true,bicarb:false } },
  ],
  info: `### Для чего используется
**SCORTEN** — прогностическая шкала летальности при синдроме Стивенса-Джонсона / токсическом эпидермальном некролизе (SJS/TEN). Рассчитывается в первые 24 часа госпитализации.

### 7 параметров (каждый = 1 балл)
| Параметр | Порог |
|---|---|
| Возраст | ≥ 40 лет |
| Малигнизация | наличие |
| ЧСС | ≥ 120/мин |
| BSA отслоения | ≥ 10 % |
| Мочевина | > 10 ммоль/л (> 28 мг/дл) |
| Глюкоза | > 14 ммоль/л (> 252 мг/дл) |
| Бикарбонат | < 20 ммоль/л |

### Летальность
| Баллы | Летальность |
|---|---|
| 0-1 | 3 % |
| 2 | 12 % |
| 3 | 35 % |
| 4 | 58 % |
| ≥ 5 | ≥ 90 % |

### Источник
Bastuji-Garin S et al. J Invest Dermatol 2000.`,
};

export default runner;

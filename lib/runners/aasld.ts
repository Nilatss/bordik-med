// @ts-nocheck
/** Runner: aasld — AASLD HCC surveillance recommendations */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'etiology',
      label: 'Этиология',
      type: 'select',
      options: [
        { value: 'hcv', label: 'HCV' },
        { value: 'hbv', label: 'HBV' },
        { value: 'nafld', label: 'NAFLD / MASLD' },
        { value: 'alcohol', label: 'Алкогольная' },
        { value: 'pbc', label: 'PBC / PSC' },
        { value: 'other', label: 'Другое / идиопатическое' },
      ],
    },
    {
      id: 'fibrosis',
      label: 'Стадия фиброза',
      type: 'select',
      options: [
        { value: '0', label: 'F0–F1' },
        { value: '2', label: 'F2' },
        { value: '3', label: 'F3' },
        { value: '4', label: 'F4 (цирроз)' },
      ],
    },
    { id: 'cirrhosis', label: 'Установлен цирроз (клинически / гистологически)', type: 'checkbox' },
    { id: 'family', label: 'Семейный анамнез ГЦК (1-я линия)', type: 'checkbox' },
    {
      id: 'hbv_region',
      label: 'HBV — дополнительные ФР (только при HBV)',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет / неприменимо' },
        { value: 'asian_m40', label: 'Азиат ♂ ≥ 40 лет' },
        { value: 'asian_f50', label: 'Азиатка ♀ ≥ 50 лет' },
        { value: 'african', label: 'Африканского происхождения ≥ 20 лет' },
        { value: 'family', label: 'Семейный анамнез ГЦК' },
      ],
    },
  ],
  compute: (v) => {
    const etio = String(v.etiology || 'other');
    const fib = String(v.fibrosis || '0');
    const cirrhosis = Boolean(v.cirrhosis) || fib === '4';
    const family = Boolean(v.family);
    const hbvReg = String(v.hbv_region || 'none');

    let recommend = false;
    let reason = '';

    if (cirrhosis) { recommend = true; reason = 'Цирроз любой этиологии'; }
    else if (etio === 'hbv' && hbvReg !== 'none') { recommend = true; reason = `HBV + ФР (${hbvReg})`; }
    else if (etio === 'hbv' && family) { recommend = true; reason = 'HBV + семейный анамнез ГЦК'; }
    else if (etio === 'hcv' && (fib === '3')) { recommend = true; reason = 'HCV F3 (даже после SVR)'; }
    else if (etio === 'nafld' && cirrhosis) { recommend = true; reason = 'NAFLD-цирроз'; }

    const color = recommend ? '#EF4444' : '#22C55E';
    const value = recommend ? 'Наблюдение показано' : 'Наблюдение не показано';
    const protocol = recommend
      ? 'УЗИ ± АФП каждые 6 мес'
      : 'Стандартное ведение причины (без скрининга ГЦК)';

    return {
      value,
      unit: '',
      interpretation: `${recommend ? 'Показание' : 'Нет показания'}: ${reason || 'нет высокого риска ГЦК'}. Протокол: ${protocol}.`,
      color,
      details: `AASLD 2023: скрининг ГЦК — УЗИ каждые 6 мес ± АФП. При технически неадекватном УЗИ (ожирение, стеатоз) — МРТ или КТ. Аномалии (узел ≥ 1 см или ↑ АФП > 20 нг/мл) → мульти-фазное КТ/МРТ (LI-RADS).`,
      actions: [
        recommend ? 'УЗИ печени + АФП каждые 6 мес' : null,
        recommend ? 'При находке узла ≥ 1 см → КТ/МРТ с контрастом (LI-RADS категория)' : null,
        recommend ? 'LI-RADS 5 (типичная артериальная гиперваскуляризация + washout) = ГЦК, биопсия не нужна' : null,
        etio === 'hcv' ? 'DAA-терапия HCV (софосбувир/велпатасвир × 12 нед) — риск ГЦК сохраняется при F3–F4 после SVR' : null,
        etio === 'hbv' ? 'Тенофовир или энтекавир, цель HBV-DNA < 20 МЕ/мл' : null,
        etio === 'nafld' ? 'Похудение 7–10 %, метформин при СД, пиоглитазон или семаглутид при NASH' : null,
        etio === 'alcohol' ? 'Абстиненция + наблюдение + нутритивная поддержка' : null,
        cirrhosis ? 'ЭГДС-скрининг варикозов; MELD для прогноза и показаний к ТП' : null,
      ].filter(Boolean),
      caveats: [
        'AASLD 2023 не рекомендует скрининг у НЕ-цирроз NAFLD (недостаточно доказательств)',
        'HCV после SVR: при F3–F4 скрининг продолжается — риск ГЦК снижается, но не исчезает',
        'HBV без цирроза: скрининг у азиатов ♂ ≥ 40 / ♀ ≥ 50, африканцев ≥ 20, с семейным анамнезом',
        'Чувствительность УЗИ ~ 63 % для ранней стадии; АФП добавляет ~ 10 %',
        'LI-RADS 5 = 95 %+ специфичность для ГЦК',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Не показано', color: '#22C55E' },
          { min: 1, max: 2, label: 'Показано', color: '#EF4444' },
        ],
        current: recommend ? 1.5 : 0.5,
        unit: '',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гастро / гепатология' },
        { id: '305.1', title: 'Инфекции (HCV/HBV)' },
      ],
      related: [
        { id: 'apri-hep', title: 'APRI / FIB-4' },
        { id: 'meld', title: 'MELD' },
        { id: 'child-pugh', title: 'Child-Pugh' },
      ],
    };
  },
  reference: 'AASLD 2023 Practice Guidance on HCC (Singal AG et al., Hepatology 2023).',
  countries: 'США / Международный (AASLD, EASL аналог)',
  presets: [
    { label: 'HCV F2, без цирроза', values: { etiology: 'hcv', fibrosis: '2', cirrhosis: false, family: false, hbv_region: 'none' } },
    { label: 'HBV, азиат ♂ 45 лет', values: { etiology: 'hbv', fibrosis: '2', cirrhosis: false, family: false, hbv_region: 'asian_m40' } },
    { label: 'Алк. цирроз F4', values: { etiology: 'alcohol', fibrosis: '4', cirrhosis: true, family: false, hbv_region: 'none' } },
  ],
  info: `### Для чего используется
**AASLD 2023 HCC Guidance** — рекомендации по скринингу гепатоцеллюлярной карциномы (ГЦК) у групп риска.

### Показания к скринингу
| Группа | Скрининг |
|---|---|
| Цирроз любой этиологии | Да — УЗИ ± АФП / 6 мес |
| HBV без цирроза: азиаты ♂ ≥ 40 / ♀ ≥ 50 | Да |
| HBV без цирроза: африканцы ≥ 20 | Да |
| HBV + семейный анамнез ГЦК | Да |
| HCV F3 | Да (даже после SVR) |
| NAFLD без цирроза | Нет (индивидуально) |
| NAFLD с циррозом | Да |

### Протокол
- **УЗИ печени ± АФП каждые 6 мес**
- При неадекватном УЗИ (ожирение, выраженный стеатоз) → МРТ/КТ
- При узле ≥ 1 см или ↑ АФП > 20 нг/мл → мульти-фазное КТ/МРТ + LI-RADS

### LI-RADS
| Категория | Значение |
|---|---|
| LR-1 | Точно доброкачественное |
| LR-2 | Вероятно доброкачественное |
| LR-3 | Неопределённое |
| LR-4 | Вероятно ГЦК |
| LR-5 | Определённо ГЦК (типичные артер. гиперваск + washout) |
| LR-M | Злокачественное, не-ГЦК |

LR-5 = 95 %+ специфичность для ГЦК → биопсия не нужна.

### BCLC-стадия (выбор терапии)
| Стадия | Характеристика | Терапия |
|---|---|---|
| 0 (очень ранняя) | ≤ 2 см, Child A | Резекция / абляция |
| A (ранняя) | 1–3 узла ≤ 3 см | Резекция, абляция, трансплантация |
| B (промежуточная) | Мульти-фокальная | ТАХЭ |
| C (продвинутая) | Инвазия / метастазы | Атезолизумаб + бевацизумаб (1 линия 2020) |
| D (терминальная) | Child C, ECOG > 2 | Паллиатив |

### Ограничения
- УЗИ чувствителен ~ 63 % для ранних опухолей
- АФП < 400 нг/мл неспецифичен (беременность, регенерация)
- NAFLD без цирроза — данные недостаточны
- HCV после SVR F3 → продолжать скрининг пожизненно

### Источник
Singal AG et al. *AASLD Practice Guidance on prevention, diagnosis, and treatment of hepatocellular carcinoma.* Hepatology 2023;78(6):1922-1965.`,
};

export default runner;

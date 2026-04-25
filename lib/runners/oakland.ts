// @ts-nocheck
/** Runner: oakland - Oakland score for lower GI bleeding */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст (лет)', type: 'number', min: 18, max: 120, step: 1, quickValues: [30, 50, 70, 85] },
    {
      id: 'sex',
      label: 'Пол',
      type: 'select',
      options: [
        { value: 0, label: 'Женский' },
        { value: 1, label: 'Мужской' },
      ],
    },
    {
      id: 'prevLgib',
      label: 'Предыдущий эпизод LGIB',
      type: 'select',
      options: [
        { value: 0, label: 'Нет' },
        { value: 1, label: 'Да' },
      ],
    },
    {
      id: 'dre',
      label: 'Пальцевое ректальное исследование',
      type: 'select',
      options: [
        { value: 0, label: 'Нет крови' },
        { value: 1, label: 'Кровь (свежая / тёмная)' },
      ],
    },
    { id: 'hr',
hint: 'ЧСС, уд/мин. Норма: 60-100', label: 'ЧСС (уд/мин)', type: 'number', min: 30, max: 200, step: 1, quickValues: [65, 85, 100, 120] },
    { id: 'sbp',
hint: 'САД, мм рт.ст. Норма: <130', label: 'Систолическое АД (мм рт. ст.)', type: 'number', min: 40, max: 250, step: 1, quickValues: [90, 110, 130, 160] },
    { id: 'hb',
hint: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л', label: 'Гемоглобин (г/л)', type: 'number', min: 30, max: 200, step: 1, quickValues: [70, 100, 120, 140] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const sex = Number(v.sex) || 0;
    const prev = Number(v.prevLgib) || 0;
    const dre = Number(v.dre) || 0;
    const hr = Number(v.hr) || 0;
    const sbp = Number(v.sbp) || 0;
    const hb = Number(v.hb) || 0;

    let s = 0;
    // Age
    if (age >= 40 && age <= 69) s += 1;
    else if (age >= 70) s += 2;
    // Sex (male = 1)
    if (sex === 1) s += 1;
    // Previous LGIB admission
    if (prev === 1) s += 1;
    // DRE with blood
    if (dre === 1) s += 1;
    // HR
    if (hr >= 70 && hr <= 89) s += 1;
    else if (hr >= 90 && hr <= 109) s += 2;
    else if (hr >= 110) s += 3;
    // SBP
    if (sbp >= 50 && sbp <= 89) s += 5;
    else if (sbp >= 90 && sbp <= 119) s += 4;
    else if (sbp >= 120 && sbp <= 129) s += 3;
    else if (sbp >= 130 && sbp <= 159) s += 2;
    // 160+ = 0
    // Hb (g/L)
    if (hb < 70) s += 22;
    else if (hb < 90) s += 17;
    else if (hb < 110) s += 13;
    else if (hb < 130) s += 8;
    else if (hb < 160) s += 4;
    // 160+ = 0

    const safeDischarge = s <= 8;
    let band = '', color = '#EF4444', details = '';
    if (safeDischarge) { band = 'Низкий риск — безопасная выписка'; color = '#22C55E'; details = 'Oakland ≤8: вероятность безопасной выписки ~95%. Амбулаторное ведение возможно.'; }
    else if (s <= 15) { band = 'Умеренный риск'; color = '#F59E0B'; details = 'Oakland 9-15: госпитализация, колоноскопия в ближайшие 24-48 ч.'; }
    else { band = 'Высокий риск'; color = '#EF4444'; details = 'Oakland >15: высокий риск серьёзного кровотечения, потребность в трансфузии/вмешательстве.'; }

    return {
      value: String(s),
      unit: 'баллов',
      interpretation: band,
      color,
      details: `${details} Порог безопасной выписки: Oakland ≤8.`,
      actions: [
        safeDischarge ? 'Рассмотреть амбулаторное ведение: контакт через 24 ч, красные флаги, колоноскопия в течение 14 дней' : 'Госпитализация',
        !safeDischarge ? 'Гемотрансфузия при Hb <70 г/л (или <80 при коморбид. ССЗ); цель Hb >70-90' : '',
        !safeDischarge ? 'Колоноскопия в течение 24-48 ч; при гемодинамической нестабильности — КТ-ангиография' : '',
        'Отмена антикоагулянтов/АГГ (ASA временно, но варфарин/DOAC срочно отменить, реверсировать при угрозе жизни)',
        'Исключить UGIB (меlena + гемодин. нестабильность) — ЭГДС или NG-аспират',
        'При массивном кровотечении — эндоваскулярная эмболизация или хирургия',
      ].filter(Boolean),
      caveats: [
        'Oakland score (Oakland 2017) — для пациентов с острым LGIB (гематохезия, мелена из нижних отделов)',
        'Валидизирован на >38 000 пациентов в UK National Audit',
        'Не использовать при UGIB, гемодинамической нестабильности, коагулопатии',
        'Порог ≤8: чувствительность 98%, специфичность 16% для безопасной выписки',
        'Не заменяет клиническую оценку — учитывать коморбидности, антикоагулянты, социальный контекст',
        'Альтернативы (UGIB): Glasgow-Blatchford, Rockall, AIMS65',
      ],
      scale: {
        segments: [
          { min: 0, max: 8, label: 'Безоп. выписка', color: '#22C55E' },
          { min: 9, max: 15, label: 'Умер.', color: '#F59E0B' },
          { min: 16, max: 35, label: 'Высокий', color: '#EF4444' },
        ],
        current: s,
        unit: 'Oakland',
      },
      related: [
        { id: 'rockall', title: 'Rockall' },
        { id: 'gbs', title: 'Glasgow-Blatchford' },
      ],
      relatedCourses: [
        { id: '301.3', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Oakland K, Jairath V, Uberoi R, et al. Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding. Lancet Gastroenterol Hepatol. 2017;2(9):635-643.',
  countries: 'Международный (BSG / ACG)',
  presets: [
    { label: 'Молодой, стабильный — выписка', values: { age: 35, sex: 0, prevLgib: 0, dre: 0, hr: 75, sbp: 130, hb: 135 } },
    { label: 'Пожилой с анемией', values: { age: 78, sex: 1, prevLgib: 1, dre: 1, hr: 105, sbp: 105, hb: 85 } },
    { label: 'Тяжёлое LGIB', values: { age: 82, sex: 1, prevLgib: 1, dre: 1, hr: 120, sbp: 85, hb: 65 } },
  ],
  info: `### Для чего используется
**Oakland score (2017)** — валидизированная шкала для идентификации пациентов с **острым нижним ЖКТ-кровотечением (LGIB)**, которые могут быть **безопасно выписаны амбулаторно**.

### Компоненты и баллы
| Переменная | Баллы |
|---|---|
| Возраст 40-69 | 1 |
| Возраст ≥70 | 2 |
| Мужской пол | 1 |
| Предыдущий LGIB | 1 |
| DRE — кровь | 1 |
| ЧСС 70-89 | 1 |
| ЧСС 90-109 | 2 |
| ЧСС ≥110 | 3 |
| САД 50-89 | 5 |
| САД 90-119 | 4 |
| САД 120-129 | 3 |
| САД 130-159 | 2 |
| Hb <70 | 22 |
| Hb 70-89 | 17 |
| Hb 90-109 | 13 |
| Hb 110-129 | 8 |
| Hb 130-159 | 4 |

**Диапазон:** 0-35 баллов.

### Интерпретация
| Oakland | Тактика |
|---|---|
| ≤8 | Безопасная выписка (PPV 95%) |
| 9-15 | Госпитализация, колоноскопия 24-48 ч |
| ≥16 | Высокий риск, интенсивное наблюдение |

### Применение
- Острая гематохезия / кровавая диарея
- Мелена при подтверждённом отсутствии UGIB
- НЕ применять при гемодинамической нестабильности (сразу госпитализация)

### Cut-off ≤8
- Чувствительность 98% для безопасной выписки
- Специфичность низкая (16%) — но это безопасный триаж-инструмент
- Рекомендован BSG 2019, ACG 2023

### Альтернативы для UGIB
- **Glasgow-Blatchford** — риск вмешательства (GBS = 0 → амбулаторно)
- **Rockall** — риск смерти/рецидива
- **AIMS65** — смертность в больнице

### Источник
Oakland K et al. Lancet Gastroenterol Hepatol 2017;2:635.`,
};

export default runner;

/** Runner: pirads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'zone',
      label: 'Зона предстательной железы',
      type: 'select',
      options: [
        { value: 'pz', label: 'Периферическая зона (PZ) — DWI доминирует' },
        { value: 'tz', label: 'Переходная зона (TZ) — T2W доминирует' },
      ],
    },
    {
      id: 't2',
      label: 'Балл T2W (1-5)',
      type: 'select',
      options: [
        { value: '1', label: '1 — однородный hyperintense (норма)' },
        { value: '2', label: '2 — линейные/клиновидные hypointense' },
        { value: '3', label: '3 — гетерогенность / круглое, нечёткое' },
        { value: '4', label: '4 — гомогенное гипо, < 1.5 см' },
        { value: '5', label: '5 — гомогенное гипо, ≥ 1.5 см или экстрапростатическое распр.' },
      ],
    },
    {
      id: 'dwi',
      label: 'Балл DWI (1-5, high-b + ADC)',
      type: 'select',
      options: [
        { value: '1', label: '1 — нет отклонений' },
        { value: '2', label: '2 — неопределённый гипо ADC' },
        { value: '3', label: '3 — фокальный hypo ADC ± hyper high-b' },
        { value: '4', label: '4 — hypo ADC + hyper high-b, < 1.5 см' },
        { value: '5', label: '5 — как 4, но ≥ 1.5 см или EP распр.' },
      ],
    },
    {
      id: 'dce',
      label: 'DCE — динамическое контрастирование',
      type: 'select',
      options: [
        { value: 'neg', label: 'Отрицательное (−)' },
        { value: 'pos', label: 'Положительное (+)' },
      ],
    },
  ],
  compute: (v) => {
    const zone = String(v.zone);
    const t2 = Number(v.t2);
    const dwi = Number(v.dwi);
    const dce = String(v.dce);

    let pirads = 0;
    if (zone === 'pz') {
      if (dwi <= 2) pirads = dwi;
      else if (dwi === 3) pirads = dce === 'pos' ? 4 : 3;
      else pirads = dwi;
    } else {
      if (t2 <= 2) pirads = t2;
      else if (t2 === 3) pirads = dwi >= 5 ? 4 : 3;
      else pirads = t2;
    }

    let color = '';
    let risk = '';
    let action = '';

    if (pirads === 1) {
      color = '#22C55E';
      risk = 'csPCa крайне маловероятен';
      action = 'Рутинное наблюдение / скрининг по PSA';
    } else if (pirads === 2) {
      color = '#84CC16';
      risk = 'csPCa маловероятен';
      action = 'Наблюдение; повтор МРТ через 12 мес при высоком PSA';
    } else if (pirads === 3) {
      color = '#F59E0B';
      risk = 'csPCa промежуточная вероятность';
      action = 'Таргетная биопсия (по решению MDT); учесть PSA-density, анамнез';
    } else if (pirads === 4) {
      color = '#EF4444';
      risk = 'csPCa вероятен';
      action = 'Таргетная биопсия (fusion-biopsy) обязательна';
    } else {
      color = '#7F1D1D';
      risk = 'csPCa крайне вероятен';
      action = 'Таргетная биопсия + систематическая биопсия; планирование лечения';
    }

    return {
      value: `PI-RADS ${pirads}`,
      unit: zone === 'pz' ? 'PZ' : 'TZ',
      interpretation: `PI-RADS ${pirads} — ${risk}`,
      color,
      details: `Итоговый PI-RADS: ${pirads}. ${risk}. Рекомендация: ${action}.`,
      actions: [
        action,
        pirads >= 3 ? 'Рассчитать PSA-density (PSA / объём простаты); > 0.15 повышает подозрение' : '',
        pirads >= 4 ? 'МР-направленная таргетная биопсия (cognitive / fusion / in-bore)' : '',
        'Bethesda-like Gleason grading → Grade Group (ISUP 2014)',
        'Стратификация риска (D’Amico / NCCN) после биопсии',
      ].filter(Boolean),
      caveats: [
        'PI-RADS v2.1 (2019) — стандарт мпМРТ простаты (T2W + DWI + DCE)',
        'В PZ доминирует DWI; в TZ доминирует T2W',
        'DCE используется только для dichotomization PZ DWI=3 → 4',
        'PSA-density ≥ 0.15 нг/мл/мл повышает подозрение даже при PI-RADS 3',
        'Не оценивает экстрапростатическую инвазию (нужно отдельное описание)',
        'Не применим при активной инфекции, послеоперационных изменениях, после ЛТ',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'PI-RADS 1', color: '#22C55E' },
          { min: 2, max: 3, label: 'PI-RADS 2', color: '#84CC16' },
          { min: 3, max: 4, label: 'PI-RADS 3', color: '#F59E0B' },
          { min: 4, max: 5, label: 'PI-RADS 4', color: '#EF4444' },
          { min: 5, max: 6, label: 'PI-RADS 5', color: '#7F1D1D' },
        ],
        current: pirads,
        unit: 'PI-RADS',
      },
      related: [
        { id: 'd-amico', title: 'D’Amico' },
        { id: 'gleason', title: 'Gleason' },
        { id: 'birads', title: 'BI-RADS' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Turkbey B et al. Prostate Imaging Reporting and Data System Version 2.1: 2019 Update of Prostate Imaging Reporting and Data System Version 2. Eur Urol 2019;76:340-351.',
  countries: 'Международный (ACR / ESUR / AUA)',
  presets: [
    { label: 'PZ PI-RADS 4', values: { zone: 'pz', t2: '3', dwi: '4', dce: 'neg' } },
    { label: 'PZ 3→4 (DCE+)', values: { zone: 'pz', t2: '3', dwi: '3', dce: 'pos' } },
    { label: 'TZ PI-RADS 5', values: { zone: 'tz', t2: '5', dwi: '5', dce: 'neg' } },
  ],
  info: `### Для чего используется
**PI-RADS v2.1 (Prostate Imaging Reporting and Data System, 2019)** — стандартизированная оценка мультипараметрической МРТ (мпМРТ) простаты для выявления **клинически значимого рака (csPCa)**.

### Компоненты мпМРТ
- **T2W** — анатомия, структура зон
- **DWI** (high-b + ADC) — клеточная плотность
- **DCE** — динамическое контрастирование (дополнительная роль)

### Итоговый балл PI-RADS (1-5)
Определяется доминирующей последовательностью:

**Периферическая зона (PZ)** — DWI доминирует:
| DWI | DCE | PI-RADS |
|---|---|---|
| 1 | любой | 1 |
| 2 | любой | 2 |
| **3** | − | **3** |
| **3** | + | **4** |
| 4 | любой | 4 |
| 5 | любой | 5 |

**Переходная зона (TZ)** — T2W доминирует:
| T2W | DWI | PI-RADS |
|---|---|---|
| 1 | любой | 1 |
| 2 | любой | 2 |
| **3** | ≤ 4 | **3** |
| **3** | 5 | **4** |
| 4 | любой | 4 |
| 5 | любой | 5 |

### Интерпретация
| PI-RADS | Вероятность csPCa | Тактика |
|---|---|---|
| **1** | Очень низкая | Наблюдение |
| **2** | Низкая | Наблюдение |
| **3** | Промежуточная | Биопсия по решению MDT; PSA-D, ИГХ |
| **4** | Высокая | Таргетная биопсия |
| **5** | Очень высокая | Таргетная + систематическая биопсия |

### PSA-density
- **PSA-D = PSA (нг/мл) / объём простаты (мл)**
- **≥ 0.15** повышает подозрение — биопсия даже при PI-RADS 3

### Дополнительные стандарты
- **MRI-TRUS fusion biopsy** — точнее, чем систематическая
- **PRECISION** trial (NEJM 2018) — мпМРТ до биопсии у biopsy-naïve
- **MRI-FIRST, 4M** — подтвердили преимущество

### Требования к МРТ
- Магнит **≥ 1.5 T** (предпочтительно 3T)
- Endorectal coil — опционально
- Протокол: T2W (axial + sag + cor), DWI с b-values (50-100, 800-1000, 1400-2000), DCE

### Стадирование после biopsy+
- T2-T3 оценка (капсула, семенные пузырьки, ЭСБ)
- Тазовые ЛУ (коротая ось ≥ 8 мм подозрительные)
- PSMA-PET — для высокого риска / рецидива

### Ограничения
- Не определяет extraprostatic extension (нужно отдельно в отчёте)
- Зависит от опыта радиолога (inter-observer variability ~ 60-70%)
- Не применим после лечения (RT, HIFU) без адаптации
- Может пропустить cribriform / ductal варианты`,
};
export default runner;

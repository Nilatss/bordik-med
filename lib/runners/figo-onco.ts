// @ts-nocheck
/** Runner: figo-onco */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'site',
      label: 'Локализация',
      type: 'select',
      options: [
        { value: 'cervix', label: 'Шейка матки' },
        { value: 'endometrium', label: 'Тело матки (эндометрий)' },
        { value: 'ovary', label: 'Яичник / маточная труба / первичный перитонеальный' },
      ],
    },
    {
      id: 'stage',
      label: 'Стадия FIGO',
      type: 'select',
      options: [
        { value: 'I', label: 'I — ограничена органом' },
        { value: 'II', label: 'II — вышла за пределы органа, но в малом тазу' },
        { value: 'III', label: 'III — распространение в малом тазу / регионарные ЛУ' },
        { value: 'IV', label: 'IV — отдалённое распространение' },
      ],
    },
  ],
  compute: (v) => {
    const site = String(v.site);
    const stage = String(v.stage);
    const stageNum = stage === 'I' ? 1 : stage === 'II' ? 2 : stage === 'III' ? 3 : 4;

    const siteName = site === 'cervix' ? 'шейки матки' : site === 'endometrium' ? 'эндометрия' : 'яичника';

    // 5-year survival by stage & site
    const survival = {
      cervix: { I: '80-93%', II: '58-65%', III: '32-35%', IV: '15-17%' },
      endometrium: { I: '88-95%', II: '70-80%', III: '45-60%', IV: '15-20%' },
      ovary: { I: '85-92%', II: '65-70%', III: '35-45%', IV: '15-20%' },
    };

    const color = stageNum === 1 ? '#22C55E' : stageNum === 2 ? '#F59E0B' : stageNum === 3 ? '#EF4444' : '#991B1B';

    const actions = {
      cervix: [
        'IA1: конизация (при желании сохранить фертильность) или гистерэктомия',
        'IA2-IB1: радикальная гистерэктомия + ТЛАЭ; альтернатива — ХЛТ',
        'IB2-IVA: дефинитивная ХЛТ (цисплатин) + брахитерапия',
        'IVB: системная терапия (бевацизумаб + пембролизумаб + платина/паклитаксел)',
      ],
      endometrium: [
        'I-II: тотальная гистерэктомия + BSO ± ТЛАЭ ± адъювантная ЛТ',
        'III: хирургия + адъювантная ХТ (карбо/паклитаксел) ± ЛТ',
        'IV: системная терапия (ХТ, пембролизумаб при MSI-H/dMMR, гормональная при ER+)',
        'Оценка молекулярного типа (POLE / MSI-H / p53abn / NSMP)',
      ],
      ovary: [
        'I-IIA: полная циторедукция + стадирование; ХТ при high-grade / IC',
        'IIB-IV: интервальная или первичная циторедукция + карбо/паклитаксел × 6 циклов',
        'BRCA1/2, HRD тестирование — PARP-ингибиторы (олапариб, нирапариб) в поддержке',
        'Рецидив: платина-чувствительный vs -резистентный — разные схемы',
      ],
    };

    return {
      value: `FIGO ${stage}`,
      interpretation: `FIGO ${stage} рака ${siteName}`,
      color,
      details: `5-летняя выживаемость: ${survival[site][stage]}.`,
      actions: actions[site],
      caveats: [
        'FIGO 2018 (шейка матки), FIGO 2009 (эндометрий, с изменениями 2023), FIGO 2014 (яичник)',
        'Стадирование хирургическое для эндометрия и яичника; клинико-визуализационное для шейки',
        'FIGO 2018 (шейка): допускается использование МРТ/ПЭТ-КТ для стадирования',
        'Молекулярный профиль (MSI, p53, POLE, BRCA) всё чаще определяет тактику',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'I', color: '#22C55E' },
          { min: 2, max: 3, label: 'II', color: '#F59E0B' },
          { min: 3, max: 4, label: 'III', color: '#EF4444' },
          { min: 4, max: 5, label: 'IV', color: '#991B1B' },
        ],
        current: stageNum,
        unit: 'FIGO',
      },
      related: [
        { id: 'tnm', title: 'TNM' },
        { id: 'ecog-kps', title: 'ECOG / KPS' },
        { id: 'recist', title: 'RECIST 1.1' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'FIGO Cancer Report 2021; FIGO staging for cervical cancer 2018 (Bhatla); FIGO staging for endometrial cancer 2023; FIGO staging for ovarian cancer 2014.',
  countries: 'Международный (WHO / FIGO)',
  presets: [
    { label: 'Шейка IB2', values: { site: 'cervix', stage: 'II' } },
    { label: 'Эндометрий IA', values: { site: 'endometrium', stage: 'I' } },
    { label: 'Яичник IIIC', values: { site: 'ovary', stage: 'III' } },
  ],
  info: `### Для чего используется
**FIGO-стадирование** — международная система стадирования **гинекологических злокачественных опухолей** (шейка матки, эндометрий, яичник, вульва, влагалище, трофобластические).

### Общая структура (упрощённо)
| Стадия | Определение |
|---|---|
| **I** | Опухоль ограничена органом |
| **II** | Распространение за пределы органа, но в пределах малого таза |
| **III** | Распространение в брюшной полости / регионарные ЛУ |
| **IV** | Отдалённые метастазы / инвазия мочевого пузыря / прямой кишки |

### Шейка матки (FIGO 2018)
- **IA1** — ≤ 3 мм глубины инвазии (микроинвазивный)
- **IB1/IB2/IB3** — размер ≤ 2 / 2-4 / > 4 см
- **IIIC1/C2** — метастазы в тазовые / парааортальные ЛУ (новое в 2018)

### Эндометрий (FIGO 2009, обновлён 2023)
- **IA** — без/<½ миометрия, **IB** — ≥½ миометрия
- **II** — инвазия стромы шейки
- **III** — серозно-адексальная / ЛУ
- **IVB** — отдалённые

### Яичник (FIGO 2014)
- **IC1/C2/C3** — разрыв капсулы интраопераци / до операции / опухоль на поверхности / злокачественные клетки в асците
- **IIIA/B/C** — по размеру перитонеальных метастазов

### 5-летняя выживаемость (упрощённо)
| Локализация | I | II | III | IV |
|---|---|---|---|---|
| Шейка матки | 80-93% | 58-65% | 32-35% | 15-17% |
| Эндометрий | 88-95% | 70-80% | 45-60% | 15-20% |
| Яичник | 85-92% | 65-70% | 35-45% | 15-20% |

### Ограничения
- FIGO не охватывает молекулярный профиль — см. POLE/MSI/p53 классификацию (ProMisE) для эндометрия
- Для рака яичника BRCA1/2 / HRD статус критичен для выбора PARP-ингибиторов
- Сложная дифференциация IIIC1 vs IIIC2 для шейки матки требует ПЭТ-КТ

### Источник
Bhatla N et al. *Revised FIGO staging for carcinoma of the cervix uteri.* Int J Gynaecol Obstet. 2019;145:129-135.`,
};
export default runner;

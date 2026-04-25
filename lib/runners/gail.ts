// @ts-nocheck
/** Runner: gail */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'age',
      hint: 'Возраст в годах',
      label: 'Возраст (лет, ≥ 35)',
      type: 'number',
      min: 35,
      max: 85,
      step: 1,
    },
    {
      id: 'menarche',
      label: 'Возраст менархе',
      type: 'select',
      options: [
        { value: '0', label: '≥ 14 лет' },
        { value: '1', label: '12-13 лет' },
        { value: '2', label: '< 12 лет' },
      ],
    },
    {
      id: 'firstbirth',
      label: 'Возраст первых родов',
      type: 'select',
      options: [
        { value: '0', label: 'Нерожавшая / < 20 лет' },
        { value: '1', label: '20-24 года' },
        { value: '2', label: '25-29 лет' },
        { value: '3', label: '≥ 30 лет' },
      ],
    },
    {
      id: 'relatives',
      label: 'Родственники 1 степени с РМЖ',
      type: 'select',
      options: [
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '≥ 2' },
      ],
    },
    {
      id: 'biopsies',
      label: 'Биопсий молочной железы',
      type: 'select',
      options: [
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '≥ 2' },
      ],
    },
    {
      id: 'atypia',
      label: 'Атипическая гиперплазия в биопсии',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const age = Number(v.age) || 35;
    const menarche = Number(v.menarche);
    const firstbirth = Number(v.firstbirth);
    const relatives = Number(v.relatives);
    const biopsies = Number(v.biopsies);
    const atypia = !!v.atypia;

    // Упрощённая аппроксимация BCRAT (Gail). Базовый 5-летний риск ~ 1.3%.
    let rr = 1.0;
    rr *= [1.0, 1.10, 1.21][menarche];
    rr *= [1.0, 1.24, 1.55, 1.93][firstbirth];
    rr *= [1.0, 2.1, 3.9][relatives];
    rr *= [1.0, 1.70, 2.88][biopsies];
    if (atypia) rr *= 1.82;

    const base5 = 0.013 + Math.max(0, (age - 50)) * 0.0004;
    const risk5 = Math.min(0.5, rr * base5 * 100);
    const riskLife = Math.min(90, risk5 * (85 - age) / 5 * 0.9);

    let color = '#22C55E';
    let cat = 'Низкий';
    let action = 'Рутинный скрининг по возрасту (MG 1-2 года с 40-50)';

    if (risk5 >= 1.67) {
      color = '#F59E0B';
      cat = 'Повышенный';
      action = 'Кандидат на химиопрофилактику (тамоксифен, ралоксифен, AI); обсудить';
    }
    if (riskLife >= 20) {
      color = '#EF4444';
      cat = 'Высокий';
      action = 'Скрининг МРТ + MG ежегодно; генетическое консультирование';
    }
    if (riskLife >= 30) {
      color = '#7F1D1D';
      cat = 'Очень высокий';
      action = 'Рассмотреть профилактическую мастэктомию / овариэктомию; BRCA тест';
    }

    return {
      value: `${risk5.toFixed(2)}%`,
      unit: '5-летний риск',
      interpretation: `Gail 5-летний риск: ${risk5.toFixed(2)}%, пожизненный ~ ${riskLife.toFixed(0)}%. Категория: ${cat}.`,
      color,
      details: `Возраст ${age} лет. Относительный риск (RR) ≈ ${rr.toFixed(2)}. 5-летний риск ${risk5.toFixed(2)}%, пожизненный (до 85 лет) ≈ ${riskLife.toFixed(0)}%.`,
      actions: [
        action,
        risk5 >= 1.67 ? 'Обсудить тамоксифен 20 мг/сут × 5 лет (пременопауза) или ралоксифен / AI (постменопауза)' : '',
        riskLife >= 20 ? 'МРТ молочных желёз ежегодно + MG в чередовании (ACS 2007)' : '',
        relatives >= 2 || atypia ? 'Направить на Tyrer-Cuzick / BOADICEA — учитывают больше факторов' : '',
        'Образ жизни: физ. активность, снижение алкоголя, нормализация веса',
      ].filter(Boolean),
      caveats: [
        'Gail (BCRAT) — NCI 1989, обновлён для African-American (CARE), азиаток (AABC)',
        'НЕ учитывает: паттерн семейного анамнеза (только число родственников), BRCA, плотность груди, HRT',
        'НЕ применим при: личной истории РМЖ/LCIS/DCIS, лучевой терапии грудной клетки, BRCA+',
        'Для более точной оценки при семейной истории: Tyrer-Cuzick (IBIS), BOADICEA, CanRisk',
        'Порог для химиопрофилактики: 5-летний риск ≥ 1.67% (FDA одобрение тамоксифена)',
        'Порог МРТ-скрининга: пожизненный риск ≥ 20-25% (ACS 2007)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.67, label: '< 1.67%', color: '#22C55E' },
          { min: 1.67, max: 3, label: '1.67-3%', color: '#F59E0B' },
          { min: 3, max: 6, label: '3-6%', color: '#EF4444' },
          { min: 6, max: 10, label: '> 6%', color: '#7F1D1D' },
        ],
        current: risk5,
        unit: '%',
      },
      related: [
        { id: 'brca-models', title: 'BRCA модели' },
        { id: 'nottingham', title: 'Nottingham' },
        { id: 'oncotype', title: 'Oncotype DX' },
        { id: 'birads', title: 'BI-RADS' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
        { id: '311.1', title: 'Лучевая диагностика' },
      ],
    };
  },
  reference: 'Gail MH, Brinton LA, Byar DP et al. Projecting individualized probabilities of developing breast cancer for white females who are being examined annually. J Natl Cancer Inst 1989;81:1879-86.',
  countries: 'Международный (NCI, USPSTF, NCCN)',
  presets: [
    { label: 'Низкий', values: { age: 40, menarche: '0', firstbirth: '1', relatives: '0', biopsies: '0', atypia: false } },
    { label: 'Повышенный', values: { age: 55, menarche: '2', firstbirth: '3', relatives: '1', biopsies: '1', atypia: false } },
    { label: 'Высокий', values: { age: 60, menarche: '2', firstbirth: '3', relatives: '2', biopsies: '2', atypia: true } },
  ],
  info: `### Для чего используется
**Gail Model / BCRAT (Breast Cancer Risk Assessment Tool)** — модель NCI для оценки индивидуального 5-летнего и пожизненного риска инвазивного РМЖ у женщин ≥ 35 лет.

### Компоненты
- Возраст
- Возраст менархе
- Возраст первых родов (или нерожавшая)
- Родственники 1 степени с РМЖ (мать, сестра, дочь)
- Число биопсий молочной железы
- Атипическая гиперплазия в биопсии
- Раса / этничность

### Интерпретация
| Категория | 5-летний риск | Тактика |
|---|---|---|
| Низкий | < 1.67% | Рутинный скрининг |
| Повышенный | ≥ 1.67% | Химиопрофилактика (опция) |
| Высокий (пож.) | ≥ 20% | МРТ + MG ежегодно |

### Порог химиопрофилактики (FDA)
- **5-летний риск ≥ 1.67%** — кандидат на:
  - **Тамоксифен 20 мг/сут × 5 лет** (пременопауза)
  - **Ралоксифен 60 мг/сут** (постменопауза)
  - **Аромат. ингибиторы** (эксеместан, анастрозол — MAP.3, IBIS-II)

### Ограничения Gail
- НЕ учитывает: паттерн семейного анамнеза (возраст дебюта, отцовская линия, яичники)
- НЕ учитывает: BRCA1/2, TP53, PALB2
- НЕ учитывает: плотность груди (MG), HRT, кормление грудью
- Недооценивает риск у женщин с сильной семейной историей

### Альтернативы
| Модель | Когда использовать |
|---|---|
| **Tyrer-Cuzick (IBIS)** | Сильная семейная история |
| **BOADICEA / CanRisk** | BRCA + полигенные факторы |
| **Claus** | Только семейный анамнез |
| **BRCAPRO** | Оценка BRCA мутации |`,
};
export default runner;

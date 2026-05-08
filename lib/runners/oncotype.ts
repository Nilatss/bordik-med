/** Runner: oncotype */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'test',
      label: 'Молекулярный тест',
      type: 'select',
      options: [
        { value: 'oncotype', label: 'Oncotype DX (RS, 0-100)' },
        { value: 'mammaprint', label: 'MammaPrint (бинарный риск)' },
        { value: 'bci', label: 'Breast Cancer Index (H/I + Proliferation)' },
      ],
    },
    {
      id: 'score',
      label: 'Результат теста',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'балл / категория',
    },
    {
      id: 'age',
      hint: 'Возраст в годах',
      label: 'Возраст',
      type: 'number',
      min: 18,
      max: 100,
      step: 1,
      unit: 'лет',
    },
    {
      id: 'nodal',
      label: 'N-статус',
      type: 'select',
      options: [
        { value: '0', label: 'N0 (ЛУ не поражены)' },
        { value: '1-3', label: 'N+ 1-3 ЛУ' },
        { value: '4+', label: 'N+ ≥ 4 ЛУ' },
      ],
    },
  ],
  compute: (v) => {
    const test = String(v.test);
    const score = Number(v.score);
    const age = Number(v.age);
    const nodal = String(v.nodal);
    const postmeno = age >= 50;

    let risk = '';
    let riskNum = 0;
    let color = '';
    let details = '';
    let actions: string[] = [];

    if (test === 'oncotype') {
      if (nodal === '0') {
        if (score < 11) {
          risk = 'Низкий';
          riskNum = 1;
          color = '#22C55E';
          details = `Oncotype DX RS ${score} (N0). Очень низкий риск рецидива. Химиотерапия НЕ показана. TAILORx: 9-летняя БРВ > 93% только на ET.`;
        } else if (score <= 25) {
          if (postmeno || age > 50) {
            risk = 'Промежуточный (низкий)';
            riskNum = 2;
            color = '#84CC16';
            details = `RS ${score} (N0, постменопауза). TAILORx: химиотерапия НЕ даёт преимущества поверх ET. Рекомендуется только ET.`;
          } else {
            risk = 'Промежуточный';
            riskNum = 2;
            color = '#F59E0B';
            details = `RS ${score} (N0, пременопауза, возраст ≤ 50). TAILORx: в подгруппе RS 16-25 возможна польза от CT + ET. Обсудить с пациенткой.`;
          }
        } else {
          risk = 'Высокий';
          riskNum = 3;
          color = '#EF4444';
          details = `RS ${score} (N0). Высокий риск рецидива. Рекомендуется химиотерапия + эндокринотерапия.`;
        }
      } else if (nodal === '1-3') {
        if (score < 26 && postmeno) {
          risk = 'Низкий';
          riskNum = 1;
          color = '#22C55E';
          details = `RS ${score} (N1, постменопауза). RxPONDER: химиотерапия НЕ даёт преимущества, только ET. Пременопауза — CT обсуждается.`;
        } else {
          risk = 'Высокий';
          riskNum = 3;
          color = '#EF4444';
          details = `RS ${score} (N+). Пременопауза или RS ≥ 26: рекомендуется CT + ET.`;
        }
      } else {
        risk = 'Высокий';
        riskNum = 3;
        color = '#7F1D1D';
        details = 'N ≥ 4: Oncotype DX обычно не используется, показана адъювантная CT + ET.';
      }
    } else if (test === 'mammaprint') {
      if (score === 0 || score === 1) {
        risk = score === 0 ? 'Низкий' : 'Высокий';
        riskNum = score === 0 ? 1 : 3;
        color = score === 0 ? '#22C55E' : '#EF4444';
        details = score === 0
          ? 'MammaPrint: Low risk. MINDACT: 5-летняя DMFS ~ 94% только на ET. CT не показана.'
          : 'MammaPrint: High risk. Рекомендуется CT + ET.';
      } else {
        risk = 'Не определён';
        riskNum = 2;
        color = '#F59E0B';
        details = 'MammaPrint: введите 0 (low) или 1 (high).';
      }
    } else {
      if (score < 5) {
        risk = 'Низкий';
        riskNum = 1;
        color = '#22C55E';
        details = `BCI ${score}. Низкий риск позднего рецидива (5-10 лет). Продление ET не даёт существенной пользы.`;
      } else {
        risk = 'Высокий';
        riskNum = 3;
        color = '#EF4444';
        details = `BCI ${score}. Высокий риск позднего рецидива. Рекомендовано продление ET до 10 лет.`;
      }
    }

    actions = [
      'Обсудить результат с мультидисциплинарным консилиумом',
      riskNum >= 3 ? 'Адъювантная химиотерапия + эндокринотерапия' : 'Эндокринотерапия (тамоксифен / AI)',
      'Контроль побочных эффектов (нейропатия, кардиотоксичность, остеопороз)',
      'Генетическое консультирование при отягощённом анамнезе (BRCA1/2)',
      'Регулярный follow-up: маммография, анамнез, осмотр',
    ];

    return {
      value: risk,
      unit: test === 'oncotype' ? `RS ${score}` : test,
      interpretation: `${test.toUpperCase()}: ${risk} риск`,
      color,
      details,
      actions,
      caveats: [
        'Oncotype DX — 21-gene RT-PCR, для ER+ HER2− N0-N1',
        'TAILORx (2018): RS 11-25 N0 — CT не нужна у постменопаузальных',
        'RxPONDER (2021): RS ≤ 25 N1 постменопауза — CT не даёт преимущества',
        'MammaPrint (70-gene) — MINDACT: для клинически high-risk / genomic low-risk можно избежать CT',
        'BCI (HOXB13/IL17BR + пролиферация) — для решения о продлении ET свыше 5 лет',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'Низкий', color: '#22C55E' },
          { min: 2, max: 3, label: 'Средний', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Высокий', color: '#EF4444' },
        ],
        current: riskNum,
        unit: 'risk',
      },
      related: [
        { id: 'nottingham', title: 'Nottingham grade' },
        { id: 'npi-breast', title: 'NPI (breast)' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Sparano JA et al. Adjuvant Chemotherapy Guided by a 21-Gene Expression Assay in Breast Cancer (TAILORx). N Engl J Med 2018;379:111-121. Cardoso F et al. 70-Gene Signature as an Aid to Treatment Decisions in Early-Stage Breast Cancer (MINDACT). N Engl J Med 2016;375:717-729.',
  countries: 'Международный (ASCO / NCCN / ESMO)',
  presets: [
    { label: 'Oncotype RS 10 N0', values: { test: 'oncotype', score: 10, age: 55, nodal: '0' } },
    { label: 'Oncotype RS 20 N0 постмено', values: { test: 'oncotype', score: 20, age: 60, nodal: '0' } },
    { label: 'MammaPrint High', values: { test: 'mammaprint', score: 1, age: 48, nodal: '0' } },
  ],
  info: `### Для чего используется
**Молекулярные тесты при раке молочной железы** — прогностические и предиктивные тесты для решения о **необходимости адъювантной химиотерапии** у пациенток с ER+ HER2− инвазивным раком ранних стадий.

### Oncotype DX (21-gene RT-PCR)
| RS | Категория | Тактика |
|---|---|---|
| **< 11** | Низкий | Только ET |
| **11-25** | Промежуточный | TAILORx: CT не нужна (постменопауза); пременопауза с RS 16-25 — CT обсуждается |
| **≥ 26** | Высокий | CT + ET |

- **TAILORx** (Sparano 2018, NEJM) — RS 11-25 N0: нет пользы от CT в постменопаузе
- **RxPONDER** (2021) — RS ≤ 25 N+ (1-3 ЛУ) постменопауза: CT не нужна

### MammaPrint (70-gene signature)
- Бинарный результат: Low risk / High risk
- **MINDACT** (Cardoso 2016, NEJM): genomic Low + clinical High → можно избежать CT (5-летняя DMFS 94.7% только на ET)

### Breast Cancer Index (BCI)
- Предсказывает **поздний рецидив** (5-10 лет) у ER+ инвазивных карцином
- Решение о **продлении ET** до 10 лет (aBCSG-8, MA.17)

### Prosigna (PAM50) / EndoPredict
- Альтернативы Oncotype и MammaPrint
- Определение внутреннего подтипа: Luminal A, Luminal B, HER2-enriched, Basal-like

### Кому назначать
| Признак | Тест |
|---|---|
| ER+ HER2− N0 | **Oncotype DX** |
| ER+ HER2− N1 (1-3 ЛУ) | Oncotype DX (RxPONDER) |
| Clinically high-risk ER+ | MammaPrint (MINDACT) |
| ER+ после 5 лет ET | BCI (продление ET) |

### Молекулярные подтипы (IHC приближение)
| Подтип | Ki-67 | Прогноз |
|---|---|---|
| **Luminal A** | < 14% | Отлично |
| **Luminal B** | > 14% | Промежуточный |
| **HER2-enriched** | варьирует | Хороший при anti-HER2 |
| **Basal-like (TNBC)** | обычно > 30% | Агрессивный |

### Ограничения
- Не применяется при HER2+ (нужен trastuzumab)
- Не для TNBC (ER−/PR−/HER2−)
- Дорого (~ $3-4К за тест)
- Результат зависит от качества биоматериала`,
};
export default runner;

// @ts-nocheck
/** Runner: mayo-uc — Mayo / Partial Mayo / Truelove-Witts для язвенного колита */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'mayo', label: 'Mayo Score (0–12) — 4 компонента' },
        { value: 'partial', label: 'Partial Mayo (0–9) — без эндоскопии' },
        { value: 'tw', label: 'Truelove-Witts — тяжёлое обострение' },
      ],
    },
    { id: 'stool', label: 'Частота стула (над обычным)', type: 'select', options: [
      { value: '0', label: '= обычная (0)' },
      { value: '1', label: '1–2 стула выше обычного (1)' },
      { value: '2', label: '3–4 выше (2)' },
      { value: '3', label: '≥ 5 выше (3)' },
    ] },
    { id: 'blood', label: 'Ректальное кровотечение', type: 'select', options: [
      { value: '0', label: 'Нет (0)' },
      { value: '1', label: 'Прожилки < 50% дефекаций (1)' },
      { value: '2', label: 'Явная кровь в большинстве (2)' },
      { value: '3', label: 'Чистая кровь (3)' },
    ] },
    { id: 'endo', label: 'Эндоскопия (только для Mayo)', type: 'select', options: [
      { value: '0', label: 'Норма / ремиссия (0)' },
      { value: '1', label: 'Лёгкая (эритема, сниженный сосудистый рисунок) (1)' },
      { value: '2', label: 'Умеренная (эрозии, кровоточивость) (2)' },
      { value: '3', label: 'Тяжёлая (спонтанное кровотечение, изъязвления) (3)' },
    ] },
    { id: 'pga', label: 'Physician Global Assessment', type: 'select', options: [
      { value: '0', label: 'Норма (0)' },
      { value: '1', label: 'Лёгкая (1)' },
      { value: '2', label: 'Умеренная (2)' },
      { value: '3', label: 'Тяжёлая (3)' },
    ] },
    { id: 'tw', label: 'Truelove-Witts: severe-критерии', type: 'select', options: [
      { value: 'mild', label: 'Лёгкая: < 4 стулов/сут, без системных признаков' },
      { value: 'moderate', label: 'Средняя: 4–6 стулов/сут, минимальные признаки' },
      { value: 'severe', label: 'Тяжёлая: ≥ 6 кровавых стулов/сут + T > 37,8 ИЛИ HR > 90 ИЛИ Hb < 105 ИЛИ ESR > 30' },
    ] },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    const stool = Number(v.stool) || 0;
    const blood = Number(v.blood) || 0;
    const endo = Number(v.endo) || 0;
    const pga = Number(v.pga) || 0;

    if (tool === 'tw') {
      const tw = String(v.tw);
      const map: Record<string, { c: string; txt: string }> = {
        mild: { c: '#22C55E', txt: 'Лёгкая атака — амбулаторно, 5-ASA PO/топически' },
        moderate: { c: '#F59E0B', txt: 'Средняя — ГКС PO (преднизолон 40 мг) или будесонид MMX' },
        severe: { c: '#991B1B', txt: 'Тяжёлая (ACG definition): госпитализация, IV метилпреднизолон 60 мг/сут, VTE профилактика, rescue therapy (инфликсимаб/циклоспорин) к дню 3, колэктомия при неудаче' },
      };
      const r = map[tw] || map.mild;
      return {
        value: tw === 'severe' ? 'Severe UC' : tw === 'moderate' ? 'Moderate' : 'Mild',
        unit: '',
        interpretation: r.txt,
        color: r.c,
        details: 'Truelove SC, Witts LJ. BMJ 1955;2:1041. Классические критерии — до сих пор золотой стандарт для "severe UC" согласно ACG/ECCO.',
        actions: tw === 'severe' ? [
          'IV hydrocortisone 100 мг × 4 или methylprednisolone 60 мг/сут',
          'LMWH — профилактика ВТЭ (высокий риск)',
          'Gastro консилиум, колоректальный хирург',
          'Оценка ответа на день 3 (Oxford criteria: > 8 стулов или CRP > 45 — rescue)',
          'Rescue: инфликсимаб 5 мг/кг ИЛИ циклоспорин 2 мг/кг IV',
          'Колэктомия при мегаколоне, перфорации, неудаче rescue к дню 7',
        ] : [
          'Лёгкая: 5-ASA PO 2,4–4,8 г/сут ± местно (мезалазин клизмы/свечи)',
          'Средняя: преднизолон PO 40 мг/сут, тапер; биологик при неудаче',
          'Поддержка: 5-ASA, AZA/6-MP, анти-TNF, ведолизумаб, тофацитиниб',
        ],
        caveats: [
          'ACG 2019: severe UC требует немедленной госпитализации',
          'Fulminant UC: > 10 стулов/сут, кровотечение, токсичность, растяжение — показание к колэктомии',
          'Toxic megacolon — поперечно-ободочная кишка > 6 см + системная токсичность',
        ],
        related: [
          { id: 'cdai', title: 'CDAI/Harvey-Bradshaw (Crohn)' },
        ],
        relatedCourses: [
          { id: '301.5', title: 'Гастроэнтерология' },
        ],
      };
    }
    const score = tool === 'partial' ? stool + blood + pga : stool + blood + endo + pga;
    let interp = '', color = '#22C55E';
    if (tool === 'partial') {
      if (score <= 2) { interp = 'Ремиссия (Partial Mayo ≤ 2)'; color = '#22C55E'; }
      else if (score <= 4) { interp = 'Лёгкая активность'; color = '#84CC16'; }
      else if (score <= 6) { interp = 'Умеренная активность'; color = '#F59E0B'; }
      else { interp = 'Тяжёлая активность'; color = '#EF4444'; }
    } else {
      if (score <= 2) { interp = 'Ремиссия (Mayo ≤ 2, каждый компонент ≤ 1)'; color = '#22C55E'; }
      else if (score <= 5) { interp = 'Лёгкая активность (Mayo 3–5)'; color = '#84CC16'; }
      else if (score <= 10) { interp = 'Умеренная (Mayo 6–10)'; color = '#F59E0B'; }
      else { interp = 'Тяжёлая (Mayo 11–12)'; color = '#EF4444'; }
    }
    return {
      value: String(score),
      unit: 'баллов',
      interpretation: interp,
      color,
      details: 'Mayo Score (Schroeder KW, Tremaine WJ, Ilstrup DM. N Engl J Med 1987;317:1625). Клинический ответ: снижение ≥ 3 и ≥ 30% от базального + уменьшение blood ≥ 1 балл. Mucosal healing: endoscopic subscore ≤ 1.',
      actions: [
        'Ремиссия: поддерживающая терапия 5-ASA ≥ 2 г/сут',
        'Лёгкая/средняя: escalate (топические ГКС, биологик)',
        'Тяжёлая: госпитализация, Truelove-Witts для оценки severe UC',
      ],
      caveats: [
        'Partial Mayo — для мониторинга без колоноскопии',
        'UCEIS — альтернатива эндоскопической части (Travis 2013)',
        'Modified Mayo (без PGA) — используется в RCT (e.g. U-ACHIEVE для upadacitinib)',
      ],
      related: [
        { id: 'cdai', title: 'CDAI / Harvey-Bradshaw' },
      ],
      relatedCourses: [
        { id: '301.5', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Schroeder KW, Tremaine WJ, Ilstrup DM. Coated oral 5-aminosalicylic acid therapy for mildly to moderately active ulcerative colitis. N Engl J Med 1987;317:1625–9. Truelove SC, Witts LJ. Cortisone in ulcerative colitis. BMJ 1955;2:1041–8.',
  countries: 'Международный (ACG 2019, ECCO 2022)',
  presets: [
    { label: 'Ремиссия Mayo 1', values: { tool: 'mayo', stool: '0', blood: '0', endo: '0', pga: '1' } },
    { label: 'Умеренная Mayo 7', values: { tool: 'mayo', stool: '2', blood: '2', endo: '1', pga: '2' } },
    { label: 'Тяжёлая Mayo 11', values: { tool: 'mayo', stool: '3', blood: '3', endo: '3', pga: '2' } },
    { label: 'Severe Truelove-Witts', values: { tool: 'tw', tw: 'severe' } },
  ],
  info: `### Для чего используется
Шкалы активности **язвенного колита (UC)**. Применяются для классификации тяжести, принятия решения о эскалации терапии и оценки ответа в RCT.

### Mayo Score (Schroeder 1987) — 0–12
| Компонент | Баллы |
|---|---|
| Stool frequency | 0–3 |
| Rectal bleeding | 0–3 |
| Endoscopic findings | 0–3 |
| Physician Global Assessment (PGA) | 0–3 |

### Интерпретация Mayo
| Score | Активность |
|---|---|
| 0–2 (каждый ≤ 1) | Ремиссия |
| 3–5 | Лёгкая |
| 6–10 | Умеренная |
| 11–12 | Тяжёлая |

**Mucosal healing** (ключевая цель) = endoscopic subscore ≤ 1.

### Partial Mayo (без эндоскопии) — 0–9
Удобен для мониторинга между колоноскопиями.

### Truelove-Witts (1955) — Severe UC
| Критерий | Порог |
|---|---|
| Stools | ≥ 6 кровавых/сут |
| Температура | > 37,8 °C |
| HR | > 90 bpm |
| Hb | < 105 г/л |
| ESR | > 30 мм/ч |

**Severe** = ≥ 6 кровавых стулов + ≥ 1 системный критерий. ACG guideline 2019 сохраняет эти критерии.

### Ведение severe UC (ACG 2019)
1. Госпитализация + IV кортикостероиды 48–72 ч
2. Оценка ответа на день 3: Oxford criteria (> 8 стулов ИЛИ 3–8 стулов + CRP > 45) → rescue
3. Rescue: **инфликсимаб 5 мг/кг** или **циклоспорин 2 мг/кг**
4. Колэктомия при неудаче rescue к дню 7 или осложнениях (мегаколон, перфорация)

### Альтернативные шкалы
- **UCEIS** (Travis 2013) — эндоскопический сабскор 0–8
- **Modified Mayo** — без PGA, используется в RCT
- **SCCAI** (Walmsley 1998) — 0–19

### Источники
Schroeder KW et al. *NEJM* 1987;317:1625. Truelove SC, Witts LJ. *BMJ* 1955;2:1041. Rubin DT et al. ACG guideline UC. *Am J Gastroenterol* 2019;114:384.
`,
};

export default runner;

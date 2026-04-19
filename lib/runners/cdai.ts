// @ts-nocheck
/** Runner: cdai — Harvey-Bradshaw / CDAI для болезни Крона */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'hbi', label: 'Harvey-Bradshaw Index (1980) — 5 пунктов, быстрый' },
        { value: 'cdai', label: 'CDAI (Best 1976) — 8 параметров, взвешенные' },
      ],
    },
    { id: 'score', label: 'Итоговый балл (суммируйте вручную)', type: 'number', min: 0, max: 600, step: 1, quickValues: [0, 4, 8, 150, 220, 450] },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    const score = Number(v.score);
    let interp = '', color = '#22C55E', details = '';
    if (tool === 'hbi') {
      if (score < 5) { interp = 'Ремиссия (HBI < 5)'; color = '#22C55E'; }
      else if (score <= 7) { interp = 'Лёгкая активность (HBI 5–7)'; color = '#84CC16'; }
      else if (score <= 16) { interp = 'Умеренная (HBI 8–16)'; color = '#F59E0B'; }
      else { interp = 'Тяжёлая (HBI > 16)'; color = '#EF4444'; }
      details = 'Harvey-Bradshaw Index (Harvey RF, Bradshaw JM. Lancet 1980;1:514). 5 пунктов: general wellbeing (0–4), abdominal pain (0–3), liquid stools/day (counts), abdominal mass (0–3), complications (arthralgia, uveitis, E. nodosum, aphthous, P. gangrenosum, anal fissure, new fistula, abscess — по 1 баллу каждая).';
    } else {
      if (score < 150) { interp = 'Ремиссия (CDAI < 150)'; color = '#22C55E'; }
      else if (score <= 220) { interp = 'Лёгкая активность (CDAI 150–220)'; color = '#84CC16'; }
      else if (score <= 450) { interp = 'Умеренная (CDAI 220–450)'; color = '#F59E0B'; }
      else { interp = 'Тяжёлая (CDAI > 450)'; color = '#EF4444'; }
      details = 'CDAI (Best WR, Becktel JM, Singleton JW, Kern F. Gastroenterology 1976;70:439). 8 взвешенных параметров за 7 дней: liquid stools × 2, abdominal pain × 5, general wellbeing × 7, complications × 20, antidiarrheal use × 30, mass × 10, Hct deviation × 6, body weight deviation × 1.';
    }
    return {
      value: String(score),
      unit: 'баллов',
      interpretation: interp,
      color,
      details,
      actions: [
        'Ремиссия: поддержка (AZA/6-MP, метотрексат, анти-TNF при перенесённой тяжёлой атаке)',
        'Лёгкая: будесонид MMX 9 мг или 5-ASA (эффективность спорная при CD)',
        'Умеренная: преднизолон 40 мг PO ± иммуномодулятор или биологик (анти-TNF, устекинумаб, ведолизумаб)',
        'Тяжёлая: госпитализация, IV ГКС, биологик, хирургия при стриктуре/свищах/абсцессе',
        'Fistulizing CD — инфликсимаб + сетон, MRI малого таза для перианальной CD',
      ],
      caveats: [
        'CDAI не учитывает эндоскопическую активность (использовать SES-CD или CDEIS)',
        'HBI коррелирует с CDAI (r ≈ 0,93), предпочтителен в клинике',
        'Клинический ответ: снижение CDAI ≥ 70 (или ≥ 100 в строгих критериях), HBI ≥ 3',
        'Эндоскопическая ремиссия — ключевая цель (STRIDE-II 2021): SES-CD < 3',
        'Транс-муральное заживление — новая цель (MR enterography, ИКМ)',
      ],
      related: [
        { id: 'mayo-uc', title: 'Mayo / Truelove-Witts (UC)' },
      ],
      relatedCourses: [
        { id: '301.5', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Best WR, Becktel JM, Singleton JW, Kern F. Development of a Crohn\'s disease activity index. Gastroenterology 1976;70:439–44. Harvey RF, Bradshaw JM. A simple index of Crohn\'s-disease activity. Lancet 1980;1:514.',
  countries: 'Международный (ECCO 2020, ACG 2018, STRIDE-II 2021)',
  presets: [
    { label: 'Ремиссия HBI 3', values: { tool: 'hbi', score: 3 } },
    { label: 'Умеренная HBI 10', values: { tool: 'hbi', score: 10 } },
    { label: 'Ремиссия CDAI 120', values: { tool: 'cdai', score: 120 } },
    { label: 'Умеренная CDAI 300', values: { tool: 'cdai', score: 300 } },
    { label: 'Тяжёлая CDAI 500', values: { tool: 'cdai', score: 500 } },
  ],
  info: `### Для чего используется
Шкалы активности **болезни Крона (CD)**. CDAI — золотой стандарт RCT, HBI — клиническая практика.

### Harvey-Bradshaw Index (HBI) — 0–∞
| Пункт | Шкала |
|---|---|
| General wellbeing | 0 (very well) — 4 (terrible) |
| Abdominal pain | 0–3 |
| Liquid stools/day | Количество (1 балл за каждый) |
| Abdominal mass | 0–3 |
| Complications | 1 балл × каждый: arthralgia, uveitis, E. nodosum, aphthous, P. gangrenosum, anal fissure, new fistula, abscess |

| HBI | Активность |
|---|---|
| < 5 | Ремиссия |
| 5–7 | Лёгкая |
| 8–16 | Умеренная |
| > 16 | Тяжёлая |

### CDAI (Best 1976) — взвешенный, за 7 дней
| Параметр | Weight |
|---|---|
| Liquid stools (sum 7d) | × 2 |
| Abdominal pain (sum, 0–3/d) | × 5 |
| General wellbeing (sum, 0–4/d) | × 7 |
| Complications (8 категорий, по 1) | × 20 |
| Antidiarrheal use | × 30 |
| Mass | × 10 (0 / 2 / 5) |
| Hct deviation | × 6 |
| Weight deviation (%) | × 1 |

| CDAI | Активность |
|---|---|
| < 150 | Ремиссия |
| 150–220 | Лёгкая |
| 220–450 | Умеренная |
| > 450 | Тяжёлая |

### Цели (STRIDE-II 2021)
1. **Clinical remission** — отсутствие симптомов
2. **Biomarker remission** — CRP норма, кальпротектин < 250
3. **Endoscopic remission** — SES-CD < 3 или CDEIS
4. **Transmural healing** — MRI энтерография без активности

### Тактика
- **Лёгкая**: будесонид 9 мг, 5-ASA (слабый эффект)
- **Умеренная**: преднизолон 40 мг + AZA/6-MP / анти-TNF / устекинумаб / ведолизумаб / рисанкизумаб
- **Тяжёлая**: IV ГКС, биологик индукция, хирургия при осложнениях
- **Фистулы**: инфликсимаб + сетон, MRI малого таза

### Источники
Best WR et al. *Gastroenterology* 1976;70:439. Harvey RF, Bradshaw JM. *Lancet* 1980;1:514. Turner D et al. STRIDE-II. *Gastroenterology* 2021;160:1570.
`,
};

export default runner;

/** Runner: bcs */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид',
      type: 'select',
      options: [
        { value: 'dog', label: 'Собака' },
        { value: 'cat', label: 'Кошка' },
      ],
    },
    {
      id: 'score',
      label: 'BCS (1-9)',
      type: 'number',
      min: 1,
      max: 9,
      step: 1,
      hint: '1-3 истощение; 4-5 идеал; 6-7 лишний вес; 8-9 ожирение',
      quickValues: [1, 3, 5, 7, 9],
    },
    {
      id: 'weight',
      hint: 'Вес в кг (без одежды)',
      label: 'Текущая масса (кг)',
      type: 'number',
      unit: 'кг',
    },
  ],
  compute: (v) => {
    const bcs = Math.max(1, Math.min(9, Number(v.score) || 5));
    const w = Number(v.weight) || 0;
    const sp = String(v.species);

    let color = '#22C55E';
    let cat = 'Идеальная форма';
    let target = w;
    let adj = 0;
    if (bcs <= 3) {
      color = '#F59E0B'; cat = 'Недостаточный вес';
      adj = +(w * ((5 - bcs) * 0.10)).toFixed(1);
      target = +(w + adj).toFixed(1);
    } else if (bcs >= 8) {
      color = '#991B1B'; cat = 'Ожирение';
      adj = -+(w * ((bcs - 5) * 0.10)).toFixed(1);
      target = +(w + adj).toFixed(1);
    } else if (bcs >= 6) {
      color = '#F59E0B'; cat = 'Избыточный вес';
      adj = -+(w * ((bcs - 5) * 0.10)).toFixed(1);
      target = +(w + adj).toFixed(1);
    }

    return {
      value: `${bcs} / 9`,
      unit: cat,
      interpretation: `BCS ${bcs}/9 — ${cat}${w > 0 ? ` · цель ${target} кг` : ''}`,
      color,
      details: `WSAVA 9-point BCS для ${sp === 'cat' ? 'кошек' : 'собак'}.\nТекущая масса: ${w || '—'} кг\nЦелевая масса (BCS 5): ${target} кг\nКоррекция: ${adj >= 0 ? '+' : ''}${adj} кг`,
      actions: [
        bcs <= 3 ? 'Исключить паразитоз, ЖКТ-заболевания, онкологию, гипертиреоз (коты)' : '',
        bcs <= 3 ? 'Калорийная диета: RER × 1,2-1,4, мелкие частые порции' : '',
        bcs >= 6 ? 'Снижение калорий до RER × 0,8 (целевой вес) + лечебный корм' : '',
        bcs >= 6 ? 'Цель: снижение 1-2 % массы / нед (собаки), 0,5-1 % / нед (коты)' : '',
        bcs >= 8 ? 'Исключить гипотиреоз (собаки), гиперадренокортицизм, СД' : '',
        'Взвешивание каждые 2-4 недели, контроль BCS 1×/мес',
      ].filter(Boolean),
      caveats: [
        'BCS субъективен — межрейтерская вариабельность ~ 1 балл',
        'Породоспецифичные особенности (например, борзые — природный BCS 3-4)',
        'Мышечная масса оценивается отдельно (MCS — Muscle Condition Score)',
        'У кошек «primordial pouch» (брюшной мешок) — норма, не ожирение',
        '1 единица BCS ≈ 10-15 % от идеальной массы',
      ],
      scale: {
        segments: [
          { min: 1, max: 3, label: 'Истощение', color: '#991B1B' },
          { min: 3, max: 4, label: 'Худой', color: '#F59E0B' },
          { min: 4, max: 6, label: 'Идеал', color: '#22C55E' },
          { min: 6, max: 8, label: 'Лишний вес', color: '#F59E0B' },
          { min: 8, max: 10, label: 'Ожирение', color: '#991B1B' },
        ],
        current: bcs,
        unit: 'BCS',
      },
      related: [
        { id: 'rer', title: 'RER / DER (энергия)' },
        { id: 'purina-fediaf', title: 'Purina · FEDIAF' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'WSAVA Global Nutrition Committee. Body Condition Score (9-point). 2013.',
  countries: 'Международный (WSAVA)',
  presets: [
    { label: 'Истощённый кот 3 кг', values: { species: 'cat', score: 2, weight: 3 } },
    { label: 'Идеал — лабрадор 30 кг', values: { species: 'dog', score: 5, weight: 30 } },
    { label: 'Ожирение — такса 12 кг', values: { species: 'dog', score: 8, weight: 12 } },
  ],
  info: `### Для чего используется
**WSAVA 9-point Body Condition Score** — стандарт визуально-пальпаторной оценки упитанности собак и кошек. Каждый балл ≈ 10-15 % отклонения от идеального веса.

### Шкала
| BCS | Категория | Признаки |
|---|---|---|
| 1-2 | Истощение | Рёбра/позвоночник видны, нет жира |
| 3 | Худой | Рёбра легко пальпируются, талия выражена |
| 4-5 | **Идеал** | Рёбра пальпируются, талия видна сверху |
| 6 | Лишний вес | Рёбра с трудом, талия не видна |
| 7 | Избыточный | Рёбра не пальпируются, жировые отложения |
| 8-9 | Ожирение | Толстый жировой слой, живот отвисает |

### Расчёт целевой массы
Целевая = Текущая × (1 − (BCS − 5) × 0,10)
- BCS 7 у собаки 30 кг → цель 30 × 0,80 = **24 кг**
- BCS 3 у кота 3 кг → цель 3 × 1,20 = **3,6 кг**

### Скорость коррекции
- **Похудение:** 1-2 %/нед (собаки), 0,5-1 %/нед (коты — риск печёночного липидоза!)
- **Набор:** до 2 %/нед, калорийная пища, исключить причину

### Ограничения
- Породоспецифика (хаски, борзые)
- Мышечная масса — отдельно (MCS 0-3)
- Беременность / лактация — BCS нерелевантен`,
};
export default runner;

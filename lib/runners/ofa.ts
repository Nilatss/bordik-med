/** Runner: ofa */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'joint',
      label: 'Сустав',
      type: 'select',
      options: [
        { value: 'hip', label: 'Тазобедренный (HD)' },
        { value: 'elbow', label: 'Локтевой (ED)' },
      ],
    },
    {
      id: 'grade',
      label: 'Степень OFA',
      type: 'select',
      options: [
        { value: 'excellent', label: 'Excellent (HD)' },
        { value: 'good',      label: 'Good (HD)' },
        { value: 'fair',      label: 'Fair (HD)' },
        { value: 'borderline',label: 'Borderline (HD)' },
        { value: 'mild',      label: 'Mild dysplasia' },
        { value: 'moderate',  label: 'Moderate dysplasia' },
        { value: 'severe',    label: 'Severe dysplasia' },
        { value: 'ed0',       label: 'ED grade 0 (норма)' },
        { value: 'ed1',       label: 'ED grade 1 (< 2 мм остеофит)' },
        { value: 'ed2',       label: 'ED grade 2 (2-5 мм)' },
        { value: 'ed3',       label: 'ED grade 3 (> 5 мм)' },
      ],
    },
  ],
  compute: (v) => {
    const j = String(v.joint);
    const g = String(v.grade);

    const hipMap: Record<string, { col: string; cat: string; breed: string; det: string }> = {
      excellent:  { col: '#22C55E', cat: 'Норма — высший класс', breed: 'Можно использовать в разведении', det: 'Плотная конгруэнтность, глубокая ямка' },
      good:       { col: '#22C55E', cat: 'Норма — хорошо',       breed: 'Можно в разведении',             det: 'Хорошая конгруэнтность' },
      fair:       { col: '#22C55E', cat: 'Норма — минимально',   breed: 'Разведение допустимо с ограничениями', det: 'Неглубокая ямка, но без дисплазии' },
      borderline: { col: '#F59E0B', cat: 'Пограничный',          breed: 'Повтор через 6 мес',           det: 'Нет чётких признаков, требуется переоценка' },
      mild:       { col: '#F59E0B', cat: 'Лёгкая дисплазия',     breed: 'ИСКЛЮЧИТЬ из разведения',      det: 'Подвывих ≤ 25 %, лёгкие остеофиты' },
      moderate:   { col: '#EF4444', cat: 'Умеренная дисплазия',  breed: 'ИСКЛЮЧИТЬ',                    det: 'Подвывих 25-50 %, остеофиты' },
      severe:     { col: '#991B1B', cat: 'Тяжёлая дисплазия',    breed: 'ИСКЛЮЧИТЬ',                    det: 'Вывих, тяжёлые изменения, коксартроз' },
    };
    const edMap: Record<string, { col: string; cat: string; det: string }> = {
      ed0: { col: '#22C55E', cat: 'ED 0 — норма',      det: 'Без остеофитов' },
      ed1: { col: '#F59E0B', cat: 'ED 1 — лёгкая',      det: 'Остеофиты < 2 мм (чаще на anconeus)' },
      ed2: { col: '#EF4444', cat: 'ED 2 — умеренная',   det: 'Остеофиты 2-5 мм' },
      ed3: { col: '#991B1B', cat: 'ED 3 — тяжёлая',     det: 'Остеофиты > 5 мм, фрагментация' },
    };

    let color = '#22C55E';
    let cat = '—';
    let det = '';
    let actions: string[] = [];

    if (j === 'hip' && hipMap[g]) {
      const m = hipMap[g];
      color = m.col; cat = m.cat; det = m.det;
      actions = [
        m.breed,
        ['mild','moderate','severe'].includes(g) ? 'НПВС (карпрофен / мелоксикам), контроль веса' : '',
        ['moderate','severe'].includes(g) ? 'Рассмотреть TPO (молодые) / THR (старшие) / FHO' : '',
        g === 'severe' ? 'Хирургическая консультация — полная замена сустава' : '',
        'CBPI для мониторинга боли при прогрессии',
      ].filter(Boolean);
    } else if (j === 'elbow' && edMap[g]) {
      const m = edMap[g];
      color = m.col; cat = m.cat; det = m.det;
      actions = [
        g === 'ed0' ? 'Допуск к разведению' : 'ИСКЛЮЧИТЬ из разведения',
        g !== 'ed0' ? 'Артроскопия для диагностики FCP / OCD / UAP' : '',
        g !== 'ed0' ? 'НПВС, контроль веса, физиотерапия' : '',
        g === 'ed3' ? 'PAUL-остеотомия / артродез при тяжёлой прогрессии' : '',
      ].filter(Boolean);
    }

    return {
      value: cat.split(' ')[0] || g.toUpperCase(),
      unit: j === 'hip' ? 'HD grade' : 'ED grade',
      interpretation: `${cat} — ${det}`,
      color,
      details: det,
      actions,
      caveats: [
        'OFA оценка с 24 мес (до — предварительная, не окончательная)',
        'PennHIP даёт количественную оценку (DI — distraction index) — дополняет OFA',
        'FCI использует A-E (A = excellent, E = severe)',
        'BVA/KC (UK) — балльная система 0-106 (0 = идеал)',
        'Не все диспластичные собаки клинически больны — генетическая наследуемость ~ 25-40 %',
      ],
      related: [
        { id: 'cbpi', title: 'CBPI (хр. боль)' },
        { id: 'acvim', title: 'ACVIM' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Orthopedic Foundation for Animals (OFA). Hip Dysplasia Grading Scheme. Columbia, MO; established 1966.',
  countries: 'США (OFA)',
  presets: [
    { label: 'HD Excellent', values: { joint: 'hip', grade: 'excellent' } },
    { label: 'HD Moderate', values: { joint: 'hip', grade: 'moderate' } },
    { label: 'ED 2', values: { joint: 'elbow', grade: 'ed2' } },
  ],
  info: `### Для чего используется
**OFA (Orthopedic Foundation for Animals)** — американская система радиографической оценки дисплазий суставов у собак. Используется для отбора в разведении и клинической оценки.

### HD (тазобедренный)
| Степень | Характеристика | Разведение |
|---|---|---|
| Excellent | Идеальная конгруэнтность | ✅ |
| Good | Хорошая | ✅ |
| Fair | Минимально норма | ⚠ Допуск с ограничениями |
| Borderline | Пограничный | Повтор 6 мес |
| Mild | Лёгкая дисплазия | ❌ |
| Moderate | Умеренная | ❌ |
| Severe | Тяжёлая (вывих) | ❌ |

### ED (локтевой, IEWG)
| Grade | Остеофиты |
|---|---|
| 0 | Нет — норма |
| 1 | < 2 мм |
| 2 | 2-5 мм |
| 3 | > 5 мм / фрагментация |

### Альтернативы
- **PennHIP** — количественный DI (distraction index); < 0,3 = норма
- **FCI (Европа)** — A / B / C / D / E
- **BVA/KC (UK)** — 0-106 (0 = идеал, 53 среднее)

### Клиническое применение
- Скрининг для разведения (с 24 мес)
- Диагностика при хромоте
- Оценка прогрессии ОА
- Планирование хирургии (TPO, THR, FHO)

### Источник
OFA.org (Columbia, MO) · IEWG (International Elbow Working Group).`,
};
export default runner;

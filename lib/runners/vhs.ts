// @ts-nocheck
/** Runner: vhs */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид / порода',
      type: 'select',
      options: [
        { value: 'dog', label: 'Собака (норма 9,2-10,2)' },
        { value: 'ckcs', label: 'Cavalier KC Spaniel (норма ≤ 10,8)' },
        { value: 'bd', label: 'Бульдог / боксёр (норма ≤ 12,7)' },
        { value: 'wolfhound', label: 'Борзая / ирландский волкодав (норма ≤ 11,5)' },
        { value: 'cat', label: 'Кошка (норма ≤ 8,0)' },
      ],
    },
    { id: 'long',  label: 'Длинная ось сердца (в позвонках)', type: 'number', min: 3, max: 15, step: 0.1, hint: 'От карины до апекса, счёт с T4' },
    { id: 'short', label: 'Короткая ось сердца (в позвонках)', type: 'number', min: 2, max: 12, step: 0.1, hint: 'Перпендикулярно длинной оси, счёт с T4' },
  ],
  compute: (v) => {
    const sp = String(v.species);
    const L = Number(v.long) || 0;
    const S = Number(v.short) || 0;
    const vhs = +(L + S).toFixed(1);

    const norms: Record<string, { max: number; range: string }> = {
      dog:       { max: 10.5, range: '9,2-10,2' },
      ckcs:      { max: 10.8, range: '≤ 10,8' },
      bd:        { max: 12.7, range: '≤ 12,7' },
      wolfhound: { max: 11.5, range: '≤ 11,5' },
      cat:       { max: 8.0,  range: '≤ 8,0' },
    };
    const n = norms[sp] || norms.dog;

    let color = '#22C55E';
    let cat = 'Норма';
    if (vhs > n.max) { color = '#F59E0B'; cat = 'Лёгкая кардиомегалия'; }
    if (vhs > n.max + 1) { color = '#EF4444'; cat = 'Выраженная кардиомегалия'; }
    if (vhs > n.max + 2) { color = '#991B1B'; cat = 'Критическая кардиомегалия'; }

    return {
      value: `${vhs}`,
      unit: 'VHS (v)',
      interpretation: `VHS ${vhs} v · норма ${n.range} — ${cat}`,
      color,
      details: `Vertebral Heart Score (Buchanan & Bücheler, 1995)\nДлинная ось: ${L} v · короткая: ${S} v · сумма: ${vhs} v\nПородная норма: ${n.range}`,
      actions: [
        vhs <= n.max ? 'Норма — мониторинг 1×/год (для пород риска)' : '',
        vhs > n.max ? 'ЭхоКГ для дифференциации (LA/Ao, LVIDDN)' : '',
        vhs > n.max ? 'Если ACVIM B2 (LA/Ao ≥ 1,6) — пимобендан 0,25 мг/кг × 2/сут' : '',
        vhs > n.max + 1 ? 'Контроль АД, NT-proBNP, рентген в 2 проекциях' : '',
        vhs > n.max + 2 && sp !== 'cat' ? 'Оценка отёка лёгких (ХСН, стадия C)' : '',
      ].filter(Boolean),
      caveats: [
        'Измерять на лат. рентгенограмме при максимальном вдохе',
        'Породная вариабельность — CKCS, бульдоги, борзые имеют иные нормы',
        'VHS не заменяет ЭхоКГ — используется для скрининга',
        'VLAS (Vertebral Left Atrial Size) — дополнительный маркер (норма ≤ 2,3)',
        'Не применять у котов вместо ЭхоКГ (низкая чувствительность ГКМП)',
      ],
      scale: {
        segments: [
          { min: 6, max: 10.5, label: 'Норма', color: '#22C55E' },
          { min: 10.5, max: 11.5, label: 'Лёгкая', color: '#F59E0B' },
          { min: 11.5, max: 13, label: 'Выраженная', color: '#EF4444' },
          { min: 13, max: 16, label: 'Критическая', color: '#991B1B' },
        ],
        current: vhs,
        unit: 'v',
      },
      related: [
        { id: 'acvim', title: 'ACVIM MMVD staging' },
        { id: 'asa-vet', title: 'ASA (вет)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Buchanan JW, Bücheler J. Vertebral scale system to measure canine heart size in radiographs. J Am Vet Med Assoc 1995;206:194-9.',
  countries: 'Международный (ACVIM · EVDI)',
  presets: [
    { label: 'Норма — овчарка', values: { species: 'dog', long: 5.5, short: 4.4 } },
    { label: 'B2 — CKCS', values: { species: 'ckcs', long: 6.2, short: 5.1 } },
    { label: 'Кот норма', values: { species: 'cat', long: 4.3, short: 3.5 } },
  ],
  info: `### Для чего используется
**Vertebral Heart Score (VHS)** по Buchanan — количественная оценка размера сердца собаки по **правой боковой** рентгенограмме. Использует тела грудных позвонков как линейку.

### Методика
1. Боковая рентгенограмма, **максимальный вдох**
2. Длинная ось: от карины трахеи до апекса сердца
3. Короткая ось: перпендикулярно длинной, в самом широком месте
4. Наложить обе оси на позвоночник от T4 каудально, отсчитать в позвонках (v)
5. **VHS = L + S** (сумма)

### Нормы
| Группа | VHS (v) |
|---|---|
| Общая собака | 9,2-10,2 |
| CKCS | ≤ 10,8 |
| Бульдог / боксёр | ≤ 12,7 |
| Борзые / волкодав | ≤ 11,5 |
| Кошка | ≤ 8,0 |

### Применение
- Скрининг кардиомегалии
- ACVIM MMVD staging (B2 при VHS ≥ 10,5 + LA/Ao ≥ 1,6)
- Мониторинг ХСН — тренд VHS во времени

### VLAS (обновление 2018)
**Vertebral Left Atrial Size** — от карины до каудальной границы ЛП. Норма ≤ 2,3 v.

### Ограничения
- Зависит от фазы дыхания
- Брахицефалы — высокий VHS как норма
- У кошек низкая чувствительность (лучше ЭхоКГ)

### Источник
Buchanan & Bücheler 1995 · Обновления: Poad 2020 (VLAS), EPIC trial 2016.`,
};
export default runner;

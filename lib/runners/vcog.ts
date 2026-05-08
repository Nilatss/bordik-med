/** Runner: vcog */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'system',
      label: 'Орган-система',
      type: 'select',
      options: [
        { value: 'heme', label: 'Гематология (нейтропения)' },
        { value: 'gi', label: 'ЖКТ (диарея / рвота)' },
        { value: 'skin', label: 'Кожа (алопеция, сыпь)' },
        { value: 'renal', label: 'Почки (креатинин)' },
        { value: 'hepatic', label: 'Печень (АЛТ/АСТ)' },
        { value: 'cardiac', label: 'Сердце' },
      ],
    },
    {
      id: 'grade',
      label: 'Степень (VCOG-CTCAE)',
      type: 'select',
      options: [
        { value: 1, label: '1 — Лёгкая, бессимптомная' },
        { value: 2, label: '2 — Умеренная, амбулаторно' },
        { value: 3, label: '3 — Тяжёлая, госпитализация' },
        { value: 4, label: '4 — Угроза жизни' },
        { value: 5, label: '5 — Смерть от токсичности' },
      ],
    },
  ],
  compute: (v) => {
    const sys = String(v.system);
    const g = Number(v.grade) || 1;

    const colors = ['#22C55E', '#22C55E', '#F59E0B', '#EF4444', '#991B1B', '#000000'];
    const color = colors[g] || '#EF4444';

    const ranges: Record<string, Record<number, string>> = {
      heme: { 1: 'ANC 1,5-2,0 × 10⁹/л', 2: 'ANC 1,0-1,5', 3: 'ANC 0,5-1,0', 4: 'ANC < 0,5', 5: 'Смерть от FN' },
      gi:   { 1: 'Диарея < 2/сут над базой', 2: 'Диарея 2-6/сут', 3: '> 7/сут, дегидратация', 4: 'Гемодинамический коллапс', 5: 'Смерть' },
      skin: { 1: 'Лёгкая эритема', 2: 'Умеренная, < 50 % площади', 3: 'Тяжёлая, > 50 %', 4: 'Эксфолиация, угроза жизни', 5: 'Смерть' },
      renal:{ 1: 'Кр ×1-1,5 ВГН', 2: 'Кр ×1,5-3 ВГН', 3: 'Кр ×3-6 ВГН', 4: 'Кр > 6 ВГН / диализ', 5: 'Смерть' },
      hepatic:{ 1: 'АЛТ ×1-2,5 ВГН', 2: 'АЛТ ×2,5-5 ВГН', 3: 'АЛТ ×5-20 ВГН', 4: 'АЛТ > 20 / печ. недостаточность', 5: 'Смерть' },
      cardiac:{ 1: 'Бессимптомная аритмия', 2: 'Симптомная, контроль', 3: 'Тяжёлая аритмия / ХСН', 4: 'Угроза жизни', 5: 'Смерть' },
    };

    const cutoff = ranges[sys]?.[g] || '—';

    return {
      value: `Grade ${g}`,
      unit: `VCOG-CTCAE · ${sys}`,
      interpretation: `Grade ${g} ${sys} — ${cutoff}`,
      color,
      details: `Система: ${sys}\nСтепень: ${g}\nКритерий: ${cutoff}\n\nVCOG-CTCAE v2 (2016) — стандарт оценки нежелательных явлений ветеринарной химиотерапии.`,
      actions: [
        g === 1 ? 'Продолжить терапию, мониторинг' : '',
        g === 2 ? 'Симптоматическая поддержка, снижение дозы при повторе' : '',
        g === 3 ? 'Отменить цикл, госпитализация, поддержка (инфузии, антибиотики)' : '',
        g === 3 && sys === 'heme' ? 'Филграстим (G-CSF) 5 мкг/кг п/к при ANC < 1,0' : '',
        g === 4 ? 'Немедленная отмена препарата, ИТ, консилиум' : '',
        g >= 2 ? 'При продолжении — снизить дозу на 20-25 % следующего цикла' : '',
        'Документировать в историю болезни + отчёт в VCOG при grade ≥ 3',
      ].filter(Boolean),
      caveats: [
        'VCOG-CTCAE — адаптация человеческой CTCAE для ветеринарии',
        'Grade 5 (смерть) — только если смерть вызвана токсичностью, не прогрессией опухоли',
        'Для нейтропении используется абсолютное число (ANC), не относительное',
        'Разные системы — разные критерии; не переносить на пациента как единую сумму',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Лёгкая', color: '#22C55E' },
          { min: 2, max: 3, label: 'Умеренная', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Тяжёлая', color: '#EF4444' },
          { min: 4, max: 6, label: 'Критическая', color: '#991B1B' },
        ],
        current: g,
        unit: 'grade',
      },
      related: [
        { id: 'mascc', title: 'MASCC (febrile neutro)' },
        { id: 'acvim', title: 'ACVIM staging' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'Veterinary Cooperative Oncology Group. Common Terminology Criteria for Adverse Events (VCOG-CTCAE) v2. Vet Comp Oncol 2016;14:417-46.',
  countries: 'Великобритания · США (VCOG)',
  presets: [
    { label: 'Нейтропения G3', values: { system: 'heme', grade: 3 } },
    { label: 'Диарея G2', values: { system: 'gi', grade: 2 } },
    { label: 'Кардио G4', values: { system: 'cardiac', grade: 4 } },
  ],
  info: `### Для чего используется
**VCOG-CTCAE** (Veterinary Cooperative Oncology Group — Common Terminology Criteria for Adverse Events) — стандарт оценки нежелательных явлений химиотерапии у собак и кошек. Адаптация человеческой NCI-CTCAE.

### Степени (общая шкала)
| Grade | Описание | Действие |
|---|---|---|
| 1 | Лёгкая, бессимптомная | Продолжить |
| 2 | Умеренная, амбулаторно | Поддержка ± снижение дозы |
| 3 | Тяжёлая, госпитализация | Отмена цикла + ИТ |
| 4 | Угроза жизни | Немедленная отмена |
| 5 | Смерть от токсичности | — |

### Системы
- Гематологическая (ANC, тромбоциты)
- ЖКТ (диарея, рвота, мукозит)
- Кожа (алопеция, экстравазация)
- Почки (креатинин, протеинурия)
- Печень (АЛТ/АСТ, билирубин)
- Сердечно-сосудистая

### Применение
- Стандартизованная оценка токсичности
- Решение о продолжении / снижении дозы / отмене
- Коммуникация между ветеринарными онкологами
- Клинические исследования

### Источник
VCOG-CTCAE v1 (2004), v2 (2016). Публикация в Vet Comp Oncol.`,
};
export default runner;

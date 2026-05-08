/** Runner: asa-vet */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'class',
      label: 'Класс ASA',
      type: 'select',
      options: [
        { value: 1, label: 'I — Здоровое животное' },
        { value: 2, label: 'II — Лёгкое системное заболевание' },
        { value: 3, label: 'III — Тяжёлое системное заболевание' },
        { value: 4, label: 'IV — Постоянная угроза жизни' },
        { value: 5, label: 'V — Moribund (умирает без операции)' },
      ],
    },
    {
      id: 'emergency',
      label: 'Экстренная операция (суффикс E)',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const c = Number(v.class) || 1;
    const e = !!v.emergency;
    const suffix = e ? 'E' : '';

    const info: Record<number, { label: string; mortality: string; color: string; example: string }> = {
      1: { label: 'Здоров', mortality: '< 0,1 %', color: '#22C55E', example: 'Плановая кастрация молодой здоровой собаки' },
      2: { label: 'Лёгкое системное', mortality: '0,1-0,5 %', color: '#22C55E', example: 'Контролируемый СД, лёгкое ожирение, возраст > 7 лет' },
      3: { label: 'Тяжёлое системное', mortality: '1-2 %', color: '#F59E0B', example: 'ХПН стадии 2-3 (IRIS), ДКМП стадии B2, контролируемая эпилепсия' },
      4: { label: 'Угроза жизни', mortality: '5-10 %', color: '#EF4444', example: 'Декомпенсированная ХСН, шок, пиометра, ОПН' },
      5: { label: 'Moribund', mortality: '> 50 %', color: '#991B1B', example: 'GDV с перфорацией, массивное кровотечение, полиорганная недостаточность' },
    };
    const d = info[c]!;

    return {
      value: `ASA ${c}${suffix}`,
      unit: d.label,
      interpretation: `ASA ${c}${suffix} — ${d.label} · смертность ${d.mortality}`,
      color: d.color,
      details: `Пример: ${d.example}.\n${e ? '\n**E (Emergency)** — задержка > 15 мин угрожает жизни или органу.' : ''}`,
      actions: [
        c <= 2 ? 'Стандартная предоперационная подготовка' : '',
        c >= 3 ? 'Расширенное обследование: ОАК, биохимия, ЭКГ, рентген грудной клетки, УЗИ' : '',
        c >= 3 ? 'Индивидуальный анестезиологический протокол (TIVA / сбалансированная)' : '',
        c >= 4 ? 'Стабилизация до операции (если возможно): инфузии, кислород, коррекция' : '',
        c >= 4 ? 'Информированное согласие с высоким риском, реанимационная готовность' : '',
        e ? 'Экстренная операция — короткая стабилизация (< 60 мин), затем немедленно в операционную' : '',
      ].filter(Boolean),
      caveats: [
        'ASA-vet адаптирована AAHA/ACVAA из ASA Physical Status (человеческая шкала)',
        'Субъективна — межэкспертная вариабельность до 30 %',
        'Не учитывает тип операции (BREED + CCI у пожилых доберманов)',
        'Суффикс E добавляется только при истинной экстренности',
        'Породоспецифичный риск (брахицефалы, борзые) оценивается отдельно',
      ],
      scale: {
        segments: [
          { min: 1, max: 3, label: 'Низкий', color: '#22C55E' },
          { min: 3, max: 4, label: 'Умеренный', color: '#F59E0B' },
          { min: 4, max: 5, label: 'Высокий', color: '#EF4444' },
          { min: 5, max: 6, label: 'Крайний', color: '#991B1B' },
        ],
        current: c,
        unit: 'класс',
      },
      related: [
        { id: 'asa-ps', title: 'ASA Physical Status (человек)' },
        { id: 'acvim', title: 'ACVIM staging' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'ASA Physical Status Classification System (adapted for veterinary use by AAHA/ACVAA).',
  countries: 'США (ACVAA · AAHA) · международный',
  presets: [
    { label: 'ASA I — кастрация', values: { class: 1, emergency: false } },
    { label: 'ASA III — ХПН', values: { class: 3, emergency: false } },
    { label: 'ASA IV-E — GDV', values: { class: 4, emergency: true } },
  ],
  info: `### Для чего используется
**ASA Physical Status (veterinary)** — адаптация человеческой шкалы ASA для оценки периоперационного риска у собак и кошек. Применяется ACVAA (American College of Veterinary Anesthesia and Analgesia) и AAHA.

### Классы
| Класс | Состояние | Пример | Смертность |
|---|---|---|---|
| I | Здоров | Плановая кастрация | < 0,1 % |
| II | Лёгкое системное | Контр. СД, ожирение | 0,1-0,5 % |
| III | Тяжёлое системное | ХПН 2-3, ДКМП B2 | 1-2 % |
| IV | Угроза жизни | ХСН декомп., шок | 5-10 % |
| V | Moribund | GDV + перфорация | > 50 % |

### Суффикс E
Добавляется при **экстренной** операции (задержка > 15 мин угрожает жизни / органу).
Примеры: GDV, пиометра с перитонитом, массивное кровотечение.

### Применение
- Документация анестезии
- Информированное согласие (высокий риск)
- Подбор анестезиологического протокола
- Планирование интраоперационного мониторинга

### Ограничения
- Не учитывает тип операции (CEPOD + ACVAA)
- Брахицефалы — дополнительный риск (BRAS score)
- Возраст не является ASA-критерием сам по себе`,
};
export default runner;

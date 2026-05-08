// @ts-nocheck
/** Runner: icf — WHO International Classification of Functioning */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO) · реабилитация, МСЭ',
  reference: 'World Health Organization. International Classification of Functioning, Disability and Health (ICF). Geneva: WHO; 2001 (with updates 2011, 2017, 2022).',
  inputs: [
    {
      id: 'domain',
      label: 'Компонент ICF',
      type: 'select',
      options: [
        { value: 'b', label: 'b Body functions (функции организма)' },
        { value: 's', label: 's Body structures (структуры организма)' },
        { value: 'd', label: 'd Activities & participation (деятельность/участие)' },
        { value: 'e', label: 'e Environmental factors (факторы среды)' },
      ],
    },
  ],
  presets: [
    { label: 'Функции (b)', values: { domain: 'b' } },
    { label: 'Деятельность (d)', values: { domain: 'd' } },
    { label: 'Среда (e)', values: { domain: 'e' } },
  ],
  compute: (v) => {
    const d = String(v.domain || 'b');
    const map: Record<string, { name: string; chapters: string; example: string; qualifier: string; note: string }> = {
      b: {
        name: 'Body functions — физиологические функции организма (вкл. психические)',
        chapters: '**b1** Психические (Mental); **b2** Сенсорные и боль (Sensory, Pain); **b3** Голос и речь; **b4** Сердечно-сосуд., гематол., иммун., дыхание; **b5** Пищеварит., метаболич., эндокринные; **b6** Мочеполовые и репродуктивные; **b7** Нейромышечные, скелетные и двигательные; **b8** Кожа',
        example: 'b28013 Боль в спине',
        qualifier: '0 = нет нарушения; 1 = лёгкое (5-24%); 2 = умеренное (25-49%); 3 = тяжёлое (50-95%); 4 = абсолютное (96-100%); 8 = не уточнено; 9 = неприменимо',
        note: 'b28013.3 = "тяжёлая боль в спине"',
      },
      s: {
        name: 'Body structures — анатомические структуры',
        chapters: '**s1** Нервной системы; **s2** Глаза, уха; **s3** Голоса и речи; **s4** ССС, гематол., иммун., дыхание; **s5** Пищеварит., метаболич., эндокрин.; **s6** Мочеполовая и репрод.; **s7** Связанные с движением; **s8** Кожа и связанные',
        example: 's73011 Кости кисти',
        qualifier: '1-й qualifier — степень нарушения (0-4); 2-й — характер (0 без изменений, 1 отсутствие, 2 частичное отсут., 3 доп. часть, 4 аберрантные размеры, 5 разрыв, 6 отклонение позиции, 7 качественные изменения); 3-й — локализация (0-9)',
        note: 's73011.211 = "частичное отсутствие костей кисти, правой, умеренное нарушение"',
      },
      d: {
        name: 'Activities & Participation — деятельность и участие',
        chapters: '**d1** Обучение и применение знаний; **d2** Общие задачи и требования; **d3** Общение; **d4** Мобильность; **d5** Самообслуживание; **d6** Бытовая жизнь; **d7** Межличностное взаим.; **d8** Главные сферы жизни (труд, образование); **d9** Общественная, социальная и гражд. жизнь',
        example: 'd450 Ходьба',
        qualifier: '1-й qualifier — Performance (что делает в реальной среде, 0-4); 2-й — Capacity (что может без помощи, 0-4). Опционально 3-й — Capacity with assistance, 4-й — Performance without assistance',
        note: 'd450.32 = "тяжёлое нарушение performance ходьбы (с помощниками)" / "умеренное — capacity (без)"',
      },
      e: {
        name: 'Environmental factors — факторы среды',
        chapters: '**e1** Продукты и технологии; **e2** Природная среда и вызванные изменения; **e3** Поддержка и отношения; **e4** Установки (attitudes); **e5** Службы, системы, политика',
        example: 'e310 Ближайшая семья',
        qualifier: 'Барьер (.0-.4, цифра после точки) ИЛИ Facilitator (+0 — +4, знак "+" с цифрой). Пример: e310+3 = "семья как существенный facilitator"; e450.2 = "умеренный барьер от установок мед. работников"',
        note: '+ уровень facilitator · . уровень barrier',
      },
    };
    const e = map[d]!;
    return {
      value: e.example.split(' ')[0],
      unit: 'ICF',
      color: '#6B7280',
      interpretation: `ICF component ${d}: ${e.name}`,
      details: `Компонент: ${d} — ${e.name}\n\nГлавы (chapters):\n${e.chapters}\n\nПример кода: ${e.example}\n\nQualifiers (градация): ${e.qualifier}\n\nПример с qualifier: ${e.note}\n\nICF — биопсихосоциальная модель функционирования: Health Condition ↔ Body Functions/Structures ↔ Activities ↔ Participation ↔ Environmental Factors ↔ Personal Factors. Дополняет ICD (диагноз "что") измерением "как функционирует человек".`,
      actions: [
        'ICF Browser (WHO): https://icd.who.int/dev11/l-icf/en',
        'ICF-CY (Children and Youth version, 2007) — для педиатрии',
        'ICF Core Sets — преднастроенные подмножества для конкретных состояний (инсульт, СН, депрессия, хр. боль)',
        'РФ: с 2020 г. ICF используется в МСЭ (медико-социальной экспертизе) совместно с МКБ-10',
        'В реабилитации: ICF как framework для постановки целей (goal setting) и измерения результата',
      ],
      caveats: [
        'ICF не заменяет ICD — они ДОПОЛНЯЮТ друг друга (ICD "что", ICF "как функционирует")',
        'Qualifiers — обязательны, без них код не информативен',
        'Personal factors (возраст, пол, образование, coping) — НЕ классифицированы в ICF (только упоминаются)',
        'В РФ официально принят: приказ Минтруда РФ №585н от 27.08.2019 для МСЭ',
        'ICF-CY — отдельная версия для детей/подростков (0-18 лет), 2007',
        'ICD-11 интегрирует функционирование (глава V-related codes), но ICF остаётся самостоятельным инструментом',
      ],
      related: [
        { id: 'icd10', title: 'ICD-10' },
        { id: 'icd11', title: 'ICD-11' },
        { id: 'nanda', title: 'NANDA-I' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Реабилитация — основы' },
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**WHO ICF** (International Classification of Functioning, Disability and Health) — международная классификация функционирования, ограничений жизнедеятельности и здоровья. Принята WHO в 2001 г., является частью WHO Family of International Classifications (FIC) вместе с ICD.

### Биопсихосоциальная модель
\`\`\`
Health Condition (ICD code)
         ↕
┌────────┴────────┐
│                 │
Body Functions    Activities     Participation
& Structures      (что делает)   (вовлечение в жизнь)
(b, s)            (d)            (d)
         ↕                ↕
Environmental Factors (e) ↔ Personal Factors (не классифиц.)
\`\`\`

### 4 компонента ICF
| Префикс | Компонент |
|---|---|
| **b** | Body functions (физиологические функции, вкл. психические) |
| **s** | Body structures (анатомические структуры) |
| **d** | Activities & participation (д=domains выполнения/участия) |
| **e** | Environmental factors (факторы среды) |

### Структура кода
\`\`\`
b 2 8 0 1 3 . 3
│ │ │ │─│─│   │
│ │ │   │     qualifier (степень нарушения 0-4)
│ │ │   3-4 уровень детализации
│ │ chapter (2 = sensory/pain)
│ component
b
\`\`\`

### Qualifiers
- **0** — нет нарушения (0-4%)
- **1** — лёгкое (5-24%)
- **2** — умеренное (25-49%)
- **3** — тяжёлое (50-95%)
- **4** — абсолютное (96-100%)
- **8** — не уточнено
- **9** — неприменимо
- **+** — facilitator (только для компонента e)

### ICF Core Sets (для конкретных состояний)
- Инсульт
- СН (Heart failure)
- Хр. боль (Chronic widespread pain)
- Депрессия
- Диабет
- Остеоартроз
- Рак молочной железы
- РС (Multiple sclerosis)
- СМТ (Spinal cord injury)
- ЧМТ (TBI)

### Применение в РФ
- МСЭ (медико-социальная экспертиза) — приказ Минтруда №585н от 27.08.2019
- Реабилитация — клинические рекомендации МЗ РФ
- Индивидуальная программа реабилитации/абилитации (ИПРА)`,
};
export default runner;

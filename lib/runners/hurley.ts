// @ts-nocheck
/** Runner: hurley - Hurley staging for hidradenitis suppurativa */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'stage', label: 'Клиническая картина', type: 'select', options: [
      { value: '1', label: 'I — единичные/множественные абсцессы, без свищей и рубцов' },
      { value: '2', label: 'II — рецидивирующие абсцессы с отдельными свищами и рубцами, области разделены' },
      { value: '3', label: 'III — диффузное поражение или множественные взаимосвязанные свищи/абсцессы' },
    ] },
  ],
  compute: (v) => {
    const stage = String(v.stage || '1');
    const s = Number(stage);
    const colors = ['#22C55E', '#F59E0B', '#EF4444'];
    const bands = ['Лёгкая (I)', 'Среднетяжёлая (II)', 'Тяжёлая (III)'];
    const descriptions = [
      'Единичные или множественные абсцессы без свищевых ходов и рубцевания.',
      'Рецидивирующие абсцессы с ограниченным свищеобразованием и рубцеванием. Поражения разделены нормальной кожей.',
      'Диффузное или почти диффузное поражение области с множественными взаимосвязанными свищами и абсцессами на всей протяжённости.',
    ];

    const actions = [
      s >= 1 ? 'Модификация образа жизни: отказ от курения, снижение веса (ИМТ < 30)' : '',
      s >= 1 ? 'Местно: клиндамицин 1% лосьон 2×/день; резорцин 15% на узлы' : '',
      s === 1 ? 'Интралезионно триамцинолон 10 мг/мл при болезненных узлах' : '',
      s >= 2 ? 'Системные АБ: клиндамицин 300 мг × 2/сут + рифампицин 300 мг × 2/сут 10-12 нед' : '',
      s >= 2 ? 'Гормональная терапия у женщин: COC с антиандрогенным эффектом, спиронолактон, метформин' : '',
      s >= 2 ? 'Адалимумаб 40 мг/нед (одобрен FDA для HS-II/III)' : '',
      s === 3 ? 'Secukinumab (anti-IL-17A), bimekizumab — новые опции' : '',
      s === 3 ? 'Хирургия: wide excision с пластикой / вторичным заживлением — радикальный метод' : '',
      s === 3 ? 'Мультидисциплинарный подход: дерматолог + хирург + эндокринолог + психолог' : '',
    ].filter(Boolean);

    return {
      value: `Stage ${stage}`,
      unit: '',
      interpretation: bands[s - 1],
      color: colors[s - 1],
      details: descriptions[s - 1],
      actions,
      caveats: [
        'Hurley — статическая шкала, не подходит для мониторинга ответа на терапию',
        'Для динамики — HiSCR (Hidradenitis Suppurativa Clinical Response) или IHS4',
        'IHS4 = узлы + 2×абсцессы + 4×свищи (< 4 лёгкая, 4-10 средняя, ≥ 11 тяжёлая)',
        'Важна ранняя диагностика — задержка часто > 7-10 лет',
        'Ассоциирован с метаболическим синдромом, ВЗК, депрессией',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'Stage I', color: '#22C55E' },
          { min: 2, max: 3, label: 'Stage II', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Stage III', color: '#EF4444' },
        ],
        current: s,
        unit: 'Hurley',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'scorad', title: 'SCORAD' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Hurley HJ. Axillary hyperhidrosis, apocrine bromhidrosis, hidradenitis suppurativa, and familial benign pemphigus: surgical approach. In: Roenigk RK, Roenigk HH, eds. Dermatologic Surgery. NY: Marcel Dekker; 1989:729-739.',
  countries: 'Международный (AAD / EHSF)',
  presets: [
    { label: 'Stage I', values: { stage: '1' } },
    { label: 'Stage II', values: { stage: '2' } },
    { label: 'Stage III', values: { stage: '3' } },
  ],
  info: `### Для чего используется
**Hurley staging** — базовая клиническая классификация **гидраденита суппуративного (HS)** / acne inversa. Определяет тактику.

### Стадии
| Stage | Признаки | Тактика |
|---|---|---|
| I | Абсцессы без свищей / рубцов | Местные АБ + интралезионный триамцинолон |
| II | Рецидивы с отдельными свищами и рубцами | Системные АБ (клинда + рифампицин), адалимумаб |
| III | Диффузное поражение с множественными взаимосвязанными свищами | Биологики + хирургия wide excision |

### Альтернативы для динамики
- **IHS4** = узлы + 2×абсцессы + 4×свищи
- **HiSCR** — ответ на терапию (≥ 50% снижение воспалительных узлов)

### Ассоциации
Курение, ожирение, инсулинорезистентность, ВЗК, спондилоартропатии, депрессия.

### Базовые рекомендации
- Отказ от курения (strongest modifiable factor)
- Снижение веса
- Свободная одежда, исключение трения
- Антисептические washes (хлоргексидин, бензоилпероксид)

### Источник
Hurley HJ. Dermatologic Surgery 1989.`,
};

export default runner;

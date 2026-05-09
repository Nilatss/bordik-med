/**
 * Runner: neo-petrussa — Petrussa Score (упрощённая GA по 5 критериям)
 *
 * NEONATOLOGY MODULE A6 (P3).
 *
 * Упрощённая шкала оценки гестационного возраста по 5 morphologic
 * критериям. Альтернатива более сложному Ballard / Dubowitz, особенно
 * в условиях ограниченных ресурсов.
 *
 * SOURCES:
 *   - Petrussa В, Mercurio MR. Перинатологии (РФ адаптация)
 *   - Адаптировано в Avery / Перинатология (РФ) для скрининга в родзале
 *   - Помогает быстро оценить GA при отсутствии дородовых данных
 *
 * Параметры (каждый 0-2 балла):
 *   - Кожа (текстура, прозрачность)
 *   - Ушная раковина (форма, упругость)
 *   - Молочные железы (диаметр узелка)
 *   - Гениталии: яички (опущение) ИЛИ половые губы
 *   - Стопы: складки на подошве
 *
 * GA расчёт: GA_weeks = score + 30
 *   Score 0-2 → 30-32 нед
 *   Score 3-5 → 33-35 нед
 *   Score 6-8 → 36-38 нед
 *   Score 9-10 → 39-40 нед
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 10,
  countries: 'РФ перинатология; LMIC скрининг',
  reference: 'Petrussa В (РФ адаптация). Avery\'s Diseases of the Newborn 11th ed.',
  inputs: [
    {
      id: 'skin',
      label: 'Кожа',
      type: 'select',
      options: [
        { value: '0', label: 'Тонкая, прозрачная (вены видны)', points: 0 },
        { value: '1', label: 'Тонкая, не прозрачная', points: 1 },
        { value: '2', label: 'Розовая, гладкая, складки', points: 2 },
      ],
    },
    {
      id: 'ear',
      label: 'Ушная раковина',
      type: 'select',
      options: [
        { value: '0', label: 'Плоская, мягкая (не возвращает форму)', points: 0 },
        { value: '1', label: 'Слегка изогнута, частичная упругость', points: 1 },
        { value: '2', label: 'Хорошо сформирована, полная упругость', points: 2 },
      ],
    },
    {
      id: 'breast',
      label: 'Молочные железы (узелок)',
      type: 'select',
      options: [
        { value: '0', label: 'Не пальпируется или < 5 мм', points: 0 },
        { value: '1', label: '5-9 мм', points: 1 },
        { value: '2', label: '≥ 10 мм', points: 2 },
      ],
    },
    {
      id: 'genitalia',
      label: 'Гениталии (♂ яички / ♀ половые губы)',
      type: 'select',
      options: [
        { value: '0', label: '♂ Яички не в мошонке / ♀ малые губы выступают', points: 0 },
        { value: '1', label: '♂ Яички в верхнем канале / ♀ полное частичное покрытие', points: 1 },
        { value: '2', label: '♂ Яички в мошонке / ♀ большие покрывают малые', points: 2 },
      ],
    },
    {
      id: 'sole',
      label: 'Стопы (складки на подошве)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет складок или 1-2 неглубоких', points: 0 },
        { value: '1', label: 'Складки на передней 1/3', points: 1 },
        { value: '2', label: 'Складки покрывают всю подошву', points: 2 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 2,
      label: 'Глубоко недоношенный (~ 30-32 нед)',
      color: '#7F1D1D',
      description: 'Estimated GA 30-32 нед.',
      actions: [
        'Перевод в ОРИТН; ELBW/VLBW — повышенный риск всех осложнений',
        'Surfactant подготовка; CPAP/MV',
        'Полиэтиленовая обёртка + cap для термозащиты',
        'Подтвердить GA по anthropometric data + dating ultrasound (если есть)',
      ],
    },
    {
      min: 3,
      max: 5,
      label: 'Умеренно недоношенный (~ 33-35 нед)',
      color: '#F59E0B',
      description: 'Estimated GA 33-35 нед.',
      actions: [
        'Late-preterm care: уход в отделении реанимации/высокого риска',
        'Контроль гипогликемии, гипотермии, RDS, гипербилирубинемии',
        'Раннее кормление; контроль потери массы',
        'Подтвердить GA — неонатолог + ультразвук',
      ],
    },
    {
      min: 6,
      max: 8,
      label: 'Поздний недоношенный / ранний термин (~ 36-38 нед)',
      color: '#84CC16',
      description: 'Estimated GA 36-38 нед.',
      actions: [
        'Late preterm — все equivalent risks',
        'Стандартный уход с мониторингом гипогликемии и температуры',
        'Кормление по требованию; контроль массы и желтухи',
      ],
    },
    {
      min: 9,
      max: 10,
      label: 'Доношенный (~ 39-40 нед)',
      color: '#22C55E',
      description: 'Estimated GA 39-40 нед.',
      actions: [
        'Стандартный уход за доношенным',
        'Routine screening: метаболика, слух, зрение, врождённые пороки',
        'Кормление, контакт кожа-к-коже, выписка по протоколу',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let total = 0;
    for (const inp of runner.inputs) {
      if (inp.type === 'select' && inp.options) {
        const v = values[inp.id];
        const opt = inp.options.find((o) => String(o.value) === String(v));
        if (opt?.points) total += opt.points;
      }
    }
    const band = findBand(runner.bands, total);
    const ga = total + 30;
    return {
      value: String(total),
      unit: `баллов · GA ≈ ${ga} нед`,
      interpretation: band.label,
      color: band.color,
      details: `Сумма: ${total}/10 → estimated GA ${ga} нед. ${band.description ?? ''}`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Petrussa менее точен чем Ballard / Dubowitz — расхождение ± 2 нед',
    'Применим в LMIC и условиях ограниченных ресурсов; для precision use New Ballard',
    'Анте-natal dating (LMP, dating ultrasound 1-й триместр) точнее, если доступен',
    'У ELBW < 1000 г шкала может недооценивать GA — использовать Ballard',
    'У IUGR — GA по шкале не отражает истинный GA (ребёнок выглядит моложе)',
    'Должна выполняться в первые 12-72 ч жизни (после — снижается точность)',
  ],
  related: [
    { id: 'ballard', title: 'Ballard / New Ballard' },
    { id: 'dubowitz', title: 'Dubowitz GA' },
    { id: 'neo-fenton', title: 'Fenton 2025 growth' },
  ],
  info: `### Petrussa Score (упрощённая GA)

Упрощённая шкала оценки гестационного возраста по 5 морфологическим
признакам. Альтернатива более сложному Ballard / Dubowitz, особенно
в условиях ограниченных ресурсов или когда нужен быстрый screening
в родзале.

### Параметры (каждый 0-2 балла, max 10)

1. **Кожа** — текстура, прозрачность
2. **Ушная раковина** — форма, упругость
3. **Молочные железы** — диаметр узелка (мм)
4. **Гениталии** — ♂ опущение яичек / ♀ положение половых губ
5. **Стопы** — складки на подошве

### Расчёт GA

\`\`\`
GA_weeks ≈ score + 30
\`\`\`

| Score | GA (нед) | Категория |
|---|---|---|
| 0-2 | 30-32 | Глубоко недоношенный |
| 3-5 | 33-35 | Умеренно недоношенный |
| 6-8 | 36-38 | Late preterm / early term |
| 9-10 | 39-40 | Доношенный |

### Сравнение с Ballard / Dubowitz

| | Petrussa | Ballard | Dubowitz |
|---|---|---|---|
| **Параметры** | 5 | 12 | 21 |
| **Точность** | ± 2 нед | ± 1 нед | ± 1 нед |
| **Время** | 2 мин | 5 мин | 10-15 мин |
| **Применение** | Quick screen | Стандарт | Детальная оценка |

### Ограничения

- Менее precise (расхождение ± 2 нед vs ± 1 нед у Ballard)
- У ELBW недооценивает GA
- У IUGR — не отражает истинный GA (морфология "моложе")
- Best window: 12-72 ч жизни

### Когда использовать

- LMIC / условия ограниченных ресурсов
- Quick screen в родзале при отсутствии anteнatal dating
- Подтверждение clinical impression
- Не подменяет antenatal dating ultrasound (1-й триместр)

### Источники

- Petrussa В (РФ адаптация для перинатологии)
- Avery's Diseases of the Newborn 11th ed.
- WHO Pocket Book of Hospital Care for Children (2013)
`,
};

export default runner;

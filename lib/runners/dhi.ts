// @ts-nocheck
/** Runner: dhi - Dizziness Handicap Inventory (Jacobson & Newman 1990) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'emotional',
      label: 'Эмоциональная подшкала (9 вопросов × 0/2/4 = 0-36)',
      type: 'number',
      min: 0,
      max: 36,
      step: 2,
      quickValues: [0, 10, 20, 30],
    },
    {
      id: 'functional',
      label: 'Функциональная подшкала (9 вопросов × 0/2/4 = 0-36)',
      type: 'number',
      min: 0,
      max: 36,
      step: 2,
      quickValues: [0, 10, 20, 30],
    },
    {
      id: 'physical',
      label: 'Физическая подшкала (7 вопросов × 0/2/4 = 0-28)',
      type: 'number',
      min: 0,
      max: 28,
      step: 2,
      quickValues: [0, 8, 16, 24],
    },
  ],
  compute: (v) => {
    const e = Math.min(36, Number(v.emotional) || 0);
    const f = Math.min(36, Number(v.functional) || 0);
    const p = Math.min(28, Number(v.physical) || 0);
    const total = e + f + p;

    let band = '', color = '#22C55E', details = '';
    if (total <= 30) {
      band = 'Лёгкое влияние';
      color = '#22C55E';
      details = `DHI ${total}/100 - лёгкое влияние головокружения на повседневную жизнь. Консервативное ведение.`;
    } else if (total <= 60) {
      band = 'Умеренное влияние';
      color = '#F59E0B';
      details = `DHI ${total}/100 - умеренное влияние. Показана вестибулярная реабилитация.`;
    } else {
      band = 'Тяжёлое влияние';
      color = '#EF4444';
      details = `DHI ${total}/100 - тяжёлая инвалидизация. Комплексный подход, отоневрологическое обследование.`;
    }

    const dominant = [];
    if (e >= 18) dominant.push('эмоциональная');
    if (f >= 18) dominant.push('функциональная');
    if (p >= 14) dominant.push('физическая');

    return {
      value: String(total),
      unit: '/100',
      interpretation: band,
      color,
      details: details + (dominant.length ? ` Преобладают подшкалы: ${dominant.join(', ')}.` : ''),
      actions: [
        'Этиологическая диагностика: BPPV (Dix-Hallpike), Меньер, вестибулярный нейронит',
        'HINTS / видео-нистагмография, аудиометрия',
        total > 30 ? 'Вестибулярная реабилитация (Cawthorne-Cooksey, Brandt-Daroff)' : 'Мониторинг',
        e >= 18 ? 'Психологическая поддержка - выраженный эмоциональный компонент, рассмотреть КПТ' : '',
        'Минимальное клинически значимое изменение (MCID): 18 баллов',
        'Контроль DHI через 4-6 недель терапии',
      ].filter(Boolean),
      caveats: [
        'DHI - самоотчёт, субъективная мера воздействия, не тяжести',
        '25 вопросов: 9 эмоц. (E), 9 функц. (F), 7 физич. (P); каждый 0 (нет), 2 (иногда), 4 (да)',
        'Высокая надёжность (α Кронбаха 0.89); test-retest r=0.97',
        'Не различает этиологию головокружения',
        'Short-form DHI (DHI-S, 10 вопросов) - альтернатива для скрининга',
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: 'Лёгкое', color: '#22C55E' },
          { min: 31, max: 60, label: 'Умеренное', color: '#F59E0B' },
          { min: 61, max: 100, label: 'Тяжёлое', color: '#EF4444' },
        ],
        current: total,
        unit: 'DHI',
      },
      related: [
        { id: 'dix-hallpike', title: 'Dix-Hallpike' },
        { id: 'meniere', title: 'Меньер' },
      ],
      relatedCourses: [
        { id: '314.3', title: 'Оториноларингология' },
        { id: '310.2', title: 'Неврология' },
      ],
    };
  },
  reference: 'Jacobson GP, Newman CW. The development of the Dizziness Handicap Inventory. Arch Otolaryngol Head Neck Surg 1990;116:424-7.',
  countries: 'Международный (AAO-HNS)',
  presets: [
    { label: 'Лёгкое (DHI 20)', values: { emotional: 6, functional: 8, physical: 6 } },
    { label: 'Умеренное (DHI 48)', values: { emotional: 18, functional: 16, physical: 14 } },
    { label: 'Тяжёлое (DHI 78)', values: { emotional: 28, functional: 28, physical: 22 } },
  ],
  info: `### Для чего используется
**DHI (Dizziness Handicap Inventory, Jacobson & Newman 1990)** - 25-пунктовый самоотчёт для оценки **субъективного воздействия головокружения** на повседневную жизнь. Не измеряет тяжесть, а именно handicap / disability.

### Структура
- **25 вопросов** × 3 варианта: Да (4), Иногда (2), Нет (0)
- **3 подшкалы:**
  - **Emotional (E)** - 9 вопросов (0-36): депрессия, тревога, смущение
  - **Functional (F)** - 9 вопросов (0-36): работа, социальная роль
  - **Physical (P)** - 7 вопросов (0-28): физическая активность, позиционные симптомы
- **Total:** 0-100

### Интерпретация
| DHI | Влияние |
|---|---|
| 0-30 | Лёгкое |
| 31-60 | Умеренное |
| 61-100 | Тяжёлое |

### Клинически значимое изменение (MCID)
**18 баллов** - минимальное улучшение, заметное пациенту.

### Применение
- Мониторинг вестибулярной реабилитации
- Исход лечения Меньер, BPPV, вестибулярного нейронита
- Скрининг психосоматического компонента (высокий E при низком P)
- RCT вестибулярных вмешательств

### Альтернативы
- **DHI-S (Short-form, 10 вопросов)** - скрининг
- **VSS (Vertigo Symptom Scale)** - симптомы + тревога
- **ABC Scale** - уверенность в балансе

### Источник
Jacobson GP, Newman CW. Arch Otolaryngol Head Neck Surg 1990;116:424.`,
};

export default runner;

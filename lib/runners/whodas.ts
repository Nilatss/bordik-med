// @ts-nocheck
/** Runner: whodas — WHO Disability Assessment Schedule 2.0 (WHODAS 2.0) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO)',
  reference:
    'Üstün TB, Kostanjsek N, Chatterji S, Rehm J (eds). Measuring Health and Disability: Manual for WHO Disability Assessment Schedule (WHODAS 2.0). Geneva: WHO; 2010.',
  inputs: [
    {
      id: 'version',
      label: 'Версия WHODAS 2.0',
      type: 'select',
      options: [
        { value: '12', label: '12-item (короткая, скрининг)', points: 0 },
        { value: '36', label: '36-item (полная, 6 доменов)', points: 0 },
      ],
    },
    {
      id: 'summary',
      label: 'Summary score (шкала 0-100; 0 = нет инвалидизации, 100 = полная)',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      quickValues: [5, 15, 30, 50, 75],
      hint: 'Complex scoring: суммарная оценка с учётом item weighting через IRT. Или simple scoring: среднее × 20. WHODAS manual рекомендует complex.',
    },
    {
      id: 'domain',
      label: 'Домен (для 36-item, опционально)',
      type: 'select',
      options: [
        { value: 'overall', label: 'Общий (overall)', points: 0 },
        { value: 'cognition', label: 'D1 — Понимание и коммуникация', points: 0 },
        { value: 'mobility', label: 'D2 — Мобильность', points: 0 },
        { value: 'selfcare', label: 'D3 — Самообслуживание', points: 0 },
        { value: 'getalong', label: 'D4 — Взаимодействие с людьми', points: 0 },
        { value: 'lifeact', label: 'D5 — Жизненная активность (дом/работа/учёба)', points: 0 },
        { value: 'participation', label: 'D6 — Участие в обществе', points: 0 },
      ],
    },
    {
      id: 'duration',
      label: 'Длительность трудностей ≥30 дней (DSM-5 / ICF стандарт)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (5)', values: { version: '12', summary: 5, domain: 'overall', duration: false } },
    { label: 'Умерен. (35)', values: { version: '36', summary: 35, domain: 'overall', duration: true } },
    { label: 'Тяжёл. (70)', values: { version: '36', summary: 70, domain: 'lifeact', duration: true } },
  ],
  compute: (v) => {
    const version = String(v.version || '12');
    const s = Math.max(0, Math.min(100, Number(v.summary) || 0));
    const domain = String(v.domain || 'overall');
    const dur = v.duration === true;

    let color = '#22C55E';
    let label = 'Нет / минимальная инвалидизация (<10)';
    let details = `WHODAS 2.0 (${version}-item): summary score ${s}/100, домен: ${domain}.`;
    const actions: string[] = [];

    if (s >= 70) {
      color = '#991B1B';
      label = 'Крайне тяжёлая инвалидизация (≥70)';
      details = `WHODAS summary = ${s}/100 — крайняя степень функциональных нарушений.`;
      actions.push(
        'Междисциплинарное вмешательство (психиатр, реабилитация, соц. работа)',
        'Оценка нуждаемости в уходе / опеке',
        'Интенсивная психосоциальная реабилитация',
        'Рассмотреть группу инвалидности (по локальным стандартам)',
      );
    } else if (s >= 50) {
      color = '#EF4444';
      label = 'Тяжёлая инвалидизация (50-69)';
      details = `WHODAS summary = ${s}/100 — выраженные функциональные нарушения.`;
      actions.push(
        'Активное лечение основного расстройства',
        'Структурированная реабилитация (когнитивная, трудовая)',
        'Семейное консультирование',
        'Регулярный мониторинг каждые 3 мес',
      );
    } else if (s >= 25) {
      color = '#F59E0B';
      label = 'Умеренная инвалидизация (25-49)';
      details = `WHODAS summary = ${s}/100 — умеренные функциональные нарушения.`;
      actions.push(
        'Оптимизация лечения основного заболевания',
        'Психотерапия (КПТ, IPT)',
        'Поддержка в работе/учёбе (supported employment)',
      );
    } else if (s >= 10) {
      color = '#F59E0B';
      label = 'Лёгкая инвалидизация (10-24)';
      details = `WHODAS summary = ${s}/100 — лёгкие функциональные трудности.`;
      actions.push('Наблюдение', 'Психообразование', 'Повторная оценка через 6 мес');
    } else {
      actions.push('Функциональный статус в пределах нормы');
    }

    if (!dur && s >= 25) {
      actions.push('⚠️ Подтвердить длительность ≥30 дней (DSM-5/ICF требует persistence)');
    }
    if (version === '12') {
      actions.push('12-item — скрининговая версия; при клинически значимом балле — расширить до 36-item');
    }

    return {
      value: String(s),
      unit: '/100',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'WHODAS 2.0 основан на ICF (International Classification of Functioning, Disability and Health)',
        'Оценивает функционирование за последние 30 дней',
        '6 доменов: cognition, mobility, self-care, getting along, life activities, participation',
        'Версии: 36-item (полная), 12-item (короткая, ~5 мин), 12+24 (proxy)',
        'Самоотчёт или интервью; есть proxy-версия для неспособных отвечать',
        'Переведён на 30+ языков, валидизирован в >60 странах',
        'Включён в DSM-5 как рекомендуемая шкала оценки функционирования (Section III, replaces GAF)',
        'Complex scoring (IRT) предпочтительнее simple scoring — WHO calculator требуется',
      ],
      scale: {
        segments: [
          { min: 0, max: 9, label: '0-9 нет', color: '#22C55E' },
          { min: 10, max: 24, label: '10-24 лёгк.', color: '#F59E0B' },
          { min: 25, max: 49, label: '25-49 умер.', color: '#F59E0B' },
          { min: 50, max: 69, label: '50-69 тяж.', color: '#EF4444' },
          { min: 70, max: 100, label: '70-100 крайн.', color: '#991B1B' },
        ],
        current: s,
        unit: '/100',
      },
      related: [
        { id: 'scid', title: 'SCID-5' },
        { id: 'dsm-icd', title: 'DSM-5-TR / ICD-11' },
      ],
      relatedCourses: [{ id: '306.8', title: 'Реабилитация и функционирование' }],
    };
  },
  info: `### Для чего используется
**WHODAS 2.0 (WHO 2010)** — универсальная шкала оценки **функционирования и инвалидизации**, разработанная ВОЗ на основе **ICF**. Заменяет устаревший GAF (Global Assessment of Functioning) в DSM-5. Применима к любым заболеваниям (не только психическим), любым культурам, любому возрасту ≥18.

### Версии
| Версия | Пункты | Время | Применение |
|---|---|---|---|
| **36-item self** | 36 | 20 мин | Полная оценка |
| **36-item proxy** | 36 | 20 мин | Оценка представителем |
| **36-item interviewer** | 36 | 20 мин | Интервью |
| **12-item self** | 12 | 5 мин | Скрининг, эпидемиология |
| **12+24** | 12 скрин + 24 при +ve | гибридная |

### 6 доменов (по ICF)
| Домен | Что оценивает | Примеры пунктов |
|---|---|---|
| **D1** Cognition | Понимание, память, концентрация, решение проблем | Концентрация 10 мин, обучение новому |
| **D2** Mobility | Стоять, ходить, перемещаться | Встать, пройти 1 км |
| **D3** Self-care | Гигиена, одевание, еда, одиночество | Мытьё, одевание |
| **D4** Getting along | Межличностные отношения | Справляться с незнакомцами, близкие отношения |
| **D5** Life activities | Дом, работа, учёба | Домашние дела, работа/учёба |
| **D6** Participation | Общество, барьеры, права | Участие в сообществе, эмоциональный эффект |

### Scoring
- **Simple scoring** — сумма ответов (0-4 на item), преобразуется в 0-100
- **Complex scoring** (рекомендовано WHO) — IRT-based, учитывает сложность items
- **0 = нет инвалидизации; 100 = максимальная**

### Интерпретация (на основе популяционных норм)
| Summary | Инвалидизация |
|---|---|
| 0-9 | Нет / минимальная |
| 10-24 | Лёгкая |
| 25-49 | Умеренная |
| 50-69 | Тяжёлая |
| ≥70 | Крайне тяжёлая |

### Использование в DSM-5
DSM-5 рекомендует WHODAS 2.0 (36-item) в **Section III** как meas­ure of disability — заменяет GAF из DSM-IV.

### Ограничения
- Требует валидированного перевода на язык пациента
- Complex scoring — требует WHO syntax (SPSS/SAS/R)
- Proxy версия менее точна
- Не оценивает качество жизни (для этого — WHOQOL-BREF)`,
};

export default runner;

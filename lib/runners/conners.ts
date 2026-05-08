/** Runner: conners — Conners-3 / Conners ADHD Rating Scales */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный',
  reference:
    'Conners CK. Conners 3rd Edition Manual. Toronto: Multi-Health Systems; 2008.',
  inputs: [
    {
      id: 'tscore',
      label: 'T-score по шкале Conners (норм. M=50, SD=10)',
      type: 'number',
      min: 30,
      max: 100,
      step: 1,
      quickValues: [45, 55, 65, 70, 80],
      hint: 'T-score возраст- и пол-нормирован. Norma 40-59, elevated 60-69, very elevated ≥70.',
    },
    {
      id: 'age',
      hint: 'Возраст в годах',
      label: 'Возраст пациента (лет)',
      type: 'number',
      min: 6,
      max: 18,
      step: 1,
      quickValues: [6, 10, 14, 18],
    },
    {
      id: 'rater',
      label: 'Источник оценки',
      type: 'select',
      options: [
        { value: 'parent', label: 'Родитель (Conners-3-P)', points: 0 },
        { value: 'teacher', label: 'Учитель (Conners-3-T)', points: 0 },
        { value: 'self', label: 'Самоотчёт (Conners-3-SR, 8+)', points: 0 },
      ],
    },
    {
      id: 'multipleInformants',
      label: 'Симптомы подтверждены ≥2 информантами (DSM-5 Criterion C)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (T=50)', values: { tscore: 50, age: 10, rater: 'parent', multipleInformants: false } },
    { label: 'Пограничный (T=62)', values: { tscore: 62, age: 10, rater: 'teacher', multipleInformants: true } },
    { label: 'Выраженный (T=75)', values: { tscore: 75, age: 9, rater: 'parent', multipleInformants: true } },
  ],
  compute: (v) => {
    const t = Math.max(30, Math.min(100, Number(v.tscore) || 0));
    const age = Math.max(6, Math.min(18, Number(v.age) || 0));
    const rater = String(v.rater || 'parent');
    const multi = v.multipleInformants === true;

    let color = '#22C55E';
    let label = 'В пределах нормы (T<60)';
    let details = 'T-score в норме — выраженных симптомов ADHD не выявлено.';
    const actions: string[] = [];

    if (t >= 70) {
      color = '#991B1B';
      label = 'Очень значительное повышение (T≥70)';
      details = 'T-score ≥70 — very elevated. Высокая вероятность клинически значимого ADHD.';
      actions.push(
        'Полное диагностическое интервью DSM-5 (K-SADS, DISC)',
        'Оценка коморбидности: ODD, CD, тревога, обучение',
        'Метилфенидат / лисдексамфетамин — 1-я линия у детей',
        'Поведенческая терапия (Parent Training, школьные интервенции)',
        'IEP / 504 план в школе',
      );
    } else if (t >= 60) {
      color = '#F59E0B';
      label = 'Повышенный (T 60-69)';
      details = 'T-score elevated — симптомы выше среднего, требуется дальнейшая оценка.';
      actions.push(
        'Расширенная клиническая оценка',
        'Сбор данных от других информантов (кросс-ситуационность)',
        'Оценка обучения (psychoeducational testing)',
        'Поведенческие стратегии до старта фармакотерапии',
      );
    } else {
      actions.push('ADHD маловероятен; исследовать альтернативные причины жалоб');
    }

    if (t >= 60 && !multi) {
      actions.push('⚠️ Подтвердить симптомы от ≥2 информантов (DSM-5 требует кросс-ситуационности)');
    }
    if (rater === 'self' && age < 8) {
      actions.unshift('Conners-3-SR валиден только с 8 лет');
    }

    return {
      value: String(t),
      unit: 'T-score',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'T-score — стандартизованный (норма 50, SD 10), возраст- и пол-нормирован',
        'Conners-3 содержит шкалы валидности (Positive/Negative Impression, Inconsistency)',
        'Требует ≥2 информантов для DSM-5 (родитель + учитель)',
        'Возраст: Conners-3-P/T 6-18 лет; Conners-3-SR 8-18 лет',
        'Не заменяет интервью — только дополняет',
        'Для взрослых — CAARS (Conners Adult ADHD Rating Scales)',
      ],
      scale: {
        segments: [
          { min: 30, max: 59, label: '<60 норма', color: '#22C55E' },
          { min: 60, max: 69, label: '60-69 elev.', color: '#F59E0B' },
          { min: 70, max: 100, label: '≥70 very elev.', color: '#991B1B' },
        ],
        current: t,
        unit: 'T-score',
      },
      related: [
        { id: 'asrs', title: 'ASRS (взрослые)' },
        { id: 'mchat-autism', title: 'M-CHAT-R/F' },
      ],
      relatedCourses: [{ id: '306.3', title: 'Психиатрия — СДВГ' }],
    };
  },
  info: `### Для чего используется
**Conners-3 (Conners 2008, Multi-Health Systems)** — многомерный опросник для оценки ADHD и сопутствующих поведенческих проблем у детей 6-18 лет. Gold standard в детской психиатрии.

### Формы
| Форма | Возраст | Пункты |
|---|---|---|
| **Conners-3-P** (родитель) | 6-18 | 110 |
| **Conners-3-T** (учитель) | 6-18 | 115 |
| **Conners-3-SR** (самоотчёт) | 8-18 | 99 |

Короткие версии (Conners-3 Short) — 45 пунктов.

### Шкалы (основные)
- Inattention, Hyperactivity/Impulsivity
- Learning Problems, Executive Functioning
- Aggression, Peer/Family Relations
- DSM-5 Symptom Scales (ADHD Inattentive, Hyperactive-Impulsive, CD, ODD)

### T-score интерпретация
| T-score | Уровень | Действие |
|---|---|---|
| <40 | Ниже среднего | — |
| 40-59 | Средний / норма | — |
| **60-64** | Высокий средний | Наблюдение |
| **65-69** | Повышенный (elevated) | Дальнейшая оценка |
| **≥70** | Очень повышенный (very elevated) | Клиническое значение |

### Шкалы валидности
- **Positive Impression** (завышение позитивного) — T≥70 подозрительно
- **Negative Impression** (завышение проблем) — T≥70 подозрительно
- **Inconsistency Index** — >0.17 подозрительно

### Лечение ADHD у детей
- **6-12 лет**: поведенческая терапия + стимуляторы (AAP 2019)
- **<6 лет**: только поведенческая терапия (Parent Training)
- **Стимуляторы**: метилфенидат, амфетамины (response rate ~70-80%)
- **Нестимуляторы**: атомоксетин, гуанфацин XR, клонидин XR

### Ограничения
- Требует двух информантов (DSM-5 Criterion C — cross-situational)
- Стоимость (проприетарный инструмент)
- Не заменяет клиническое интервью`,
};

export default runner;

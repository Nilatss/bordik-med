// @ts-nocheck
/** Runner: pcl5 — PTSD Checklist for DSM-5 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (US VA)',
  reference:
    'Weathers FW, Litz BT, Keane TM, et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD; 2013.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл PCL-5 (20 пунктов × 0-4, max 80)',
      type: 'number',
      min: 0,
      max: 80,
      step: 1,
      quickValues: [10, 20, 31, 45, 60],
      hint: '0-нет, 1-немного, 2-умеренно, 3-значительно, 4-крайне. За последний месяц.',
    },
    {
      id: 'criteria',
      label: 'Подтверждены ≥2 симптома в каждом кластере (B, C, D, E) при пункте ≥2',
      type: 'checkbox',
      points: 0,
      hint: 'B-intrusion (1-5), C-avoidance (6-7), D-cognition/mood (8-14), E-arousal (15-20).',
    },
  ],
  presets: [
    { label: 'Ниже порога (20)', values: { total: 20, criteria: false } },
    { label: 'Вероятный PTSD (38)', values: { total: 38, criteria: true } },
    { label: 'Тяжёлый PTSD (60)', values: { total: 60, criteria: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(80, Number(v.total) || 0));
    const criteria = v.criteria === true;

    let color = '#22C55E';
    let label = 'Ниже порога (<31)';
    let details = 'Симптомы ниже клинически значимого порога PTSD.';
    const actions: string[] = [];

    if (total >= 50) {
      color = '#991B1B';
      label = 'Тяжёлый PTSD (≥50)';
      details = 'Тяжёлая симптоматика PTSD с вероятной функциональной нетрудоспособностью.';
      actions.push(
        'Направление к специалисту по травме',
        'Травма-фокусированная КПТ (CPT, PE) или EMDR — 1-я линия',
        'СИОЗС (сертралин, пароксетин) — FDA-одобрены для PTSD',
        'Оценка коморбидности: депрессия (PHQ-9), СУВ (AUDIT/DAST), суицид (C-SSRS)',
        'Празозин при кошмарах; избегать BZD (ухудшают исход)',
      );
    } else if (total >= 33) {
      color = '#EF4444';
      label = 'Вероятный PTSD (33-49)';
      details = 'Балл выше порога клинической значимости (DSM-5).';
      actions.push(
        'Структурированное интервью CAPS-5 для подтверждения',
        'Травма-фокусированная психотерапия (CPT/PE/EMDR)',
        'СИОЗС/СИОЗСН при отказе от психотерапии или коморбидной депрессии',
        'Повтор PCL-5 каждые 2-4 нед для мониторинга',
      );
    } else if (total >= 21) {
      color = '#F59E0B';
      label = 'Субпороговый (21-32)';
      details = 'Частичные симптомы, возможно субклинический PTSD или другие тревожные расстройства.';
      actions.push(
        'Расширенное клиническое интервью',
        'Дифф.диагноз: acute stress disorder, adjustment, депрессия',
        'Психообразование, поддерживающая терапия',
        'Повтор через 1 мес',
      );
    } else {
      actions.push('Наблюдение; психообразование по копингу со стрессом');
    }

    if (criteria) {
      actions.unshift('Соответствие DSM-5 критериям → диагностическое интервью CAPS-5');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'Cut-off 31-33 — провизионный диагноз; окончательный через CAPS-5',
        'Снижение ≥10-20 баллов на терапии = клинически значимое улучшение',
        'Требуется триггерное травматическое событие (Criterion A DSM-5)',
        'Не путать с PCL-C (старая, DSM-IV) и PCL-M (military)',
        'Коморбидность высока: депрессия, СУВ, суицид — всегда оценивать',
      ],
      scale: {
        segments: [
          { min: 0, max: 20, label: '0-20 ниже порога', color: '#22C55E' },
          { min: 21, max: 32, label: '21-32 субпорог', color: '#F59E0B' },
          { min: 33, max: 49, label: '33-49 вероят.', color: '#EF4444' },
          { min: 50, max: 80, label: '≥50 тяжёлый', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'gad7', title: 'GAD-7' },
      ],
      relatedCourses: [{ id: '306.2', title: 'Психиатрия — тревожные' }],
    };
  },
  info: `### Для чего используется
**PCL-5 (PTSD Checklist for DSM-5; Weathers 2013, National Center for PTSD)** — 20-пунктовый самоопросник, покрывающий все 4 кластера симптомов PTSD по DSM-5. Заменил PCL-C/M после выхода DSM-5 (2013).

### 4 кластера (DSM-5)
| Кластер | Пункты | Симптомы |
|---|---|---|
| **B** Вторжение | 1-5 | Флешбеки, кошмары, воспоминания |
| **C** Избегание | 6-7 | Избегание мыслей/мест |
| **D** Изменение когниций/настроения | 8-14 | Амнезия, негативные убеждения, изоляция |
| **E** Возбуждение/реактивность | 15-20 | Раздражительность, гипербдительность, сон |

### Интерпретация
| PCL-5 | Статус |
|---|---|
| <31 | Ниже клинического порога |
| **31-33** | **Провизионный PTSD (cut-off)** |
| ≥50 | Тяжёлая форма |

DSM-5 провизионный диагноз: ≥1 симптом B, ≥1 C, ≥2 D, ≥2 E на уровне ≥2 ("умеренно") + триггерное событие (Criterion A).

### Лечение 1-й линии
- **Травма-фокусированная КПТ**: Cognitive Processing Therapy (CPT), Prolonged Exposure (PE)
- **EMDR** — Eye Movement Desensitization and Reprocessing
- **Фармако**: сертралин, пароксетин (FDA); венлафаксин (off-label)
- **Избегать**: бензодиазепины (ухудшают долгосрочный исход)

### Мониторинг
Изменение ≥10-20 баллов = клинически значимое.`,
};

export default runner;

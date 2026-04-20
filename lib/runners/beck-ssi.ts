// @ts-nocheck
/** Runner: beck-ssi — Beck Scale for Suicide Ideation */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Beck AT, Kovacs M, Weissman A. Assessment of suicidal intention: the Scale for Suicide Ideation. J Consult Clin Psychol. 1979;47:343-352.',
  inputs: [
    {
      id: 'screening',
      label: 'Пункты 1-5: желание жить/умереть, активное/пассивное желание, продолжительность, частота',
      type: 'number',
      min: 0,
      max: 10,
      step: 1,
      quickValues: [0, 2, 4, 6],
      hint: 'Первые 5 пунктов — скрининг. Если сумма ≥3 или любой ответ ≠0 — оценивать полный опросник (19 пунктов).',
    },
    {
      id: 'total',
      label: 'Суммарный балл Beck SSI (19 пунктов × 0-2, max 38)',
      type: 'number',
      min: 0,
      max: 38,
      step: 1,
      quickValues: [3, 8, 15, 25],
      hint: 'Заполняется при положительном скрининге. Оценивает текущее намерение, методы, подготовку.',
    },
    {
      id: 'prior_attempt',
      label: 'Суицидальная попытка в анамнезе',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (0)', values: { screening: 0, total: 0, prior_attempt: false } },
    { label: 'Скрининг+ (3)', values: { screening: 3, total: 5, prior_attempt: false } },
    { label: 'Высокий (18)', values: { screening: 8, total: 22, prior_attempt: true } },
  ],
  compute: (v) => {
    const screen = Math.max(0, Math.min(10, Number(v.screening) || 0));
    const total = Math.max(0, Math.min(38, Number(v.total) || 0));
    const prior = v.prior_attempt === true;

    let color = '#22C55E';
    let label = 'Отрицательный скрининг';
    let details = 'Первые 5 пунктов отрицательные — дальнейшая оценка не требуется.';
    const actions: string[] = [];

    if (screen >= 3 || total >= 3) {
      if (total >= 20) {
        color = '#7F1D1D';
        label = 'Высокий риск (SSI ≥20)';
        details = `Beck SSI total = ${total}. Выраженная суицидальная идеация с намерением и/или планом.`;
        actions.push(
          '⚠️ Немедленная психиатрическая оценка и возможная госпитализация',
          'C-SSRS для стандартизованной оценки поведения',
          'Means restriction, safety plan',
          'Лечение основной патологии (депрессия, биполяр)',
        );
      } else if (total >= 10) {
        color = '#EF4444';
        label = 'Умеренный риск (SSI 10-19)';
        details = `Beck SSI total = ${total}. Умеренная суицидальная идеация.`;
        actions.push(
          'Срочная психиатрическая оценка',
          'Safety plan, активизация социальной поддержки',
          'Лечение депрессии / коморбидных состояний',
        );
      } else {
        color = '#F59E0B';
        label = 'Требует дальнейшей оценки (≥3)';
        details = `Скрининг положителен (≥3 балла). Beck SSI total = ${total}. Необходима полная оценка суицидального риска.`;
        actions.push(
          'Полная клиническая оценка суицидальности (C-SSRS)',
          'Оценка факторов риска: депрессия, безнадёжность, зависимости',
          'Психиатрическая консультация в течение дней',
        );
      }
    } else {
      actions.push('Повторный скрининг при новых депрессивных эпизодах');
    }

    if (prior) {
      color = color === '#22C55E' ? '#F59E0B' : color;
      actions.push('Попытка в анамнезе — пожизненно повышенный риск; регулярный мониторинг');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'Cutoff ≥3 на скрининговой части (пункты 1-5) — требует полной оценки',
        'SSI total ≥2 на протяжении времени ассоциирован с повышенным долгосрочным риском суицида',
        'Самоопросник — возможна диссимуляция; всегда клиническое интервью',
        'Попытка в анамнезе — сильнейший предиктор независимо от текущего балла',
        'Сочетать с C-SSRS для оценки поведения',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: '0-2 скрининг−', color: '#22C55E' },
          { min: 3, max: 9, label: '3-9 дооценка', color: '#F59E0B' },
          { min: 10, max: 19, label: '10-19 умерен.', color: '#EF4444' },
          { min: 20, max: 38, label: '≥20 высокий', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'c-ssrs', title: 'C-SSRS' },
        { id: 'bdi', title: 'BDI-II' },
        { id: 'phq9', title: 'PHQ-9' },
      ],
      relatedCourses: [{ id: '201.3', title: 'Нейрофизиология' }],
    };
  },
  info: `### Для чего используется
**Beck Scale for Suicide Ideation (BSS, SSI, Beck 1979)** — 19-пунктовая шкала для оценки интенсивности суицидальной идеации. Существует в двух версиях:
- **SSI** — клинический интервью (оригинал)
- **BSS** — самоопросник (модифицированный)

### Структура
- **Пункты 1-5** (скрининг): желание жить, желание умереть, причины жить vs умереть, активное/пассивное желание, продолжительность/частота
- Если скрининг ≥3 → оцениваются **пункты 6-19**: специфика (метод, план, доступ к средствам, уверенность, предсмертная записка, подготовительные акты, сокрытие)

### Интерпретация
| Beck SSI | Риск |
|---|---|
| 0-2 | Скрининг отрицательный |
| **≥3** | **Требует полной клинической оценки** |
| 3-9 | Пограничный / лёгкий |
| 10-19 | Умеренный |
| ≥20 | Высокий |

**Cutoff ≥3** — стандартный порог для дальнейшей оценки; любой не-нулевой ответ в пунктах 4 или 5 также требует оценки.

### Прогностическое значение
- Brown et al. (2000): SSI score ≥2 ассоциирован с **7-кратным увеличением** риска суицида в следующие 20 лет у психиатрических амбулаторных пациентов
- Наиболее предиктивные пункты: активные суицидальные желания, специфичность плана, доступность средств

### Комплементарные шкалы
| Шкала | Применение |
|---|---|
| **C-SSRS** | Стандарт FDA, включает поведение |
| **SAD PERSONS** | Демографические факторы риска |
| **Sheehan-STS** | Tracking интенсивности |
| **P4 Screener** | Ультра-краткий (4 вопроса) |
| **NGASR** | Nurses' Global Assessment of Suicide Risk |

### Ограничения
- Самоопросник — риск диссимуляции (пациент скрывает намерение)
- Не учитывает историческое поведение (в отличие от C-SSRS)
- Не заменяет клиническое интервью

### Источник
Beck AT, Kovacs M, Weissman A. *Assessment of suicidal intention: the Scale for Suicide Ideation.* J Consult Clin Psychol. 1979;47:343-352.`,
};

export default runner;

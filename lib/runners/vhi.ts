// @ts-nocheck
/** Runner: vhi - Voice Handicap Index (VHI-30) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'functional',
      label: 'Функциональная подшкала (F): 10 вопросов × 0-4 = 0-40',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      quickValues: [4, 12, 24, 35],
    },
    {
      id: 'physical',
      label: 'Физическая подшкала (P): 10 вопросов × 0-4 = 0-40',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      quickValues: [5, 15, 28, 36],
    },
    {
      id: 'emotional',
      label: 'Эмоциональная подшкала (E): 10 вопросов × 0-4 = 0-40',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      quickValues: [3, 10, 22, 34],
    },
  ],
  compute: (v) => {
    const f = Math.min(40, Number(v.functional) || 0);
    const p = Math.min(40, Number(v.physical) || 0);
    const e = Math.min(40, Number(v.emotional) || 0);
    const total = f + p + e;

    let band = '', color = '#22C55E', details = '';
    if (total <= 30) {
      band = 'Лёгкое нарушение';
      color = '#22C55E';
      details = `VHI ${total}/120 - минимальное влияние на качество жизни.`;
    } else if (total <= 60) {
      band = 'Умеренное нарушение';
      color = '#F59E0B';
      details = `VHI ${total}/120 - умеренное влияние. Показана фониатрическая оценка и голосовая терапия.`;
    } else {
      band = 'Тяжёлое нарушение';
      color = '#EF4444';
      details = `VHI ${total}/120 - тяжёлое влияние на жизнь. Комплексное обследование + хирургия при органич. патологии.`;
    }

    const dominant = [];
    if (f >= 20) dominant.push('функциональная');
    if (p >= 20) dominant.push('физическая');
    if (e >= 20) dominant.push('эмоциональная');

    return {
      value: String(total),
      unit: '/120',
      interpretation: band,
      color,
      details: `${details} F ${f}/40, P ${p}/40, E ${e}/40.${dominant.length ? ` Доминируют: ${dominant.join(', ')}.` : ''}`,
      actions: [
        'Видеоларингостробоскопия - органическая патология (узелки, полипы, парезы)',
        'Акустический анализ: jitter, shimmer, HNR, MPT (maximal phonation time)',
        total > 30 ? 'Направление к фониатру / логопеду; курс голосовой терапии 8-12 недель' : 'Гигиена голоса, мониторинг',
        'Лечение триггеров: ЛФР (RSI/RFS), курение, алкоголь, аллергия',
        p > 25 ? 'Физич. симптомы выражены - оценить мышечное напряжение (MTD)' : '',
        e > 25 ? 'Эмоциональный импакт высокий - КПТ / психологическая поддержка' : '',
        'При узелках / полипах / кистах - микрохирургия + голосовая терапия (до+после)',
        'MCID: 8 баллов (Jacobson 1997) → 10 баллов (более строгие критерии)',
      ].filter(Boolean),
      caveats: [
        'VHI-30 - самоотчёт, не диагностический',
        '30 вопросов × 0-4 (никогда - всегда) = 0-120, три подшкалы по 10 вопросов',
        'Высокая надёжность: α Кронбаха 0.94-0.95, test-retest r = 0.92',
        'Не различает органическую и функциональную дисфонию',
        'Минимально значимое клиническое изменение (MCID): 8-10 баллов',
        'Альтернативы: VHI-10 (короткая, cutoff 11), V-RQOL, VAPP',
        'Пороги разные в литературе: 30 / 60 (Jacobson); 3-15 / 16-32 / 33-120 (Behrman)',
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: 'Лёгкое', color: '#22C55E' },
          { min: 31, max: 60, label: 'Умеренное', color: '#F59E0B' },
          { min: 61, max: 120, label: 'Тяжёлое', color: '#EF4444' },
        ],
        current: total,
        unit: 'VHI',
      },
      related: [
        { id: 'rsi-rfs', title: 'RSI/RFS' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Jacobson BH, Johnson A, Grywalski C et al. The Voice Handicap Index (VHI): Development and validation. Am J Speech Lang Pathol 1997;6:66-70.',
  countries: 'Международный (ASHA / ELS)',
  presets: [
    { label: 'Узелки голос. складок', values: { functional: 20, physical: 28, emotional: 18 } },
    { label: 'Лёгкое нарушение', values: { functional: 8, physical: 10, emotional: 6 } },
    { label: 'Тяжёлая дисфония', values: { functional: 35, physical: 36, emotional: 32 } },
  ],
  info: `### Для чего используется
**VHI-30 (Voice Handicap Index, Jacobson 1997)** - самоотчёт из 30 вопросов для оценки **субъективного воздействия нарушений голоса** на повседневную жизнь.

### Структура
- **30 вопросов** × 0-4 (никогда → всегда)
- **3 подшкалы** × 10 вопросов × 0-40:
  - **F (Functional)** - работа, телефон, толпа
  - **P (Physical)** - усталость голоса, напряжение, прерывистость
  - **E (Emotional)** - смущение, тревога, депрессия
- **Total:** 0-120

### Интерпретация
| VHI | Тяжесть |
|---|---|
| 0-30 | Лёгкое |
| 31-60 | Умеренное |
| 61-120 | Тяжёлое |

### MCID (Minimal Clinically Important Difference)
**8-10 баллов** (Jacobson 1997).

### Применение
- Отбор пациентов на фониатрическую терапию
- Пред- и послеоперационная оценка (узелки, полипы, паралич складок)
- Мониторинг голосовой терапии (обычно 8-12 недель)
- Оценка профессионального голосовых риска (учителя, певцы)
- Исходы в RCT фонохирургии и голосовой терапии

### VHI-10 (сокращённая)
10 пунктов, cutoff **11**. Быстрый скрининг.

### Альтернативы
- **V-RQOL (Voice-Related Quality of Life)** - 10 пунктов, более социально ориентирован
- **VAPP (Voice Activity and Participation Profile)** - 28 пунктов
- **SVHI (Singing VHI)** - для певцов

### Объективная оценка (дополняет)
- **Видеоларингостробоскопия** - вибрационный паттерн
- **Акустика**: jitter, shimmer, HNR (harmonics-to-noise)
- **Аэродинамика**: MPT, S/Z ratio
- **CAPE-V, GRBAS** - перцептуальная оценка клиницистом

### Источник
Jacobson BH et al. Am J Speech Lang Pathol 1997;6:66.`,
};

export default runner;

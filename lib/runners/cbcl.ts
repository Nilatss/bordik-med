/** Runner: cbcl — Child Behavior Checklist (Achenbach CBCL/1.5-5 & 6-18) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ASEBA, >100 стран)',
  reference:
    'Achenbach TM, Rescorla LA. Manual for the ASEBA School-Age Forms & Profiles (CBCL/6-18, TRF, YSR). Burlington: University of Vermont; 2001.',
  inputs: [
    {
      id: 'version',
      label: 'Версия CBCL',
      type: 'select',
      options: [
        { value: 'preschool', label: 'CBCL/1.5-5 (preschool, 100 пунктов)', points: 0 },
        { value: 'school', label: 'CBCL/6-18 (school-age, 118 пунктов)', points: 0 },
      ],
    },
    {
      id: 'scaleType',
      label: 'Тип шкалы',
      type: 'select',
      options: [
        { value: 'internalising', label: 'Internalising (тревога/депрессия/withdrawn)', points: 0 },
        { value: 'externalising', label: 'Externalising (агрессия/rule-breaking)', points: 0 },
        { value: 'total', label: 'Total Problems', points: 0 },
        { value: 'dsm', label: 'DSM-oriented scale (напр. Affective, Anxiety, ADHD)', points: 0 },
        { value: 'syndrome', label: 'Syndrome scale (напр. Aggressive, Withdrawn, Attention)', points: 0 },
      ],
    },
    {
      id: 'tscore',
      label: 'T-score по выбранной шкале (норм. M=50, SD=10)',
      type: 'number',
      min: 30,
      max: 100,
      step: 1,
      quickValues: [50, 60, 64, 70, 80],
      hint: 'Broadband (Int/Ext/Total): <60 норма, 60-63 пограничн., ≥64 клиническ. DSM/Syndrome: <65 норма, 65-69 погр., ≥70 клиническ.',
    },
    {
      id: 'age',
      hint: 'Возраст в годах',
      label: 'Возраст ребёнка (лет)',
      type: 'number',
      min: 1,
      max: 18,
      step: 1,
      quickValues: [3, 6, 10, 14, 17],
    },
  ],
  presets: [
    { label: 'Норма (Int T=52)', values: { version: 'school', scaleType: 'internalising', tscore: 52, age: 10 } },
    { label: 'Погранич. (Ext T=62)', values: { version: 'school', scaleType: 'externalising', tscore: 62, age: 8 } },
    { label: 'Клинич. DSM (T=72)', values: { version: 'school', scaleType: 'dsm', tscore: 72, age: 12 } },
  ],
  compute: (v) => {
    const version = String(v.version || 'school');
    const scaleType = String(v.scaleType || 'internalising');
    const t = Math.max(30, Math.min(100, Number(v.tscore) || 0));
    const age = Math.max(1, Math.min(18, Number(v.age) || 0));

    const isBroadband = scaleType === 'internalising' || scaleType === 'externalising' || scaleType === 'total';
    const normCut = isBroadband ? 60 : 65;
    const clinCut = isBroadband ? 64 : 70;

    let color = '#22C55E';
    let label = `В пределах нормы (T<${normCut})`;
    let details = `${version === 'preschool' ? 'CBCL/1.5-5' : 'CBCL/6-18'}: шкала "${scaleType}", T=${t} — норма.`;
    const actions: string[] = [];

    if (t >= clinCut) {
      color = '#991B1B';
      label = `Клинически значимое (T≥${clinCut})`;
      details = `${version === 'preschool' ? 'CBCL/1.5-5' : 'CBCL/6-18'}: шкала "${scaleType}", T=${t} — клинический диапазон (${isBroadband ? '≥64' : '≥70'}).`;
      actions.push(
        'Диагностическое интервью DSM-5 (K-SADS, DISC)',
        'Оценка множественных информантов (учитель TRF, самоотчёт YSR 11-18)',
        'Психообразование семьи, направление к детскому психиатру',
        'Доказательное вмешательство (PCIT, Parent Management Training, КПТ)',
      );
      if (scaleType === 'internalising') actions.push('Оценка суицидального риска у подростков (C-SSRS)');
      if (scaleType === 'externalising') actions.push('Оценка ODD / Conduct Disorder / ADHD (Conners-3)');
    } else if (t >= normCut) {
      color = '#F59E0B';
      label = `Пограничное (T ${normCut}-${clinCut - 1})`;
      details = `${version === 'preschool' ? 'CBCL/1.5-5' : 'CBCL/6-18'}: шкала "${scaleType}", T=${t} — borderline / пограничный диапазон.`;
      actions.push(
        'Наблюдение + скрининг через 3-6 мес',
        'Сбор данных от других информантов (TRF учитель, YSR)',
        'Психообразование родителей, школьные стратегии',
      );
    } else {
      actions.push('Поведение в пределах возрастной нормы — плановое наблюдение');
    }

    if (version === 'preschool' && age > 5) {
      actions.unshift('⚠️ CBCL/1.5-5 валиден до 5 лет — для 6+ использовать CBCL/6-18');
    }
    if (version === 'school' && (age < 6 || age > 18)) {
      actions.unshift('⚠️ CBCL/6-18 валиден 6-18 лет');
    }

    return {
      value: String(t),
      unit: 'T-score',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'CBCL — опросник для родителей; TRF — для учителей; YSR — самоотчёт подростка (11-18)',
        'Broadband (Internalising / Externalising / Total): cut-off 60/64',
        'Syndrome & DSM-oriented scales: cut-off 65/70',
        'T-score возраст- и пол-нормирован (US norms; multicultural norms для не-США)',
        'Не заменяет клиническое интервью — только скрининг/мониторинг',
        'Проприетарный инструмент (ASEBA); требует лицензии',
        'Конкордантность между информантами обычно r=0.3-0.5',
      ],
      scale: {
        segments: [
          { min: 30, max: normCut - 1, label: `<${normCut} норма`, color: '#22C55E' },
          { min: normCut, max: clinCut - 1, label: `${normCut}-${clinCut - 1} погр.`, color: '#F59E0B' },
          { min: clinCut, max: 100, label: `≥${clinCut} клинич.`, color: '#991B1B' },
        ],
        current: t,
        unit: 'T-score',
      },
      related: [
        { id: 'conners', title: 'Conners-3' },
        { id: 'mchat-autism', title: 'M-CHAT-R/F' },
      ],
      relatedCourses: [{ id: '306.3', title: 'Детская психиатрия' }],
    };
  },
  info: `### Для чего используется
**CBCL (Achenbach & Rescorla 2001)** — опросник для оценки широкого спектра эмоциональных, поведенческих и социальных проблем у детей. Входит в **ASEBA (Achenbach System of Empirically Based Assessment)** — золотой стандарт детской оценки, используется в >100 странах.

### Возрастные версии
| Версия | Возраст | Пункты | Информант |
|---|---|---|---|
| **CBCL/1.5-5** | 1.5-5 лет | 100 | Родитель |
| **C-TRF** | 1.5-5 лет | 100 | Воспитатель |
| **CBCL/6-18** | 6-18 лет | 118 | Родитель |
| **TRF** | 6-18 лет | 118 | Учитель |
| **YSR** | 11-18 лет | 112 | Самоотчёт |

### Структура CBCL/6-18
**Broadband scales:**
- Internalising (Anxious/Depressed, Withdrawn, Somatic)
- Externalising (Aggressive, Rule-Breaking)
- Total Problems

**Syndrome scales (8):** Anxious/Depressed, Withdrawn, Somatic, Social, Thought, Attention, Rule-Breaking, Aggressive

**DSM-oriented scales (6):** Affective, Anxiety, Somatic, ADHD, Oppositional Defiant, Conduct

### T-score интерпретация
| Шкала | Норма | Пограничное | Клиническое |
|---|---|---|---|
| **Broadband (Int/Ext/Total)** | <60 | 60-63 | **≥64** |
| **Syndrome & DSM** | <65 | 65-69 | **≥70** |

### Использование
- Скрининг в педиатрической и психиатрической практике
- Мониторинг прогресса лечения (pre/post)
- Исследования эпидемиологии и исходов
- Оценка множественных информантов (parent/teacher/self) для DSM-5 Criterion C

### Ограничения
- Опирается на восприятие информанта (может быть искажено)
- Not diagnostic — скрининг/описание, не заменяет DSM интервью
- US normed (но есть multicultural и national нормы)
- Cost-licensed — требует покупки у ASEBA`,
};

export default runner;

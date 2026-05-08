/** Runner: crafft — CRAFFT adolescent substance abuse screening */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (AAP, NIAAA)',
  reference:
    'Knight JR, Shrier LA, Bravender TD, et al. A new brief screen for adolescent substance abuse. Arch Pediatr Adolesc Med. 1999;153(6):591-596.',
  inputs: [
    {
      id: 'c',
      label: 'C — ездили в Car с водителем "под кайфом"?',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'r',
      label: 'R — употребляете, чтобы Relax / почувствовать себя лучше?',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'a',
      label: 'A — употребляете Alone (в одиночестве)?',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'f',
      label: 'F — Forget что делали под действием?',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'f2',
      label: 'F — Friends/Family говорят, что надо сократить?',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 't',
      label: 'T — попадали в Trouble из-за употребления?',
      type: 'checkbox',
      points: 1,
    },
  ],
  presets: [
    { label: 'Отрицательный (1)', values: { c: false, r: true, a: false, f: false, f2: false, t: false } },
    { label: 'Положительный (3)', values: { c: true, r: true, a: true, f: false, f2: false, t: false } },
    { label: 'Высокий риск (5)', values: { c: true, r: true, a: true, f: true, f2: true, t: false } },
  ],
  compute: (v) => {
    const items = ['c', 'r', 'a', 'f', 'f2', 't'];
    const total = items.reduce((acc, id) => acc + (v[id] === true ? 1 : 0), 0);

    let color = '#22C55E';
    let label = 'Отрицательный (<2)';
    let details = 'Скрининг отрицателен. Продолжить профилактическую беседу.';
    const actions: string[] = [];

    if (total >= 4) {
      color = '#991B1B';
      label = 'Высокий риск (≥4)';
      details = 'Высокая вероятность расстройства употребления ПАВ у подростка.';
      actions.push(
        'Направление к специалисту по подростковым зависимостям',
        'Полная оценка по DSM-5 SUD',
        'CRAFFT+N при подозрении на употребление никотина',
        'Семейная терапия, MET/CBT',
        'Токсикология мочи при клинических показаниях',
      );
    } else if (total >= 2) {
      color = '#F59E0B';
      label = 'Положительный (2-3)';
      details = 'Положительный скрининг — требуется дальнейшая оценка.';
      actions.push(
        'Мотивационное интервью (FRAMES)',
        'Расширенная оценка употребления',
        'Повторный скрининг через 3-6 мес',
        'Психообразование о рисках',
      );
    } else {
      actions.push(
        'Психообразование (5 A\'s: Ask, Advise, Assess, Assist, Arrange)',
        'Положительное подкрепление воздержания',
        'Ежегодный повторный скрининг (AAP recommendation)',
      );
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'Возраст 12-21 год (оптимально 14-18)',
        'Перед CRAFFT — 3 "Part A" вопроса о частоте употребления алкоголя/марихуаны/ПАВ за 12 мес',
        'Если все три Part A = "нет" → задают только первый вопрос CRAFFT (Car)',
        'При любом "да" на Part A → все 6 вопросов CRAFFT',
        'Конфиденциальность — ключевой фактор валидности у подростков',
        'Cut-off ≥2: чувствительность 80%, специфичность 86% для SUD',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0-1 отрицат.', color: '#22C55E' },
          { min: 2, max: 3, label: '2-3 положит.', color: '#F59E0B' },
          { min: 4, max: 6, label: '≥4 выс. риск', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'dast', title: 'DAST-10' },
        { id: 'cage-audit', title: 'AUDIT' },
      ],
      relatedCourses: [{ id: '306.1', title: 'Психиатрия — зависимости' }],
    };
  },
  info: `### Для чего используется
**CRAFFT (Knight 1999)** — короткий валидированный скрининг употребления ПАВ у подростков 12-21 лет. Рекомендован AAP, NIAAA. Существует версия **CRAFFT+N** (добавлен никотин, 2018).

### 6 вопросов (мнемоника)
- **C**ar — ездили с "под кайфом" водителем?
- **R**elax — употребляете, чтобы расслабиться?
- **A**lone — употребляете в одиночестве?
- **F**orget — забываете события?
- **F**riends — близкие просят сократить?
- **T**rouble — попадали в неприятности?

### Интерпретация
| CRAFFT | Интерпретация | Тактика |
|---|---|---|
| 0-1 | Низкий риск | Психообразование |
| **≥2** | **Положительный** | Дальнейшая оценка |
| ≥4 | Высокий риск | Специалист по зависимостям |

Cut-off **≥2**: чувствительность 80%, специфичность 86%.

### Алгоритм
1. Part A: 3 вопроса о частоте употребления за 12 мес
2. Если все "нет" → только Car (скрининг "risky driving")
3. Если ≥1 "да" → все 6 вопросов

### Ограничения
- Требует конфиденциальности (отдельно от родителей!)
- Не диагностический — только скрининг
- Возможна диссимуляция`,
};

export default runner;

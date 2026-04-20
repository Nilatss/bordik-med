// @ts-nocheck
/** Runner: ham-d — Hamilton Depression Rating Scale (17-item) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Hamilton M. A rating scale for depression. J Neurol Neurosurg Psychiatry. 1960;23:56-62.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл HAM-D-17 (max 52)',
      type: 'number',
      min: 0,
      max: 52,
      step: 1,
      quickValues: [5, 10, 15, 20, 25, 30],
      hint: 'Сумма 17 пунктов интервью клинициста (8 пунктов 0-4, 9 пунктов 0-2).',
    },
    {
      id: 'suicide',
      label: 'Пункт 3 (суицид) ≥2 баллов',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Ремиссия (5)', values: { total: 5, suicide: false } },
    { label: 'Умеренная (16)', values: { total: 16, suicide: false } },
    { label: 'Очень тяжёлая (26)', values: { total: 26, suicide: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(52, Number(v.total) || 0));
    const suicide = v.suicide === true;

    let color = '#22C55E';
    let label = 'Ремиссия (0-7)';
    let details = 'Критерий ремиссии большого депрессивного эпизода.';
    const actions: string[] = [];

    if (total >= 23) {
      color = '#7F1D1D';
      label = 'Очень тяжёлая (≥23)';
      details = 'Очень тяжёлая депрессия. Высокий риск суицида, психотических симптомов, выраженная нетрудоспособность.';
      actions.push(
        'Госпитализация при суицидальности/психозе',
        'ЭСТ при тяжёлой / психотической / суицидальной форме',
        'Комбинация антидепрессант + атипичный антипсихотик',
      );
    } else if (total >= 19) {
      color = '#EF4444';
      label = 'Тяжёлая (19-22)';
      details = 'Тяжёлая депрессия.';
      actions.push(
        'СИОЗС/СИОЗСН + КПТ; рассмотреть аугментацию',
        'Еженедельный мониторинг, оценка суицида (C-SSRS)',
      );
    } else if (total >= 14) {
      color = '#F59E0B';
      label = 'Умеренная (14-18)';
      details = 'Умеренная депрессия.';
      actions.push('СИОЗС первой линии + психотерапия');
    } else if (total >= 8) {
      color = '#84CC16';
      label = 'Лёгкая (8-13)';
      details = 'Лёгкая депрессия. Неполная ремиссия.';
      actions.push('КПТ / IPT; при хронификации — антидепрессант');
    } else {
      actions.push('Поддерживающая терапия; HAM-D ≤7 — цель лечения');
    }

    if (suicide) {
      color = '#7F1D1D';
      actions.unshift('⚠️ Суицидальный пункт ≥2 — немедленная оценка риска, удаление средств, возможна госпитализация');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'HAM-D — инструмент клинициста, требует обученного интервьюера',
        'Перегружен соматическими пунктами (сон, ЖКТ, вес) — завышает балл при соматической патологии',
        'Цель лечения в RCT — снижение ≥50% от baseline или HAM-D ≤7 (ремиссия)',
        'Для тяжёлой депрессии MADRS чувствительнее к изменениям',
      ],
      scale: {
        segments: [
          { min: 0, max: 7, label: '0-7 ремиссия', color: '#22C55E' },
          { min: 8, max: 13, label: '8-13 лёгкая', color: '#84CC16' },
          { min: 14, max: 18, label: '14-18 умеренная', color: '#F59E0B' },
          { min: 19, max: 22, label: '19-22 тяжёлая', color: '#EF4444' },
          { min: 23, max: 52, label: '≥23 оч.тяж.', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'bdi', title: 'BDI-II' },
        { id: 'c-ssrs', title: 'C-SSRS' },
      ],
      relatedCourses: [{ id: '201.3', title: 'Нейрофизиология' }],
    };
  },
  info: `### Для чего используется
**Hamilton Depression Rating Scale (HAM-D, HDRS, Hamilton 1960)** — клинически-проводимая шкала оценки тяжести депрессии. "Золотой стандарт" для регистрации антидепрессантов в RCT. Классическая версия — **17 пунктов** (max 52).

### Интерпретация (17-item)
| HAM-D | Тяжесть |
|---|---|
| 0-7 | Ремиссия / норма |
| 8-13 | Лёгкая |
| 14-18 | Умеренная |
| 19-22 | Тяжёлая |
| ≥23 | Очень тяжёлая |

**Ответ на терапию** — снижение ≥50% от baseline; **ремиссия** — HAM-D ≤7.

### Структура
- 8 пунктов оцениваются 0-4 (настроение, вина, суицид, ранняя/средняя/поздняя инсомния, работа, заторможенность)
- 9 пунктов 0-2 (возбуждение, психическая/соматическая тревога, ЖКТ, общие соматические, генитальные, ипохондрия, потеря веса, инсайт)

### Ограничения
- Требует обученного интервьюера (~20-30 мин)
- Перегружен соматикой (~1/3 балла)
- Плохо улавливает атипичную депрессию (гиперсомния, переедание)
- MADRS часто предпочитается для мониторинга ответа на терапию`,
};

export default runner;

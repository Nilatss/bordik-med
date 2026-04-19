// @ts-nocheck
/** Runner: ohca — OHCA score (Adrie 2006) for post-cardiac-arrest neuroprognosis */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'rhythm',
      label: 'Первичный ритм',
      type: 'select',
      options: [
        { value: 'shock', label: 'Шокогенный (VF/pVT)' },
        { value: 'nonshock', label: 'Нешокогенный (asystole/PEA)' },
      ],
    },
    { id: 'noflow', label: 'No-flow (от остановки до СЛР)', type: 'number', unit: 'мин', min: 0, max: 60, step: 1, quickValues: [0, 2, 5, 10, 15, 20] },
    { id: 'lowflow', label: 'Low-flow (от СЛР до ROSC)', type: 'number', unit: 'мин', min: 0, max: 90, step: 1, quickValues: [5, 10, 15, 20, 30, 45] },
    { id: 'lactate', label: 'Лактат при поступлении', type: 'number', unit: 'ммоль/л', min: 0, max: 25, step: 0.1, quickValues: [2, 4, 6, 8, 10, 15] },
    { id: 'creat', label: 'Креатинин при поступлении', type: 'number', unit: 'мкмоль/л', min: 30, max: 800, step: 1, quickValues: [80, 120, 180, 250, 400] },
  ],
  compute: (v) => {
    const nonshock = v.rhythm === 'nonshock' ? 1 : 0;
    const noflow = Number(v.noflow);
    const lowflow = Number(v.lowflow);
    const lac = Number(v.lactate);
    const creat = Number(v.creat);

    // Adrie 2006 simplified linear combination (scaled for pedagogy, not raw beta values)
    const score = (nonshock * 15) + (noflow * 2) + (lowflow * 0.5) + (lac * 2) + (creat * 0.02);
    const probPoor = Math.max(5, Math.min(98, Math.round((score - 20) * 1.2 + 30)));

    let interpretation = '', color = '', details = '';
    const actions: string[] = [];

    if (probPoor < 30) {
      interpretation = 'Низкая вероятность плохого неврологического исхода';
      color = '#22C55E';
      details = `Расчётная вероятность плохого неврологического исхода ≈${probPoor}%. Активная нейропротекция оправдана.`;
      actions.push('TTM 32–36 °C ×24 ч (ERC 2021)', 'Нейропрогноз не ранее 72 ч', 'Продолжить ICU-поддержку', 'Консультация кардиолога (реваскуляризация)');
    } else if (probPoor < 60) {
      interpretation = 'Промежуточный риск';
      color = '#F59E0B';
      details = `Вероятность плохого исхода ≈${probPoor}%. Продолжить полный мультимодальный нейропрогноз.`;
      actions.push('TTM + седация', 'NSE 48–72 ч, SSEP, EEG, МРТ/КТ', 'Нейропрогноз по ERC/ESICM 2021', 'Мультидисциплинарное обсуждение');
    } else {
      interpretation = 'Высокая вероятность плохого исхода';
      color = '#DC2626';
      details = `Вероятность плохого неврологического исхода ≈${probPoor}%. Требуется полный мультимодальный нейропрогноз — не принимать решения до 72 ч.`;
      actions.push('Полный протокол нейропрогноза (BIS/SSEP/NSE)', 'Обсуждение с семьёй', 'Не выводить из седации для прогноза раньше 72 ч', 'Документация всех предикторов');
    }

    return {
      value: `${probPoor}%`,
      unit: 'вер.плохого исхода',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'OHCA score (Adrie 2006): рассчитан на внегоспитальные ОК',
        'Переменные: ритм, no-flow, low-flow, лактат, креатинин',
        'Реальная шкала — логистическая регрессия; здесь показано обобщённое ранжирование',
        'Не единственный критерий — использовать в связке с мультимодальным прогнозом (BIS/SSEP/NSE)',
      ],
      related: [
        { id: 'bis', title: 'BIS / SSEP / NSE neuroprog.' },
        { id: 'gcs', title: 'GCS' },
        { id: 'four', title: 'FOUR score' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: 'Низкий', color: '#22C55E' },
          { min: 30, max: 60, label: 'Средний', color: '#F59E0B' },
          { min: 60, max: 100, label: 'Высокий', color: '#DC2626' },
        ],
        current: probPoor,
        unit: '%',
      },
    };
  },
  reference: 'Adrie C et al. Eur Heart J 2006 (OHCA); Maupain C 2016 (CAHP); Ebell 2013 (GO-FAR); Aschauer 2014 (NULL-PLEASE).',
  countries: 'Международный',
  presets: [
    { label: 'VF, быстрая СЛР', values: { rhythm: 'shock', noflow: 2, lowflow: 10, lactate: 3, creat: 90 } },
    { label: 'Asystole, длительная', values: { rhythm: 'nonshock', noflow: 10, lowflow: 30, lactate: 10, creat: 250 } },
  ],
  caveats: [
    'OHCA, CAHP, GO-FAR, NULL-PLEASE имеют разные популяции и сроки оценки',
  ],
  info: `### Для чего используется
Ранний прогноз неврологического исхода у пациентов **после внегоспитальной остановки кровообращения (OHCA)**, на догоспитальных и ранних госпитальных переменных.

### OHCA score (Adrie 2006)
Логистическая регрессия на 5 переменных:
- Первичный ритм (шокогенный / нешокогенный)
- No-flow (от остановки до начала СЛР)
- Low-flow (от начала СЛР до ROSC)
- Лактат при поступлении
- Креатинин при поступлении

Чем больше non-shock, длительный low/no-flow, высокий лактат/креатинин — тем выше вероятность плохого неврологического исхода (CPC 3–5).

### Альтернативные шкалы
| Шкала | Популяция | Параметры |
|---|---|---|
| **OHCA** (Adrie 2006) | OHCA | ритм, no/low-flow, лактат, креатинин |
| **CAHP** (Maupain 2016) | OHCA | возраст, ритм, no/low-flow, pH, адреналин |
| **GO-FAR** (Ebell 2013) | In-hospital CA | до-остановочный статус |
| **NULL-PLEASE** (Aschauer 2014) | OHCA | N.eurologic, U.nwitnessed, L.ong low-flow, L.actate, P.H, E.piNo shock, A.ge, S.top CPR, E.ndo malignancy |

### Практика
1. Ранние шкалы — оценить ожидаемую траекторию
2. Не основывать решения о прекращении терапии только на них
3. Полный прогноз — только после TTM + 72 ч седации (ERC/ESICM 2021, см. BIS/SSEP/NSE)
4. Решения должны быть мультимодальными`,
};

export default runner;

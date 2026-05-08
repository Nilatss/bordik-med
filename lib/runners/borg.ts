/** Runner: borg — Borg RPE (6-20) and modified CR-10 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'scale', label: 'Шкала', type: 'select', options: [
      { value: 'rpe', label: 'Borg RPE 6-20 (нагрузка)' },
      { value: 'cr10', label: 'Modified Borg CR-10 (одышка)' },
    ]},
    { id: 'value', label: 'Оценка пациента', type: 'number', min: 0, max: 20, step: 0.5, quickValues: [0, 3, 5, 7, 10, 13, 17] },
  ],
  compute: (v) => {
    const scale = v.scale || 'rpe';
    let val = Number(v.value || 0);
    if (scale === 'rpe' && val < 6) val = 6;
    if (scale === 'rpe' && val > 20) val = 20;
    if (scale === 'cr10' && val > 10) val = 10;
    let color = '#22C55E', interp = '', details = '';
    let pctHR: string | null = null;
    if (scale === 'rpe') {
      pctHR = `≈ ${(val * 10)} уд/мин (HRmax)`;
      if (val <= 9) { interp = 'Очень лёгкая'; color = '#22C55E'; }
      else if (val <= 11) { interp = 'Лёгкая'; color = '#84CC16'; }
      else if (val <= 13) { interp = 'Умеренная (somewhat hard)'; color = '#F59E0B'; }
      else if (val <= 16) { interp = 'Тяжёлая (hard-very hard)'; color = '#EF4444'; }
      else { interp = 'Максимальная'; color = '#7F1D1D'; }
      details = `Borg RPE 6-20 (Rating of Perceived Exertion). Значение ×10 ≈ ЧСС уд/мин у здоровых взрослых. Целевая зона аэробной тренировки 12-14 (умеренная).`;
    } else {
      if (val <= 1) { interp = 'Нет одышки / очень лёгкая'; color = '#22C55E'; }
      else if (val <= 3) { interp = 'Умеренная одышка'; color = '#84CC16'; }
      else if (val <= 5) { interp = 'Выраженная'; color = '#F59E0B'; }
      else if (val <= 7) { interp = 'Очень выраженная'; color = '#EF4444'; }
      else { interp = 'Максимальная (удушье)'; color = '#7F1D1D'; }
      details = `Modified Borg CR-10 (Category-Ratio). 0 — нет одышки, 10 — максимальная. Применяется для оценки одышки при 6MWT, ХОБЛ, ХСН, реабилитации.`;
    }
    return {
      value: String(val),
      unit: scale === 'rpe' ? 'RPE 6-20' : 'CR-10',
      interpretation: `${interp}${pctHR ? ` (${pctHR})` : ''}`,
      color,
      details,
      actions: [
        scale === 'rpe' && val >= 12 && val <= 14 ? 'Целевая зона умеренной аэробной нагрузки для реабилитации' : '',
        scale === 'rpe' && val >= 17 ? 'Прекратите нагрузку, оцените АД, ЧСС, симптомы' : '',
        scale === 'cr10' && val >= 5 ? 'Снизить нагрузку, SpO2, бронходилататор при ХОБЛ' : '',
        scale === 'cr10' && val >= 7 ? 'Прекратить тест, скоропомощные мероприятия' : '',
        'Оценка до/после тренировки для динамики',
      ].filter(Boolean),
      caveats: [
        'Borg RPE 6-20 коррелирует с ЧСС у здоровых, но не у пациентов на β-блокаторах',
        'CR-10 нелинейна: между 3 и 5 большой разрыв в физиологии',
        'Субъективна — требует разъяснения терминов каждому пациенту',
        'При невозможности вербализации — Faces Pain Scale / wong-baker как альтернатива',
      ],
      scale: {
        segments: scale === 'rpe' ? [
          { min: 6, max: 10, label: '6-9 оч.лёгк.', color: '#22C55E' },
          { min: 10, max: 12, label: '10-11 лёгк.', color: '#84CC16' },
          { min: 12, max: 14, label: '12-13 умер.', color: '#F59E0B' },
          { min: 14, max: 17, label: '14-16 тяж.', color: '#EF4444' },
          { min: 17, max: 21, label: '17-20 макс.', color: '#7F1D1D' },
        ] : [
          { min: 0, max: 2, label: '0-1 нет', color: '#22C55E' },
          { min: 2, max: 4, label: '2-3 умер.', color: '#84CC16' },
          { min: 4, max: 6, label: '4-5 выраж.', color: '#F59E0B' },
          { min: 6, max: 8, label: '6-7 оч.выр.', color: '#EF4444' },
          { min: 8, max: 11, label: '8-10 макс.', color: '#7F1D1D' },
        ],
        current: val,
        unit: scale === 'rpe' ? 'RPE' : 'CR-10',
      },
      related: [{ id: '6mwt', title: '6MWT' }, { id: 'fim-rehab', title: 'FIM' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Borg GA. Psychophysical bases of perceived exertion. Med Sci Sports Exerc 1982;14:377-381.',
  countries: 'Международный',
  presets: [
    { label: 'RPE — умеренная', values: { scale: 'rpe', value: 13 } },
    { label: 'CR-10 — лёгкая одышка', values: { scale: 'cr10', value: 2 } },
    { label: 'CR-10 — тяжёлая', values: { scale: 'cr10', value: 7 } },
  ],
  info: `### Для чего используется
**Borg RPE (Rating of Perceived Exertion)** — субъективная оценка воспринимаемой нагрузки. Две основные шкалы:

### Borg RPE 6-20
| Балл | Описание |
|---|---|
| 6 | Нет нагрузки |
| 9 | Очень лёгкая |
| 11 | Лёгкая |
| 13 | Немного тяжёлая |
| 15 | Тяжёлая |
| 17 | Очень тяжёлая |
| 19-20 | Максимальная |

Значение ×10 ≈ ЧСС уд/мин. Целевая зона для тренировки: 12-14.

### Modified Borg CR-10
| Балл | Одышка |
|---|---|
| 0 | Нет |
| 0.5 | Очень очень лёгкая |
| 1 | Очень лёгкая |
| 2 | Лёгкая |
| 3 | Умеренная |
| 4 | Немного сильная |
| 5 | Сильная |
| 7 | Очень сильная |
| 10 | Максимальная |

Используется при 6MWT, ХОБЛ, ХСН, нагрузочных тестах.

### Источник
Borg GA. Med Sci Sports Exerc 1982.`,
};

export default runner;

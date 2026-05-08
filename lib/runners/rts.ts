/** Runner: rts - Revised Trauma Score (Champion 1989) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'trts', label: 'T-RTS (triage, 0-12)' },
        { value: 'rts', label: 'RTS mortality (weighted, 0-7.84)' },
      ],
    },
    {
      id: 'gcs',
      label: 'GCS',
      type: 'select',
      options: [
        { value: '15', label: '13-15' },
        { value: '12', label: '9-12' },
        { value: '8', label: '6-8' },
        { value: '5', label: '4-5' },
        { value: '3', label: '3' },
      ],
    },
    {
      id: 'sbpc',
      label: 'САД',
      type: 'select',
      options: [
        { value: '4', label: '≥ 90' },
        { value: '3', label: '76-89' },
        { value: '2', label: '50-75' },
        { value: '1', label: '1-49' },
        { value: '0', label: '0' },
      ],
    },
    {
      id: 'rrc',
      label: 'ЧДД',
      type: 'select',
      options: [
        { value: '4', label: '10-29' },
        { value: '3', label: '> 29' },
        { value: '2', label: '6-9' },
        { value: '1', label: '1-5' },
        { value: '0', label: '0' },
      ],
    },
  ],
  compute: (v) => {
    const mode = String(v.mode || 'trts');
    const gcs = Number(v.gcs);
    const sbpc = Number(v.sbpc);
    const rrc = Number(v.rrc);
    const gcsC = gcs >= 13 ? 4 : gcs >= 9 ? 3 : gcs >= 6 ? 2 : gcs >= 4 ? 1 : 0;
    let val: number; let maxV: number;
    if (mode === 'trts') {
      val = gcsC + sbpc + rrc;
      maxV = 12;
    } else {
      val = 0.9368 * gcsC + 0.7326 * sbpc + 0.2908 * rrc;
      maxV = 7.84;
    }
    let interpretation = ''; let color = '#22C55E'; let details = ''; const actions: string[] = [];
    if (mode === 'trts') {
      if (val < 11) { interpretation = 'Тяжёлая травма - транспортировка в trauma center'; color = '#DC2626'; details = 'T-RTS < 11 - показание для перевода в trauma center I/II уровня.'; actions.push('Активация trauma team', 'Транспорт в регионарный trauma center', 'Повторная оценка каждые 10 мин'); }
      else if (val === 11) { interpretation = 'Пограничная травма'; color = '#FACC15'; details = 'T-RTS 11 - наблюдение, trauma center при дополнительных критериях.'; }
      else { interpretation = 'Норма'; color = '#22C55E'; details = 'T-RTS 12 - нет физиологических критериев для trauma team activation (учесть механизм и анатомию!).'; }
    } else {
      if (val >= 7) { interpretation = 'Высокая Ps'; color = '#22C55E'; details = `RTS ${val.toFixed(2)} - низкая ожидаемая смертность.`; }
      else if (val >= 5) { interpretation = 'Средняя Ps'; color = '#FACC15'; details = `RTS ${val.toFixed(2)}.`; }
      else if (val >= 3) { interpretation = 'Низкая Ps'; color = '#EF4444'; details = `RTS ${val.toFixed(2)} - высокая смертность.`; }
      else { interpretation = 'Очень низкая Ps'; color = '#991B1B'; details = `RTS ${val.toFixed(2)} - критическая.`; }
    }
    return {
      value: mode === 'trts' ? String(val) : val.toFixed(2),
      unit: mode === 'trts' ? 'T-RTS' : 'RTS',
      interpretation,
      color,
      details,
      actions: actions.length ? actions : ['Используется как компонент TRISS', 'Повторять при ухудшении'],
      caveats: [
        'T-RTS - для догоспитальной triage (cutoff < 11)',
        'Mortality RTS - для TRISS и trauma registry',
        'Не оценивается у интубированных (нет вербального компонента GCS) - используйте motor-только или FOUR',
      ],
      scale: mode === 'trts'
        ? { segments: [ { min: 0, max: 11, label: 'Trauma center', color: '#DC2626' }, { min: 11, max: 12, label: 'Borderline', color: '#FACC15' }, { min: 12, max: 13, label: 'Norm', color: '#22C55E' } ], current: val, unit: 'T-RTS' }
        : { segments: [ { min: 0, max: 3, label: 'Very low', color: '#991B1B' }, { min: 3, max: 5, label: 'Low', color: '#EF4444' }, { min: 5, max: 7, label: 'Medium', color: '#FACC15' }, { min: 7, max: 7.84, label: 'High', color: '#22C55E' } ], current: val, unit: 'RTS' },
      related: [
        { id: 'triss', title: 'TRISS' },
        { id: 'iss', title: 'ISS' },
        { id: 'gcs', title: 'GCS' },
        { id: 'kts', title: 'KTS' },
        { id: 'sieve-sort', title: 'SIEVE + SORT' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Champion HR, Sacco WJ, Copes WS, Gann DS, Gennarelli TA, Flanagan ME. A revision of the Trauma Score. J Trauma 1989;29:623-629.',
  countries: 'Международный',
  presets: [
    { label: 'T-RTS 12 - норма', values: { mode: 'trts', gcs: '15', sbpc: '4', rrc: '4' } },
    { label: 'T-RTS 9 - тяжёлая', values: { mode: 'trts', gcs: '8', sbpc: '2', rrc: '3' } },
    { label: 'RTS mortality - шок', values: { mode: 'rts', gcs: '12', sbpc: '2', rrc: '3' } },
  ],
  info: `### Для чего используется
**Revised Trauma Score (Champion, 1989)** - физиологический индекс тяжести по 3 параметрам (GCS, САД, ЧДД).

### Два варианта
**T-RTS (triage)** - простая сумма кодов 0-4:
\`T-RTS = GCS-c + SBP-c + RR-c\`  (макс. 12)
- < 11 → trauma center

**RTS (mortality)** - взвешенная сумма для TRISS:
\`RTS = 0.9368×GCS-c + 0.7326×SBP-c + 0.2908×RR-c\`  (0-7.84)

### Кодирование
| Параметр | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|
| GCS | 13-15 | 9-12 | 6-8 | 4-5 | 3 |
| САД | ≥90 | 76-89 | 50-75 | 1-49 | 0 |
| ЧДД | 10-29 | >29 | 6-9 | 1-5 | 0 |

### Cutoffs
- **T-RTS < 11** - sensitivity ~97% для major trauma → trauma center
- **RTS = 7.84** - максимум (нормальная физиология)
- **RTS = 0** - смерть

### Применение
- Догоспитальная triage (UK SORT)
- Компонент TRISS
- Мониторинг в ОРИТ
- Сравнение популяций

### Ограничения
- Не годится для интубированных (нет V-компонента GCS)
- Зависит от возможности измерить GCS (AMS, интоксикация)
- Не учитывает анатомию (нужна комбинация с ISS)

### Источник
Champion HR et al. *A revision of the Trauma Score.* J Trauma 1989;29:623
`,
};

export default runner;

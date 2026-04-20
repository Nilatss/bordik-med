// @ts-nocheck
/** Runner: gleason */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'primary',
      label: 'Первичный паттерн (доминирующий)',
      type: 'select',
      options: [
        { value: '1', label: '1 — хорошо дифференцированные железы' },
        { value: '2', label: '2 — слегка инфильтративный рост' },
        { value: '3', label: '3 — отдельные мелкие железы (частый)' },
        { value: '4', label: '4 — слившиеся железы / cribriform' },
        { value: '5', label: '5 — нет дифференцировки / solid / some' },
      ],
    },
    {
      id: 'secondary',
      label: 'Вторичный паттерн',
      type: 'select',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
      ],
    },
  ],
  compute: (v) => {
    const p = Number(v.primary);
    const s = Number(v.secondary);
    const total = p + s;
    let group = 1;
    let groupText = '';
    let color = '';
    let details = '';
    let interpretation = '';

    if (total <= 6) {
      group = 1;
      groupText = 'Grade Group 1';
      color = '#22C55E';
      details = 'Хорошо дифференцированная аденокарцинома. Низкий риск прогрессии. 5-летняя БРВ > 95%.';
      interpretation = 'Низкий риск (well-differentiated)';
    } else if (p === 3 && s === 4) {
      group = 2;
      groupText = 'Grade Group 2';
      color = '#84CC16';
      details = 'Gleason 3+4=7. Промежуточный благоприятный прогноз. 5-летняя БРВ ~ 85-90%.';
      interpretation = 'Благоприятный промежуточный';
    } else if (p === 4 && s === 3) {
      group = 3;
      groupText = 'Grade Group 3';
      color = '#F59E0B';
      details = 'Gleason 4+3=7. Промежуточный неблагоприятный прогноз. 5-летняя БРВ ~ 70-80%.';
      interpretation = 'Неблагоприятный промежуточный';
    } else if (total === 8) {
      group = 4;
      groupText = 'Grade Group 4';
      color = '#EF4444';
      details = 'Gleason 8 (4+4, 3+5, 5+3). Высокий риск прогрессии. 5-летняя БРВ ~ 50-70%.';
      interpretation = 'Высокий риск';
    } else {
      group = 5;
      groupText = 'Grade Group 5';
      color = '#7F1D1D';
      details = 'Gleason 9-10. Очень высокий риск. 5-летняя БРВ < 50%.';
      interpretation = 'Очень высокий риск';
    }

    return {
      value: `${p}+${s}=${total}`,
      unit: groupText,
      interpretation: `${groupText} (ISUP 2014) — ${interpretation}`,
      color,
      details,
      actions: [
        'PSA, пальцевое ректальное исследование, МРТ малого таза',
        'Мультипараметрическая МРТ (PI-RADS v2.1) при необходимости',
        'Стратификация риска по D’Amico / NCCN',
        group >= 4 ? 'КТ ОГК/ОБП, сцинтиграфия скелета / PSMA-PET (исключить метастазы)' : 'Визуализация по показаниям',
        group <= 1 ? 'Возможно активное наблюдение (active surveillance)' : 'Обсудить радикальную простатэктомию или ЛТ ± ADT',
      ],
      caveats: [
        'ISUP 2014: 5 Grade Groups вместо суммы Gleason 2-10 (упрощение для коммуникации)',
        'Паттерны 1 и 2 больше не ставятся в биопсии (всегда ≥ 3)',
        'Primary pattern = наиболее распространённый (≥ 50%), secondary = второй по частоте',
        'Третичный паттерн 5 добавляет прогностическое значение при RP',
        'Cribriform и интрадуктальная карцинома — плохой прогноз даже при Gleason 3+4',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'GG1', color: '#22C55E' },
          { min: 2, max: 3, label: 'GG2', color: '#84CC16' },
          { min: 3, max: 4, label: 'GG3', color: '#F59E0B' },
          { min: 4, max: 5, label: 'GG4', color: '#EF4444' },
          { min: 5, max: 6, label: 'GG5', color: '#7F1D1D' },
        ],
        current: group,
        unit: 'Grade Group',
      },
      related: [
        { id: 'd-amico', title: 'D’Amico' },
        { id: 'pirads', title: 'PI-RADS' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Epstein JI et al. The 2014 International Society of Urological Pathology (ISUP) Consensus Conference on Gleason Grading of Prostatic Carcinoma. Am J Surg Pathol 2016;40:244-252.',
  countries: 'Международный (ISUP 2014 / WHO 2016)',
  presets: [
    { label: '3+3=6 (GG1)', values: { primary: '3', secondary: '3' } },
    { label: '3+4=7 (GG2)', values: { primary: '3', secondary: '4' } },
    { label: '4+5=9 (GG5)', values: { primary: '4', secondary: '5' } },
  ],
  info: `### Для чего используется
**Gleason score + ISUP Grade Group** — гистологическая градация **аденокарциномы простаты**, ключевой прогностический фактор для выбора тактики.

### Паттерны (1-5)
| Паттерн | Гистология |
|---|---|
| **1** | Чётко ограниченные узлы однообразных желёз (исторический) |
| **2** | Лёгкая инфильтрация (редкий) |
| **3** | Отдельные мелкие железы, инвазия в строму |
| **4** | Слившиеся железы, cribriform, гломерулярные |
| **5** | Нет дифференцировки, solid, комедо-некроз |

### Подсчёт
- **Primary pattern** — наиболее распространённый (≥ 50%)
- **Secondary pattern** — второй по частоте
- **Gleason score** = primary + secondary (например, 3+4=7)

### ISUP Grade Groups (2014)
| Group | Gleason | Прогноз |
|---|---|---|
| **1** | ≤ 6 (3+3) | Отлично — БРВ > 95% |
| **2** | 3+4=7 | Благоприятный промежуточный |
| **3** | 4+3=7 | Неблагоприятный промежуточный |
| **4** | 8 (4+4, 3+5, 5+3) | Высокий риск |
| **5** | 9-10 | Очень высокий |

### Связь с D’Amico
- **Низкий**: GG1 + PSA < 10 + cT1-T2a
- **Средний**: GG2-3 или PSA 10-20 или cT2b
- **Высокий**: GG4-5 или PSA > 20 или cT2c-T3

### Важные детали
- Паттерны 1-2 в биопсии **не ставят** (артефакт)
- **Cribriform и интрадуктальная** карцинома — агрессивны (даже в GG2)
- **Третичный паттерн 5** в RP добавляет прогноз
- Точность биопсии vs RP: до 30% апгрейда при RP

### Ограничения
- Межнаблюдательская вариабельность ~ 20%
- Не учитывает молекулярные маркёры (Decipher, Prolaris, Oncotype GPS)
- Cribriform и ductal components недооцениваются в обычном Gleason`,
};
export default runner;

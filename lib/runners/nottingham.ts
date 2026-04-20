// @ts-nocheck
/** Runner: nottingham */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tubules',
      label: 'Формирование канальцев / желёз',
      type: 'select',
      options: [
        { value: '1', label: '1 — > 75% опухоли формирует канальцы' },
        { value: '2', label: '2 — 10-75% канальцев' },
        { value: '3', label: '3 — < 10% канальцев' },
      ],
    },
    {
      id: 'pleomorphism',
      label: 'Ядерный плеоморфизм',
      type: 'select',
      options: [
        { value: '1', label: '1 — мелкие правильные однообразные ядра' },
        { value: '2', label: '2 — умеренный плеоморфизм' },
        { value: '3', label: '3 — выраженный плеоморфизм, крупные ядрышки' },
      ],
    },
    {
      id: 'mitoses',
      label: 'Митотическая активность (HPF)',
      type: 'select',
      options: [
        { value: '1', label: '1 — низкая (< 10 митозов / 10 HPF)' },
        { value: '2', label: '2 — умеренная (10-19 / 10 HPF)' },
        { value: '3', label: '3 — высокая (≥ 20 / 10 HPF)' },
      ],
    },
  ],
  compute: (v) => {
    const t = Number(v.tubules);
    const p = Number(v.pleomorphism);
    const m = Number(v.mitoses);
    const total = t + p + m;

    let grade = '';
    let gradeNum = 0;
    let color = '';
    let details = '';
    let interpretation = '';

    if (total <= 5) {
      grade = 'Grade I';
      gradeNum = 1;
      color = '#22C55E';
      details = 'Хорошо дифференцированная карцинома. Низкий риск рецидива. 10-летняя выживаемость > 85%.';
      interpretation = 'Хорошо дифференцированная (G1)';
    } else if (total <= 7) {
      grade = 'Grade II';
      gradeNum = 2;
      color = '#F59E0B';
      details = 'Умеренно дифференцированная карцинома. Промежуточный прогноз. 10-летняя выживаемость ~ 65-75%.';
      interpretation = 'Умеренно дифференцированная (G2)';
    } else {
      grade = 'Grade III';
      gradeNum = 3;
      color = '#EF4444';
      details = 'Низкодифференцированная карцинома. Высокий риск рецидива. 10-летняя выживаемость ~ 45-55%.';
      interpretation = 'Низкодифференцированная (G3)';
    }

    return {
      value: `${total}/9`,
      unit: grade,
      interpretation: `Nottingham / BRE: ${interpretation}`,
      color,
      details,
      actions: [
        'ИГХ-панель: ER, PR, HER2, Ki-67 (обязательно для всех инвазивных карцином)',
        'HER2: 0 / 1+ (отрицательный), 2+ (двусмысленно → ISH), 3+ (положительный) — ASCO/CAP 2018',
        'Ki-67: < 14% низкий, 14-30% умеренный, > 30% высокий',
        gradeNum >= 2 ? 'Рассмотреть Oncotype DX / MammaPrint для ER+ HER2− N0 (выбор химиотерапии)' : 'NPI, стадирование по TNM',
        'Мультидисциплинарный консилиум, план лечения по молекулярному подтипу',
      ],
      caveats: [
        'Nottingham = Elston-Ellis modification of Scarff-Bloom-Richardson (1991)',
        'Оценивается только на парафиновых срезах с H&E (не по ТАБ)',
        'Митозы считаются в 10 HPF в зоне максимальной активности',
        'HER2 ASCO/CAP 2018: низкоэкспрессирующий HER2-low (1+ или 2+/ISH−) — новая категория для T-DXd',
        'Для молекулярных подтипов (Luminal A/B, HER2+, TNBC) — дополнительно IHC4 или OncotypeDX',
      ],
      scale: {
        segments: [
          { min: 3, max: 6, label: 'G1', color: '#22C55E' },
          { min: 6, max: 8, label: 'G2', color: '#F59E0B' },
          { min: 8, max: 10, label: 'G3', color: '#EF4444' },
        ],
        current: total,
        unit: 'балл',
      },
      related: [
        { id: 'npi-breast', title: 'NPI (breast)' },
        { id: 'oncotype', title: 'Oncotype DX' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Elston CW, Ellis IO. Pathological prognostic factors in breast cancer. I. The value of histological grade in breast cancer: experience from a large study with long-term follow-up. Histopathology 1991;19:403-410.',
  countries: 'Международный (WHO / CAP)',
  presets: [
    { label: 'G1 (3+1+1=5)', values: { tubules: '1', pleomorphism: '1', mitoses: '1' } },
    { label: 'G2 (2+2+2=6)', values: { tubules: '2', pleomorphism: '2', mitoses: '2' } },
    { label: 'G3 (3+3+3=9)', values: { tubules: '3', pleomorphism: '3', mitoses: '3' } },
  ],
  info: `### Для чего используется
**Nottingham / BRE (Bloom-Richardson-Elston) grade** — гистологическая градация **инвазивного рака молочной железы** по трём параметрам. Обязательна для всех инвазивных карцином.

### Компоненты (каждый 1-3 балла)
| Компонент | 1 балл | 2 балла | 3 балла |
|---|---|---|---|
| **Канальцы / железы** | > 75% | 10-75% | < 10% |
| **Ядерный плеоморфизм** | Мелкие однообразные | Умеренный | Выраженный, крупные ядрышки |
| **Митозы / 10 HPF** (FN1/Fn2/Fn3) | < 10 | 10-19 | ≥ 20 |

### Итоговая градация
| Сумма | Grade | Прогноз (10-летняя выживаемость) |
|---|---|---|
| 3-5 | **G1** — хорошо дифференцированная | > 85% |
| 6-7 | **G2** — умеренно | 65-75% |
| 8-9 | **G3** — низкодифференцированная | 45-55% |

### HER2 ASCO/CAP 2018
| IHC | Интерпретация | Тактика |
|---|---|---|
| **0** | Отрицательный | Chemo ± ET |
| **1+** | Отрицательный (HER2-low) | **Можно T-DXd** при метастатической |
| **2+** | Двусмысленный | **ISH** (FISH) |
| **3+** | Положительный | Трастузумаб / пертузумаб |

### Ki-67 (IHC4)
| % | Интерпретация |
|---|---|
| < 14% | Низкий (Luminal A при ER+/PR+) |
| 14-30% | Умеренный |
| > 30% | Высокий (Luminal B или TNBC) |

### Молекулярные подтипы
| Подтип | ER/PR | HER2 | Ki-67 | Тактика |
|---|---|---|---|---|
| **Luminal A** | + | − | < 14% | ET (тамоксифен / AI) |
| **Luminal B** | + | − | > 14% | ET + chemo |
| **Luminal B HER2+** | + | + | варьирует | ET + anti-HER2 + chemo |
| **HER2+** | − | + | варьирует | Chemo + anti-HER2 |
| **TNBC** | − | − | обычно высокий | Chemo ± PARP-inhibitors (BRCA) |

### Применение
- Прогностический фактор (входит в NPI, Adjuvant!, PREDICT)
- Часть решения о chemo (особенно G3 или ER+/G2 + Oncotype)
- Воспроизводимость между патологами ~ 70-80%

### Ограничения
- Субъективность оценки митозов и плеоморфизма
- Не заменяет молекулярные тесты (Oncotype, MammaPrint)
- Для DCIS используется Van Nuys или WHO (не Nottingham)`,
};
export default runner;

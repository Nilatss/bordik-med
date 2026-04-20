// @ts-nocheck
/** Runner: gmsps — Glasgow Meningococcal Septicaemia Prognostic Score */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'hypotension', label: 'САД < 75 (< 4 лет) или < 85 (> 4 лет) мм рт.ст.', type: 'checkbox', points: 3 },
    { id: 'skin_gap', label: 'Кожно-центральная разница t° > 3 °C', type: 'checkbox', points: 3 },
    { id: 'gcs_drop', label: 'Ухудшение GCS > 3 или GCS < 8', type: 'checkbox', points: 3 },
    { id: 'deterioration', label: 'Быстрое ухудшение за последний час', type: 'checkbox', points: 2 },
    { id: 'no_meningism', label: 'Отсутствие менингизма', type: 'checkbox', points: 2 },
    { id: 'purpura', label: 'Распространяющаяся пурпура / экхимозы', type: 'checkbox', points: 1 },
    { id: 'be', label: 'Дефицит оснований (BE) < −8', type: 'checkbox', points: 1 },
  ],
  compute: (v) => {
    const pts =
      (v.hypotension ? 3 : 0) +
      (v.skin_gap ? 3 : 0) +
      (v.gcs_drop ? 3 : 0) +
      (v.deterioration ? 2 : 0) +
      (v.no_meningism ? 2 : 0) +
      (v.purpura ? 1 : 0) +
      (v.be ? 1 : 0);

    let color = '#22C55E';
    let risk = 'Низкий (< 5 %)';
    let disposition = 'Наблюдение в ICU';

    if (pts >= 8) { color = '#EF4444'; risk = 'Очень высокий (~ 73 %)'; disposition = 'ICU немедленно, агрессивная ресусцитация'; }
    else if (pts >= 6) { color = '#F97316'; risk = 'Высокий (~ 40 %)'; disposition = 'ICU, вазопрессоры, инотропы'; }
    else if (pts >= 4) { color = '#F59E0B'; risk = 'Умеренный (~ 15 %)'; disposition = 'ICU, мониторинг'; }

    return {
      value: `${pts} / 15`,
      unit: 'GMSPS',
      interpretation: `Прогноз: ${risk}. ${disposition}.`,
      color,
      details: `Glasgow Meningococcal Septicaemia Prognostic Score (Sinclair 1987) — предсказание смертности при менингококковом сепсисе у детей. GMSPS ≥ 8 → ~ 73 % смертность; < 8 → < 5 %. Валидирован на когортах Великобритании.`,
      actions: [
        'Цефтриаксон 50–100 мг/кг (max 2 г) в/в немедленно — даже до LP',
        'Агрессивная инфузия 20 мл/кг кристаллоидов × 3 (при шоке)',
        'При рефрактерной гипотензии — норэпинефрин + адреналин',
        'ИВЛ при GCS ≤ 8 или дыхательной недостаточности',
        'Профилактика контактов: ципрофлоксацин 500 мг × 1 (взрослые) или рифампицин 600 мг × 2/сут × 2 дн; детям — рифампицин 10 мг/кг × 2 × 2 дн',
        'Изоляция капельная до 24 ч после АБ',
        'Оповестить органы общественного здравоохранения (reportable disease)',
        'Дексаметазон 0,15 мг/кг × 4 дн — только при менингите (не при чистом сепсисе)',
        'Мониторинг ДВС-синдрома: тромбоциты, фибриноген, D-димер',
      ],
      caveats: [
        'Валидирован у детей; у взрослых — менее точен',
        'Часть компонентов субъективны (скорость ухудшения)',
        'Современные когорты показывают ниже смертность благодаря ранней ресусцитации',
        'Не заменяет SOFA/qSOFA, дополняет специфичную оценку менингококцемии',
        'Пурпура фульминантная при счёте ≥ 8 — показание к перевозу в экспертный центр',
      ],
      scale: {
        segments: [
          { min: 0, max: 4, label: 'Низкий', color: '#22C55E' },
          { min: 4, max: 6, label: 'Умерен.', color: '#F59E0B' },
          { min: 6, max: 8, label: 'Высокий', color: '#F97316' },
          { min: 8, max: 15, label: 'Оч. высок.', color: '#EF4444' },
        ],
        current: pts,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '303.1', title: 'Педиатрия' },
      ],
      related: [
        { id: 'nigrovic', title: 'Nigrovic BMS' },
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'ssc', title: 'SSC Hour-1' },
      ],
    };
  },
  reference: 'Sinclair JF, Skeoch CH, Hallworth D. Lancet 1987;2:38 (GMSPS).',
  countries: 'Великобритания / Международный',
  presets: [
    { label: 'Лёгкий случай', values: { hypotension: false, skin_gap: false, gcs_drop: false, deterioration: false, no_meningism: false, purpura: true, be: false } },
    { label: 'Умеренный', values: { hypotension: true, skin_gap: false, gcs_drop: false, deterioration: false, no_meningism: false, purpura: true, be: false } },
    { label: 'Фульминантный (≥ 8)', values: { hypotension: true, skin_gap: true, gcs_drop: true, deterioration: true, no_meningism: false, purpura: true, be: true } },
  ],
  info: `### Для чего используется
**Glasgow Meningococcal Septicaemia Prognostic Score (GMSPS)** — прогноз смертности при менингококковом сепсисе у детей. Ключевая точка — **GMSPS ≥ 8 = ~ 73 % смертности**.

### 7 критериев
| Критерий | Баллы |
|---|---|
| САД < 75 (< 4 лет) / < 85 (> 4 лет) | 3 |
| Кожно-центральная Δt° > 3 °C | 3 |
| GCS ухудшение > 3 или < 8 | 3 |
| Ухудшение за час | 2 |
| Отсутствие менингизма | 2 |
| Распространяющаяся пурпура | 1 |
| BE < −8 | 1 |
| **Максимум** | 15 |

### Интерпретация
| GMSPS | Смертность |
|---|---|
| < 4 | < 5 % |
| 4–5 | ~ 15 % |
| 6–7 | ~ 40 % |
| ≥ 8 | ~ 73 % |

### Терапия менингококкового сепсиса
**Антибиотики — НЕМЕДЛЕННО** (до или одновременно с LP):
- Цефтриаксон 50–100 мг/кг (max 2 г) в/в
- Альтернатива: цефотаксим, бензилпенициллин

**Ресусцитация:**
- Кристаллоиды 20 мл/кг × 3 болюса
- Норэпинефрин + адреналин при рефрактерной гипотензии
- ИВЛ при GCS ≤ 8

**Дополнительно:**
- Дексаметазон при менингите (не при чистом сепсисе)
- Мониторинг ДВС, электролитов, лактата
- Активированный белок С — не рекомендуется (отозван)

### Профилактика контактов
- Ципрофлоксацин 500 мг × 1 (взрослые)
- Рифампицин 10 мг/кг × 2/сут × 2 дн (дети)
- Цефтриаксон 125–250 мг в/м × 1 (беременные)
- Вакцина MenACWY / MenB — в очаге

### Изоляция
Капельная × 24 ч после АБ.

### Ограничения
- Педиатрическая шкала
- Часть критериев субъективна
- Современная смертность ниже (раннее распознавание, ресусцитация)
- Не заменяет SOFA/qSOFA

### Источник
Sinclair JF, Skeoch CH, Hallworth D. *Prognosis of meningococcal septicaemia.* Lancet 1987;2(8549):38.`,
};

export default runner;

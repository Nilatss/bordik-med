// @ts-nocheck
/** Runner: tibc — Iron study panel (Iron + TIBC + Ferritin + TSAT) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'iron', label: 'Железо сыворотки', type: 'number', unit: 'мкмоль/л', min: 1, max: 100, step: 0.1, quickValues: [6, 12, 20, 30] },
    { id: 'tibc', label: 'ОЖСС (TIBC)', type: 'number', unit: 'мкмоль/л', min: 20, max: 120, step: 0.1, quickValues: [45, 60, 75, 90] },
    { id: 'ferritin', label: 'Ферритин', type: 'number', unit: 'мкг/л', min: 1, max: 3000, step: 1, quickValues: [10, 30, 100, 300, 800] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ] },
  ],
  compute: (v) => {
    const iron = Number(v.iron) || 0;
    const tibc = Number(v.tibc) || 1;
    const ferr = Number(v.ferritin) || 0;
    const tsat = (iron / tibc) * 100;
    const sex = v.sex;

    let pattern = 'Норма';
    let color = '#22C55E';

    const lowFerr = ferr < 30;
    const highFerr = (sex === 'm' && ferr > 400) || (sex === 'f' && ferr > 200);
    const lowTsat = tsat < 16;
    const highTsat = tsat > 45;

    if (lowFerr && lowTsat) { pattern = 'ЖДА'; color = '#EF4444'; }
    else if (!lowFerr && lowTsat && tibc < 50) { pattern = 'АХЗ (анемия хр. заб.)'; color = '#F59E0B'; }
    else if (highFerr && highTsat) { pattern = 'Гемохроматоз / перегрузка'; color = '#F97316'; }
    else if (lowFerr && !lowTsat) { pattern = 'Ранний латентный Fe-дефицит'; color = '#F59E0B'; }
    else if (!lowFerr && lowTsat && tibc > 70) { pattern = 'Смешанный (АХЗ + ЖДА?)'; color = '#F59E0B'; }
    else if (highFerr && !highTsat) { pattern = 'Воспаление / гепатопатия'; color = '#F59E0B'; }

    return {
      value: `TSAT ${tsat.toFixed(1)} %`,
      unit: `Фер ${ferr}`,
      interpretation: pattern,
      color,
      details: `TSAT = Fe / ОЖСС × 100 = ${tsat.toFixed(1)} %. Норма 20–45 %.
Ферритин < 30 мкг/л — доказанный дефицит; 30–100 — серая зона; > 300 — перегрузка или воспаление.`,
      actions: [
        pattern === 'ЖДА' ? 'Начать железотерапию (per os 100–200 мг элемент. Fe/сут или в/в при непереносимости); поиск источника кровопотери (ЭГДС/колоноскопия, гинеколог)' : null,
        pattern === 'АХЗ (анемия хр. заб.)' ? 'Искать активное воспаление/инфекцию/онкологию; лечить первичное заболевание; ЭПО при ХБП' : null,
        pattern === 'Смешанный (АХЗ + ЖДА?)' ? 'Рассмотреть рТФР (sTfR) и sTfR/log(ферритин) — индекс Ferritin Index' : null,
        pattern === 'Гемохроматоз / перегрузка' ? 'Генетическое тестирование HFE (C282Y, H63D); флеботомии при TSAT > 45 % и ферритин > 300/200' : null,
        pattern === 'Воспаление / гепатопатия' ? 'СРБ, ферритин как APP; после стихания воспаления — пересмотр' : null,
        pattern === 'Ранний латентный Fe-дефицит' ? 'Железотерапия до ферритина > 50 мкг/л; поиск источника потери' : null,
      ].filter(Boolean),
      caveats: [
        'Ферритин — острофазный белок; при воспалении/инфекции/раке может быть нормальным при фактическом Fe-дефиците (cut-off сдвигается до 100)',
        'Fe сыворотки имеет циркадный ритм (выше утром), вариация ±30 % в течение дня',
        'При ХБП нижний порог ферритина — 100 нг/мл (KDIGO), TSAT < 20 % — начать Fe',
        'Железо приёма препаратов per os искажает Fe сыворотки — отменить за 24 ч',
        'sTfR (растворимый рецептор трансферрина) не зависит от воспаления — полезен при смешанных состояниях',
      ],
      scale: {
        segments: [
          { min: 0, max: 16, label: 'Низкий', color: '#EF4444' },
          { min: 16, max: 45, label: 'Норма', color: '#22C55E' },
          { min: 45, max: 100, label: 'Высокий', color: '#F97316' },
        ],
        current: Math.min(tsat, 100),
        unit: 'TSAT %',
      },
      relatedCourses: [
        { id: '303.1', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'wintrobe', title: 'Индексы Винтроба' },
        { id: 'rpi', title: 'RPI ретик.' },
      ],
    };
  },
  reference: 'WHO 2020 Iron Deficiency Guidelines. BSH 2021 Iron Deficiency Anaemia. KDIGO 2012 Anemia in CKD. Camaschella C. NEJM 2015;372:1832.',
  countries: 'Международный',
  presets: [
    { label: 'Норма М', values: { iron: 20, tibc: 60, ferritin: 150, sex: 'm' } },
    { label: 'ЖДА', values: { iron: 4, tibc: 85, ferritin: 8, sex: 'f' } },
    { label: 'АХЗ', values: { iron: 6, tibc: 40, ferritin: 250, sex: 'f' } },
    { label: 'Гемохроматоз', values: { iron: 45, tibc: 55, ferritin: 1200, sex: 'm' } },
  ],
  info: `### Для чего используется
**Панель железа** (Fe + ОЖСС + ферритин + TSAT) — дифференциальная диагностика **ЖДА** vs **АХЗ** vs **перегрузка железом**.

### Формулы и нормы
| Показатель | Норма | Формула |
|---|---|---|
| Fe сыворотки | М 11–30 / Ж 7–27 мкмоль/л | Прямое измерение |
| ОЖСС (TIBC) | 45–75 мкмоль/л | Прямое измерение |
| TSAT | 20–45 % | Fe / ОЖСС × 100 |
| Ферритин | М 30–400 / Ж 15–200 мкг/л | Прямое измерение |

### Паттерны
| Паттерн | Fe | ОЖСС | TSAT | Ферритин |
|---|---|---|---|---|
| Норма | N | N | 20–45 | N |
| **ЖДА** | ↓↓ | ↑ | < 16 | < 30 |
| **АХЗ** | ↓ | ↓ или N | < 20 | ↑ или N |
| **Смешанная** | ↓ | ↓/N | < 20 | Промежуточный |
| **Гемохроматоз** | ↑ | N/↓ | > 45 | > 300 |
| **Воспаление** | ↓ | ↓ | N/↓ | ↑ |

### Ферритин cut-off
| Клиника | Cut-off Fe-дефицита |
|---|---|
| Здоровые | < 30 мкг/л |
| Воспаление/инфекция | < 100 мкг/л |
| ХБП (KDIGO) | < 100 нг/мл + TSAT < 20 % |
| Беременность | < 30 мкг/л |

### Лечение ЖДА
- **Per os**: сульфат/глюконат железа 100–200 мг эл. Fe/сут через день (лучшее всасывание — Moretti 2015)
- **Парентерально**: карбоксимальтоза железа 500–1000 мг инфузионно при непереносимости p.o., мальабсорбции, ХБП, воспалении
- Контроль ферритина через 6–8 нед; цель ферритин > 50 мкг/л
- Продолжать 3 мес после нормализации Hb для пополнения депо

### Источник кровопотери (обязательно при ЖДА)
- Мужчины и постменопаузальные женщины → ЭГДС + колоноскопия
- Женщины репродуктивного возраста → гинеколог + осмотр ЖКТ при отрицательной гинекологии

### Ограничения
- Ферритин — APP (острая фаза); при воспалении ложно-нормальный
- Fe сыворотки вариабельно ±30 % в течение дня
- Препараты Fe p.o. искажают — отменить за 24 ч
- sTfR (растворимый рецептор трансферрина) не зависит от воспаления`,
};

export default runner;

// @ts-nocheck
/** Runner: reveal */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'fc', label: 'WHO FC (функциональный класс)', type: 'select', options: [
      { value: '1', label: 'I — нет ограничений (0 баллов)' },
      { value: '2', label: 'II — лёгкое (1 балл)' },
      { value: '3', label: 'III — выраженное (2 балла)' },
      { value: '4', label: 'IV — в покое (3 балла)' },
    ] },
    { id: 'walk', label: '6-минутная ходьба (6MWD)', type: 'select', options: [
      { value: 'ge440', label: '≥ 440 м (0 баллов)' },
      { value: '320_440', label: '320-440 м (1 балл)' },
      { value: 'lt320', label: '< 320 м (2 балла)' },
    ] },
    { id: 'bnp', label: 'NT-proBNP', type: 'select', options: [
      { value: 'lt300', label: '< 300 пг/мл (0 баллов)' },
      { value: '300_1100', label: '300-1100 пг/мл (1 балл)' },
      { value: 'gt1100', label: '> 1100 пг/мл (2 балла)' },
    ] },
    { id: 'egfr', label: 'eGFR', type: 'select', options: [
      { value: 'ge60', label: '≥ 60 мл/мин (0 баллов)' },
      { value: 'lt60', label: '< 60 мл/мин (1 балл)' },
    ] },
    { id: 'effusion', label: 'Перикардиальный выпот на ЭхоКГ', type: 'checkbox', points: 1 },
    { id: 'hospitalized', label: 'Госпитализация по поводу ЛАГ за 6 мес', type: 'checkbox', points: 1 },
  ],
  compute: (v) => {
    const fcPts = Math.max(0, Number(v.fc) - 1);
    const walkPts = v.walk === 'lt320' ? 2 : v.walk === '320_440' ? 1 : 0;
    const bnpPts = v.bnp === 'gt1100' ? 2 : v.bnp === '300_1100' ? 1 : 0;
    const egfrPts = v.egfr === 'lt60' ? 1 : 0;
    const effPts = v.effusion ? 1 : 0;
    const hospPts = v.hospitalized ? 1 : 0;
    const score = fcPts + walkPts + bnpPts + egfrPts + effPts + hospPts;

    let risk = '', color = '', interp = '', surv = '';
    if (score <= 5) {
      risk = 'Низкий риск';
      color = '#10B981';
      interp = 'Низкий 1-летний риск смерти (< 5 %). Цель терапии достигнута.';
      surv = '1-год выживаемость > 95 %';
    } else if (score <= 8) {
      risk = 'Средний риск';
      color = '#F59E0B';
      interp = 'Промежуточный 1-летний риск (5-10 %). Интенсификация терапии, стремление к low-risk.';
      surv = '1-год выживаемость 90-95 %';
    } else {
      risk = 'Высокий риск';
      color = '#EF4444';
      interp = 'Высокий 1-летний риск (> 10 %). Тройная терапия, парентеральные простагландины, оценка трансплантации.';
      surv = '1-год выживаемость < 90 %';
    }

    return {
      value: risk + ' (' + score + ' баллов)',
      interpretation: interp,
      color,
      details: `FC: ${fcPts} • 6MWD: ${walkPts} • NT-proBNP: ${bnpPts} • eGFR: ${egfrPts} • Выпот: ${effPts} • Госп.: ${hospPts}. ${surv}.`,
      actions: [
        score <= 5 ? 'Продолжить двойную пероральную терапию (ERA + PDE5i)' : 'Эскалация до тройной терапии (+ селексипаг или простагландины)',
        score >= 9 ? 'Парентеральные простагландины (эпопростенол, трепростинил)' : 'Повторная оценка риска через 3-6 мес',
        'Мониторинг: WHO FC, 6MWD, NT-proBNP каждые 3-6 мес',
        score >= 9 ? 'Направление в трансплантологический центр' : 'Правосердечная катетеризация ежегодно',
      ],
      caveats: [
        'REVEAL Lite 2 — упрощённая версия без инвазивных параметров',
        'Разработан для ЛАГ группы 1 (ESC 2022)',
        'Цель терапии — низкий риск (ESC/ERS 2022)',
        'Не заменяет клиническую оценку и правосердечную катетеризацию',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: 'низкий', color: '#10B981' },
          { min: 6, max: 8, label: 'средний', color: '#F59E0B' },
          { min: 9, max: 11, label: 'высокий', color: '#EF4444' },
        ],
        current: Math.min(11, score),
        unit: 'балл.',
      },
      related: [
        { id: 'mmrc', title: 'mMRC' },
        { id: 'gold', title: 'GOLD' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
        { id: '300.4', title: 'Неотложная' },
      ],
    };
  },
  reference: 'Benza RL et al. REVEAL 2.0 and REVEAL Lite 2 risk score for PAH. Chest 2019;156(2):323-337.',
  countries: 'Международный (ESC/ERS, ATS)',
  presets: [
    { label: 'Низкий риск (2 балла)', values: { fc: '2', walk: 'ge440', bnp: 'lt300', egfr: 'ge60', effusion: false, hospitalized: false } },
    { label: 'Средний (7 баллов)', values: { fc: '3', walk: '320_440', bnp: '300_1100', egfr: 'lt60', effusion: false, hospitalized: true } },
    { label: 'Высокий (10 баллов)', values: { fc: '4', walk: 'lt320', bnp: 'gt1100', egfr: 'lt60', effusion: true, hospitalized: true } },
  ],
  info: `### Для чего используется
**REVEAL 2.0 / REVEAL Lite 2** — валидированная прогностическая шкала риска смерти при **лёгочной артериальной гипертензии (ЛАГ, группа 1)** на основе реестра REVEAL (США, > 3000 пациентов).

### Компоненты REVEAL Lite 2 (упрощённый, без инвазивных)
| Параметр | Баллы |
|---|---|
| WHO FC I / II / III / IV | 0 / 1 / 2 / 3 |
| 6MWD ≥ 440 / 320-440 / < 320 м | 0 / 1 / 2 |
| NT-proBNP < 300 / 300-1100 / > 1100 пг/мл | 0 / 1 / 2 |
| eGFR < 60 | + 1 |
| Перикардиальный выпот | + 1 |
| Госпитализация за 6 мес | + 1 |

### Стратификация
| Баллы | Риск 1-летней смерти |
|---|---|
| ≤ 5 | Низкий (< 5 %) |
| 6-8 | Средний (5-10 %) |
| ≥ 9 | Высокий (> 10 %) |

### Цели терапии (ESC/ERS 2022)
Достижение и поддержание **низкого риска** — главная цель лечения ЛАГ.

### Терапевтический алгоритм
| Риск | Терапия |
|---|---|
| Низкий | Двойная пероральная (ERA + PDE5i/sGC) |
| Средний | Тройная (+ селексипаг или ингаляц. трепростинил) |
| Высокий | Парентеральные простагландины + рассмотреть трансплантацию |

### Альтернативы
- **ESC/ERS 4-strata model** (2022) — FC, 6MWD, NT-proBNP
- **COMPERA 2.0** — европейский реестр

### Ограничения
- Разработан для ЛАГ группы 1 (не применять к ЛГ других групп)
- Основан на реестре США (этнический состав)
- NT-proBNP предпочтительнее BNP

### Источник
Benza RL et al. Chest 2019;156(2):323-337. REVEAL Lite 2 — Benza et al. 2020.`,
};

export default runner;

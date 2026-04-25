// @ts-nocheck
/**
 * Runner: abpm
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
    kind: "calculator",
    inputs: [
      {
        id: "sbp24",
        hint: 'Систолическое АД, мм рт.ст.',
        label: "24-ч среднее САД",
        type: "number",
        unit: "мм рт. ст.",
        min: 80,
        max: 220,
        step: 1,
        quickValues: [
          110,
          120,
          125,
          130,
          135,
          140
        ]
      },
      {
        id: "dbp24",
        hint: 'Диастолическое АД, мм рт.ст.',
        label: "24-ч среднее ДАД",
        type: "number",
        unit: "мм рт. ст.",
        min: 40,
        max: 140,
        step: 1,
        quickValues: [
          70,
          75,
          80,
          85,
          90
        ]
      },
      {
        id: "sbp_day",
        hint: 'Систолическое АД, мм рт.ст.',
        label: "Дневное САД",
        type: "number",
        unit: "мм рт. ст.",
        min: 80,
        max: 220,
        step: 1,
        quickValues: [
          120,
          130,
          135,
          140,
          145
        ]
      },
      {
        id: "dbp_day",
        hint: 'Диастолическое АД, мм рт.ст.',
        label: "Дневное ДАД",
        type: "number",
        unit: "мм рт. ст.",
        min: 40,
        max: 140,
        step: 1,
        quickValues: [
          75,
          80,
          85,
          90,
          95
        ]
      },
      {
        id: "sbp_night",
        hint: 'Систолическое АД, мм рт.ст.',
        label: "Ночное САД",
        type: "number",
        unit: "мм рт. ст.",
        min: 70,
        max: 200,
        step: 1,
        quickValues: [
          100,
          110,
          115,
          120,
          125
        ]
      },
      {
        id: "dbp_night",
        hint: 'Диастолическое АД, мм рт.ст.',
        label: "Ночное ДАД",
        type: "number",
        unit: "мм рт. ст.",
        min: 40,
        max: 130,
        step: 1,
        quickValues: [
          60,
          65,
          70,
          75,
          80
        ]
      }
    ],
    compute: (v)=>{
            const sbp24 = Number(v.sbp24), dbp24 = Number(v.dbp24);
            const sbpD = Number(v.sbp_day), dbpD = Number(v.dbp_day);
            const sbpN = Number(v.sbp_night), dbpN = Number(v.dbp_night);
            const hta24 = sbp24 >= 130 || dbp24 >= 80;
            const htaDay = sbpD >= 135 || dbpD >= 85;
            const htaNight = sbpN >= 120 || dbpN >= 70;
            const anyHTA = hta24 || htaDay || htaNight;
            // Dipping: (day - night) / day * 100
            const dipSbp = sbpD > 0 ? (sbpD - sbpN) / sbpD * 100 : 0;
            let dipCategory = '';
            if (dipSbp > 20) dipCategory = 'Extreme dipper (>20%)';
            else if (dipSbp >= 10) dipCategory = 'Normal dipper (10-20%)';
            else if (dipSbp >= 0) dipCategory = 'Non-dipper (0-10%)';
            else dipCategory = 'Reverse dipper (<0%)';
            let interpretation = '';
            let color = '#22C55E';
            let details = '';
            let actions = [];
            if (!anyHTA) {
                interpretation = 'Норма по всем периодам';
                color = '#22C55E';
                details = `Все три средних АД в пределах нормы (24ч <130/80, день <135/85, ночь <120/70). Суточный индекс САД ${dipSbp.toFixed(1)}% - ${dipCategory}.`;
                actions = [
                    'Повторная оценка через 1-3 года (при ФР)',
                    'Модификация образа жизни'
                ];
            } else {
                interpretation = 'Гипертензия по ABPM';
                color = '#EF4444';
                const flags = [];
                if (hta24) flags.push('24ч ≥130/80');
                if (htaDay) flags.push('день ≥135/85');
                if (htaNight) flags.push('ночь ≥120/70');
                details = `Превышены пороги: ${flags.join('; ')}. Суточный индекс САД ${dipSbp.toFixed(1)}% - ${dipCategory}. ` + (dipCategory.includes('Non-dipper') || dipCategory.includes('Reverse') ? 'Нарушение циркадного ритма АД ассоциировано с повышенным риском ССЗ-событий, TOD, skrytой вторичной АГ (OSA, альдостеронизм).' : 'Циркадный ритм сохранён.');
                actions = [
                    'Начать/усилить антигипертензивную терапию',
                    'Оценить TOD (ЭхоКГ, UACR, ЭКГ, фундоскопия)',
                    dipCategory.includes('Non-dipper') || dipCategory.includes('Reverse') ? 'Скрининг OSA (STOP-BANG), вторичной АГ' : 'Модификация образа жизни',
                    'Подумать о хронотерапии (дозы вечером) при non-dipping (спорно, MAPEC/Hygia)'
                ];
            }
            // Primary display: 24h mean
            return {
                value: `${sbp24}/${dbp24}`,
                unit: 'мм рт. ст. (24ч)',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Пороги ABPM ниже клинических: 24ч ≥130/80, день ≥135/85, ночь ≥120/70, HBPM ≥135/85',
                    'Для валидного исследования требуется ≥70% успешных измерений и ≥20 дневных + ≥7 ночных',
                    '"White-coat" HTN: клин. ≥140/90, ABPM <130/80 - риск ниже, но не нулевой',
                    '"Masked" HTN: клин. <140/90, ABPM ≥130/80 - риск сравним с истинной АГ'
                ],
                scale: {
                    segments: [
                        {
                            min: 100,
                            max: 130,
                            label: 'Норма 24ч',
                            color: '#22C55E'
                        },
                        {
                            min: 130,
                            max: 140,
                            label: 'Мягкая',
                            color: '#F59E0B'
                        },
                        {
                            min: 140,
                            max: 160,
                            label: 'Умеренная',
                            color: '#EF4444'
                        },
                        {
                            min: 160,
                            max: 220,
                            label: 'Тяжёлая',
                            color: '#991B1B'
                        }
                    ],
                    current: sbp24,
                    unit: 'мм рт. ст.'
                },
                related: [
                    {
                        id: 'bp-guidelines',
                        title: 'Целевые уровни АД'
                    },
                    {
                        id: 'htn-tod',
                        title: 'HTN TOD'
                    },
                    {
                        id: 'ascvd',
                        title: 'ASCVD Risk'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    }
                ]
            };
        },
    reference: "Mancia G et al. 2023 ESH Guidelines. J Hypertens 2023;41:1874-2071. Stergiou GS et al. 2021 ESH practice guidelines for office and out-of-office blood pressure measurement. J Hypertens 2021;39:1293-1302.",
    countries: "Международный (ESC/ESH · ACC/AHA · NICE · РКО)",
    presets: [
      {
        label: "Норма",
        values: {
          sbp24: 118,
          dbp24: 72,
          sbp_day: 122,
          dbp_day: 76,
          sbp_night: 105,
          dbp_night: 62
        }
      },
      {
        label: "Мягкая АГ + non-dipper",
        values: {
          sbp24: 136,
          dbp24: 84,
          sbp_day: 140,
          dbp_day: 88,
          sbp_night: 130,
          dbp_night: 78
        }
      },
      {
        label: "Ночная АГ изолированная",
        values: {
          sbp24: 128,
          dbp24: 78,
          sbp_day: 130,
          dbp_day: 80,
          sbp_night: 125,
          dbp_night: 75
        }
      },
      {
        label: "Тяжёлая АГ",
        values: {
          sbp24: 156,
          dbp24: 94,
          sbp_day: 160,
          dbp_day: 98,
          sbp_night: 148,
          dbp_night: 88
        }
      }
    ],
    info: "### Для чего используется\n**ABPM (ambulatory blood pressure monitoring)** - 24-часовой автоматический мониторинг АД. Золотой стандарт для:\n- Подтверждения диагноза АГ (особенно при пограничных клин. значениях)\n- Диагностики **white-coat** и **masked** гипертензии\n- Оценки ночного АД и **dipping**\n- Оценки эффективности терапии\n\n**HBPM (home BP monitoring)** - домашнее самоизмерение, альтернатива.\n\n### Пороги гипертензии\n| Метод | САД/ДАД |\n|---|---|\n| **Клиническое** | ≥140/90 (ESC/NICE) или ≥130/80 (ACC/AHA) |\n| **ABPM 24-ч среднее** | ≥130/80 |\n| **ABPM дневное среднее** | ≥135/85 |\n| **ABPM ночное среднее** | ≥120/70 |\n| **HBPM** | ≥135/85 |\n\n### Циркадный профиль (dipping)\n`Dipping = (САД день − САД ночь) / САД день × 100%`\n\n| Категория | Снижение | Клиническое значение |\n|---|---|---|\n| **Extreme dipper** | >20% | Возможен ишемический инсульт (особенно утренний) |\n| **Normal dipper** | 10-20% | Норма |\n| **Non-dipper** | 0-10% | Повышенный риск ССЗ, TOD, OSA, ХБП |\n| **Reverse dipper** | <0% (ночное АД выше дневного) | Наиболее высокий риск; скрытая вторичная АГ |\n\n### Критерии валидности ABPM\n- ≥70% успешных измерений\n- ≥20 дневных + ≥7 ночных валидных измерений\n- Обычно интервалы 15-30 мин день, 30 мин ночью\n- Манжета подходящего размера; обучение пациенту\n\n### Masked vs White-coat гипертензия\n| Тип | Клин. АД | ABPM | Риск |\n|---|---|---|---|\n| White-coat | ≥140/90 | <130/80 | Промежуточный |\n| Masked | <140/90 | ≥130/80 | **Сравним с истинной АГ** |\n| Sustained | ≥140/90 | ≥130/80 | Высокий |\n| Normotension | <140/90 | <130/80 | Низкий |\n\n### Показания к ABPM (ESC 2023, NICE)\n- Пограничная клин. АГ (140-159/90-99)\n- Подозрение на white-coat / masked\n- Выраженная вариабельность клин. АД\n- Симптомы гипотензии на терапии\n- Резистентная АГ\n- Эпизодическая АГ (фeochromocytoma)\n- Оценка ночного АД / dipping\n\n### Хронотерапия (спорно)\n**MAPEC** (Hermida 2010) и **Hygia** (Hermida 2020) - приём ≥1 препарата вечером снижал ССЗ-события. **TIME trial** (Mackenzie 2022, Lancet) **НЕ подтвердил** - различий не было. ESC 2023 не рекомендует обязательную вечернюю дозу.\n\n### Ограничения\n- Плохая переносимость у части пациентов (нарушение сна)\n- Нарушение при аритмии (ФП) - спорная точность\n- Движение может искажать отдельные измерения\n- Требует оборудования и инструктажа"
  };

export default runner;

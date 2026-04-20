// @ts-nocheck
/**
 * Runner: euroscore
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
        id: "age",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 100,
        step: 1,
        quickValues: [
          50,
          60,
          65,
          70,
          75,
          80
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      },
      {
        id: "copd",
        label: "Хроническая болезнь лёгких (постоянный бронходилататор/стероиды)",
        type: "checkbox"
      },
      {
        id: "epa",
        label: "Внесердечная артериопатия (клаудикация, каротидный стеноз >50%, ампутация, вмешательство на аорте/периф. артериях)",
        type: "checkbox"
      },
      {
        id: "mobility",
        label: "Плохая мобильность (тяжёлое нарушение передвижения)",
        type: "checkbox"
      },
      {
        id: "redo",
        label: "Повторная кардиохирургия",
        type: "checkbox"
      },
      {
        id: "endocarditis",
        label: "Активный эндокардит (на АБ в момент операции)",
        type: "checkbox"
      },
      {
        id: "critical",
        label: "Критическое предоперационное состояние (ЖТ/ФЖ, реанимация, ИВЛ, инотропы, ВАБК, ОПН < 10 мл/ч)",
        type: "checkbox"
      },
      {
        id: "dm_insulin",
        label: "Сахарный диабет на инсулине",
        type: "checkbox"
      },
      {
        id: "nyha",
        label: "NYHA класс",
        type: "select",
        options: [
          {
            value: "1",
            label: "I"
          },
          {
            value: "2",
            label: "II"
          },
          {
            value: "3",
            label: "III"
          },
          {
            value: "4",
            label: "IV"
          }
        ]
      },
      {
        id: "ccs4",
        label: "CCS класс 4 (стенокардия в покое)",
        type: "checkbox"
      },
      {
        id: "lv",
        label: "Функция ЛЖ",
        type: "select",
        options: [
          {
            value: "good",
            label: "Хорошая (ФВ ≥ 51%)"
          },
          {
            value: "moderate",
            label: "Умеренная (ФВ 31-50%)"
          },
          {
            value: "poor",
            label: "Плохая (ФВ 21-30%)"
          },
          {
            value: "verypoor",
            label: "Очень плохая (ФВ ≤ 20%)"
          }
        ]
      },
      {
        id: "recentmi",
        label: "Недавний ИМ (< 90 дней)",
        type: "checkbox"
      },
      {
        id: "pasp",
        label: "Систолическое давление в ЛА",
        type: "select",
        options: [
          {
            value: "normal",
            label: "< 31 мм рт.ст."
          },
          {
            value: "moderate",
            label: "31-54 мм рт.ст."
          },
          {
            value: "severe",
            label: "≥ 55 мм рт.ст."
          }
        ]
      },
      {
        id: "urgency",
        label: "Срочность",
        type: "select",
        options: [
          {
            value: "elective",
            label: "Плановая"
          },
          {
            value: "urgent",
            label: "Срочная (в эту госпитализацию)"
          },
          {
            value: "emergency",
            label: "Экстренная (до начала след. раб. дня)"
          },
          {
            value: "salvage",
            label: "Salvage (СЛР до/у входа в ОР)"
          }
        ]
      },
      {
        id: "weight",
        label: "Тяжесть вмешательства",
        type: "select",
        options: [
          {
            value: "isolated",
            label: "Изолированное АКШ"
          },
          {
            value: "single",
            label: "Единичная некоронарная (напр. один клапан)"
          },
          {
            value: "two",
            label: "2 процедуры (напр. АКШ + клапан)"
          },
          {
            value: "three",
            label: "≥ 3 процедуры"
          }
        ]
      },
      {
        id: "aorta",
        label: "Операция на грудной аорте",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            // EuroSCORE II logistic regression coefficients (Nashef 2012)
            const age = Number(v.age);
            const ageCoef = age <= 60 ? 0 : (age - 60) * 0.0285181;
            let x = -5.324537 + ageCoef;
            if (v.female === true) x += 0.2196434;
            if (v.copd === true) x += 0.1886564;
            if (v.epa === true) x += 0.5360268;
            if (v.mobility === true) x += 0.2407181;
            if (v.redo === true) x += 1.118599;
            if (v.endocarditis === true) x += 0.6194522;
            if (v.critical === true) x += 1.086517;
            if (v.dm_insulin === true) x += 0.3542749;
            const nyha = String(v.nyha ?? '1');
            if (nyha === '2') x += 0.1070545;
            else if (nyha === '3') x += 0.2958358;
            else if (nyha === '4') x += 0.5597929;
            if (v.ccs4 === true) x += 0.2226147;
            const lv = String(v.lv ?? 'good');
            if (lv === 'moderate') x += 0.3150652;
            else if (lv === 'poor') x += 0.8084096;
            else if (lv === 'verypoor') x += 0.9346919;
            if (v.recentmi === true) x += 0.1528943;
            const pasp = String(v.pasp ?? 'normal');
            if (pasp === 'moderate') x += 0.1788899;
            else if (pasp === 'severe') x += 0.3491475;
            const urg = String(v.urgency ?? 'elective');
            if (urg === 'urgent') x += 0.3174673;
            else if (urg === 'emergency') x += 0.7039121;
            else if (urg === 'salvage') x += 1.362947;
            const wt = String(v.weight ?? 'isolated');
            if (wt === 'single') x += 0.0062118;
            else if (wt === 'two') x += 0.5521478;
            else if (wt === 'three') x += 0.9724533;
            if (v.aorta === true) x += 0.6527205;
            const p = Math.exp(x) / (1 + Math.exp(x));
            const pct = p * 100;
            let interpretation = '', color = '', details = '', actions = [];
            if (pct < 2) {
                interpretation = 'Низкий хирургический риск';
                color = '#22C55E';
                details = 'Предсказанная 30-дневная смертность < 2 %. Плановая операция в стандартной программе.';
                actions = [
                    'Стандартное периоперационное ведение',
                    'Ранняя экстубация, fast-track'
                ];
            } else if (pct < 5) {
                interpretation = 'Промежуточный риск';
                color = '#F59E0B';
                details = 'Предсказанная 30-дневная смертность 2-5 %. Оптимизировать модифицируемые факторы; Heart Team при клапанной патологии.';
                actions = [
                    'Предоперационная оптимизация (Hb, функция почек, контроль гликемии)',
                    'Heart Team (при TAVI vs SAVR)',
                    'Рассмотреть альтернативу STS Risk Score для сопоставления'
                ];
            } else if (pct < 10) {
                interpretation = 'Высокий риск';
                color = '#EF4444';
                details = 'Предсказанная 30-дневная смертность 5-10 %. Обязательное обсуждение Heart Team. При клапанной патологии - рассмотреть транскатетерные опции (TAVI, MitraClip).';
                actions = [
                    'Heart Team - обязательно',
                    'TAVI vs SAVR (при аортальном стенозе)',
                    'TEER (MitraClip) при митральной недостаточности',
                    'Информированное согласие с обсуждением риска'
                ];
            } else {
                interpretation = 'Очень высокий риск';
                color = '#991B1B';
                details = 'Предсказанная 30-дневная смертность ≥ 10 %. Хирургия - только при соответствующей ожидаемой пользе. Рассмотреть транскатетерные / гибридные стратегии, паллиативное лечение.';
                actions = [
                    'Альтернативные стратегии (TAVI, TEER, гибрид)',
                    'Паллиативное обсуждение при низкой ожидаемой продолжительности жизни',
                    'Консилиум Heart Team + пациент/семья'
                ];
            }
            return {
                value: pct.toFixed(2),
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 2,
                            label: 'Низкий',
                            color: '#22C55E'
                        },
                        {
                            min: 2,
                            max: 5,
                            label: 'Промежут.',
                            color: '#F59E0B'
                        },
                        {
                            min: 5,
                            max: 10,
                            label: 'Высокий',
                            color: '#EF4444'
                        },
                        {
                            min: 10,
                            max: 100,
                            label: 'Оч. высокий',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(pct.toFixed(2)),
                    unit: '%'
                },
                caveats: [
                    'EuroSCORE II валидирован для взрослой кардиохирургии; не применять для педиатрии, трансплантации, ВАВД.',
                    'Калибровка ухудшается у пациентов очень высокого риска (> 20 %) - склонна к занижению.',
                    'STS Risk Score - альтернатива, более детальная для АКШ/клапанов (US-центричный).',
                    'Не заменяет клинической оценки и обсуждения Heart Team.'
                ],
                related: [
                    {
                        id: 'duke',
                        title: 'Duke Criteria (ИЭ)'
                    },
                    {
                        id: 'wilkins',
                        title: 'Wilkins'
                    },
                    {
                        id: 'nyha',
                        title: 'NYHA'
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
    reference: "Nashef SAM, Roques F, Sharples LD, Nilsson J, Smith C, Goldstone AR, Lockowandt U. EuroSCORE II. Eur J Cardiothorac Surg 2012;41:734-744.",
    countries: "ЕС · международный",
    presets: [
      {
        label: "АКШ, 65 лет, ♂ низкий",
        values: {
          age: 65,
          female: false,
          copd: false,
          epa: false,
          mobility: false,
          redo: false,
          endocarditis: false,
          critical: false,
          dm_insulin: false,
          nyha: "1",
          ccs4: false,
          lv: "good",
          recentmi: false,
          pasp: "normal",
          urgency: "elective",
          weight: "isolated",
          aorta: false
        }
      },
      {
        label: "Повторная + клапан + ФВ низкая",
        values: {
          age: 75,
          female: false,
          copd: true,
          epa: false,
          mobility: false,
          redo: true,
          endocarditis: false,
          critical: false,
          dm_insulin: true,
          nyha: "3",
          ccs4: false,
          lv: "poor",
          recentmi: false,
          pasp: "moderate",
          urgency: "elective",
          weight: "two",
          aorta: false
        }
      },
      {
        label: "Экстренный, критич. состояние",
        values: {
          age: 78,
          female: true,
          copd: true,
          epa: true,
          mobility: true,
          redo: false,
          endocarditis: false,
          critical: true,
          dm_insulin: true,
          nyha: "4",
          ccs4: true,
          lv: "verypoor",
          recentmi: true,
          pasp: "severe",
          urgency: "emergency",
          weight: "two",
          aorta: false
        }
      }
    ],
    info: "### Для чего используется\n**EuroSCORE II** (Nashef 2012) - логистическая регрессия для прогноза **30-дневной госпитальной смертности** после кардиохирургической операции у взрослых. Разработана на 22 381 пациенте (154 клиники).\n\n### Формула\n`logit(p) = -5.324537 + Σ β_i × x_i`\n`p = e^logit / (1 + e^logit)`\n\nКоэффициенты (выборочно):\n| Фактор | β |\n|---|---|\n| Возраст (на каждый год ≥ 60) | +0.0285 |\n| Женский пол | +0.22 |\n| Повторная кардиохирургия | +1.12 |\n| Активный эндокардит | +0.62 |\n| Критическое состояние | +1.09 |\n| NYHA IV | +0.56 |\n| ФВ ЛЖ ≤ 20 % | +0.93 |\n| Salvage-операция | +1.36 |\n\n### Интерпретация\n| % | Категория |\n|---|---|\n| < 2 | Низкий риск |\n| 2-5 | Промежуточный |\n| 5-10 | Высокий |\n| ≥ 10 | Очень высокий |\n\n### Альтернативы\n- **STS Risk Score** (Society of Thoracic Surgeons) - для АКШ и клапанных операций, включает отдельные модели для смертности и осложнений (инсульт, ОПН, длительная ИВЛ).\n- **ACEF / ACEF II** - упрощённые шкалы (Age × Creatinine / EF).\n\n### Ограничения\n- Калибровка ухудшается у очень высокого риска (> 20 %).\n- Не применима к педиатрии, ТА, механической поддержке.\n- TAVI / TEER - используют другие шкалы (STS-PROM, CoreValve Risk Score).\n\n### Тактика\n- Низкий - плановая операция, fast-track.\n- Промежуточный - оптимизация, Heart Team при клапанной патологии.\n- Высокий / очень высокий - обязательный Heart Team, рассмотреть TAVI / TEER / паллиацию."
  };

export default runner;

/**
 * Runner: 4s-af
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
        id: "stroke",
        label: "CHA₂DS₂-VASc (балл)",
        type: "number",
        unit: "баллы",
        min: 0,
        max: 9,
        step: 1,
        quickValues: [
          0,
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      },
      {
        id: "ehra",
        label: "Класс EHRA",
        type: "select",
        options: [
          {
            value: "1",
            label: "I - нет симптомов"
          },
          {
            value: "2a",
            label: "IIa - лёгкие"
          },
          {
            value: "2b",
            label: "IIb - умеренные"
          },
          {
            value: "3",
            label: "III - тяжёлые"
          },
          {
            value: "4",
            label: "IV - инвалидизирующие"
          }
        ]
      },
      {
        id: "burden",
        label: "Тип ФП (Severity of AF burden)",
        type: "select",
        options: [
          {
            value: "first",
            label: "Впервые диагностированная"
          },
          {
            value: "parox",
            label: "Пароксизмальная (< 7 дней)"
          },
          {
            value: "pers",
            label: "Персистирующая (> 7 дней, требует кардиоверсии)"
          },
          {
            value: "long",
            label: "Длительно персистирующая (> 1 года)"
          },
          {
            value: "perm",
            label: "Постоянная (принято отказаться от восстановления)"
          }
        ]
      },
      {
        id: "la",
        label: "Увеличение ЛП (индекс объёма > 34 мл/м² или LAD > 40 мм)",
        type: "checkbox"
      },
      {
        id: "fibrosis",
        label: "Фиброз ЛП (MRI LGE, low-voltage зоны)",
        type: "checkbox"
      },
      {
        id: "comorbid",
        label: "Значимые коморбидности (ХСН, АГ, СД, ожирение, апноэ, ХБП)",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const stroke = Number(v.stroke);
            const female = v.female === true;
            const ehra = String(v.ehra || '1');
            const burden = String(v.burden || 'parox');
            const la = v.la === true;
            const fibrosis = v.fibrosis === true;
            const comorbid = v.comorbid === true;
            // Interpret each domain (4S-AF is NOT summed - it describes the patient).
            const anticoag = !female && stroke >= 2 || female && stroke >= 3 || stroke >= 2;
            const anticoagBorderline = !female && stroke === 1 || female && stroke === 2;
            const ehraLabel: Record<string, string> = {
                '1': 'I - нет симптомов',
                '2a': 'IIa - лёгкие',
                '2b': 'IIb - умеренные',
                '3': 'III - тяжёлые',
                '4': 'IV - инвалидизирующие'
            };
            const burdenLabel: Record<string, string> = {
                first: 'Впервые диагностированная',
                parox: 'Пароксизмальная',
                pers: 'Персистирующая',
                long: 'Длительно персистирующая',
                perm: 'Постоянная'
            };
            const rhythmControl = [
                '2b',
                '3',
                '4'
            ].includes(ehra) && [
                'first',
                'parox',
                'pers',
                'long'
            ].includes(burden);
            const substrateSevere = la || fibrosis || comorbid;
            let color = '#4B8DF5';
            const summary = `Sr ${stroke} · ${ehraLabel[ehra]} · ${burdenLabel[burden]}`;
            let details = `**4S-AF - многомерная характеризация, а не сумма баллов.** Каждый домен оценивается отдельно:\n\n`;
            details += `• **Sr (Stroke risk, CHA₂DS₂-VASc)** = ${stroke}. `;
            if (anticoag) {
                details += `Показание к антикоагуляции (ESC IA).`;
                color = '#EF4444';
            } else if (anticoagBorderline) {
                details += `Пограничная зона (CHA₂DS₂-VASc 1 ♂ / 2 ♀ - рассмотреть АК индивидуально).`;
                color = '#F59E0B';
            } else {
                details += `Антикоагуляция не требуется.`;
                color = '#22C55E';
            }
            details += `\n\n• **Ss (Symptom severity, EHRA)** = ${ehraLabel[ehra]}. `;
            if ([
                '2b',
                '3',
                '4'
            ].includes(ehra)) {
                details += `Показан активный контроль ритма.`;
            } else {
                details += `Контроль частоты, стратегия rhythm - по предпочтению пациента.`;
            }
            details += `\n\n• **Sb (Severity of AF burden)** = ${burdenLabel[burden]}. `;
            if (burden === 'perm') {
                details += `Принято решение не восстанавливать ритм - только rate control + AK.`;
            } else if (burden === 'long') {
                details += `Шансы удержания ритма после аблации ниже - обсудить реалистичные цели.`;
            } else {
                details += `Потенциал для rhythm control хороший.`;
            }
            details += `\n\n• **Su (Substrate)** - `;
            if (substrateSevere) {
                details += `значимый субстрат (${[
                    la ? 'ЛП ↑' : '',
                    fibrosis ? 'фиброз' : '',
                    comorbid ? 'коморбидности' : ''
                ].filter(Boolean).join(', ')}). Акцент на ABC-терапию и модификацию ФР.`;
            } else {
                details += `субстрат минимальный - высокий шанс удержания синусового ритма.`;
            }
            const actions = [];
            if (anticoag || anticoagBorderline) actions.push('A - Antikоagulация (DOAC предпочтительно)');
            actions.push('B - Better symptom control (rate или rhythm по EHRA)');
            actions.push('C - CV risk + Comorbidities (ABC ESC 2020 path)');
            if (rhythmControl) actions.push('Рассмотреть катетерную аблацию (EAST-AFNET 4 при ранней ФП)');
            if (substrateSevere) actions.push('Модификация ФР: АГ, СД, ожирение, апноэ, алкоголь, ФА');
            return {
                value: summary,
                unit: '',
                interpretation: '4S-AF характеризация',
                color,
                details,
                actions,
                caveats: [
                    '4S-AF - НЕ суммируется: четыре домена описывают пациента независимо',
                    'Характеризация пересматривается при каждом визите (динамический подход)',
                    'Sr требует расчёта CHA₂DS₂-VASc отдельно; Ss - отдельно EHRA',
                    'Используется совместно с ABC-путём ведения (Anticoagulation, Better symptom control, Comorbidities)'
                ],
                related: [
                    {
                        id: 'chads-vasc',
                        title: 'CHA₂DS₂-VASc (Sr)'
                    },
                    {
                        id: 'ehra',
                        title: 'EHRA (Ss)'
                    },
                    {
                        id: 'has-bled',
                        title: 'HAS-BLED'
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
    reference: "Potpara TS, Lip GYH, Blomström-Lundqvist C et al. The 4S-AF Scheme (Stroke Risk; Symptoms; Severity of Burden; Substrate). Thromb Haemost 2021;121:270-278. ESC 2020 AF Guidelines.",
    countries: "Международный (ESC 2020)",
    presets: [
      {
        label: "Ранняя ФП, низ. Sr",
        values: {
          stroke: 1,
          female: false,
          ehra: "2b",
          burden: "parox",
          la: false,
          fibrosis: false,
          comorbid: false
        }
      },
      {
        label: "Персист. ФП + АГ/СД",
        values: {
          stroke: 3,
          female: false,
          ehra: "3",
          burden: "pers",
          la: true,
          fibrosis: false,
          comorbid: true
        }
      },
      {
        label: "Постоянная ФП у пожилого",
        values: {
          stroke: 5,
          female: true,
          ehra: "1",
          burden: "perm",
          la: true,
          fibrosis: true,
          comorbid: true
        }
      }
    ],
    info: "### Для чего используется\n**4S-AF** - структурированная **характеризация** (а не сумма баллов!) пациента с фибрилляцией предсердий, предложенная ESC в 2020. Заменяет упрощённую дихотомию «пароксизмальная / персистирующая / постоянная».\n\n### Четыре S (домены)\n| Домен | Что оцениваем | Инструмент |\n|---|---|---|\n| **Sr** - Stroke Risk | Риск тромбоэмболии | CHA₂DS₂-VASc |\n| **Ss** - Symptom Severity | Выраженность симптомов | EHRA (I, IIa, IIb, III, IV) |\n| **Sb** - Severity of AF Burden | Временная характеристика | Впервые / пароксизмальная / персист. / длит.-персист. / постоянная |\n| **Su** - Substrate | Предсердное ремоделирование + коморбидности | Размер ЛП, фиброз LGE, коморбидности |\n\n### Важно: НЕ суммируется\nКаждый домен **независим** и помогает составить индивидуальный план. Это отличает 4S-AF от CHA₂DS₂-VASc (который суммируется).\n\n### Пример применения\n> Пациент 65 лет, CHA₂DS₂-VASc = 3, EHRA IIb, пароксизмальная ФП, увеличение ЛП до 42 мм.\n>\n> → **Sr 3** (АК показана) · **Ss IIb** (контроль ритма желателен) · **Sb параксизмальная** (хорошие шансы аблации) · **Su** (умеренный субстрат - модификация ФР).\n\n### Интеграция с ABC-путём (ESC 2020)\n| Буква | Действие |\n|---|---|\n| **A** - Anticoagulation | DOAC при Sr ≥ 2 (♂) / ≥ 3 (♀) |\n| **B** - Better symptom control | Rate (EHRA I-IIa) vs Rhythm (EHRA IIb-IV) |\n| **C** - Cardiovascular + Comorbidities | АГ, СД, ожирение, апноэ сна, алкоголь, ФА |\n\n### EAST-AFNET 4 (2020)\nУ пациентов с **недавно диагностированной ФП** (< 1 года) ранний контроль ритма (включая аблацию) снижает CVD-события на 21 % vs отсроченная стратегия. Это подкрепляет приоритет 4S-AF-характеризации: раньше начинать лечение subsтрата.\n\n### Ограничения\n- Требует отдельного расчёта CHA₂DS₂-VASc и EHRA\n- Субстрат - частично субъективная оценка (LA size by MRI / LGE доступны не везде)\n- Не заменяет индивидуальный клинический суждения"
  };

export default runner;

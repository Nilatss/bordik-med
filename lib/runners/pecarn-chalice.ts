// @ts-nocheck
/**
 * Runner: pecarn-chalice
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
        id: "agegroup",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "young",
            label: "< 2 лет"
          },
          {
            value: "older",
            label: "≥ 2 лет"
          }
        ]
      },
      {
        id: "gcs14",
        label: "GCS < 15 или изменённый статус (возбуждение, сонливость, повторы, замедленный ответ)",
        type: "checkbox"
      },
      {
        id: "palp_fx",
        label: "< 2 лет: пальпируемый перелом черепа",
        type: "checkbox"
      },
      {
        id: "basilar",
        label: "≥ 2 лет: признаки перелома основания (гемотимпанум, глаза енота, Battle, ликворея)",
        type: "checkbox"
      },
      {
        id: "hematoma",
        label: "< 2 лет: не-фронтальная гематома скальпа",
        type: "checkbox"
      },
      {
        id: "loc5",
        label: "< 2 лет: LOC ≥ 5 с",
        type: "checkbox"
      },
      {
        id: "mechanism",
        label: "Серьёзный механизм (ДТП выброс / смерть другого / опрокидывание / пешеход или велосипедист без шлема сбит / падение > 0,9 м если < 2 лет или > 1,5 м если ≥ 2 лет / удар тяжёлым предметом)",
        type: "checkbox"
      },
      {
        id: "behavior",
        label: "< 2 лет: родители отмечают необычное поведение",
        type: "checkbox"
      },
      {
        id: "loc_any",
        label: "≥ 2 лет: любая потеря сознания в анамнезе",
        type: "checkbox"
      },
      {
        id: "vomit",
        label: "≥ 2 лет: рвота",
        type: "checkbox"
      },
      {
        id: "headache",
        label: "≥ 2 лет: сильная головная боль",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const young = v.agegroup === 'young';
            const gcs14 = v.gcs14 === true;
            const palpFx = v.palp_fx === true;
            const basilar = v.basilar === true;
            const mech = v.mechanism === true;
            // High-risk triggers
            let highRisk = false;
            if (young) {
                if (gcs14 || palpFx) highRisk = true;
            } else {
                if (gcs14 || basilar) highRisk = true;
            }
            // Medium-risk triggers
            let mediumRisk = false;
            if (young) {
                if (v.hematoma === true || v.loc5 === true || mech || v.behavior === true) mediumRisk = true;
            } else {
                if (v.loc_any === true || v.vomit === true || mech || v.headache === true) mediumRisk = true;
            }
            let interpretation = '', color = '', details = '';
            let actions = [];
            let value = '';
            if (highRisk) {
                value = 'High-risk — CT показана';
                interpretation = 'Высокий риск ciTBI (~ 4,4 %) — КТ рекомендована';
                color = '#991B1B';
                details = 'Наличие любого high-risk критерия повышает риск клинически значимой ЧМТ (ciTBI) до ~ 4,4 %. PECARN рекомендует КТ головы.';
                actions = [
                    'КТ головы без контраста',
                    'Госпитализация для наблюдения',
                    'Нейрохирургическая консультация при находках',
                    'Оценить на неслучайную травму (NAT) у детей < 2 лет'
                ];
            } else if (mediumRisk) {
                value = 'Intermediate — наблюдение vs CT';
                interpretation = 'Промежуточный риск ciTBI (~ 0,9 %) — наблюдение 4–6 ч или КТ по опыту врача';
                color = '#F59E0B';
                details = 'Один medium-risk критерий: риск ciTBI ~ 0,9 %. Рекомендована либо структурированное наблюдение 4–6 ч в приёмном, либо КТ. Множественные факторы, ухудшение или родители без возможности быстро вернуться — в пользу КТ.';
                actions = [
                    'Наблюдение 4–6 ч с повторной оценкой GCS, неврологии',
                    'КТ при ухудшении, повторной рвоте, судорогах',
                    'Инструктаж родителей о симптомах "red flag" при выписке',
                    'При множественных факторах — порог для КТ ниже'
                ];
            } else {
                value = 'Low-risk — CT не показана';
                interpretation = 'Низкий риск ciTBI (< 0,02 %) — КТ не требуется';
                color = '#22C55E';
                details = 'Отрицательный PECARN исключает клинически значимую ЧМТ с чувствительностью ~ 100 %. Выписка домой с инструкциями.';
                actions = [
                    'Выписка домой',
                    'Письменные инструкции: красные флаги (рвота, головная боль, судороги, сонливость, нарушение поведения)',
                    'Покой, парацетамол по необходимости',
                    'Повторная оценка при ухудшении'
                ];
            }
            return {
                value,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'PECARN применяется только при GCS ≥ 14 и травме ≤ 24 ч',
                    'Не применять при антикоагуляции, коагулопатии, проникающей травме, нейрохирургии в анамнезе',
                    'У детей < 2 лет особая настороженность на NAT (неслучайную травму)',
                    'CHALICE (UK) и CATCH (Канада) — альтернативы; PECARN валидизирован на 42 412 детях'
                ],
                related: [
                    {
                        id: 'gcs',
                        title: 'GCS'
                    },
                    {
                        id: 'can-ct-head',
                        title: 'Canadian CT Head (взрослые)'
                    },
                    {
                        id: 'marshall-ct',
                        title: 'Marshall CT'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия 0–2'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Kuppermann N, Holmes JF, Dayan PS et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet 2009;374:1160–1170.",
    countries: "США (PECARN) · Великобритания (CHALICE) · Канада (CATCH)",
    presets: [
      {
        label: "< 2 лет, без критериев",
        values: {
          agegroup: "young",
          gcs14: false,
          palp_fx: false,
          basilar: false,
          hematoma: false,
          loc5: false,
          mechanism: false,
          behavior: false,
          loc_any: false,
          vomit: false,
          headache: false
        }
      },
      {
        label: "< 2 лет, гематома затылка",
        values: {
          agegroup: "young",
          gcs14: false,
          palp_fx: false,
          basilar: false,
          hematoma: true,
          loc5: false,
          mechanism: false,
          behavior: false,
          loc_any: false,
          vomit: false,
          headache: false
        }
      },
      {
        label: "≥ 2 лет, рвота + LOC",
        values: {
          agegroup: "older",
          gcs14: false,
          palp_fx: false,
          basilar: false,
          hematoma: false,
          loc5: false,
          mechanism: false,
          behavior: false,
          loc_any: true,
          vomit: true,
          headache: false
        }
      },
      {
        label: "GCS < 15 (high-risk)",
        values: {
          agegroup: "older",
          gcs14: true,
          palp_fx: false,
          basilar: false,
          hematoma: false,
          loc5: false,
          mechanism: false,
          behavior: false,
          loc_any: false,
          vomit: false,
          headache: false
        }
      }
    ],
    info: "### Для чего используется\n**PECARN Head Injury Rule (Kuppermann 2009)** — клиническое правило для выявления детей с **минимальным риском клинически значимой ЧМТ (ciTBI)**, у которых КТ головы не требуется. Валидизирован на 42 412 детях; чувствительность ~ 100 % (95% CI 99,5–100).\n\n### ciTBI (clinically-important Traumatic Brain Injury)\nЛюбое из:\n- Смерть от ЧМТ\n- Нейрохирургическое вмешательство\n- Интубация > 24 ч\n- Госпитализация ≥ 2 ночей по поводу ЧМТ\n\n### Применимость\n- Возраст < 18 лет\n- Травма ≤ 24 ч\n- GCS 14–15\n\n### Алгоритм < 2 лет\n**Шаг 1 — High-risk (4,4 % ciTBI):**\n- GCS < 15 / AMS (возбуждение, сонливость, замедленный ответ)\n- Пальпируемый перелом черепа\n→ **КТ рекомендована**\n\n**Шаг 2 — Intermediate (0,9 % ciTBI):**\n- Не-фронтальная гематома скальпа (затылочная / теменная / височная)\n- LOC ≥ 5 с\n- Серьёзный механизм\n- Родители отмечают необычное поведение\n→ **Наблюдение 4–6 ч vs КТ**\n\n**Шаг 3 — Low-risk (< 0,02 %):**\n- Нет критериев → **КТ не показана**\n\n### Алгоритм ≥ 2 лет\n**Шаг 1 — High-risk:**\n- GCS < 15 / AMS\n- Признаки перелома основания (гемотимпанум, «енотовы глаза», Battle, ликворея)\n→ **КТ рекомендована**\n\n**Шаг 2 — Intermediate:**\n- Любая LOC в анамнезе\n- Рвота\n- Серьёзный механизм\n- Сильная головная боль\n→ **Наблюдение vs КТ**\n\n**Шаг 3 — Low-risk:** Нет критериев → без КТ.\n\n### Серьёзный механизм\n- ДТП с выбросом пассажира, смертью другого, опрокидыванием\n- Пешеход / велосипедист без шлема, сбитый авто\n- Падение > 0,9 м (< 2 лет) или > 1,5 м (≥ 2 лет)\n- Удар тяжёлым или высокоскоростным предметом\n\n### Альтернативы\n| Правило | Страна | Возраст |\n|---|---|---|\n| **PECARN** | США | < 18, 2 алгоритма |\n| **CHALICE** (Dunning 2006) | UK | < 16 |\n| **CATCH** (Osmond 2010) | Канада | 0–16 |\n| **CATCH2** | Канада | Расширенный |\n| **NICE CG176** | UK | Включая детей |\n\n### PECARN vs CHALICE vs CATCH\n| Параметр | PECARN | CHALICE | CATCH |\n|---|---|---|---|\n| Чувствительность | 100 % | 98 % | 98 % |\n| Специфичность | 54 % | 87 % | 70 % |\n| Размер валидации | 42 412 | 22 772 | 3866 |\n\n### Тактика\n- **High-risk** — немедленно КТ без контраста\n- **Intermediate** — наблюдение 4–6 ч, КТ при ухудшении или множественных факторах\n- **Low-risk** — домой с письменными инструкциями\n\n### Red flags для возвращения в ER\n- Постоянная / усиливающаяся головная боль\n- Повторная рвота\n- Судороги\n- Сонливость, трудно разбудить\n- Нарушение поведения, речи, координации\n- Неравные зрачки, двоение\n\n### Ограничения\n- Не применять при коагулопатии, антикоагуляции, нейрохирургии в анамнезе\n- < 3 мес — особая настороженность, возможно КТ чаще\n- NAT — всегда в ДД у детей < 2 лет с необычными находками\n\n### Источник\nKuppermann N, Holmes JF, Dayan PS et al. **Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study.** *Lancet* 2009;374:1160–1170. Dunning J et al. **Derivation of the children's head injury algorithm for the prediction of important clinical events (CHALICE).** *Arch Dis Child* 2006;91:885–891. Osmond MH et al. **CATCH: a clinical decision rule for the use of CT in children with minor head injury.** *CMAJ* 2010;182:341–348."
  };

export default runner;

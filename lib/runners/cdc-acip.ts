// @ts-nocheck
/**
 * Runner: cdc-acip
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
        id: "cohort",
        label: "Возрастная когорта",
        type: "select",
        options: [
          {
            value: "infant",
            label: "Младенец 0-18 мес"
          },
          {
            value: "child",
            label: "Ребёнок 19 мес - 6 лет"
          },
          {
            value: "adolescent",
            label: "Подросток 7-18 лет"
          },
          {
            value: "adult",
            label: "Взрослый ≥19 лет"
          }
        ]
      }
    ],
    compute: (v)=>{
            const cohort = String(v.cohort);
            const schedules = {
                infant: {
                    value: 'Младенцы 0-18 мес',
                    details: 'Рутинный график иммунизации младенцев согласно ACIP 2024. Плюс гриппозная вакцина ежегодно с 6 мес; COVID-19 по возрастным рекомендациям.',
                    actions: [
                        'Рождение: HepB #1',
                        '1-2 мес: HepB #2',
                        '2 мес: DTaP #1, Hib #1, PCV15/20 #1, IPV #1, RV #1',
                        '4 мес: DTaP #2, Hib #2, PCV #2, IPV #2, RV #2',
                        '6 мес: DTaP #3, Hib #3 (±4), PCV #3, HepB #3 (6-18 мес), IPV #3 (6-18 мес), RV #3 (если RotaTeq), грипп ежегодно',
                        '12-15 мес: MMR #1, VAR #1, HepA #1, Hib booster, PCV #4',
                        '15-18 мес: DTaP #4',
                        '12-23 мес: HepA #2 (через 6 мес после #1)'
                    ]
                },
                child: {
                    value: 'Дети 19 мес - 6 лет',
                    details: 'Ревакцинации перед школой (ACIP 4-6 лет), плюс ежегодный грипп, HepA #2 если не завершено.',
                    actions: [
                        'DTaP #5 (4-6 лет)',
                        'IPV #4 (4-6 лет)',
                        'MMR #2 (4-6 лет)',
                        'VAR #2 (4-6 лет)',
                        'Грипп ежегодно',
                        'HepA #2 если не завершено (через 6 мес после #1)'
                    ]
                },
                adolescent: {
                    value: 'Подростки 7-18 лет',
                    details: 'Tdap в 11-12 лет, HPV с 9 лет (2 дозы если начата до 15, иначе 3), MenACWY и MenB по протоколу.',
                    actions: [
                        '11-12 лет: Tdap, HPV (2 дозы если <15 лет, 3 дозы ≥15 лет), MenACWY #1',
                        '16 лет: MenACWY #2 (booster)',
                        '16-23 года: MenB серия (2-3 дозы, shared decision-making)',
                        'Грипп ежегодно',
                        'COVID-19 по актуальным рекомендациям',
                        'Догоняющая вакцинация для пропущенных (HepB, MMR, VAR, HepA)'
                    ]
                },
                adult: {
                    value: 'Взрослые ≥19 лет',
                    details: 'Ежегодный грипп; Td/Tdap каждые 10 лет; RSV, Zoster по возрасту; COVID-19 актуально.',
                    actions: [
                        'Грипп ежегодно',
                        'Td/Tdap каждые 10 лет (1 доза Tdap если не получали)',
                        'HPV до 26 лет (catch-up), shared decision 27-45',
                        'MMR / VAR / HepA / HepB - если нет иммунитета',
                        '≥50 лет: Zoster (RZV) 2 дозы',
                        '≥60 лет: RSV (shared decision)',
                        '≥65 лет: PCV20 или PCV15+PPSV23, ежегодный грипп HD'
                    ]
                }
            };
            const s = schedules[cohort];
            return {
                value: s.value,
                interpretation: 'CDC/ACIP 2024 - рутинный график (США)',
                color: '#3B82F6',
                details: s.details,
                actions: s.actions,
                caveats: [
                    'График ACIP обновляется ежегодно (январь-февраль)',
                    'Противопоказания: анафилаксия на компонент, тяжёлый иммунодефицит (для живых вакцин)',
                    'При пропусках - использовать Catch-up Schedule (не перезапускать серию)',
                    'COVID-19 и RSV вакцины - отдельные актуальные рекомендации, меняются',
                    'Путешественники: YF, тифоид, JE, рабиес - дополнительно'
                ],
                related: [
                    {
                        id: 'uk-green',
                        title: 'UK Green Book'
                    },
                    {
                        id: 'ru-vaccine',
                        title: 'Нац. календарь РФ'
                    },
                    {
                        id: 'epi-who',
                        title: 'EPI WHO / STIKO / HAS'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    },
                    {
                        id: '201.2',
                        title: 'Инфекционные болезни'
                    }
                ]
            };
        },
    reference: "CDC/ACIP. Recommended Child and Adolescent / Adult Immunization Schedule, United States, 2024. MMWR 2024.",
    countries: "США",
    presets: [
      {
        label: "Младенец 0-18 мес",
        values: {
          cohort: "infant"
        }
      },
      {
        label: "Ребёнок 19 мес - 6 лет",
        values: {
          cohort: "child"
        }
      },
      {
        label: "Подросток 7-18 лет",
        values: {
          cohort: "adolescent"
        }
      },
      {
        label: "Взрослый ≥19 лет",
        values: {
          cohort: "adult"
        }
      }
    ],
    info: "### Для чего используется\n**CDC/ACIP (Advisory Committee on Immunization Practices)** - официальный календарь США, публикуется ежегодно (MMWR, январь).\n\n### Ключевые вакцины (сокращения)\n| Код | Болезнь | Возраст начала |\n|---|---|---|\n| **HepB** | Гепатит B | Рождение |\n| **RV** | Ротавирус | 2 мес |\n| **DTaP** | Diphtheria/Tetanus/acellular Pertussis | 2 мес |\n| **Hib** | H. influenzae B | 2 мес |\n| **PCV15/20** | Пневмококк конъюг. | 2 мес |\n| **IPV** | Inactivated Polio | 2 мес |\n| **MMR** | Measles/Mumps/Rubella | 12 мес |\n| **VAR** | Varicella | 12 мес |\n| **HepA** | Гепатит A | 12 мес |\n| **Tdap** | Tetanus/Diphtheria/Pertussis (adol) | 11 лет |\n| **HPV** | Human Papillomavirus | 9-12 лет |\n| **MenACWY** | Meningococcus ACWY | 11 лет |\n| **MenB** | Meningococcus B | 16-23 года |\n| **Influenza** | Грипп | ≥6 мес ежегодно |\n\n### Младенческий график (0-18 мес)\n| Возраст | Вакцины |\n|---|---|\n| Рождение | HepB #1 |\n| 2 мес | DTaP, Hib, PCV, IPV, RV, HepB #2 |\n| 4 мес | DTaP, Hib, PCV, IPV, RV |\n| 6 мес | DTaP, Hib(±), PCV, HepB #3, IPV #3, RV(3), Flu |\n| 12-15 мес | MMR, VAR, HepA, Hib boost, PCV #4 |\n| 15-18 мес | DTaP #4 |\n\n### 4-6 лет (перед школой)\n- DTaP #5, IPV #4, MMR #2, VAR #2\n\n### 11-12 лет\n- Tdap, HPV, MenACWY\n\n### 16-18 лет\n- MenACWY booster, MenB (SDM)\n\n### Ограничения\n- График обновляется ежегодно\n- COVID-19, RSV - актуальные отдельные рекомендации\n- Для иммунокомпрометированных - модифицированный график\n\n### Тактика\n- Проверять статус при каждом визите\n- Догоняющая вакцинация: не перезапускать серию, использовать Catch-up Schedule\n- Информированное согласие + VIS (Vaccine Information Statement)\n\n### Источник\nCDC/ACIP. Recommended Immunization Schedules, US 2024. MMWR; доступно www.cdc.gov/vaccines/schedules."
  };

export default runner;

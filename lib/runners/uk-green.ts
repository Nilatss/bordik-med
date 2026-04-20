// @ts-nocheck
/**
 * Runner: uk-green
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
            label: "Младенец 0-12 мес"
          },
          {
            value: "preschool",
            label: "1-5 лет"
          },
          {
            value: "school",
            label: "6-18 лет"
          },
          {
            value: "adult",
            label: "Взрослый"
          }
        ]
      }
    ],
    compute: (v)=>{
            const cohort = String(v.cohort);
            const schedules = {
                infant: {
                    value: 'Младенцы 0-12 мес (UK)',
                    details: 'Британский календарь (Green Book, UK Health Security Agency 2022, с обновлениями 2024). Отличия от CDC: нет рутинного RV (отменён в некоторых регионах, переоценивается), HepB только в 6-in-1, MenB в рутине, MenC - убран.',
                    actions: [
                        '8 недель: 6-in-1 (DTaP/IPV/Hib/HepB) #1, MenB #1, Rotavirus #1, PCV13 #1',
                        '12 недель: 6-in-1 #2, Rotavirus #2',
                        '16 недель: 6-in-1 #3, MenB #2, PCV13 #2',
                        '1 год: Hib/MenC boost, PCV13 boost, MMR #1, MenB boost'
                    ]
                },
                preschool: {
                    value: 'Дошкольный возраст 1-5 лет (UK)',
                    details: 'Дошкольные ревакцинации: 3 года 4 мес - 4-in-1 (DTaP/IPV) + MMR #2. Грипп (назальный LAIV) ежегодно с 2 лет.',
                    actions: [
                        '2-3 года: назальный грипп (LAIV) ежегодно',
                        '3 года 4 мес: 4-in-1 (DTaP/IPV) + MMR #2'
                    ]
                },
                school: {
                    value: 'Школьный / подростковый 6-18 лет (UK)',
                    details: 'Школьные программы: HPV, Td/IPV, MenACWY. HPV с 12-13 лет (Year 8), 1 доза с 2023 (было 2 дозы).',
                    actions: [
                        'Ежегодно (с 2 до ~16 лет): назальный грипп (LAIV)',
                        '12-13 лет (Year 8): HPV (1 доза с 2023)',
                        '14 лет (Year 9): Td/IPV (3-in-1 teenage booster), MenACWY'
                    ]
                },
                adult: {
                    value: 'Взрослый (UK)',
                    details: 'Pneumo PPV23 с 65 лет, shingles (Shingrix 2 дозы) с 65 лет, RSV с 75 лет (с 2024). Грипп ежегодно с 50/65. Беременные: пертуссис + грипп + (RSV с 2024 28 нед).',
                    actions: [
                        'Беременность: pertussis (16-32 нед), грипп (сезонно), RSV с 28 нед (с 2024)',
                        '≥65 лет: PPV23 × 1, грипп ежегодно',
                        '≥65 лет: Shingrix × 2',
                        '≥75 лет: RSV (с 2024)',
                        'Td/IPV booster каждые 10 лет (если требуется)'
                    ]
                }
            };
            const s = schedules[cohort];
            return {
                value: s.value,
                interpretation: 'UK Green Book - NHS schedule',
                color: '#3B82F6',
                details: s.details,
                actions: s.actions,
                caveats: [
                    'Green Book обновляется регулярно (UK Health Security Agency)',
                    'Отличия от США: 6-in-1 включает HepB; рутинный MenB с 2015; HPV - 1 доза с 2023',
                    'Rotavirus: введён в 2013, но охват регионально варьирует',
                    'BCG - селективно (группы риска, не рутинно с 2005)',
                    'Для путешественников - отдельные рекомендации (Travel Health Pro)'
                ],
                related: [
                    {
                        id: 'cdc-acip',
                        title: 'CDC/ACIP США'
                    },
                    {
                        id: 'epi-who',
                        title: 'EPI WHO / STIKO / HAS'
                    },
                    {
                        id: 'ru-vaccine',
                        title: 'Нац. календарь РФ'
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
    reference: "UK Health Security Agency. Immunisation against infectious disease («The Green Book»), 2022 edition with ongoing chapter updates.",
    countries: "Великобритания (NHS)",
    presets: [
      {
        label: "Младенец 0-12 мес",
        values: {
          cohort: "infant"
        }
      },
      {
        label: "1-5 лет",
        values: {
          cohort: "preschool"
        }
      },
      {
        label: "6-18 лет",
        values: {
          cohort: "school"
        }
      },
      {
        label: "Взрослый",
        values: {
          cohort: "adult"
        }
      }
    ],
    info: "### Для чего используется\n**UK Green Book** («Immunisation against Infectious Disease») - официальное руководство NHS/UKHSA по иммунизации в Великобритании.\n\n### Младенческий календарь (UK)\n| Возраст | Вакцины |\n|---|---|\n| **8 нед** | 6-in-1 (DTaP/IPV/Hib/HepB), MenB, Rotavirus, PCV13 |\n| **12 нед** | 6-in-1 #2, Rotavirus #2 |\n| **16 нед** | 6-in-1 #3, MenB #2, PCV13 #2 |\n| **1 год** | Hib/MenC, PCV13 boost, MMR #1, MenB boost |\n\n### Дошкольный / школьный\n| Возраст | Вакцины |\n|---|---|\n| **2-16 лет** | LAIV грипп ежегодно (назальный) |\n| **3 года 4 мес** | 4-in-1 (DTaP/IPV), MMR #2 |\n| **12-13 лет** | HPV (1 доза, с 2023) |\n| **14 лет** | Td/IPV, MenACWY |\n\n### Беременные\n- Pertussis (16-32 нед), грипп, RSV с 28 нед (с 2024)\n\n### Взрослые\n- ≥65: PPV23, Shingrix × 2, грипп ежегодно\n- ≥75: RSV (с 2024)\n\n### Отличия UK от США\n| Параметр | UK | США |\n|---|---|---|\n| HepB | В 6-in-1 (8/12/16 нед) | Рождение + 2/6 мес отдельно |\n| MenB | Рутинно с 2 мес | SDM 16-23 лет |\n| HPV | 1 доза с 2023 | 2-3 дозы |\n| Грипп | LAIV назально | IIV инъекционно |\n| BCG | Селективно | Не в рутине |\n| MMR | 12 мес + 3 г 4 мес | 12 мес + 4-6 лет |\n\n### Ограничения\n- MenC убран из рутины (2016), но есть в Hib/MenC boost\n- Rotavirus охват регионально варьирует\n- Для иммунокомпрометированных и путешественников - отдельные рекомендации\n\n### Тактика\n- Проверка статуса при каждом контакте\n- Догоняющая вакцинация согласно Green Book chapter 11"
  };

export default runner;

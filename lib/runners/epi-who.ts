// @ts-nocheck
/**
 * Runner: epi-who
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
        id: "country",
        label: "Схема",
        type: "select",
        options: [
          {
            value: "who",
            label: "WHO EPI (стандарт для ВОЗ-стран)"
          },
          {
            value: "germany",
            label: "Германия - STIKO"
          },
          {
            value: "france",
            label: "Франция - HAS"
          },
          {
            value: "other",
            label: "Другое (общий обзор)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const country = String(v.country);
            const schedules = {
                who: {
                    value: 'WHO EPI (базовая схема)',
                    details: 'Expanded Programme on Immunization (WHO, с 1974). Минимальный базовый набор для всех стран-членов ВОЗ. Конкретные возрастные интервалы адаптируются национально.',
                    actions: [
                        'Рождение: BCG, OPV-0, HepB-0',
                        '6 нед: DTP-HepB-Hib (пента) #1, OPV #1, PCV #1, RV #1',
                        '10 нед: пента #2, OPV #2, PCV #2, RV #2',
                        '14 нед: пента #3, OPV #3 / IPV, PCV #3, RV #3',
                        '9 мес: корь #1 (MR/MMR), жёлтая лихорадка (эндем. Африки/Ю.Америки)',
                        '15-18 мес: корь #2, DTP booster',
                        'Подростки: HPV (9-14 лет, 1-2 дозы с 2022), Td booster',
                        'Беременные: столбнячный анатоксин (TT / Td)'
                    ]
                },
                germany: {
                    value: 'Германия - STIKO 2024',
                    details: 'Ständige Impfkommission (STIKO) при RKI. Отличия от WHO: 6-in-1 с HepB рутинно с 2 мес, рутинный ротавирус, MenB (с 2024), HPV с 9 лет обоих полов, VZV рутинно.',
                    actions: [
                        '6 нед: Rotavirus #1',
                        '2 мес: 6-in-1 (DTaP/IPV/Hib/HepB) #1, PCV13 #1, Rotavirus #2, MenB #1 (новое 2024)',
                        '4 мес: 6-in-1 #2, PCV13 #2, MenB #2',
                        '11 мес: 6-in-1 #3, PCV13 #3, MenB boost',
                        '11-14 мес: MMR #1, VZV #1, MenC #1',
                        '15-23 мес: MMR #2, VZV #2',
                        '5-6 лет: DTaP/IPV boost',
                        '9-14 лет (оба пола): HPV, MenB catch-up',
                        '9-16 лет: Td/IPV/Pertussis'
                    ]
                },
                france: {
                    value: 'Франция - HAS 2024',
                    details: 'Haute Autorité de Santé. С 2018 обязательны 11 вакцин (расширение с 3 до 11): DTP, HepB, Hib, PCV, MenC, MMR. Penta/Hexa с 2 мес. MenB рутинно с 2025.',
                    actions: [
                        '2 мес: Hexavalent (DTaP/IPV/Hib/HepB) #1, PCV13 #1',
                        '4 мес: Hexa #2, PCV13 #2',
                        '5 мес: MenB #1 (с 2025 рутинно)',
                        '11 мес: Hexa #3, PCV13 #3, MenC #1, MenB #2',
                        '12 мес: MMR #1, MenB boost',
                        '16-18 мес: MMR #2',
                        '6 лет: DTaP/IPV boost',
                        '11-13 лет: DTaP/IPV/Pertussis boost, HPV (оба пола с 2021)',
                        '25 лет: dTcaP booster (с 2013 для взрослых, контакт с младенцами)'
                    ]
                },
                other: {
                    value: 'Международное сравнение',
                    details: 'Основные национальные схемы с различиями. Всегда проверять локальный календарь и обновления при путешествиях.',
                    actions: [
                        'Япония (MHLW): BCG 5 мес; рутинный varicella; HPV - возвращён с 2022',
                        'Австралия (NIP): MenB с 2024; HPV 1 доза с 2023',
                        'Канада (NACI): различается по провинциям; Manitoba - rotavirus',
                        'Китай (EPI): BCG, HepB при рождении; OPV/IPV; менингококк A; JE',
                        'Скандинавия: MenB не в рутине (кроме Норвегии - для групп риска); BCG селективно'
                    ]
                }
            };
            const s = schedules[country];
            return {
                value: s.value,
                interpretation: 'Международные и национальные схемы иммунизации',
                color: '#3B82F6',
                details: s.details,
                actions: s.actions,
                caveats: [
                    'WHO EPI - минимальный базовый набор; национальные схемы добавляют вакцины',
                    'STIKO Германия: ежегодное обновление; 6-in-1 + ротавирус + MenB (с 2024)',
                    'HAS Франция: 11 обязательных с 2018 (ранее 3); MenB рутинно с 2025',
                    'Для путешественников: Travel Health - YF, JE, Typhoid, Rabies, Cholera отдельно',
                    'Местные эпидемии (жёлтая лихорадка, полиомиелит) - могут добавлять campagnes'
                ],
                related: [
                    {
                        id: 'cdc-acip',
                        title: 'CDC/ACIP США'
                    },
                    {
                        id: 'uk-green',
                        title: 'UK Green Book'
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
    reference: "WHO. Immunization schedules summary (WHO EPI). Geneva 2024. STIKO. Empfehlungen der Ständigen Impfkommission, RKI, Epid Bull 2024. HAS. Calendrier des vaccinations 2024, Ministère de la Santé France.",
    countries: "Международный · Германия · Франция",
    presets: [
      {
        label: "WHO EPI",
        values: {
          country: "who"
        }
      },
      {
        label: "Германия (STIKO)",
        values: {
          country: "germany"
        }
      },
      {
        label: "Франция (HAS)",
        values: {
          country: "france"
        }
      },
      {
        label: "Другие страны (обзор)",
        values: {
          country: "other"
        }
      }
    ],
    info: "### Для чего используется\nОбзор международных схем вакцинации: **WHO EPI** (базовая для стран-членов), **STIKO** (Германия), **HAS** (Франция). Используется для:\n- Оценки статуса вакцинации мигрантов / путешественников\n- Планирования догоняющей иммунизации по местному календарю\n- Понимания различий между странами при международной практике\n\n### WHO EPI (Expanded Programme on Immunization, 1974)\nМинимальный базовый набор:\n| Возраст | Вакцины |\n|---|---|\n| Рождение | BCG, OPV-0, HepB-0 |\n| 6 нед | Penta (DTP-HepB-Hib), OPV, PCV, RV |\n| 10 нед | Penta, OPV, PCV, RV |\n| 14 нед | Penta, OPV/IPV, PCV, RV |\n| 9 мес | Корь #1, YF (эндем.) |\n| 15-18 мес | Корь #2, DTP boost |\n| 9-14 лет | HPV (с 2022 - 1 доза) |\n\n### Германия (STIKO 2024)\n| Возраст | Вакцины |\n|---|---|\n| 6 нед | Rotavirus |\n| 2 мес | 6-in-1 (DTaP/IPV/Hib/HepB), PCV13, RV, **MenB (new 2024)** |\n| 4 мес | 6-in-1, PCV13, MenB |\n| 11 мес | 6-in-1, PCV13, MenB boost |\n| 11-14 мес | MMR, VZV, MenC |\n| 9-14 лет | HPV (оба пола) |\n\n### Франция (HAS 2024)\n11 обязательных вакцин с 2018 (расширение с 3):\n- DTaP, IPV, Hib, HepB, PCV, MenC, MMR\n| Возраст | Вакцины |\n|---|---|\n| 2 мес | Hexa, PCV13 |\n| 4 мес | Hexa, PCV13 |\n| 5 мес | MenB (с 2025) |\n| 11 мес | Hexa, PCV13, MenC, MenB |\n| 12 мес | MMR, MenB boost |\n| 16-18 мес | MMR #2 |\n| 11-13 лет | DTaP/IPV/Pert boost, HPV (оба пола с 2021) |\n\n### Ключевые различия между схемами\n| Параметр | WHO | STIKO DE | HAS FR |\n|---|---|---|---|\n| BCG | Рутинно | Не в рутине (риск) | Не в рутине с 2007 |\n| Rotavirus | Рекомендован | Рутинно | Не в рутине (контроверс.) |\n| MenB | - | Рутинно с 2024 | Рутинно с 2025 |\n| HepB | В penta с 6 нед | В 6-in-1 с 2 мес | В hexa с 2 мес |\n| HPV | 1 доза с 2022 | Оба пола с 9 лет | Оба пола с 11 лет |\n\n### Ограничения\n- Локальные обновления частые - всегда сверять с актуальным источником\n- Для путешественников - отдельные рекомендации (YF, JE, Typhoid, Rabies)\n- WHO EPI - минимум; страны ВОЗ выбирают расширенный пакет по ресурсам\n\n### Тактика\n- Мигрант/путешественник: перевести статус в локальный календарь (catch-up)\n- Различия между Hexa (FR, DE) и Penta+HepB (WHO, US) - учитывать состав\n- ВПЧ: 1 доза тренд (с WHO SAGE 2022, UK 2023, Австралия 2023)"
  };

export default runner;

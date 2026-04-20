// @ts-nocheck
/**
 * Runner: pat
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
        id: "appearance",
        label: "Appearance (TICLS)",
        type: "select",
        options: [
          {
            value: "normal",
            label: "Норма (тонус, контакт, взгляд, речь/крик)"
          },
          {
            value: "abnormal",
            label: "Нарушена (вялость, отсутствие контакта)"
          }
        ]
      },
      {
        id: "breathing",
        label: "Work of Breathing",
        type: "select",
        options: [
          {
            value: "normal",
            label: "Норма (нет ретракций, флейринга, патол. звуков)"
          },
          {
            value: "abnormal",
            label: "Нарушено (ретракции, флейринг, стридор/хрип/хрюканье)"
          }
        ]
      },
      {
        id: "circulation",
        label: "Circulation to skin",
        type: "select",
        options: [
          {
            value: "normal",
            label: "Норма (розовая кожа)"
          },
          {
            value: "abnormal",
            label: "Нарушено (бледность, мраморность, цианоз)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const a = v.appearance === 'abnormal';
            const b = v.breathing === 'abnormal';
            const c = v.circulation === 'abnormal';
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            if (!a && !b && !c) {
                interpretation = 'Стабилен';
                color = '#22C55E';
                details = 'Все три стороны треугольника в норме - ребёнок стабилен. Продолжить стандартную оценку (ABCDE).';
                actions = [
                    'Плановая оценка ABCDE',
                    'Сбор анамнеза, физикальный осмотр'
                ];
            } else if (!a && b && !c) {
                interpretation = 'Респираторный дистресс';
                color = '#F59E0B';
                details = 'Изолированное нарушение работы дыхания при сохранном сознании и перфузии. Компенсированное состояние; требуется раннее вмешательство для предотвращения декомпенсации.';
                actions = [
                    'Кислород, позиция комфорта',
                    'Поиск причины (астма, бронхиолит, круп, инородное тело)',
                    'Небулайзер по показаниям, мониторинг SpO₂'
                ];
            } else if (a && b && !c) {
                interpretation = 'Респираторная недостаточность';
                color = '#EF4444';
                details = 'Нарушение сознания + работа дыхания - декомпенсация респираторной системы, гипоксия/гиперкапния. Угроза остановки дыхания.';
                actions = [
                    'Кислород высокого потока, подготовить мешок Амбу',
                    'Рассмотреть BiPAP / интубацию',
                    'Газы крови, капнография',
                    'Причина: астматический статус, тяжёлая пневмония, отёк лёгких'
                ];
            } else if (!a && !b && c) {
                interpretation = 'Шок (компенсированный)';
                color = '#F59E0B';
                details = 'Нарушена перфузия при сохранном сознании и дыхании - компенсированный шок. Механизмы компенсации временны.';
                actions = [
                    'Сосудистый доступ, болюс кристаллоидов 20 мл/кг',
                    'Поиск причины: гиповолемия, сепсис, кардиогенный, анафилаксия',
                    'Лактат, гемокультура при подозрении на сепсис'
                ];
            } else if (a && !b && c) {
                interpretation = 'Шок (декомпенсированный)';
                color = '#EF4444';
                details = 'Нарушение сознания + перфузии без видимых проблем дыхания - декомпенсированный шок. Критическое снижение ткaневого кислорода.';
                actions = [
                    'Агрессивная жидкостная реанимация 20 мл/кг × 3 до 60 мл/кг',
                    'Вазоактивные препараты при неответе (адреналин 0,05-0,3 мкг/кг/мин)',
                    'АБ в первый час при септическом шоке',
                    'Подготовка к интубации'
                ];
            } else if (a && !b && !c) {
                interpretation = 'Дисфункция ЦНС / метаболическая';
                color = '#F59E0B';
                details = 'Изолированное нарушение сознания при сохранном дыхании и перфузии. Причины: гипогликемия, интоксикация, постиктальное состояние, ЧМТ, менингит.';
                actions = [
                    'Быстро: глюкоза крови (правило «don\'t ever forget glucose»)',
                    'pGCS/AVPU, неврологический осмотр',
                    'Токсикологический скрининг, NH₃',
                    'При лихорадке - люмбальная пункция после КТ'
                ];
            } else if (!a && b && c) {
                interpretation = 'Шок + респираторный дистресс';
                color = '#EF4444';
                details = 'Сочетание компенсированного шока с респираторным дистрессом. Высокий риск декомпенсации.';
                actions = [
                    'Кислород + болюс 20 мл/кг',
                    'Мониторинг ABCDE, готовность к интубации',
                    'Исключить напряжённый пневмоторакс, тампонаду'
                ];
            } else {
                interpretation = 'Кардиопульмональная недостаточность';
                color = '#991B1B';
                details = 'Все три стороны треугольника нарушены - преморбидное состояние перед остановкой кровообращения. Немедленная реанимация.';
                actions = [
                    'Немедленный вызов реанимационной бригады',
                    'BLS/ALS по PALS (ABC, болюс 20 мл/кг, адреналин)',
                    'Интубация, ИВЛ',
                    'Адреналин 0,01 мг/кг в/в при остановке'
                ];
            }
            const pattern = `A:${a ? 'abnormal' : 'normal'} · B:${b ? 'abnormal' : 'normal'} · C:${c ? 'abnormal' : 'normal'}`;
            return {
                value: pattern,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'PAT - первые 30 секунд оценки, до касания ребёнка',
                    'Не замещает ABCDE; это «across-the-room» ориентир',
                    'Культуральные различия (замкнутость) могут имитировать нарушение appearance',
                    'Критерии TICLS: Tone, Interactiveness, Consolability, Look/gaze, Speech/cry'
                ],
                related: [
                    {
                        id: 'pews',
                        title: 'PEWS'
                    },
                    {
                        id: 'pgcs',
                        title: 'Pediatric GCS'
                    },
                    {
                        id: 'apgar',
                        title: 'Apgar'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Dieckmann RA, Brownstein D, Gausche-Hill M. The Pediatric Assessment Triangle: a novel approach for the rapid evaluation of children. Pediatr Emerg Care 2010;26:312-315. AAP PALS 2020.",
    countries: "Международный (AAP/AHA PALS)",
    presets: [
      {
        label: "Стабильный ребёнок",
        values: {
          appearance: "normal",
          breathing: "normal",
          circulation: "normal"
        }
      },
      {
        label: "Респираторный дистресс",
        values: {
          appearance: "normal",
          breathing: "abnormal",
          circulation: "normal"
        }
      },
      {
        label: "Декомп. шок",
        values: {
          appearance: "abnormal",
          breathing: "normal",
          circulation: "abnormal"
        }
      },
      {
        label: "Кардиопульмон. недост.",
        values: {
          appearance: "abnormal",
          breathing: "abnormal",
          circulation: "abnormal"
        }
      }
    ],
    info: "### Для чего используется\n**Pediatric Assessment Triangle (PAT)** - инструмент быстрой визуальной («across-the-room») оценки тяжести состояния ребёнка за 15-30 секунд до физического контакта. Используется в догоспитальном и экстренном звеньях (AAP, PALS, APLS).\n\n### 3 компонента\n| Сторона | Что оценивается | Примеры нарушений |\n|---|---|---|\n| **A - Appearance** | Tone, Interactiveness, Consolability, Look/gaze, Speech/cry (TICLS) | Вялость, гипотония, отсутствие зрительного контакта, слабый крик |\n| **B - Work of Breathing** | Патол. звуки, ретракции, поза, флейринг | Стридор, свистящее, хрюканье, tripod, раздувание крыльев носа |\n| **C - Circulation to skin** | Цвет кожи, мраморность | Бледность, пятнистость, цианоз |\n\n### 8 комбинаций\n| A | B | C | Категория |\n|---|---|---|---|\n| N | N | N | Стабилен |\n| N | A | N | Респираторный дистресс |\n| A | A | N | Респираторная недостаточность |\n| N | N | A | Компенс. шок |\n| A | N | A | Декомпенс. шок |\n| A | N | N | Дисфункция ЦНС / метаболическая |\n| N | A | A | Шок + респираторный дистресс |\n| A | A | A | Кардиопульмональная недостаточность |\n\n### Ограничения\n- Предварительная оценка; затем обязательно ABCDE\n- Требует опыта для правильной интерпретации appearance\n- Плач при осмотре ≠ нарушение appearance (скорее признак сохранной функции)\n\n### Тактика\n- **Стабилен**: плановая оценка\n- **Респираторный дистресс/шок**: немедленная интервенция\n- **Кардиопульмон. недост.**: реанимационная бригада, PALS"
  };

export default runner;

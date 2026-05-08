/**
 * Runner: pals
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
        id: "algorithm",
        label: "Алгоритм",
        type: "select",
        options: [
          {
            value: "bls",
            label: "Педиатрический BLS"
          },
          {
            value: "brady",
            label: "Брадикардия с пульсом"
          },
          {
            value: "tachy",
            label: "Тахикардия (SVT/VT) с пульсом"
          },
          {
            value: "arrest",
            label: "Остановка кровообращения (VF/pVT/asystole/PEA)"
          },
          {
            value: "post",
            label: "Post-cardiac arrest care"
          }
        ]
      },
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 1,
        max: 80,
        step: 0.5,
        quickValues: [
          5,
          10,
          15,
          20,
          30,
          50
        ]
      }
    ],
    compute: (v)=>{
            const alg = String(v.algorithm);
            const w = Number(v.weight) || 10;
            let title = '', interpretation = '', details = '', color = '#3B82F6';
            const actions = [];
            if (alg === 'bls') {
                title = 'Педиатрический BLS';
                interpretation = 'AHA 2020 BLS';
                color = '#3B82F6';
                details = `**Последовательность:**
1. Проверка окружения → отзывчивости → вызов помощи (911/код)
2. Пульс ≤10 с (центральный: брахиальный <1 г, каротидный/бедренный >1 г)
3. Без пульса или ≤60 с плохой перфузией → компрессии
4. Частота 100-120/мин, глубина ≥1/3 AP-диаметра (~4 см у младенцев, ~5 см у детей)
5. 1 спасатель: 30:2; 2 спасателя: 15:2
6. Смена каждые 2 мин
7. AED/дефибриллятор - как только доступен`;
                actions.push('30:2 одиночный спасатель', '15:2 два спасателя', 'AED/дефибриллятор ASAP', 'Минимизировать паузы');
            } else if (alg === 'brady') {
                title = 'Брадикардия с пульсом';
                interpretation = 'ЧСС <60 + плохая перфузия';
                color = '#F59E0B';
                details = `**Шаги:**
1. Поддержка ABC, O₂, монитор, в/в доступ
2. Если ЧСС <60 несмотря на оксигенацию + вентиляцию → **СЛР**
3. **Эпинефрин 0,01 мг/кг в/в/в/к = ${(w * 0.01).toFixed(2)} мг** (повтор каждые 3-5 мин)
4. **Атропин 0,02 мг/кг** (мин 0,1 мг, макс 0,5 мг) = ${Math.max(0.1, w * 0.02).toFixed(2)} мг - при вагальной брадикардии или AV-блокаде
5. Кардиостимуляция (чреcкожная/трансвенозная) при рефрактерной
6. Искать и лечить причину: 6 H (hypoxia, hypovolemia, H+, hypo/hyperkalemia, hypoglycemia, hypothermia) и 5 T`;
                actions.push(`Эпинефрин ${(w * 0.01).toFixed(2)} мг в/в`, `Атропин ${Math.max(0.1, w * 0.02).toFixed(2)} мг при вагальной`, 'СЛР при ЧСС <60 с плохой перфузией', 'Искать 6H/5T');
            } else if (alg === 'tachy') {
                title = 'Тахикардия с пульсом';
                interpretation = 'SVT vs VT';
                color = '#EF4444';
                details = `**Оценка стабильности:**
- Нестабилен (гипотензия, шок, alter. сознание, ОСН) → **синхр. кардиоверсия 0,5-1 Дж/кг = ${(w * 0.5).toFixed(0)}-${w} Дж** (до 2 Дж/кг при неудаче)

**Стабильный SVT (узкий QRS <0,09 с):**
1. Ваготехники (лёд на лицо у младенцев, Valsalva)
2. **Аденозин 0,1 мг/кг = ${(w * 0.1).toFixed(1)} мг** быстрый болюс + 5-10 мл NaCl
3. 2-я доза 0,2 мг/кг = ${(w * 0.2).toFixed(1)} мг
4. При неудаче - синхр. кардиоверсия

**Стабильный VT (широкий QRS >0,09 с):**
1. **Амиодарон 5 мг/кг = ${(w * 5).toFixed(0)} мг** в/в за 20-60 мин
2. Или прокаинамид 15 мг/кг за 30-60 мин (не сочетать с амиодароном)
3. При неудаче - синхр. кардиоверсия`;
                actions.push(`Аденозин ${(w * 0.1).toFixed(1)} мг (SVT)`, `Амиодарон ${(w * 5).toFixed(0)} мг (VT)`, `Кардиоверсия ${(w * 0.5).toFixed(0)} Дж`, 'Консультация педиатр. кардиолога');
            } else if (alg === 'arrest') {
                title = 'Остановка кровообращения';
                interpretation = 'VF/pVT vs asystole/PEA';
                color = '#991B1B';
                details = `**Общие шаги:**
1. Высококачественная СЛР (глубина, частота, минимальные паузы, полная декомпрессия)
2. 15:2 с двумя спасателями, 30:2 с одним
3. Интубация - не прерывая компрессий

**VF/pVT:**
1. **Дефибрилляция 2 Дж/кг = ${(w * 2).toFixed(0)} Дж**
2. СЛР 2 мин
3. **Эпинефрин 0,01 мг/кг = ${(w * 0.01).toFixed(2)} мг** каждые 3-5 мин
4. **Дефибрилляция 4 Дж/кг = ${(w * 4).toFixed(0)} Дж**
5. **Амиодарон 5 мг/кг = ${(w * 5).toFixed(0)} мг** или лидокаин 1 мг/кг = ${w} мг
6. Повтор цикла дефибрилляция → СЛР → препарат

**Asystole/PEA:**
1. СЛР + **Эпинефрин 0,01 мг/кг = ${(w * 0.01).toFixed(2)} мг** каждые 3-5 мин
2. Искать 6H/5T
3. Без дефибрилляции

**6H/5T:** hypoxia, hypovolemia, H+, hypo-/hyper-kalemia, hypo-glycemia, hypothermia; toxins, tamponade, tension pneumothorax, thrombosis (PE/coronary), trauma.`;
                actions.push(`Дефибрил. ${(w * 2).toFixed(0)} → ${(w * 4).toFixed(0)} Дж (VF/pVT)`, `Эпинефрин ${(w * 0.01).toFixed(2)} мг q3-5 мин`, `Амиодарон ${(w * 5).toFixed(0)} мг при рефракт. VF`, 'Лечить 6H/5T', 'Интубация ETT / капнография');
            } else if (alg === 'post') {
                title = 'Post-cardiac arrest care';
                interpretation = 'После ROSC';
                color = '#F59E0B';
                details = `**Цели (AHA 2020):**
1. **Оксигенация**: SpO₂ 94-99%, избегать гипероксии
2. **Вентиляция**: PaCO₂ 35-45 мм рт.ст.
3. **Гемодинамика**: САД >5-й перцентиль; избегать гипотензии
4. **Температура**: нормотермия 36-37,5 °C ИЛИ терапевтическая гипотермия 32-34 °C × 48 ч (при коме после ROSC)
5. **Глюкоза**: 4-10 ммоль/л; избегать гипогликемии
6. **ЭЭГ мониторинг** - судороги часто субклинические
7. **Нейропрогноз** - не ранее 72 ч после ROSC

**Обследование:** 12-лид ЭКГ, Rg грудной клетки, ABG, лактат, электролиты, коагулограмма, эхо-КГ, КТ головы при неврологической симптоматике.`;
                actions.push('SpO₂ 94-99%', 'PaCO₂ 35-45', 'TTM 32-34 или 36 °C × 48 ч', 'ЭЭГ мониторинг', 'Нейропрогноз ≥72 ч');
            }
            return {
                value: title,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'AHA PALS 2020 - проверяйте обновления',
                    'Дозы для ≤12 лет / ≤40 кг; для подростков - взрослые протоколы',
                    'Эпинефрин ЭТТ - 10× в/в доза (0,1 мг/кг)',
                    'Кардиоверсия синхронизирована, дефибрилляция - нет',
                    'Амиодарон и прокаинамид нельзя комбинировать (кумуляция QT)'
                ],
                related: [
                    {
                        id: 'broselow',
                        title: 'Broselow Tape'
                    },
                    {
                        id: 'apgar',
                        title: 'Apgar'
                    },
                    {
                        id: 'pews',
                        title: 'PEWS'
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
    reference: "American Heart Association. 2020 AHA Guidelines for CPR and ECC - Pediatric Advanced Life Support. Circulation 2020;142:S469-S523.",
    countries: "Международный (AHA)",
    presets: [
      {
        label: "Арест, ребёнок 10 кг",
        values: {
          algorithm: "arrest",
          weight: 10
        }
      },
      {
        label: "SVT, ребёнок 15 кг",
        values: {
          algorithm: "tachy",
          weight: 15
        }
      },
      {
        label: "Брадикардия, ребёнок 20 кг",
        values: {
          algorithm: "brady",
          weight: 20
        }
      },
      {
        label: "Post-ROSC",
        values: {
          algorithm: "post",
          weight: 15
        }
      }
    ],
    info: "### Для чего используется\n**PALS (Pediatric Advanced Life Support, AHA 2020)** - расширенная педиатрическая реанимация: алгоритмы BLS, брадикардии, тахикардии, остановки кровообращения, post-arrest.\n\n### Основные алгоритмы\n1. **BLS**: 30:2 (1 спас.) / 15:2 (2 спас.), 100-120/мин\n2. **Брадикардия**: O₂/вентиляция → СЛР при ЧСС <60 → эпинефрин\n3. **Тахикардия**: SVT (аденозин) / VT (амиодарон) / кардиоверсия при нестабильности\n4. **Арест VF/pVT**: дефибрил. 2→4 Дж/кг + эпинефрин + амиодарон\n5. **Арест asystole/PEA**: СЛР + эпинефрин, 6H/5T\n6. **Post-ROSC**: SpO₂ 94-99, PaCO₂ 35-45, TTM, ЭЭГ\n\n### Ключевые дозы\n| Препарат | Доза |\n|---|---|\n| Эпинефрин | 0,01 мг/кг в/в; 0,1 мг/кг ЭТТ |\n| Амиодарон | 5 мг/кг болюс (макс 3×) |\n| Аденозин | 0,1 → 0,2 мг/кг |\n| Атропин | 0,02 мг/кг (мин 0,1 мг) |\n| Дефибрилляция | 2 → 4 Дж/кг |\n| Кардиоверсия | 0,5-1 Дж/кг |\n\n### 6H/5T (обратимые причины)\n**6H:** Hypoxia, Hypovolemia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypoglycemia, Hypothermia\n**5T:** Toxins, Tamponade (cardiac), Tension pneumothorax, Thrombosis (PE, coronary), Trauma\n\n### Ограничения\n- До 12 лет / 40 кг\n- Новорождённые - NRP, не PALS\n- Беременные подростки - modified ACLS\n\n### Тактика\n- Использовать Broselow tape для расчёта доз и оборудования\n- Капнография для подтверждения ETT и качества СЛР (>10 мм рт.ст.)\n- Team Dynamics: closed-loop communication"
  };

export default runner;

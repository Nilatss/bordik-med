/**
 * Runner: toast
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
    kind: "score",
    maxScore: 5,
    inputs: [
      {
        id: "subtype",
        label: "Подтип ишемического инсульта",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - Large-artery atherosclerosis (стеноз/окклюзия ≥ 50 %)",
            points: 1
          },
          {
            value: "2",
            label: "2 - Cardioembolism (высокий/средний риск)",
            points: 2
          },
          {
            value: "3",
            label: "3 - Small-vessel occlusion (лакунарный)",
            points: 3
          },
          {
            value: "4",
            label: "4 - Other determined etiology (диссекция, васкулит, тромбофилия)",
            points: 4
          },
          {
            value: "5",
            label: "5 - Undetermined (криптогенный / 2+ причины / неполное обследование)",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "1 - LAA",
        color: "#EF4444",
        description: "Атеротромботический инсульт (атеросклероз крупных сосудов).",
        details: "Стеноз > 50 % или окклюзия крупной интра-/экстракраниальной артерии, соответствующая области инфаркта. Риск рецидива - 10-20 % за год.",
        actions: [
          "Антиагрегант (АСК или клопидогрел; DAPT × 21-90 дн при минорном инсульте - CHANCE/POINT)",
          "Статин высокоинтенсивный (аторвастатин 80 / розувастатин 40)",
          "CEA или стентирование при стенозе сонной ≥ 70 % в течение 2 нед",
          "Контроль АД, диабета, отказ от курения"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "2 - Cardioembolism",
        color: "#991B1B",
        description: "Кардиоэмболический инсульт.",
        details: "Высокий риск: ФП, механический клапан, ОИМ < 4 нед, аневризма ЛЖ, эндокардит. Средний риск: ОАП, митральный стеноз, дилатационная КМП.",
        actions: [
          "Антикоагулянт (DOAC при ФП; варфарин при механическом клапане / митральном стенозе)",
          "Время начала: малый инфаркт - 3-5 дн; крупный - 7-14 дн (1-3-6-12 rule)",
          "ЭхоКГ (TTE + TEE при подозрении на эндокардит / ПФО)",
          "Холтер ≥ 72 ч / имплантируемый регистратор (CRYSTAL-AF)"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "3 - Lacunar",
        color: "#F59E0B",
        description: "Малые сосуды (lacunar).",
        details: "Классический лакунарный синдром (pure motor, pure sensory, sensorimotor, ataxic hemiparesis, dysarthria-clumsy hand); инфаркт < 15 мм в базальных ганглиях, thalamus, pons.",
        actions: [
          "Антиагрегант (АСК 100 мг)",
          "Контроль АД - ключевой фактор",
          "Статин",
          "Контроль гликемии"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "4 - Other determined",
        color: "#F59E0B",
        description: "Другая определённая этиология.",
        details: "Диссекция артерий, васкулиты (ЦНС, крупных сосудов), тромбофилия (AFS, Leiden), CADASIL, Фабри, MELAS, болезнь Моямоя, наркотики.",
        actions: [
          "Таргетная терапия по этиологии",
          "Диссекция - АСК или антикоагулянт × 3-6 мес (CADISS: эквивалентно)",
          "Васкулит - ГКС + иммуносупрессия",
          "Тромбофилия - длительная АК"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "5 - Undetermined",
        color: "#6B7280",
        description: "Неуточнённая этиология (криптогенная или неполное обследование).",
        details: "В ~ 25-40 % случаев причина не устанавливается. ESUS (Embolic Stroke of Undetermined Source) - подкатегория: эмболический паттерн без источника после стандартного обследования.",
        actions: [
          "Длительный мониторинг ритма (≥ 30 дн, желательно implantable loop recorder)",
          "Расширенная ЭхоКГ + TEE (поиск ПФО, аневризмы предсердия)",
          "Скрининг тромбофилии у молодых (< 55)",
          "DOAC vs АСК при ESUS - НЕ рекомендуется (NAVIGATE-ESUS, RE-SPECT ESUS: нет преимущества)"
        ]
      }
    ],
    caveats: [
      "Классификация TOAST - этиологическая, применяется ПОСЛЕ полного обследования",
      "Альтернативы: CCS (Causative Classification System) и ASCOD - учитывают степень доказательности",
      "До 40 % инсультов классифицируются как Undetermined при стандартном обследовании",
      "ESUS - не синоним криптогенного; требует соблюдения критериев (эмболический паттерн, без ФП)"
    ],
    related: [
      {
        id: "nihss",
        title: "NIHSS"
      },
      {
        id: "aspects",
        title: "ASPECTS"
      },
      {
        id: "chads-vasc",
        title: "CHA₂DS₂-VASc"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    reference: "Adams HP Jr, Bendixen BH, Kappelle LJ et al. Classification of subtype of acute ischemic stroke. Definitions for use in a multicenter clinical trial. TOAST. Stroke 1993;24:35-41.",
    countries: "Международный (AHA/ASA, ESO)",
    info: "### Для чего используется\n**TOAST (Trial of Org 10172 in Acute Stroke Treatment, Adams 1993)** - этиологическая классификация **ишемического инсульта** на 5 подтипов. Определяет вторичную профилактику, прогноз рецидива.\n\n### 5 подтипов\n| # | Подтип | Доля | Критерии |\n|---|---|---|---|\n| **1** | **LAA** (Large-Artery Atherosclerosis) | ~ 20 % | Стеноз > 50 % соответствующей артерии (КТ-ангио / МРА / УЗДС / ангио) + исключение кардио-источника |\n| **2** | **Cardioembolism** | ~ 20 % | Кардио-источник высокого/среднего риска (ФП, механический клапан, ОИМ < 4 нед и т.д.) |\n| **3** | **Small-Vessel (lacunar)** | ~ 25 % | Классический лакунарный синдром + инфаркт < 15 мм в глубоких структурах + нет крупно-артериальной или кардио-этиологии |\n| **4** | **Other determined** | ~ 5 % | Диссекция, васкулит, тромбофилия, наркотики, генетические (CADASIL, Fabry) |\n| **5** | **Undetermined** | ~ 30 % | (а) криптогенный после полного обследования; (b) 2+ конкурирующие причины; (c) неполное обследование |\n\n### Кардио-источники\n| Высокий риск | Средний риск |\n|---|---|\n| ФП, трепетание | Митральный пролапс |\n| Механический клапан | Кальцификация митрального кольца |\n| ОИМ < 4 нед | Митральный стеноз без ФП |\n| Тромб ЛЖ / ЛП | ПФО (спорно) |\n| Эндокардит | Аневризма МПП |\n| Дилатационная КМП | Сегментарная гипокинезия ЛЖ |\n\n### Альтернативные классификации\n| Система | Особенности |\n|---|---|\n| **TOAST** | 5 подтипов, фенотипическая |\n| **CCS** (Ay 2007) | Компьютерная, учитывает доказательность (\"evident\" / \"probable\" / \"possible\") |\n| **ASCOD** | 5 доменов (A-atherosclerosis, S-small, C-cardio, O-other, D-dissection) × 4 градации |\n\n### ESUS (подкатегория Undetermined)\nКритерии Hart 2014:\n1. Нелакунарный инфаркт на визуализации\n2. Нет интра-/экстракраниального стеноза ≥ 50 %\n3. Нет кардио-источника высокого риска\n4. Нет другой определённой причины (васкулит, диссекция)\n\n### Вторичная профилактика по TOAST\n| Подтип | Первая линия |\n|---|---|\n| **LAA** | АСК + статин; DAPT 21-90 дн при минор; CEA/CAS при стенозе ≥ 70 % |\n| **Cardioembolism** | Антикоагулянт (DOAC / варфарин) |\n| **Lacunar** | АСК + контроль АД, диабета |\n| **Other** | По этиологии |\n| **Undetermined / ESUS** | АСК 100 мг (DOAC не превосходит - NAVIGATE-ESUS, RE-SPECT ESUS) |\n\n### Ограничения\n- Требует полного обследования (КТ/МРТ-ангио, ЭхоКГ ± TEE, Холтер ≥ 72 ч)\n- Субъективность «конкурирующих причин» (подтип 5b)\n- Не используется в первые часы (нужна визуализация)"
  };

export default runner;

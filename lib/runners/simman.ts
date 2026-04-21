// @ts-nocheck
/** Runner: simman — SimMan / high-fidelity patient simulators (Laerdal) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Норвегия / Международный (Laerdal Medical)',
  reference: 'Laerdal Medical. SimMan 3G PLUS, SimMan ALS, SimBaby, SimMom, SimJunior. https://laerdal.com/products/simulation-training/ (лидер симуляционного обучения с 1960 г.)',
  inputs: [
    {
      id: 'scenario',
      label: 'Тип симуляционного сценария',
      type: 'select',
      options: [
        { value: 'acls', label: 'ACLS / кардиальные аритмии' },
        { value: 'atls', label: 'ATLS / травма' },
        { value: 'sepsis', label: 'Сепсис / септический шок' },
        { value: 'anaphylaxis', label: 'Анафилаксия' },
        { value: 'airway', label: 'Трудные дыхательные пути' },
        { value: 'obstetric', label: 'Акушерские осложнения (SimMom)' },
        { value: 'pediatric', label: 'Педиатрия (SimJunior / SimBaby)' },
        { value: 'crisis', label: 'Crisis Resource Management (CRM)' },
      ],
    },
  ],
  presets: [
    { label: 'ACLS сценарий', values: { scenario: 'acls' } },
    { label: 'Сепсис', values: { scenario: 'sepsis' } },
    { label: 'CRM / командная работа', values: { scenario: 'crisis' } },
  ],
  compute: (v) => {
    const s = String(v.scenario || 'acls');
    const map: Record<string, { title: string; manikin: string; objectives: string; debrief: string }> = {
      acls: { title: 'ACLS / кардиальные аритмии', manikin: 'SimMan 3G PLUS или SimMan ALS', objectives: 'Распознать VF/VT/PEA/asystole → правильный алгоритм AHA ACLS (CPR качество, дефибрилляция, медикаменты)', debrief: 'Focus: CPR fraction ≥ 80%, shock-to-compression ≤ 10 s, timely epinephrine (1 mg IV q 3-5 min)' },
      atls: { title: 'ATLS / травма', manikin: 'SimMan 3G Trauma (с интегрированными wound modules)', objectives: 'Primary survey (ABCDE), массивное кровотечение, пневмоторакс dekomp, FAST, transfusion protocol', debrief: 'Time-based performance: airway < 2 min, BP assessment < 5 min, CT decision < 15 min' },
      sepsis: { title: 'Сепсис / септический шок', manikin: 'SimMan 3G PLUS (физиологическая модель SSC-compatible)', objectives: 'qSOFA/SOFA recognition → Hour-1 bundle: lactate, blood cultures, broad AB, 30 ml/kg crystalloid, vasopressor', debrief: 'SSC 2021 bundle compliance; time-to-antibiotic; team communication (closed-loop)' },
      anaphylaxis: { title: 'Анафилаксия', manikin: 'SimMan 3G или SimMan Essential', objectives: 'Распознать по Sampson criteria → эпинефрин IM 0.3-0.5 мг (взр.) в anterolateral thigh, H1/H2, фluids', debrief: 'Epi delay = #1 ошибка; осветить difference IM vs IV dosing; biphasic reaction warning' },
      airway: { title: 'Трудные дыхательные пути', manikin: 'SimMan 3G с configurable airway (tongue edema, laryngospasm, trismus modules)', objectives: 'DAS guidelines (UK) или ASA difficult airway algorithm: plan A/B/C/D; awake FOI, LMA, surgical cric', debrief: 'CICO (can\'t intubate can\'t oxygenate) decision threshold; team escalation timing' },
      obstetric: { title: 'Акушерские осложнения', manikin: 'SimMom (роды, PPH, shoulder dystocia, обструкция плаценты)', objectives: 'PPH management (4T: tone/trauma/tissue/thrombin), shoulder dystocia (HELPERR), pre-eclampsia crisis', debrief: 'MgSO4 dosing, uterotonics sequence, massive transfusion protocol timing' },
      pediatric: { title: 'Педиатрия', manikin: 'SimJunior (6-летний) или SimBaby (infant) или Premature Anne', objectives: 'PALS algorithms (weight-based dosing), anaphylaxis pediatric, meningococcal sepsis, bronchiolitis', debrief: 'Broselow tape usage, pediatric dosing calculation, parent communication' },
      crisis: { title: 'Crisis Resource Management (CRM)', manikin: 'Любой high-fidelity manikin + камеры для debrief', objectives: 'Leadership, closed-loop communication, situation awareness, distribution of workload, calling for help', debrief: 'Используется TeamSTEPPS фреймворк; видео-assisted debriefing' },
    };
    const e = map[s];
    return {
      value: e.title,
      unit: 'SimMan',
      color: '#6B7280',
      interpretation: `Laerdal simulation: ${e.title}`,
      details: `Сценарий: ${e.title}\n\nМанекен: ${e.manikin}\n\nЦели обучения: ${e.objectives}\n\nDebriefing focus: ${e.debrief}\n\nLaerdal SimMan family:\n- SimMan 3G PLUS — флагман, interactive physiology + automatic drug recognition (RFID)\n- SimMan 3G Trauma — модули для трамы + wounds\n- SimMan ALS — ACLS/BLS фокус, портативный\n- SimMan Essential — базовый high-fidelity\n- SimMom — roды + obstetric emergencies\n- SimJunior — 6-летний ребёнок\n- SimBaby — 6-мес infant\n- Premature Anne — 25-недельный preterm\n\nСимуляционный debriefing (PEARLS framework):\n1. Reactions — эмоциональная разрядка\n2. Description — что произошло (facts)\n3. Analysis — почему действия (frames)\n4. Application — как улучшить в следующий раз\n5. Summary — take-home points`,
      actions: [
        'Открыть https://laerdal.com/products/simulation-training/',
        'SimCenter (LLEAP software) — программное управление сценарием + физиологической моделью',
        'SimDesigner — создание custom сценариев',
        'SimView — video capture + annotation для debriefing',
        'Pre-built scenarios library — > 100 валидированных сценариев (AHA, ERC compliant)',
        'Instructor training: Laerdal Educational Services — курсы по debriefing (PEARLS, DASH)',
      ],
      caveats: [
        'Стоимость: SimMan 3G PLUS ~$75 000-100 000; + обслуживание',
        'Debriefing требует обученного инструктора — без него эффект обучения низкий',
        'Fidelity ≠ learning: высокая реалистичность не всегда улучшает outcomes vs low-fidelity',
        'Психологическая безопасность — ключ; "no-blame" atmosphere в debrief',
        'Scenario validation: предпочтительно сценарии из AHA/ERC/ACS официальных библиотек',
        'Альтернативы: CAE Healthcare (METIman, Juno), Gaumard (HAL) — похожий класс устройств',
      ],
      related: [
        { id: 'acls-algo', title: 'ACLS алгоритмы (AHA)' },
        { id: 'atls', title: 'ATLS principles' },
        { id: 'osce', title: 'OSCE structure' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**SimMan** (Laerdal Medical, Норвегия) — семейство **high-fidelity patient simulators** (интерактивных манекенов) для медицинского обучения. Laerdal — пионер симуляции с 1960 г. (Resusci Anne — первая CPR кукла).

### Семейство продуктов
| Манекен | Тип | Применение |
|---|---|---|
| SimMan 3G PLUS | Флагман, взр | ACLS, критика, анестезия |
| SimMan 3G Trauma | Взр + wounds | ATLS, военная медицина |
| SimMan ALS | Взр, портативный | BLS/ACLS outreach |
| SimMan Essential | Взр, базовый | Базовые сценарии |
| SimMom | Беременная | Акушерство, PPH, SD |
| SimJunior | 6-летний | PALS, pediatric ED |
| SimBaby | 6-мес | NRP, pediatric critical care |
| Premature Anne | 25-нед preterm | Неонатология, NICU |

### Ключевые возможности SimMan 3G PLUS
- Автоматические движения груди, сердцебиение (аускультация), пульсация
- Автоматическое распознавание медикаментов (RFID syringes)
- Физиологическая модель реального времени (реагирует на vitals)
- Конвульсии, mydriasis/miosis, цианоз
- Airway: с ETT, LMA, cricothyroidotomy compatible
- Wireless / tetherless для реалистичной мобильности

### Debriefing frameworks
- **PEARLS** (Eppich & Cheng, 2015) — наиболее распространён
- **DASH** (Debriefing Assessment for Simulation in Healthcare)
- **Advocacy-inquiry** (Rudolph)

### ПО Laerdal
- **LLEAP** (Laerdal Learning Application) — управление сценарием
- **SimDesigner** — создание custom сценариев
- **SimView** — video + annotation для debrief
- **SessionViewer** — data export

### Альтернативы
- **CAE Healthcare** — METIman, Juno, Apollo
- **Gaumard** — HAL (S5301), Victoria, Noelle
- **Limbs & Things** — part-task trainers (узкие навыки)`,
};
export default runner;

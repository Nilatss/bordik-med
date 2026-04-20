// @ts-nocheck
/** Runner: pears - AHA PEARS 2018/2023 (Paediatric Emergency Assessment, Recognition, Stabilization) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Этап PEARS',
      type: 'select',
      options: [
        { value: 'pat', label: 'Initial impression - PAT' },
        { value: 'primary', label: 'Primary survey - ABCDE' },
        { value: 'secondary', label: 'Secondary survey - SAMPLE' },
        { value: 'resp', label: 'Respiratory distress / failure' },
        { value: 'shock', label: 'Shock (comp / hypotensive)' },
        { value: 'arrest', label: 'Cardiac arrest recognition' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.step);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      pat: {
        title: 'PAT - Pediatric Assessment Triangle',
        c: '#22C55E',
        details: 'Первое впечатление за <60 с без прикосновения: Appearance, Work of Breathing, Circulation. Определяет sick vs not-sick.',
        actions: [
          'A - Appearance: TICLS (Tone, Interactiveness, Consolability, Look/gaze, Speech/cry)',
          'B - Work of Breathing: retractions, grunting, nasal flaring, head bobbing, stridor',
          'C - Circulation: цвет кожи (pale, cyanotic, mottled)',
          'Все 3 нормальные → stable',
          'Abnormal A → CNS / metabolic',
          'Abnormal B → respiratory',
          'Abnormal C → shock',
          'A+B+C abnormal → cardiopulmonary failure / arrest',
        ],
      },
      primary: {
        title: 'Primary survey - ABCDE',
        c: '#4B8DF5',
        details: 'Hands-on оценка: Airway, Breathing, Circulation, Disability, Exposure. С вмешательствами по ходу.',
        actions: [
          'A - Airway: проходимость, stridor, drooling; open airway',
          'B - Breathing: ЧД, SpO₂, работа дыхания, аускультация; O₂ терапия',
          'C - Circulation: ЧСС, CRT, АД, пульс; IV/IO access',
          'D - Disability: AVPU / pGCS, зрачки, глюкоза',
          'E - Exposure: полный осмотр, температура, prevent hypothermia',
        ],
      },
      secondary: {
        title: 'Secondary survey - SAMPLE',
        c: '#F59E0B',
        details: 'История и подробный осмотр после стабилизации ABCDE.',
        actions: [
          'S - Signs/Symptoms',
          'A - Allergies',
          'M - Medications',
          'P - Past medical history',
          'L - Last meal / last oral intake',
          'E - Events leading up',
          'Focused physical exam head-to-toe',
          'Reassess ABCDE',
        ],
      },
      resp: {
        title: 'Respiratory distress / failure',
        c: '#EF4444',
        details: 'Distress = компенсированная; failure = декомпенс., ведёт к остановке. Ранняя интервенция критична.',
        actions: [
          'Distress: повышенная ЧД, retractions, SpO₂ снижена; ребёнок компенсирует',
          'Failure: ↓ ЧД или апноэ, bradycardia, ↓↓ SpO₂, altered mental status',
          'Вмешательство: O₂ (NRM 15 л/мин), позиция комфортная',
          'Неба­лайзер (сальбутамол 2.5-5 мг) при бронхоспазме',
          'Адреналин неб. 0.5 мл/кг 1:1000 (max 5 мл) при крупе/стридоре',
          'BVM при failure; вызов team, подготовка к интубации',
        ],
      },
      shock: {
        title: 'Shock',
        c: '#DC2626',
        details: 'Компенсированный (норм АД, тахикардия, плохая перфузия) → гипотензивный (гипотензия, bradycardia - предarrest!). PEARS акцентирует раннее распознавание.',
        actions: [
          'Признаки compensated: ↑ ЧСС, ↑ CRT (>2 с), холодные конечности, норм. АД',
          'Признаки hypotensive: ↓ АД, altered mental, ↓ диурез - предарест',
          'IV/IO в ≤90 с',
          'Болюс 10-20 мл/кг кристаллоид, переоценить',
          'До 3 болюсов; если не улучшается - вазопрессор',
          'Сепсис: AB в 1-й час',
          'Анафилаксия: адреналин 0.01 мг/кг IM',
        ],
      },
      arrest: {
        title: 'Cardiac arrest recognition',
        c: '#991B1B',
        details: 'PEARS обучает распознаванию остановки - не лечению. Передать PALS-provider / code team.',
        actions: [
          'Нет реакции + отсутствие дыхания / gasping + нет пульса (≤10 с)',
          'Активировать код',
          'Начать высококачественную BLS (100-120/мин, глубина 1/3 AP)',
          '15:2 (2 спасателя), 30:2 (1 спасатель)',
          'AED с педиатрическими электродами / аттенюатором',
          'Передача PALS team на прибытие',
        ],
      },
    };
    const r = map[s] || map.pat;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'PEARS - для non-paediatric providers (медсёстры общего профиля, техники EMS, стоматологи)',
        'Цель PEARS: recognize & stabilize, не advanced management (это PALS)',
        'Компенсированный шок у ребёнка - норм. АД не исключает шок',
      ],
      related: [
        { id: 'pals', title: 'PALS' },
        { id: 'epals', title: 'EPALS / APLS' },
        { id: 'pat', title: 'PAT' },
        { id: 'pgcs', title: 'Pediatric GCS' },
        { id: 'pews', title: 'PEWS' },
        { id: 'bls-acls', title: 'AHA BLS' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Педиатрия' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'American Heart Association. PEARS Provider Manual 2018 (updated 2023 supplementary). Ralston M et al. AHA Pediatric Advanced Life Support (framework for PEARS).',
  countries: 'AHA (США, международно)',
  presets: [
    { label: 'PAT', values: { step: 'pat' } },
    { label: 'ABCDE', values: { step: 'primary' } },
    { label: 'SAMPLE', values: { step: 'secondary' } },
    { label: 'Respiratory', values: { step: 'resp' } },
    { label: 'Shock', values: { step: 'shock' } },
    { label: 'Arrest', values: { step: 'arrest' } },
  ],
  info: `### Для чего используется
**PEARS (Paediatric Emergency Assessment, Recognition and Stabilization)** - курс AHA для не-педиатрических провайдеров (ER nurses, техники EMS, стоматологи). Цель: **распознать и стабилизировать** критически больного ребёнка до прибытия PALS-команды.

### Отличие от PALS
| Курс | Аудитория | Цель |
|---|---|---|
| **PEARS** | Non-peds providers | Recognize + stabilize |
| **PALS** | Peds providers | Full advanced management |

### Алгоритм оценки
1. **Initial impression - PAT** (<60 с, без касания)
2. **Primary survey - ABCDE** (hands-on + интервенции)
3. **Secondary survey - SAMPLE** (анамнез + полный осмотр)
4. **Reassessment** постоянно

### PAT (Pediatric Assessment Triangle)
- **A** Appearance (TICLS: Tone, Interactiveness, Consolability, Look, Speech)
- **B** Work of Breathing
- **C** Circulation (skin colour)

### Категории состояний
| Pattern | Состояние |
|---|---|
| A abnormal only | CNS / metabolic |
| B abnormal | Respiratory distress/failure |
| C abnormal | Shock (comp / hypotensive) |
| A+B+C abnormal | Cardiopulmonary failure → arrest |

### Компенсированный vs декомпенсированный шок
- Дети компенсируют шок долго через тахикардию
- Гипотензия = поздний предарестный признак
- SBP пороги: 1 мес-1 г <70; 1-10 лет <70 + 2×возраст; >10 лет <90

### Источники
AHA. PEARS Provider Manual 2018 (2023 update).
`,
};

export default runner;

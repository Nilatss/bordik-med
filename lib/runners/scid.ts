// @ts-nocheck
/** Runner: scid — Structured Clinical Interview for DSM-5 (SCID-5) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (APA DSM-5) / Международный',
  reference:
    'First MB, Williams JBW, Karg RS, Spitzer RL. Structured Clinical Interview for DSM-5 Disorders — Clinician Version (SCID-5-CV). Arlington: American Psychiatric Association Publishing; 2016.',
  inputs: [
    {
      id: 'module',
      label: 'Модуль SCID-5-CV',
      type: 'select',
      options: [
        { value: 'A', label: 'A — Эпизоды расстройств настроения', points: 0 },
        { value: 'B', label: 'B — Психотические и ассоциированные симптомы', points: 0 },
        { value: 'C', label: 'C — Дифференциал психотических расстройств', points: 0 },
        { value: 'D', label: 'D — Дифференциал расстройств настроения', points: 0 },
        { value: 'E', label: 'E — Расстройства, связанные с употреблением ПАВ', points: 0 },
        { value: 'F', label: 'F — Тревожные расстройства', points: 0 },
        { value: 'G', label: 'G — ОКР и связанные расстройства', points: 0 },
        { value: 'H', label: 'H — Расстройства, связанные со стрессом (ПТСР, РАС)', points: 0 },
        { value: 'I', label: 'I — Расстройства пищевого поведения', points: 0 },
        { value: 'J', label: 'J — Соматические симптомы, внешний скрининг', points: 0 },
      ],
    },
    {
      id: 'duration',
      label: 'Длительность ключевых симптомов (недели)',
      type: 'number',
      min: 0,
      max: 520,
      step: 1,
      quickValues: [2, 4, 12, 26, 52],
      hint: 'DSM-5 требует минимальной длительности: депрессия ≥2 нед, ПТСР ≥1 мес, ГТР ≥6 мес, шизофрения ≥6 мес.',
    },
    {
      id: 'criteriaMet',
      label: 'Все критерии DSM-5 для предварительного диагноза выполнены (A-E)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'functionalImpairment',
      label: 'Клинически значимый дистресс / функциональное нарушение (Crit. ≥1)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Модуль A — депрессия 3 нед', values: { module: 'A', duration: 3, criteriaMet: true, functionalImpairment: true } },
    { label: 'Модуль F — ГТР 8 мес', values: { module: 'F', duration: 32, criteriaMet: true, functionalImpairment: true } },
    { label: 'Модуль B — психоз 2 нед (неполн.)', values: { module: 'B', duration: 2, criteriaMet: false, functionalImpairment: true } },
  ],
  compute: (v) => {
    const module = String(v.module || 'A');
    const duration = Math.max(0, Math.min(520, Number(v.duration) || 0));
    const met = v.criteriaMet === true;
    const impair = v.functionalImpairment === true;

    const moduleMap: Record<string, { name: string; dx: string[]; minDur: number; durUnit: string }> = {
      A: { name: 'Эпизоды настроения', dx: ['MDE (большой депрессивный)', 'Манический эпизод', 'Гипоманический эпизод', 'Смешанные признаки'], minDur: 2, durUnit: 'нед' },
      B: { name: 'Психотические симптомы', dx: ['Галлюцинации', 'Бред', 'Дезорганизация речи', 'Кататония'], minDur: 1, durUnit: 'дн' },
      C: { name: 'Диф. психотических', dx: ['Шизофрения (≥6 мес)', 'Шизоаффективное', 'Шизофрениформное (1-6 мес)', 'Кратковременное психотическое (<1 мес)', 'Бредовое расстройство'], minDur: 4, durUnit: 'нед' },
      D: { name: 'Диф. настроения', dx: ['Большое депрессивное', 'Персистентное депрессивное (≥2 г)', 'Биполярное I/II', 'Циклотимия (≥2 г)'], minDur: 2, durUnit: 'нед' },
      E: { name: 'ПАВ', dx: ['Alcohol Use Disorder', 'Opioid UD', 'Stimulant UD', 'Cannabis UD', 'Tobacco UD'], minDur: 52, durUnit: 'нед (12 мес)' },
      F: { name: 'Тревожные', dx: ['Паническое', 'Агорафобия', 'Социальное тревожное', 'Специфические фобии', 'ГТР (≥6 мес)'], minDur: 26, durUnit: 'нед' },
      G: { name: 'ОКР-спектр', dx: ['ОКР', 'Дисморфофобия (BDD)', 'Накопительство', 'Трихотилломания', 'Экскориация'], minDur: 0, durUnit: '—' },
      H: { name: 'Стресс-связанные', dx: ['ПТСР (≥1 мес)', 'Острое стрессовое (3дн-1мес)', 'Расстройство адаптации', 'Реактивное привязанности'], minDur: 4, durUnit: 'нед' },
      I: { name: 'Пищевые', dx: ['Нервная анорексия', 'Нервная булимия', 'Binge-eating disorder', 'ARFID'], minDur: 12, durUnit: 'нед (3 мес для BED)' },
      J: { name: 'Соматические', dx: ['Соматических симптомов', 'Тревога за здоровье', 'Конверсионное', 'Искусственное'], minDur: 26, durUnit: 'нед' },
    };
    const info = moduleMap[module] || moduleMap.A;

    let color = '#64748B';
    let label = 'Скрининг положительный, диагноз не подтверждён';
    let details = `Модуль ${module} (${info.name}): критерии не полностью выполнены — пройти полное интервью, рассмотреть "Other specified"/"Unspecified" категории DSM-5.`;
    const actions: string[] = [];

    if (met && impair) {
      color = '#991B1B';
      label = `Критерии ${info.name} выполнены`;
      details = `Все критерии DSM-5 (A-E) для модуля ${module} выполнены. Диагноз может быть установлен. Длительность: ${duration} нед (мин: ${info.minDur} ${info.durUnit}).`;
      actions.push(
        'Завершить все остальные модули SCID для исключения коморбидности',
        'Оценить риск суицида (C-SSRS), риск насилия (HCR-20 при необходимости)',
        'Составить биопсихосоциальный план лечения',
        'Кодировать по DSM-5-TR + ICD-11/10',
      );
    } else if (met && !impair) {
      color = '#F59E0B';
      label = 'Симптомы есть, но нет дистресса/нарушения';
      details = 'Симптоматические критерии выполнены, но отсутствует клинически значимое страдание или функциональное нарушение (DSM-5 Criterion F/G) — диагноз НЕ ставится.';
      actions.push('Наблюдение, психообразование', 'Повторная оценка через 3-6 мес');
    } else if (duration < info.minDur && info.minDur > 0) {
      color = '#F59E0B';
      label = 'Длительность недостаточна';
      details = `Симптомы длятся ${duration} нед, но DSM-5 требует минимум ${info.minDur} ${info.durUnit} для данного модуля. Рассмотреть "provisional" диагноз или "Other specified".`;
      actions.push('Продолжить мониторинг', 'Повторная оценка при достижении минимальной длительности');
    } else {
      actions.push('Перейти к другим модулям SCID', 'Рассмотреть альтернативные причины симптомов (медицинские, ПАВ)');
    }

    actions.push(`Дифференциальный ряд модуля ${module}: ${info.dx.join('; ')}`);

    return {
      value: module,
      unit: `модуль (${duration} нед)`,
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'SCID-5 — полуструктурированное интервью, требует обучения и супервизии',
        'SCID-5-CV (Clinician Version) — для клинической практики',
        'SCID-5-RV (Research Version) — расширенная, для исследований',
        'SCID-5-PD — для расстройств личности (отдельный инструмент)',
        'Не валидизирован для детей до 6 лет (для детей — K-SADS, DISC)',
        'Занимает 45-90 мин (CV) / 2-3 ч (RV)',
        'Не заменяет клиническое суждение — только стандартизует его',
      ],
      related: [
        { id: 'dsm-icd', title: 'DSM-5-TR vs ICD-11' },
        { id: 'mmpi', title: 'MMPI-2' },
        { id: 'c-ssrs', title: 'C-SSRS' },
      ],
      relatedCourses: [{ id: '306.1', title: 'Психиатрия — диагностика' }],
    };
  },
  info: `### Для чего используется
**SCID-5 (First et al., 2016)** — золотой стандарт полуструктурированного клинического интервью для диагностики психических расстройств по **DSM-5**. Используется клиницистами и в исследованиях.

### Версии
| Версия | Назначение | Длительность |
|---|---|---|
| **SCID-5-CV** | Клиническая (clinician) | 45-90 мин |
| **SCID-5-RV** | Research (расширенная) | 2-3 ч |
| **SCID-5-PD** | Расстройства личности (DSM-5 Sec III) | 60-90 мин |
| **SCID-5-AMPD** | Alternative Model for Personality | — |

### Модули SCID-5-CV
| Модуль | Категория | DSM-5 миним. длительность |
|---|---|---|
| **A** | Эпизоды настроения | MDE ≥2 нед, мания ≥1 нед |
| **B** | Психотические симптомы | — (любая) |
| **C** | Диф. психотических расстройств | Шизофрения ≥6 мес |
| **D** | Диф. расстройств настроения | Персист. депр. ≥2 года |
| **E** | Расстройства от ПАВ | Паттерн в течение 12 мес |
| **F** | Тревожные | ГТР ≥6 мес |
| **G** | ОКР и связанные | — |
| **H** | Стресс-ассоциированные | ПТСР ≥1 мес |
| **I** | Пищевые | BED ≥3 мес |
| **J** | Соматические симптомы | ≥6 мес |

### Алгоритм
1. Скрининг (Overview)
2. Модульный опрос (A→J)
3. Оценка каждого критерия: **? = нет данных, 1 = отсутствует, 2 = подпороговое, 3 = есть**
4. Ранжирование диагнозов (current/past/lifetime)
5. Финальная формулировка: **DSM-5-TR код + ICD-11/10**

### Общие критерии DSM-5 для диагноза
- **Criterion A-E**: симптоматические критерии
- **Criterion F/G**: клинически значимый **дистресс** ИЛИ **функциональное нарушение**
- **Exclusion**: не объясняется медицинским состоянием / ПАВ / другим расстройством

### Ограничения
- Требует обучения (APA sponsored training) и супервизии
- Долгое интервью — неудобно в экстренной психиатрии
- Зависит от valid self-report пациента
- Культурная валидация ограничена`,
};

export default runner;

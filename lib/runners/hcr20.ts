// @ts-nocheck
/** Runner: hcr20 — Historical Clinical Risk Management-20 (HCR-20 V3) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (судебная психиатрия)',
  reference:
    'Douglas KS, Hart SD, Webster CD, Belfrage H. HCR-20V3: Assessing Risk for Violence — User Guide. Burnaby: Mental Health, Law, and Policy Institute, Simon Fraser University; 2013.',
  inputs: [
    {
      id: 'historical',
      label: 'Historical (H1-H10): история прошлого насилия, возраст 1-го эпизода, нестабильность отношений, проблемы с работой, ПАВ, психические расстройства, расстройство личности, травма в детстве, расстройство поведения, неуспех супервизии (сумма 0-20)',
      type: 'number',
      min: 0,
      max: 20,
      step: 1,
      quickValues: [2, 6, 10, 14, 18],
      hint: '10 пунктов × 0-2 балла (0 = нет, 1 = частично, 2 = присутствует).',
    },
    {
      id: 'clinical',
      label: 'Clinical (C1-C5): инсайт, насильственные идеи, симптомы психоза/мании, нестабильность, ответ на лечение (сумма 0-10)',
      type: 'number',
      min: 0,
      max: 10,
      step: 1,
      quickValues: [1, 3, 5, 7, 9],
      hint: '5 пунктов × 0-2 балла.',
    },
    {
      id: 'riskmgmt',
      label: 'Risk Management (R1-R5): проблемы с сервисами, условиями жизни, персональной поддержкой, соблюдением лечения, стрессом/копингом (сумма 0-10)',
      type: 'number',
      min: 0,
      max: 10,
      step: 1,
      quickValues: [1, 3, 5, 7, 9],
      hint: '5 пунктов × 0-2 балла (оценка будущих контекстов).',
    },
    {
      id: 'clinicalJudgement',
      label: 'Итоговая клиническая оценка (SPJ — Structured Professional Judgement)',
      type: 'select',
      options: [
        { value: 'low', label: 'Low — низкий риск (рутинное наблюдение)', points: 0 },
        { value: 'moderate', label: 'Moderate — умеренный (активное управление)', points: 0 },
        { value: 'high', label: 'High — высокий (интенсивное вмешательство)', points: 0 },
      ],
      hint: 'HCR-20 V3 НЕ использует сумму баллов как диагноз — финальное суждение клиническое.',
    },
  ],
  presets: [
    { label: 'Низкий риск', values: { historical: 4, clinical: 1, riskmgmt: 2, clinicalJudgement: 'low' } },
    { label: 'Умеренный', values: { historical: 10, clinical: 4, riskmgmt: 5, clinicalJudgement: 'moderate' } },
    { label: 'Высокий', values: { historical: 16, clinical: 8, riskmgmt: 8, clinicalJudgement: 'high' } },
  ],
  compute: (v) => {
    const h = Math.max(0, Math.min(20, Number(v.historical) || 0));
    const c = Math.max(0, Math.min(10, Number(v.clinical) || 0));
    const r = Math.max(0, Math.min(10, Number(v.riskmgmt) || 0));
    const total = h + c + r;
    const judge = String(v.clinicalJudgement || 'low');

    let color = '#22C55E';
    let label = 'Низкий риск насилия';
    let details = `HCR-20 V3: H=${h}/20, C=${c}/10, R=${r}/10, сумма ${total}/40. Клиническое решение: LOW.`;
    const actions: string[] = [];

    if (judge === 'high') {
      color = '#991B1B';
      label = 'Высокий риск насилия';
      details = `HCR-20 V3: H=${h}/20, C=${c}/10, R=${r}/10, сумма ${total}/40. Клиническое решение: HIGH.`;
      actions.push(
        'Интенсивное управление рисками: supervised setting, restrictions',
        'Обязательное психиатрическое лечение (депо-антипсихотики при психозе)',
        'Лечение ПАВ — критично (фактор H5)',
        'Когнитивно-поведенческая программа снижения насилия',
        'Частый re-assessment (≤1-3 мес), координация с юстицией/пробацией',
        'Документировать warning duties (Tarasoff в США, equivalent локально)',
      );
    } else if (judge === 'moderate') {
      color = '#F59E0B';
      label = 'Умеренный риск насилия';
      details = `HCR-20 V3: H=${h}/20, C=${c}/10, R=${r}/10, сумма ${total}/40. Клиническое решение: MODERATE.`;
      actions.push(
        'Активное управление рисками, структурированный план',
        'Регулярное лечение основных расстройств (психоз, депрессия, ПАВ)',
        'Социальная поддержка, стабильное жильё',
        'Re-assessment каждые 3-6 мес',
      );
    } else {
      actions.push(
        'Рутинное наблюдение и стандартное психиатрическое ведение',
        'Re-assessment при изменении клинической картины или жизненных обстоятельств',
      );
    }

    if (h >= 14) {
      actions.push('Исторические факторы высокие — учитывать как stable baseline risk');
    }
    if (c >= 6) {
      actions.push('Клинические факторы ↑ — острая стабилизация (антипсихотики, госпитализация при необходимости)');
    }
    if (r >= 6) {
      actions.push('Risk management факторы ↑ — оптимизация выписки, структурированный follow-up');
    }

    return {
      value: String(total),
      unit: 'суммарных баллов (0-40)',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'HCR-20 V3 — Structured Professional Judgement (SPJ), НЕ актуарный инструмент',
        'Суммарный балл — справочный; финальное решение всегда клиническое (low/moderate/high)',
        'Requires formal training (Protect HCR-20 certification)',
        'Валидизирован для взрослых ≥18 лет с историей насилия или психического расстройства',
        'Для несовершеннолетних — SAVRY (Structured Assessment of Violence Risk in Youth)',
        'Для сексуального насилия — Static-99R, SVR-20',
        'Re-assessment обязательный; риск — динамическая характеристика',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: '0-10 низк.', color: '#22C55E' },
          { min: 11, max: 25, label: '11-25 умер.', color: '#F59E0B' },
          { min: 26, max: 40, label: '26-40 высок.', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'c-ssrs', title: 'C-SSRS' },
        { id: 'scid', title: 'SCID-5' },
      ],
      relatedCourses: [{ id: '306.7', title: 'Судебная психиатрия' }],
    };
  },
  info: `### Для чего используется
**HCR-20 V3 (Douglas et al., 2013)** — ведущий в мире инструмент оценки риска **насилия** (violence risk assessment). Используется в судебной психиатрии, психиатрических стационарах, тюрьмах, пробации. Основан на **Structured Professional Judgement (SPJ)** подходе.

### Структура (20 факторов)
| Домен | Факторы | Макс. балл |
|---|---|---|
| **H — Historical (10)** | H1 Насилие, H2 Другие антисоц. акты, H3 Отношения, H4 Работа/обучение, H5 ПАВ, H6 Психич. расстр., H7 Личность, H8 Травматизация, H9 Насильственные установки, H10 Неуспех суперв. | 0-20 |
| **C — Clinical (5)** | C1 Инсайт, C2 Насильственные идеи/намерения, C3 Симптомы, C4 Нестабильность, C5 Ответ на лечение | 0-10 |
| **R — Risk Mgmt (5)** | R1 Проф. сервисы, R2 Жилищн. условия, R3 Личная поддержка, R4 Лечение/надзор, R5 Стресс/копинг | 0-10 |

Каждый фактор: **0 = отсутствует, 1 = частично/возможно, 2 = присутствует**. Максимум 40.

### Ключевой принцип SPJ
- HCR-20 НЕ актуарный — сумма баллов НЕ используется как отсечка
- Клиницист интегрирует факторы в контекст → **финальная оценка low/moderate/high**
- Также оцениваются: **серьёзность**, **частота**, **immediacy**, **likely victims**, **scenarios**

### Уровни риска и управление
| Уровень | Вмешательство |
|---|---|
| **Low** | Рутинное наблюдение, стандартное лечение |
| **Moderate** | Активное управление, структурированный план, 3-6 мес re-assessment |
| **High** | Интенсивное ведение, ограниченная среда, ≤3 мес re-assessment |

### Использование
- **Судебная психиатрия** (решения суда, условия заключения)
- **Психиатрические стационары** (решение о выписке, принудит. лечение)
- **Пробация** (условия освобождения)
- **Community mental health** (ведение пациентов с историей насилия)

### Ограничения
- Требует **обучения** (Protect HCR-20 workshop)
- НЕ для сексуального насилия (используйте Static-99R, SVR-20)
- НЕ для несовершеннолетних (используйте SAVRY)
- НЕ для бытового партнёрского насилия (SARA, B-SAFER)
- Межрэйтерская надёжность зависит от квалификации

### Связанные инструменты
- **VRAG-R** (Violence Risk Appraisal Guide) — актуарный
- **LSI-R** (Level of Service Inventory) — для общего offender risk
- **Static-99R** — сексуальное насилие
- **SAVRY** — насилие подростков`,
};

export default runner;

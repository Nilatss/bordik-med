// @ts-nocheck
/** Runner: pcne - Pharmaceutical Care Network Europe DRP Classification v9.1 */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'problem',
      label: 'Категория проблемы (P)',
      type: 'select',
      options: [
        { value: 'P1', label: 'P1 — Эффективность лечения' },
        { value: 'P2', label: 'P2 — Безопасность (ADR)' },
        { value: 'P3', label: 'P3 — Прочее (стоимость, приверженность)' },
      ],
    },
    {
      id: 'cause',
      label: 'Причина (C)',
      type: 'select',
      options: [
        { value: 'C1', label: 'C1 — Выбор препарата' },
        { value: 'C2', label: 'C2 — Лекарственная форма' },
        { value: 'C3', label: 'C3 — Дозовый режим' },
        { value: 'C4', label: 'C4 — Длительность терапии' },
        { value: 'C5', label: 'C5 — Diспенсация' },
        { value: 'C6', label: 'C6 — Процесс использования' },
        { value: 'C7', label: 'C7 — Связанные с пациентом' },
        { value: 'C8', label: 'C8 — Перенос информации' },
        { value: 'C9', label: 'C9 — Прочее' },
      ],
    },
    {
      id: 'intervention',
      label: 'Вмешательство (I)',
      type: 'select',
      options: [
        { value: 'I0', label: 'I0 — Нет вмешательства' },
        { value: 'I1', label: 'I1 — На уровне назначающего врача' },
        { value: 'I2', label: 'I2 — На уровне пациента' },
        { value: 'I3', label: 'I3 — На уровне препарата' },
        { value: 'I4', label: 'I4 — Прочее' },
      ],
    },
    {
      id: 'acceptance',
      label: 'Принятие вмешательства (A)',
      type: 'select',
      options: [
        { value: 'A1', label: 'A1 — Принято (полностью реализовано)' },
        { value: 'A2', label: 'A2 — Принято частично' },
        { value: 'A3', label: 'A3 — Не принято' },
        { value: 'A4', label: 'A4 — Неизвестно' },
      ],
    },
    {
      id: 'status',
      label: 'Статус проблемы (O)',
      type: 'select',
      options: [
        { value: 'O0', label: 'O0 — Статус неизвестен' },
        { value: 'O1', label: 'O1 — Проблема решена' },
        { value: 'O2', label: 'O2 — Частично решена' },
        { value: 'O3', label: 'O3 — Не решена' },
      ],
    },
  ],
  compute: (v) => {
    const p = String(v.problem || 'P1');
    const c = String(v.cause || 'C1');
    const i = String(v.intervention || 'I0');
    const a = String(v.acceptance || 'A4');
    const o = String(v.status || 'O0');

    const problemText: Record<string, string> = {
      P1: 'Эффективность терапии недостаточна',
      P2: 'Нежелательная реакция (ADR) или риск безопасности',
      P3: 'Прочее (стоимость, приверженность, удобство)',
    };
    const causeText: Record<string, string> = {
      C1: 'Неоптимальный выбор препарата / дублирование / отсутствие показания',
      C2: 'Неподходящая лекарственная форма',
      C3: 'Недо- или передозировка, интервал',
      C4: 'Слишком короткая/долгая терапия',
      C5: 'Ошибка диспенсации',
      C6: 'Неправильный приём пациентом',
      C7: 'Связанная с пациентом (приверженность, отказ)',
      C8: 'Передача информации между уровнями помощи',
      C9: 'Прочее',
    };

    let color = '#22C55E', band = 'Проблема решена';
    if (o === 'O3') { color = '#EF4444'; band = 'Проблема не решена'; }
    else if (o === 'O2') { color = '#F59E0B'; band = 'Частично решена'; }
    else if (o === 'O0') { color = '#6B7280'; band = 'Статус неизвестен'; }

    const unresolved = o === 'O3' || a === 'A3';

    return {
      value: `${p} / ${c} / ${i} / ${a} / ${o}`,
      unit: 'PCNE v9.1',
      interpretation: band,
      color,
      details: `Проблема: ${problemText[p]}\n\nПричина: ${causeText[c]}\n\nВмешательство: ${i}; Принятие: ${a}; Статус: ${o}.`,
      actions: [
        'Документировать DRP в структурированной форме (PCNE v9.1) в ЭМК',
        p === 'P2' ? 'Оценить причинность по шкале Naranjo; при необходимости — репорт в фармаконадзор' : '',
        c === 'C1' ? 'Пересмотреть назначение: есть ли показание? есть ли более безопасная альтернатива?' : '',
        c === 'C3' ? 'Пересчитать дозу по СКФ / возрасту / весу; проверить взаимодействия' : '',
        c === 'C7' ? 'Провести обучение пациента; обсудить барьеры приверженности' : '',
        unresolved ? 'Повторный обзор через 2-4 недели; эскалация к ответственному врачу' : 'Мониторить отдалённый эффект',
        'Использовать SBAR для коммуникации с назначающим врачом',
      ].filter(Boolean),
      caveats: [
        'PCNE — классификация, не шкала: не суммирует баллы',
        'Версия 9.1 (2020) используется клиническими фармацевтами в ЕС',
        'Комбинировать с MAI (имплицитная оценка) и Beers/STOPP (эксплицитная)',
        'Для репортинга ADR — отдельная система (CIOMS, MedWatch, Росздравнадзор)',
        'Результат зависит от навыка фармацевта — межэкспертная κ 0.5-0.7',
      ],
      related: [
        { id: 'mai', title: 'MAI' },
        { id: 'naranjo', title: 'Naranjo' },
        { id: 'stopp-start', title: 'STOPP/START' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '308.1', title: 'Клиническая фармакология' },
      ],
    };
  },
  reference: 'Pharmaceutical Care Network Europe. Classification for Drug related problems V9.1. PCNE Foundation, 2020. https://www.pcne.org',
  countries: 'Европа (PCNE)',
  presets: [
    { label: 'Недостаточная доза', values: { problem: 'P1', cause: 'C3', intervention: 'I1', acceptance: 'A1', status: 'O1' } },
    { label: 'ADR — решена отменой', values: { problem: 'P2', cause: 'C1', intervention: 'I1', acceptance: 'A1', status: 'O1' } },
    { label: 'Неприверженность', values: { problem: 'P1', cause: 'C7', intervention: 'I2', acceptance: 'A2', status: 'O2' } },
  ],
  info: `### Для чего используется
**PCNE DRP Classification v9.1** — европейская стандартизированная классификация **лекарственных проблем (Drug-Related Problems, DRP)** для работы клинического фармацевта.

### Структура (5 доменов)
| Домен | Значение |
|---|---|
| **P** | Problem (проблема) — 3 категории |
| **C** | Cause (причина) — 9 категорий |
| **I** | Intervention (вмешательство) — 5 категорий |
| **A** | Acceptance (принятие) — 4 категории |
| **O** | Outcome (статус) — 4 категории |

### Домены
**P (проблема):**
- P1 Эффективность
- P2 Безопасность (ADR)
- P3 Прочее

**C (причина):**
- C1 Выбор препарата
- C2 Лекарственная форма
- C3 Доза
- C4 Длительность
- C5 Диспенсация
- C6 Процесс приёма
- C7 Пациент
- C8 Передача инфо
- C9 Прочее

### Применение
- Структурированный обзор лекарств (SMR)
- Medication reconciliation при переходах помощи
- Отчётность клинического фармацевта
- Аудит качества фармакотерапии

### Комбинация с другими инструментами
- **MAI** — оценка уместности одного препарата
- **Beers/STOPP-START** — эксплицитные критерии
- **Naranjo** — причинность ADR

### Источник
PCNE Foundation. Classification for DRP v9.1, 2020.`,
};

export default runner;

/** Runner: icd10cm — ICD-10-CM (Clinical Modification, USA) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (CDC/NCHS + CMS)',
  reference: 'Centers for Disease Control and Prevention (NCHS). ICD-10-CM Official Guidelines for Coding and Reporting, FY2025. CMS.',
  inputs: [
    {
      id: 'condition',
      label: 'Категория состояния',
      type: 'select',
      options: [
        { value: 'fracture', label: 'Перелом (пример 7-го символа)' },
        { value: 'dm', label: 'Сахарный диабет (E08–E13)' },
        { value: 'mi', label: 'Острый ИМ (I21)' },
        { value: 'preg', label: 'Беременность / триместр (O)' },
        { value: 'injury-ext', label: 'Травма + внешняя причина (V–Y)' },
        { value: 'neoplasm', label: 'Новообразование (C/D)' },
      ],
    },
  ],
  presets: [
    { label: 'Перелом (7-й символ)', values: { condition: 'fracture' } },
    { label: 'СД с осложнениями', values: { condition: 'dm' } },
    { label: 'ОИМ', values: { condition: 'mi' } },
  ],
  compute: (v) => {
    const c = String(v.condition || 'fracture');
    const map: Record<string, { code: string; expanded: string; note: string }> = {
      fracture: {
        code: 'S72.001A',
        expanded: 'S72 — перелом бедра; .001 — перелом головки бедра неуточ. стороны, закрытый; **7-й символ A** — первичное обращение',
        note: '7-й символ: A initial encounter, D subsequent, G delayed healing, K nonunion, P malunion, S sequela',
      },
      dm: {
        code: 'E11.21 / E11.65 / E11.9',
        expanded: 'E11 — СД 2 типа; .21 с диабетич. нефропатией; .65 с гипергликемией; .9 без осложнений',
        note: 'Combination codes: Ш11.22 — СД2 с ХБП → дополнительно N18.1-6 для стадии ХБП',
      },
      mi: {
        code: 'I21.02 / I21.A1',
        expanded: 'I21.02 — STEMI передней стенки ЛЖ; I21.A1 — тип 2 ИМ (добавлен в FY2018); I22.* — recurrent MI ≤28 дней',
        note: 'Длительность "ОИМ" в ICD-10-CM — 4 недели (отличие от ICD-10 WHO, где 28 дней тоже)',
      },
      preg: {
        code: 'O26.891 / Z3A.32',
        expanded: 'O26.891 — другие осложнения беременности, 1-й триместр; Z3A.32 — недель беременности 32',
        note: 'Обязательно указывать триместр (5-й символ: 1/2/3/9) + Z3A-код на недели',
      },
      'injury-ext': {
        code: 'S06.0X0A + V43.52XA + Y92.411',
        expanded: 'S06.0X0A — сотрясение без потери сознания, первичн.; V43.52XA — водитель легк. авто столкнулся с авто, первичн.; Y92.411 — на межштатной автомагистрали',
        note: 'Внешняя причина (V-Y) + место происшествия (Y92) + активность (Y93) + статус (Y99) — обязательно при травмах',
      },
      neoplasm: {
        code: 'C50.911 + Z17.0',
        expanded: 'C50.911 — ЗНО молочной железы, правой, женской, неуточ. локализации; Z17.0 — ER-позитивный статус',
        note: 'Neoplasm Table в Alphabetic Index: primary / secondary / CIS / benign / uncertain / unspecified',
      },
    };
    const e = map[c]!;
    return {
      value: e.code,
      unit: 'ICD-10-CM',
      color: '#6B7280',
      interpretation: `ICD-10-CM пример: ${e.code}`,
      details: `Код: ${e.code}\nРазбор: ${e.expanded}\n\nПримечание: ${e.note}\n\nICD-10-CM используется в США с 01.10.2015. ~73,000 кодов (vs ~14,000 в WHO ICD-10), обновление ежегодно 1 октября (FY — fiscal year).`,
      actions: [
        'CMS ICD-10-CM Browser: https://www.cms.gov/medicare/coding-billing/icd-10-codes',
        'ICD10Data.com — бесплатный поиск кодов с guidelines',
        'Проверить "Excludes1" и "Excludes2" notes — они критичны для правильности',
        'Для процедур использовать ICD-10-PCS (стационар) или CPT (амбулатория)',
        'Guidelines FY2025 — обновляются ежегодно NCHS + CMS',
      ],
      caveats: [
        'ICD-10-CM ≠ WHO ICD-10 — больше детализации, 7-й символ, laterality',
        'Обязательна для биллинга Medicare / Medicaid / частных страховых в США (HIPAA)',
        'Не применяется в РФ — используется WHO ICD-10 / МКБ-10',
        '"Code also", "Use additional code" — mandatory instructional notes',
        'Placeholder "X" для 7-го символа при коде <6 символов (S62.001A: позиция 6 = X)',
        'FY2025 — 74,260 кодов',
      ],
      related: [
        { id: 'icd10', title: 'WHO ICD-10' },
        { id: 'icd10-pcs', title: 'ICD-10-PCS (процедуры)' },
        { id: 'snomed', title: 'SNOMED CT' },
        { id: 'icd11', title: 'ICD-11' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**ICD-10-CM** (Clinical Modification) — американская клиническая адаптация ICD-10, разработана NCHS (CDC) для использования в системе здравоохранения США. Обязательна для:
- Медицинского биллинга (Medicare, Medicaid, частные страховщики)
- HIPAA-complaint клинического документирования
- Статистики заболеваемости в США

### Структура 7-символьного кода
\`\`\`
S 7 2 . 0 0 1 A
│ │─│   │─│─│ │
│ cat    subcat 7th character
chapter
\`\`\`

### Ключевые особенности vs WHO ICD-10
| Аспект | ICD-10 (WHO) | ICD-10-CM (США) |
|---|---|---|
| Кол-во кодов | ~14,000 | ~74,000 |
| Символов | до 5 | до 7 |
| Laterality | нет | да (right/left/bilateral) |
| Combination codes | мало | много (E11.21 = СД2 + нефропатия) |
| Placeholder X | нет | есть |
| 7-й символ | нет | A/D/S для травм |`,
};
export default runner;

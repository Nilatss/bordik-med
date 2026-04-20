// @ts-nocheck
/** Runner: fdi — FDI World Dental Federation tooth numbering */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (FDI World Dental Federation) · ISO 3950',
  reference: 'FDI World Dental Federation. Two-digit system of designating teeth. International Dental Federation; 1970 (ISO 3950:2016).',
  inputs: [
    {
      id: 'quadrant',
      label: 'Квадрант (постоянный прикус)',
      type: 'select',
      options: [
        { value: '1', label: '1 — Верхняя правая (11-18)' },
        { value: '2', label: '2 — Верхняя левая (21-28)' },
        { value: '3', label: '3 — Нижняя левая (31-38)' },
        { value: '4', label: '4 — Нижняя правая (41-48)' },
        { value: '5', label: '5 — Верхняя правая (молочный, 51-55)' },
        { value: '6', label: '6 — Верхняя левая (молочный, 61-65)' },
        { value: '7', label: '7 — Нижняя левая (молочный, 71-75)' },
        { value: '8', label: '8 — Нижняя правая (молочный, 81-85)' },
      ],
    },
    {
      id: 'tooth',
      label: 'Номер зуба (1-8 постоянные, 1-5 молочные)',
      type: 'select',
      options: [
        { value: '1', label: '1 — центральный резец' },
        { value: '2', label: '2 — боковой резец' },
        { value: '3', label: '3 — клык' },
        { value: '4', label: '4 — 1-й премоляр (постоянные)' },
        { value: '5', label: '5 — 2-й премоляр (постоянные) / 2-й моляр (молочные)' },
        { value: '6', label: '6 — 1-й моляр (постоянные)' },
        { value: '7', label: '7 — 2-й моляр (постоянные)' },
        { value: '8', label: '8 — 3-й моляр / зуб мудрости (постоянные)' },
      ],
    },
  ],
  presets: [
    { label: 'Верхний правый 1-й моляр (16)', values: { quadrant: '1', tooth: '6' } },
    { label: 'Нижний левый клык (33)', values: { quadrant: '3', tooth: '3' } },
    { label: 'Молочный центр. резец ВП (51)', values: { quadrant: '5', tooth: '1' } },
  ],
  compute: (v) => {
    const q = String(v.quadrant || '1');
    const t = String(v.tooth || '6');
    const fdi = `${q}${t}`;

    // Universal Numbering System (USA): permanent 1-32 (upper right 3rd molar = 1, clockwise), primary A-T
    const toothNames: Record<string, string> = {
      '1': 'центральный резец', '2': 'боковой резец', '3': 'клык', '4': '1-й премоляр',
      '5': '2-й премоляр', '6': '1-й моляр', '7': '2-й моляр', '8': '3-й моляр (зуб мудрости)',
    };
    const primaryNames: Record<string, string> = {
      '1': 'центральный резец', '2': 'боковой резец', '3': 'клык', '4': '1-й моляр', '5': '2-й моляр',
    };
    const isPrimary = ['5','6','7','8'].includes(q);
    const name = isPrimary ? (primaryNames[t] || '—') : (toothNames[t] || '—');

    const quadrantName: Record<string, string> = {
      '1': 'верхний правый (постоянный)', '2': 'верхний левый (постоянный)',
      '3': 'нижний левый (постоянный)', '4': 'нижний правый (постоянный)',
      '5': 'верхний правый (молочный)', '6': 'верхний левый (молочный)',
      '7': 'нижний левый (молочный)', '8': 'нижний правый (молочный)',
    };

    // Universal (US) numbering: 1-32 permanent clockwise from upper right 3rd molar
    const universalMap: Record<string, Record<string, string>> = {
      '1': { '8':'1','7':'2','6':'3','5':'4','4':'5','3':'6','2':'7','1':'8' },
      '2': { '1':'9','2':'10','3':'11','4':'12','5':'13','6':'14','7':'15','8':'16' },
      '3': { '8':'17','7':'18','6':'19','5':'20','4':'21','3':'22','2':'23','1':'24' },
      '4': { '1':'25','2':'26','3':'27','4':'28','5':'29','6':'30','7':'31','8':'32' },
      '5': { '5':'A','4':'B','3':'C','2':'D','1':'E' },
      '6': { '1':'F','2':'G','3':'H','4':'I','5':'J' },
      '7': { '5':'K','4':'L','3':'M','2':'N','1':'O' },
      '8': { '1':'P','2':'Q','3':'R','4':'S','5':'T' },
    };
    const universal = (universalMap[q] && universalMap[q][t]) || '—';

    // Palmer notation: quadrant symbol + tooth number (1-8 permanent, A-E primary)
    const palmerSym: Record<string, string> = {
      '1': '⏌', '2': '⌐', '3': '⌐', '4': '⏌', '5': '⏌', '6': '⌐', '7': '⌐', '8': '⏌',
    };
    const palmerNum = isPrimary ? ({ '1':'A','2':'B','3':'C','4':'D','5':'E' } as Record<string, string>)[t] : t;
    const palmer = `${palmerSym[q]}${palmerNum}`;

    return {
      value: fdi,
      unit: 'FDI',
      color: '#6B7280',
      interpretation: `FDI ${fdi} — ${name} (${quadrantName[q]})`,
      details: `**FDI (ISO 3950):** ${fdi}\n**Название:** ${name}\n**Квадрант:** ${quadrantName[q]}\n\n**Альтернативные нумерации:**\n- **Universal (США, ADA):** ${universal}\n- **Palmer notation (UK):** ${palmer}\n\nFDI — **two-digit notation**: 1-я цифра = квадрант (1-4 постоянные, 5-8 молочные), 2-я цифра = позиция зуба от центра (1 резец → 8 третий моляр).`,
      actions: [
        'FDI World Dental Federation: https://www.fdiworlddental.org/',
        'ISO 3950:2016 — официальный стандарт',
        'Использовать FDI в международных публикациях / ВОЗ / GBD oral health',
        'В РФ — традиционно схема Зигмонди-Палмера, но FDI принят как основной',
        'В США — чаще Universal Numbering (ADA) 1-32 / A-T',
      ],
      caveats: [
        'Не путать FDI с Universal (US, ADA) numbering — разные системы!',
        'Quadrants нумеруются с точки зрения стоматолога, смотрящего на пациента (правый пациента = его right)',
        'Молочные зубы: квадранты 5-8 (FDI), A-T (Universal), A-E + ⏌/⌐ (Palmer)',
        'Третий моляр (8) может отсутствовать — норма',
        'В электронных картах РФ часто FDI + ISO, но встречается и Зигмонди',
        'Supernumerary teeth — отдельные коды (напр. mesiodens не имеет стандартного FDI)',
      ],
      related: [
        { id: 'icd10-da', title: 'ICD-10 Dental Adaptation' },
        { id: 'snomed', title: 'SNOMED CT Dental subset' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Стоматология — основы' },
      ],
    };
  },
  info: `### Для чего используется
**FDI** (Fédération Dentaire Internationale / World Dental Federation) **two-digit system** — международный стандарт нумерации зубов, принят как ISO 3950 (1984, обновления 2009, 2016).

### Формат
\`\`\`
Q T  — например, 16 = верхний правый 1-й моляр
│ │
│ позиция (1-8 постоянный, 1-5 молочный)
│
квадрант (1-8)
\`\`\`

### Квадранты FDI (с точки зрения стоматолога)
| Код | Зубы | Описание |
|---|---|---|
| **1** | 11-18 | Верхняя челюсть, ПРАВАЯ сторона пациента |
| **2** | 21-28 | Верхняя челюсть, ЛЕВАЯ |
| **3** | 31-38 | Нижняя, ЛЕВАЯ |
| **4** | 41-48 | Нижняя, ПРАВАЯ |
| **5** | 51-55 | Верх. правая (молочные) |
| **6** | 61-65 | Верх. левая (молочные) |
| **7** | 71-75 | Нижн. левая (молочные) |
| **8** | 81-85 | Нижн. правая (молочные) |

### Сравнение 3 систем нумерации
| Зуб | FDI (ISO) | Universal (US) | Palmer |
|---|---|---|---|
| Верх. прав. 3-й моляр | 18 | 1 | ⏌8 |
| Верх. прав. 1-й моляр | 16 | 3 | ⏌6 |
| Верх. прав. центр. резец | 11 | 8 | ⏌1 |
| Верх. лев. 3-й моляр | 28 | 16 | 8⌐ |
| Нижн. лев. 3-й моляр | 38 | 17 | 8⌐ |
| Нижн. прав. 3-й моляр | 48 | 32 | ⏌8 |

### Молочные зубы (20 зубов, A-T в Universal)
Квадрант FDI 5-8: 51, 52, 53, 54, 55 (верх. правый) → 61-65 → 71-75 → 81-85`,
};
export default runner;

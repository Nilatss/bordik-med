// @ts-nocheck
/** Runner: fdi-dent — FDI two-digit tooth numbering (dental expanded) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (FDI World Dental Federation) · ISO 3950',
  reference: 'FDI World Dental Federation. Two-digit system of designating teeth. ISO 3950:2016. Geneva: ISO; 2016.',
  inputs: [
    {
      id: 'quadrant',
      label: 'Квадрант',
      type: 'select',
      options: [
        { value: '1', label: '1 — Верхний правый (постоянные 11-18)' },
        { value: '2', label: '2 — Верхний левый (постоянные 21-28)' },
        { value: '3', label: '3 — Нижний левый (постоянные 31-38)' },
        { value: '4', label: '4 — Нижний правый (постоянные 41-48)' },
        { value: '5', label: '5 — Верхний правый (молочные 51-55)' },
        { value: '6', label: '6 — Верхний левый (молочные 61-65)' },
        { value: '7', label: '7 — Нижний левый (молочные 71-75)' },
        { value: '8', label: '8 — Нижний правый (молочные 81-85)' },
      ],
    },
    {
      id: 'tooth',
      label: 'Номер зуба (от центра)',
      type: 'select',
      options: [
        { value: '1', label: '1 — центральный резец' },
        { value: '2', label: '2 — боковой резец' },
        { value: '3', label: '3 — клык' },
        { value: '4', label: '4 — 1-й премоляр / 1-й моляр (молочные)' },
        { value: '5', label: '5 — 2-й премоляр / 2-й моляр (молочные)' },
        { value: '6', label: '6 — 1-й моляр (постоянные)' },
        { value: '7', label: '7 — 2-й моляр (постоянные)' },
        { value: '8', label: '8 — 3-й моляр (зуб мудрости)' },
      ],
    },
  ],
  presets: [
    { label: 'Верх. прав. 1-й моляр (16)', values: { quadrant: '1', tooth: '6' } },
    { label: 'Нижн. лев. клык (33)', values: { quadrant: '3', tooth: '3' } },
    { label: 'Молочный центр. резец (51)', values: { quadrant: '5', tooth: '1' } },
  ],
  compute: (v) => {
    const q = String(v.quadrant || '1');
    const t = String(v.tooth || '6');
    const fdi = `${q}${t}`;
    const isPrimary = ['5','6','7','8'].includes(q);
    const permNames: Record<string,string> = {
      '1':'центральный резец','2':'боковой резец','3':'клык','4':'1-й премоляр',
      '5':'2-й премоляр','6':'1-й моляр','7':'2-й моляр','8':'3-й моляр (зуб мудрости)',
    };
    const primNames: Record<string,string> = {
      '1':'центр. резец','2':'боковой резец','3':'клык','4':'1-й моляр','5':'2-й моляр',
    };
    const name = isPrimary ? (primNames[t] || '—') : (permNames[t] || '—');
    const universalMap: Record<string, Record<string,string>> = {
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
    const palmerSym: Record<string,string> = { '1':'⏌','2':'⌐','3':'⌐','4':'⏌','5':'⏌','6':'⌐','7':'⌐','8':'⏌' };
    const palmerNum = isPrimary ? ({'1':'A','2':'B','3':'C','4':'D','5':'E'} as Record<string,string>)[t] : t;
    const palmer = `${palmerSym[q]}${palmerNum}`;
    return {
      value: fdi,
      unit: 'FDI',
      color: '#6B7280',
      interpretation: `FDI ${fdi} — ${name}`,
      details: `**FDI (ISO 3950):** ${fdi}\n**Зуб:** ${name}\n**Universal (US, ADA):** ${universal}\n**Palmer notation (UK):** ${palmer}\n\nFDI = quadrant.tooth (2-digit). Принят как ISO 3950 (1984, обновления 2009, 2016).`,
      actions: [
        'Использовать FDI в международных публикациях и ВОЗ',
        'В США — Universal numbering (1-32, A-T)',
        'В UK — Palmer notation (симметричные квадранты)',
      ],
      caveats: [
        'Не путать FDI с Universal — разные системы',
        'Квадранты указываются с точки зрения стоматолога',
        'Сверхкомплектные зубы (mesiodens) не имеют стандартного FDI',
      ],
      related: [
        { id: 'fdi', title: 'FDI numbering (base)' },
        { id: 'icd10-da', title: 'ICD-10 Dental Adaptation' },
        { id: 'blacks', title: 'G.V. Black classification' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**FDI two-digit system** (ISO 3950) — международный стандарт нумерации зубов. Формат: \`QT\` (Q = квадрант, T = позиция от центра).

### Квадранты
| Q | Сторона | Постоянные | Молочные |
|---|---|---|---|
| 1/5 | Верх прав | 11-18 | 51-55 |
| 2/6 | Верх лев | 21-28 | 61-65 |
| 3/7 | Нижн лев | 31-38 | 71-75 |
| 4/8 | Нижн прав | 41-48 | 81-85 |

### Кросс-референс
| FDI | Universal | Palmer |
|---|---|---|
| 16 | 3 | ⏌6 |
| 11 | 8 | ⏌1 |
| 48 | 32 | ⏌8 |

### Источник
ISO 3950:2016. FDI World Dental Federation.`,
};
export default runner;

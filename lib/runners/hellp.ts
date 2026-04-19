// @ts-nocheck
/** Runner: hellp — HELLP Mississippi / Tennessee */
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
  kind: 'calculator',
  inputs: [
    { id: 'plt', label: 'Тромбоциты (×10⁹/л)', type: 'number', unit: '×10⁹/л', min: 1, max: 500, step: 1, quickValues: [45, 75, 120, 180] },
    { id: 'ast', label: 'АСТ (Ед/л)', type: 'number', unit: 'Ед/л', min: 1, max: 3000, step: 1, quickValues: [30, 70, 150, 500] },
    { id: 'ldh', label: 'ЛДГ (Ед/л)', type: 'number', unit: 'Ед/л', min: 100, max: 5000, step: 10, quickValues: [300, 600, 1000, 2000] },
    {
      id: 'hemolysis',
      label: 'Признаки гемолиза (шизоциты / ↑билирубин)',
      type: 'select',
      options: [
        { value: 'yes', label: 'Есть' },
        { value: 'no', label: 'Нет' },
      ],
    },
  ],
  compute: (v) => {
    const plt = Number(v.plt);
    const ast = Number(v.ast);
    const ldh = Number(v.ldh);
    const hemo = v.hemolysis === 'yes';
    // Tennessee (Sibai): full HELLP if all three: hemolysis (LDH≥600), AST≥70, plt<100
    const ast70 = ast >= 70;
    const ldh600 = ldh >= 600;
    const plt100 = plt < 100;
    const hemoMarker = hemo || ldh600;
    const tennesseeFull = hemoMarker && ast70 && plt100;
    let mississippi = '';
    let color = '';
    let dx = '';
    if (tennesseeFull) {
      if (plt <= 50 && ast >= 70 && ldh600) {
        mississippi = 'Class 1 (Mississippi)';
        color = '#7F1D1D';
      } else if (plt > 50 && plt <= 100 && ast >= 70 && ldh600) {
        mississippi = 'Class 2 (Mississippi)';
        color = '#DC2626';
      } else {
        mississippi = 'Class 3 (Mississippi, partial)';
        color = '#EF4444';
      }
      dx = `Полный HELLP (Tennessee) · ${mississippi}`;
    } else if (plt <= 150 && (ast70 || hemoMarker)) {
      dx = 'Partial HELLP / Class 3 (Mississippi)';
      color = '#F59E0B';
      mississippi = 'Class 3';
    } else {
      dx = 'Критериев HELLP нет';
      color = '#22C55E';
    }
    return {
      value: dx,
      unit: '',
      interpretation: dx,
      color,
      details:
        'Tennessee (Sibai 1991): полный HELLP — все 3 признака (гемолиз + АСТ ≥ 70 + тромбоциты < 100). Mississippi (Martin 1991/1995): Class 1 (≤ 50, летальность до 25%), Class 2 (50–100), Class 3 (100–150).',
      actions: [
        'Стабилизация: MgSO₄, контроль АД < 160/110',
        'Родоразрешение — основная терапия после стабилизации (≥ 34 нед — без задержки; < 34 — кортикостероиды + экспектация при стабильности)',
        'Трансфузия тромбоцитов при < 20 или < 50 с активным кровотечением / перед КС',
        'Дексаметазон 10 мг ×2/сут — при Class 1 рассмотреть (эффект спорен)',
        'Мониторинг: CBC, АСТ/АЛТ, ЛДГ, билирубин, креатинин каждые 6–12 ч',
      ],
      caveats: [
        'HELLP может развиваться без выраженной гипертензии (~15–20%)',
        'Пик — 27–37 нед; до 30% — постпартум (первые 48 ч)',
        'DIC развивается у ~20% — контроль фибриногена, МНО, АЧТВ',
        'Разрыв/гематома печени — редкое, но катастрофическое осложнение',
      ],
      related: [
        { id: 'acog-preeclampsia', title: 'Преэклампсия' },
        { id: 'pierce', title: 'fullPIERS' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '300.4', title: 'Интенсивная терапия' },
      ],
    };
  },
  reference:
    'Sibai BM, 1991 (Tennessee): Am J Obstet Gynecol 1990;162:311. Martin JN, 1991/1995 (Mississippi): Obstet Gynecol 1991;78:737.',
  countries: 'Международный',
  presets: [
    { label: 'Class 1', values: { plt: 40, ast: 200, ldh: 1200, hemolysis: 'yes' } },
    { label: 'Class 2', values: { plt: 80, ast: 120, ldh: 800, hemolysis: 'yes' } },
    { label: 'Partial', values: { plt: 130, ast: 80, ldh: 500, hemolysis: 'no' } },
  ],
  caveats: [
    'Дифф. диагноз: ОЖГБ, ТТП/ГУС, СКВ-нефрит, сепсис',
    'Послеродовый HELLP может развиться через 2–7 дней',
  ],
  related: [
    { id: 'acog-preeclampsia', title: 'Преэклампсия' },
    { id: 'pierce', title: 'fullPIERS' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '300.4', title: 'Интенсивная терапия' },
  ],
  info: `### HELLP — классификации
**Tennessee (Sibai 1991)** — полный HELLP при всех трёх:
- Гемолиз: ЛДГ ≥ 600, шизоциты, ↑билирубин
- Повышение ферментов печени: АСТ ≥ 70
- Тромбоцитопения: Plt < 100 000

**Mississippi (Martin)** — по уровню тромбоцитов:
| Class | Plt, ×10⁹/л | АСТ | ЛДГ | Летальность |
|---|---|---|---|---|
| 1 | ≤ 50 | ≥ 70 | ≥ 600 | ~25% материнская |
| 2 | 50–100 | ≥ 70 | ≥ 600 | умеренная |
| 3 | 100–150 | ≥ 40 | ≥ 600 | лёгкая |

### Лечение
- Стабилизация, MgSO₄, антигипертензия
- Родоразрешение — ключ
- Трансфузия тромбоцитов при необходимости
- Мониторинг ДВС

### Источники
Sibai BM 1990/1991. Martin JN 1991/1995.`,
};

export default runner;

// @ts-nocheck
/** Runner: acvim */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'disease',
      label: 'Заболевание',
      type: 'select',
      options: [
        { value: 'ckd', label: 'ХБП (IRIS CKD)' },
        { value: 'mvd', label: 'Митральная болезнь (MMVD)' },
        { value: 'ce',  label: 'Хроническая энтеропатия' },
      ],
    },
    {
      id: 'stage',
      label: 'Стадия',
      type: 'select',
      options: [
        { value: 'a',  label: 'A (предрасположенность)' },
        { value: 'b1', label: 'B1 (субклинический, без кардиомегалии)' },
        { value: 'b2', label: 'B2 (субклинический, кардиомегалия)' },
        { value: 'c',  label: 'C (сердечная недостаточность)' },
        { value: 'd',  label: 'D (рефрактерная ХСН)' },
        { value: '1',  label: '1 (ранняя / FRE food-responsive)' },
        { value: '2',  label: '2 (ARE antibiotic-responsive)' },
        { value: '3',  label: '3 (IRE иммунозав. / IBD)' },
        { value: '4',  label: '4 (неотвечающая / PLE)' },
      ],
    },
  ],
  compute: (v) => {
    const dis = String(v.disease);
    const st = String(v.stage);

    let color = '#22C55E';
    let label = 'Стадия — лёгкая';
    let details = '';
    let actions: string[] = [];

    if (dis === 'ckd') {
      const map: Record<string, { col: string; lab: string; cre: string; act: string[] }> = {
        '1': { col: '#22C55E', lab: 'CKD 1 · Кр < 125 (собака) / < 140 (кот)', cre: 'Нормокреатининемия с пат. УЗИ/SDMA', act: ['Контроль АД, SDMA, UPC', 'Диета с контролем Ph', 'Повтор через 3-6 мес'] },
        '2': { col: '#22C55E', lab: 'CKD 2 · Кр 125-250 / 140-250', cre: 'Лёгкая азотемия', act: ['Renal-диета', 'Контроль АД, UPC', 'Омега-3'] },
        '3': { col: '#F59E0B', lab: 'CKD 3 · Кр 250-440 / 250-440', cre: 'Умеренная азотемия', act: ['Активная терапия: фосфат-биндеры', 'Эритропоэтин при Hct < 25 %', 'АПФ при UPC > 0,5'] },
        '4': { col: '#EF4444', lab: 'CKD 4 · Кр > 440 (все)', cre: 'Тяжёлая — уремия', act: ['Паллиативная / заместительная терапия', 'Подкожные инфузии дома', 'Антиэметики, гастропротекция'] },
      };
      const m = map[st] || map['1'];
      color = m.col; label = m.lab; details = m.cre; actions = m.act;
    } else if (dis === 'mvd') {
      const map: Record<string, { col: string; lab: string; det: string; act: string[] }> = {
        a:  { col: '#22C55E', lab: 'MMVD A', det: 'Порода риска (CKCS, такса) — нет шума', act: ['Скрининг ЭхоКГ 1×/год с 5 лет'] },
        b1: { col: '#22C55E', lab: 'MMVD B1', det: 'Шум, без кардиомегалии (LA/Ao < 1,6; VHS < 10,5)', act: ['Контроль 1×/год', 'Без медикаментов'] },
        b2: { col: '#F59E0B', lab: 'MMVD B2', det: 'Шум + кардиомегалия (LA/Ao ≥ 1,6; VHS ≥ 10,5)', act: ['**Пимобендан 0,25 мг/кг × 2/сут** (EPIC trial)', 'Контроль ЭхоКГ 6 мес'] },
        c:  { col: '#EF4444', lab: 'MMVD C', det: 'Клиническая ХСН (отёк лёгких)', act: ['Фуросемид 2-4 мг/кг × 2-3/сут', 'Пимобендан 0,3 мг/кг × 2', 'Беназеприл 0,5 мг/кг/сут', 'Спиронолактон 2 мг/кг/сут'] },
        d:  { col: '#991B1B', lab: 'MMVD D', det: 'Рефрактерная ХСН', act: ['Максимизировать фуросемид / торасемид', 'Сильденафил при ЛГ', 'Кислород, диета, прогноз сдержанный'] },
      };
      const m = (map[st] || map.a)!;
      color = m.col; label = m.lab; details = m.det; actions = m.act;
    } else if (dis === 'ce') {
      const map: Record<string, { col: string; lab: string; det: string; act: string[] }> = {
        '1': { col: '#22C55E', lab: 'FRE', det: 'Food-responsive — гидролизат 2-4 нед', act: ['Элиминационная диета (гидролизат)', 'Без АБ, без иммуносупрессии'] },
        '2': { col: '#F59E0B', lab: 'ARE', det: 'Antibiotic-responsive (метронидазол / тилозин)', act: ['Метронидазол 10-15 мг/кг × 2 или тилозин 10-25 мг/кг/сут', 'Пробиотики', 'Короткий курс 4-6 нед'] },
        '3': { col: '#EF4444', lab: 'IRE / IBD', det: 'Immune-responsive — иммуносупрессия', act: ['Преднизолон 1-2 мг/кг/сут (собаки) / 2-4 (кошки)', 'Циклоспорин 5 мг/кг при стероид-рефрактерной', 'Биопсия обязательна'] },
        '4': { col: '#991B1B', lab: 'Non-responsive / PLE', det: 'Протеин-потеря / тяжёлая', act: ['Альбумин < 20 г/л → пересмотреть диагноз (лимфангиэктазия, неоплазия)', 'Хлорамбуцил + преднизолон', 'Коллоиды при гипопротеинемии'] },
      };
      const m = map[st] || map['1'];
      color = m.col; label = m.lab; details = m.det; actions = m.act;
    }

    return {
      value: label.split(' ')[1] || st.toUpperCase(),
      unit: dis.toUpperCase(),
      interpretation: label,
      color,
      details,
      actions,
      caveats: [
        'ACVIM консенсусы обновляются каждые 5-7 лет — использовать актуальную версию',
        'IRIS CKD staging — отдельный от ACVIM, но принят международно',
        'Кошки MMVD/ГКМП — отдельный консенсус ACVIM 2020',
        'Стадирование ≠ прогноз; индивидуальная вариабельность',
      ],
      related: [
        { id: 'vhs', title: 'VHS (Buchanan)' },
        { id: 'asa-vet', title: 'ASA (вет)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'ACVIM Consensus Statements: MMVD (Keene 2019), IRIS CKD Guidelines 2019, WSAVA Chronic Enteropathy (Allenspach 2007, Cerquetella 2020).',
  countries: 'США (ACVIM) · международный (IRIS)',
  presets: [
    { label: 'CKD 2 кот', values: { disease: 'ckd', stage: '2' } },
    { label: 'MMVD B2 CKCS', values: { disease: 'mvd', stage: 'b2' } },
    { label: 'FRE собака', values: { disease: 'ce', stage: '1' } },
  ],
  info: `### Для чего используется
**ACVIM Consensus Statements** — клинические рекомендации American College of Veterinary Internal Medicine. Универсальные схемы стадирования хронических заболеваний собак и кошек.

### Основные стадирования
| Заболевание | Стадии |
|---|---|
| **ХБП (IRIS CKD)** | 1 · 2 · 3 · 4 (по креатинину + SDMA) |
| **MMVD (митральная)** | A · B1 · B2 · C · D |
| **Хр. энтеропатия** | FRE · ARE · IRE / IBD · PLE |
| **Гипертензия** | Нормо / Прегипер / Гипер / Тяж. |

### IRIS CKD
| Стадия | Кр (собака) | Кр (кот) |
|---|---|---|
| 1 | < 125 | < 140 |
| 2 | 125-250 | 140-250 |
| 3 | 250-440 | 250-440 |
| 4 | > 440 | > 440 |

### MMVD (Keene 2019)
- **B2 критерии:** LA/Ao ≥ 1,6, VHS ≥ 10,5, LVIDDN ≥ 1,7
- **B2 → пимобендан** (EPIC trial)
- **C → фуросемид + пимобендан + АПФ + спиронолактон**

### Хронические энтеропатии
| Ответ | Лечение |
|---|---|
| FRE | Гидролизат 2-4 нед |
| ARE | Метронидазол / тилозин |
| IRE | Преднизолон + биопсия |
| PLE | Хлорамбуцил + альбумин |

### Источник
ACVIM.org · IRIS-kidney.com · WSAVA GI Standardization Group.`,
};
export default runner;

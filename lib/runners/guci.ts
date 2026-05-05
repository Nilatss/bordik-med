// @ts-nocheck
/**
 * Runner: guci — Göteborg University Cirrhosis Index
 *
 * Простой лабораторный индекс для скрининга цирроза при ХВГ-С (HCV).
 * Разработан в Гётеборге (Швеция, Islam 2005).
 *
 * Формула:
 *   GUCI = (AST × INR × 100) / (ULN_AST × Тромбоциты)
 *
 * Cut-off > 1.0 — значимый фиброз/цирроз (METAVIR F3–F4).
 * Чувствительность 80%, специфичность 78% (Islam 2005).
 */

import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ast',     hint: 'АСТ пациента в Ед/л',                          label: 'АСТ',            type: 'number', unit: 'Ед/л',  min: 5,   max: 2000, quickValues: [25, 60, 120, 200] },
    { id: 'ast_uln', hint: 'Верхняя граница нормы лаборатории (М ~40, Ж ~32)', label: 'ULN АСТ (норма)', type: 'number', unit: 'Ед/л',  min: 20,  max: 80,   quickValues: [32, 35, 40, 45] },
    { id: 'inr',     hint: 'МНО (INR) — обычно по протромбину',             label: 'МНО (INR)',      type: 'number', unit: '',      min: 0.7, max: 6,    quickValues: [1.0, 1.2, 1.5, 2.0] },
    { id: 'plt',     hint: 'Тромбоциты ×10⁹/л. Норма: 150–400',              label: 'Тромбоциты',     type: 'number', unit: '×10⁹/л', min: 20,  max: 600,  quickValues: [80, 150, 220, 300] },
  ],
  compute: (v) => {
    const ast    = Number(v.ast)    || 0;
    const ulnAst = Number(v.ast_uln) || 40;
    const inr    = Number(v.inr)    || 0;
    const plt    = Number(v.plt)    || 1;

    const guci = (ulnAst > 0 && plt > 0)
      ? (ast * inr * 100) / (ulnAst * plt)
      : 0;

    let interpretation = 'Низкая вероятность цирроза';
    let color = '#22C55E';
    let stage: 'low' | 'high' = 'low';
    if (guci > 1.0) {
      interpretation = 'Значимый фиброз / цирроз (F3–F4)';
      color = '#EF4444';
      stage = 'high';
    }

    return {
      value: guci.toFixed(2),
      unit: 'GUCI',
      interpretation,
      color,
      details: `GUCI = (АСТ × МНО × 100) / (ULN АСТ × Тромбоциты)
Cut-off > 1.0 — значимый фиброз/цирроз (Islam 2005, HCV-валидация). Чувствительность 80 %, специфичность 78 %, AUROC 0.85.`,
      actions: [
        stage === 'low' ? 'Подтвердите вторичным тестом (FIB-4, APRI или эластометрия) при HCV-инфекции' : null,
        stage === 'high' ? 'Направить к гепатологу; FibroScan / ARFI / MRE для подтверждения' : null,
        stage === 'high' ? 'Скрининг ГЦК (УЗИ + АФП каждые 6 мес) при подтверждении цирроза' : null,
        stage === 'high' ? 'ЭГДС-скрининг варикозов пищевода (Baveno VII)' : null,
        'Терапия: DAA-режимы при HCV; абстиненция при алкоголе; отмена гепатотоксиков',
      ].filter(Boolean),
      caveats: [
        'Разработан и валидирован для HCV (Islam 2005, Швеция). Применимость при HBV, MASLD, алкогольной болезни — ограниченная.',
        'Острый гепатит (АСТ > 5–10× ULN) даёт ложно-высокое значение.',
        'Не валидирован у пациентов на антикоагулянтах (МНО искажается).',
        'Тромбоцитопения вне печёночной патологии (ИТП, химиотерапия) → ложно-высокий.',
        'Сочетайте с FIB-4 / APRI или эластометрией для диагностической точности.',
      ],
      scale: {
        segments: [
          { min: 0,   max: 1.0, label: 'Низкий',         color: '#22C55E' },
          { min: 1.0, max: 5,   label: 'Цирроз / F3–F4', color: '#EF4444' },
        ],
        current: Math.min(guci, 5),
        unit: 'GUCI',
      },
      related: [
        { id: 'fib4-lab', title: 'FIB-4 / APRI' },
        { id: 'apri-hep', title: 'APRI' },
        { id: 'meld',     title: 'MELD' },
        { id: 'fibrotest', title: 'FibroTest / FibroScan' },
      ],
    };
  },
  reference: 'Islam S et al. Scand J Gastroenterol 2005;40:867–872. Validated for HCV; AUROC 0.85.',
  countries: 'Международный (HCV-валидация: Швеция, Северная Европа)',
  presets: [
    { label: 'Норма',           values: { ast: 30,  ast_uln: 40, inr: 1.0, plt: 240 } },
    { label: 'Серая зона',      values: { ast: 80,  ast_uln: 40, inr: 1.2, plt: 180 } },
    { label: 'Цирроз',          values: { ast: 120, ast_uln: 40, inr: 1.5, plt: 90  } },
  ],
  info: `### Для чего используется
**GUCI (Göteborg University Cirrhosis Index)** — простой лабораторный индекс для скрининга цирроза при хроническом гепатите С (HCV). Разработан в Гётеборге (Islam 2005).

### Формула
\`GUCI = (АСТ × МНО × 100) / (ULN АСТ × Тромбоциты)\`

Где:
- АСТ — текущее значение пациента (Ед/л)
- ULN АСТ — верхняя граница нормы лаборатории (обычно 40 Ед/л у мужчин, 32 у женщин)
- МНО — международное нормализованное отношение
- Тромбоциты — количество в ×10⁹/л

### Cut-off
| GUCI | Интерпретация | Действие |
|---|---|---|
| ≤ 1.0 | Низкая вероятность цирроза | Подтвердить FIB-4 / эластометрия |
| > 1.0 | Цирроз / F3–F4 | Гепатолог + FibroScan + скрининг ГЦК |

### Производительность
- AUROC: **0.85** (HCV-когорта)
- Чувствительность: **80%**
- Специфичность: **78%**
- PPV ~70%, NPV ~85%

### Преимущества
- Использует только рутинные параметры (АСТ, МНО, тромбоциты)
- Простая формула — считается у постели пациента
- Бесплатный, доступен в любой лаборатории

### Ограничения
- **Валидирован для HCV.** При HBV, MASLD, алкогольной болезни — ограниченная применимость.
- Острый гепатит (АСТ > 5–10× ULN) → ложно-высокий GUCI.
- Антикоагулянты (варфарин, гепарин) искажают МНО.
- Тромбоцитопения вне печёночной патологии (ИТП, гиперспленизм других причин, химиотерапия) даёт ложно-высокий результат.

### Сравнение с FIB-4 / APRI
| Индекс | AUROC при HCV | Cut-off F3–F4 |
|---|---|---|
| **GUCI** | 0.85 | > 1.0 |
| **FIB-4** | 0.83 | > 2.67 |
| **APRI** | 0.77 | > 1.0 (cirrhosis) |

GUCI и FIB-4 сопоставимы по точности при HCV; авторы рекомендуют использовать оба в качестве двойного триажа.

### Алгоритм AASLD/EASL для HCV
1. **GUCI** или **FIB-4** при первичном осмотре
2. Серая зона / положительный → **FibroScan** (LSM) или ELF
3. Несоответствие → биопсия
4. Цирроз → DAA-терапия + скрининг ГЦК (УЗИ + АФП q6 мес) + Baveno VII

### Источники
- Islam S et al. *Scand J Gastroenterol* 2005;40:867–872
- AASLD-IDSA HCV Living Guidance (актуальная версия)
- EASL Recommendations on Treatment of Hepatitis C 2020 / 2024 update`,
};

export default runner;

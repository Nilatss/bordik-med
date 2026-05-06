// @ts-nocheck
/**
 * Runner: renal-dose — Коррекция доз препаратов при ХБП/ХПБ.
 *
 * Inputs: drug select + (вес, возраст, пол, креатинин в мкмоль/л).
 * Compute: считает CKD-EPI 2021 (race-free) eGFR и Cockcroft-Gault CrCl,
 *   находит подходящую стадию по eGFR (или по CrCl для DOAC/аминогликозидов),
 *   возвращает рекомендованную дозу + комментарий + ссылки на источники.
 *
 * Source: data/renal-dosing.json — централизованный датасет, версионируется
 *   отдельно. Текущий MVP — 15 препаратов (топ-приоритет): антикоагулянты,
 *   ванкомицин, метформин, аллопуринол, дигоксин, опиоиды, литий, НПВС,
 *   фторхинолоны, иАПФ, β-блокаторы, габапентиноиды.
 *
 * Defense-in-depth: при невалидных входах (creatinine ≤ 0, age ≤ 0,
 *   weight ≤ 0) возвращает N/A — см. P0-1 audit fix паттерн.
 */
import type { CalculatorTool } from '../tools-runners';
import dataRaw from '@/data/renal-dosing.json';

interface Stage {
  egfr_min: number;
  egfr_max: number;
  label: string;
  dose: string;
  comment: string;
  color: string;
}

interface DrugEntry {
  id: string;
  name_ru: string;
  name_en: string;
  atc: string;
  class_ru: string;
  renal_excretion_pct: number;
  use_crcl: boolean;
  stages: Stage[];
  verified_by: null | string;
  verified_at: null | string;
}

const data = dataRaw as { drugs: DrugEntry[] };

const drugOptions = data.drugs.map((d) => ({
  value: d.id,
  label: `${d.name_ru} (${d.class_ru})`,
}));

function computeCKDEPI2021(scrUmol: number, age: number, female: boolean): number {
  const scr = scrUmol / 88.4;
  const k = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const sex = female ? 1.012 : 1;
  const minTerm = Math.pow(Math.min(scr / k, 1), alpha);
  const maxTerm = Math.pow(Math.max(scr / k, 1), -1.2);
  return 142 * minTerm * maxTerm * Math.pow(0.9938, age) * sex;
}

function computeCrCl(scrUmol: number, age: number, weight: number, female: boolean): number {
  const scr = scrUmol / 88.4;
  return ((140 - age) * weight * (female ? 0.85 : 1)) / (72 * scr);
}

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: drugOptions,
    },
    {
      id: 'age',
      label: 'Возраст',
      type: 'number',
      unit: 'лет',
      min: 18,
      max: 120,
      quickValues: [25, 40, 55, 65, 75, 85],
    },
    {
      id: 'weight',
      label: 'Вес',
      type: 'number',
      unit: 'кг',
      min: 30,
      max: 250,
      step: 0.5,
      quickValues: [50, 60, 70, 80, 90, 100],
    },
    {
      id: 'creatinine',
      label: 'Креатинин сыворотки',
      type: 'number',
      unit: 'мкмоль/л',
      min: 10,
      max: 2000,
      step: 1,
      hint: 'В СИ. Конверсия mg/dL × 88.4',
      quickValues: [70, 90, 110, 140, 180, 250, 400],
    },
    {
      id: 'female',
      label: 'Женский пол',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const drugId = String(v.drug);
    const drug = data.drugs.find((d) => d.id === drugId);
    const age = Number(v.age);
    const weight = Number(v.weight);
    const creat = Number(v.creatinine);
    const female = v.female === true;

    if (!drug) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: 'Выберите препарат',
        color: '#9CA3AF',
      };
    }

    // P0 guard: math poles при 0 / отрицательных значениях
    if (
      !Number.isFinite(creat) || creat <= 0 ||
      !Number.isFinite(age) || age <= 0 ||
      !Number.isFinite(weight) || weight <= 0
    ) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: 'Введите корректные значения (креатинин > 0, возраст > 0, вес > 0)',
        color: '#9CA3AF',
      };
    }

    const eGFR = computeCKDEPI2021(creat, age, female);
    const crcl = computeCrCl(creat, age, weight, female);
    const renalFn = drug.use_crcl ? crcl : eGFR;
    const renalUnit = drug.use_crcl ? 'мл/мин (CrCl)' : 'мл/мин/1.73м² (eGFR)';

    // Найти стадию: первый интервал, где renalFn попадает [min, max)
    const stage = drug.stages.find((s) => renalFn >= s.egfr_min && renalFn < s.egfr_max)
                ?? drug.stages[drug.stages.length - 1];

    const stageActions = drug.stages.map((s) => `${s.label}: ${s.dose}`);

    return {
      value: stage.dose,
      unit: '',
      interpretation: `${drug.name_ru} · ${stage.label} · ${renalFn.toFixed(0)} ${renalUnit}`,
      color: stage.color,
      details: [
        `**Препарат:** ${drug.name_ru} (${drug.name_en}) · ATC ${drug.atc} · ${drug.class_ru}.`,
        `**Почечная экскреция:** ${drug.renal_excretion_pct}% препарата выводится почками.`,
        ``,
        `**Расчётная функция почек:**`,
        `- eGFR (CKD-EPI 2021): **${eGFR.toFixed(0)} мл/мин/1.73м²**`,
        `- CrCl (Cockcroft-Gault): **${crcl.toFixed(0)} мл/мин**`,
        `- Используется: **${drug.use_crcl ? 'CrCl' : 'eGFR'}** (${drug.use_crcl ? 'FDA/EMA для DOAC и аминогликозидов' : 'KDIGO стандарт'}).`,
        ``,
        `**Текущая стадия:** ${stage.label}`,
        ``,
        `**Рекомендация:** ${stage.dose}`,
        ``,
        `**Комментарий:** ${stage.comment}`,
      ].join('\n'),
      actions: stageActions,
      caveats: [
        '🚨 **BETA — требует верификации клин-фармакологом** перед коммерческим использованием. Каждая запись имеет verified_by:null.',
        'Не заменяет фарм-консультацию. Решение по конкретному пациенту принимает врач/клин-фармаколог с полным контекстом.',
        'У пациентов на гемодиализе/перитонеальном диализе всегда дополнительный учёт: clearance метода, время последнего сеанса, концентрации.',
        'CKD-EPI 2021 race-free, но не валидирована для весов <60 кг и >120 кг — у них предпочтительнее измерять GFR (24-час моча, цистатин C).',
        'Cockcroft-Gault использует фактический вес — при ожирении (BMI>30) использовать ABW (adjusted body weight) или IBW.',
        'У пациентов с AKI (острая почечная недостаточность) расчёт некорректен — креатинин не в равновесии.',
      ],
      relatedCourses: [
        { id: '301.5', title: 'Нефрология' },
        { id: '202.8', title: 'Фармакокинетика' },
        { id: '303.7', title: 'Клиническая фармакология сердечно-сосудистых препаратов' },
      ],
      related: [
        { id: 'ckd-epi', title: 'CKD-EPI 2021 (eGFR)' },
        { id: 'cockcroft', title: 'Cockcroft-Gault (CrCl, FDA)' },
        { id: 'mdrd', title: 'MDRD' },
        { id: 'drugs', title: 'Чекер взаимодействий' },
      ],
      scale: {
        segments: drug.stages
          .slice()
          .sort((a, b) => a.egfr_min - b.egfr_min)
          .map((s) => ({
            min: s.egfr_min,
            max: s.egfr_max === 999 ? 150 : s.egfr_max,
            label: s.label,
            color: s.color,
          })),
        current: Math.min(150, Math.round(renalFn)),
        unit: drug.use_crcl ? 'CrCl' : 'eGFR',
      },
    };
  },
  reference:
    'KDIGO 2024 CKD Evaluation and Management. EHRA 2021 NOAC Practical Guide. FDA labels (DailyMed). ГРЛС Минздрав РФ. Версия датасета: ' +
    (dataRaw as { version?: string }).version +
    ', обновлено: ' +
    (dataRaw as { lastUpdated?: string }).lastUpdated +
    '. ⚠ BETA — требует верификации клин-фармакологом.',
  countries: 'Международный (адаптация под РФ)',
  presets: [
    { label: 'Молодой ♂ 70кг, креатинин 90', values: { drug: 'apixaban', age: 30, weight: 70, creatinine: 90, female: false } },
    { label: 'Пожилой ♂ 65кг, креатинин 200 (G3b)', values: { drug: 'metformin', age: 75, weight: 65, creatinine: 200, female: false } },
    { label: 'Пожилая ♀ 60кг, креатинин 350 (G4)', values: { drug: 'enoxaparin', age: 80, weight: 60, creatinine: 350, female: true } },
    { label: 'Терминальная ХБП — литий', values: { drug: 'lithium', age: 55, weight: 70, creatinine: 800, female: false } },
    { label: 'Ванкомицин при умеренной ХБП', values: { drug: 'vancomycin', age: 60, weight: 75, creatinine: 180, female: false } },
  ],
  info: `### Для чего используется

**Renal Dose Adjustment** — определение скорректированных доз препаратов с учётом функции почек. Ошибочное дозирование при сниженной СКФ — одна из главных причин лекарственной нефротоксичности и побочных эффектов в стационаре и амбулаторно.

### Что считается

1. **eGFR по CKD-EPI 2021** (race-free) — стандарт KDIGO для стадирования ХБП.
2. **CrCl по Cockcroft-Gault** — стандарт FDA/EMA для дозирования DOAC и аминогликозидов.
3. **Стадия ХБП** по выбранному показателю.
4. **Рекомендованная доза** для выбранного препарата на этой стадии — из централизованной базы \`data/renal-dosing.json\`.

### Когда использовать какую формулу

| Ситуация | Формула |
|---|---|
| Стадирование ХБП (KDIGO) | CKD-EPI 2021 (eGFR) |
| Дозирование DOAC (апиксабан, ривароксабан, дабигатран, эдоксабан) | Cockcroft-Gault (CrCl) — FDA labeling |
| Дозирование НМГ (эноксапарин) | Cockcroft-Gault |
| Дозирование аминогликозидов (гентамицин, амикацин) | Cockcroft-Gault |
| Дозирование ванкомицина (доза/интервал) | CrCl или eGFR — оба допустимы; новые TDM-протоколы используют AUC |
| Метформин, аллопуринол, литий | eGFR |

Калькулятор автоматически использует правильную формулу для каждого препарата (поле \`use_crcl\` в датасете).

### Источники

- KDIGO 2024 CKD Evaluation and Management
- EHRA 2021 NOAC Practical Guide
- Lexicomp Drug Information
- Stockley's Drug Interactions, 12th edition
- FDA Drug Labels (DailyMed)
- ГРЛС Минздрав РФ — официальные инструкции

### Ограничения

- Не валидирована для AKI (креатинин не в равновесии).
- Не учитывает перитонеальный диализ, гемодиафильтрацию, CRRT — они требуют отдельного протокола.
- Для онкопациентов: некоторые ХТ-препараты (карбоплатин по Calvert) используют GFR в формуле AUC, не корректировку доз — это отдельный калькулятор.
- BETA — требует ручной верификации клин-фармакологом перед коммерческим использованием.`,
};

export default runner;

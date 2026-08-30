/**
 * Runner: pediatric-dose — Педиатрические дозы препаратов.
 *
 * Inputs: drug select, indication select, weight (kg), age (мес).
 * Compute: для выбранного показания берёт mg/kg, считает дозу,
 *   capping на max_per_dose_mg и max_per_day_mg. Проверяет
 *   возрастное ограничение (age_min_months, age_max_months).
 *
 * Source: data/pediatric-dosing.json — 30 препаратов в MVP.
 *
 * Defense-in-depth: при невалидных входах (weight ≤ 0, age < 0)
 *   возвращает N/A — паттерн P0-1 audit fix.
 */
import type { CalculatorTool } from '../tools-runners';
import dataRaw from '@/data/pediatric-dosing.json';

interface Indication {
  label: string;
  age_min_months: number;
  age_max_months?: number;
  mg_per_kg: number;
  frequency_hours: number;
  max_per_dose_mg: number;
  max_per_day_mg_per_kg?: number;
  max_per_day_mg?: number;
  route: string;
  duration?: string;
  comment: string;
}

interface DrugEntry {
  id: string;
  name_ru: string;
  name_en: string;
  atc: string;
  class_ru: string;
  indications: Indication[];
  verified_by: null | string;
  verified_at: null | string;
}

const data = dataRaw as { drugs: DrugEntry[] };

// Build flat list of drug+indication pairs for dropdown
interface FlatOption {
  value: string; // 'drugId|indicationIndex'
  label: string;
}
const flatOptions: FlatOption[] = [];
for (const d of data.drugs) {
  d.indications.forEach((ind, i) => {
    flatOptions.push({
      value: `${d.id}|${i}`,
      label: `${d.name_ru} — ${ind.label}`,
    });
  });
}
flatOptions.sort((a, b) => a.label.localeCompare(b.label, 'ru'));

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug_indication',
      label: 'Препарат и показание',
      type: 'select',
      options: flatOptions,
    },
    {
      id: 'weight',
      label: 'Вес ребёнка',
      type: 'number',
      unit: 'кг',
      min: 0.5,
      max: 100,
      step: 0.1,
      hint: 'Новорождённый ≈3 кг, 1 год ≈10 кг, 5 лет ≈18 кг, 10 лет ≈30 кг',
      quickValues: [3, 5, 10, 15, 20, 30, 50],
    },
    {
      id: 'age_months',
      label: 'Возраст',
      type: 'number',
      unit: 'мес.',
      min: 0,
      max: 216,
      step: 1,
      hint: '0 — новорождённый. Для лет умножьте на 12 (3 года = 36 мес).',
      quickValues: [0, 1, 6, 12, 36, 60, 120, 180],
    },
  ],
  compute: (v) => {
    const drugInd = String(v.drug_indication);
    const weight = Number(v.weight);
    const age = Number(v.age_months);

    if (!drugInd || !drugInd.includes('|')) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: 'Выберите препарат и показание',
        color: '#9CA3AF',
      };
    }

    const [drugId, indIdxStr] = drugInd.split('|');
    const drug = data.drugs.find((d) => d.id === drugId);
    const indIdx = parseInt(indIdxStr ?? '0', 10);
    const ind = drug?.indications[indIdx];

    if (!drug || !ind) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: 'Препарат/показание не найдены',
        color: '#9CA3AF',
      };
    }

    // P0 guard: math poles при 0 / отрицательных значениях
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(age) || age < 0) {
      return {
        value: 'N/A',
        unit: '',
        interpretation: 'Введите корректные значения (вес > 0, возраст ≥ 0)',
        color: '#9CA3AF',
      };
    }

    // Age range check
    const ageMaxMonths = ind.age_max_months ?? 999;
    if (age < ind.age_min_months || age > ageMaxMonths) {
      let ageMinHuman = `${ind.age_min_months} мес`;
      if (ind.age_min_months >= 12) ageMinHuman = `${(ind.age_min_months / 12).toFixed(0)} лет`;
      let ageMaxHuman = ageMaxMonths === 999 ? '' : ` до ${ageMaxMonths >= 12 ? (ageMaxMonths / 12).toFixed(0) + ' лет' : ageMaxMonths + ' мес'}`;
      return {
        value: 'Не назначать',
        unit: '',
        interpretation: `Возраст ребёнка вне диапазона: показание разрешено с ${ageMinHuman}${ageMaxHuman}`,
        color: '#EF4444',
        details: `**Препарат:** ${drug.name_ru} (${drug.class_ru})\n\n**Показание:** ${ind.label}\n\n**Текущий возраст:** ${age} мес — ВНЕ ДИАПАЗОНА.\n\n**Допустимый диапазон:** от ${ageMinHuman}${ageMaxHuman}.\n\n**Комментарий:** ${ind.comment}`,
      };
    }

    // Some indications aren't dosed per kilogram at all: a fixed dose
    // (e.g. budesonide|0 "Круп" — 2 мг однократно regardless of weight)
    // or a genuinely non-mg dosing form (puffs, infusion titrated at the
    // bedside) that the dataset marks "Справочно (доза не рассчитывается)".
    // Both are encoded as `mg_per_kg: 0`; distinguish them by whether
    // `max_per_dose_mg` also carries a value.
    if (ind.mg_per_kg === 0 && ind.max_per_dose_mg === 0) {
      return {
        value: 'См. комментарий',
        unit: '',
        interpretation: `${drug.name_ru} · ${ind.label} · доза не рассчитывается по весу`,
        color: '#9CA3AF',
        details: `**Препарат:** ${drug.name_ru} (${drug.name_en}) · ATC ${drug.atc} · ${drug.class_ru}\n\n**Показание:** ${ind.label}\n\n**Путь введения:** ${ind.route}\n\n**Комментарий:** ${ind.comment}`,
      };
    }

    // Compute per-dose.
    // Audit B-6: epsilon-tolerance on the cap comparison. IEEE-754
    // double-precision multiplication can drift by ~1e-14 on common
    // inputs (e.g. `0.1 * 1000 === 100.00000000000001`). A naive
    // `calcMg > max` then falsely flagged a "превышает максимальную
    // дозу" warning even when the clinical answer is exactly at the
    // ceiling. Tolerance of 1e-6 (1 µg at mg scale) is well below
    // clinically-significant rounding for any drug we ship and is
    // larger than IEEE-754 drift on the multiplications we perform.
    //
    // mg_per_kg === 0 with a non-zero max_per_dose_mg means the dataset
    // encodes a fixed, weight-independent dose in max_per_dose_mg (see
    // above) — use it directly instead of multiplying by zero, which
    // used to silently print "0 мг" as if that were the real dose.
    const calcMg = ind.mg_per_kg > 0 ? weight * ind.mg_per_kg : ind.max_per_dose_mg;
    const cappedMg = Math.min(calcMg, ind.max_per_dose_mg);
    const wasCapped = calcMg - ind.max_per_dose_mg > 1e-6;

    // Compute per-day if frequency known
    const dosesPerDay = ind.frequency_hours > 0 ? Math.floor(24 / ind.frequency_hours) : 1;
    const totalPerDay = cappedMg * dosesPerDay;
    const maxPerDay = ind.max_per_day_mg ?? (ind.max_per_day_mg_per_kg ? ind.max_per_day_mg_per_kg * weight : Infinity);
    const dayCapped = totalPerDay - maxPerDay > 1e-6;

    const freqHuman = ind.frequency_hours === 0 ? 'однократно'
      : ind.frequency_hours < 1 ? `каждые ${(ind.frequency_hours * 60).toFixed(0)} мин`
      : ind.frequency_hours === 24 ? '1 р/сут'
      : `каждые ${ind.frequency_hours} ч (${dosesPerDay} р/сут)`;

    // Smart numeric formatting: drop trailing zeros after decimal point.
    // 0.10 → 0.1; 2.0 → 2; 180 → 180; 0.05 → 0.05.
    const formatMg = (x: number): string => {
      if (x >= 100) return x.toFixed(0);
      if (x >= 10) return x.toFixed(1).replace(/\.0$/, '');
      if (x >= 1) return x.toFixed(2).replace(/\.?0+$/, '');
      return x.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    };
    const valueStr = `${formatMg(cappedMg)} мг ${freqHuman}`;

    let color = '#22C55E';
    if (wasCapped || dayCapped) color = '#F59E0B';

    const detailsLines = [
      `**Препарат:** ${drug.name_ru} (${drug.name_en}) · ATC ${drug.atc} · ${drug.class_ru}`,
      `**Показание:** ${ind.label}`,
      ``,
      ind.mg_per_kg > 0
        ? `**Расчёт по mg/кг:** ${ind.mg_per_kg} мг/кг × ${weight} кг = **${calcMg.toFixed(2)} мг**`
        : `**Фиксированная доза:** ${calcMg.toFixed(2)} мг (не зависит от веса)`,
      wasCapped ? `⚠ Превышает максимальную разовую дозу ${ind.max_per_dose_mg} мг — ограничено до **${cappedMg.toFixed(2)} мг**.` : `Не превышает максимум разовой дозы (${ind.max_per_dose_mg} мг). ✓`,
      ``,
      `**Доза:** ${cappedMg.toFixed(2)} мг ${freqHuman}`,
      `**Путь введения:** ${ind.route}`,
      ind.duration ? `**Длительность:** ${ind.duration}` : '',
      ``,
      ind.frequency_hours > 0 ? `**Суммарная суточная доза:** ${totalPerDay.toFixed(0)} мг (${dosesPerDay} приёмов)` : '',
      maxPerDay !== Infinity ? `**Максимум суточно:** ${maxPerDay.toFixed(0)} мг ${dayCapped ? '⚠ ПРЕВЫШЕНО' : '✓'}` : '',
      ``,
      `**Комментарий:** ${ind.comment}`,
    ].filter(Boolean);

    const actions: string[] = [];
    if (wasCapped) actions.push(`Доза ограничена максимумом ${ind.max_per_dose_mg} мг — у крупных детей mg/кг даёт больше, чем взрослая доза`);
    if (dayCapped) actions.push(`⚠ Суточная доза превышает максимум ${maxPerDay} мг — снизить количество приёмов или дозу`);
    if (drug.id === 'morphine' || drug.id === 'midazolam') actions.push('Готовность к налоксону/флумазенилу. Мониторинг SpO2, ЧДД, сознания');
    if (drug.id === 'vancomycin' || drug.id === 'gentamicin' || drug.id === 'amikacin') actions.push('TDM обязателен (терапевтическое окно узкое, риск нефро-/ототоксичности)');

    return {
      value: valueStr,
      unit: '',
      interpretation: `${drug.name_ru} · ${ind.label} · ${weight} кг`,
      color,
      details: detailsLines.join('\n'),
      actions: actions.length > 0 ? actions : undefined,
      caveats: [
        '🚨 **BETA — требует верификации педиатром / клин-фармакологом** перед коммерческим использованием. verified_by:null.',
        'Не заменяет фарм-консультацию. Решение по конкретному ребёнку — за лечащим врачом.',
        'Возрастные ограничения проверяются строго: препарат может быть противопоказан или малоизучен в более младшем возрасте.',
        'Расчёт по фактическому весу. У детей с ожирением (BMI >95 перцентиль) предпочтительнее идеальный вес для антибиотиков и опиоидов (риск передозировки).',
        'Новорождённые (<1 мес) — отдельный мир: коррекция по гестационному и постнатальному возрасту, лучше специальные неонатальные протоколы.',
        'Узкие препараты (дигоксин, фенобарбитал, ванкомицин) — TDM обязателен, расчёт по mg/кг — стартовая, не финальная доза.',
      ],
      relatedCourses: [
        { id: '203.9', title: 'Педиатрическая фармакология' },
        { id: '301.4', title: 'Педиатрия (общая)' },
        { id: '202.8', title: 'Фармакокинетика' },
      ],
      related: [
        { id: 'apgar', title: 'Apgar score' },
        { id: 'westley', title: 'Westley Croup score' },
        { id: 'pews', title: 'PEWS' },
        { id: 'cockcroft', title: 'Cockcroft-Gault (CrCl)' },
      ],
    };
  },
  reference:
    'WHO Pocket Book of Hospital Care for Children, BNFc, AAP Red Book, APLS UK/AU, Lexicomp Pediatric & Neonatal. Российские клин. рекомендации Минздрав РФ (Союз педиатров России). Версия датасета: ' +
    (dataRaw as { version?: string }).version +
    ', обновлено: ' +
    (dataRaw as { lastUpdated?: string }).lastUpdated +
    '. ⚠ BETA — требует верификации педиатром.',
  countries: 'Международный (WHO/AAP/BNFc) + адаптация под РФ',
  presets: [
    { label: 'Парацетамол ребёнку 12 кг (3 года)', values: { drug_indication: 'paracetamol|0', weight: 12, age_months: 36 } },
    { label: 'Ибупрофен 8 кг (1 год)', values: { drug_indication: 'ibuprofen|0', weight: 8, age_months: 12 } },
    { label: 'Амоксициллин при ОСО 15 кг (4 года)', values: { drug_indication: 'amoxicillin|0', weight: 15, age_months: 48 } },
    { label: 'Цефтриаксон при сепсисе 20 кг (6 лет)', values: { drug_indication: 'ceftriaxone|0', weight: 20, age_months: 72 } },
    { label: 'Адреналин в/м анафилаксия 30 кг (10 лет)', values: { drug_indication: 'epinephrine-im|0', weight: 30, age_months: 120 } },
    { label: 'Дексаметазон при крупе 12 кг (2 года)', values: { drug_indication: 'dexamethasone|0', weight: 12, age_months: 24 } },
  ],
  info: `### Для чего используется

**Pediatric Dose Calculator** — расчёт безопасных доз препаратов для детей от новорождённого до подросткового возраста на основе **mg/кг** с проверкой максимальных разовых и суточных доз.

### Что умеет

- 30 препаратов MVP: анальгетики, антибиотики, противовирусные, ГКС, β2-агонисты, противосудорожные, реанимационные.
- Множественные показания на препарат: разные дозы для ОСО / пневмонии / менингита.
- **Auto-cap на максимум**: у крупных детей mg/кг может превысить взрослую дозу — калькулятор ограничит и предупредит.
- **Auto-check возраста**: если ребёнок младше age_min для показания, выдаст «Не назначать» с объяснением.
- **Расчёт суточной дозы** с проверкой max_per_day.

### Возрастные группы (для ориентира)

| Группа | Возраст | Типичный вес |
|---|---|---|
| Новорождённый | 0–28 дней | 2.5–4 кг |
| Грудной | 1–12 мес | 4–10 кг |
| Ранний детский | 1–3 года | 10–15 кг |
| Дошкольный | 3–6 лет | 15–22 кг |
| Школьный | 6–12 лет | 22–45 кг |
| Подросток | 13–17 лет | 40–80 кг |

### Источники

- WHO Pocket Book of Hospital Care for Children, 2nd edition
- BNF for Children (BNFc) — стандарт UK
- AAP Red Book — стандарт США
- APLS UK / Australia — реанимационные протоколы
- Lexicomp Pediatric & Neonatal Drug Information
- Союз педиатров России — клин. рекомендации Минздрав РФ

### Ограничения

- **Не для прямого назначения без верификации**: датасет в BETA, не прошёл peer-review.
- **Не учитывает функцию почек/печени**: для ХБП используйте отдельный calculator (renal-dose).
- **Не учитывает взаимодействия**: используйте drug-interactions checker.
- **Новорождённые и недоношенные**: упрощённая модель — для них специальные неонатальные протоколы (по гестационному и постнатальному возрасту).
- **Препараты с TDM** (ванкомицин, гентамицин, фенобарбитал, дигоксин): расчёт по mg/кг — стартовая доза, дальше TDM.`,
};

export default runner;

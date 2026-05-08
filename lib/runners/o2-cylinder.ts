// @ts-nocheck
/**
 * Runner: o2-cylinder
 *
 * Расчёт оставшегося времени работы кислородного баллона:
 *
 *   Время (мин) = (Текущее давление, psi или bar × Cylinder Factor) / Поток (л/мин)
 *
 * Cylinder Factor — табличная константа для каждого размера баллона
 * (US standard: D, E, M, H/K). EU/ISO баллоны измеряют объём в литрах
 * газа при атмосферном давлении и считают по другой формуле:
 *
 *   Время (мин) = Объём баллона при STP (л) × (текущее давление / номинальное) / поток
 *
 * Этот калькулятор поддерживает оба подхода.
 */

import type { CalculatorTool } from '../tools-runners';

// US-стандарт (NFPA / CGA): cylinder factor = объём газа на 1 psi.
// Таблица из CGA P-7 (Compressed Gas Association). Полное давление баллона ~2000 psi.
const US_CYLINDERS = {
  d:  { factor: 0.16, label: 'D (~425 л при 2000 psi, портативный)' },
  e:  { factor: 0.28, label: 'E (~680 л при 2000 psi, переносной)' },
  m:  { factor: 1.56, label: 'M (~3450 л при 2200 psi, стационарный)' },
  h:  { factor: 3.14, label: 'H / K (~6900 л при 2200 psi, стационарный)' },
};

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'unit_system', hint: 'US: D/E/M/H по psi. EU/ISO: объём в литрах + bar.', label: 'Система', type: 'select', options: [
      { value: 'us',  label: 'US (psi, D/E/M/H)' },
      { value: 'eu',  label: 'EU / ISO (литры × bar)' },
    ]},
    // US-ветка
    { id: 'cylinder', hint: 'D — 425 л; E — 680 л; M — 3450 л; H — 6900 л.', label: 'Размер баллона (US)', type: 'select', options: [
      { value: 'd', label: 'D — 425 л' },
      { value: 'e', label: 'E — 680 л (наиболее частый портативный)' },
      { value: 'm', label: 'M — 3450 л' },
      { value: 'h', label: 'H / K — 6900 л' },
    ]},
    { id: 'pressure_psi', hint: 'Текущее давление в psi (полный ~2000–2200)', label: 'Давление (psi)', type: 'number', unit: 'psi', min: 100, max: 2500, quickValues: [500, 1000, 1500, 2000] },
    // EU-ветка
    { id: 'volume_l', hint: 'Номинальный объём баллона в литрах при STP (типично 2 / 5 / 10 / 40)', label: 'Объём баллона (EU)', type: 'number', unit: 'л', min: 1, max: 200, quickValues: [2, 5, 10, 40] },
    { id: 'pressure_bar', hint: 'Текущее давление в bar (полный 200)', label: 'Давление (bar)', type: 'number', unit: 'bar', min: 10, max: 250, quickValues: [50, 100, 150, 200] },
    { id: 'nominal_bar', hint: 'Номинальное давление полного баллона; обычно 200 bar', label: 'Номинальное давление (EU)', type: 'number', unit: 'bar', min: 100, max: 300, quickValues: [150, 200, 230] },
    // Общий поток
    { id: 'flow', hint: 'Назначенная скорость потока', label: 'Поток O₂', type: 'number', unit: 'л/мин', min: 0.5, max: 30, quickValues: [2, 4, 6, 10, 15] },
    { id: 'safety', hint: 'Резерв перед заменой; обычно 200 psi (US) или 20 bar (EU)', label: 'Резерв', type: 'select', options: [
      { value: 'yes', label: 'Учесть резерв (200 psi / 20 bar)' },
      { value: 'no',  label: 'Без резерва (полное опустошение)' },
    ]},
  ],
  compute: (v) => {
    const system   = String(v.unit_system || 'us');
    const flow     = Number(v.flow) || 0;
    const safety   = String(v.safety || 'yes') === 'yes';

    let totalLiters = 0;          // оставшийся газ при STP, л
    let detailLine = '';

    if (system === 'us') {
      const cylKey = String(v.cylinder || 'e');
      const cyl = US_CYLINDERS[cylKey]!;
      const psi = Math.max(0, (Number(v.pressure_psi) || 0) - (safety ? 200 : 0));
      totalLiters = psi * (cyl?.factor ?? US_CYLINDERS.e.factor);
      detailLine = `Баллон: ${cyl?.label}. Доступное давление: ${psi} psi (резерв ${safety ? '200 psi учтён' : 'не учтён'}).
Cylinder factor = ${cyl?.factor} л/psi → ${totalLiters.toFixed(0)} л газа доступно.`;
    } else {
      const volL    = Number(v.volume_l)     || 0;
      const barCur  = Math.max(0, (Number(v.pressure_bar) || 0) - (safety ? 20 : 0));
      const barNom  = Number(v.nominal_bar)  || 200;
      // Объём при STP = объём баллона × (давление / номинал)
      totalLiters = barNom > 0 ? volL * (barCur / barNom) * (barNom / 1.0) : 0;
      // Упрощённо: газ = объём × давление (бар≈атм отношение)
      totalLiters = volL * barCur;
      detailLine = `Баллон: ${volL} л @ ${barNom} bar (полный — ${(volL * barNom).toFixed(0)} л газа).
Доступное давление: ${barCur} bar (резерв ${safety ? '20 bar учтён' : 'не учтён'}).
Доступно газа: ${totalLiters.toFixed(0)} л.`;
    }

    const minutes = flow > 0 ? totalLiters / flow : 0;
    const hours   = Math.floor(minutes / 60);
    const mins    = Math.round(minutes - hours * 60);
    const human   = hours > 0 ? `${hours} ч ${mins} мин` : `${Math.round(minutes)} мин`;

    let interpretation = 'Достаточный запас';
    let color = '#22C55E';
    if (minutes < 15)      { interpretation = 'Критически мало — заменить сейчас'; color = '#EF4444'; }
    else if (minutes < 30) { interpretation = 'Скоро потребуется замена';            color = '#F59E0B'; }

    return {
      value: human,
      unit: '',
      interpretation,
      color,
      details: `${detailLine}
Поток: ${flow} л/мин → расчётное время ${minutes.toFixed(0)} мин (≈ ${human}).`,
      actions: [
        minutes < 30 ? 'Подготовьте резервный баллон или подключение к стационарной системе.' : null,
        minutes < 15 ? 'Замените баллон ПРЯМО СЕЙЧАС. Не транспортируйте на остатке < 200 psi / 20 bar.' : null,
        flow >= 15  ? 'При высоком потоке (≥ 15 л/мин) рассмотрите перевод на стационарный концентратор / централизованную систему.' : null,
        'Регулярно проверяйте манометр; учитывайте резерв на транспортировку.',
        'Маска Вентури / NIV меняют эффективный FiO₂ при том же потоке — не применяйте формулу для расчёта O₂-баланса в потоке через NIV/HFNC.',
      ].filter(Boolean),
      caveats: [
        'Расчёт справедлив для свободного потока через назальные канюли / простую маску. Для НИВ / HFNC поток не равен потреблению газа из баллона.',
        'US Cylinder Factor валидирован для NFPA / CGA-стандарта. Для других производителей сверяйте с этикеткой / паспортом баллона.',
        'EU/ISO формула предполагает идеальный газ; реальный объём при низком давлении может быть на 5–10 % ниже.',
        'Резерв 200 psi / 20 bar — стандартное правило безопасности для транспортировки; не используйте баллон ниже резерва без замены.',
        'У жидкого медицинского кислорода (Liquid O₂ — LOX) расчёт другой: 1 л LOX ≈ 860 л газообразного.',
        'При высоких потоках > 15 л/мин — проверяйте редуктор и шланги на герметичность; реальный расход может превышать установленный.',
      ],
      relatedCourses: [
        { id: '301.5', title: 'Пульмонология / Оксигенотерапия' },
        { id: '306.1', title: 'ICU — респираторная поддержка' },
      ],
      related: [
        { id: 'gli',         title: 'Спирометрия GLI' },
        { id: 'aa-gradient', title: 'A-a градиент' },
        { id: 'pf-ratio',    title: 'P/F (PaO₂ / FiO₂)' },
      ],
    };
  },
  reference: 'NFPA 99 Health Care Facilities Code. Compressed Gas Association P-7. Cylinder factors: D=0.16, E=0.28, M=1.56, H/K=3.14 л/psi.',
  countries: 'Международный (US: D/E/M/H по psi; EU/ISO: л × bar)',
  presets: [
    { label: 'E-баллон, 1500 psi, 4 л/мин',  values: { unit_system: 'us', cylinder: 'e', pressure_psi: 1500, flow: 4,  safety: 'yes' } },
    { label: 'E-баллон, 800 psi, 6 л/мин',   values: { unit_system: 'us', cylinder: 'e', pressure_psi: 800,  flow: 6,  safety: 'yes' } },
    { label: 'EU 5 л @ 150 bar, 2 л/мин',     values: { unit_system: 'eu', volume_l: 5,   pressure_bar: 150, nominal_bar: 200, flow: 2, safety: 'yes' } },
    { label: 'EU 10 л @ 100 bar, 15 л/мин',   values: { unit_system: 'eu', volume_l: 10,  pressure_bar: 100, nominal_bar: 200, flow: 15, safety: 'yes' } },
  ],
  info: `### Для чего используется
Расчёт **оставшегося времени работы кислородного баллона** при заданном потоке. Критичен для:
- Транспортировки пациента (МСЧ, СМП, межбольничные перевозки)
- ICU при отказе централизованной системы
- Домашней оксигенотерапии (LTOT)
- Тактической медицины (TCCC, военно-полевые сценарии)

### Формула (US-стандарт, NFPA 99 / CGA P-7)
\`Время (мин) = (Давление, psi − Резерв) × Cylinder Factor / Поток (л/мин)\`

| Баллон | Cylinder Factor | Объём при 2000 psi |
|---|---|---|
| **D** | 0.16 л/psi | ~425 л |
| **E** | 0.28 л/psi | ~680 л (наиболее частый переносной) |
| **M** | 1.56 л/psi | ~3450 л |
| **H / K** | 3.14 л/psi | ~6900 л |

### Формула (EU / ISO, литры × bar)
\`Газ (л при STP) ≈ Объём баллона (л) × Давление (bar)\`
\`Время (мин) = Газ / Поток\`

Типовые EU-баллоны: 2 л / 5 л / 10 л / 40 л при 200 bar.

### Резерв безопасности
Стандартное правило: **не использовать баллон ниже 200 psi (US) или 20 bar (EU)**. Это обеспечивает:
- Запас на транспортировку и замену
- Стабильную работу редуктора (низкое давление → нелинейная характеристика)
- Защиту от попадания примесей в баллон

### Пример расчёта
**E-баллон, 1500 psi, поток 4 л/мин, резерв 200 psi:**
- Доступное давление: 1500 − 200 = **1300 psi**
- Газ: 1300 × 0.28 = **364 л**
- Время: 364 / 4 = **91 мин (1 ч 31 мин)**

### Ограничения
- Расчёт **не учитывает** дополнительное потребление NIV / HFNC устройствами (мощные турбины могут потреблять > 60 л/мин при FiO₂ 100 %).
- Только для **газообразного** кислорода. Для **жидкого LOX**: 1 л жидкого = ~860 л газа.
- При очень низких давлениях (< 200 psi) реальный объём может быть ниже расчётного (отклонение от идеального газа).

### Связанные стандарты
| Стандарт | Описание |
|---|---|
| **NFPA 99** | Health Care Facilities Code — медицинские газы в США |
| **CGA P-7** | Compressed Gas Association — параметры баллонов |
| **ISO 32** | Цветовая маркировка медицинских газов |
| **EN 1089** | Маркировка газовых баллонов в Европе |
| **ГОСТ 949** | Российский стандарт баллонов высокого давления |

### Cheat sheet для СМП / транспортировки
| Поток | E-баллон @ 2000 psi | E-баллон @ 1500 psi | E-баллон @ 1000 psi |
|---|---|---|---|
| 2 л/мин | ~252 мин (4ч12) | ~182 мин (3ч02) | ~112 мин (1ч52) |
| 4 л/мин | ~126 мин | ~91 мин | ~56 мин |
| 6 л/мин | ~84 мин | ~60 мин | ~37 мин |
| 10 л/мин | ~50 мин | ~36 мин | ~22 мин |
| 15 л/мин | ~33 мин | ~24 мин | ~14 мин |

(Учитывая резерв 200 psi.)

### Источники
- NFPA 99 Health Care Facilities Code — актуальная редакция
- Compressed Gas Association P-7 (Compressed Gas Cylinders Standards)
- ATS Patient Education: Home Oxygen Therapy
- BTS Guideline for Oxygen Use in Healthcare 2017 (update 2023)`,
};

export default runner;

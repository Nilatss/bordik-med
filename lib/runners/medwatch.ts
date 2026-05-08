/** Runner: medwatch - FDA MedWatch 3500 reporting */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'severity',
      label: 'Серьёзность нежелательной реакции',
      type: 'select',
      options: [
        { value: 'nonSerious', label: 'Несерьёзная (лёгкая)' },
        { value: 'serious', label: 'Серьёзная (SAE — см. критерии)' },
      ],
    },
    {
      id: 'outcome',
      label: 'Исход',
      type: 'select',
      options: [
        { value: 'death', label: 'Смерть' },
        { value: 'threat', label: 'Угроза жизни' },
        { value: 'hosp', label: 'Госпитализация / продление' },
        { value: 'disability', label: 'Стойкая инвалидность' },
        { value: 'congenital', label: 'Врождённая аномалия' },
        { value: 'intervention', label: 'Требовалось вмешательство для предотвращения' },
        { value: 'other', label: 'Иной значимый' },
        { value: 'recovered', label: 'Выздоровление без последствий' },
      ],
    },
    {
      id: 'reporter',
      label: 'Кто подаёт отчёт',
      type: 'select',
      options: [
        { value: 'hcp', label: 'Медработник' },
        { value: 'patient', label: 'Пациент / потребитель' },
        { value: 'manufacturer', label: 'Производитель (обязательно)' },
      ],
    },
    {
      id: 'productType',
      label: 'Тип продукта',
      type: 'select',
      options: [
        { value: 'drug', label: 'Лекарственный препарат / биологический' },
        { value: 'device', label: 'Медицинское изделие' },
        { value: 'supplement', label: 'БАД / косметика' },
        { value: 'vaccine', label: 'Вакцина (используйте VAERS вместо MedWatch!)' },
      ],
    },
  ],
  compute: (v) => {
    const sev = String(v.severity || 'nonSerious');
    const out = String(v.outcome || 'recovered');
    const rep = String(v.reporter || 'hcp');
    const prod = String(v.productType || 'drug');

    const seriousOutcomes = ['death','threat','hosp','disability','congenital','intervention'];
    const isSerious = sev === 'serious' || seriousOutcomes.includes(out);

    let url = 'https://www.accessdata.fda.gov/scripts/medwatch/';
    let formCode = 'FDA 3500 (добровольный)';
    if (rep === 'manufacturer') formCode = 'FDA 3500A (обязательный, 15 дней для серьёзных)';
    if (prod === 'vaccine') { url = 'https://vaers.hhs.gov/'; formCode = 'VAERS (вакцины)'; }
    if (prod === 'device' && rep === 'manufacturer') formCode = 'FDA 3500A — Medical Device Reporting (MDR)';

    let color = '#22C55E', band = 'Несерьёзная — добровольный отчёт';
    if (isSerious) { color = '#EF4444'; band = 'СЕРЬЁЗНАЯ — рекомендуется отчёт'; }
    if (out === 'death') { color = '#991B1B'; band = 'ЛЕТАЛЬНЫЙ ИСХОД — срочный отчёт'; }

    const timeline = rep === 'manufacturer' && isSerious ? '15 календарных дней' : 'Как можно скорее (добровольно)';

    return {
      value: formCode,
      unit: 'форма',
      interpretation: band,
      color,
      details: `Тип отчёта: ${formCode}.\nСрок подачи: ${timeline}.\nКто подаёт: ${rep === 'hcp' ? 'медработник' : rep === 'patient' ? 'пациент/потребитель' : 'производитель (обязательно)'}.\nURL: ${url}`,
      actions: [
        `Перейти на ${url} и заполнить форму онлайн (предпочтительно)`,
        'Альтернатива: FDA 3500 PDF → факс 1-800-FDA-0178',
        'Указать: описание события, временные рамки, лот/серия, сопутствующие препараты, исходы',
        isSerious ? 'Сохранить медицинскую документацию минимум 2 года' : '',
        rep === 'manufacturer' ? 'Ввести данные в safety database; отправить через Safety Reporting Portal (FDA-ESG)' : '',
        prod === 'vaccine' ? 'Использовать VAERS (https://vaers.hhs.gov) вместо MedWatch' : '',
        'В РФ — параллельно уведомить Росздравнадзор (АИС Фармаконадзор)',
        'Документировать в ЭМК пациента (аллергия / непереносимость, структурированно)',
      ].filter(Boolean),
      caveats: [
        'MedWatch — система FDA для постмаркетингового фармаконадзора',
        'FDA 3500 — добровольно для медработников/пациентов; FDA 3500A — обязательно для производителей',
        'Вакцины → VAERS (HHS/CDC), не MedWatch',
        'Медицинские изделия → MDR (Medical Device Reporting)',
        'В ЕС — EudraVigilance; в РФ — Росздравнадзор АИС',
        'Анонимность пациента защищена (HIPAA)',
      ],
      related: [
        { id: 'naranjo', title: 'Naranjo' },
        { id: 'pcne', title: 'PCNE DRP' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '308.1', title: 'Клиническая фармакология' },
      ],
    };
  },
  reference: 'U.S. FDA. MedWatch: The FDA Safety Information and Adverse Event Reporting Program. Form FDA 3500 / 3500A. https://www.fda.gov/safety/medwatch',
  countries: 'США (FDA)',
  presets: [
    { label: 'Медработник, SAE, смерть', values: { severity: 'serious', outcome: 'death', reporter: 'hcp', productType: 'drug' } },
    { label: 'Пациент, лёгкая сыпь', values: { severity: 'nonSerious', outcome: 'recovered', reporter: 'patient', productType: 'drug' } },
    { label: 'Производитель, SAE, госп.', values: { severity: 'serious', outcome: 'hosp', reporter: 'manufacturer', productType: 'drug' } },
  ],
  info: `### Для чего используется
**FDA MedWatch** — программа постмаркетингового **репортинга нежелательных событий и проблем с продуктами**, регулируемыми FDA (лекарства, биологические, изделия, БАД, косметика).

### Формы
| Форма | Для кого | Срок |
|---|---|---|
| FDA 3500 | Медработники, пациенты (добровольно) | Как можно скорее |
| FDA 3500A | Производители (обязательно) | 15 дней для SAE |
| FDA 3500B | Потребители (упрощённая) | — |
| VAERS | Вакцины (CDC/HHS) | Отдельная система |

### Серьёзная реакция (SAE) — любая из:
- Смерть
- Угроза жизни
- Госпитализация или её продление
- Стойкая инвалидность
- Врождённая аномалия
- Требовала вмешательства для предотвращения вреда

### Что включать в отчёт
- Описание события и временные рамки
- Препарат: МНН + торговое название + лот/серия + доза
- Сопутствующие препараты
- Исход и принятые меры
- Контактные данные репортёра (анонимность пациента защищена)

### Международные эквиваленты
- **EU:** EudraVigilance (EMA)
- **РФ:** Росздравнадзор АИС Фармаконадзор
- **Global:** WHO VigiBase (UMC, Uppsala)
- **CIOMS Form I** — универсальный стандарт для производителей

### Применение
- Любая подозрительная ADR
- Product quality problems (загрязнение, маркировка)
- Medication errors
- Отказы / недостаточная эффективность

### Источник
FDA MedWatch Program. https://www.fda.gov/safety/medwatch`,
};

export default runner;

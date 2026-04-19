// @ts-nocheck
/** Runner: trali — TRALI / TACO (ISBT 2019) differential diagnosis */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'type',
      label: 'Предполагаемый тип реакции',
      type: 'select',
      options: [
        { value: 'trali1', label: 'TRALI I (без факторов риска ARDS)' },
        { value: 'trali2', label: 'TRALI II (с факторами риска ARDS)' },
        { value: 'taco', label: 'TACO (перегрузка объёмом)' },
        { value: 'ambig', label: 'Неопределённая / TRALI/TACO-mixed' },
      ],
    },
    { id: 'hypoxemia', label: 'Гипоксемия в течение 6 часов после трансфузии (PaO₂/FiO₂ ≤300 или SpO₂ <90% на воздухе)', type: 'checkbox' },
    { id: 'bilatOpacities', label: 'Двусторонние инфильтраты на рентгене/КТ', type: 'checkbox' },
    { id: 'noLAH', label: 'Нет признаков повышения давления в левом предсердии (BNP, эхо, клиника)', type: 'checkbox' },
    { id: 'ardsRisk', label: 'Имеются факторы риска ARDS (сепсис, аспирация, пневмония, шок, травма)', type: 'checkbox' },
    { id: 'volumeOverload', label: 'Признаки объёмной перегрузки (↑BNP, ↑ЦВД, отёки, положительный баланс)', type: 'checkbox' },
  ],
  compute: (v) => {
    const hypox = Boolean(v.hypoxemia);
    const bilat = Boolean(v.bilatOpacities);
    const noLAH = Boolean(v.noLAH);
    const ardsRisk = Boolean(v.ardsRisk);
    const overload = Boolean(v.volumeOverload);
    const type = String(v.type || 'ambig');

    let interpretation = '', details = '', color = '#F59E0B';
    const actions: string[] = [];

    const traliCore = hypox && bilat && noLAH;

    if (type === 'taco' || (overload && !ardsRisk)) {
      interpretation = 'TACO — циркуляторная перегрузка';
      color = '#3B82F6';
      details = 'Transfusion-Associated Circulatory Overload: острая дыхательная недостаточность в течение 6–12 ч с признаками объёмной перегрузки (↑BNP/NT-proBNP, ↑ЦВД, левожелудочковая недостаточность, положительный гидробаланс). ISBT 2018 критерии: острый респираторный дистресс + ≥1 признак перегрузки.';
      actions.push('Диуретики (фуросемид 40–80 мг в/в)', 'Приподнять головной конец, O₂ / NIV', 'Остановить/замедлить текущую трансфузию', 'Эхо-КГ для оценки фракции выброса', 'Отчёт в службу крови');
    } else if (type === 'trali1' && traliCore && !ardsRisk) {
      interpretation = 'TRALI I (по ISBT 2019)';
      color = '#EF4444';
      details = 'Transfusion-Related Acute Lung Injury типа I: острая гипоксемия + двусторонние инфильтраты в течение 6 ч после трансфузии, нет признаков LAH, нет сопутствующих факторов риска ARDS. Чаще всего обусловлен анти-HLA/анти-HNA антителами донора.';
      actions.push('Прекратить трансфузию немедленно', 'Поддержка: O₂, при необходимости ИВЛ с Vt 6 мл/кг IBW', 'НЕ применять диуретики (гиповолемия усугубит гипоксию)', 'Уведомить службу крови — карантин донора', 'Поддерживающая терапия, обычно разрешается за 24–72 ч');
    } else if (type === 'trali2' || (traliCore && ardsRisk)) {
      interpretation = 'TRALI II (по ISBT 2019)';
      color = '#DC2626';
      details = 'TRALI тип II: те же респираторные критерии, но у пациента с уже существующими факторами риска ARDS (сепсис, шок, пневмония, аспирация). Отличие от ARDS — чёткая временная связь с трансфузией в пределах 6 ч и ухудшение P/F.';
      actions.push('Прекратить трансфузию', 'ИВЛ по протоколу ARDSnet (Vt 6 мл/кг IBW, Pplat ≤30)', 'Лечение основной причины (сепсис-bundle, антибиотики)', 'Отчёт в гемотрансфузионную службу', 'Консервативная инфузия при стабилизации (FACTT)');
    } else {
      interpretation = 'Неопределённая реакция — TRALI/TACO overlap';
      color = '#F59E0B';
      details = 'При неоднозначной картине (например, оба механизма) — консультация гематотрансфузиолога, повторный забор BNP/NT-proBNP, эхо-КГ, диагностическая пауза. Документировать как TAD (transfusion-associated dyspnoea) до уточнения.';
      actions.push('Остановить трансфузию', 'BNP, эхо-КГ, рентген повторно', 'Уведомить службу крови', 'Мониторинг в ICU', 'Симптоматическая терапия');
    }

    return {
      value: interpretation,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Окно для TRALI — строго 6 часов после окончания трансфузии',
        'TACO чаще у пожилых, детей, с СН/ХБП, при быстрой инфузии',
        'BNP/NT-proBNP до и после трансфузии — лучший дифференциал',
        'Об обеих реакциях обязательно информировать службу крови',
      ],
      related: [
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'murray', title: 'Murray lung injury' },
        { id: 'mtp', title: 'Massive transfusion protocol' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  reference: 'Vlaar APJ et al. Transfusion 2019 (ISBT consensus TRALI); ISBT 2018 TACO criteria.',
  countries: 'Международный (ISBT)',
  presets: [
    { label: 'Классический TRALI I', values: { type: 'trali1', hypoxemia: true, bilatOpacities: true, noLAH: true, ardsRisk: false, volumeOverload: false } },
    { label: 'TRALI II при сепсисе', values: { type: 'trali2', hypoxemia: true, bilatOpacities: true, noLAH: true, ardsRisk: true, volumeOverload: false } },
    { label: 'TACO у пожилого', values: { type: 'taco', hypoxemia: true, bilatOpacities: true, noLAH: false, ardsRisk: false, volumeOverload: true } },
  ],
  caveats: [
    'TRALI — клинико-радиологический диагноз; специфических биомаркеров нет',
    'Анти-HLA/HNA антитела донора — подтверждающий, не обязательный критерий',
  ],
  info: `### Для чего используется
Дифференциальная диагностика двух основных лёгочных реакций на трансфузию: **TRALI** (иммунный механизм) и **TACO** (циркуляторная перегрузка), по консенсусу ISBT 2019.

### TRALI (ISBT 2019)
**Тип I** — нет факторов риска ARDS. **Тип II** — на фоне факторов риска ARDS, но новая гипоксия с трансфузией.
Критерии: острая гипоксемия (P/F ≤300 или SpO₂ <90% на комнатном воздухе), двусторонние инфильтраты, отсутствие признаков перегрузки ЛП, развитие ≤6 ч.

### TACO (ISBT 2018)
Острая или ухудшение респираторной функции в течение 6–12 ч + ≥1 из: признаки кардиогенного отёка лёгких, ↑BNP/NT-proBNP, ↑ЦВД/PCWP, положительный гидробаланс.

### Ключевое отличие
| Параметр | TRALI | TACO |
|---|---|---|
| BNP | норма | ↑↑ |
| ЦВД | норма / ↓ | ↑ |
| Ответ на диуретики | нет / хуже | да |
| Фракция выброса | сохранена | снижена / диастол. дисфункция |
| Гидробаланс | любой | положительный |

### Тактика
TRALI — поддержка + НЕ диурезить. TACO — диуретики + снизить скорость инфузии.`,
};

export default runner;

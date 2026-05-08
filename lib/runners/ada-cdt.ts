/** Runner: ada-cdt - ADA CDT procedure codes reference */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'category', label: 'Категория CDT', type: 'select', options: [
      { value: 'D0', label: 'D0xxx - Диагностические (осмотр, рентген)' },
      { value: 'D1', label: 'D1xxx - Профилактические (чистка, фторирование, герметики)' },
      { value: 'D2', label: 'D2xxx - Реставрационные (пломбы, коронки)' },
      { value: 'D3', label: 'D3xxx - Эндодонтия' },
      { value: 'D4', label: 'D4xxx - Пародонтология' },
      { value: 'D5', label: 'D5xxx - Протезирование (съёмное)' },
      { value: 'D6', label: 'D6xxx - Имплантология + фикс. протезы' },
      { value: 'D7', label: 'D7xxx - Хирургия' },
      { value: 'D8', label: 'D8xxx - Ортодонтия' },
      { value: 'D9', label: 'D9xxx - Adjunctive (седация, отбеливание)' },
    ] },
  ],
  compute: (v) => {
    const cat = String(v.category);

    const map: Record<string, { title: string; examples: string[] }> = {
      D0: { title: 'Диагностические',
        examples: ['D0120 - Периодический осмотр', 'D0150 - Первичный осмотр', 'D0210 - Полный набор снимков', 'D0220 - Интраорально перипикальный', 'D0330 - Панорама'] },
      D1: { title: 'Профилактические',
        examples: ['D1110 - Профгигиена взрослая', 'D1120 - Детская', 'D1206 - Фтор-лак', 'D1351 - Герметик', 'D1510 - Space maintainer'] },
      D2: { title: 'Реставрационные',
        examples: ['D2140 - Амальгама 1 поверхность', 'D2391 - Композит передний 1 пов.', 'D2740 - Коронка керамическая', 'D2950 - Culturial build-up', 'D2980 - Ремонт коронки'] },
      D3: { title: 'Эндодонтия',
        examples: ['D3310 - Эндо 1 канал (переднего)', 'D3320 - Двухканальный (премоляр)', 'D3330 - Трёхканальный (моляр)', 'D3346 - Ретроградная эндодонтия', 'D3410 - Апикоэктомия'] },
      D4: { title: 'Пародонтология',
        examples: ['D4341 - Scaling/root planing 4+ зубов квадранта', 'D4342 - SRP 1-3 зуба', 'D4210 - Гингивэктомия', 'D4240 - Лоскутная операция', 'D4910 - Поддерживающая пародонтология'] },
      D5: { title: 'Съёмное протезирование',
        examples: ['D5110 - Съёмный полный верхний', 'D5120 - Нижний полный', 'D5213 - Частичный акриловый', 'D5410 - Relining полного протеза', 'D5510 - Ремонт протеза'] },
      D6: { title: 'Имплантология',
        examples: ['D6010 - Установка импланта', 'D6056 - Prefab абатмент', 'D6058 - Абатмент-supported керамическая коронка', 'D6240 - Мостовидный протез на импланте', 'D6930 - Recement'] },
      D7: { title: 'Хирургия',
        examples: ['D7140 - Простое удаление', 'D7210 - Хирургич. удаление эрупт. зуба', 'D7220 - Удаление soft-tissue impacted', 'D7240 - Complete bony impaction', 'D7510 - Incision и drainage абсцесса'] },
      D8: { title: 'Ортодонтия',
        examples: ['D8070 - Comprehensive ortho дети', 'D8080 - Ortho подростки', 'D8090 - Ortho взрослые', 'D8670 - Visits periodically', 'D8680 - Retainer'] },
      D9: { title: 'Adjunctive',
        examples: ['D9110 - Паллиативная помощь неотложная', 'D9222 - Общий наркоз 1-й час', 'D9230 - N2O/O2', 'D9310 - Консультация', 'D9972 - Вnешнее отбеливание'] },
    };

    const m = map[cat]!;
    return {
      value: m.title, unit: '',
      interpretation: `Примеры ${cat}xxx кодов`,
      color: '#6B7280',
      details: m.title + ' коды CDT 2024.',
      actions: m.examples,
      caveats: [
        'CDT обновляется ежегодно (ADA, октябрь)',
        'Используется в США для страхования (Delta Dental, MetLife, и др.)',
        'Международный аналог: ICHI (WHO), SNOMED-CT Dental',
        'РФ - Приказ МЗ №1664н + МКБ-10 (K00-K14 для стоматологических)',
      ],
      related: [{ id: 'icd10-da', title: 'ICD-10 Dental' }],
      relatedCourses: [{ id: '313.8', title: 'Документация / кодирование' }],
    };
  },
  reference: 'American Dental Association. CDT 2024: Current Dental Terminology. ADA 2023.',
  countries: 'США (ADA)',
  presets: [
    { label: 'D0 Диагностика', values: { category: 'D0' } },
    { label: 'D3 Эндодонтия', values: { category: 'D3' } },
    { label: 'D6 Имплантология', values: { category: 'D6' } },
  ],
  info: `### Для чего используется
CDT (Current Dental Terminology) - стандартные процедурные коды ADA для стоматологии в США. Используются в страховых требованиях, документации.

### Структура
| Категория | Диапазон | Описание |
|---|---|---|
| D0xxx | Диагностические | Осмотр, рентгенография |
| D1xxx | Профилактические | Чистка, фтор, герметики |
| D2xxx | Реставрационные | Пломбы, коронки |
| D3xxx | Эндодонтия | Лечение каналов |
| D4xxx | Пародонтология | SRP, хирургия |
| D5xxx | Съёмное | Протезы |
| D6xxx | Имплантология / фикс. | Импланты, мосты |
| D7xxx | Хирургия | Удаления, апикоэктомия |
| D8xxx | Ортодонтия | Брекеты, ретейнеры |
| D9xxx | Adjunctive | Седация, отбеливание |

### Обновления
CDT обновляется ежегодно, вступает в силу 1 января.

### Источник
ADA. CDT 2024. ADA 2023. В РФ - Приказ МЗ №1664н (стандарты медпомощи стоматология).`,
};

export default runner;

// @ts-nocheck
/** Runner: nolla - Nolla stages of tooth development */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'stage', label: 'Стадия Nolla', type: 'select', options: [
      { value: '0', label: '0 - крипта отсутствует' },
      { value: '1', label: '1 - наличие крипты' },
      { value: '2', label: '2 - начальная кальцификация' },
      { value: '3', label: '3 - 1/3 коронки сформирована' },
      { value: '4', label: '4 - 2/3 коронки' },
      { value: '5', label: '5 - почти полная коронка' },
      { value: '6', label: '6 - полностью сформированная коронка' },
      { value: '7', label: '7 - 1/3 корня' },
      { value: '8', label: '8 - 2/3 корня' },
      { value: '9', label: '9 - почти полный корень, открытая верхушка' },
      { value: '10', label: '10 - закрытая верхушка (полностью сформирован)' },
    ] },
    { id: 'tooth', label: 'Зуб', type: 'select', options: [
      { value: '1', label: 'Центральный резец' },
      { value: '2', label: 'Боковой резец' },
      { value: '3', label: 'Клык' },
      { value: '4', label: 'Первый премоляр' },
      { value: '5', label: 'Второй премоляр' },
      { value: '6', label: 'Первый моляр' },
      { value: '7', label: 'Второй моляр' },
      { value: '8', label: 'Третий моляр' },
    ] },
  ],
  compute: (v) => {
    const stage = Number(v.stage);
    const tooth = v.tooth;

    // Примерный возраст по Nolla (мальчики постоянные зубы)
    const ageMap = {
      1: { 3: 3, 5: 6, 6: 7, 7: 8, 8: 9, 10: 10 }, // центральный резец
      2: { 3: 4, 5: 7, 6: 8, 7: 9, 8: 10, 10: 11 },
      3: { 3: 4, 5: 9, 6: 10, 7: 11, 8: 12, 10: 13 },
      4: { 3: 5, 5: 8, 6: 9, 7: 10, 8: 11, 10: 12 },
      5: { 3: 5, 5: 9, 6: 10, 7: 11, 8: 12, 10: 13 },
      6: { 3: 1, 5: 4, 6: 5, 7: 7, 8: 8, 10: 10 },
      7: { 3: 5, 5: 10, 6: 11, 7: 12, 8: 13, 10: 15 },
      8: { 3: 12, 5: 15, 6: 16, 7: 17, 8: 18, 10: 21 },
    };

    const estimatedAge = ageMap[tooth]?.[stage] ?? null;
    const bands = {
      0: 'Крипта отсутствует',
      1: 'Крипта',
      2: 'Начальная кальцификация',
      3: '1/3 коронки',
      4: '2/3 коронки',
      5: 'Почти полная коронка',
      6: 'Полная коронка',
      7: '1/3 корня',
      8: '2/3 корня',
      9: 'Почти полный корень',
      10: 'Зрелый зуб',
    };

    let color = '#6B7280';
    if (stage <= 2) color = '#EF4444';
    else if (stage <= 5) color = '#F59E0B';
    else if (stage <= 8) color = '#84CC16';
    else color = '#22C55E';

    return {
      value: String(stage) + '/10', unit: 'Nolla',
      interpretation: bands[stage], color,
      details: `Стадия Nolla ${stage}${estimatedAge ? `, ориентировочный возраст: ~${estimatedAge} лет` : ''}. ${bands[stage]}.`,
      actions: [
        'Оценка по контралатеральному зубу для асимметрии',
        'Корреляция с клинической стадией прорезывания',
        stage < 7 ? 'При эндодонтии учесть открытую верхушку' : 'Верхушка закрыта - стандартная эндодонтия',
      ],
      caveats: [
        'Nolla 1960 - для постоянных зубов; временные зубы - Liliequist/Lunt',
        'Половые различия: девочки ~ 6 мес впереди мальчиков',
        'Альтернативы: Demirjian, Haavikko, Moorrees-Fanning-Hunt (dental age estimation)',
        'Использовать 7+ зубов для оценки зубного возраста (forensic odontology)',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Ранняя', color: '#EF4444' },
          { min: 3, max: 5, label: 'Коронка', color: '#F59E0B' },
          { min: 6, max: 8, label: 'Корень', color: '#84CC16' },
          { min: 9, max: 10, label: 'Зрелый', color: '#22C55E' },
        ],
        current: stage,
        unit: 'Nolla',
      },
      related: [{ id: 'frankl', title: 'Frankl behavior' }],
      relatedCourses: [{ id: '313.4', title: 'Детская стоматология' }, { id: '313.5', title: 'Судебная стоматология' }],
    };
  },
  reference: 'Nolla CM. The development of the permanent teeth. J Dent Child 1960;27:254.',
  countries: 'Международный',
  presets: [
    { label: '1-й моляр на 6 лет', values: { stage: '6', tooth: '6' } },
    { label: 'Центр. резец 9 лет', values: { stage: '9', tooth: '1' } },
  ],
  info: `### Для чего используется
Nolla - классификация стадий развития постоянного зуба (0-10) по рентгенограммам. Используется в детской стоматологии и судебной (forensic) оценке возраста.

### Стадии 0-10
Ключевые переходы:
- Stage 6 - полная коронка
- Stage 9 - почти полный корень, открытая верхушка
- Stage 10 - закрытая верхушка (зрелый зуб)

### Альтернативы
- **Demirjian** (1973) - 8 стадий, наиболее популярный для forensic
- **Haavikko** (1970) - финские референсы

### Источник
Nolla CM. J Dent Child 1960;27:254.`,
};

export default runner;

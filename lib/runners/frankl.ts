/** Runner: frankl - Frankl Behavior Rating Scale (pediatric dentistry) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'rating', label: 'Поведение ребёнка', type: 'select', options: [
      { value: '1', label: '1 (--) Определённо негативное - отказ от лечения, крик, паника' },
      { value: '2', label: '2 (-) Негативное - неохотное принятие, минимальное сотрудничество' },
      { value: '3', label: '3 (+) Позитивное - принимает лечение с резервом' },
      { value: '4', label: '4 (++) Определённо позитивное - отличное сотрудничество, интерес' },
    ] },
  ],
  compute: (v) => {
    const r = Number(v.rating);
    const map = {
      1: { band: '1 (--) Определ. негативное', color: '#7F1D1D',
           details: 'Отказ от лечения, крик, выраженный страх, физическое сопротивление.',
           actions: ['Остановить процедуру', 'Техники десенсибилизации, поведенческая терапия', 'Рассмотреть седацию N₂O или медикаментозную седацию', 'Общий наркоз при экстренных случаях', 'Консультация детского психолога'] },
      2: { band: '2 (-) Негативное', color: '#EF4444',
           details: 'Неохотное принятие, минимальное сотрудничество, могут быть слёзы.',
           actions: ['Tell-Show-Do техника', 'Позитивное подкрепление', 'Короткие визиты (tell-show-do)', 'Рассмотреть N₂O при стойкой тревоге'] },
      3: { band: '3 (+) Позитивное', color: '#84CC16',
           details: 'Принимает лечение с резервом, следует инструкциям.',
           actions: ['Стандартная техника поведенческого управления', 'Похвала, поощрение', 'Регулярные визиты для поддержания сотрудничества'] },
      4: { band: '4 (++) Опред. позитивное', color: '#22C55E',
           details: 'Отличное сотрудничество, интерес к процедуре, хороший раппорт.',
           actions: ['Любые процедуры по показаниям', 'Поощрение, возвращать к профилактическим визитам'] },
    }[r];

    return {
      value: String(r), unit: '/ 4',
      interpretation: map?.band ?? '', color: map?.color ?? '#6B7280',
      details: map?.details ?? '', actions: map?.actions ?? [],
      caveats: [
        'Frankl - субъективная шкала, оценка врача',
        'Поведение может меняться между визитами',
        'В младшем возрасте (< 3 лет) - ограниченная применимость',
        'Альтернативы: Houpt, Venham, OSUBRS',
      ],
      scale: {
        segments: [
          { min: 1, max: 1, label: '1 (--)', color: '#7F1D1D' },
          { min: 2, max: 2, label: '2 (-)', color: '#EF4444' },
          { min: 3, max: 3, label: '3 (+)', color: '#84CC16' },
          { min: 4, max: 4, label: '4 (++)', color: '#22C55E' },
        ],
        current: r,
        unit: 'Frankl',
      },
      related: [{ id: 'nolla', title: 'Nolla стадии' }],
      relatedCourses: [{ id: '313.4', title: 'Детская стоматология' }],
    };
  },
  reference: 'Frankl SN, Shiere FR, Fogels HR. J Dent Child 1962;29:150.',
  countries: 'Международный',
  presets: [
    { label: 'Определ. негативное', values: { rating: '1' } },
    { label: 'Позитивное', values: { rating: '3' } },
    { label: 'Отличное', values: { rating: '4' } },
  ],
  info: `### Для чего используется
Frankl Behavior Rating Scale - классическая 4-балльная шкала оценки поведения ребёнка на приёме стоматолога.

### Шкала
| Балл | Знак | Поведение |
|---|---|---|
| 1 | -- | Отказ, крик, паника |
| 2 | - | Неохотное принятие |
| 3 | + | Резервированное позитивное |
| 4 | ++ | Отличное сотрудничество |

### Тактика
- 1 (--): остановить, психолог, седация/наркоз при срочности
- 2 (-): Tell-Show-Do, N₂O
- 3 (+): стандартное поведенческое управление
- 4 (++): любые процедуры

### Источник
Frankl SN, Shiere FR, Fogels HR. Should the parent remain with the child in the dental operatory? J Dent Child 1962;29:150.`,
};

export default runner;

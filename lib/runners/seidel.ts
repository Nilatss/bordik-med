/** Runner: seidel - Seidel test for aqueous leak */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'flowPattern', label: 'Паттерн флуоресцеина под кобальтовой лампой', type: 'select', options: [
      { value: 'stream', label: 'Струя тёмного (разведённая влага) — положительный' },
      { value: 'slow', label: 'Медленное разведение — слабо положительный' },
      { value: 'none', label: 'Нет разведения — отрицательный' },
    ] },
    { id: 'context', label: 'Клинический контекст', type: 'select', options: [
      { value: 'trauma', label: 'Проникающая травма' },
      { value: 'postOp', label: 'Ранний п/о период (трабекулэктомия, кератопластика)' },
      { value: 'bleb', label: 'Поздний блебит / фильтрационная подушка' },
      { value: 'ulcer', label: 'Глубокая язва роговицы' },
      { value: 'unknown', label: 'Без явной причины' },
    ] },
    { id: 'shallowAC', label: 'Мелкая передняя камера', type: 'checkbox' },
    { id: 'hypotony', label: 'ВГД < 6 мм рт.ст. (гипотония)', type: 'checkbox' },
  ],
  compute: (v) => {
    const pattern = String(v.flowPattern || 'none');
    const ctx = String(v.context || 'unknown');
    const shallow = !!v.shallowAC;
    const hypotony = !!v.hypotony;

    let band = '', color = '#22C55E', details = '';
    if (pattern === 'stream') {
      band = 'Положительный Seidel';
      color = '#EF4444';
      details = 'Отчётливая струя тёмной (разведённой) водянистой влаги через толстый слой 2% флуоресцеина — подтверждённая перфорация/утечка камерной влаги.';
    } else if (pattern === 'slow') {
      band = 'Слабо положительный';
      color = '#F59E0B';
      details = 'Медленное разведение флуоресцеина — микроперфорация или медленная утечка. Повторить через 5-10 мин, при давлении на глаз (Seidel с провокацией).';
    } else {
      band = 'Отрицательный';
      color = '#22C55E';
      details = 'Флуоресцеин не разводится — интактность глазного яблока. Однако при клинических признаках повторить при разных позициях.';
    }

    if ((shallow || hypotony) && pattern === 'none') {
      band = 'Отриц., но подозрителен';
      color = '#F59E0B';
      details += ' НО мелкая ПК/гипотония — возможна скрытая утечка (permeate через повязку, иное положение). Повторить Seidel.';
    }

    const urgent = pattern === 'stream' || ctx === 'trauma' || (pattern === 'slow' && (shallow || hypotony));

    return {
      value: pattern === 'stream' ? '(+)' : pattern === 'slow' ? '(±)' : '(−)',
      unit: 'Seidel',
      interpretation: band,
      color,
      details,
      actions: [
        urgent ? 'СРОЧНО направить к офтальмохирургу для ревизии/ушивания' : '',
        pattern === 'stream' && ctx === 'trauma' ? 'КТ орбиты без контраста — внутриглазное инородное тело' : '',
        pattern === 'stream' ? 'Защитный щиток (не повязка!), не надавливать на глаз' : '',
        ctx === 'trauma' ? 'Столбнячная профилактика, системные АБ (ципрофлоксацин/моксифлоксацин)' : '',
        pattern !== 'none' ? 'Отменить плановые глазные капли до консультации' : '',
        pattern === 'slow' && !ctx.includes('trauma') ? 'Мягкая контактная линза, аминогликозидная терапия, наблюдение' : '',
        'НПВС и ГКС системно — относительное противопоказание при перфорации (кровотечение)',
      ].filter(Boolean),
      caveats: [
        'Методика: 2% флуоресцеин (толстый слой, не полоска!) + кобальтовый синий свет',
        'Положительный = разведение оранжевого флуоресцеина прозрачной влагой → тёмная струя',
        'Ложно-отриц.: закрытие раны крышкой хрусталика, радужкой, шваборской плёнкой',
        'Провокация: давление через веки / проба Вальсальвы — выявит скрытую утечку',
        'Наиболее значим после трабекулэктомии (bleb leak → эндофтальмит, blebitis)',
        'Seidel положителен ≠ показание к ушиванию: малые утечки можно лечить консервативно (БК-линза, АБ)',
      ],
      related: [{ id: 'iop', title: 'IOP' }, { id: 'schirmer', title: 'Schirmer' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Seidel E. Weitere experimentelle Untersuchungen über die Quelle und den Verlauf der intraokularen Saftströmung. Graefes Arch 1921;104:357. AAO BCSC External Disease and Cornea.',
  countries: 'Международный (AAO)',
  presets: [
    { label: 'Отрицательный', values: { flowPattern: 'none', context: 'unknown', shallowAC: false, hypotony: false } },
    { label: 'Травма, (+)', values: { flowPattern: 'stream', context: 'trauma', shallowAC: true, hypotony: true } },
    { label: 'Bleb leak', values: { flowPattern: 'slow', context: 'bleb', shallowAC: false, hypotony: true } },
  ],
  info: `### Для чего используется
**Тест Зайделя (Seidel, 1921)** — качественная проба для выявления **утечки камерной влаги** через роговичную/склеральную рану или блеб.

### Методика
1. Местная анестезия (proxymetacain / oxybuprocaine)
2. 2% флуоресцеин-полоска, смочить в физрастворе, нанести **толстый слой** на подозрительную зону (НЕ использовать капли 0.25%)
3. Кобальтовая синяя лампа щелевой лампы или Wood's lamp
4. Наблюдать 30-60 сек
5. При сомнении — лёгкое давление на глаз через веко

### Интерпретация
| Результат | Что видно | Значение |
|---|---|---|
| Положительный (+) | Струя тёмной (разведённой) влаги сквозь оранжевый флуоресцеин | Утечка — перфорация |
| Слабо (±) | Медленное разведение | Микроперфорация |
| Отрицательный (−) | Флуоресцеин остаётся однородным | Нет утечки |

### Клинические сценарии
- **Проникающая травма** — обязателен при любом подозрении на открытую травму глаза
- **Пост-трабекулэктомия** — bleb leak → риск blebitis, эндофтальмита
- **После кератопластики** — расхождение швов
- **Глубокая язва роговицы** — угроза descemetocele / перфорации
- **Идиопатическая гипотония**

### Тактика при положительном Seidel
1. Защитный щиток (не повязка — давление вредит)
2. Системные фторхинолоны / цефалоспорины
3. Столбнячная профилактика при травме
4. Отмена местных ГКС, НПВС
5. Срочная консультация офтальмохирурга

### Источник
Seidel 1921. AAO BCSC Section 8 (Cornea).`,
};

export default runner;

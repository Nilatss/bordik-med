/** Runner: velscope - VELscope + oral cancer screening */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'method', label: 'Метод скрининга', type: 'select', options: [
      { value: 'velscope', label: 'VELscope (автофлуоресценция 400-460 нм)' },
      { value: 'toluidine', label: 'Толуидиновый синий (Vizilite)' },
      { value: 'cytology', label: 'Цитология (brush biopsy)' },
      { value: 'coe', label: 'Клинический осмотр полости рта (COE)' },
    ] },
    { id: 'finding', label: 'Результат', type: 'select', options: [
      { value: 'normal', label: 'Норма - равномерная зелёная флуоресценция / отсутствие окраски' },
      { value: 'loss-fluorescence', label: 'Потеря флуоресценции (VELscope) / положительное окрашивание' },
      { value: 'leukoplakia', label: 'Лейкоплакия' },
      { value: 'erythroplakia', label: 'Эритроплакия' },
      { value: 'ulcer-3wk', label: 'Незаживающая язва > 3 нед' },
    ] },
    { id: 'risk', label: 'Факторы риска (курение/алкоголь/HPV)', type: 'checkbox' },
  ],
  compute: (v) => {
    const method = String(v.method);
    const finding = String(v.finding);
    const risk = !!v.risk;

    let band = '', color = '#22C55E', details = '';
    let actions: string[] = [];

    if (finding === 'normal') {
      band = 'Норма';
      details = 'Отсутствие подозрительных изменений.';
      actions = risk
        ? ['Высокий риск - повторный скрининг каждые 6 мес', 'Отказ от курения/алкоголя', 'HPV вакцинация если моложе 45']
        : ['Плановый осмотр 12 мес', 'Самообследование полости рта ежемесячно'];
    } else if (finding === 'erythroplakia' || (finding === 'loss-fluorescence' && risk) || finding === 'ulcer-3wk') {
      band = 'Высокое подозрение';
      color = '#EF4444';
      details = 'Эритроплакия / потеря флуоресценции с факторами риска / хроническая язва - высокий риск малигнизации.';
      actions = [
        'Инцизионная биопсия немедленно (gold standard)',
        'Направление к онкостоматологу / ЧЛХ',
        'Если эритроплакия - 20-30 % риск малигнизации (Silverman)',
        'HPV/p16 тестирование при подозрении на рак ротоглотки',
        'Отказ от курения/алкоголя',
      ];
    } else if (finding === 'leukoplakia') {
      band = 'Лейкоплакия';
      color = '#F59E0B';
      details = 'Лейкоплакия - потенциально злокачественный расстройство (5-17 % малигнизации за 10 лет).';
      actions = [
        'Устранение провокационных факторов 2-4 нед (курение, острый край)',
        'Если не исчезает - биопсия',
        'Observation интервал 3-6 мес',
        'Размер > 2 см, гомогенный vs негомогенный - разный риск',
      ];
    } else if (finding === 'loss-fluorescence') {
      band = 'VELscope+';
      color = '#F59E0B';
      details = 'Потеря флуоресценции - может быть воспалением или дисплазией. Se 67-100 %, Sp 30-80 %.';
      actions = [
        'Клиническая оценка - соответствует ли слизистая (воспаление?)',
        'Повтор через 2-3 нед после устранения раздражителя',
        'Если сохраняется - биопсия',
      ];
    }

    return {
      value: finding, unit: '',
      interpretation: band, color,
      details, actions,
      caveats: [
        'VELscope - скрининг, НЕ диагностика. Биопсия - единственный золотой стандарт',
        'Все стойкие (> 2-3 нед) красные/белые/смешанные пятна - биопсия',
        'Ложно-положительные VELscope: воспаление, травма, меланин',
        'Ранний рак полости рта 5-yr OS 80%+ vs поздний 30-40% - скрининг критичен',
        'Группы высокого риска: ежегодный COE + VELscope/толуидин',
      ],
      related: [{ id: 'tnm-hn', title: 'TNM Head & Neck' }, { id: 'andreasen', title: 'Dental trauma' }],
      relatedCourses: [{ id: '313.7', title: 'Онкостоматология' }],
    };
  },
  reference: 'Lingen MW et al. ADA Expert Panel on Oral Cancer Screening. J Am Dent Assoc 2017;148:712.',
  countries: 'США (ADA) · Международный',
  presets: [
    { label: 'Норма курильщика', values: { method: 'velscope', finding: 'normal', risk: true } },
    { label: 'Эритроплакия', values: { method: 'coe', finding: 'erythroplakia', risk: true } },
  ],
  info: `### Для чего используется
Скрининг рака полости рта. Основа - клинический осмотр (COE) + расширенные методы при подозрении.

### Методы
- **COE** - визуально-тактильный осмотр, Se 60-90 %
- **VELscope** - автофлуоресценция 400-460 нм, Se 100 %, Sp 30-80 %
- **Толуидиновый синий** - окрашивание дисплазии
- **Brush biopsy** - цитология

### Красные флаги (biopsy!)
- Эритроплакия (красное пятно) - 20-30 % малигнизации
- Лейкоплакия (белое, не удаляется) - 5-17 %
- Незаживающая язва > 2-3 нед
- Плотное узелок/индурация
- Персистирующая боль, парестезия

### Группы риска
- Курение ≥ 10 пачко-лет
- Злоупотребление алкоголем
- HPV-16 (ротоглотка)
- Betel quid (Юго-Восточная Азия)

### Источник
Lingen MW et al. ADA expert panel. JADA 2017;148:712.`,
};

export default runner;

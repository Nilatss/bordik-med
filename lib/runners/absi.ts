/**
 * Runner: absi
 * ABSI / Baux / Revised Baux / BOBI - burn mortality prediction.
 */

import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах',       label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 120, step: 1, quickValues: [25, 40, 55, 70, 85] },
    { id: 'sex',       label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ] },
    { id: 'tbsa',      label: '% TBSA', type: 'number', unit: '%', min: 0, max: 100, step: 0.5, quickValues: [10, 20, 30, 40, 50, 70] },
    { id: 'inhalation', label: 'Ингаляционная травма', type: 'checkbox' },
    { id: 'fullThick', label: 'Полнослойные (III ст.) ожоги', type: 'checkbox' },
  ],
  compute: (v) => {
    const age = Number(v.age);
    const tbsa = Number(v.tbsa);
    const sex = String(v.sex);
    const inhal = v.inhalation === true;
    const fullT = v.fullThick === true;

    // Baux: age + %TBSA (≈ % смертности)
    const baux = age + tbsa;
    // Revised Baux (Osler 2010): +17 if inhalation
    const revBaux = baux + (inhal ? 17 : 0);

    // ABSI (Tobiasen 1982): сумма категориальных баллов 2-13+
    let absi = 0;
    if (sex === 'f') absi += 1;
    // age tier
    if (age <= 20) absi += 1;
    else if (age <= 40) absi += 2;
    else if (age <= 60) absi += 3;
    else if (age <= 80) absi += 4;
    else absi += 5;
    // tbsa tier
    if (tbsa <= 10) absi += 1;
    else if (tbsa <= 20) absi += 2;
    else if (tbsa <= 30) absi += 3;
    else if (tbsa <= 40) absi += 4;
    else if (tbsa <= 50) absi += 5;
    else if (tbsa <= 60) absi += 6;
    else if (tbsa <= 70) absi += 7;
    else if (tbsa <= 80) absi += 8;
    else if (tbsa <= 90) absi += 9;
    else absi += 10;
    if (inhal) absi += 1;
    if (fullT) absi += 1;

    // ABSI → прогноз смертности (Tobiasen 1982)
    let absiMortality = '';
    if (absi <= 3) absiMortality = '≥ 99 % выживаемость';
    else if (absi <= 5) absiMortality = '98 % выживаемость';
    else if (absi <= 7) absiMortality = '80-90 % выживаемость';
    else if (absi <= 9) absiMortality = '50-70 % выживаемость';
    else if (absi <= 11) absiMortality = '20-40 % выживаемость';
    else absiMortality = '≤ 10 % выживаемость';

    let details = '', actions: string[] = [], color = '#F59E0B';
    if (revBaux < 60) {
      color = '#22C55E';
      details = `Revised Baux ${revBaux} - низкий риск смертности. Стандартное ожоговое лечение.`;
      actions = [
        'Стандартная инфузия + уход за ранами',
        'Ранняя некрэктомия и аутотрансплантация по показаниям',
        'Реабилитационная программа',
      ];
    } else if (revBaux < 100) {
      color = '#F59E0B';
      details = `Revised Baux ${revBaux} - умеренный риск. Индивидуальное ведение в ожоговом центре.`;
      actions = [
        'Перевод в ожоговый центр (ABA)',
        'Инфузия по Parkland + мониторинг диуреза',
        'Ранняя энтеральная поддержка ≥ 25 ккал/кг, белок 1,5-2 г/кг',
        'Ранняя некрэктомия при глубоких ожогах',
      ];
    } else if (revBaux < 140) {
      color = '#EF4444';
      details = `Revised Baux ${revBaux} - высокий риск смертности. Сложные решения о объёме поддержки.`;
      actions = [
        'ICU, агрессивная поддержка всех систем',
        'Обсуждение с семьёй цели лечения (goals of care)',
        'Мультидисциплинарный совет: этап хирургии, трансплантация кожи',
        'Раннее вовлечение паллиативной службы для комфорт-целей',
      ];
    } else {
      color = '#991B1B';
      details = `Revised Baux ${revBaux} - крайне высокий риск, приближается к LD50 → LD90.`;
      actions = [
        'Реанимационные усилия максимальные при согласии пациента/семьи',
        'Раннее paliative-вовлечение: боль, седация, достойные условия',
        'Открытое обсуждение прогноза с семьёй, документирование целей',
        'Выбор между агрессивной терапией и комфорт-уходом',
      ];
    }

    return {
      value: String(revBaux), unit: 'Revised Baux',
      interpretation: `Baux ${baux} · Rev.Baux ${revBaux} · ABSI ${absi} (${absiMortality})`,
      color,
      details, actions,
      caveats: [
        'Baux отражает эпидемиологическую смертность; индивидуальная смертность зависит от коморбидностей, качества помощи',
        'LD50 (50 % смертности) в современных ожоговых центрах ≈ Baux 110-120 (улучшилось с 1970-х)',
        'Revised Baux учитывает только ингаляционную травму, но не ожоги дыхательных путей иной этиологии',
        'ABSI заниженно оценивает у пожилых и пациентов с сепсисом',
        'Не использовать для решения об отказе от реанимации - только как часть комплексной оценки',
      ],
      scale: {
        segments: [
          { min: 0,   max: 60,  label: 'Низкий',    color: '#22C55E' },
          { min: 60,  max: 100, label: 'Умеренный', color: '#F59E0B' },
          { min: 100, max: 140, label: 'Высокий',   color: '#EF4444' },
          { min: 140, max: 200, label: 'Крайне высокий', color: '#991B1B' },
        ],
        current: revBaux,
        unit: 'Rev. Baux',
      },
      related: [
        { id: 'rule-9', title: 'Rule of Nines / TBSA' },
        { id: 'parkland', title: 'Parkland fluid' },
        { id: 'parkland-brooke', title: 'Parkland / Brooke / Galveston' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Хирургия ожогов' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Baux S. *These de Paris* 1961. Osler T *J Trauma* 2010 (Revised Baux). Tobiasen J *J Trauma* 1982 (ABSI). Belgian BOBI 2009.',
  countries: 'Международный (ABA, ISBI)',
  presets: [
    { label: 'Молодой 25, 20 % TBSA',      values: { age: 25, sex: 'm', tbsa: 20, inhalation: false, fullThick: false } },
    { label: 'Пожилой 75, 30 % + ингал.',  values: { age: 75, sex: 'f', tbsa: 30, inhalation: true, fullThick: true } },
    { label: 'Критический 50, 70 %',       values: { age: 50, sex: 'm', tbsa: 70, inhalation: true, fullThick: true } },
  ],
  info: `### Для чего используется
**Прогноз смертности при ожогах.** Несколько шкал дополняют друг друга:
- **Baux** (1961) - быстрая бедсайд-оценка
- **Revised Baux** (Osler 2010) - с ингаляционной травмой
- **ABSI** (Tobiasen 1982) - 5 категориальных параметров
- **BOBI** (Belgian 2009) - специфичный для бельгийской когорты

### Формулы
- **Baux** = возраст + %TBSA (≈ % смертности)
- **Revised Baux** = Baux + 17 (при ингаляционной травме)
- **ABSI** (сумма 2-13+): пол ♀ (+1), возраст 0-20/21-40/41-60/61-80/>80 (+1-5), %TBSA тиры (+1-10), ингал. (+1), full-thickness (+1)

### Интерпретация ABSI
| ABSI | Выживаемость |
|---|---|
| 2-3 | ≥ 99 % |
| 4-5 | 98 % |
| 6-7 | 80-90 % |
| 8-9 | 50-70 % |
| 10-11 | 20-40 % |
| ≥ 12 | ≤ 10 % |

**LD50** (50 % смертности) современных ожоговых центров ≈ Revised Baux 110-120 (заметное улучшение vs 1970-х ~50).

### Ограничения
- Эпидемиологический показатель, не приговор конкретному пациенту
- Не учитывает качество помощи, коморбидности, время от ожога до поступления
- НЕ использовать как единственный критерий отказа от реанимации
- У детей маленького возраста - используйте Peds-BOBI или ABSI с поправкой

### Тактика
- Revised Baux ≤ 60 - стандартное лечение
- 61-100 - перевод в ожоговый центр, агрессивная поддержка
- 101-140 - ICU, обсуждение целей лечения
- ≥ 140 - открытый разговор с семьёй, возможна паллиативная тактика

### Источник
Baux S. *These de Paris* 1961. Osler T, et al. *J Trauma* 2010;68:690. Tobiasen J, et al. *J Trauma* 1982;22:711. Brusselaers N, et al. *Burns* 2013 (BOBI).
`,
};

export default runner;

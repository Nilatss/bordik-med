/** Runner: dix-hallpike - BPPV diagnostic tests & treatment selection */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'test',
      label: 'Выполненный тест',
      type: 'select',
      options: [
        { value: 'dh_r', label: 'Dix-Hallpike справа' },
        { value: 'dh_l', label: 'Dix-Hallpike слева' },
        { value: 'roll', label: 'Roll test (Pagnini-McClure)' },
        { value: 'hints', label: 'HINTS (Head-Impulse/Nystagmus/Test-of-Skew)' },
      ],
    },
    {
      id: 'nystagmus',
      label: 'Характер нистагма',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет нистагма' },
        { value: 'up_torsional', label: 'Вверх + геотропный торсион (к нижнему уху)' },
        { value: 'down_torsional', label: 'Вниз + апогеотропный торсион' },
        { value: 'horizontal_geo', label: 'Горизонт. геотропный (сильнее при пораж. стороне вниз)' },
        { value: 'horizontal_apogeo', label: 'Горизонт. апогеотропный' },
        { value: 'direction_changing', label: 'Направ.-меняющийся, спонтанный (центр.)' },
        { value: 'vertical_pure', label: 'Чисто вертикальный / тортиконный без латентности' },
      ],
    },
    {
      id: 'latency',
      label: 'Латентность / длительность',
      type: 'select',
      options: [
        { value: 'short', label: 'Латентность 1-5 с, < 60 с' },
        { value: 'long', label: 'Без латентности, > 60 с' },
        { value: 'na', label: 'Не применимо' },
      ],
    },
  ],
  compute: (v) => {
    const test = String(v.test || '');
    const ny = String(v.nystagmus || 'none');
    const lat = String(v.latency || 'na');

    let diagnosis = '';
    let treatment = '';
    let color = '#64748B';
    let details = '';

    const shortLat = lat === 'short';
    const centralSigns = ny === 'direction_changing' || ny === 'vertical_pure' || (lat === 'long' && ny !== 'none');

    if (centralSigns) {
      diagnosis = 'Подозрение на центральное вертиго';
      color = '#991B1B';
      treatment = 'Срочная МРТ головного мозга (инсульт задней циркуляции, церебеллит, MS)';
      details = 'Нистагм без латентности / вертикальный / направление-меняющийся - красные флаги центральной патологии.';
    } else if ((test === 'dh_r' || test === 'dh_l') && ny === 'up_torsional' && shortLat) {
      const side = test === 'dh_r' ? 'правого' : 'левого';
      diagnosis = `BPPV заднего п/к канала ${side} уха`;
      color = '#F59E0B';
      treatment = `Манёвр Эпли ${side} уха (success rate 80-90% за 1-2 сеанса)`;
      details = 'Апогеотропный вверх-торсион нистагм с латентностью 1-5 с = каналолитиаз заднего полукружного канала.';
    } else if ((test === 'dh_r' || test === 'dh_l') && ny === 'down_torsional' && shortLat) {
      diagnosis = 'BPPV переднего (верхнего) п/к канала - редкий';
      color = '#F59E0B';
      treatment = 'Обратный манёвр Эпли или Yacovino (deep head-hanging)';
      details = 'Нисходяще-апогеотропный нистагм - каналолитиаз переднего канала. Редкий вариант (<3% BPPV).';
    } else if (test === 'roll' && ny === 'horizontal_geo' && shortLat) {
      diagnosis = 'BPPV горизонтального канала - каналолитиаз';
      color = '#F59E0B';
      treatment = 'Манёвр Lempert (barbecue-roll 360°) или Gufoni в геотропную сторону';
      details = 'Геотропный горизонтальный нистагм - отолиты в задней полуворонке HSC. Поражение - на более сильной стороне.';
    } else if (test === 'roll' && ny === 'horizontal_apogeo' && shortLat) {
      diagnosis = 'BPPV горизонтального канала - купулолитиаз';
      color = '#F59E0B';
      treatment = 'Манёвр Gufoni в апогеотропную сторону, затем Lempert';
      details = 'Апогеотропный нистагм - отолиты прилипли к купуле. Поражение - на более слабой стороне.';
    } else if (test === 'hints') {
      if (ny === 'direction_changing' || ny === 'vertical_pure' || lat === 'long') {
        diagnosis = 'HINTS central (INFARCT)';
        color = '#991B1B';
        treatment = 'Срочный инсульт-протокол: МРТ DWI, консультация невролога';
        details = 'HINTS+ (нормальный head impulse / direction-changing nystagmus / skew+) чувствительнее МРТ в первые 48 ч (100% vs 80%).';
      } else {
        diagnosis = 'HINTS peripheral - вестибулярный нейронит';
        color = '#F59E0B';
        treatment = 'Симптоматическая терапия + вестибулярная реабилитация; МП 1 мг/кг × 3 нед (Strupp 2004)';
        details = 'HINTS− (abnormal head impulse / unidirectional nystagmus / no skew) - периферическая причина.';
      }
    } else if (ny === 'none') {
      diagnosis = 'Тест отрицательный';
      color = '#22C55E';
      treatment = 'Если клинически BPPV - повторить тест или рассмотреть редкие каналы';
      details = 'Нистагм не зарегистрирован. BPPV не исключён - повторите или направьте к отоневрологу с видеонистагмографией.';
    } else {
      diagnosis = 'Неклассическая картина';
      color = '#F59E0B';
      treatment = 'Видеонистагмография + отоневрологическое обследование';
      details = 'Неспецифичный паттерн - нужна видеонистагмография и консультация специалиста.';
    }

    return {
      value: diagnosis,
      interpretation: treatment,
      color,
      details,
      actions: [
        'Видеонистагмография (VNG) - золотой стандарт объективизации',
        'После манёвра: ограничение резких движений головы 24-48 ч (не обязательно по Cochrane)',
        'Brandt-Daroff exercises - самолечение дома 2-3 раза/день × 2 нед',
        'При рецидивах > 3 раз/год: рассмотреть остеопороз, вит.D дефицит',
        centralSigns ? 'Срочно: МРТ DWI + ангиография + неврологическая оценка' : '',
        'Отоневрологическая консультация при неэффективности 2-3 манёвров',
      ].filter(Boolean),
      caveats: [
        'BPPV составляет ~20-30% всех головокружений у взрослых',
        'Задний п/к канал - 85-95% случаев, горизонтальный 5-15%, передний < 3%',
        'Dix-Hallpike специфичность ~75%, чувствительность ~80%',
        'HINTS (+) = INFARCT: Impulse Normal, Fast-phase Alternating, Refixation on Cover Test',
        'HINTS чувствительнее ранней МРТ в первые 48 часов острого AVS',
        'Противопоказания Dix-Hallpike: тяжёлый шейный отдел, сосудистая мальформация',
        'Нистагм с утомлением (habituation) - признак периферической BPPV',
      ],
      related: [
        { id: 'dhi', title: 'DHI' },
        { id: 'meniere', title: 'Меньер' },
      ],
      relatedCourses: [
        { id: '314.3', title: 'Оториноларингология' },
        { id: '310.2', title: 'Неврология' },
      ],
    };
  },
  reference: 'Bhattacharyya N et al. Clinical practice guideline: Benign Paroxysmal Positional Vertigo (Update). Otolaryngol Head Neck Surg 2017;156:S1-47. Kattah JC et al. HINTS to diagnose stroke. Stroke 2009.',
  countries: 'Международный (AAO-HNS / Barany)',
  presets: [
    { label: 'BPPV задний прав. (Эпли)', values: { test: 'dh_r', nystagmus: 'up_torsional', latency: 'short' } },
    { label: 'BPPV горизонт. каналолит.', values: { test: 'roll', nystagmus: 'horizontal_geo', latency: 'short' } },
    { label: 'HINTS central (инсульт)', values: { test: 'hints', nystagmus: 'direction_changing', latency: 'long' } },
    { label: 'HINTS peripheral', values: { test: 'hints', nystagmus: 'horizontal_geo', latency: 'long' } },
  ],
  info: `### Для чего используется
Интерпретация **позиционных тестов** для BPPV и HINTS для дифф. диагностики **острого вестибулярного синдрома (AVS)**.

### Dix-Hallpike (задний/передний канал)
1. Пациент сидит, голова повёрнута на 45° в тестируемую сторону
2. Быстро опрокинуть назад с запрокинутой на 20° головой
3. Наблюдать нистагм 30-45 с

| Нистагм | Латентн. | Канал |
|---|---|---|
| Up + torsional (геотроп.) | 1-5 с | **Задний** (классика, 85-95%) |
| Down + torsional | 1-5 с | **Передний** (редкий, < 3%) |

### Roll test / Pagnini-McClure (горизонтальный канал)
Лёжа, голова повёрнута на 90° поочерёдно.

| Нистагм | Тип | Лечение |
|---|---|---|
| Геотропный, сильнее на пораж. стороне | Каналолитиаз | Lempert (barbecue) |
| Апогеотропный | Купулолитиаз | Gufoni apogeo |

### Манёвры
| Канал | Манёвр |
|---|---|
| Задний | **Epley** (success 80-90%) |
| Задний | Semont (альтернатива) |
| Горизонтальный каналолитиаз | **Lempert** 360° barbecue |
| Горизонтальный купулолитиаз | **Gufoni** apogeo → Lempert |
| Передний | **Yacovino** (deep head-hanging) |

### HINTS protocol (Kattah 2009)
При остром вестибулярном синдроме (AVS > 24 ч):
1. **H**ead Impulse - abnormal (corrective saccade) = периферический
2. Direction-changing **N**ystagmus = центральный
3. **T**est of **S**kew - vertical misalignment на cover test = центральный

**HINTS+ = INFARCT** (один критерий → центральная причина):
- **I**mpulse **N**ormal
- **F**ast-phase **A**lternating
- **R**efixation on **C**over **T**est

**Чувствительность HINTS для stroke: 100%** (vs 80% ранней МРТ в первые 48 ч).

### Красные флаги центрального вертиго
- Вертикальный чистый нистагм
- Нистагм без латентности, не утомляется
- Дизартрия, дисфагия, атаксия
- Головная боль затылочная
- Новый неврологический дефицит

### Источник
Bhattacharyya N et al. Otolaryngol Head Neck Surg 2017. Kattah JC et al. Stroke 2009.`,
};

export default runner;

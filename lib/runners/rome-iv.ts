// @ts-nocheck
/** Runner: rome-iv - Rome IV functional GI disorders criteria */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'disorder',
      label: 'Функциональное расстройство',
      type: 'select',
      options: [
        { value: 'ibs', label: 'Синдром раздражённого кишечника (СРК/IBS)' },
        { value: 'fd', label: 'Функциональная диспепсия (FD)' },
        { value: 'constipation', label: 'Функциональный запор' },
        { value: 'diarrhea', label: 'Функциональная диарея' },
        { value: 'bloating', label: 'Функциональное вздутие' },
        { value: 'globus', label: 'Globus (ком в горле)' },
        { value: 'cycvom', label: 'Синдром циклической рвоты' },
      ],
    },
    {
      id: 'duration',
      label: 'Длительность симптомов',
      type: 'select',
      options: [
        { value: 0, label: '<3 мес' },
        { value: 1, label: '3-6 мес' },
        { value: 2, label: '≥6 мес (включая последние 3 мес)' },
      ],
    },
    {
      id: 'alarm',
      label: 'Красные флаги (тревожные симптомы)',
      type: 'select',
      options: [
        { value: 0, label: 'Нет' },
        { value: 1, label: 'Есть (кровь, похудание, анемия, возраст >50 без скрининга)' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.disorder || 'ibs');
    const dur = Number(v.duration) || 0;
    const alarm = Number(v.alarm) || 0;

    const criteria: Record<string, { title: string; core: string; details: string }> = {
      ibs: {
        title: 'СРК (Rome IV C1)',
        core: 'Рецидивирующая боль в животе ≥1 день/нед за последние 3 мес',
        details: 'Связана с ≥2 из: (1) дефекация; (2) изменение частоты стула; (3) изменение формы стула.\n\nПодтипы (Bristol): IBS-C (запор), IBS-D (диарея), IBS-M (смешанный), IBS-U (неуточнённый).',
      },
      fd: {
        title: 'Функциональная диспепсия (Rome IV B1)',
        core: '≥1 из: постпрандиальное чувство переполнения, раннее насыщение, боль/жжение в эпигастрии',
        details: 'Нет структурных причин при ЭГДС. Подтипы: PDS (postprandial distress syndrome), EPS (epigastric pain syndrome), overlap.',
      },
      constipation: {
        title: 'Функциональный запор (Rome IV C2)',
        core: '≥2 из 6: натуживание, комковатый/твёрдый стул, ощущение неполного опорожнения, ощущение блока, мануальные приёмы, <3 SBM/нед',
        details: 'Редкий мягкий стул без слабительных. Не соответствует критериям СРК.',
      },
      diarrhea: {
        title: 'Функциональная диарея (Rome IV C3)',
        core: 'Мягкий/водянистый стул ≥25% дефекаций, без преобладающей боли',
        details: 'Исключить: инфекции, мальабсорбция, целиакия, IBD, приём слабительных.',
      },
      bloating: {
        title: 'Функциональное вздутие (Rome IV C4)',
        core: 'Рецидивирующее вздутие и/или растяжение живота ≥1 день/нед, доминирует над другими симптомами',
        details: 'Не соответствует критериям СРК, FD или FC.',
      },
      globus: {
        title: 'Globus (Rome IV F1)',
        core: 'Ощущение кома/инородного тела в горле, персистирующее или интермиттирующее',
        details: 'Нет одинофагии, нет доказательств ГЭРБ/эозинофильного эзофагита. ЛОР-осмотр нормален.',
      },
      cycvom: {
        title: 'Синдром циклической рвоты (Rome IV H1b)',
        core: 'Стереотипные эпизоды рвоты с бессимптомными интервалами',
        details: '≥3 эпизода за прошлый год, 2 за 6 мес. Исключить метаболические / неврологические причины.',
      },
    };

    const c = criteria[d];
    const meetsDuration = dur === 2;
    let color = '#22C55E', band = 'Критерии выполнены';
    if (alarm === 1) { color = '#991B1B'; band = 'КРАСНЫЕ ФЛАГИ — нельзя ставить функциональный диагноз'; }
    else if (!meetsDuration) { color = '#F59E0B'; band = 'Критерий длительности не выполнен'; }

    return {
      value: c.title,
      unit: 'Rome IV',
      interpretation: band,
      color,
      details: `Основной критерий: ${c.core}\n\n${c.details}\n\nОбщее требование Rome IV: симптомы ≥6 мес назад, активны последние 3 мес. ${meetsDuration ? '✓ Выполнено.' : '✗ Не выполнено.'}`,
      actions: [
        alarm === 1 ? 'СНАЧАЛА исключить органику: ЭГДС/колоноскопия/КТ/ФКС, лаборатория' : 'Минимальное обследование: ОАК, CRP, ТТГ, IgA к tTG (целиакия), фекальный кальпротектин',
        d === 'ibs' ? 'Тест на лактазную недостаточность; диетотерапия low-FODMAP; псиллиум; спазмолитики' : '',
        d === 'fd' ? 'H. pylori тест-и-лечить; ИПП 4-8 нед; прокинетики; при рефрактерности — трициклики' : '',
        d === 'constipation' ? 'Увеличить клетчатку 25-30 г/сут, жидкость; ПЭГ 3350 первая линия; при рефрактерности — прукалоприд' : '',
        'Дополнительно: психотерапия (КПТ, gut-directed hypnotherapy) при хронических функциональных расстройствах',
        alarm === 0 ? 'Не повторять ЭГДС/колоноскопию чаще необходимого — positive diagnosis стратегия' : '',
      ].filter(Boolean),
      caveats: [
        'Rome IV (2016) — позитивная (не исключительная) диагностика функциональных расстройств',
        'Красные флаги: кровь в стуле, необъяснимое похудание, возраст дебюта >50, ночные симптомы, анемия, семейный анамнез рака/IBD',
        'Нельзя ставить функциональный диагноз при наличии alarm features',
        'Fecal calprotectin <50 мкг/г ↓ вероятность IBD; ↑ при IBD, инфекциях',
        'Overlap между FD и IBS — до 40% пациентов',
      ],
      related: [
        { id: 'bristol', title: 'Bristol Stool Chart' },
        { id: 'uceis', title: 'UCEIS' },
      ],
      relatedCourses: [
        { id: '301.3', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Drossman DA, Hasler WL. Rome IV — Functional GI Disorders: Disorders of Gut-Brain Interaction. Gastroenterology. 2016;150(6):1257-1261.',
  countries: 'Международный (Rome Foundation)',
  presets: [
    { label: 'Типичный СРК', values: { disorder: 'ibs', duration: 2, alarm: 0 } },
    { label: 'FD, критерии выполнены', values: { disorder: 'fd', duration: 2, alarm: 0 } },
    { label: 'Красные флаги', values: { disorder: 'ibs', duration: 2, alarm: 1 } },
  ],
  info: `### Для чего используется
**Rome IV (2016)** — международные критерии диагностики **функциональных ЖКТ-расстройств (disorders of gut-brain interaction, DGBI)**.

### Общее правило
Симптомы возникли **≥6 месяцев назад** и активны за **последние 3 месяца**.

### Основные категории (взрослые)
- **A** Эзофагеальные (globus, functional heartburn)
- **B** Гастродуоденальные (FD: PDS/EPS)
- **C** Кишечные (IBS, FC, FD, функциональное вздутие)
- **D** Центральные боли (centrally mediated abdominal pain)
- **E** Билиарные (SO dysfunction)
- **F** Аноректальные
- **G** Детские (неонатальные/младенческие)
- **H** Детские (школьные)

### IBS подтипы (Rome IV + Bristol)
| Подтип | Bristol |
|---|---|
| IBS-C | ≥25% типы 1-2 |
| IBS-D | ≥25% типы 6-7 |
| IBS-M | оба |
| IBS-U | не подходит ни к одному |

### Красные флаги (исключить органику!)
- Возраст дебюта >50
- Необъяснимое похудание >5%
- Кровь в стуле / гемоколит
- Анемия
- Ночные симптомы
- Семейный анамнез CRC/IBD/целиакии
- Быстрое прогрессирование

### Первичная диагностика
- ОАК, CRP, ТТГ
- IgA tTG (целиакия)
- Fecal calprotectin (IBD)
- ЭГДС/колоноскопия при тревожных признаках

### Лечение (общие принципы)
- Позитивная диагностика (не исключительная)
- Образование + диета (low-FODMAP при IBS)
- Симптоматически: спазмолитики, лопераmid, псиллиум, ПЭГ
- При рефрактерности — нейромодуляторы (TCA, SSRI), gut-directed hypnotherapy, КПТ

### Источник
Drossman DA. Gastroenterology 2016;150:1257.`,
};

export default runner;

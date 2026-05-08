/** Runner: ahls - Advanced Hazmat Life Support (AACT) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'route',
      label: 'Путь экспозиции',
      type: 'select',
      options: [
        { value: 'dermal', label: 'Кожный / слизистые' },
        { value: 'inhalation', label: 'Ингаляционный' },
        { value: 'ingestion', label: 'Пероральный' },
        { value: 'ocular', label: 'Глазной' },
        { value: 'injection', label: 'Парентеральный / инъекция' },
      ],
    },
    {
      id: 'substance',
      label: 'Класс вещества',
      type: 'select',
      options: [
        { value: 'organophos', label: 'Фосфорорганические / карбаматы' },
        { value: 'cyanide', label: 'Цианиды / HCN' },
        { value: 'opioid', label: 'Опиоиды / фентанил-аэрозоль' },
        { value: 'irritant', label: 'Ирритант (хлор, аммиак)' },
        { value: 'corrosive', label: 'Кислота / щёлочь' },
        { value: 'radiation', label: 'Радиоактивное загрязнение' },
        { value: 'unknown', label: 'Неизвестно' },
      ],
    },
    {
      id: 'contamination',
      label: 'Объём загрязнения',
      type: 'select',
      options: [
        { value: 'low', label: 'Низкий (пары/следы)' },
        { value: 'moderate', label: 'Умеренный (брызги, видимое)' },
        { value: 'high', label: 'Высокий (обливание / облако)' },
      ],
    },
  ],
  compute: (v) => {
    const route = String(v.route || 'dermal');
    const sub = String(v.substance || 'unknown');
    const cont = String(v.contamination || 'moderate');

    let ppe = 'C';
    let decon = 'Технический decon (влажный + детергент)';

    if (cont === 'high' || sub === 'organophos' || sub === 'cyanide') { ppe = 'A'; decon = 'Полный wet decon + hot-warm-cold zones'; }
    else if (cont === 'moderate' || sub === 'opioid' || sub === 'radiation') { ppe = 'B'; decon = 'Wet decon + дозиметрия при радиации'; }
    else if (sub === 'irritant' || sub === 'corrosive') { ppe = 'B'; decon = 'Немедленный wet decon 15-20 мин воды'; }

    const antidotes: Record<string, string> = {
      organophos: 'Атропин 2-6 мг в/в каждые 5 мин до высыхания секретов; пралидоксим 1-2 г в/в за 30 мин',
      cyanide: 'Hydroxocobalamin 5 г в/в за 15 мин (Cyanokit) ± тиосульфат натрия 12.5 г в/в',
      opioid: 'Налоксон 0.04-2 мг в/в/в/м титровать; инфузия 2/3 от восстанавливающей дозы × ч',
      irritant: 'Симптоматически: небулайзер сальбутамол, ингаляционный NaHCO₃ при хлоре (спорно)',
      corrosive: 'НЕ нейтрализовать! 15 мин воды; кислота → молоко/вода внутрь; щёлочь → НЕ рвота',
      radiation: 'Калия йодид 130 мг (радиойод); Prussian blue (цезий); Ca-DTPA (плутоний)',
      unknown: 'Поддержка: ABC, O₂, в/в доступ, симптоматически; контакт с токсикологом (POISINDEX/CHEMTREC)',
    };

    let color = '#22C55E';
    if (ppe === 'B') color = '#F59E0B';
    if (ppe === 'A') color = '#EF4444';

    return {
      value: `PPE уровень ${ppe}`,
      unit: '',
      interpretation: `AHLS: путь ${route}, вещество ${sub}. Требуется PPE ${ppe}, ${decon}.`,
      color,
      details: `PPE по OSHA/EPA:\n• A - полная инкапсуляция + SCBA (наивысшая защита кожи + дыхания)\n• B - SCBA + химзащитный костюм (дыхание макс, кожа спрей)\n• C - APR/PAPR + защитный костюм (известная концентрация, OK для лёгкого риска)\n• D - рабочая униформа (только стандартные меры)\n\nЗоны деконтаминации:\n• Hot - контаминированная\n• Warm - decon corridor\n• Cold - чистая`,
      actions: [
        `PPE: уровень ${ppe}`,
        `Decon: ${decon}`,
        `Антидот/терапия: ${antidotes[sub]}`,
        'Снять всю одежду (удаляет до 80% контаминанта)',
        'Промыть глаза / кожу 15-20 мин тёплой водой низким давлением',
        'Не переносить пациента в чистую зону до decon (cross-contamination)',
        'ABC + O₂ high-flow, в/в доступ',
        'Контакт: POISINDEX / CHEMTREC 1-800-424-9300 / региональный токсцентр',
        'Transport: уведомить госпиталь заранее (warm/cold zones, decon capability)',
        'Документация: вещество, доза, концентрация, экспозиция по времени',
      ],
      caveats: [
        'НЕ заходить в hot zone без надлежащего PPE - безопасность спасателя приоритет',
        'Фентанил-аэрозоль: налоксон работает; PPE уровня C обычно достаточно для ответа (CDC 2017)',
        'Radiation + trauma - trauma приоритет, decon параллельно',
        'Cyanide + smoke (пожар): эмпирически hydroxocobalamin если soot в носоглотке + гипотензия / лактат > 8',
        'НЕ использовать нейтрализаторы при щёлочно-кислотных экспозициях (экзотермическая реакция)',
      ],
      scale: {
        segments: [
          { label: 'D', min: 1, max: 1, color: '#22C55E', description: 'Рабочая униформа' },
          { label: 'C', min: 2, max: 2, color: '#10B981', description: 'APR/PAPR' },
          { label: 'B', min: 3, max: 3, color: '#F59E0B', description: 'SCBA + костюм' },
          { label: 'A', min: 4, max: 4, color: '#EF4444', description: 'Полная инкапсуляция' },
        ],
        current: ppe === 'A' ? 4 : ppe === 'B' ? 3 : ppe === 'C' ? 2 : 1,
        unit: 'уровень',
      },
      related: [
        { id: 'poisindex', title: 'POISINDEX' },
        { id: 'antidote', title: 'Антидоты' },
        { id: 'hics', title: 'HICS' },
        { id: 'atls', title: 'ATLS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
        { id: '303.6', title: 'Токсикология' },
      ],
    };
  },
  reference: 'Walter FG et al. Advanced Hazmat Life Support Provider Manual, 4th ed. American Academy of Clinical Toxicology (AACT), University of Arizona. OSHA 29 CFR 1910.120. CDC/NIOSH PPE Selection Guide.',
  countries: 'США (AACT/Univ Arizona), международные сертификаты AHLS',
  presets: [
    { label: 'FOS ингаляция high → A', values: { route: 'inhalation', substance: 'organophos', contamination: 'high' } },
    { label: 'Цианид дым → A', values: { route: 'inhalation', substance: 'cyanide', contamination: 'moderate' } },
    { label: 'Фентанил кожный low → C', values: { route: 'dermal', substance: 'opioid', contamination: 'low' } },
    { label: 'Хлор пары', values: { route: 'inhalation', substance: 'irritant', contamination: 'moderate' } },
    { label: 'Кислота кожа', values: { route: 'dermal', substance: 'corrosive', contamination: 'moderate' } },
  ],
  info: `### Для чего используется
**AHLS (Advanced Hazmat Life Support)** - международная программа AACT (American Academy of Clinical Toxicology) по ведению пациентов с химическим, радиационным и биологическим поражением.

### PPE уровни (OSHA)
| Уровень | Защита |
|---|---|
| A | Полная инкапсуляция + SCBA (кожа+дых max) |
| B | SCBA + костюм (дых max, кожа spray) |
| C | APR/PAPR + костюм (известная концентрация) |
| D | Рабочая униформа |

### Зоны
Hot (контаминированная) → Warm (decon corridor) → Cold (чистая).

### Decon
Снятие одежды удаляет до **80%** контаминанта. Wet decon: вода + мягкое мыло, 15-20 мин.

### Ключевые антидоты
- ФОС: атропин + пралидоксим
- Цианид: hydroxocobalamin (Cyanokit)
- Опиоиды: налоксон
- Радиойод: KI
- Цезий: Prussian blue

### Источники
Walter FG et al. AHLS Provider Manual, 4 ed.
OSHA 29 CFR 1910.120.
CDC/NIOSH PPE Selection Guide.
`,
};
export default runner;

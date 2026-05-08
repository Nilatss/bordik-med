/** Runner: fitzpatrick - Fitzpatrick skin phototype I-VI */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'burn', label: 'Реакция на солнце (первые 30 мин без защиты)', type: 'select', options: [
      { value: '0', label: 'Всегда загораю, никогда не обгораю (0)' },
      { value: '1', label: 'Обычно загораю, редко обгораю (1)' },
      { value: '2', label: 'Иногда обгораю, потом загораю (2)' },
      { value: '3', label: 'Часто обгораю, загар медленный (3)' },
      { value: '4', label: 'Легко обгораю, загар слабый (4)' },
      { value: '5', label: 'Всегда обгораю, не загораю (5)' },
    ] },
    { id: 'eyes', label: 'Цвет глаз', type: 'select', options: [
      { value: '0', label: 'Светло-голубые / зелёные (0)' },
      { value: '1', label: 'Голубые / серые (1)' },
      { value: '2', label: 'Зелёные / карие (2)' },
      { value: '3', label: 'Тёмно-карие (3)' },
      { value: '4', label: 'Чёрные (4)' },
    ] },
    { id: 'hair', label: 'Натуральный цвет волос', type: 'select', options: [
      { value: '0', label: 'Рыжие / блонд (0)' },
      { value: '1', label: 'Светло-русые (1)' },
      { value: '2', label: 'Русые / шатен (2)' },
      { value: '3', label: 'Тёмно-каштановые (3)' },
      { value: '4', label: 'Чёрные (4)' },
    ] },
    { id: 'skin', label: 'Цвет кожи не загоревших зон', type: 'select', options: [
      { value: '0', label: 'Алебастровая / веснушки (0)' },
      { value: '1', label: 'Светлая (1)' },
      { value: '2', label: 'Светло-бежевая (2)' },
      { value: '3', label: 'Оливковая (3)' },
      { value: '4', label: 'Коричневая (4)' },
      { value: '5', label: 'Тёмно-коричневая / чёрная (5)' },
    ] },
  ],
  compute: (v) => {
    const score = Number(v.burn || 0) + Number(v.eyes || 0) + Number(v.hair || 0) + Number(v.skin || 0);

    let type = 'I', color = '#FEF3C7', band = '', mpd = '', cancer = '';
    if (score <= 6) { type = 'I'; color = '#FCD34D'; band = 'Кельтский'; mpd = '15-30 мДж/см² (UVB)'; cancer = 'Очень высокий риск меланомы / BCC'; }
    else if (score <= 13) { type = 'II'; color = '#FBBF24'; band = 'Северо-европейский'; mpd = '25-40 мДж/см²'; cancer = 'Высокий риск'; }
    else if (score <= 20) { type = 'III'; color = '#F59E0B'; band = 'Среднеевропейский'; mpd = '30-50 мДж/см²'; cancer = 'Умеренный риск'; }
    else if (score <= 27) { type = 'IV'; color = '#D97706'; band = 'Средиземноморский'; mpd = '40-60 мДж/см²'; cancer = 'Низкий риск меланомы, риск PIH'; }
    else if (score <= 34) { type = 'V'; color = '#92400E'; band = 'Индийский / смуглый'; mpd = '60-90 мДж/см²'; cancer = 'Низкий риск рака, высокий риск PIH / меласмы'; }
    else { type = 'VI'; color = '#451A03'; band = 'Африканский'; mpd = '90-150 мДж/см²'; cancer = 'Очень низкий риск меланомы (акральная, amelanotic); высокий риск келоидов'; }

    return {
      value: type,
      unit: `(score ${score})`,
      interpretation: `Фототип ${type} — ${band}`,
      color,
      details: `MPD (минимальная фототоксическая доза UVB): ${mpd}. ${cancer}.`,
      actions: [
        type === 'I' || type === 'II' ? 'SPF 50+ ежедневно, broad-spectrum UVA/UVB, физические фильтры' : 'SPF 30-50, особенно при фотодерматозах',
        'Self-examination кожи 1×/мес (ABCDE)',
        type === 'I' || type === 'II' ? 'Дерматоскопия 1×/год (особенно при > 50 невусов)' : '',
        type === 'IV' || type === 'V' || type === 'VI' ? 'Осторожно при лазерной эпиляции / IPL — риск ожогов и PIH, предпочитать Nd:YAG 1064' : '',
        type === 'VI' ? 'Вит D статус — скрининг, дефицит частый (25-OH-D)' : '',
        type === 'V' || type === 'VI' ? 'Не использовать гидрохинон без наблюдения (охроноз)' : '',
      ].filter(Boolean),
      caveats: [
        'Фототип — самоотчёт, может быть неточен у смешанных этносов',
        'Не заменяет DNA-тестов / spectrophotometry',
        'Risk-stratification меланомы учитывает ещё и число невусов, семейный анамнез, UV-экспозицию',
        'Меланома у VI-типа — часто акральная (подошва, ногти), диагностируется поздно',
      ],
      scale: {
        segments: [
          { min: 0, max: 7, label: 'I', color: '#FCD34D' },
          { min: 7, max: 14, label: 'II', color: '#FBBF24' },
          { min: 14, max: 21, label: 'III', color: '#F59E0B' },
          { min: 21, max: 28, label: 'IV', color: '#D97706' },
          { min: 28, max: 35, label: 'V', color: '#92400E' },
          { min: 35, max: 40, label: 'VI', color: '#451A03' },
        ],
        current: score,
        unit: 'Fitzpatrick',
      },
      related: [{ id: 'abcde', title: 'ABCDE меланома' }, { id: 'breslow', title: 'Breslow' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Fitzpatrick TB. The validity and practicality of sun-reactive skin types I through VI. Arch Dermatol 1988;124:869-871.',
  countries: 'Международный (AAD / Fitzpatrick)',
  presets: [
    { label: 'Кельтский тип I', values: { burn: '5', eyes: '0', hair: '0', skin: '0' } },
    { label: 'Средиземноморский IV', values: { burn: '2', eyes: '3', hair: '3', skin: '3' } },
    { label: 'Африканский VI', values: { burn: '0', eyes: '4', hair: '4', skin: '5' } },
  ],
  info: `### Для чего используется
**Фототип Fitzpatrick I–VI** — классификация реактивности кожи на UV. Применяется для:
- Оценки риска кожных опухолей
- Дозирования UVB / PUVA-фототерапии
- Подбора параметров лазеров / IPL
- Рекомендаций по фотопротекции

### Шкала
| Тип | Кожа | UV-реакция |
|---|---|---|
| I | Бледная, веснушки | Всегда обгорает, никогда не загорает |
| II | Светлая | Обычно обгорает, слабо загорает |
| III | Светло-оливковая | Иногда обгорает, умеренно загорает |
| IV | Оливковая | Редко обгорает, легко загорает |
| V | Коричневая | Очень редко обгорает |
| VI | Тёмно-коричневая / чёрная | Никогда не обгорает |

### Клинические импликации
| Тип | Риск меланомы | PIH / меласма | Лазер |
|---|---|---|---|
| I-II | Очень высокий | Низкий | Любые длины волн |
| III-IV | Умеренный | Средний | Осторожно с IPL |
| V-VI | Низкий (но высок акральная) | Высокий | Nd:YAG 1064 предпочтительно |

### Источник
Fitzpatrick TB. Arch Dermatol 1988.`,
};

export default runner;

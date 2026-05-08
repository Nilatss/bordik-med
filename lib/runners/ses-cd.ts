/** Runner: ses-cd - Simple Endoscopic Score for Crohn's Disease */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const ulcerOpts = [
  { value: 0, label: '0 — нет' },
  { value: 1, label: '1 — афты (0.1-0.5 см)' },
  { value: 2, label: '2 — крупные язвы (0.5-2 см)' },
  { value: 3, label: '3 — очень крупные (>2 см)' },
];
const surfaceOpts = [
  { value: 0, label: '0 — 0%' },
  { value: 1, label: '1 — <10%' },
  { value: 2, label: '2 — 10-30%' },
  { value: 3, label: '3 — >30%' },
];
const stenosisOpts = [
  { value: 0, label: '0 — нет' },
  { value: 1, label: '1 — одиночный, проходим' },
  { value: 2, label: '2 — множественный, проходим' },
  { value: 3, label: '3 — непроходим для эндоскопа' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ulcerSize', label: 'Размер язв (худший из 5 сегментов)', type: 'select', options: ulcerOpts },
    { id: 'ulcerSurface', label: 'Язвенная поверхность (% сегмента)', type: 'select', options: surfaceOpts },
    { id: 'affectedSurface', label: 'Поражённая поверхность (% сегмента)', type: 'select', options: surfaceOpts },
    { id: 'stenosis', label: 'Стенозы (во всех сегментах)', type: 'select', options: stenosisOpts },
    {
      id: 'segments',
      label: 'Количество поражённых сегментов из 5',
      type: 'select',
      options: [
        { value: 1, label: '1 сегмент' },
        { value: 2, label: '2 сегмента' },
        { value: 3, label: '3 сегмента' },
        { value: 4, label: '4 сегмента' },
        { value: 5, label: '5 сегментов (илеум, прав., попер., лев., прямая)' },
      ],
    },
  ],
  compute: (v) => {
    const uSize = Number(v.ulcerSize) || 0;
    const uSurf = Number(v.ulcerSurface) || 0;
    const aSurf = Number(v.affectedSurface) || 0;
    const sten = Number(v.stenosis) || 0;
    const seg = Number(v.segments) || 1;
    // Approximation: per-segment score × number of segments, + stenosis (sum across all segments, max 3)
    // Real SES-CD: sum each variable across all 5 ileocolonic segments.
    const perSegment = uSize + uSurf + aSurf;
    const total = perSegment * seg + Math.min(sten, 3);

    let band = '', color = '#22C55E', details = '';
    if (total <= 2) { band = 'Ремиссия'; color = '#22C55E'; details = 'Эндоскопическая ремиссия (SES-CD 0-2).'; }
    else if (total <= 6) { band = 'Лёгкая активность'; color = '#84CC16'; details = 'Лёгкая эндоскопическая активность.'; }
    else if (total <= 15) { band = 'Умеренная активность'; color = '#F59E0B'; details = 'Умеренная активность.'; }
    else { band = 'Тяжёлая активность'; color = '#EF4444'; details = 'Тяжёлая эндоскопическая активность — эскалация терапии.'; }

    return {
      value: String(total),
      unit: '/60',
      interpretation: band,
      color,
      details: `${details} Язвы: ${uSize}, язв. поверхн.: ${uSurf}, общая поверхн.: ${aSurf}, стенозы: ${sten}, сегменты: ${seg}.`,
      actions: [
        total >= 16 ? 'Эскалация: биологики (анти-TNF, ведолизумаб, устекинумаб, рисанкизумаб) ± иммуносупрессоры' : '',
        total <= 6 ? 'Индукция: будесонид (илеоцекальный) / системные ГКС; поддерживающая — иммуносупрессоры' : '',
        sten >= 2 ? 'Обсудить эндоскопическую дилатацию или хирургию при симптоматическом стенозе' : '',
        'Биопсии для подтверждения диагноза и исключения инфекции (CMV, ТБ)',
        'Мониторинг: фекальный кальпротектин, CRP, МРТ-энтерография каждые 6-12 мес',
        'Цель терапии — mucosal healing (SES-CD ≤2 или STRIDE-II: CDEIS <4)',
        'Скрининг CRC при длительности >8 лет или поражении толстой кишки',
      ].filter(Boolean),
      caveats: [
        'SES-CD (Daperno 2004) — упрощённая шкала CDEIS для эндоскопической активности БК',
        'Оценивается 5 сегментов: терминальный илеум, правая, поперечная, левая, прямая кишка',
        'Каждый сегмент: 4 переменные × 0-3 балла = до 11 + стенозы (но стенозы — общая сумма для всех сегментов)',
        'Максимум ~56-60 баллов в оригинале; эта форма — аппроксимация',
        'Ремиссия: SES-CD ≤2; mucosal healing: ≤4; ответ: снижение ≥50%',
        'Не заменяет МРТ-энтерографию для оценки трансмурального воспаления и свищей',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Ремиссия', color: '#22C55E' },
          { min: 3, max: 6, label: 'Лёгкая', color: '#84CC16' },
          { min: 7, max: 15, label: 'Умер.', color: '#F59E0B' },
          { min: 16, max: 60, label: 'Тяжёлая', color: '#EF4444' },
        ],
        current: total,
        unit: 'SES-CD',
      },
      related: [
        { id: 'cdai', title: 'CDAI' },
        { id: 'uceis', title: 'UCEIS' },
      ],
      relatedCourses: [
        { id: '301.3', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Daperno M, D\'Haens G, Van Assche G, et al. Development and validation of a new, simplified endoscopic activity score for Crohn\'s disease: the SES-CD. Gastrointest Endosc. 2004;60(4):505-512.',
  countries: 'Международный (ECCO)',
  presets: [
    { label: 'Ремиссия', values: { ulcerSize: 0, ulcerSurface: 0, affectedSurface: 0, stenosis: 0, segments: 1 } },
    { label: 'Умеренная (илеит)', values: { ulcerSize: 2, ulcerSurface: 1, affectedSurface: 2, stenosis: 1, segments: 2 } },
    { label: 'Тяжёлая распростр.', values: { ulcerSize: 3, ulcerSurface: 3, affectedSurface: 3, stenosis: 2, segments: 4 } },
  ],
  info: `### Для чего используется
**SES-CD (Simple Endoscopic Score for Crohn's Disease, Daperno 2004)** — упрощённая шкала эндоскопической активности болезни Крона, заменившая более сложную CDEIS.

### Структура
5 илеоколических сегментов:
1. Терминальный илеум
2. Правая ободочная
3. Поперечная
4. Левая ободочная
5. Прямая кишка

Каждый сегмент оценивается по 4 переменным (× 0-3):
- **Размер язв** (0 — нет; 1 — афты; 2 — 0.5-2 см; 3 — >2 см)
- **Язвенная поверхность** (% сегмента)
- **Поражённая поверхность** (%)
- **Стенозы** (общая сумма для всех сегментов, 0-3)

### Интерпретация
| SES-CD | Активность |
|---|---|
| 0-2 | Ремиссия |
| 3-6 | Лёгкая |
| 7-15 | Умеренная |
| ≥16 | Тяжёлая |

### Mucosal healing (STRIDE-II 2021)
- SES-CD ≤4 **и** снижение ≥50% от исходного
- Отсутствие крупных язв
- Цель для биологической терапии

### Применение
- Диагностика и стадирование БК
- Мониторинг ответа на терапию (через 3-6 мес)
- Клинические испытания (primary/secondary endpoint)
- Решение о переходе на хирургию

### Комплементарные методы
- **CRP + фекальный кальпротектин** — суррогатные маркёры
- **МРТ-энтерография** — трансмуральное воспаление, свищи
- **УЗИ кишечника** — мониторинг в динамике
- **Капсульная эндоскопия** — тонкокишечные поражения

### Ступени терапии (ECCO 2019/2023)
1. Индукция: ГКС (системные/будесонид) или биологики при тяжёлой
2. Поддержка: иммуносупрессоры (AZA/6-MP), биологики (анти-TNF, ведолизумаб, устекинумаб, рисанкизумаб)
3. Хирургия: стриктуры, фистулы, рефрактерность

### Источник
Daperno M et al. Gastrointest Endosc 2004;60:505.`,
};

export default runner;

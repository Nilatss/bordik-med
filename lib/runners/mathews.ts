// @ts-nocheck
/** Runner: mathews — Pediatric tonsillectomy/adenoidectomy indications (AAO-HNS 2019 + Mathews criteria) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'episodes1y',
      label: 'Эпизодов тонзиллита за последние 12 мес',
      type: 'number',
      unit: 'эпиз.',
      min: 0,
      max: 15,
      step: 1,
      quickValues: [3, 5, 7, 10],
    },
    {
      id: 'episodes2y',
      label: 'В среднем за 2 года (эпиз./год)',
      type: 'number',
      unit: 'эпиз./год',
      min: 0,
      max: 15,
      step: 1,
      quickValues: [3, 5, 7],
    },
    {
      id: 'episodes3y',
      label: 'В среднем за 3 года (эпиз./год)',
      type: 'number',
      unit: 'эпиз./год',
      min: 0,
      max: 15,
      step: 1,
      quickValues: [2, 3, 5],
    },
    { id: 'documented', label: 'Каждый эпизод задокументирован врачом + критерии Paradise', type: 'checkbox' },
    {
      id: 'osa',
      label: 'Тяжесть обструктивного апноэ сна (AHI по ПСГ)',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет данных / нет симптомов' },
        { value: 'mild', label: 'Лёгкое (AHI 1-5)' },
        { value: 'moderate', label: 'Умеренное (AHI 5-10)' },
        { value: 'severe', label: 'Тяжёлое (AHI > 10)' },
      ],
    },
    { id: 'complications', label: 'Осложнения (ПТА, ревмат. лих., IgA-нефропатия, PFAPA)', type: 'checkbox' },
    { id: 'tonsilhyper', label: 'Тонзиллы III-IV степени / затрудн. приём пищи', type: 'checkbox' },
    { id: 'peritonsilar', label: 'Паратонзиллярный абсцесс в анамнезе (≥ 1)', type: 'checkbox' },
  ],
  compute: (v) => {
    const e1 = Number(v.episodes1y) || 0;
    const e2 = Number(v.episodes2y) || 0;
    const e3 = Number(v.episodes3y) || 0;
    const doc = !!v.documented;
    const osa = String(v.osa || 'none');
    const comp = !!v.complications;
    const hyper = !!v.tonsilhyper;
    const pta = !!v.peritonsilar;

    // Paradise criteria: ≥ 7 ep/1y OR ≥ 5/y × 2y OR ≥ 3/y × 3y — documented
    const paradise = doc && (e1 >= 7 || e2 >= 5 || e3 >= 3);
    const osaMod = osa === 'moderate' || osa === 'severe';
    const osaSevere = osa === 'severe';

    let verdict = '';
    let color = '#10B981';
    const actions: string[] = [];
    const indications: string[] = [];

    if (paradise) indications.push('Критерии Paradise (рецидив. тонзиллит) — АБСОЛЮТНОЕ показание');
    if (osaSevere) indications.push('Тяжёлое OSA — абсолютное показание');
    if (osaMod && hyper) indications.push('Умеренное OSA + гипертрофия тонзилл — показание');
    if (pta) indications.push('Паратонзиллярный абсцесс (≥ 1 эпизод) — относительное');
    if (comp) indications.push('Осложнения (ревм. лихорадка / PFAPA / IgA-нефр.) — относительное');
    if (hyper && (osaMod || e1 >= 3)) indications.push('Гипертрофия + симптомы — относительное');

    if (paradise || osaSevere) {
      verdict = 'Тонзилл- ± аденоидэктомия показана (абсолютные критерии)';
      color = '#EF4444';
      actions.push('Плановая тонзиллэктомия ± аденоидэктомия (при OSA + аденоидах)');
      actions.push('Предоперационная ПСГ если тяжёлое OSA или коморбидности');
      actions.push('Оценка риска пост-тонзиллэктомического кровотечения (бленоррагия)');
      actions.push('Послеопер. наблюдение 24 ч при возрасте < 3 лет или тяж. OSA');
    } else if (indications.length > 0) {
      verdict = `Относительные показания (${indications.length}) — решение индивидуальное`;
      color = '#F59E0B';
      actions.push('Обсуждение с ЛОР + семьей, консервативная терапия 6-12 мес');
      actions.push('Адекватная а/б-терапия при рецидивирующем тонзиллите (пенициллин 10 дн)');
      actions.push('ПСГ при подозрении на OSA до операции');
    } else {
      verdict = 'Показания к тонзиллэктомии отсутствуют — консервативная терапия';
      color = '#10B981';
      actions.push('Адекватная а/б-терапия острого тонзиллита по стрептотесту');
      actions.push('Увлажнение, анальгетики, полоскания');
      actions.push('Наблюдение, повторная оценка через 12 мес');
    }

    const totalScore = (paradise ? 3 : 0) + (osaSevere ? 3 : osaMod ? 2 : 0) + (pta ? 1 : 0) + (comp ? 1 : 0) + (hyper ? 1 : 0);

    return {
      value: `${indications.length} показ.`,
      unit: 'AAO-HNS',
      interpretation: verdict,
      color,
      details: `**Критерии Paradise (документированные эпизоды):**\n- ≥ 7 за 1 год → ${e1 >= 7 && doc ? '✅' : '❌'} (${e1})\n- ≥ 5/год × 2 года → ${e2 >= 5 && doc ? '✅' : '❌'} (${e2})\n- ≥ 3/год × 3 года → ${e3 >= 3 && doc ? '✅' : '❌'} (${e3})\n\n**Показания:**\n${indications.length ? indications.map((x) => `- ${x}`).join('\n') : '- нет'}`,
      actions,
      caveats: [
        'Paradise-критерии требуют именно документированных визитов с лихорадкой + экссудатом/шейным лимфаденитом/культурой СГА',
        'При не документированных эпизодах — watchful waiting 12 мес (AAO-HNS 2019 сильная рекомендация)',
        'Пост-тонзиллэктомич. кровотечение 2-5 % (первичное < 24 ч, вторичное 5-10 день)',
        'Адено(идэкто)мия + тонзиллэктомия — стандарт для OSA у детей, улучшение AHI в 70-80 %',
        'После тонзиллэктомии 10-20 % детей имеют остаточное OSA — ПСГ через 3-6 мес',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет показ.', color: '#10B981' },
          { min: 1, max: 3, label: 'Относит.', color: '#F59E0B' },
          { min: 3, max: 10, label: 'Абсолют.', color: '#EF4444' },
        ],
        current: Math.min(totalScore, 10),
        unit: 'сумма',
      },
      related: [
        { id: 'stop-bang', title: 'STOP-BANG' },
        { id: 'centor', title: 'Centor' },
      ],
      relatedCourses: [
        { id: '307.1', title: 'Педиатрия' },
        { id: '307.3', title: 'ЛОР детский' },
      ],
    };
  },
  reference: 'Mitchell RB et al. AAO-HNS Clinical Practice Guideline: Tonsillectomy in Children (Update). Otolaryngol Head Neck Surg 2019;160(1_suppl):S1-S42. Paradise JL et al. N Engl J Med 1984;310:674-83.',
  countries: 'Международный (AAO-HNS 2019)',
  presets: [
    { label: 'Рецидив. тонзиллит (Paradise +)', values: { episodes1y: 7, episodes2y: 5, episodes3y: 3, documented: true, osa: 'none', complications: false, tonsilhyper: false, peritonsilar: false } },
    { label: 'Тяжёлое OSA', values: { episodes1y: 1, episodes2y: 1, episodes3y: 1, documented: false, osa: 'severe', complications: false, tonsilhyper: true, peritonsilar: false } },
    { label: 'Нет показаний', values: { episodes1y: 2, episodes2y: 2, episodes3y: 1, documented: false, osa: 'none', complications: false, tonsilhyper: false, peritonsilar: false } },
  ],
  info: `### Для чего используется
**AAO-HNS 2019 / Paradise-критерии** — показания к тонзиллэктомии у детей.

### Абсолютные показания
1. **Paradise-критерии** (рецидивирующий тонзиллит):
   - ≥ 7 эпизодов за 1 год, ИЛИ
   - ≥ 5 эпиз./год × 2 года, ИЛИ
   - ≥ 3 эпиз./год × 3 года
   Каждый эпизод документирован врачом с лихорадкой/экссудатом/лимфаденитом/культурой СГА.

2. **OSA тяжёлой степени** (AHI > 10 по ПСГ)

### Относительные показания
- Умеренное OSA + гипертрофия тонзилл
- ≥ 1 паратонзиллярный абсцесс
- PFAPA (periodic fever, aphthae, pharyngitis, adenitis) — резистентный
- IgA-нефропатия с тонзилло-генным обострением
- Постстрептококковая ревматическая лихорадка

### Ключевые рекомендации (сильные)
- Watchful waiting 12 мес при не соотв. Paradise-критериям
- ПСГ до операции при подозрении на OSA
- Однократная доза дексаметазона интраоперационно
- НЕ назначать антибиотики рутинно после тонзиллэктомии

### Источник
Mitchell RB et al. Otolaryngol Head Neck Surg 2019;160:S1-S42. Paradise JL et al. NEJM 1984;310:674.`,
};

export default runner;

/** Runner: bipss - Bilateral Inferior Petrosal Sinus Sampling (Cushing) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'central', label: 'Пиковый ACTH в IPS (центр, pg/mL)', type: 'number', min: 0, max: 10000, step: 10, quickValues: [100, 500, 1000, 3000] },
    { id: 'peripheral', label: 'ACTH на периферии (pg/mL)', type: 'number', min: 0, max: 1000, step: 5, quickValues: [20, 50, 100, 200] },
    { id: 'postCRH', label: 'Образец после стимуляции CRH/DDAVP?', type: 'select', options: [{ value: 'pre', label: 'Базальный (pre-CRH)' }, { value: 'post', label: 'Пост-CRH (после стимуляции)' }] },
    { id: 'leftRight', label: 'Разница ACTH лево/право (латерализация, соотношение)', type: 'number', min: 1, max: 100, step: 0.1, quickValues: [1, 1.4, 2, 5] },
  ],
  compute: (v) => {
    const c = Math.max(0, Number(v.central) || 0);
    const p = Math.max(0.1, Number(v.peripheral) || 0.1);
    const ratio = c / p;
    const postCRH = v.postCRH === 'post';
    const lr = Math.max(1, Number(v.leftRight) || 1);
    const threshold = postCRH ? 3 : 2;
    const isPituitary = ratio >= threshold;

    let band = '', color = '#22C55E', details = '';
    if (isPituitary) {
      band = 'Гипофизарный источник';
      color = '#22C55E';
      details = `C:P = ${ratio.toFixed(2)} ≥ ${threshold} (${postCRH ? 'пост-CRH' : 'базально'}) → болезнь Кушинга (питуитарная ACTH-продуцирующая аденома).`;
    } else {
      band = 'Эктопический источник';
      color = '#EF4444';
      details = `C:P = ${ratio.toFixed(2)} < ${threshold} → эктопический АКТГ-синдром (карциноид лёгкого, МРЛ, нейроэндокринные опухоли).`;
    }

    const lateralization = lr >= 1.4 ? (lr >= 1.4 ? `Латерализация ${lr.toFixed(2)} ≥ 1.4 — возможная сторона аденомы.` : '') : `Латерализация ${lr.toFixed(2)} < 1.4 — сторона не определяется.`;

    return {
      value: ratio.toFixed(2),
      unit: 'C:P ratio',
      interpretation: band,
      color,
      details: `${details} ${lateralization}`,
      actions: [
        isPituitary ? 'Транссфеноидальная аденомэктомия — терапия 1-й линии' : 'Поиск эктопического источника: КТ грудной/брюшной полости, октреоскан, DOTATATE-PET',
        'МРТ гипофиза с динамическим контрастом 3T',
        'Подтвердить зависимость от ACTH (ACTH ≥ 20 pg/mL)',
        'Биохимия Cushing: ночной кортизол слюны, 24-ч кортизол мочи, низкодозовый дексаметазоновый тест',
        isPituitary && lr >= 1.4 ? `Селективная аденомэктомия с приоритетом ${lr >= 1.4 ? 'доминирующей стороны' : ''}` : '',
        'BIPSS выполняется только в специализированных центрах опытным нейрорадиологом',
      ].filter(Boolean),
      caveats: [
        'Критерии: C:P ≥ 2 базально ИЛИ ≥ 3 после CRH/DDAVP → гипофизарный',
        'Чувствительность 94%, специфичность 100% для болезни Кушинга',
        'Ложноотрицательные — при аномалиях венозного оттока, циклическом Кушинге',
        'Латерализация (L/R ≥ 1.4) имеет точность всего ~60-70% для локализации микроаденомы',
        'Обязательна одновременная билатеральная катетеризация, контроль положения ангиографически',
        'Риски: тромбоз, инсульт ствола (<1%), гематома',
      ],
      related: [{ id: 'dexamethasone-suppression', title: 'DST' }],
      relatedCourses: [{ id: '302.1', title: 'Эндокринология' }],
    };
  },
  reference: 'Oldfield EH et al. Petrosal sinus sampling with and without corticotropin-releasing hormone for the differential diagnosis of Cushing\'s syndrome. NEJM 1991;325:897-905. Endocrine Society CPG 2015.',
  countries: 'Международный (Endocrine Society)',
  presets: [
    { label: 'Болезнь Кушинга (базально)', values: { central: 800, peripheral: 80, postCRH: 'pre', leftRight: 3.5 } },
    { label: 'Болезнь Кушинга (пост-CRH)', values: { central: 2500, peripheral: 400, postCRH: 'post', leftRight: 2.0 } },
    { label: 'Эктопический АКТГ', values: { central: 150, peripheral: 120, postCRH: 'post', leftRight: 1.1 } },
  ],
  info: `### Для чего используется
**BIPSS (Bilateral Inferior Petrosal Sinus Sampling)** — «золотой стандарт» для дифференциации гипофизарного (болезнь Кушинга) и эктопического АКТГ-зависимого гиперкортицизма.

### Методика
Катетеризация обеих нижних каменистых пазух через бедренные вены. Одновременный забор ACTH:
- **Базально** (0, −5, −2 мин)
- **После стимуляции CRH 100 мкг в/в** (3, 5, 10 мин) — также используют DDAVP 10 мкг

### Критерии
| Соотношение C:P | Образец | Трактовка |
|---|---|---|
| ≥ 2 | Базально | Гипофизарный (болезнь Кушинга) |
| ≥ 3 | После CRH | Гипофизарный (болезнь Кушинга) |
| < пороговых | Оба | Эктопический АКТГ-синдром |

### Латерализация
- **L/R ≥ 1.4** — ориентир на сторону аденомы, но точность лишь 60-70%.

### Показания
- АКТГ-зависимый Кушинг (ACTH ≥ 20 pg/mL)
- МРТ гипофиза без явной аденомы ИЛИ аденома < 6 мм ИЛИ несоответствие клиники и МРТ
- Негативный / неинформативный высокодозовый дексаметазоновый тест

### Диагностическая точность
- Чувствительность 94%, специфичность 100%
- Ложноотрицательные: аномалии венозного дренажа, циклический Кушинг

### Источник
NEJM 1991;325:897. Endocrine Society CPG 2015.`,
};

export default runner;

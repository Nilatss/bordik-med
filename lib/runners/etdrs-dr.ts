/** Runner: etdrs-dr - ETDRS Diabetic Retinopathy + DME grading */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'microaneurysms', label: 'Микроаневризмы', type: 'checkbox' },
    { id: 'dotBlot', label: 'Интраретинальные геморрагии', type: 'select', options: [
      { value: 'none', label: 'Нет' },
      { value: 'mild', label: 'Единичные (< 20 в каждом квадранте)' },
      { value: 'severe', label: '≥ 20 в каждом из 4 квадрантов (severe)' },
    ] },
    { id: 'venousBeading', label: 'Венозные чётки (venous beading) ≥ 2 квадрантов', type: 'checkbox' },
    { id: 'irma', label: 'IRMA (intraretinal microvascular abnormalities) ≥ 1 квадрант', type: 'checkbox' },
    { id: 'neoVasc', label: 'Неоваскуляризация (NVD / NVE)', type: 'checkbox' },
    { id: 'vhPrh', label: 'Витреальное / преретинальное кровоизлияние', type: 'checkbox' },
    { id: 'csme', label: 'ДМО с вовлечением центра / CSME критерии', type: 'select', options: [
      { value: 'none', label: 'Нет ДМО' },
      { value: 'noncsme', label: 'ДМО вне центра (non-CSME)' },
      { value: 'csme', label: 'CSME (клинически значимый)' },
    ] },
  ],
  compute: (v) => {
    const ma = !!v.microaneurysms;
    const dot = String(v.dotBlot || 'none');
    const vb = !!v.venousBeading;
    const irma = !!v.irma;
    const nv = !!v.neoVasc;
    const vh = !!v.vhPrh;
    const dme = String(v.csme || 'none');

    // 4:2:1 rule for severe NPDR: severe intraretinal hemorrhages in 4 quadrants OR venous beading in 2+ OR IRMA in 1+
    const count421 = (dot === 'severe' ? 1 : 0) + (vb ? 1 : 0) + (irma ? 1 : 0);

    let stage = '', color = '#22C55E', details = '';
    if (nv || vh) {
      stage = 'PDR (пролиферативная)';
      color = '#991B1B';
      details = `Пролиферативная ДР${vh ? ' с витр./преретин. кровоизлиянием' : ''} — ${vh ? 'высокий риск PDR' : 'ранняя/неосложнённая PDR'}.`;
    } else if (count421 >= 2) {
      stage = 'Very severe NPDR';
      color = '#EF4444';
      details = 'Very severe NPDR (≥ 2 из 4:2:1 критериев) — 50% риск PDR в течение 1 года.';
    } else if (count421 === 1) {
      stage = 'Severe NPDR';
      color = '#FB923C';
      details = 'Severe NPDR (1 из правила 4:2:1) — 15% риск PDR в течение 1 года.';
    } else if (dot === 'mild' || ma) {
      const hasMod = dot === 'mild' && (vb || irma);
      if (hasMod) {
        stage = 'Moderate NPDR';
        color = '#F59E0B';
        details = 'Moderate NPDR — больше, чем mild, но не достигает severe.';
      } else if (ma && dot === 'none') {
        stage = 'Mild NPDR';
        color = '#84CC16';
        details = 'Mild NPDR — только микроаневризмы.';
      } else {
        stage = 'Moderate NPDR';
        color = '#F59E0B';
        details = 'Moderate NPDR — геморрагии + микроаневризмы.';
      }
    } else {
      stage = 'Без ДР';
      color = '#22C55E';
      details = 'Нет признаков диабетической ретинопатии.';
    }

    // DME adjustments
    const dmeStr = dme === 'csme' ? ' + CSME (клинически значимый ДМО)' : dme === 'noncsme' ? ' + non-CSME ДМО' : '';

    return {
      value: stage,
      unit: dmeStr || 'no DME',
      interpretation: stage + dmeStr,
      color,
      details: `${details}${dmeStr}`,
      actions: [
        stage === 'Без ДР' ? 'Контроль 1×/год, HbA1c < 7%, АД < 140/90' : '',
        stage === 'Mild NPDR' ? 'Офтальмоскопия 1×/6-12 мес' : '',
        stage === 'Moderate NPDR' ? 'Офтальмоскопия 6 мес, OCT при подозрении на ДМО' : '',
        stage === 'Severe NPDR' || stage === 'Very severe NPDR' ? 'Осмотр 3-4 мес, рассмотреть профилактическую PRP или anti-VEGF (Protocol W)' : '',
        stage === 'PDR (пролиферативная)' ? 'Панретинальная лазеркоагуляция (PRP) ± анти-VEGF; vitrectomy при non-clearing VH' : '',
        dme === 'csme' ? 'Анти-VEGF интравитреально 1-я линия (ranibizumab/aflibercept/bevacizumab)' : '',
        dme === 'noncsme' ? 'Наблюдение + оптимизация метаболического контроля' : '',
        'Контроль HbA1c, АД (< 130/80), липидов, протеинурии',
      ].filter(Boolean),
      caveats: [
        'ETDRS severity scale — уровни 10-85 (имплементация в клинике упрощена до 5 категорий)',
        'Правило 4:2:1: severe intraret. hem. в 4 квадрантах, venous beading ≥ 2, IRMA ≥ 1',
        'CSME (ETDRS): утолщение сетчатки в пределах 500 мкм от фовеа ИЛИ твёрдые экссудаты в 500 мкм + прилежащее утолщение ИЛИ утолщение ≥ 1 PD в пределах 1 PD от фовеа',
        'Современная классификация по OCT: center-involved DME vs non-center-involved',
        'Beremic (anti-VEGF) — снижает прогрессию severe NPDR в PDR (Protocol W)',
        'PRP не предотвращает ДМО, может усугубить — сначала anti-VEGF при комбинации',
        'Скрининг ДР: ретинальная фотография с интерпретацией AI одобрена FDA',
      ],
      related: [{ id: 'areds', title: 'AREDS' }, { id: 'snellen', title: 'Snellen' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }, { id: '302.1', title: 'Эндокринология' }],
    };
  },
  reference: 'ETDRS Research Group. Grading diabetic retinopathy from stereoscopic color fundus photographs — ETDRS report 10. Ophthalmology 1991;98:786. AAO Diabetic Retinopathy PPP 2019.',
  countries: 'Международный (AAO / ETDRS)',
  presets: [
    { label: 'Без ДР', values: { microaneurysms: false, dotBlot: 'none', venousBeading: false, irma: false, neoVasc: false, vhPrh: false, csme: 'none' } },
    { label: 'Mild NPDR', values: { microaneurysms: true, dotBlot: 'none', venousBeading: false, irma: false, neoVasc: false, vhPrh: false, csme: 'none' } },
    { label: 'Severe NPDR', values: { microaneurysms: true, dotBlot: 'severe', venousBeading: false, irma: false, neoVasc: false, vhPrh: false, csme: 'none' } },
    { label: 'PDR + CSME', values: { microaneurysms: true, dotBlot: 'severe', venousBeading: true, irma: true, neoVasc: true, vhPrh: false, csme: 'csme' } },
  ],
  info: `### Для чего используется
Классификация **диабетической ретинопатии (ДР)** по упрощённой ETDRS / International Clinical DR scale + **диабетический макулярный отёк (ДМО / DME)**.

### Стадии
| Стадия | Находки |
|---|---|
| Без ДР | Нет |
| Mild NPDR | Микроаневризмы |
| Moderate NPDR | Больше mild, не достигает severe |
| Severe NPDR (правило 4:2:1) | Любое одно |
| Very severe NPDR | ≥ 2 из 4:2:1 |
| PDR | Неоваскуляризация / VH / PRH |

### Правило 4:2:1 (для severe NPDR)
- **4** — геморрагии ≥ 20 в каждом из 4 квадрантов
- **2** — венозные чётки ≥ 2 квадрантов
- **1** — IRMA ≥ 1 квадрант

### ДМО (DME)
- **CSME (ETDRS)** — классические критерии
- **Center-involved DME (CI-DME)** — современное определение по OCT

### Риски прогрессии
| Стадия | PDR в 1 год |
|---|---|
| Mild | 5% |
| Moderate | 15-25% |
| Severe | 15-50% |
| Very severe | 50% |

### Терапия
- **PRP** — для PDR, high-risk PDR (DRS critical level)
- **Anti-VEGF** — CI-DME, non-clearing VH, альтернатива PRP при PDR
- **Витрэктомия** — tractional RD, non-clearing VH

### Источник
ETDRS Report 10 (1991). AAO DR PPP 2019. Protocol W (2021).`,
};

export default runner;

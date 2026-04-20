// @ts-nocheck
/** Runner: code-stemi - STEMI Alert Protocol */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'fmcTime',
      label: 'FMC (first medical contact), мин от симптомов',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 720,
      step: 1,
      quickValues: [30, 60, 120, 180, 360],
    },
    {
      id: 'ecgTime',
      label: 'Время до ЭКГ от FMC',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 60,
      step: 1,
      quickValues: [5, 8, 10, 15, 20],
    },
    {
      id: 'cathActivation',
      label: 'Время активации cath lab от ЭКГ',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 60,
      step: 1,
      quickValues: [5, 10, 15, 20],
    },
    {
      id: 'dtb',
      label: 'Door-to-Balloon / FMC2B',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 300,
      step: 1,
      quickValues: [60, 75, 90, 120, 150],
    },
    {
      id: 'transport',
      label: 'Маршрут',
      type: 'select',
      options: [
        { value: 'direct', label: 'Прямая доставка в PCI-центр (FMC2B ≤ 120)' },
        { value: 'transfer', label: 'Transfer из non-PCI (D2B ≤ 90)' },
        { value: 'primary', label: 'Первичное поступление PCI-центр (D2B ≤ 90)' },
      ],
    },
  ],
  compute: (v) => {
    const fmc = Number(v.fmcTime) || 0;
    const ecg = Number(v.ecgTime) || 0;
    const cath = Number(v.cathActivation) || 0;
    const dtb = Number(v.dtb) || 0;
    const route = String(v.transport || 'primary');

    const target = route === 'direct' ? 120 : 90;
    const ecgOk = ecg > 0 && ecg <= 10;
    const dtbOk = dtb > 0 && dtb <= target;

    const checks = [
      ecgOk ? `ЭКГ за ${ecg} мин ≤ 10 - OK` : `ЭКГ за ${ecg} мин > 10 - МИСС (target ≤ 10 мин)`,
      cath > 0 ? `Cath активация за ${cath} мин от ЭКГ` : 'Cath активация не задана',
      dtbOk ? `${route === 'direct' ? 'FMC2B' : 'D2B'} ${dtb} мин ≤ ${target} - OK` : `${route === 'direct' ? 'FMC2B' : 'D2B'} ${dtb} мин > ${target} - МИСС`,
    ];

    let color = '#22C55E';
    let verdict = 'Все метрики выполнены';
    if (!ecgOk && !dtbOk) { color = '#EF4444'; verdict = 'Провал обеих ключевых метрик'; }
    else if (!ecgOk || !dtbOk) { color = '#F59E0B'; verdict = 'Одна метрика не выполнена'; }

    const totalIschemia = fmc + dtb;

    return {
      value: verdict,
      unit: '',
      interpretation: `Code STEMI: ЭКГ ${ecg} мин (target ≤ 10), ${route === 'direct' ? 'FMC2B' : 'D2B'} ${dtb} мин (target ≤ ${target}). Общее время ишемии: ${totalIschemia} мин.`,
      color,
      details: `Протокол Code STEMI (AHA/ACC 2021 + ESC 2023):\n• FMC ECG ≤ 10 мин\n• Prehospital ECG + активация cath lab напрямую из СМП\n• Single-call activation (bypass ED при прямой доставке)\n• D2B ≤ 90 мин (primary PCI)\n• FMC2B ≤ 120 мин (transfer)\n• Если PCI невозможен за 120 мин - фибринолиз ≤ 30 мин от FMC\n• Total ischemic time - ключевой предиктор смертности`,
      actions: [
        ...checks,
        'Активировать cath lab ПО ТЕЛЕФОНУ с данными ЭКГ (пре-госпитальная ЭКГ → смс/факс)',
        'ASA 162-325 мг разжевать + P2Y12 (tikagrelor 180 / prasugrel 60 / clopidogrel 600)',
        'Антикоагуляция: гепарин 70-100 Ед/кг болюс или bivalirudin',
        'O₂ только при SpO₂ < 90%',
        'Нитроглицерин 0.4 мг SL × 3 (если САД > 90, нет ИМ правого)',
        'Морфин 2-4 мг в/в при сохраняющейся боли (осторожно - задерживает P2Y12)',
        'β-блокатор в первые 24 ч (если нет шока/острой СН)',
        'Transfer план Б: если FMC2B > 120 мин → fibrinolysis ≤ 30 мин от FMC',
        'Post-PCI: DAPT 12 мес, statin high-intensity, β-блокатор, ACEi, MRA при EF < 40%',
      ],
      caveats: [
        'Морфин задерживает всасывание P2Y12 ингибиторов (CIRCUS, IMPRESSION)',
        'Нитраты противопоказаны при ИМ правого желудочка, САД < 90, использование ФДЭ-5 < 24-48 ч',
        'Prasugrel противопоказан при ТИА/инсульте, возрасте ≥ 75, массе < 60 кг',
        'Fibrinolysis противопоказан при активном кровотечении, ГИ инсульте в анамнезе, ЧМТ < 3 мес',
        'Cardiogenic shock (SCAI C-E) → primary PCI независимо от времени',
      ],
      scale: {
        segments: [
          { label: '≤ 60 мин', min: 0, max: 60, color: '#22C55E', description: 'Отлично' },
          { label: '61-90', min: 61, max: 90, color: '#10B981', description: 'Target достигнут' },
          { label: '91-120', min: 91, max: 120, color: '#F59E0B', description: 'FMC2B граница' },
          { label: '> 120', min: 121, max: 300, color: '#EF4444', description: 'Провал D2B' },
        ],
        current: dtb,
        unit: 'мин',
      },
      related: [
        { id: 'gwtg', title: 'AHA GWTG' },
        { id: 'door-to', title: 'Door-to-X' },
        { id: 'timi-stemi', title: 'TIMI STEMI' },
        { id: 'killip', title: 'Killip class' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Кардиология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Lawton JS et al. 2021 ACC/AHA/SCAI Guideline for Coronary Revascularization. Circulation 2022;145:e18. Byrne RA et al. ESC Guidelines for ACS 2023. Eur Heart J 2023;44:3720.',
  countries: 'США (AHA/ACC), ЕС (ESC), РФ',
  presets: [
    { label: 'Идеал: ЭКГ 8, D2B 60', values: { fmcTime: 60, ecgTime: 8, cathActivation: 10, dtb: 60, transport: 'primary' } },
    { label: 'Transfer FMC2B 110', values: { fmcTime: 90, ecgTime: 7, cathActivation: 12, dtb: 110, transport: 'direct' } },
    { label: 'Провал: ЭКГ 20, D2B 130', values: { fmcTime: 120, ecgTime: 20, cathActivation: 25, dtb: 130, transport: 'primary' } },
    { label: 'Transfer провал 150', values: { fmcTime: 90, ecgTime: 10, cathActivation: 15, dtb: 150, transport: 'transfer' } },
  ],
  info: `### Для чего используется
**Code STEMI** - больничный / региональный протокол быстрой реперфузии при STEMI с ключевыми временными метриками.

### Целевые метрики
| Метрика | Target |
|---|---|
| FMC → ECG | ≤ 10 мин |
| Primary PCI D2B | ≤ 90 мин |
| Transfer FMC2B | ≤ 120 мин |
| Fibrinolysis D2N | ≤ 30 мин (если PCI > 120) |

### Single-call activation
Пре-госпитальная ЭКГ → звонок диспетчера → активация cath lab напрямую (bypass ED).

### Total ischemic time
FMC + D2B - ключевой предиктор 1-год смертности. Каждые 30 мин задержки = +7.5% смертности.

### Источники
ACC/AHA/SCAI 2021. *Circulation* 2022;145:e18.
ESC ACS 2023. *EHJ* 2023;44:3720.
`,
};
export default runner;

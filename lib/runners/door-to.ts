// @ts-nocheck
/** Runner: door-to — Door-to-X metrics bundle */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'metric',
      label: 'Метрика',
      type: 'select',
      options: [
        { value: 'needle', label: 'Door-to-Needle (tPA, инсульт)' },
        { value: 'balloon', label: 'Door-to-Balloon (STEMI, PCI)' },
        { value: 'ct', label: 'Door-to-CT (инсульт, ≤ 25 мин)' },
        { value: 'eeg', label: 'Door-to-EEG (судорожный статус, ≤ 60 мин)' },
        { value: 'abx', label: 'Door-to-Antibiotic (сепсис, ≤ 60 мин)' },
      ],
    },
    {
      id: 'actualTime',
      label: 'Фактическое время от поступления',
      type: 'number',
      unit: 'мин',
      min: 0,
      max: 600,
      step: 1,
      quickValues: [15, 30, 45, 60, 90, 120],
    },
  ],
  compute: (v) => {
    const m = String(v.metric || 'needle');
    const t = Number(v.actualTime) || 0;

    const targets: Record<string, { target: number; name: string; source: string }> = {
      needle: { target: 60, name: 'Door-to-Needle', source: 'AHA/ASA, tPA ≤ 60 мин (Elite ≤ 45, Elite+ ≤ 30)' },
      balloon: { target: 90, name: 'Door-to-Balloon', source: 'ACC/AHA primary PCI ≤ 90 мин' },
      ct: { target: 25, name: 'Door-to-CT', source: 'AHA stroke ≤ 25 мин' },
      eeg: { target: 60, name: 'Door-to-EEG', source: 'ACNS / NCS status ≤ 60 мин' },
      abx: { target: 60, name: 'Door-to-Antibiotic', source: 'SSC 2021 sepsis hour-1 bundle ≤ 60 мин' },
    };

    const cfg = targets[m];
    const delta = t - cfg.target;
    const onTarget = t > 0 && t <= cfg.target;

    let color = '#22C55E';
    let verdict = `${cfg.name} ${t} мин ≤ ${cfg.target} — target достигнут`;
    if (t === 0) { color = '#6B7280'; verdict = 'Нет данных'; }
    else if (!onTarget) {
      if (delta > cfg.target) { color = '#EF4444'; verdict = `${cfg.name} ${t} мин — критическая задержка (+${delta} мин)`; }
      else { color = '#F59E0B'; verdict = `${cfg.name} ${t} мин > ${cfg.target} (+${delta} мин)`; }
    }

    return {
      value: `${t} мин`,
      unit: `target ≤ ${cfg.target}`,
      interpretation: verdict,
      color,
      details: `${cfg.source}. Фактическое ${t} мин vs target ${cfg.target} мин (разница ${delta > 0 ? '+' : ''}${delta} мин).`,
      actions: [
        'Пре-нотификация СМП — бригада предупреждает госпиталь',
        'Параллельная обработка: триаж + ЭКГ / КТ + лаб одновременно',
        'Stroke: КТ head без контраста → если нет кровоизлияния → tPA',
        'STEMI: ЭКГ ≤ 10 мин → активация cath lab single-call',
        'Сепсис: lactate + посев крови + антибиотик в первый час',
        'Судорожный статус: лоразепам 4 мг × 2 → фенитоин/леветирацетам → EEG',
        'Audit: ежемесячный разбор всех case > target + root-cause',
      ],
      caveats: [
        'D2N 60 мин — минимальный target; Elite ≤ 45 мин; Elite Plus ≤ 30 мин',
        'D2B 90 мин — только primary PCI (non-transfer)',
        'D2A для сепсиса: SSC 2021 снизил бандл с 3 ч до 1 ч — спорно, см. ProCESS, ARISE, ProMISe',
        'Временные метрики без клинической пользы = чисто bureaucratic target',
        'Exclusion: учитывать противопоказания (tPA, PCI) — не штрафовать за правильный отказ',
      ],
      scale: {
        segments: [
          { label: '≤ target', min: 0, max: cfg.target, color: '#22C55E', description: 'Выполнено' },
          { label: `${cfg.target + 1}–${cfg.target * 2}`, min: cfg.target + 1, max: cfg.target * 2, color: '#F59E0B', description: 'Задержка' },
          { label: `> ${cfg.target * 2}`, min: cfg.target * 2 + 1, max: 600, color: '#EF4444', description: 'Критично' },
        ],
        current: t,
        unit: 'мин',
      },
      related: [
        { id: 'code-stemi', title: 'Code STEMI' },
        { id: 'gwtg', title: 'AHA GWTG' },
        { id: 'nihss', title: 'NIHSS' },
        { id: 'qsofa', title: 'qSOFA' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Powers WJ et al. 2019 AHA/ASA Stroke Guidelines. Stroke 2019;50:e344. Lawton JS et al. 2021 ACC/AHA PCI. Circulation 2022;145:e18. Evans L et al. SSC 2021 sepsis. Crit Care Med 2021;49:e1063.',
  countries: 'США (AHA/ACC), ЕС, международно',
  presets: [
    { label: 'D2N 45 мин (Elite)', values: { metric: 'needle', actualTime: 45 } },
    { label: 'D2B 75 мин (OK)', values: { metric: 'balloon', actualTime: 75 } },
    { label: 'D2CT 20 мин (OK)', values: { metric: 'ct', actualTime: 20 } },
    { label: 'Sepsis D2Abx 90 мин (fail)', values: { metric: 'abx', actualTime: 90 } },
    { label: 'D2EEG 120 мин (задержка)', values: { metric: 'eeg', actualTime: 120 } },
  ],
  info: `### Для чего используется
**Door-to-X metrics** — временные индикаторы качества неотложной помощи.

### Target-таблица
| Метрика | Target | Источник |
|---|---|---|
| Door-to-Needle (tPA) | ≤ 60 (Elite ≤ 45, Elite+ ≤ 30) | AHA/ASA |
| Door-to-Balloon (PCI) | ≤ 90 мин | ACC/AHA |
| Door-to-CT (stroke) | ≤ 25 мин | AHA |
| Door-to-EEG (status) | ≤ 60 мин | ACNS |
| Door-to-Antibiotic (sepsis) | ≤ 60 мин (hour-1) | SSC 2021 |

### Ключевые принципы
- Параллельная, а не последовательная обработка
- Pre-hospital notification + единый трек активации
- Single-call activation для cath lab / stroke team

### Источники
AHA/ASA Stroke 2019. *Stroke* 2019;50:e344.
ACC/AHA PCI 2021. *Circulation* 2022;145:e18.
SSC Sepsis 2021. *CCM* 2021;49:e1063.
`,
};
export default runner;

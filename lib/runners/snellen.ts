/** Runner: snellen - Snellen visual acuity + logMAR + WHO impairment */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'snellen',
      label: 'Острота зрения (Snellen)',
      type: 'select',
      options: [
        { value: '6/3', label: '6/3 (20/10)' },
        { value: '6/6', label: '6/6 (20/20) — норма' },
        { value: '6/7.5', label: '6/7.5 (20/25)' },
        { value: '6/9', label: '6/9 (20/30)' },
        { value: '6/12', label: '6/12 (20/40)' },
        { value: '6/18', label: '6/18 (20/60)' },
        { value: '6/24', label: '6/24 (20/80)' },
        { value: '6/36', label: '6/36 (20/120)' },
        { value: '6/60', label: '6/60 (20/200) — слабовидение' },
        { value: '3/60', label: '3/60 (20/400)' },
        { value: '1/60', label: '1/60 (счёт пальцев 1 м)' },
        { value: 'HM', label: 'HM (движение руки)' },
        { value: 'LP', label: 'LP (светоощущение)' },
        { value: 'NLP', label: 'NLP (0, нет светоощущения)' },
      ],
    },
    { id: 'eye', label: 'Глаз', type: 'select', options: [{ value: 'od', label: 'OD (правый)' }, { value: 'os', label: 'OS (левый)' }, { value: 'ou', label: 'OU (оба)' }] },
  ],
  compute: (v) => {
    const map: Record<string, { logMAR: number; decimal: number }> = {
      '6/3': { logMAR: -0.3, decimal: 2.0 },
      '6/6': { logMAR: 0.0, decimal: 1.0 },
      '6/7.5': { logMAR: 0.1, decimal: 0.8 },
      '6/9': { logMAR: 0.18, decimal: 0.67 },
      '6/12': { logMAR: 0.30, decimal: 0.5 },
      '6/18': { logMAR: 0.48, decimal: 0.33 },
      '6/24': { logMAR: 0.60, decimal: 0.25 },
      '6/36': { logMAR: 0.78, decimal: 0.17 },
      '6/60': { logMAR: 1.0, decimal: 0.1 },
      '3/60': { logMAR: 1.3, decimal: 0.05 },
      '1/60': { logMAR: 1.8, decimal: 0.017 },
      HM: { logMAR: 2.3, decimal: 0.005 },
      LP: { logMAR: 2.7, decimal: 0.002 },
      NLP: { logMAR: 3.0, decimal: 0 },
    };
    const key = String(v.snellen || '6/6');
    const d = (map[key] || map['6/6'])!;
    const logMAR = d.logMAR;

    let band = '', color = '#22C55E', details = '';
    if (logMAR <= 0.3) { // better than 6/12
      band = 'Норма / близко к норме';
      color = '#22C55E';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}, decimal ${d.decimal.toFixed(2)}. WHO: нормальное зрение (VA ≥ 6/18).`;
    } else if (logMAR <= 0.48) {
      band = 'Лёгкое снижение';
      color = '#84CC16';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}. Mild vision impairment (WHO Category 0).`;
    } else if (logMAR <= 1.0) {
      band = 'Умеренное слабовидение';
      color = '#F59E0B';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}. WHO Category 1 (moderate): VA < 6/18 до 6/60.`;
    } else if (logMAR <= 1.3) {
      band = 'Тяжёлое слабовидение';
      color = '#FB923C';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}. WHO Category 2 (severe): VA < 6/60 до 3/60.`;
    } else if (logMAR <= 2.0) {
      band = 'Слепота (3 кат.)';
      color = '#EF4444';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}. WHO Category 3 blindness: VA < 3/60 до 1/60.`;
    } else if (logMAR <= 2.7) {
      band = 'Слепота (4 кат.)';
      color = '#991B1B';
      details = `Snellen ${key}, logMAR ${logMAR.toFixed(2)}. WHO Category 4: < 1/60 до LP.`;
    } else {
      band = 'Слепота (5 кат., NLP)';
      color = '#4C1D24';
      details = `NLP — нет светоощущения. WHO Category 5 total blindness.`;
    }

    return {
      value: `logMAR ${logMAR.toFixed(2)}`,
      unit: d.decimal ? `decimal ${d.decimal.toFixed(2)}` : 'NLP',
      interpretation: band,
      color,
      details,
      actions: [
        'Проверка с коррекцией (best-corrected VA), pinhole',
        logMAR > 0.3 ? 'Рефрактометрия, осмотр переднего отрезка + глазного дна' : 'Ежегодный офтальмологический осмотр',
        logMAR > 0.48 ? 'Поиск причины: катаракта, глаукома, AMD, диабетическая ретинопатия' : '',
        logMAR > 1.0 ? 'Регистрация слабовидения, социальная реабилитация, low-vision aids' : '',
        logMAR > 1.3 ? 'Оформление группы инвалидности по зрению' : '',
      ].filter(Boolean),
      caveats: [
        'Snellen 6/6 = 20/20 (фут) = 1.0 (decimal) = 0 logMAR',
        'ETDRS charts точнее Snellen (logMAR-based), рекомендованы для RCT',
        'Для низкой остроты: HM (hand motion), LP (light perception), NLP',
        'Всегда указывать условия: с/без коррекции, освещение, расстояние',
        'Pinhole VA — разделяет рефракционные и органические причины',
        'WHO категории инвалидизации по лучшему глазу с коррекцией',
      ],
      scale: {
        segments: [
          { min: -30, max: 30, label: 'Норма', color: '#22C55E' },
          { min: 31, max: 48, label: 'Лёгкое', color: '#84CC16' },
          { min: 49, max: 100, label: 'Умер.', color: '#F59E0B' },
          { min: 101, max: 130, label: 'Тяж.', color: '#FB923C' },
          { min: 131, max: 200, label: 'Слепота 3', color: '#EF4444' },
          { min: 201, max: 270, label: 'Слепота 4', color: '#991B1B' },
          { min: 271, max: 300, label: 'NLP', color: '#4C1D24' },
        ],
        current: Math.round(logMAR * 100),
        unit: 'logMAR ×100',
      },
      related: [{ id: 'amsler', title: 'Amsler' }, { id: 'iop', title: 'IOP' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Snellen H. Probebuchstaben zur Bestimmung der Sehschärfe 1862. WHO ICD-11 Visual Impairment Categories. ETDRS logMAR chart.',
  countries: 'Международный (WHO / ICD-11)',
  presets: [
    { label: 'Норма (6/6)', values: { snellen: '6/6', eye: 'od' } },
    { label: 'Умеренное (6/24)', values: { snellen: '6/24', eye: 'od' } },
    { label: 'Слабовидение (6/60)', values: { snellen: '6/60', eye: 'od' } },
    { label: 'Слепота (LP)', values: { snellen: 'LP', eye: 'od' } },
  ],
  info: `
### Для чего используется
Оценка **остроты зрения (VA)** по таблице Snellen с конвертацией в logMAR и категории слабовидения WHO.

### Формула
\`logMAR = −log10(decimal VA) = log10(denom/num)\` (для 6/м или 20/ft)

### Соответствия
| Snellen (6/м) | 20/ft | Decimal | logMAR |
|---|---|---|---|
| 6/6 | 20/20 | 1.0 | 0.0 |
| 6/12 | 20/40 | 0.5 | 0.30 |
| 6/18 | 20/60 | 0.33 | 0.48 |
| 6/60 | 20/200 | 0.1 | 1.0 |
| 3/60 | 20/400 | 0.05 | 1.3 |

### WHO / ICD-11 категории (по лучшему глазу с коррекцией)
| Категория | VA (Snellen) |
|---|---|
| 0 (норма / лёгкое) | ≥ 6/18 |
| 1 moderate | < 6/18 до 6/60 |
| 2 severe | < 6/60 до 3/60 |
| 3 blindness | < 3/60 до 1/60 |
| 4 blindness | < 1/60 до LP |
| 5 blindness | NLP |

### Почему logMAR лучше
- Линейная шкала — пригодна для усреднения, статистики
- Равномерный прогресс букв (5 букв на строку)
- Стандарт ETDRS (clinical trials)

### Источник
Snellen 1862. WHO ICD-11. ETDRS.`,
};

export default runner;

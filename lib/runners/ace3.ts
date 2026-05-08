/** Runner: ace3 - Addenbrooke's Cognitive Examination-III */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'attention', label: 'Внимание и ориентация (/18)', type: 'number', min: 0, max: 18, step: 1, quickValues: [18, 15, 12, 8] },
    { id: 'memory', label: 'Память (/26)', type: 'number', min: 0, max: 26, step: 1, quickValues: [26, 20, 15, 10] },
    { id: 'fluency', label: 'Беглость речи (/14)', type: 'number', min: 0, max: 14, step: 1, quickValues: [14, 10, 7, 4] },
    { id: 'language', label: 'Речь (/26)', type: 'number', min: 0, max: 26, step: 1, quickValues: [26, 22, 18, 14] },
    { id: 'visuospatial', label: 'Зрительно-пространственные (/16)', type: 'number', min: 0, max: 16, step: 1, quickValues: [16, 13, 10, 7] },
  ],
  compute: (v) => {
    const a = Number(v.attention) || 0;
    const m = Number(v.memory) || 0;
    const f = Number(v.fluency) || 0;
    const l = Number(v.language) || 0;
    const vs = Number(v.visuospatial) || 0;
    const total = a + m + f + l + vs;

    let band = '', color = '#22C55E', details = '', actions = [];
    if (total >= 89) {
      band = 'Норма (≥89)';
      details = `ACE-III ${total}/100 - нормальное когнитивное функционирование.`;
      actions = ['Повтор при жалобах пациента', 'Ежегодная оценка у пожилых > 65'];
    } else if (total >= 83) {
      band = 'Субъективные жалобы / MCI возможно';
      color = '#84CC16';
      details = `ACE-III ${total}/100 - лёгкое когнитивное снижение возможно.`;
      actions = ['MoCA для уточнения', 'Нейропсихологическое тестирование', 'МРТ + PET при прогрессии'];
    } else if (total >= 76) {
      band = 'MCI или ранняя деменция';
      color = '#F59E0B';
      details = `ACE-III ${total}/100 - вероятно лёгкое когнитивное расстройство (MCI).`;
      actions = [
        'Полное нейрокогнитивное обследование',
        'MoCA, CDR, FAQ',
        'МРТ мозга (атрофия гиппокампа)',
        'CSF tau/Aβ42 или PET (амилоид) - предиктор конверсии в AD',
      ];
    } else {
      band = 'Деменция (≤75)';
      color = '#EF4444';
      details = `ACE-III ${total}/100 - вероятна деменция.`;
      actions = [
        'МРТ / КТ мозга (структура + исключить обратимые: НГ, субдуральный, NPH)',
        'Лабораторные: ТТГ, B12, folate, RPR',
        'Дифф. диагноз: AD vs сосуд. vs ДЛТ vs FTD',
        'Ингибиторы АХЭ (донепезил, ривастигмин) при AD',
        'Планирование помощи, safe-driving assessment',
      ];
    }

    // Domain-specific analysis
    const breakdown = [];
    if (a < 15) breakdown.push(`Внимание ${a}/18 снижено (норма ≥ 15)`);
    if (m < 20) breakdown.push(`Память ${m}/26 снижена (норма ≥ 20)`);
    if (f < 10) breakdown.push(`Беглость ${f}/14 снижена (норма ≥ 10)`);
    if (l < 22) breakdown.push(`Речь ${l}/26 снижена (норма ≥ 22)`);
    if (vs < 13) breakdown.push(`Зрит.-простр. ${vs}/16 снижены (норма ≥ 13)`);

    return {
      value: String(total), unit: '/100',
      interpretation: band, color,
      details: details + (breakdown.length ? ' ' + breakdown.join('; ') + '.' : ''),
      actions,
      caveats: [
        'Cut-off ≥ 88: Se 94 %, Sp 89 % для деменции (Hsieh 2013)',
        'Cut-off ≥ 82: Se 82 %, Sp 96 % для MCI',
        'Занимает ~15-20 мин, требует обучения оценщика',
        'Возможны культурные/языковые влияния - русская валидация есть',
        'Альтернативы: MoCA (30), MMSE (30)',
      ],
      scale: {
        segments: [
          { min: 0, max: 75, label: 'Деменция', color: '#EF4444' },
          { min: 76, max: 82, label: 'MCI / ранняя', color: '#F59E0B' },
          { min: 83, max: 88, label: 'Субъект.', color: '#84CC16' },
          { min: 89, max: 100, label: 'Норма', color: '#22C55E' },
        ],
        current: total,
        unit: 'ACE-III',
      },
      related: [{ id: 'moca', title: 'MoCA' }, { id: 'mmse', title: 'MMSE' }, { id: 'cdr', title: 'CDR' }],
      relatedCourses: [{ id: '310.3', title: 'Деменция и MCI' }],
    };
  },
  reference: 'Hsieh S et al. Validation of the Addenbrooke\'s Cognitive Examination-III. Dement Geriatr Cogn Disord 2013;36:242.',
  countries: 'Международный (Cambridge)',
  presets: [
    { label: 'Норма (92)', values: { attention: 17, memory: 24, fluency: 13, language: 24, visuospatial: 14 } },
    { label: 'MCI (80)', values: { attention: 15, memory: 16, fluency: 10, language: 22, visuospatial: 13 } },
    { label: 'Деменция (65)', values: { attention: 12, memory: 10, fluency: 6, language: 18, visuospatial: 9 } },
  ],
  info: `### Для чего используется
ACE-III - скрининг и мониторинг деменции + MCI. 5 когнитивных доменов, суммарно 100 баллов.

### Домены
| Домен | Max | Норма |
|---|---|---|
| Внимание/ориентация | 18 | ≥ 15 |
| Память | 26 | ≥ 20 |
| Беглость речи | 14 | ≥ 10 |
| Речь | 26 | ≥ 22 |
| Зрительно-пространств. | 16 | ≥ 13 |
| **Total** | **100** | — |

### Cut-offs (Hsieh 2013)
| Порог | Se / Sp | Значение |
|---|---|---|
| ≥ 89 | — | Норма |
| 83-88 | 88 % / 96 % | Субъективные жалобы, MCI возможно |
| 76-82 | 82 % / 96 % | MCI/ранняя деменция |
| ≤ 75 | 94 % / 89 % | Деменция |

### Доменные паттерны
- **AD**: память + беглость + речь
- **FTD**: беглость + (язык/поведение)
- **VD**: внимание + исполнительные

### Источник
Hsieh S et al. ACE-III validation. Dement Geriatr Cogn Disord 2013;36:242-250. Matías-Guiu JA et al. Spanish validation.`,
};

export default runner;

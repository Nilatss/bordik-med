/** Runner: areds - AREDS simplified 5-year risk of advanced AMD */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'largeDrusenOD', label: 'OD: крупные друзы (≥ 125 мкм)', type: 'checkbox' },
    { id: 'pigmentOD', label: 'OD: пигментные изменения', type: 'checkbox' },
    { id: 'largeDrusenOS', label: 'OS: крупные друзы (≥ 125 мкм)', type: 'checkbox' },
    { id: 'pigmentOS', label: 'OS: пигментные изменения', type: 'checkbox' },
    { id: 'advancedFellow', label: 'Продвинутая AMD в одном глазу (GA или neovascular)', type: 'checkbox' },
    { id: 'bilateralIntermediate', label: 'Двусторонние промежуточные друзы (без крупных)', type: 'checkbox' },
  ],
  compute: (v) => {
    const ldOD = !!v.largeDrusenOD;
    const pigOD = !!v.pigmentOD;
    const ldOS = !!v.largeDrusenOS;
    const pigOS = !!v.pigmentOS;
    const advFellow = !!v.advancedFellow;
    const biInt = !!v.bilateralIntermediate;

    let score = 0;
    score += ldOD ? 1 : 0;
    score += ldOS ? 1 : 0;
    score += pigOD ? 1 : 0;
    score += pigOS ? 1 : 0;
    if (biInt && !ldOD && !ldOS) score = 1; // bilateral intermediate drusen count as 1
    if (advFellow) score = 4; // if advanced AMD in one eye, automatically score 4

    // AREDS Simplified Severity Scale 5-year risk
    const riskMap: Record<number, string> = {
      0: '0.5%',
      1: '3%',
      2: '12%',
      3: '25%',
      4: '50%',
    };
    const risk = riskMap[Math.min(4, score)] || '<1%';

    let band = '', color = '#22C55E', details = '';
    if (score === 0) {
      band = 'Очень низкий риск';
      color = '#22C55E';
      details = `AREDS 0: 5-летний риск продвинутой AMD ${risk}. Нет значимых друз/пигмента.`;
    } else if (score === 1) {
      band = 'Низкий риск';
      color = '#84CC16';
      details = `AREDS 1: риск ${risk}. Либо крупные друзы в одном глазу, либо пигмент в одном, либо двусторонние промежуточные друзы.`;
    } else if (score === 2) {
      band = 'Умеренный риск';
      color = '#F59E0B';
      details = `AREDS 2: риск ${risk}. Сочетание друзы/пигмент в разных глазах.`;
    } else if (score === 3) {
      band = 'Высокий риск';
      color = '#FB923C';
      details = `AREDS 3: риск ${risk}. Множественные факторы, AREDS2 formula настоятельно показана.`;
    } else {
      band = 'Очень высокий риск';
      color = '#EF4444';
      details = `AREDS 4: риск ${risk} в 5 лет. ${advFellow ? 'Продвинутая AMD в одном глазу — второй под высокой угрозой.' : 'Все 4 фактора риска.'}`;
    }

    return {
      value: String(score),
      unit: '/4 (5-yr risk ' + risk + ')',
      interpretation: band,
      color,
      details,
      actions: [
        score >= 2 ? 'AREDS2 formula: vit C 500 мг, vit E 400 МЕ, лютеин 10 мг, зеаксантин 2 мг, Zn 25-80 мг, Cu 2 мг' : '',
        score >= 3 ? 'ЕЖЕДНЕВНЫЙ Amsler grid домашний мониторинг' : '',
        score >= 3 ? 'Офтальмоскопия 6-12 мес, OCT макулы' : '',
        'Отказ от курения (удваивает риск)',
        'Солнцезащитные очки UV, средиземноморская диета, омега-3',
        'Контроль АД, липидов, СД, кардиоваскулярный риск',
        advFellow ? 'Срочно: при появлении метаморфопсий / скотомы → немедленно OCT + анти-VEGF окно' : '',
      ].filter(Boolean),
      caveats: [
        'AREDS2 исключил β-каротин (риск рака лёгкого у курильщиков), добавил лютеин/зеаксантин',
        'β-каротин НЕ давать курильщикам (15+ лет) — риск рака лёгких',
        'AREDS2 формула не замедляет прогрессию у пациентов с AREDS 0-1',
        'Крупные друзы = ≥ 125 мкм (эквивалент ширине крупной вены около ДЗН)',
        'Промежуточные друзы = 63-125 мкм',
        'GA (географическая атрофия) = продвинутая сухая AMD',
        'Simplified scale отличается от AREDS 9-step severity scale',
        'Генетический тест (CFH, ARMS2) не изменяет рекомендации — не рутина',
      ],
      scale: {
        segments: [
          { min: 0, max: 0, label: '0 (0.5%)', color: '#22C55E' },
          { min: 1, max: 1, label: '1 (3%)', color: '#84CC16' },
          { min: 2, max: 2, label: '2 (12%)', color: '#F59E0B' },
          { min: 3, max: 3, label: '3 (25%)', color: '#FB923C' },
          { min: 4, max: 4, label: '4 (50%)', color: '#EF4444' },
        ],
        current: Math.min(4, score),
        unit: 'AREDS',
      },
      related: [{ id: 'amsler', title: 'Amsler' }, { id: 'snellen', title: 'Snellen' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Ferris FL et al. A simplified severity scale for AMD: AREDS Report No. 18. Arch Ophthalmol 2005;123:1570. AREDS2 Research Group. JAMA 2013;309:2005.',
  countries: 'США (NEI / AREDS)',
  presets: [
    { label: 'Нет факторов', values: { largeDrusenOD: false, pigmentOD: false, largeDrusenOS: false, pigmentOS: false, advancedFellow: false, bilateralIntermediate: false } },
    { label: 'AREDS 2', values: { largeDrusenOD: true, pigmentOD: false, largeDrusenOS: false, pigmentOS: true, advancedFellow: false, bilateralIntermediate: false } },
    { label: 'AREDS 4 (двусторонне)', values: { largeDrusenOD: true, pigmentOD: true, largeDrusenOS: true, pigmentOS: true, advancedFellow: false, bilateralIntermediate: false } },
    { label: 'AMD в 1 глазу', values: { largeDrusenOD: true, pigmentOD: true, largeDrusenOS: false, pigmentOS: false, advancedFellow: true, bilateralIntermediate: false } },
  ],
  info: `### Для чего используется
**AREDS Simplified Severity Scale** — прогноз 5-летнего риска развития **продвинутой AMD** (GA или neovascular) по простым признакам глазного дна.

### Шкала (0-4 балла)
За каждый глаз начисляется:
- **+1** за крупные друзы (≥ 125 мкм)
- **+1** за пигментные изменения

Сумма по обоим глазам = 0-4. При **двусторонних промежуточных друзах без крупных** = 1 балл. При **продвинутой AMD в одном глазу** = автоматически 4 балла.

### 5-летний риск продвинутой AMD
| Балл | Риск |
|---|---|
| 0 | 0.5% |
| 1 | 3% |
| 2 | 12% |
| 3 | 25% |
| 4 | 50% |

### AREDS2 формула (рекомендована при ≥ AREDS 2)
- Витамин C 500 мг
- Витамин E 400 МЕ
- **Лютеин 10 мг + Зеаксантин 2 мг** (заменили β-каротин)
- Цинк 25-80 мг (оксид)
- Медь 2 мг (против анемии от цинка)

### Кого НЕ лечить AREDS2
- AREDS 0-1 — доказанной пользы нет
- Продвинутая AMD в обоих глазах — уже поздно
- Курильщиков не давать β-каротин (рак лёгкого)

### Модифицируемые факторы
- **Курение** — RR 2-3 × риск прогрессии
- Ожирение, HTN, гиперлипидемия
- Диета: средиземноморская, рыба ≥ 2 р/нед

### Источник
AREDS Report 18 (2005). AREDS2 JAMA 2013;309:2005.`,
};

export default runner;

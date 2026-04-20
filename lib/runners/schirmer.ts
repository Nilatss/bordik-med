// @ts-nocheck
/** Runner: schirmer - Schirmer test for dry eye */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'wetting', label: 'Увлажнение полоски за 5 мин (мм)', type: 'number', min: 0, max: 35, step: 1, quickValues: [3, 8, 12, 20] },
    { id: 'anesthesia', label: 'Тип теста', type: 'select', options: [{ value: 'i', label: 'Schirmer I (без анестезии) — базальная + рефлекторная' }, { value: 'ii', label: 'Schirmer II (с анестезией) — только базальная' }] },
  ],
  compute: (v) => {
    const mm = Math.max(0, Number(v.wetting) || 0);
    const mode = String(v.anesthesia || 'i');
    // Schirmer I: normal >15, borderline 10-15, abnormal <10, severe <5
    // Schirmer II (with anesthesia): normal >10, abnormal <5

    let band = '', color = '#22C55E', details = '';
    if (mode === 'i') {
      if (mm > 15) {
        band = 'Норма';
        color = '#22C55E';
        details = `Schirmer I ${mm} мм/5 мин > 15 — норма слёзной секреции (базальная + рефлекторная).`;
      } else if (mm >= 10) {
        band = 'Пограничное';
        color = '#84CC16';
        details = `Schirmer I ${mm} мм — пограничное (10-15). Возможен субклинический ССГ.`;
      } else if (mm >= 5) {
        band = 'Умеренный ССГ';
        color = '#F59E0B';
        details = `Schirmer I ${mm} мм < 10 — умеренный синдром сухого глаза (DEWS II).`;
      } else {
        band = 'Тяжёлый ССГ';
        color = '#EF4444';
        details = `Schirmer I ${mm} мм < 5 — тяжёлый ССГ, возможен синдром Шегрена.`;
      }
    } else {
      if (mm > 10) {
        band = 'Норма';
        color = '#22C55E';
        details = `Schirmer II ${mm} мм > 10 — нормальная базальная секреция (с анестезией).`;
      } else if (mm >= 5) {
        band = 'Пограничное';
        color = '#F59E0B';
        details = `Schirmer II ${mm} мм — пограничное снижение базальной секреции.`;
      } else {
        band = 'ACN-сухой глаз';
        color = '#EF4444';
        details = `Schirmer II ${mm} мм < 5 — выраженное aqueous-deficient dry eye (ACN).`;
      }
    }

    return {
      value: String(mm),
      unit: 'мм / 5 мин',
      interpretation: band,
      color,
      details,
      actions: [
        mm < 10 && mode === 'i' ? 'Слёзозаменители без консервантов, гели на ночь' : '',
        mm < 5 ? 'Циклоспорин 0.05-0.1% 2×/сут (Restasis / Ikervis), lifitegrast 5%' : '',
        mm < 5 ? 'Пункционные пробки (punctal plugs), анти-ФНО при ревматоидном профиле' : '',
        mm < 10 ? 'Анти-SSA/SSB, слюнная биопсия — исключить синдром Шегрена' : '',
        'TBUT (tear break-up time), окрашивание флуоресцеином / лиссамин-зелёным',
        'OSDI опросник — субъективная шкала сухого глаза',
        'Гигиена век, MGD-терапия (IPL, LipiFlow) при мейбомиевой дисфункции',
      ].filter(Boolean),
      caveats: [
        'Schirmer I = базальная + рефлекторная секреция (без анестезии)',
        'Schirmer II = только базальная (после анестезии oxybuprocaine/proparacaine)',
        'Высокая вариабельность, test-retest ограничена',
        'DEWS II (2017) не требует Schirmer для диагноза ССГ, но полезен для ACN-подтипа',
        'Чувствительность ~85% для Шегрена при < 5 мм',
        'Нижняя полоска под латеральный нижний фарнекс, глаза закрыты, комнатный свет',
        'Ложнонизкие — от раздражения, ложновысокие — от рефлекса на полоску',
      ],
      scale: {
        segments: [
          { min: 0, max: 4, label: 'Тяж. ССГ', color: '#EF4444' },
          { min: 5, max: 9, label: 'Умер. ССГ', color: '#F59E0B' },
          { min: 10, max: 15, label: 'Погран.', color: '#84CC16' },
          { min: 16, max: 35, label: 'Норма', color: '#22C55E' },
        ],
        current: Math.round(mm),
        unit: 'мм',
      },
      related: [{ id: 'seidel', title: 'Seidel' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }, { id: '303.1', title: 'Ревматология' }],
    };
  },
  reference: 'Schirmer O. Studien zur Physiologie und Pathologie der Tränenabsonderung. Graefes Arch 1903;56:197. DEWS II Diagnostic Methodology 2017.',
  countries: 'Международный (TFOS DEWS II)',
  presets: [
    { label: 'Норма Schirmer I', values: { wetting: 22, anesthesia: 'i' } },
    { label: 'Умеренный ССГ', values: { wetting: 7, anesthesia: 'i' } },
    { label: 'Тяжёлый (Шегрен)', values: { wetting: 2, anesthesia: 'i' } },
    { label: 'Schirmer II базально', values: { wetting: 6, anesthesia: 'ii' } },
  ],
  info: `### Для чего используется
**Тест Ширмера** — количественная оценка слёзной секреции для диагностики **синдрома сухого глаза (ССГ)**, особенно ACN (aqueous-deficient).

### Варианты
| Вариант | Анестезия | Что измеряет |
|---|---|---|
| Schirmer I | Без | Базальная + рефлекторная |
| Schirmer II | С анестезией | Только базальная |
| Basal Secretion Test | С анестезией | = Schirmer II |

### Методика
- Полоска фильтр-бумаги 5×35 мм (Whatman #41)
- В нижний латеральный конъюнктивальный мешок
- 5 минут, глаза закрыты, тусклый свет
- Измерить увлажнённый участок в мм

### Интерпретация Schirmer I
| мм/5 мин | Трактовка |
|---|---|
| > 15 | Норма |
| 10-15 | Пограничное |
| 5-9 | Умеренный ССГ |
| < 5 | Тяжёлый ССГ (подозр. Шегрен) |

### Schirmer II (с анестезией)
| мм/5 мин | Трактовка |
|---|---|
| > 10 | Норма |
| 5-10 | Снижение |
| < 5 | Выраженный ACN |

### Место в диагностике ССГ (DEWS II 2017)
1. OSDI / DEQ-5 ≥ порог
2. Один из: TBUT < 10 с, окрашивание, **осмолярность слёзы > 308 мОсм/л**
3. Schirmer < 5 мм/5 мин → ACN-подтип

### Источник
Schirmer 1903. TFOS DEWS II 2017.`,
};

export default runner;

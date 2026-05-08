/** Runner: nigrovic — Bacterial Meningitis Score for children */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'gram', label: 'Грам-окраска ЦСЖ положительная', type: 'checkbox' },
    { id: 'csf_anc', label: 'АНЦ в ЦСЖ ≥ 1000 кл/мкл', type: 'checkbox' },
    { id: 'csf_prot', label: 'Белок ЦСЖ ≥ 80 мг/дл', type: 'checkbox' },
    { id: 'peripheral_anc', label: 'Периферический АНЦ ≥ 10 000 /мкл', type: 'checkbox' },
    { id: 'seizure', label: 'Судороги при/до поступления', type: 'checkbox' },
  ],
  compute: (v) => {
    const gram = Boolean(v.gram);
    const csfAnc = Boolean(v.csf_anc);
    const csfProt = Boolean(v.csf_prot);
    const pAnc = Boolean(v.peripheral_anc);
    const sz = Boolean(v.seizure);

    const pts = Number(gram) + Number(csfAnc) + Number(csfProt) + Number(pAnc) + Number(sz);

    let color = '#22C55E';
    let risk = 'Очень низкий (< 0,3 %)';
    let disposition = 'Наблюдение возможно без эмпирических АБ';

    if (pts === 0) {
      color = '#22C55E';
      risk = 'Очень низкий (< 0,3 %) — асептический менингит вероятен';
      disposition = 'Амбулаторное наблюдение возможно (при стабильности)';
    } else if (pts === 1) {
      color = '#F59E0B';
      risk = 'Низкий (~ 0,4 %)';
      disposition = 'Госпитализация, рассмотреть АБ';
    } else if (pts === 2) {
      color = '#F97316';
      risk = 'Умеренный';
      disposition = 'Эмпирические АБ';
    } else {
      color = '#EF4444';
      risk = 'Высокий';
      disposition = 'Эмпирические АБ немедленно';
    }

    return {
      value: `${pts} / 5`,
      unit: 'BMS',
      interpretation: `Риск БМ: ${risk}. ${disposition}`,
      color,
      details: `Bacterial Meningitis Score (Nigrovic 2002) — валидирован у детей 29 дн – 19 лет с плеоцитозом ЦСЖ. При 0 баллов — чувствительность ~ 100 %, NPV > 99,7 % для бактериального менингита. Используется ТОЛЬКО после получения ЦСЖ.`,
      actions: [
        pts === 0 ? 'Наблюдение при стабильности; повторная оценка через 24 ч' : null,
        pts >= 1 ? 'Цефтриаксон 100 мг/кг/сут (max 4 г) + ванкомицин 15 мг/кг × 4/сут' : null,
        pts >= 1 ? 'Возраст < 1 мес: ампициллин + цефотаксим + гентамицин (Listeria, E. coli, GBS)' : null,
        pts >= 1 ? 'Возраст 1–3 мес: ампициллин + цефтриаксон ± ванкомицин' : null,
        'Дексаметазон 0,15 мг/кг × 4 р/сут × 2–4 дн — до или вместе с первой дозой АБ (снижает потерю слуха при Hib/пневмококке)',
        'ПЦР ЦСЖ: энтеровирус, HSV, VZV — для исключения вирусного',
        'Хирургическая консультация при гидроцефалии / абсцессе',
        'Изоляция (менингококк — воздушно-капельная × 24 ч после АБ)',
      ].filter(Boolean),
      caveats: [
        'Применять ТОЛЬКО у детей > 28 дн с плеоцитозом ЦСЖ (WBC ≥ 10/мкл)',
        'Исключения: иммунодефицит, VP-шунт, ЧМТ, предлеченные АБ — не использовать',
        'При критическом ребёнке (септический вид, кома, судороги) — АБ немедленно, не ждать ЦСЖ',
        'Не заменяет клиническое суждение; валидирован в ER',
        'Новые штаммы пневмококка — BMS может не отражать изменение эпидемиологии',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 оч. низк.', color: '#22C55E' },
          { min: 1, max: 2, label: '1', color: '#F59E0B' },
          { min: 2, max: 3, label: '2', color: '#F97316' },
          { min: 3, max: 6, label: '≥ 3 высок.', color: '#EF4444' },
        ],
        current: pts,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '303.1', title: 'Педиатрия' },
      ],
      related: [
        { id: 'gmsps', title: 'GMSPS (менингококк)' },
        { id: 'thwaites', title: 'Thwaites TBM' },
        { id: 'rosenberg-kernig', title: 'Синдромы менингита' },
      ],
    };
  },
  reference: 'Nigrovic LE et al. JAMA 2007;297:52. Валидация на 3295 детей с плеоцитозом.',
  countries: 'Международный (США / IDSA)',
  presets: [
    { label: 'Асептический (0 б.)', values: { gram: false, csf_anc: false, csf_prot: false, peripheral_anc: false, seizure: false } },
    { label: 'Судороги + плеоцитоз (2 б.)', values: { gram: false, csf_anc: true, csf_prot: false, peripheral_anc: false, seizure: true } },
    { label: 'Бактериальный (5/5)', values: { gram: true, csf_anc: true, csf_prot: true, peripheral_anc: true, seizure: true } },
  ],
  info: `### Для чего используется
**Bacterial Meningitis Score (Nigrovic)** — различает **бактериальный** от **асептического/вирусного** менингита у детей 29 дн – 19 лет с плеоцитозом ЦСЖ. При 0 баллов — риск БМ < 0,3 %.

### 5 критериев (по 1 баллу)
| Критерий |
|---|
| Положительная Грам-окраска ЦСЖ |
| АНЦ в ЦСЖ ≥ 1000 кл/мкл |
| Белок ЦСЖ ≥ 80 мг/дл |
| Периферический АНЦ ≥ 10 000 /мкл |
| Судороги при поступлении |

### Интерпретация
| Баллы | Риск БМ |
|---|---|
| 0 | < 0,3 % (NPV > 99,7 %) |
| 1 | ~ 0,4 % |
| 2 | ~ 5 % |
| ≥ 3 | Высокий |

### Эмпирическая АБ-терапия (IDSA)
| Возраст | Схема |
|---|---|
| < 1 мес | Ампициллин + цефотаксим + гентамицин |
| 1–3 мес | Ампициллин + цефтриаксон ± ванкомицин |
| > 3 мес | Цефтриаксон 100 мг/кг/сут (max 4 г) + ванкомицин 15 мг/кг × 4 |
| > 50 лет / беременные | + Ампициллин (Listeria) |

**Дексаметазон** 0,15 мг/кг × 4 р/сут × 2–4 дн — до или с первой дозой АБ (Hib, пневмококк).

### Когда BMS нельзя использовать
- Иммунокомпрометированные
- VP-шунт
- Недавняя ЧМТ / нейрохирургия
- Предлечение АБ
- < 28 дн (недостаточно валидированы)

### Критический ребёнок
АБ немедленно (< 30 мин), не ждать результатов ЦСЖ — каждый час задержки повышает смертность.

### Типичные возбудители по возрасту
| Возраст | Частые |
|---|---|
| 0–1 мес | GBS, E. coli, Listeria |
| 1–3 мес | GBS, Listeria, пневмококк, Neisseria |
| 3 мес – 10 лет | Пневмококк, менингококк |
| > 10 лет | Менингококк, пневмококк |

### Ограничения
- Только у детей с плеоцитозом (WBC ≥ 10)
- Не валидирован в эре пневмококковой вакцинации полностью
- Не заменяет клиническую оценку`,
};

export default runner;

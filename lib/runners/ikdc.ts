/** Runner: ikdc - IKDC / Lysholm / Tegner / KOOS / WOMAC - knee outcome scores */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'scale',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'ikdc', label: 'IKDC Subjective Knee (0-100, выше = лучше)' },
        { value: 'lysholm', label: 'Lysholm (0-100, выше = лучше)' },
        { value: 'tegner', label: 'Tegner Activity Level (0-10)' },
        { value: 'koos', label: 'KOOS (0-100 по каждой субшкале, выше = лучше)' },
        { value: 'womac', label: 'WOMAC (0-96 или 0-100 нормализованный, ниже = лучше)' },
      ],
    },
    {
      id: 'score',
      label: 'Суммарный балл',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      quickValues: [0, 20, 40, 50, 60, 80, 100],
    },
  ],
  compute: (v) => {
    const scale = String(v.scale);
    const score = Number(v.score);
    let interpretation = '', color = '#22C55E', details = '';
    let actions: string[] = [];
    let unit = 'баллов';

    if (scale === 'ikdc') {
      if (score >= 80) { interpretation = 'Отличный результат (IKDC)'; color = '#22C55E'; }
      else if (score >= 60) { interpretation = 'Хороший'; color = '#84CC16'; }
      else if (score >= 40) { interpretation = 'Удовлетворительный'; color = '#F59E0B'; }
      else { interpretation = 'Плохой - выраженные нарушения функции'; color = '#EF4444'; }
      details = 'IKDC Subjective Knee Form (2001) - 18 вопросов о симптомах, функции, спортивной активности. Нормализация 0-100. PASS (patient acceptable symptom state) ~ 75,9. MCID ~ 11,5.';
      actions = [
        'Сравнить с pre-injury baseline',
        'Оценить в динамике (6, 12, 24 мес post-op)',
        'Дополнить objective examination (Lachman, pivot-shift, ROM)',
      ];
    } else if (scale === 'lysholm') {
      if (score >= 95) { interpretation = 'Отлично (Lysholm)'; color = '#22C55E'; }
      else if (score >= 84) { interpretation = 'Хорошо'; color = '#84CC16'; }
      else if (score >= 65) { interpretation = 'Удовлетворительно'; color = '#F59E0B'; }
      else { interpretation = 'Плохо'; color = '#EF4444'; }
      details = 'Lysholm (1982) - 8 пунктов: хромота, опора, замок, нестабильность, боль, отёк, подъём по лестнице, приседание. Изначально для ACL insufficiency. MCID ~ 10.';
      actions = [
        'Исторически завышает у молодых активных - использовать вместе с IKDC/KOOS',
        'Оценить Tegner activity level параллельно',
      ];
    } else if (scale === 'tegner') {
      unit = '(0-10)';
      if (score >= 9) { interpretation = 'Профессиональный спорт (футбол, баскетбол high-level)'; color = '#22C55E'; }
      else if (score >= 6) { interpretation = 'Соревновательные/рекреационные виды спорта'; color = '#84CC16'; }
      else if (score >= 3) { interpretation = 'Лёгкая работа, умеренная активность'; color = '#F59E0B'; }
      else { interpretation = 'Sedentary / disabled'; color = '#EF4444'; }
      details = 'Tegner Activity Level Scale (1985) - одноразмерная ординальная шкала 0-10. Измеряет уровень физической/спортивной активности. Сравнивается pre- vs post-injury.';
      actions = [
        'Цель после ACL reconstruction - вернуться к pre-injury уровню (~ 2/3 достигают)',
        'Для сравнения: бег трусцой = 5, лыжи рекреационно = 6, футбол любительский = 7, профессиональный футбол = 9',
      ];
    } else if (scale === 'koos') {
      if (score >= 80) { interpretation = 'Минимальные симптомы (KOOS)'; color = '#22C55E'; }
      else if (score >= 60) { interpretation = 'Лёгкие-умеренные'; color = '#84CC16'; }
      else if (score >= 40) { interpretation = 'Умеренные'; color = '#F59E0B'; }
      else { interpretation = 'Тяжёлые'; color = '#EF4444'; }
      details = 'KOOS (Knee injury and Osteoarthritis Outcome Score, 1998) - 42 пункта, 5 субшкал: Pain, Symptoms, ADL, Sport/Recreation, QoL. Каждая нормализуется 0-100. PASS и MCID зависят от патологии и субшкалы.';
      actions = [
        'Отдельно оценить каждую субшкалу (особенно QoL и Sport/Rec)',
        'KOOS-JR (7 items) - сокращённая версия для TKA/OA',
      ];
    } else if (scale === 'womac') {
      // 0-100 normalized, lower = better
      if (score <= 20) { interpretation = 'Минимальная симптоматика OA (WOMAC)'; color = '#22C55E'; }
      else if (score <= 40) { interpretation = 'Лёгкая'; color = '#84CC16'; }
      else if (score <= 60) { interpretation = 'Умеренная'; color = '#F59E0B'; }
      else { interpretation = 'Тяжёлая'; color = '#EF4444'; }
      details = 'WOMAC (1988) - 24 пункта: 5 Pain, 2 Stiffness, 17 Function. Оригинал Likert 0-4 (сумма 0-96) или нормализация 0-100. НИЖЕ = лучше. MCID ~ 12%; PASS ~ 31.';
      actions = [
        'Используется в исследованиях OA knee/hip и TJA',
        'Альтернатива - KOOS (включает Sport/QoL, лучше для молодых активных)',
      ];
    }

    return {
      value: String(score),
      unit,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'PROMs (IKDC/KOOS/WOMAC/Lysholm/Tegner) - субъективные, отражают восприятие пациента',
        'IKDC и KOOS - наиболее валидированы для ACL reconstruction и knee OA соответственно',
        'MCID (minimal clinically important difference) и PASS варьируют по патологии и времени оценки',
        'WOMAC - ниже балл = лучше состояние (в отличие от остальных)',
        'Для сравнения групп / динамики - использовать ту же шкалу pre-/post-',
      ],
      related: [
        { id: 'ucla-shoulder', title: 'UCLA / ASES / Constant' },
        { id: 'harris-hip', title: 'Harris Hip / Oxford' },
        { id: 'outerbridge', title: 'Outerbridge / ICRS' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
        { id: '201.3', title: 'Ревматология' },
      ],
    };
  },
  reference: 'Irrgang JJ et al. Development and validation of the IKDC Subjective Knee Form. Am J Sports Med 2001;29:600-13. Lysholm J, Gillquist J. Evaluation of knee ligament surgery results. Am J Sports Med 1982;10:150-4. Tegner Y, Lysholm J. Rating systems in the evaluation of knee ligament injuries. Clin Orthop 1985;198:43-9. Roos EM et al. KOOS. J Orthop Sports Phys Ther 1998;28:88-96. Bellamy N et al. WOMAC. J Rheumatol 1988;15:1833-40.',
  countries: 'Международный',
  presets: [
    { label: 'IKDC 6 мес post-ACL recon', values: { scale: 'ikdc', score: 72 } },
    { label: 'Lysholm отличный', values: { scale: 'lysholm', score: 96 } },
    { label: 'Tegner профессиональный футбол', values: { scale: 'tegner', score: 9 } },
    { label: 'KOOS pain 55 (умеренная OA)', values: { scale: 'koos', score: 55 } },
    { label: 'WOMAC тяжёлая OA', values: { scale: 'womac', score: 72 } },
  ],
  info: `### Для чего используется
Набор валидированных **PROMs (patient-reported outcome measures)** для **коленного сустава**. Используются для оценки исходов хирургии (ACL recon, TKA), OA knee, мониторинга реабилитации.

### IKDC Subjective Knee Form (2001)
- 18 вопросов: симптомы, спорт, функция
- Нормализация 0-100 (выше = лучше)
- **PASS** ≈ 75,9; **MCID** ≈ 11,5
- Золотой стандарт для ACL/меньис/хрящ

### Lysholm (1982)
- 8 пунктов (хромота, опора, замок, нестабильность, боль, отёк, лестница, приседание)
- 0-100 (выше = лучше); ≥95 отлично, 84-94 хорошо, 65-83 удовл., <65 плохо
- Изначально для ACL; MCID ≈ 10
- Тенденция к завышению у молодых активных

### Tegner Activity Level (1985)
- Ординальная 0-10
- 0: disabled → 10: профессиональный футбол/elite
- Для сравнения pre-/post-injury уровня активности

### KOOS (1998)
- 42 пункта, **5 субшкал**: Pain, Symptoms, ADL, Sport/Recreation, QoL
- Каждая 0-100 (выше = лучше)
- **KOOS-JR** (7 items) - для TKA/OA
- Лучше Lysholm для молодых активных

### WOMAC (1988)
- 24 пункта: 5 Pain + 2 Stiffness + 17 Function
- Likert 0-4 (сумма 0-96) или 0-100 нормализованная
- **НИЖЕ = лучше** (противоположно остальным!)
- Золотой стандарт OA knee/hip и TJA

### Выбор шкалы
| Клиническая ситуация | Предпочтительно |
|---|---|
| ACL / meniscus / cartilage (молодые) | IKDC + Lysholm + Tegner |
| OA knee / TKA | KOOS + WOMAC |
| Универсально для регистров | KOOS (единственный с QoL и Sport) |

### Источники
Irrgang JJ et al. *Am J Sports Med* 2001;29:600. Lysholm J, Gillquist J. *Am J Sports Med* 1982;10:150. Tegner Y, Lysholm J. *Clin Orthop* 1985;198:43. Roos EM et al. *J Orthop Sports Phys Ther* 1998;28:88. Bellamy N et al. *J Rheumatol* 1988;15:1833.
`,
};

export default runner;

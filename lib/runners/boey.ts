// @ts-nocheck
/** Runner: boey — Boey score при перфоративной язве (1982) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  inputs: [
    {
      id: 'comorbid',
      label: 'Тяжёлое сопутствующее заболевание (ASA III–V)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Да', points: 1 },
      ],
    },
    {
      id: 'shock',
      label: 'Предоперационный шок (SBP < 100 мм рт.ст.)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Да', points: 1 },
      ],
    },
    {
      id: 'delay',
      label: 'Длительная перфорация (> 24 ч до операции)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Да', points: 1 },
      ],
    },
  ],
  bands: [
    { min: 0, max: 0, label: '0', color: '#22C55E', description: 'Mortality ~ 1,5%, morbidity ~ 10%. Лапароскопическое ушивание.' },
    { min: 1, max: 1, label: '1', color: '#F59E0B', description: 'Mortality ~ 14%, morbidity ~ 30%. Плановая лапароскопия или лапаротомия.' },
    { min: 2, max: 2, label: '2', color: '#EF4444', description: 'Mortality ~ 32%, morbidity ~ 46%. Лапаротомия, ICU.' },
    { min: 3, max: 3, label: '3', color: '#991B1B', description: 'Mortality ~ 77%, morbidity > 75%. Агрессивная ресусцитация, Damage control.' },
  ],
  caveats: [
    'Boey валидирован на 259 пациентах (Boey J, Choi SK, Poon A, Alagaratnam TT. Ann Surg 1987;205:22)',
    'ASA-PS ≥ III + Boey ≥ 2 — крайне высокий риск',
    'Альтернативы: PULP score (2012, > 7 параметров), Hacettepe score, Jabalpur score',
    'При Boey 3 предпочтительна открытая операция + лаваж; laparoscopic repair — при Boey 0–1',
    'TXA не показан (инфекция, не кровотечение)',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Неотложная помощь' },
    { id: '301.5', title: 'Гастроэнтерология' },
  ],
  related: [
    { id: 'asa-ps', title: 'ASA-PS' },
    { id: 'mpi', title: 'Mannheim Peritonitis Index' },
    { id: 'apache', title: 'APACHE II' },
    { id: 'sofa', title: 'SOFA' },
    { id: 'forrest', title: 'Forrest (ЖКК)' },
  ],
  reference: 'Boey J, Choi SK, Poon A, Alagaratnam TT. Risk stratification in perforated duodenal ulcers. A prospective validation of predictive factors. Ann Surg 1987;205(1):22–6. Первоначальная работа: Boey J, Wong J, Ong GB. A prospective study of operative risk factors in perforated duodenal ulcers. Ann Surg 1982;195:265.',
  countries: 'Международный (WSES guidelines 2020)',
  info: `### Для чего используется
**Boey score (1982/1987)** — прогноз смертности при **перфоративной пептической язве** по 3 прикроватным параметрам.

### Параметры (1 балл каждый)
1. **Major medical illness** — тяжёлое сопутствующее заболевание (ASA III–V)
2. **Preoperative shock** — SBP < 100 мм рт.ст.
3. **Duration > 24 h** — задержка хирургии > 24 ч от начала перфорации

### Интерпретация
| Boey | Mortality | Morbidity |
|---|---|---|
| 0 | 1,5% | 10% |
| 1 | 14% | 30% |
| 2 | 32% | 46% |
| 3 | 77% | > 75% |

### Тактика
- **Boey 0–1** — лапароскопическое ушивание с omental patch (Graham), орошение
- **Boey 2** — открытая или конверсия, расширенный лаваж, ICU наблюдение
- **Boey 3** — damage control: быстрое ушивание, широкий дренаж, ICU, отложенная реконструкция

### WSES 2020 рекомендации
- Все пациенты с перфорацией — хирургия в течение < 24 ч
- H. pylori eradication послеоперационно при положительном тесте
- Ингибиторы протонной помпы внутривенно
- Эмпирическая антибиотикотерапия (анаэробы + грам-отрицательные)

### Альтернативные шкалы
| Шкала | Год | Параметры |
|---|---|---|
| **PULP** (Peptic Ulcer Perforation) | 2012 | 8 параметров, выше точность |
| **Hacettepe** | 2007 | 5 параметров |
| **Jabalpur** | 2014 | 6 параметров |
| **ASA-PS** | стандартный | Учитывается в Boey |

### Источники
Boey J et al. *Ann Surg* 1987;205:22. Møller MH et al. PULP score. *Acta Anaesthesiol Scand* 2012;56:655. WSES guidelines for perforated peptic ulcer. *World J Emerg Surg* 2020;15:3.
`,
};

export default runner;

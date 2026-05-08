/**
 * Runner: mehta - Thakar/Mehta Cleveland Clinic AKI score (кардиохирургия)
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 17,
  inputs: [
    { id: 'female', label: 'Женский пол', type: 'checkbox', points: 1 },
    { id: 'chf', label: 'ХСН в анамнезе', type: 'checkbox', points: 1 },
    { id: 'lvef', label: 'ФВ ЛЖ < 35%', type: 'checkbox', points: 1 },
    { id: 'iabp', label: 'ВАБК до операции (preop IABP)', type: 'checkbox', points: 2 },
    { id: 'copd', label: 'ХОБЛ', type: 'checkbox', points: 1 },
    { id: 'dm', label: 'СД на инсулине', type: 'checkbox', points: 1 },
    { id: 'priorcs', label: 'Повторная кардиохирургическая операция', type: 'checkbox', points: 1 },
    { id: 'emerg', label: 'Экстренная операция', type: 'checkbox', points: 2 },
    { id: 'valve', label: 'Только клапанная операция', type: 'checkbox', points: 1 },
    { id: 'cabgvalve', label: 'CABG + клапан', type: 'checkbox', points: 2 },
    { id: 'othercs', label: 'Другая кардиохирургическая операция', type: 'checkbox', points: 2 },
    { id: 'cr1', label: 'Предоп. Cr 106-177 мкмоль/л (1,2-2,0 мг/дл)', type: 'checkbox', points: 2 },
    { id: 'cr2', label: 'Предоп. Cr > 177 мкмоль/л (> 2,0 мг/дл)', type: 'checkbox', points: 5 },
  ],
  bands: [
    { min: 0, max: 2, label: '0-2', color: '#22C55E', description: 'Риск потребности в диализе ~ 0,4%.' },
    { min: 3, max: 5, label: '3-5', color: '#84CC16', description: 'Риск диализа ~ 1,8%.' },
    { min: 6, max: 8, label: '6-8', color: '#F59E0B', description: 'Риск диализа ~ 7,8%.' },
    { min: 9, max: 13, label: '9-13', color: '#EF4444', description: 'Риск диализа ~ 21,5%.' },
    {
      min: 14, max: 17, label: '≥ 14', color: '#991B1B',
      description: 'Очень высокий риск диализа (> 21,5%, близок к 50%).',
      details: 'Оптимизировать гемодинамику и волемию периоперационно; избегать нефротоксинов; ранняя нефрологическая консультация.',
      actions: [
        'Нефролог до операции и в раннем послеоперационном периоде',
        'Избегать контраста, аминогликозидов, NSAID',
        'Цель MAP ≥ 65-75 мм рт. ст., избегать гипотензии на АИК',
        'Ежедневный контроль Cr, диуреза, K⁺, HCO₃⁻',
      ],
    },
  ],
  caveats: [
    'Валидирован для взрослой кардиохирургии (CABG, клапаны, combined)',
    'Предсказывает риск ЗПТ (RRT), а не любое AKI',
    'Не применим к трансплантации сердца и ВАД',
    'Альтернативы: Cleveland Clinic II, SRI, AKICS',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Интенсивная терапия' },
    { id: '301.2', title: 'Нефрология' },
    { id: '301.1', title: 'Анестезиология' },
  ],
  related: [
    { id: 'rifle', title: 'RIFLE / KDIGO' },
    { id: 'fst', title: 'Furosemide stress test' },
    { id: 'euroscore', title: 'EuroSCORE II' },
    { id: 'rcri', title: 'RCRI' },
  ],
  reference: 'Thakar CV, Arrigain S, Worley S, Yared JP, Paganini EP. A clinical score to predict acute renal failure after cardiac surgery. J Am Soc Nephrol 2005;16:162-168.',
  info: `### Для чего используется
**Cleveland Clinic / Thakar-Mehta Score** - предоперационный прогноз острого повреждения почек, требующего ЗПТ, после кардиохирургии.

### 13 предикторов (суммарно 0-17 баллов)
| Фактор | Баллы |
|---|---|
| Женский пол | 1 |
| ХСН | 1 |
| ФВ ЛЖ < 35% | 1 |
| ВАБК предоперационно | 2 |
| ХОБЛ | 1 |
| Инсулинозависимый СД | 1 |
| Повторная кардиохирургия | 1 |
| Экстренная операция | 2 |
| Только клапан | 1 |
| CABG + клапан | 2 |
| Другая кардиохирургия | 2 |
| Cr 106-177 мкмоль/л | 2 |
| Cr > 177 мкмоль/л | 5 |

### Риск ЗПТ
| Баллы | Риск диализа |
|---|---|
| 0-2 | 0,4 % |
| 3-5 | 1,8 % |
| 6-8 | 7,8 % |
| 9-13 | 21,5 % |

### Источник
Thakar CV et al. J Am Soc Nephrol 2005;16:162-8.`,
};

export default runner;

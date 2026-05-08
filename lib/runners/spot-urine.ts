/** Runner: spot-urine - Spot urine panel (FENa, FEUrea, UACR, UPCR, UCa/Cr) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'test', label: 'Тест', type: 'select', options: [
      { value: 'uacr', label: 'Отношение альбумин/креатинин мочи (UACR, мг/г)' },
      { value: 'upcr', label: 'Отношение белок/креатинин мочи (UPCR, мг/г)' },
      { value: 'uca', label: 'Отношение Ca/креатинин мочи' },
      { value: 'fena', label: 'FENa (%)' },
      { value: 'feurea', label: 'FEUrea (%)' },
    ] },
    { id: 'value', label: 'Значение', type: 'number', unit: '', min: 0, max: 10000, step: 0.01, quickValues: [1, 10, 30, 100, 300] },
  ],
  compute: (v) => {
    const test = String(v.test);
    const val = Number(v.value);

    let band = '', color = '#22C55E', details = '';
    let actions: string[] = [];

    if (test === 'uacr') {
      // UACR mg/g creatinine - KDIGO albuminuria categories A1-A3
      if (val < 30) { band = 'A1 норма'; color = '#22C55E'; details = 'UACR < 30 мг/г - нормоальбуминурия.'; }
      else if (val < 300) { band = 'A2 микро.'; color = '#F59E0B'; details = 'UACR 30-300 - микроальбуминурия / умеренное повышение.'; }
      else { band = 'A3 макро.'; color = '#EF4444'; details = 'UACR > 300 мг/г - макроальбуминурия / выраженное повышение.'; }
      actions = [
        'Подтвердить повторным измерением через 3-6 мес',
        'KDIGO рекомендует UACR для всех с ХБП, диабетом, АГ',
        'A2 - повышенный риск прогрессии ХБП; A3 - лечение ИАПФ/сартаном',
        'Эквивалент: UACR 30 мг/г ≈ 30 мг/24ч суточного белка',
      ];
    } else if (test === 'upcr') {
      if (val < 150) { band = 'Норма'; color = '#22C55E'; details = 'UPCR < 150 мг/г.'; }
      else if (val < 500) { band = 'Лёгкая протеин.'; color = '#F59E0B'; details = 'UPCR 150-500 мг/г - лёгкая протеинурия.'; }
      else if (val < 3500) { band = 'Умер. протеин.'; color = '#EF4444'; details = 'UPCR 500-3500 - клинически значимая.'; }
      else { band = 'Нефрот. уровень'; color = '#991B1B'; details = 'UPCR > 3500 мг/г - нефротический уровень протеинурии.'; }
      actions = ['UPCR ≈ суточный белок/сут (1 мг/г ≈ 1 мг/сут при Cr 1 г/сут)', 'При нефротическом уровне - биопсия почки', 'ИАПФ/сартан снижают протеинурию'];
    } else if (test === 'uca') {
      // UCa/Cr ratio (mmol/mmol)
      if (val < 0.01) { band = 'FHH возможен'; color = '#EF4444'; details = 'UCa/Cr < 0.01 - подозрение на FHH (семейную гипокальциурическую гиперкальциемию). НЕ оперировать.'; }
      else if (val < 0.4) { band = 'Норма'; color = '#22C55E'; details = 'UCa/Cr в норме.'; }
      else { band = 'Гиперкальциурия'; color = '#F59E0B'; details = 'UCa/Cr > 0.4 - гиперкальциурия.'; }
      actions = ['В дифф. первичного ГПТ: UCa/Cr > 0.02 (не FHH)', 'Гиперкальциурия - риск нефролитиаза, остеопороза'];
    } else if (test === 'fena') {
      if (val < 1) { band = 'Преренальная'; color = '#F59E0B'; details = 'FENa < 1 % - преренальная азотемия (гиповолемия, ХСН, цирроз) или ранняя AKI.'; }
      else if (val < 2) { band = 'Неопределённо'; color = '#84CC16'; details = 'FENa 1-2 % - переходная зона.'; }
      else { band = 'Ренальная (АТН)'; color = '#EF4444'; details = 'FENa > 2 % - внутрипочечная (ATN, остро-канальцевый некроз).'; }
      actions = ['FENa валиден только до применения диуретиков', 'При приёме диуретиков - использовать FEUrea', 'Формула: FENa = (UNa × PCr) / (PNa × UCr) × 100'];
    } else if (test === 'feurea') {
      if (val < 35) { band = 'Преренальная'; color = '#F59E0B'; details = 'FEUrea < 35 % - преренальная AKI (независимо от диуретиков).'; }
      else { band = 'Ренальная (АТН)'; color = '#EF4444'; details = 'FEUrea > 50 % - ATN / внутрипочечная.'; }
      actions = ['FEUrea валиден при приёме диуретиков (в отличие от FENa)', 'Формула: FEUrea = (Uurea × PCr) / (Purea × UCr) × 100'];
    }

    return {
      value: val.toString(), unit: test === 'uacr' ? 'мг/г UACR' : test === 'upcr' ? 'мг/г UPCR' : test === 'uca' ? 'Ca/Cr' : test === 'fena' ? '% FENa' : '% FEUrea',
      interpretation: band, color,
      details, actions,
      caveats: [
        'Спот-мочи предпочтительнее 24 ч сбора (меньше ошибок, удобнее)',
        'UACR лучше UPCR для ранних стадий (более чувствителен к альбумину)',
        'FENa недостоверен при приёме диуретиков - использовать FEUrea',
        'Утренняя первая порция для UACR/UPCR (стандартизация)',
        'Одно положительное не подтверждает - требуются 2 из 3 в течение 3-6 мес',
      ],
      related: [
        { id: 'fena', title: 'FENa (base)' },
        { id: 'cockcroft', title: 'Cockcroft-Gault' },
        { id: 'ckd-epi', title: 'CKD-EPI' },
      ],
      relatedCourses: [
        { id: '304.3', title: 'Анализ мочи' },
        { id: '301.3', title: 'Нефрология' },
      ],
    };
  },
  reference: 'KDIGO 2012 CKD + 2024 Update. Carpenter CB, Lazarus JM. Spot urinary.',
  countries: 'Международный (KDIGO)',
  presets: [
    { label: 'Норма UACR', values: { test: 'uacr', value: 15 } },
    { label: 'FENa 0.5 % (преренал.)', values: { test: 'fena', value: 0.5 } },
    { label: 'Нефротич. UPCR', values: { test: 'upcr', value: 5000 } },
  ],
  info: `### Для чего используется
Интерпретация спот-тестов мочи без 24 ч сбора. Основные тесты:

### UACR (альбумин/креатинин)
| Категория | UACR (мг/г) |
|---|---|
| A1 норма | < 30 |
| A2 микроальбумин | 30-300 |
| A3 макроальбумин | > 300 |

### UPCR (белок/креатинин)
| Уровень | UPCR (мг/г) |
|---|---|
| Норма | < 150 |
| Лёгкая | 150-500 |
| Умеренная | 500-3500 |
| Нефротический | > 3500 |

### FENa (фракц. экскреция Na)
FENa = (UNa × PCr) / (PNa × UCr) × 100
- < 1 % → преренальная (если нет диуретиков)
- > 2 % → ренальная (ATN)

### FEUrea (при диуретиках)
FEUrea = (Uurea × PCr) / (Purea × UCr) × 100
- < 35 % → преренальная
- > 50 % → ренальная

### UCa/Cr
- < 0.01 → FHH (не оперировать ПГП!)
- > 0.4 → гиперкальциурия`,
};

export default runner;

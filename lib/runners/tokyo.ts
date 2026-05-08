/** Runner: tokyo - Tokyo Guidelines TG18/TG24 acute cholecystitis / cholangitis */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'diagnosis',
      label: 'Диагноз',
      type: 'select',
      options: [
        { value: 'chole', label: 'Острый холецистит' },
        { value: 'chola', label: 'Острый холангит' },
      ],
    },
    {
      id: 'severity',
      label: 'Степень тяжести',
      type: 'select',
      options: [
        { value: '1', label: 'I - лёгкая (mild)' },
        { value: '2', label: 'II - умеренная (moderate)' },
        { value: '3', label: 'III - тяжёлая (severe) - органная дисфункция' },
      ],
    },
  ],
  compute: (v) => {
    const dx = String(v.diagnosis);
    const sev = Number(v.severity);

    let interpretation = '', color = '#22C55E', details = '';
    let actions: string[] = [];
    let dxLabel = dx === 'chole' ? 'Острый холецистит' : 'Острый холангит';
    let sevLabel = sev === 1 ? 'Grade I (mild)' : sev === 2 ? 'Grade II (moderate)' : 'Grade III (severe)';

    if (dx === 'chole') {
      details = 'Диагноз TG18: A - локальные признаки (Murphy, пальпируемое образование/масса/боль в RUQ), B - системные (лихорадка, CRP↑, WBC↑), C - визуализация. Подозрение: 1 A + 1 B. Определённый: A + B + C.';
      if (sev === 1) {
        interpretation = 'Grade I - нет критериев для II/III. Стандартная холецистэктомия';
        color = '#22C55E';
        actions = [
          'Ранняя лапароскопическая холецистэктомия (LC) в течение 7 дней от начала симптомов (оптимально 72 ч)',
          'Антибиотики: цефтриаксон 2 г/сут или цефазолин; 24-72 ч post-op',
          'Если хирургия задержана > 7 дней - рассмотреть conservative management и elective LC через 6 нед',
        ];
      } else if (sev === 2) {
        interpretation = 'Grade II - локальный воспалительный процесс (WBC > 18k, RUQ mass > 72 ч, выраженное воспаление: гангрена, абсцесс, биларный перитонит, emphysematous cholecystitis)';
        color = '#F59E0B';
        actions = [
          'Срочная/ранняя LC если опыт и стабильность позволяют',
          'В/в антибиотики широкого спектра: пип-тазо, цефтриаксон + метронидазол',
          'Если хирургия недоступна - **percutaneous cholecystostomy (PC)**, позже interval LC',
        ];
      } else {
        interpretation = 'Grade III - органная дисфункция (ССС, ЦНС, дыхание, почки, печень, коагуляция)';
        color = '#EF4444';
        actions = [
          'ICU, ресусцитация (Surviving Sepsis Campaign)',
          'Срочная percutaneous cholecystostomy - первая линия при нестабильности',
          'Антибиотики: пип-тазо 4,5 г q6h или меропенем',
          'Отсроченная LC через 6-8 нед после стабилизации',
        ];
      }
    } else {
      details = 'Диагноз TG18 острого холангита: A - системное воспаление (лихорадка/ознобы, CRP↑ или WBC изм.), B - холестаз (желтуха, ЩФ/ГГТ/АЛТ/АСТ↑), C - имиджинг (дилатация/стриктура/камень/стент). Подозрение: 1 пункт из A + 1 из B или C. Определённый: 1 A + 1 B + 1 C. Классически - Charcot triad (боль + лихорадка + желтуха); Reynolds pentad (+ шок + AMS) = тяжёлый.';
      if (sev === 1) {
        interpretation = 'Grade I - не соответствует II/III критериям';
        color = '#22C55E';
        actions = [
          'Антибиотики в/в: цефтриаксон + метронидазол или пип-тазо',
          'ERCP/биларный дренаж в течение 24-72 ч если не разрешается',
          'Лечение этиологии (камни - CCY позже, стриктура - стент)',
        ];
      } else if (sev === 2) {
        interpretation = 'Grade II - 2+ критериев: WBC > 12k или < 4k, лихорадка ≥ 39°C, возраст ≥ 75, билирубин ≥ 85 μмоль/л (5 мг/дл), альбумин < 70% нормы';
        color = '#F59E0B';
        actions = [
          'Ранний биларный дренаж (ERCP < 24 ч) показан',
          'Антибиотики широкого спектра: пип-тазо или меропенем',
          'ICU при прогрессии',
        ];
      } else {
        interpretation = 'Grade III - органная дисфункция (гипотензия требует вазопрессоров, AMS, PaO₂/FiO₂ < 300, креатинин > 176 μмоль/л, INR > 1,5, тромбоциты < 100k)';
        color = '#EF4444';
        actions = [
          'ICU, ресусцитация по Surviving Sepsis',
          'СРОЧНЫЙ биларный дренаж (ERCP, или PTBD/хирургия при неудаче) в течение 12-24 ч',
          'Антибиотики: меропенем или пип-тазо + vancomycin (покрытие MRSA/VRE при риске)',
          'Источник-контроль первичен - антибиотики без дренажа недостаточны',
        ];
      }
    }

    return {
      value: `${dxLabel}, ${sevLabel}`,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'TG18 обновлены в TG24 - уточнены определения органной дисфункции и критерии ERCP timing',
        'Grade III требует органной поддержки и СРОЧНОГО дренажа (< 24 ч)',
        'Percutaneous cholecystostomy - bridge для нестабильных пациентов с холециститом',
        'ERCP с сфинктеротомией - золотой стандарт для холангита; PTBD при неудаче / нет доступа',
        'Kumar index, Reynolds pentad - исторические клинические признаки; TG-критерии более специфичны',
        'Антибиотики выбираются по локальной флоре и факторам риска (HCA-инфекция, недавние антибиотики)',
      ],
      related: [
        { id: 'aims65', title: 'AIMS65' },
        { id: 'maddrey', title: 'Maddrey (алк. гепатит)' },
        { id: 'sofa', title: 'SOFA' },
        { id: 'news2', title: 'NEWS2' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.5', title: 'Гастроэнтерология' },
        { id: '301.3', title: 'Хирургия' },
      ],
    };
  },
  reference: 'Yokoe M, Hata J, Takada T et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci 2018;25:41-54. Kiriyama S et al. TG18: diagnostic criteria and severity grading of acute cholangitis. JHBP Sci 2018;25:17-30. TG24 update: Yokoe M et al. JHBP Sci 2024.',
  countries: 'Международный (Tokyo Guidelines)',
  presets: [
    { label: 'Острый холецистит Grade I', values: { diagnosis: 'chole', severity: '1' } },
    { label: 'Острый холецистит Grade III (ICU)', values: { diagnosis: 'chole', severity: '3' } },
    { label: 'Острый холангит Grade II', values: { diagnosis: 'chola', severity: '2' } },
    { label: 'Острый холангит Grade III (Reynolds pentad)', values: { diagnosis: 'chola', severity: '3' } },
  ],
  info: `### Для чего используется
**Tokyo Guidelines TG18 / TG24** - международный стандарт **диагностики и оценки тяжести** острого холецистита и острого холангита. Определяют показания к срочному источник-контролю (ERCP, LC, PC).

### Острый холецистит - диагностика TG18
- **A (локальные)**: Murphy's sign / пальпируемая масса / боль в RUQ
- **B (системные)**: лихорадка, CRP↑, WBC↑
- **C (визуализация)**: УЗИ (стенка > 3 мм, sonographic Murphy, жидкость), КТ, МРТ/МРХПГ

**Подозрение**: 1 A + 1 B. **Определённый**: A + B + C.

### Холецистит - степени тяжести
| Grade | Критерии |
|---|---|
| **I (mild)** | Не соответствует II/III |
| **II (moderate)** | WBC > 18k, RUQ mass > 72 ч, выраженное местное воспаление (гангрена/перфорация/абсцесс/эмфизематозный) |
| **III (severe)** | Органная дисфункция (ССС, ЦНС, дыхание, почки, печень, коагуляция) |

### Острый холангит - диагностика TG18
- **A (системное воспаление)**: лихорадка / ознобы, CRP↑, WBC изменён
- **B (холестаз)**: желтуха, ЩФ/ГГТ/AST/ALT↑
- **C (имиджинг)**: дилатация протоков, стриктура, камень, стент

**Подозрение**: 1 A + 1 (B или C). **Определённый**: A + B + C.

Клинически: **Charcot triad** (боль + лихорадка + желтуха) ≈ 50-75%; **Reynolds pentad** (+ шок + AMS) = тяжёлый.

### Холангит - степени тяжести
| Grade | Критерии |
|---|---|
| **I** | Не II/III |
| **II (moderate)** | 2+ из: WBC > 12k/< 4k, лихорадка ≥ 39°C, возраст ≥ 75, билирубин ≥ 85 μмоль/л (5 мг/дл), альбумин < 70% normal |
| **III (severe)** | Органная дисфункция (требуют вазопрессоров, AMS, PaO₂/FiO₂ < 300, Cr > 176 μмоль/л, INR > 1,5, Plt < 100k) |

### Ведение (TG18)
**Холецистит**:
- Grade I: ранняя LC в течение 7 дней (< 72 ч оптимально)
- Grade II: ранняя LC при опыте; PC bridge при нестабильности
- Grade III: ICU, ресусцитация, PC или хирургия при невозможности дренажа

**Холангит**:
- Grade I: антибиотики, ERCP 24-72 ч если не разрешается
- Grade II: срочный ERCP < 24 ч
- Grade III: СРОЧНЫЙ ERCP < 12-24 ч + ICU, источник-контроль первичен

### Антибиотики (TG18)
| Тяжесть | Схема |
|---|---|
| Grade I-II community | Цефтриаксон 2 г/сут ± метронидазол, ампициллин/сульбактам |
| Grade III или HCA | Пиперациллин-тазобактам или меропенем ± vancomycin |

### Источники
Yokoe M et al. *JHBP Sci* 2018;25:41 (cholecystitis). Kiriyama S et al. *JHBP Sci* 2018;25:17 (cholangitis). TG24 update 2024.
`,
};

export default runner;

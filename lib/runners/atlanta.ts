/** Runner: atlanta - Revised Atlanta 2012 + Balthazar CTSI для острого панкреатита */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'atlanta', label: 'Revised Atlanta 2012 - клиническая классификация тяжести' },
        { value: 'ctsi', label: 'Balthazar CTSI - радиологическая оценка (0-10)' },
      ],
    },
    {
      id: 'atlantaClass',
      label: 'Atlanta - органная недостаточность и осложнения',
      type: 'select',
      options: [
        { value: 'mild', label: 'Mild: нет OF и локальных осложнений' },
        { value: 'moderate', label: 'Moderately severe: transient OF (<48 ч) или локальные осложнения' },
        { value: 'severe', label: 'Severe: persistent OF (>48 ч)' },
      ],
    },
    {
      id: 'balthazar',
      label: 'Balthazar (КТ без контраста) A-E',
      type: 'select',
      options: [
        { value: '0', label: 'A - норма (0)' },
        { value: '1', label: 'B - отёк поджелудочной (1)' },
        { value: '2', label: 'C - перипанкреатическое воспаление (2)' },
        { value: '3', label: 'D - единичное скопление жидкости (3)' },
        { value: '4', label: 'E - ≥2 скоплений или газ (4)' },
      ],
    },
    {
      id: 'necrosis',
      label: 'Некроз (КТ с контрастом)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет некроза (0)' },
        { value: '2', label: '< 30% (2)' },
        { value: '4', label: '30-50% (4)' },
        { value: '6', label: '> 50% (6)' },
      ],
    },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    if (tool === 'atlanta') {
      const cl = String(v.atlantaClass);
      const map: Record<string, { txt: string; color: string; mort: string }> = {
        mild: { txt: 'Mild acute pancreatitis', color: '#22C55E', mort: 'Смертность < 1%, ранняя выписка возможна' },
        moderate: { txt: 'Moderately severe acute pancreatitis', color: '#F59E0B', mort: 'Смертность ~ 8%, госпитализация, возможен ICU' },
        severe: { txt: 'Severe acute pancreatitis', color: '#991B1B', mort: 'Смертность 20-50%, ICU, MOF' },
      };
      const r = (map[cl] || map.mild)!;
      return {
        value: r.txt,
        unit: '',
        interpretation: r.mort,
        color: r.color,
        details: 'Revised Atlanta 2012 (Banks PA, Bollen TL, Freeman ML et al). OF оценивается по модифицированной шкале Marshall (resp, CV, renal). Transient OF - обратимая < 48 ч, persistent OF - сохраняется > 48 ч.',
        actions: [
          'Ringer lactate 5-10 мл/кг/ч первые 24 ч',
          'Раннее энтеральное питание (< 72 ч)',
          'Антибиотики только при доказанном инфицированном некрозе',
          'ERCP срочный только при холангите/обструкции',
          'ICU при persistent OF или CTSI > 6',
        ],
        caveats: [
          'Локальные осложнения: APFC, pseudocyst, ANC, WON (классификация по Atlanta 2012)',
          'Определение moderately severe: transient OF ИЛИ локальные осложнения без persistent OF',
          'Modified Marshall score - для оценки OF (respiratory, cardiovascular, renal)',
        ],
        related: [
          { id: 'ranson', title: 'Ranson criteria' },
          { id: 'bisap', title: 'BISAP' },
          { id: 'apache', title: 'APACHE II' },
          { id: 'sofa', title: 'SOFA' },
        ],
        relatedCourses: [
          { id: '300.4', title: 'Неотложная помощь' },
          { id: '301.5', title: 'Гастроэнтерология' },
        ],
      };
    }
    const ctsi = Number(v.balthazar) + Number(v.necrosis);
    let interp = '', color = '#22C55E';
    if (ctsi <= 3) { interp = 'Лёгкий (mortality ~ 3%, morbidity ~ 8%)'; color = '#22C55E'; }
    else if (ctsi <= 6) { interp = 'Умеренный (mortality ~ 6%, morbidity ~ 35%)'; color = '#F59E0B'; }
    else { interp = 'Тяжёлый (mortality ~ 17%, morbidity ~ 92%)'; color = '#991B1B'; }
    return {
      value: String(ctsi),
      unit: 'CTSI',
      interpretation: interp,
      color,
      details: 'Balthazar CTSI (1990, Mortele modified 2004): Balthazar grade A-E (0-4) + % некроза (0-6) = 0-10. > 6 - тяжёлый панкреатит с высокой летальностью.',
      actions: [
        'CTSI > 6 - ICU, мониторинг OF',
        'Контрольная КТ через 7-10 сут при клиническом ухудшении',
        'Дренирование/некрэктомия только при инфицированном некрозе (step-up approach)',
      ],
      caveats: [
        'КТ с контрастом оптимально через 72-96 ч (раньше - недооценка некроза)',
        'Альтернатива: mCTSI (Mortele 2004) - 0-10 с учётом экстрапанкреатических осложнений',
      ],
      related: [
        { id: 'ranson', title: 'Ranson criteria' },
        { id: 'bisap', title: 'BISAP' },
        { id: 'apache', title: 'APACHE II' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.5', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Banks PA, Bollen TL, Freeman ML et al. Classification of acute pancreatitis-2012: revision of the Atlanta classification. Gut 2013;62:102-11. Balthazar EJ, Robinson DL, Megibow AJ, Ranson JH. Acute pancreatitis: value of CT in establishing prognosis. Radiology 1990;174:331-6. Mortele KJ et al. A modified CT severity index. AJR 2004;183:1261.',
  countries: 'Международный (IAP/APA, ACG guidelines)',
  presets: [
    { label: 'Mild Atlanta', values: { tool: 'atlanta', atlantaClass: 'mild', balthazar: '1', necrosis: '0' } },
    { label: 'Moderately severe', values: { tool: 'atlanta', atlantaClass: 'moderate', balthazar: '3', necrosis: '2' } },
    { label: 'Severe + persistent OF', values: { tool: 'atlanta', atlantaClass: 'severe', balthazar: '4', necrosis: '6' } },
    { label: 'CTSI 8 (тяжёлый)', values: { tool: 'ctsi', atlantaClass: 'mild', balthazar: '4', necrosis: '4' } },
  ],
  info: `### Для чего используется
**Revised Atlanta 2012** - международная классификация тяжести острого панкреатита (Banks et al, Gut 2013). Заменила оригинальную Atlanta 1992.

### Три степени тяжести (Atlanta 2012)
| Степень | Критерий |
|---|---|
| **Mild** | Нет OF, нет локальных осложнений |
| **Moderately severe** | Transient OF (< 48 ч) ИЛИ локальные осложнения / обострение сопутствующей патологии |
| **Severe** | Persistent OF (≥ 48 ч) - один или несколько органов |

### Органная недостаточность (Modified Marshall)
| Система | Порог |
|---|---|
| Respiratory | PaO₂/FiO₂ ≤ 300 |
| Cardiovascular | SBP < 90 без ответа на инфузию |
| Renal | Креатинин ≥ 170 мкмоль/л |

### Локальные осложнения
- **APFC** - acute peripancreatic fluid collection (< 4 нед, без некроза)
- **Pseudocyst** - зрелая псевдокиста (> 4 нед, стенка)
- **ANC** - acute necrotic collection (< 4 нед, с некрозом)
- **WON** - walled-off necrosis (> 4 нед, зрелая стенка)

### Balthazar CTSI (1990)
| Grade | Описание | Points |
|---|---|---|
| A | Норма | 0 |
| B | Отёк поджелудочной | 1 |
| C | Перипанкреатическое воспаление | 2 |
| D | Единичное скопление | 3 |
| E | ≥ 2 скоплений или газ | 4 |

**+ Некроз** (контраст КТ): 0 / < 30% (2) / 30-50% (4) / > 50% (6).

**CTSI = Balthazar + necrosis** (0-10).

| CTSI | Mortality | Morbidity |
|---|---|---|
| 0-3 | 3% | 8% |
| 4-6 | 6% | 35% |
| 7-10 | 17% | 92% |

### Источники
Banks PA et al. *Gut* 2013;62:102. Balthazar EJ et al. *Radiology* 1990;174:331. Mortele KJ et al. *AJR* 2004;183:1261.
`,
};

export default runner;

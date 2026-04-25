// @ts-nocheck
/** Runner: febrile-neutro */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'anc',
      hint: 'Абсолютное число нейтрофилов. Норма: 1.8-7.0 ×10⁹/л',
      label: 'ANC (абсолютное число нейтрофилов, × 10⁹/л)',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
    },
    {
      id: 'temp',
      hint: 'Температура тела, °C. Норма: 36.0-37.0',
      label: 'Температура (°C)',
      type: 'number',
      min: 35,
      max: 42,
      step: 0.1,
    },
    {
      id: 'mascc',
      label: 'MASCC score',
      type: 'number',
      min: 0,
      max: 26,
      step: 1,
    },
    {
      id: 'hemodynamic',
      label: 'Гемодинамическая нестабильность (САД < 90)',
      type: 'checkbox',
    },
    {
      id: 'organ',
      label: 'Признаки дисфункции органов (сепсис, пневмония, мукозит 3-4)',
      type: 'checkbox',
    },
    {
      id: 'duration',
      label: 'Ожидаемая длительность нейтропении > 7 дней',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const anc = Number(v.anc) || 0;
    const temp = Number(v.temp) || 0;
    const mascc = Number(v.mascc) || 0;
    const unstable = !!v.hemodynamic;
    const organ = !!v.organ;
    const prolonged = !!v.duration;

    const fnCriteria = (temp >= 38.3 || temp >= 38.0) && anc < 0.5;

    let color = '#22C55E';
    let risk = 'Низкий риск';
    let regimen = 'Амбулаторное PO: амоксициллин-клавуланат 875/125 × 2 + ципрофлоксацин 750 × 2';

    const highRisk = unstable || organ || prolonged || mascc < 21 || anc < 0.1;

    if (highRisk) {
      color = '#EF4444';
      risk = 'Высокий риск';
      regimen = 'IV стационар: пиперациллин-тазобактам 4.5 г × 4 (или цефепим 2 г × 3)';
    }

    if (unstable || organ) {
      color = '#7F1D1D';
      risk = 'Очень высокий риск (сепсис)';
      regimen = 'Меропенем 1 г × 3 + ванкомицин 15 мг/кг × 2-3 + противогрибковое; ICU';
    }

    return {
      value: risk,
      unit: fnCriteria ? 'FN подтверждена' : 'FN не соответствует критериям',
      interpretation: `${risk}. ${fnCriteria ? 'Критерии фебрильной нейтропении выполнены.' : 'Проверить критерии FN (ANC < 0.5 + T ≥ 38.3°C однократно или ≥ 38.0°C × 1 ч).'}`,
      color,
      details: `ANC ${anc} × 10⁹/л, T ${temp}°C, MASCC ${mascc}. ${regimen}. Эмпирическая терапия в течение 60 мин.`,
      actions: [
        regimen,
        'Гемокультуры × 2 (периферия + катетер) ДО антибиотика',
        'Рентген ОГК, ОАМ, посев мочи, посев из подозрительных очагов',
        'Лактат, прокальцитонин, CRP, электролиты, ЛДГ',
        unstable ? 'Раннее введение жидкостей 30 мл/кг в 3 ч; вазопрессоры при сохраняющейся гипотензии' : '',
        prolonged ? 'Профилактика: противогрибковое (флуконазол / позаконазол), ПЦР CMV, HSV/VZV' : '',
        'Переоценка через 48-72 ч; деэскалация при идентификации возбудителя',
        'G-CSF (филграстим 5 мкг/кг/сут) при тяжёлом сепсисе или длительной нейтропении',
      ].filter(Boolean),
      caveats: [
        'Критерии FN: ANC < 0.5 × 10⁹/л (или < 1.0 с прогнозом падения) + T ≥ 38.3°C однократно ИЛИ ≥ 38.0°C в течение 1 ч',
        'IDSA 2010 + ESMO 2016 + NCCN 2024',
        'Эмпирическая терапия в течение 60 мин от диагностики снижает смертность',
        'При аллергии на β-лактамы: азтреонам + ванкомицин (+/- ципрофлоксацин)',
        'Ванкомицин добавляют при: катетер-инфекции, MRSA колонизации, кожном/мягкотканном очаге, гипотензии, пневмонии',
        'Продолжать антибиотики до ANC > 0.5 и ≥ 48 ч апирексии',
        'Профилактика фторхинолоном (левофлоксацин) только при ожидаемой нейтропении > 7 дней',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Низкий', color: '#22C55E' },
          { min: 1, max: 2, label: 'Высокий', color: '#EF4444' },
          { min: 2, max: 3, label: 'Сепсис', color: '#7F1D1D' },
        ],
        current: unstable || organ ? 2 : highRisk ? 1 : 0,
        unit: 'риск',
      },
      related: [
        { id: 'mascc', title: 'MASCC' },
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'news2', title: 'NEWS2' },
      ],
      relatedCourses: [
        { id: '309.2', title: 'Клиническая онкология' },
        { id: '306.2', title: 'Инфекционные болезни' },
      ],
    };
  },
  reference: 'Freifeld AG et al. Clinical Practice Guideline for the Use of Antimicrobial Agents in Neutropenic Patients with Cancer. Clin Infect Dis 2011;52:e56-93 (IDSA 2010). + Klastersky ESMO 2016.',
  countries: 'Международный (IDSA 2010, ESMO 2016, NCCN 2024)',
  presets: [
    { label: 'Низкий риск', values: { anc: 0.3, temp: 38.5, mascc: 23, hemodynamic: false, organ: false, duration: false } },
    { label: 'Высокий риск', values: { anc: 0.1, temp: 39.0, mascc: 18, hemodynamic: false, organ: false, duration: true } },
    { label: 'Септ. шок', values: { anc: 0.05, temp: 39.5, mascc: 12, hemodynamic: true, organ: true, duration: true } },
  ],
  info: `### Для чего используется
**Фебрильная нейтропения (FN)** — онкологическая неотложность. Шкала определяет риск и оптимальную эмпирическую терапию.

### Критерии FN (IDSA 2010)
- **ANC < 0.5 × 10⁹/л** (или < 1.0 с прогнозом падения)
- **+** T ≥ **38.3°C** однократно **ИЛИ** ≥ **38.0°C** в течение ≥ 1 ч

### Стратификация риска
| Риск | Критерии |
|---|---|
| **Низкий** | MASCC ≥ 21, стабилен, нет дисфункции органов, нейтропения < 7 дн |
| **Высокий** | MASCC < 21 или любое: ANC < 0.1, нейтропения > 7 дн, HCT/BMT, мукозит, дисфункция органов |

### Эмпирическая терапия (в течение 60 мин)
**Низкий риск (амбулаторно):**
- **Амокс-клавуланат 875/125 × 2 + ципрофлоксацин 750 × 2** PO
- Условия: надёжный уход, ≤ 1 ч до клиники, согласие

**Высокий риск (IV):**
- **Пиперациллин-тазобактам 4.5 г × 4** (предпочтительно)
- **Цефепим 2 г × 3** (альтернатива)
- **Меропенем 1 г × 3** при септическом шоке, ESBL в анамнезе
- **+ ванкомицин** при: катетер-инфекции, MRSA, гипотензии, пневмонии
- **+ противогрибковое** при персистировании > 4-7 дней (вориконазол, каспофунгин)

### Пересмотр терапии
| Срок | Действие |
|---|---|
| 48-72 ч | Оценка ответа; деэскалация если возбудитель идентифицирован |
| 4-7 дн | Если лихорадка — добавить противогрибковое; КТ пазух, лёгких |
| ANC > 0.5 × 2 дн + апирексия 48 ч | Прекратить антибиотики |

### Профилактика
- **Левофлоксацин 500 мг/сут** при ожидаемой нейтропении > 7 дн (AML, BMT)
- **G-CSF** (pegfilgrastim, filgrastim) — первичная при риске FN > 20%
- **Противогрибковое** (позаконазол, флуконазол) при длительной нейтропении

### Частые возбудители
- Gram+: **CoNS, viridans strep, enterococci, MRSA**
- Gram−: **E. coli, Klebsiella, Pseudomonas**
- Грибы: **Candida, Aspergillus** (при длительной нейтропении)

### Ограничения
- MASCC не применим для пациентов уже на IV антибиотиках
- CISNE — альтернативная шкала для клинически стабильных
- Не заменяет клинической оценки`,
};
export default runner;

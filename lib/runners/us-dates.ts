/** Runner: us-dates - УЗИ-датировка беременности (Hadlock) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'method',
      label: 'Метод измерения',
      type: 'select',
      options: [
        { value: 'crl', label: 'CRL (1-й триместр, 7-13+6 нед)' },
        { value: 'bpd', label: 'BPD (2-3 триместр)' },
        { value: 'hc', label: 'HC (2-3 триместр)' },
        { value: 'ac', label: 'AC (2-3 триместр)' },
        { value: 'fl', label: 'FL (2-3 триместр)' },
      ],
    },
    {
      id: 'value',
      hint: 'Размер в миллиметрах',
      label: 'Значение (мм)',
      type: 'number',
      unit: 'мм',
      min: 1,
      max: 400,
      step: 0.1,
      quickValues: [15, 30, 45, 60, 80, 100],
    },
  ],
  compute: (v) => {
    const method = String(v.method);
    const x = Number(v.value);
    let gaDays = 0;
    let label = '';
    if (method === 'crl') {
      // Robinson-Fleming / Hadlock: GA (weeks) = 5.2876 + 0.1584*CRL - 0.0007*CRL^2 (CRL in mm)
      const gaWeeks = 5.2876 + 0.1584 * x + 0.0007 * x * x;
      gaDays = Math.round(gaWeeks * 7);
      label = 'CRL (копчико-теменной размер)';
    } else if (method === 'bpd') {
      // Hadlock BPD (cm): GA (weeks) ≈ 9.54 + 1.482*BPD + 0.1676*BPD^2
      const bpdCm = x / 10;
      const gaWeeks = 9.54 + 1.482 * bpdCm + 0.1676 * bpdCm * bpdCm;
      gaDays = Math.round(gaWeeks * 7);
      label = 'BPD (бипариетальный)';
    } else if (method === 'hc') {
      const hcCm = x / 10;
      const gaWeeks = 8.96 + 0.54 * hcCm + 0.0003 * hcCm * hcCm * hcCm;
      gaDays = Math.round(gaWeeks * 7);
      label = 'HC (окружность головы)';
    } else if (method === 'ac') {
      const acCm = x / 10;
      const gaWeeks = 8.14 + 0.753 * acCm + 0.0036 * acCm * acCm;
      gaDays = Math.round(gaWeeks * 7);
      label = 'AC (окружность живота)';
    } else {
      // FL in cm
      const flCm = x / 10;
      const gaWeeks = 10.35 + 2.46 * flCm + 0.17 * flCm * flCm;
      gaDays = Math.round(gaWeeks * 7);
      label = 'FL (длина бедра)';
    }
    const w = Math.floor(gaDays / 7);
    const d = gaDays - w * 7;
    const today = new Date();
    const edd = new Date(today);
    edd.setDate(edd.getDate() + (280 - gaDays));
    const eddStr = edd.toLocaleDateString('ru-RU');
    return {
      value: `${w} нед ${d} дн`,
      unit: '',
      interpretation: `${label} → ГВ ${w}+${d}`,
      color: '#3B82F6',
      details: `ПДР ≈ ${eddStr}. ACOG 2017: для 1-го триместра CRL точность ±5-7 дней. Если расхождение с LMP > порога - редатировать.`,
      actions: [
        '1-й триместр (до 13+6): CRL приоритетнее LMP при разнице > 7 дней',
        '14+0 до 15+6: redate при разнице > 7 дней',
        '16+0 до 21+6: redate при разнице > 10 дней',
        '22+0 до 27+6: redate при разнице > 14 дней',
        '≥ 28+0: redate при разнице > 21 дня',
        'Для EFW использовать Hadlock с 4 параметрами (BPD+HC+AC+FL)',
      ],
      caveats: [
        'CRL ненадёжен при CRL > 84 мм - переходить на биометрию',
        'BPD искажается при долихо-/брахицефалии - дополнять HC',
        'AC - самый вариабельный параметр, чувствителен к дыхательным движениям',
      ],
      related: [
        { id: 'naegele', title: 'Naegele (ПДР)' },
        { id: 'ctg', title: 'КТГ (FIGO)' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '203.9', title: 'УЗИ-диагностика' },
      ],
    };
  },
  reference:
    'Hadlock FP, 1985 (Radiology 152:497). Robinson & Fleming 1975 (CRL). ACOG Committee Opinion 700, 2017 - методика датировки.',
  countries: 'Международный (ACOG, ISUOG)',
  presets: [
    { label: 'CRL 45 мм (~11+2)', values: { method: 'crl', value: 45 } },
    { label: 'BPD 50 мм (~21 нед)', values: { method: 'bpd', value: 50 } },
    { label: 'FL 55 мм (~28 нед)', values: { method: 'fl', value: 55 } },
  ],
  caveats: [
    'Точность датировки падает с увеличением ГВ',
    'При ЭКО использовать дату переноса, а не LMP',
    'Не изменять ПДР после 1-го УЗИ, если оно выполнено до 22 нед',
  ],
  related: [
    { id: 'naegele', title: 'Naegele (ПДР)' },
    { id: 'ctg', title: 'КТГ (FIGO)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '203.9', title: 'УЗИ-диагностика' },
  ],
  info: `### Для чего используется
**УЗИ-датировка беременности** - наиболее точный способ установления гестационного возраста (ГВ) и прогнозируемой даты родов (ПДР). Заменяет LMP при расхождении более порога (ACOG 2017).

### Формулы
- **CRL (7-13+6 нед)** - Robinson-Fleming / Hadlock: GA = 5.2876 + 0.1584·CRL + 0.0007·CRL² (нед, CRL в мм). Точность ± 5-7 дней.
- **BPD / HC / AC / FL (≥ 14 нед)** - Hadlock 1984/1985. Одиночные параметры ± 7-10 дней; комбинация 4 параметров ± 8% массы (EFW).

### Правило редатирования (ACOG 2017)
| ГВ по LMP | Порог расхождения |
|---|---|
| ≤ 8+6 | > 5 дней |
| 9+0 - 13+6 | > 7 дней |
| 14+0 - 15+6 | > 7 дней |
| 16+0 - 21+6 | > 10 дней |
| 22+0 - 27+6 | > 14 дней |
| ≥ 28+0 | > 21 день |

### Источники
Hadlock FP. Radiology 1985;152:497. ACOG Committee Opinion 700, 2017. ISUOG Practice Guidelines.`,
};

export default runner;

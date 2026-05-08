/** Runner: tokyo-19 — Tokyo Guidelines 2018 (TG18/TG19) for acute cholangitis and cholecystitis */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Япония (международно принятый стандарт; J Hepatobiliary Pancreat Sci, 2018)',
  reference: 'Tokyo Guidelines 2018 (TG18) — Updated diagnostic criteria and severity grading of acute cholangitis + acute cholecystitis (J Hepatobiliary Pancreat Sci 2018; 25: 17-30 and 41-54). Часто называется TG19 в разговорной речи.',
  inputs: [
    {
      id: 'condition',
      label: 'Состояние',
      type: 'select',
      options: [
        { value: 'cholangitis', label: 'Острый холангит (acute cholangitis)' },
        { value: 'cholecystitis', label: 'Острый холецистит (acute cholecystitis)' },
      ],
    },
    {
      id: 'grade',
      label: 'Степень тяжести (оценка клинициста)',
      type: 'select',
      options: [
        { value: 'I', label: 'Grade I — лёгкая (mild)' },
        { value: 'II', label: 'Grade II — средняя (moderate)' },
        { value: 'III', label: 'Grade III — тяжёлая (severe) с органной дисфункцией' },
      ],
    },
  ],
  presets: [
    { label: 'Холангит — Grade II', values: { condition: 'cholangitis', grade: 'II' } },
    { label: 'Холецистит — Grade I (mild)', values: { condition: 'cholecystitis', grade: 'I' } },
    { label: 'Холангит — Grade III (septic)', values: { condition: 'cholangitis', grade: 'III' } },
  ],
  compute: (v) => {
    const cond = String(v.condition || 'cholangitis');
    const grade = String(v.grade || 'I');
    const diagCholangitis = '**Diagnostic criteria (TG18) — Acute cholangitis:**\n- A. Systemic inflammation: (A-1) fever/chills >38°C AND/OR (A-2) лаб. evidence воспаления (WBC, CRP↑)\n- B. Cholestasis: (B-1) желтуха (T.Bil ≥2) AND/OR (B-2) нарушение печёночных тестов (ALP/γGTP/AST/ALT >1.5× ULN)\n- C. Imaging: (C-1) билиарная дилатация AND/OR (C-2) этиология (stone/stricture/stent)\n\n**Suspected:** A + (B или C). **Definite:** A + B + C.';
    const diagCholecystitis = '**Diagnostic criteria (TG18) — Acute cholecystitis:**\n- A. Local signs: (A-1) Murphy\'s sign; (A-2) RUQ pain/tenderness/mass\n- B. Systemic: (B-1) fever; (B-2) CRP↑; (B-3) WBC↑\n- C. Imaging: характерные признаки (утолщение стенки >4 мм, pericholecystic fluid, distended GB, impacted stone)\n\n**Suspected:** 1 A + 1 B. **Definite:** 1 A + 1 B + C.';
    const severityCholangitis: Record<string, string> = {
      I: '**Grade I (mild):** не отвечает критериям Grade II или III. Инициальная медикаментозная терапия (antibiotics + supportive care) обычно эффективна.\n\n**Тактика:** в/в антибиотики + мониторинг. Biliary drainage может быть отложено (elective).',
      II: '**Grade II (moderate) — любой из:**\n- Abnormal WBC (>12 000 или <4000/мм³)\n- Высокая лихорадка ≥39°C\n- Возраст ≥75 лет\n- Гипербилирубинемия (T.Bil ≥5)\n- Гипоальбуминемия (<STD×0.7)\n\n**Тактика:** в/в антибиотики + **early biliary drainage** (ERCP в первые 24-48 ч). Без дренажа — риск перехода в тяжёлый сепсис.',
      III: '**Grade III (severe) — ≥1 органная дисфункция:**\n- Cardiovascular: гипотензия, требующая вазопрессоров\n- Neurological: нарушение сознания\n- Respiratory: PaO₂/FiO₂ <300\n- Renal: олигурия, Cr >2.0 мг/дл\n- Hepatic: PT-INR >1.5\n- Hematological: тромбоциты <100 000/мм³\n\n**Тактика:** ICU + ресусцитация + **urgent biliary drainage** (ERCP или PTBD в первые часы) + broad-spectrum АБ + органная поддержка.',
    };
    const severityCholecystitis: Record<string, string> = {
      I: '**Grade I (mild):** здоровый пациент без органной дисфункции, воспаление GB умеренное, безопасная холецистэктомия возможна.\n\n**Тактика:** раннее лапароскопическое ХЭ (в первые 72 часа — оптимально; до 10 дней — приемлемо при отсутствии противопоказаний).',
      II: '**Grade II (moderate) — любой из:**\n- WBC >18 000/мм³\n- Пальпируемая болезненная масса в RUQ\n- Длительность симптомов >72 ч\n- Выраженное локальное воспаление (gangrenous/emphysematous/pericholecystic abscess, biliary peritonitis, hepatic abscess)\n\n**Тактика:** раннее лапароскопическое ХЭ при опытной бригаде; в противном случае — консервативно + delayed ХЭ или gallbladder drainage (PTGBD/ETGBD).',
      III: '**Grade III (severe) — органная дисфункция (как при холангите G-III).**\n\n**Тактика:** стабилизация в ICU + **gallbladder drainage (PTGBD)** первая линия; срочная ХЭ только в экспертных центрах при невозможности дренажа. Антибиотики широкого спектра.',
    };
    const diag = cond === 'cholangitis' ? diagCholangitis : diagCholecystitis;
    const sev = (cond === 'cholangitis' ? severityCholangitis : severityCholecystitis)[grade];
    const color = grade === 'III' ? '#DC2626' : grade === 'II' ? '#FAAD14' : '#17E56C';
    return {
      value: `${cond === 'cholangitis' ? 'Холангит' : 'Холецистит'} Grade ${grade}`,
      unit: 'TG18 severity',
      color,
      interpretation: `TG18 Grade ${grade} — ${grade === 'I' ? 'mild' : grade === 'II' ? 'moderate' : 'severe'}`,
      details: `${diag}\n\n${sev}`,
      actions: [
        grade === 'III' ? 'ICU + ресусцитация (фл. терапия, вазопрессоры, кислород)' : 'В/в доступ, мониторинг, анальгезия',
        grade === 'III' ? 'Urgent biliary drainage (ERCP предпочтительно; PTBD если ERCP недоступен)' : grade === 'II' ? 'Early biliary drainage (24-48 ч) при холангите' : 'Плановая тактика',
        'Эмпирические антибиотики (покрытие Gram- + anaerobes): пиперациллин-тазобактам / цефалоспорины III + метронидазол / карбапенемы при сепсисе',
        cond === 'cholecystitis' ? 'Лапароскопическая холецистэктомия — раннее (G-I) vs delayed (G-II/III + drainage)' : 'После дренажа — этиологическое лечение (стон, стриктура, опухоль)',
        'Blood cultures + bile cultures перед АБ',
        'Источник: J Hepatobiliary Pancreat Sci 2018; 25:17-30 (cholangitis diagnostic) и 41-54 (cholecystitis diagnostic)',
      ],
      caveats: [
        'TG18 заменил TG13 — обновлены диагностические критерии и severity grading',
        'TG18 — международно принятый стандарт (не только в Японии)',
        'Grade II cholangitis требует дренажа даже при относительной стабильности',
        'Charcot triad (fever + jaundice + RUQ pain) — чувствительность низкая (~20-70%), TG18 более чувствительны',
        'Reynolds pentad (+ гипотензия + confusion) = Grade III по определению',
        'При неясной диагностике — MRCP или EUS перед ERCP',
      ],
      related: [
        { id: 'qsofa', title: 'qSOFA (sepsis screening)' },
        { id: 'news2', title: 'NEWS2 (early warning)' },
        { id: 'jcs', title: 'JCS (Japanese guidelines)' },
      ],
      relatedCourses: [
        { id: '305.1', title: 'Хирургия' },
        { id: '306.1', title: 'Гастроэнтерология' },
      ],
    };
  },
  info: `### Для чего используется
**Tokyo Guidelines 2018 (TG18, часто разговорно TG19)** — международные рекомендации по диагностике и лечению острого холангита и острого холецистита. Разработаны японскими экспертами, ратифицированы обществами Азии, Европы, Северной Америки. Опубликовано J Hepatobiliary Pancreat Sci 2018.

### Acute cholangitis — диагностика
- **A** Systemic inflammation (fever / WBC / CRP)
- **B** Cholestasis (jaundice / LFT)
- **C** Imaging (dilation / etiology)

**Suspected:** A + (B или C). **Definite:** A + B + C.

### Acute cholangitis — severity
| Grade | Критерий | Тактика |
|-------|----------|---------|
| **I (mild)** | Не III и не II | АБ + поддерживающая терапия; drainage elective |
| **II (moderate)** | WBC, лихорадка ≥39°C, возраст ≥75, T.Bil ≥5, гипоальбуминемия | АБ + **early drainage (24-48 ч)** |
| **III (severe)** | ≥1 органная дисфункция | ICU + **urgent drainage** |

### Acute cholecystitis — severity
| Grade | Тактика |
|-------|---------|
| **I** | Раннее лапароскопическое ХЭ (первые 72 ч) |
| **II** | Раннее ХЭ при экспертной бригаде; иначе — drainage + delayed ХЭ |
| **III** | PTGBD (gallbladder drainage) первая линия |

### Источники
- Kiriyama S et al. TG18: diagnostic criteria and severity grading of acute cholangitis. J Hepatobiliary Pancreat Sci 2018; 25: 17-30
- Yokoe M et al. TG18: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci 2018; 25: 41-54
- http://www.jshbps.jp/modules/en/index.php?content_id=47`,
};
export default runner;

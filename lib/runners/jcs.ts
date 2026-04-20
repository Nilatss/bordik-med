// @ts-nocheck
/** Runner: jcs — Japanese clinical guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Япония',
  reference: 'JCS — Japanese Circulation Society; JDS — Japan Diabetes Society; JSMO — Japanese Society of Medical Oncology; JPS — Japan Pediatric Society; Minds — Japan Council for Quality Health Care. https://www.j-circ.or.jp, https://www.jds.or.jp, https://minds.jcqhc.or.jp',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология (JCS — Japanese Circulation Society)' },
        { value: 'diabetes', label: 'Диабет (JDS — Japan Diabetes Society)' },
        { value: 'onko', label: 'Онкология (JSMO, JSCO)' },
        { value: 'paed', label: 'Педиатрия (JPS — Japan Pediatric Society)' },
        { value: 'gi', label: 'Гастроэнтерология (JSGE — Japanese Society of Gastroenterology)' },
        { value: 'resp', label: 'Респираторная (JRS — Japanese Respiratory Society)' },
        { value: 'minds', label: 'Минздрав / Minds (национальная база гайдлайнов)' },
      ],
    },
  ],
  presets: [
    { label: 'JCS — Cardiology', values: { specialty: 'cardio' } },
    { label: 'JDS — Diabetes', values: { specialty: 'diabetes' } },
    { label: 'Minds — национальный портал', values: { specialty: 'minds' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'cardio');
    const map: Record<string, { name: string; society: string; examples: string }> = {
      cardio: { name: 'Кардиология', society: 'JCS — 日本循環器学会', examples: 'JCS/JHFS Guideline for Diagnosis and Treatment of Acute and Chronic Heart Failure (2017, upd. 2021); JCS Guidelines for AF Management (2020); JCS Guidelines for Diagnosis and Treatment of Patients with Ischaemic Heart Disease (2022). Японская специфика: более высокая распространённость вазоспастической стенокардии, Takotsubo; более низкие дозы статинов часто приемлемы (восточноазиатский метаболизм).' },
      diabetes: { name: 'Диабет', society: 'JDS — 日本糖尿病学会', examples: 'Treatment Guide for Diabetes (ежегодное обновление); Evidence-based Practice Guideline for Treatment of Diabetes in Japan (2024). Специфика: более низкий BMI при T2DM, повышенная чувствительность к сульфонилмочевине, широкое использование ингибиторов DPP-4, HbA1c 6.5% (NGSP) = 6.1% (JDS — old).' },
      onko: { name: 'Онкология', society: 'JSMO + JSCO + organ-specific societies', examples: 'JSMO guidelines, JSCO guidelines. Локализации: гастрит/рак желудка (высокая распространённость), колоректальный (JSCCR), HCC (JSH — Japan Society of Hepatology с TNM-like Japanese staging). Скрининг желудка — эндоскопия после 50 лет.' },
      paed: { name: 'Педиатрия', society: 'JPS — 日本小児科学会', examples: 'Национальный календарь прививок (Japan Immunization Program), Kawasaki disease guidelines (Япония — страна-пионер), neonatal resuscitation, childhood obesity.' },
      gi: { name: 'Гастроэнтерология', society: 'JSGE — 日本消化器病学会', examples: 'H. pylori eradication guidelines, GERD, IBD, NAFLD, хронический панкреатит, Kyoto consensus для хронического гастрита. JSH — отдельно для печени.' },
      resp: { name: 'Респираторная', society: 'JRS — 日本呼吸器学会', examples: 'COPD (адаптация GOLD с японскими особенностями), астма, IPF, community-acquired pneumonia, ABPA. Mycobacterium avium complex (MAC) — высокая заболеваемость в Японии.' },
      minds: { name: 'Minds (Medical Information Network Distribution Service)', society: 'Japan Council for Quality Health Care', examples: 'Minds — национальный портал клинических рекомендаций Японии (minds.jcqhc.or.jp). Агрегатор всех Clinical Practice Guidelines + оценка методологического качества (AGREE II). Японские CPG + переводы ключевых международных.' },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'Japan',
      color: '#6B7280',
      interpretation: `Navigate: Japanese ${e.name}`,
      details: `**Специальность:** ${e.name}\n\n**Общество:** ${e.society}\n\n**Примеры:** ${e.examples}\n\n**Особенности:** Многие японские гайдлайны имеют английский перевод (часто с задержкой 1-2 года). Minds portal предоставляет методологическую оценку. Японская фармакогенетика: восточноазиатские различия дозирования (warfarin, clopidogrel CYP2C19 LOF частый).`,
      actions: [
        'JCS: https://www.j-circ.or.jp/english/',
        'JDS: https://www.jds.or.jp/modules/en/',
        'Minds portal: https://minds.jcqhc.or.jp/',
        'PMDA (регулятор): https://www.pmda.go.jp/english/',
        'MHLW (Ministry of Health): https://www.mhlw.go.jp/english/',
        'Japan Medical Association: https://www.med.or.jp/english/',
        'Nihon Rinsho (clinical journal archives)',
      ],
      caveats: [
        'Полные тексты — на японском; английские переводы часто у JCS, JDS, JSMO',
        'Восточноазиатская фармакогенетика: CYP2C19 LOF более часта → clopidogrel резистентность; warfarin более чувствительны',
        'HbA1c: до 2012 использовался JDS value (≈ NGSP − 0.4%); сейчас NGSP стандарт',
        'Onco staging: для желудка/HCC/колоректального есть японская система помимо TNM',
        'Реимбурсирование: universal health insurance (Kokuho), утверждение через Chuikyo',
        'Многие препараты требуют более низких доз (массы тела, генетика)',
      ],
      related: [
        { id: 'china', title: 'China (CMA)' },
        { id: 'ktas', title: 'KTAS (Korean Triage)' },
        { id: 'esc-eu', title: 'ESC (European Cardiology)' },
      ],
      relatedCourses: [
        { id: '303.1', title: 'Кардиология' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по японским клиническим рекомендациям. Япония имеет развитую систему EBM гайдлайнов с собственной спецификой (фармакогенетика, эпидемиология, диета).

### Ключевые общества
| Общество | Домен |
|----------|-------|
| **JCS** (Japanese Circulation Society) | Кардиология |
| **JDS** (Japan Diabetes Society) | Диабет |
| **JSMO / JSCO** | Онкология |
| **JPS** | Педиатрия |
| **JSGE / JSH** | Гастро / гепатология |
| **JRS** | Респираторная |
| **Minds** | Национальный портал-агрегатор |

### Японская специфика
- Восточноазиатская фармакогенетика (CYP2C19, warfarin sensitivity)
- Более низкий BMI при T2DM
- Высокая распространённость рака желудка, HCC (HCV/HBV), MAC infection, Kawasaki
- Болезнь Такоцубо впервые описана в Японии (1990)
- Universal health insurance (Kokuho) — покрытие ~70%

### Источники
- https://www.j-circ.or.jp/english/
- https://www.jds.or.jp/modules/en/
- https://minds.jcqhc.or.jp/
- https://www.pmda.go.jp/english/`,
};
export default runner;

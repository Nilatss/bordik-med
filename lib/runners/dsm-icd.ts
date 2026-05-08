/** Runner: dsm-icd — DSM-5-TR vs ICD-11 / ICD-10 crosswalk */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (APA DSM) / Международный (WHO ICD)',
  reference:
    'American Psychiatric Association. DSM-5-TR. 2022. WHO. ICD-11 for Mortality and Morbidity Statistics (MMS), 2022. WHO. ICD-10 F-chapter, 1992.',
  inputs: [
    {
      id: 'category',
      label: 'Диагностическая категория',
      type: 'select',
      options: [
        { value: 'mood', label: 'Расстройства настроения (депрессия / биполярное)', points: 0 },
        { value: 'anxiety', label: 'Тревожные расстройства', points: 0 },
        { value: 'psychotic', label: 'Психотические (шизофрения)', points: 0 },
        { value: 'substance', label: 'Расстройства от ПАВ', points: 0 },
        { value: 'personality', label: 'Расстройства личности', points: 0 },
        { value: 'neurodev', label: 'Нейроразвитиевые (СДВГ, РАС)', points: 0 },
      ],
    },
  ],
  presets: [
    { label: 'Настроение', values: { category: 'mood' } },
    { label: 'Психоз', values: { category: 'psychotic' } },
    { label: 'Нейроразвитие', values: { category: 'neurodev' } },
  ],
  compute: (v) => {
    const cat = String(v.category || 'mood');

    const crosswalk: Record<string, {
      name: string;
      dsm: string;
      icd11: string;
      icd10: string;
      keyDiff: string[];
    }> = {
      mood: {
        name: 'Расстройства настроения',
        dsm: 'DSM-5-TR: Major Depressive Disorder (296.2x/296.3x); Bipolar I (296.4x-296.7x); Bipolar II (296.89); Persistent Depressive (300.4)',
        icd11: 'ICD-11: 6A70 Single-episode depressive; 6A71 Recurrent depressive; 6A60 Bipolar I; 6A61 Bipolar II; 6A72 Dysthymic',
        icd10: 'ICD-10: F32 Депрессивный эпизод; F33 Рекуррентное; F31 Биполярное; F34.1 Дистимия',
        keyDiff: [
          'ICD-11 выделил Bipolar II как отдельный код (в ICD-10 был "Other bipolar F31.8")',
          'DSM-5 требует ≥5 симптомов депрессии ≥2 нед; ICD-11 — ≥5 симптомов ≥2 нед (конвергенция)',
          'DSM-5-TR добавил "prolonged grief disorder" (F43.8 / 6B42); ICD-11 имеет отдельный 6B42',
          'ICD-11 убрала "mixed anxiety-depression" как отдельную категорию',
        ],
      },
      anxiety: {
        name: 'Тревожные расстройства',
        dsm: 'DSM-5-TR: GAD (300.02); Panic disorder (300.01); Social anxiety (300.23); Specific phobia (300.29); Agoraphobia (300.22)',
        icd11: 'ICD-11: 6B00 GAD; 6B01 Panic; 6B04 Social anxiety; 6B03 Specific phobia; 6B02 Agoraphobia',
        icd10: 'ICD-10: F41.1 ГТР; F41.0 Паническое; F40.1 Социальная фобия; F40.2 Специфические; F40.0 Агорафобия',
        keyDiff: [
          'ICD-11 и DSM-5 согласованы по агорафобии (без привязки к паническому)',
          'ICD-11 отделила ОКР (6B20), ПТСР (6B40), стресс-связанные (6B4*) от тревожных — как и DSM-5',
          'Separation anxiety в DSM-5 / ICD-11 теперь и у взрослых (ранее только детская)',
        ],
      },
      psychotic: {
        name: 'Психотические расстройства',
        dsm: 'DSM-5-TR: Schizophrenia (295.90); Schizoaffective (295.70); Schizophreniform (295.40); Brief psychotic (298.8); Delusional (297.1)',
        icd11: 'ICD-11: 6A20 Schizophrenia; 6A21 Schizoaffective; 6A22 Schizotypal; 6A23 Acute/transient psychotic; 6A24 Delusional',
        icd10: 'ICD-10: F20 Шизофрения (параноидная F20.0 и др.); F25 Шизоаффективное; F23 Острое и преходящее; F22 Хроническое бредовое',
        keyDiff: [
          '⚠️ ICD-11 и DSM-5-TR УБРАЛИ подтипы шизофрении (параноидная, кататоническая, гебефреническая) — были в ICD-10 F20.0-F20.9',
          'ICD-11 ввела "symptom specifiers" вместо подтипов: positive/negative/depressive/manic/psychomotor/cognitive',
          'Длительность шизофрении: DSM-5 ≥6 мес; ICD-11 ≥1 мес (ключевое отличие!)',
          'Schizophreniform (1-6 мес) есть только в DSM-5; в ICD-11 это Schizophrenia 6A20',
        ],
      },
      substance: {
        name: 'Расстройства от ПАВ',
        dsm: 'DSM-5-TR: Alcohol UD (303.90/305.00); Opioid UD (304.00/305.50); Stimulant UD; Cannabis UD — "use disorder" единая шкала (mild/moderate/severe)',
        icd11: 'ICD-11: 6C40-6C4E по веществам, episode of harmful use + dependence + intoxication + withdrawal — раздельно',
        icd10: 'ICD-10: F10-F19 — раздельно "злоупотребление" (F1x.1) и "синдром зависимости" (F1x.2)',
        keyDiff: [
          'DSM-5 объединил abuse + dependence в единое "use disorder" (mild/moderate/severe)',
          'ICD-11 сохранила раздельно "episode of harmful use" (6C40.1) и "dependence" (6C40.2) — ближе к ICD-10',
          'ICD-11 добавила "hazardous use" (QE10-QE19) как пре-расстройство в разделе Z-factors',
          'Cannabis UD признан в DSM-5 и ICD-11, в ICD-10 был F12',
        ],
      },
      personality: {
        name: 'Расстройства личности',
        dsm: 'DSM-5-TR Section II: Paranoid (301.0); Schizoid (301.20); Schizotypal (301.22); Antisocial (301.7); Borderline (301.83); Histrionic (301.50); Narcissistic (301.81); Avoidant (301.82); Dependent (301.6); OCPD (301.4). DSM-5 Section III: AMPD (Alternative Model)',
        icd11: 'ICD-11: 6D10 Personality disorder (единая категория) + specifiers по тяжести (mild/moderate/severe) и prominent trait domains (negative affectivity / detachment / dissociality / disinhibition / anankastia / borderline pattern qualifier 6D11.5)',
        icd10: 'ICD-10: F60.0-F60.9 — 8 категорий: паранойяльное F60.0, шизоидное F60.1, диссоциальное F60.2, эмоц. неустойчивое F60.3, истерическое F60.4, ананкастное F60.5, тревожное F60.6, зависимое F60.7',
        keyDiff: [
          '⚠️ ICD-11 РАДИКАЛЬНО изменила — удалила все категории (paranoid, borderline и др.), осталась 1 категория с выраженностью + trait domains',
          'Borderline сохранен как "qualifier" (6D11.5) — по требованию клиницистов',
          'DSM-5-TR оставил 10 категорий в Section II, но предложил альтернативную модель (AMPD) в Section III',
          'DSM-5 Section III AMPD ближе к ICD-11: dimensional (personality functioning + 5 pathological trait domains)',
        ],
      },
      neurodev: {
        name: 'Нейроразвитиевые расстройства',
        dsm: 'DSM-5-TR: ADHD (314.0x — Inattentive/Hyperactive-Impulsive/Combined); ASD (299.00 — единый спектр, severity 1-3); Intellectual Disability (319); Specific learning disorder (315.0x)',
        icd11: 'ICD-11: 6A05 ADHD (предоминантный паттерн как спецификатор); 6A02 Autism spectrum disorder (с/без intellectual impairment/language); 6A00 Disorders of intellectual development; 6A03 Developmental learning disorder',
        icd10: 'ICD-10: F90.0 Гиперкинетическое расстройство (narrower than DSM-5 ADHD); F84.0 Детский аутизм, F84.5 Аспергер (!), F84.1 Атипичный; F70-F79 Умственная отсталость',
        keyDiff: [
          '⚠️ ICD-11 и DSM-5 УБРАЛИ Asperger как отдельный (был F84.5 в ICD-10) → объединены в Autism Spectrum',
          'ICD-10 F90.0 "hyperkinetic disorder" УЖЕ чем DSM-5 ADHD — требует combined (невнимание + гиперактивность)',
          'ICD-11 6A05 сблизилась с DSM-5: inattentive / hyperactive-impulsive / combined как спецификаторы',
          '"Intellectual Disability" (DSM-5) = "Disorders of intellectual development" (ICD-11) = "Mental retardation" (ICD-10 — устаревший термин)',
        ],
      },
    };

    const info = crosswalk[cat]!;
    const color = '#4B8DF5';

    return {
      value: info.name,
      unit: 'категория',
      color,
      interpretation: `Сопоставление DSM-5-TR ↔ ICD-11 ↔ ICD-10: ${info.name}`,
      details: `${info.dsm}\n\n${info.icd11}\n\n${info.icd10}`,
      actions: info.keyDiff,
      caveats: [
        'DSM-5-TR (2022) — APA, используется преимущественно в США и клинических исследованиях',
        'ICD-11 (2022) — WHO, официальный с 01.01.2022, глобальный стандарт',
        'ICD-10 F-chapter (1992) — всё ещё официальный в РФ/СНГ (переход на ICD-11 постепенный)',
        'Официальные coding guidelines: APA для DSM, WHO для ICD',
        'Таблица — обзорная; для точного кода использовать полные manuals',
        'ICD-11 имеет "primary care" (ICD-11-PHC) упрощённую версию',
      ],
      related: [
        { id: 'scid', title: 'SCID-5' },
        { id: 'mmpi', title: 'MMPI-2' },
      ],
      relatedCourses: [{ id: '306.1', title: 'Психиатрия — классификация' }],
    };
  },
  info: `### Для чего используется
Быстрое сопоставление диагностических кодов между **DSM-5-TR (APA 2022)**, **ICD-11 (WHO 2022)** и **ICD-10 F-глава (WHO 1992)**. Критически важно для:
- Документирования в РФ (ICD-10) и за рубежом (ICD-11 / DSM)
- Научных публикаций (DSM международно признан)
- Страхового биллинга
- Конвертации исторических диагнозов

### Ключевые макро-отличия DSM-5 vs ICD-11
| Аспект | DSM-5-TR | ICD-11 |
|---|---|---|
| Автор | APA (США) | WHO (глобально) |
| Год | 2022 (TR) | 2022 (officially in force) |
| Формат | Текст + критерии A-E | Короткие дефиниции |
| Расстройства личности | 10 категорий (Sec II) + AMPD (Sec III) | **1 категория + dimensional** |
| Шизофрения | ≥6 мес, нет подтипов | **≥1 мес**, нет подтипов |
| Use disorder | Единый spectrum (mild/mod/severe) | Episode vs Dependence (раздельно) |
| Prolonged grief | Добавлено в TR (2022) | 6B42 с 2018 |
| Gaming disorder | НЕТ | 6C51 (добавлено в ICD-11) |
| Complex PTSD | НЕТ отдельно | 6B41 (отдельный дз) |

### Ключевые отличия от ICD-10 (устаревающей)
- ICD-10 сохраняет **Asperger (F84.5)** — удалён в DSM-5 и ICD-11
- ICD-10 сохраняет **подтипы шизофрении** (параноидная F20.0 и др.) — удалены в DSM-5 и ICD-11
- ICD-10 сохраняет **10 категорий расстройств личности** (F60.0-9) — радикально переработано в ICD-11
- "Умственная отсталость" (F70-79) → ICD-11: "Disorders of intellectual development"

### Ограничения
- Не все DSM коды имеют точный аналог в ICD (и наоборот)
- Культурно-специфические синдромы (dhat, koro, ataque de nervios) — по-разному
- Official crosswalks: APA DSM-5-TR Appendix; WHO ICD-11 Browser`,
};

export default runner;

// @ts-nocheck
/** Runner: esc-eu — European Society of Cardiology guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'ЕС / Европа (референс для всех стран Европейского кардиологического общества)',
  reference: 'European Society of Cardiology (ESC). https://www.escardio.org/Guidelines. Европейское кардиологическое общество — ведущий производитель кардиологических гайдлайнов в Европе.',
  inputs: [
    {
      id: 'disease',
      label: 'Нозология',
      type: 'select',
      options: [
        { value: 'hf', label: 'Heart Failure (HF)' },
        { value: 'acs', label: 'Acute Coronary Syndrome (ACS) / NSTEMI / STEMI' },
        { value: 'af', label: 'Atrial Fibrillation (AF)' },
        { value: 'htn', label: 'Hypertension (HTN) / Arterial Hypertension' },
        { value: 'dyslip', label: 'Dyslipidaemias / CVD prevention' },
        { value: 'valve', label: 'Valvular Heart Disease' },
        { value: 'pe', label: 'Pulmonary Embolism (PE)' },
        { value: 'pregnancy', label: 'Cardiovascular Disease in Pregnancy' },
      ],
    },
  ],
  presets: [
    { label: 'Heart Failure', values: { disease: 'hf' } },
    { label: 'Atrial Fibrillation', values: { disease: 'af' } },
    { label: 'ACS / STEMI', values: { disease: 'acs' } },
  ],
  compute: (v) => {
    const d = String(v.disease || 'hf');
    const map: Record<string, { name: string; year: string; cosponsor: string; key: string }> = {
      hf: { name: 'Heart Failure', year: '2021 (focused update 2023)', cosponsor: 'Heart Failure Association (HFA)', key: 'Four pillars: ARNI/ACEi/ARB + β-blocker + MRA + SGLT2 inhibitor for HFrEF. LVEF classification: HFrEF ≤40%, HFmrEF 41-49%, HFpEF ≥50%.' },
      acs: { name: 'Acute Coronary Syndromes', year: '2023 (unified ACS guideline)', cosponsor: 'EACVI, EAPC, EACTS', key: 'Unified approach: NSTE-ACS vs STE-ACS. DAPT (aspirin + prasugrel/ticagrelor preferred over clopidogrel). Early invasive strategy <24h for intermediate-high risk. TIMI/GRACE risk scores.' },
      af: { name: 'Atrial Fibrillation', year: '2024', cosponsor: 'EACTS', key: 'AF-CARE pathway: [C]omorbidity + risk factors → [A]void stroke (CHA2DS2-VASc ≥1 men / ≥2 women → OAC, DOACs preferred) → [R]educe symptoms (rate/rhythm control, early rhythm control) → [E]valuation and dynamic reassessment.' },
      htn: { name: 'Arterial Hypertension / Elevated BP', year: '2024 (ESC) / 2023 (ESH)', cosponsor: 'ESH (2023)', key: 'Categories: Non-elevated <120/70, Elevated 120-139/70-89, Hypertension ≥140/90. Target <130/80 for most; <140/80 if ≥85y. Initial: single-pill combo (ACEi/ARB + CCB or thiazide-like).' },
      dyslip: { name: 'Dyslipidaemias / CVD prevention', year: '2019 (dyslipidaemias) + 2021 (CVD prevention)', cosponsor: 'EAS (European Atherosclerosis Society)', key: 'SCORE2 / SCORE2-OP risk charts (region-specific: low/moderate/high/very-high risk countries). LDL targets: <1.4 mmol/L (very-high risk), <1.8 (high), <2.6 (moderate). Statin + ezetimibe + PCSK9i.' },
      valve: { name: 'Valvular Heart Disease', year: '2021', cosponsor: 'EACTS', key: 'TAVI expanded: low-risk patients ≥75y now Class I. Heart Team decision for all severe VHD. Mitral: TEER for selected. Tricuspid: growing evidence for intervention.' },
      pe: { name: 'Pulmonary Embolism', year: '2019', cosponsor: 'ERS (Respiratory Society)', key: 'Hemodynamic instability → reperfusion (thrombolysis / embolectomy). Stable: risk stratify by sPESI + RV dysfunction + troponin → low-risk home treatment possible. DOACs preferred for most.' },
      pregnancy: { name: 'CVD in Pregnancy', year: '2018 (update in progress)', cosponsor: 'EACVI', key: 'mWHO classification (I-IV) for maternal CV risk. Pre-pregnancy counselling mandatory for mWHO II-IV. Avoid ACEi/ARB/MRA/warfarin (teratogenic). β-blockers, methyldopa, nifedipine safe for HTN.' },
    };
    const e = map[d];
    return {
      value: e.name,
      unit: 'ESC Guideline',
      color: '#6B7280',
      interpretation: `ESC ${e.name} ${e.year}`,
      details: `**Гайдлайн:** ${e.name}\n\n**Год публикации:** ${e.year}\n\n**Соавторы:** ${e.cosponsor}\n\n**Ключевые положения:**\n${e.key}\n\n**Формат ESC:** Full Guidelines (60-200 стр.) + Pocket Guidelines (краткая карманная версия) + Slide sets + ESC Pocket Guidelines app. Class of recommendation (I / IIa / IIb / III) + Level of evidence (A / B / C).`,
      actions: [
        'ESC Guidelines portal: https://www.escardio.org/Guidelines',
        'ESC Pocket Guidelines app (iOS/Android) — offline, все актуальные гайдлайны',
        'European Heart Journal — полная публикация',
        'EHJ supplements — focused updates',
        'SCORE2: https://heartscore.escardio.org/',
        'ESC Congress (ежегодно, август-сентябрь) — первичная публикация новых гайдлайнов',
      ],
      caveats: [
        'Все гайдлайны на английском (есть некоторые переводы через национальные общества)',
        'Региональный риск SCORE2: Uzbekistan / CIS → very-high-risk region',
        'Обновления: major guidelines каждые 4-5 лет + focused updates между ними',
        'Class III = harm (не делать) vs Class III no benefit — различать',
        'Level C = consensus (без РКИ) — не путать с низким качеством',
        'Некоторые препараты недоступны в разных странах (ARNI/SGLT2i — покрытие варьирует)',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'has-fr', title: 'HAS (France)' },
        { id: 'awmf-de', title: 'AWMF / DGK (Germany)' },
        { id: 'jcs', title: 'JCS (Japan)' },
      ],
      relatedCourses: [
        { id: '303.1', title: 'Кардиология' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**ESC (European Society of Cardiology)** — ведущий источник европейских кардиологических гайдлайнов. Референс для ЕС + Великобритании + стран Восточной Европы + СНГ.

### Методология
- **Class of Recommendation:** I (рекомендовано), IIa (следует рассмотреть), IIb (может быть рассмотрено), III (не рекомендовано — harm/no benefit)
- **Level of Evidence:** A (multiple RCTs/meta), B (single RCT/large non-RCT), C (expert consensus)

### Форматы
- **Full Guidelines** — полный текст (60-200 стр., European Heart Journal)
- **Pocket Guidelines** — карманная версия
- **ESC Pocket Guidelines App** — бесплатно, offline
- **Slide sets** + **teaching slides**

### Ключевые действующие гайдлайны (на 2026)
| Нозология | Год |
|-----------|-----|
| Heart Failure | 2021 / upd. 2023 |
| ACS (unified) | 2023 |
| Atrial Fibrillation | 2024 |
| Hypertension (ESC) | 2024 |
| Hypertension (ESH) | 2023 |
| Dyslipidaemias | 2019 |
| VHD | 2021 |
| PE | 2019 |
| CVD Prevention | 2021 |
| Cardio-oncology | 2022 |
| Diabetes / CVD | 2023 |

### Источники
- https://www.escardio.org/Guidelines
- European Heart Journal
- https://heartscore.escardio.org/`,
};
export default runner;

// @ts-nocheck
/** Runner: awmf-de — AWMF (Germany) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Германия (также Австрия, Швейцария — частично)',
  reference: 'AWMF — Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften. https://www.awmf.org/leitlinien/',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность / домен',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология (DGK)' },
        { value: 'onko', label: 'Онкология (Leitlinienprogramm Onkologie)' },
        { value: 'innere', label: 'Внутренние болезни (DGIM)' },
        { value: 'chirurgie', label: 'Хирургия (DGCH)' },
        { value: 'paed', label: 'Педиатрия (DGKJ)' },
        { value: 'gyn', label: 'Гинекология / акушерство (DGGG)' },
        { value: 'allgemein', label: 'Общая врачебная практика (DEGAM)' },
        { value: 'psych', label: 'Психиатрия (DGPPN)' },
      ],
    },
  ],
  presets: [
    { label: 'Онкология (S3)', values: { specialty: 'onko' } },
    { label: 'Общая практика (DEGAM)', values: { specialty: 'allgemein' } },
    { label: 'Кардиология (DGK)', values: { specialty: 'cardio' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'innere');
    const map: Record<string, { name: string; society: string; examples: string; actions: string[]; caveats: string[] }> = {
      cardio: {
        name: 'Кардиология',
        society: 'DGK — Deutsche Gesellschaft für Kardiologie',
        examples: 'Herzinsuffizienz (S3), KHK (NVL — Nationale VersorgungsLeitlinie), Vorhofflimmern (ESC-adaptiert), Hypertonie (NVL).',
        actions: [
          'DGK portal: https://www.dgk.org/',
          'NVL Chronische KHK: https://www.leitlinien.de/themen/khk',
          'NVL Chronische Herzinsuffizienz: https://www.leitlinien.de/themen/herzinsuffizienz',
          'NVL Hypertonie: https://www.leitlinien.de/themen/hypertonie',
        ],
        caveats: [
          'DGK часто адаптирует ESC guidelines с 1-2-летней задержкой',
          'NVL обязательна для DMP (Disease Management Programme) реимбурсации',
          'Novel OACs — все 4 в формуляре GKV (кроме edoxaban DVT в некоторых регионах)',
          'Familiäre Hypercholesterinämie — Lp(a) screening рекомендован DGK',
        ],
      },
      onko: {
        name: 'Онкология',
        society: 'Leitlinienprogramm Onkologie (DKG + DKH + AWMF)',
        examples: 'Mammakarzinom (S3), Kolorektales Karzinom (S3), Prostatakarzinom (S3), Lungenkarzinom (S3). Высочайшее качество S3 + lebende Leitlinie.',
        actions: [
          'Leitlinienprogramm Onkologie: https://www.leitlinienprogramm-onkologie.de/',
          'OnkoZert (зертификация центров): https://www.onkozert.de/',
          'S3 Mammakarzinom (актуальная версия)',
          'S3 Kolorektales Karzinom (lebende Leitlinie)',
        ],
        caveats: [
          'Lebende Leitlinien (Mamma-CA, CRC) — обновления rolling, не раз в 5 лет',
          'Тумор-борд обязателен для certified Organkrebszentren',
          'GBA Nutzenbewertung — отдельно от S3 (влияет на Erstattung)',
          'Molecular tumor board — в certified Comprehensive Cancer Centers (CCC)',
        ],
      },
      innere: {
        name: 'Внутренние болезни',
        society: 'DGIM — Deutsche Gesellschaft für Innere Medizin',
        examples: 'Diabetes mellitus Typ 2 (NVL), Asthma (NVL), COPD (NVL), Sepsis (S3).',
        actions: [
          'DGIM portal: https://www.dgim.de/',
          'NVL Diabetes mellitus Typ 2: https://www.leitlinien.de/themen/diabetes',
          'NVL Asthma: https://www.leitlinien.de/themen/asthma',
          'S3 Sepsis: https://www.awmf.org/leitlinien/',
        ],
        caveats: [
          'DMP Diabetes / COPD / Asthma / KHK — обязательна NVL-adherence для Vergütung',
          'HbA1c target NVL DM2 = 6.5–7.5% (индивидуализация)',
          'Klug entscheiden (Choosing Wisely Deutschland) — DGIM initiative',
          'SGLT2i / GLP-1 RA в NVL DM2 с cardiovasc. benefit',
        ],
      },
      chirurgie: {
        name: 'Хирургия',
        society: 'DGCH',
        examples: 'Akute Appendizitis (S1), Leistenhernie (S2k), postoperative Thromboseprophylaxe (S3).',
        actions: [
          'DGCH portal: https://www.dgch.de/',
          'S3 Perioperative Thromboseprophylaxe: https://www.awmf.org/leitlinien/detail/ll/003-001.html',
          'DGAV (Visceralchirurgie): https://www.dgav.de/',
          'DGU (Unfallchirurgie): https://www.dgu-online.de/',
        ],
        caveats: [
          'ERAS (Enhanced Recovery After Surgery) — интегрирован в S3',
          'Mindestmengen (min. case volumes) — обязательны для некоторых операций (esophagus, pancreas)',
          'Thromboseprophylaxe — LMWH стандарт, DOAC только для orthopaedic',
          'G-AEP критерии для стационара (DRG relevant)',
        ],
      },
      paed: {
        name: 'Педиатрия',
        society: 'DGKJ — Deutsche Gesellschaft für Kinder- und Jugendmedizin',
        examples: 'Neugeborenen-Screening, Impfkalender (STIKO), Fieberkrämpfe (S2k), ADHS (S3).',
        actions: [
          'DGKJ portal: https://www.dgkj.de/',
          'STIKO-Empfehlungen (RKI): https://www.rki.de/DE/Content/Kommissionen/STIKO/',
          'U-Untersuchungen (U1–U9, J1) — Kinder-Richtlinie',
          'Neugeborenen-Screening: https://www.g-ba.de/',
        ],
        caveats: [
          'STIKO — референс для Impfkalender (не CDC/ACIP)',
          'U-Untersuchungen обязательны для Mutterschutz/Kindergeld',
          'Erweitertes Neugeborenen-Screening: 19 заболеваний (с 2022 SMA)',
          'Gelbes Heft — стандартный документ U-Untersuchungen',
        ],
      },
      gyn: {
        name: 'Гинекология/акушерство',
        society: 'DGGG',
        examples: 'Mammakarzinom (S3), Schwangerenvorsorge (Mutterschafts-Richtlinien), HPV-Impfung, Endometriose (S2k).',
        actions: [
          'DGGG portal: https://www.dggg.de/',
          'Mutterschafts-Richtlinien (G-BA): https://www.g-ba.de/richtlinien/19/',
          'S3 Endometriose: https://www.awmf.org/leitlinien/',
          'HPV-Impfung STIKO-Empfehlung',
        ],
        caveats: [
          'Mutterschafts-Richtlinien — legal mandate для пренатального скрининга',
          'HPV-Impfung STIKO: 9–14 лет (оба пола с 2018)',
          'Mammographie-Screening: 50–69 (расширение до 75 с 2024)',
          'NIPT — в GKV с 2022 для риск-ситуаций',
        ],
      },
      allgemein: {
        name: 'Общая врачебная практика',
        society: 'DEGAM — Deutsche Gesellschaft für Allgemeinmedizin',
        examples: 'DEGAM-Leitlinien: Halsschmerzen, Kreuzschmerz, Husten, Müdigkeit. Ориентация на Hausarzt (семейный врач).',
        actions: [
          'DEGAM portal: https://www.degam.de/',
          'DEGAM-Leitlinien: https://www.degam.de/degam-leitlinien-379.html',
          'DEGAM S3 Hausärztliche Beratung "Ganz am Ende des Lebens"',
          'DEGAM Patienteninformationen',
        ],
        caveats: [
          'Hausärztliche Versorgung — воротный механизм (gatekeeper) не обязателен в GKV, но распространён',
          'DEGAM-LL часто менее interventionist чем specialist',
          'Klug entscheiden (Choosing Wisely) — DEGAM активный участник',
          'Disease Management Programme (DMP) — основа долгосрочной помощи',
        ],
      },
      psych: {
        name: 'Психиатрия',
        society: 'DGPPN',
        examples: 'Unipolare Depression (S3 NVL), Schizophrenie (S3), Demenzen (S3), Angststörungen (S3).',
        actions: [
          'DGPPN portal: https://www.dgppn.de/',
          'NVL Unipolare Depression: https://www.leitlinien.de/themen/depression',
          'S3 Schizophrenie: https://www.awmf.org/leitlinien/',
          'S3 Demenzen: https://www.awmf.org/leitlinien/',
        ],
        caveats: [
          'Richtlinien-Psychotherapie (G-BA) — покрытие GKV только для approved modalities (KVT, TP, PA, ST)',
          'Clozapin — обязательный Leukozytenmonitoring',
          'BtM-Rezept для psychostimulantien (ADHS), opioids',
          'PEPP (Psychiatrie-Entgelte) — DRG-подобная система для стационара',
        ],
      },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'AWMF',
      color: '#6B7280',
      interpretation: `Navigate: awmf.org/leitlinien (${e.society})`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\nПримеры S3/NVL рекомендаций:\n${e.examples}\n\nУровни AWMF:\n- S1 — экспертный консенсус (без формализованной методологии)\n- S2k — консенсус-ориентированная (formal consensus, без системного обзора)\n- S2e — доказательная (systematic review)\n- S3 — доказательная + консенсус (высший уровень, systematic review + structured consensus)\n- NVL — Nationale VersorgungsLeitlinie (совместно с BÄK + KBV для chronic conditions)`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'AWMF portal: https://www.awmf.org/leitlinien/',
        'NVL portal: https://www.leitlinien.de/',
        'Leitlinienprogramm Onkologie: https://www.leitlinienprogramm-onkologie.de/',
        'App AWMF Leitlinien (iOS/Android)',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для AWMF —',
        'Документы преимущественно на немецком; английские переводы редки',
        'S1 ≠ уровень доказательности 1 по GRADE — это методологический уровень процесса',
        'Rote Liste / Fachinformation — локальная дозировка и противопоказания',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'has-fr', title: 'HAS (France)' },
        { id: 'smb-ch', title: 'SMB / Swissmedic (Switzerland)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
**AWMF (Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften)** — зонтичная организация ~180 медицинских научных обществ Германии, публикующая клинические руководства (Leitlinien).

### Структура и уровни
| Уровень | Методология |
|---------|-------------|
| **S1** | Handlungsempfehlung экспертов (без систематики) |
| **S2k** | Консенсус-ориентированная (formal consensus) |
| **S2e** | Evidenzbasiert (systematic review) |
| **S3** | Evidenz- und konsensbasiert (высший уровень) |
| **NVL** | Nationale VersorgungsLeitlinie (совместный продукт AWMF + BÄK + KBV для частых хронических заболеваний) |

### Доступ
Бесплатно на **awmf.org/leitlinien** — все Leitlinien в PDF (Langfassung, Kurzfassung, Patientenversion, ggf. англ. резюме).

### Источники
- https://www.awmf.org/leitlinien/
- https://www.leitlinien.de/ (NVL)
- https://www.leitlinienprogramm-onkologie.de/`,
};
export default runner;

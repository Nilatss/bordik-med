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
    const map: Record<string, { name: string; society: string; examples: string }> = {
      cardio: { name: 'Кардиология', society: 'DGK — Deutsche Gesellschaft für Kardiologie', examples: 'Herzinsuffizienz (S3), KHK (NVL — Nationale VersorgungsLeitlinie), Vorhofflimmern (ESC-adaptiert), Hypertonie (NVL).' },
      onko: { name: 'Онкология', society: 'Leitlinienprogramm Onkologie (DKG + DKH + AWMF)', examples: 'Mammakarzinom (S3), Kolorektales Karzinom (S3), Prostatakarzinom (S3), Lungenkarzinom (S3). Высочайшее качество S3 + lebende Leitlinie.' },
      innere: { name: 'Внутренние болезни', society: 'DGIM — Deutsche Gesellschaft für Innere Medizin', examples: 'Diabetes mellitus Typ 2 (NVL), Asthma (NVL), COPD (NVL), Sepsis (S3).' },
      chirurgie: { name: 'Хирургия', society: 'DGCH', examples: 'Akute Appendizitis (S1), Leistenhernie (S2k), postoperative Thromboseprophylaxe (S3).' },
      paed: { name: 'Педиатрия', society: 'DGKJ — Deutsche Gesellschaft für Kinder- und Jugendmedizin', examples: 'Neugeborenen-Screening, Impfkalender (STIKO), Fieberkrämpfe (S2k), ADHS (S3).' },
      gyn: { name: 'Гинекология/акушерство', society: 'DGGG', examples: 'Mammakarzinom (S3), Schwangerenvorsorge (Mutterschafts-Richtlinien), HPV-Impfung, Endometriose (S2k).' },
      allgemein: { name: 'Общая врачебная практика', society: 'DEGAM — Deutsche Gesellschaft für Allgemeinmedizin', examples: 'DEGAM-Leitlinien: Halsschmerzen, Kreuzschmerz, Husten, Müdigkeit. Ориентация на Hausarzt (семейный врач).' },
      psych: { name: 'Психиатрия', society: 'DGPPN', examples: 'Unipolare Depression (S3 NVL), Schizophrenie (S3), Demenzen (S3), Angststörungen (S3).' },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'AWMF',
      color: '#6B7280',
      interpretation: `Navigate: awmf.org/leitlinien (${e.society})`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\nПримеры S3/NVL рекомендаций:\n${e.examples}\n\nУровни AWMF:\n- S1 — экспертный консенсус (без формализованной методологии)\n- S2k — консенсус-ориентированная (formal consensus, без системного обзора)\n- S2e — доказательная (systematic review)\n- S3 — доказательная + консенсус (высший уровень, systematic review + structured consensus)\n- NVL — Nationale VersorgungsLeitlinie (совместно с BÄK + KBV для chronic conditions)`,
      actions: [
        'Портал: https://www.awmf.org/leitlinien/',
        'Поиск по специальности (Fachgesellschaft) или ключевым словам (Stichwort)',
        'Скачать полную версию (Langfassung) + краткую (Kurzfassung) + версию для пациента (Patientenversion)',
        'NVL portal: https://www.leitlinien.de/',
        'Leitlinienprogramm Onkologie: https://www.leitlinienprogramm-onkologie.de/',
        'App AWMF Leitlinien (iOS/Android) — offline чтение',
      ],
      caveats: [
        'Документы преимущественно на немецком; английские переводы есть только у некоторых S3',
        'Валидность: обычно 5 лет, затем обновление или архивация',
        'AWMF объединяет ~180 медицинских обществ Германии',
        'Локальная специфика: препараты по Rote Liste, дозировки по немецкой фарме',
        'S1 ≠ уровень доказательности 1 по GRADE — это методологический уровень процесса',
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

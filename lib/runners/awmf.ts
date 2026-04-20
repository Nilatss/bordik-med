// @ts-nocheck
/** Runner: awmf — AWMF (Germany) clinical guidelines portal */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Германия (Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften)',
  reference: 'AWMF Leitlinien-Register. Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften e.V. https://www.awmf.org/leitlinien/ (> 180 мед обществ, > 800 актуальных guidelines)',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'onko', label: 'Онкология (Leitlinienprogramm Onkologie)' },
        { value: 'kardio', label: 'Кардиология (DGK)' },
        { value: 'allgemein', label: 'Общая врачебная практика (DEGAM)' },
        { value: 'innere', label: 'Внутренние болезни (DGIM)' },
        { value: 'paediatrie', label: 'Педиатрия (DGKJ)' },
        { value: 'neurologie', label: 'Неврология (DGN)' },
        { value: 'psychiatrie', label: 'Психиатрия (DGPPN)' },
        { value: 'gynaek', label: 'Акушерство/гинекология (DGGG)' },
      ],
    },
  ],
  presets: [
    { label: 'Онкология (S3)', values: { specialty: 'onko' } },
    { label: 'DEGAM GP', values: { specialty: 'allgemein' } },
    { label: 'Кардиология', values: { specialty: 'kardio' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'onko');
    const map: Record<string, { title: string; society: string; examples: string; preferred: string }> = {
      onko: { title: 'Онкология', society: 'Leitlinienprogramm Onkologie (DKG + DKH + AWMF)', examples: 'Mammakarzinom (S3), Pankreaskarzinom (S3), Prostatakarzinom (S3), Lungenkarzinom (S3), Palliativmedizin (S3)', preferred: 'Почти все S3 (highest quality) — базируются на systematic review + structured consensus' },
      kardio: { title: 'Кардиология', society: 'Deutsche Gesellschaft für Kardiologie (DGK)', examples: 'DGK часто "Pocket-Leitlinien" = адаптация ESC guidelines. Герман. NVL (Nationale VersorgungsLeitlinie): KHK, Herzinsuffizienz', preferred: 'NVL — S3 (interdisciplinär); ESC-адаптации — S1/S2' },
      allgemein: { title: 'Общая врачебная практика', society: 'Deutsche Gesellschaft für Allgemeinmedizin (DEGAM)', examples: 'Husten, Brustschmerz, Müdigkeit, Halsschmerzen, Rückenschmerz, Schwindel — "DEGAM-Leitlinien"', preferred: 'S3 для большинства — ориентация на primary care (Hausarzt) в Германии' },
      innere: { title: 'Внутренние болезни', society: 'Deutsche Gesellschaft für Innere Medizin (DGIM)', examples: 'Часто совместно с подспециальностями. NVL Typ-2-Diabetes, NVL COPD, NVL Asthma', preferred: 'NVL = S3 — национальные care guidelines' },
      paediatrie: { title: 'Педиатрия', society: 'Deutsche Gesellschaft für Kinder- und Jugendmedizin (DGKJ)', examples: 'AWMF 027-xxx серия: Bronchiolitis, Neugeborenensepsis, Fieber bei Kindern, Asthma bei Kindern', preferred: 'Mix S2k и S3 в зависимости от доказательной базы' },
      neurologie: { title: 'Неврология', society: 'Deutsche Gesellschaft für Neurologie (DGN)', examples: 'Schlaganfall (S2e), Parkinson (S3), Multiple Sklerose (S2k), Epilepsie (S1)', preferred: 'DGN имеет обширный "Leitlinien für Diagnostik und Therapie in der Neurologie"' },
      psychiatrie: { title: 'Психиатрия', society: 'Deutsche Gesellschaft für Psychiatrie (DGPPN)', examples: 'Depression (S3 NVL), Schizophrenie (S3), Angststörungen (S3), Bipolare Störung (S3)', preferred: 'S3 NVL Depression — одна из наиболее цитируемых в Европе' },
      gynaek: { title: 'Акушерство/гинекология', society: 'Deutsche Gesellschaft für Gynäkologie und Geburtshilfe (DGGG)', examples: 'Mammakarzinom (S3), Zervixkarzinom (S3), Endometriose (S2k), Geburt am Termin (S3)', preferred: 'S3 особенно для онкогинекологии (Leitlinienprogramm Onkologie)' },
    };
    const e = map[s];
    return {
      value: e.title,
      unit: 'AWMF',
      color: '#6B7280',
      interpretation: `AWMF: ${e.title}`,
      details: `**Специальность:** ${e.title}\n\n**Ведущее общество:** ${e.society}\n\n**Примеры guidelines:** ${e.examples}\n\n**Характерный уровень S:** ${e.preferred}\n\n**AWMF S-Klassifikation (уровень методологии):**\n- **S1** — Handlungsempfehlungen von Expertengruppen (без systematic review, экспертный консенсус 1-2 общества)\n- **S2k** — konsensbasierte Leitlinie (formal structured consensus, несколько обществ, но без systematic review)\n- **S2e** — evidenzbasierte Leitlinie (systematic review, но без formal consensus)\n- **S3** — evidenz- und konsensbasiert (ОБА: systematic review + structured consensus) — наивысшее качество\n- **NVL** (Nationale VersorgungsLeitlinie) — национальная care guideline (BÄK + KBV + AWMF), всегда S3-уровня`,
      actions: [
        'Открыть https://www.awmf.org/leitlinien/aktuelle-leitlinien (главный реестр)',
        'Поиск по номеру AWMF-Register-Nr. (напр. 032-045OL Mammakarzinom)',
        'Скачать PDF (Langversion, Kurzversion, Patientenleitlinie, Evidenzbericht)',
        'Проверить срок действия (gültig bis) — guidelines пересматриваются каждые 5 лет',
        'Patientenleitlinien (упрощённые для пациентов) — отдельно скачиваются',
        'Mobile app Leitlinien (iOS/Android) — offline доступ',
      ],
      caveats: [
        'Только немецкий язык в большинстве случаев (английские переводы редки)',
        'Германия-specific: препараты из Rote Liste, DRG-Kodierung, GKV-Erstattung',
        'S1 guidelines — только экспертное мнение, могут устаревать быстро',
        'Срок действия — если "abgelaufen" (> 5 лет) — проверить обновления',
        'NVL — обязателен для DMP (Disease Management Programme) в Германии',
      ],
      related: [
        { id: 'nice-guidelines', title: 'NICE guidelines (UK)' },
        { id: 'ueber-ru', title: 'КР РФ' },
        { id: 'escardio', title: 'ESC Guidelines' },
        { id: 'uptodate', title: 'UpToDate' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**AWMF** (Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften) — объединение > 180 медицинских научных обществ Германии, координирующее разработку и публикацию **клинических guidelines**. Центральный реестр — **AWMF-Leitlinien-Register**, > 800 актуальных guidelines.

### S-классификация (ключевая особенность AWMF)
| S-Klasse | Методология | Уровень |
|---|---|---|
| **S1** | Handlungsempfehlungen (без formal review) | низший |
| **S2k** | Konsensbasiert (structured consensus) | средний |
| **S2e** | Evidenzbasiert (systematic review) | средний |
| **S3** | Evidenz- + konsensbasiert (оба) | высший |
| **NVL** | Nationale VersorgungsLeitlinie (BÄK+KBV+AWMF) | высший, национ. |

### Leitlinienprogramm Onkologie
Совместный проект AWMF + Deutsche Krebsgesellschaft (DKG) + Deutsche Krebshilfe (DKH) — почти все онкологические guidelines в Германии — S3.

### NVL (Nationale VersorgungsLeitlinie)
Национальные care guidelines совместно с Bundesärztekammer (BÄK), Kassenärztliche Bundesvereinigung (KBV) и AWMF. Обязательны для DMP (хронические болезни в системе ОМС). Примеры: NVL Typ-2-Diabetes, NVL Asthma, NVL Depression, NVL KHK.

### Формат публикации
- **Langversion** — полная научная версия
- **Kurzversion** — краткая для клиники
- **Patientenleitlinie** — для пациентов
- **Evidenzbericht** — систематический обзор с оценкой доказательств

### Источник
https://www.awmf.org/leitlinien/`,
};
export default runner;

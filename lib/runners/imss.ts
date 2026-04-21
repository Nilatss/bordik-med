// @ts-nocheck
/** Runner: imss — IMSS Guías de Práctica Clínica (Mexico) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Мексика',
  reference: 'IMSS — Instituto Mexicano del Seguro Social. Guías de Práctica Clínica (GPC) — национальные клинические рекомендации Мексики, разработанные совместно IMSS + ISSSTE + Secretaría de Salud + CENETEC (Centro Nacional de Excelencia Tecnológica en Salud). http://www.cenetec-difusion.com/CMGPC/, https://www.imss.gob.mx',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность / нозология',
      type: 'select',
      options: [
        { value: 'primaria', label: 'Medicina familiar / primaria' },
        { value: 'cardio', label: 'Cardiología' },
        { value: 'diabetes', label: 'Diabetes / endocrinología' },
        { value: 'gineco', label: 'Ginecología y obstetricia' },
        { value: 'pediatria', label: 'Pediatría' },
        { value: 'onko', label: 'Oncología' },
        { value: 'salud-mental', label: 'Salud mental' },
        { value: 'infecciosas', label: 'Enfermedades infecciosas' },
      ],
    },
  ],
  presets: [
    { label: 'Diabetes tipo 2', values: { specialty: 'diabetes' } },
    { label: 'Medicina familiar', values: { specialty: 'primaria' } },
    { label: 'Cardiología', values: { specialty: 'cardio' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'primaria');
    const examples: Record<string, string> = {
      primaria: 'GPC atención médica familiar + detección oportuna de ECNT + control prenatal + atención del recién nacido. Ключевой ресурс для médico familiar в UMF (Unidades de Medicina Familiar) IMSS.',
      cardio: 'GPC hipertensión arterial sistémica, insuficiencia cardíaca crónica, síndrome coronario agudo (STEMI/NSTEMI), fibrilación atrial, dislipidemia.',
      diabetes: 'GPC diabetes mellitus tipo 2 en primer nivel + tipo 1 + DM gestacional + pie diabético + retinopatía. Мексика имеет одну из высочайших distribución обесadad/DM2 в мире.',
      gineco: 'GPC control prenatal, preeclampsia/eclampsia, hemorragia obstétrica, atención del parto, lactancia, climaterio, tamizaje cáncer cervicouterino (CaCu) и mama.',
      pediatria: 'GPC atención del recién nacido, tamiz neonatal ampliado, bronquiolitis, neumonía adquirida en la comunidad, diarrea aguda, IRAs, desnutrición, vacunación CN.',
      onko: 'GPC cáncer de mama, CaCu, colon y recto, próstata, gástrico (alta incidencia), pulmón. CENACE — acreditación centros oncológicos.',
      'salud-mental': 'GPC depresión, ansiedad, esquizofrenia, trastorno bipolar, demencia. Limitación: acceso a psicoterapia en IMSS.',
      infecciosas: 'GPC tuberculosis, VIH/SIDA, hepatitis virales, dengue (endemic), COVID-19, IRA aguda.',
    };
    return {
      value: 'GPC IMSS',
      unit: 'México',
      color: '#6B7280',
      interpretation: `Navigate: GPC México — ${s}`,
      details: `Специальность: ${s}\n\nПримеры GPC: ${examples[s]}\n\nСтруктура GPC IMSS:\n1. Guía de Referencia Rápida (GRR) — краткая версия для практики\n2. Guía de Evidencias y Recomendaciones (GER) — полная версия с методологией\n3. Algoritmos clínicos\n4. Catálogo maestro (identificador IMSS-XXX-YY)\n\nGPC разрабатывает Centro Nacional de Excelencia Tecnológica en Salud (CENETEC) совместно с IMSS, ISSSTE, PEMEX, Secretaría de Salud. Методология AGREE II. Обязательны для работников IMSS; широко используются в частной медицине.\n\nFragmentación del sistema: IMSS (работники формального сектора), ISSSTE (гос. служащие), Seguro Popular → INSABI → IMSS-Bienestar (для неохваченных), PEMEX/SEDENA (специальные). Частный сектор — ~50% расходов.`,
      actions: [
        'Catálogo Maestro GPC: http://www.cenetec-difusion.com/CMGPC/',
        'CENETEC: http://www.cenetec.salud.gob.mx/',
        'IMSS portal: https://www.imss.gob.mx/',
        'Secretaría de Salud: https://www.gob.mx/salud',
        'COFEPRIS (регулятор лекарств): https://www.gob.mx/cofepris',
        'Cuadro Básico y Catálogo de Insumos del Sector Salud — национальный формуляр',
        'ENSANUT (National Health Survey) — эпидемиологические данные',
      ],
      caveats: [
        'Документы на испанском (mexicano)',
        'Fragmentación del sistema: IMSS / ISSSTE / IMSS-Bienestar / PEMEX / private — разные правила покрытия',
        'Cuadro Básico — национальный формуляр; препараты вне его требуют специальной авторизации',
        'Высокая эпидемиология: obesidad (~36% взрослых), DM2 (~14%), hipertensión, NAFLD, dengue',
        'Популяционная фармакогенетика: amerindian ancestry — CYP2D6 ultrarapid, NAT2 variability (INH)',
        'COFEPRIS — регулятор лекарств (аналог FDA/EMA), отдельно от GPC',
      ],
      related: [
        { id: 'pcdt-br', title: 'PCDT (Brazil)' },
        { id: 'paho', title: 'PAHO (Pan-American)' },
        { id: 'sap-sac', title: 'SAP/SAC (Argentina)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
**GPC (Guías de Práctica Clínica)** — национальные клинические рекомендации Мексики. Разработаны **CENETEC** (Centro Nacional de Excelencia Tecnológica en Salud) в сотрудничестве с IMSS, ISSSTE, Secretaría de Salud, PEMEX, SEDENA.

### Структура GPC
- **GRR** (Guía de Referencia Rápida) — карманная версия
- **GER** (Guía de Evidencias y Recomendaciones) — полная версия
- **Algoritmos** — пошаговые схемы
- Catálogo maestro с уникальным ID IMSS-XXX-YY

### Фрагментация системы
| Система | Покрытие |
|---------|----------|
| **IMSS** | Работники формального частного сектора (~40% населения) |
| **ISSSTE** | Гос. служащие |
| **IMSS-Bienestar** (ранее Seguro Popular / INSABI) | Неформальный сектор, неохваченные |
| **PEMEX / SEDENA / SEMAR** | Нефть / вооружённые силы |
| **Частный сектор** | ~50% расходов |

### Cuadro Básico
Национальный формуляр — препараты включены или требуют спец. авторизации.

### Эпидемиологический контекст
- Obesidad ~36% (одна из самых высоких в мире)
- DM2 ~14% (4-я причина смерти)
- Dengue endemic
- Cáncer gástrico — высокая частота (Helicobacter pylori)

### Источники
- http://www.cenetec-difusion.com/CMGPC/
- https://www.imss.gob.mx/
- https://www.gob.mx/cofepris`,
};
export default runner;

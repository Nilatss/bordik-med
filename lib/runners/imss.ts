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
    const map: Record<string, { details: string; actions: string[]; caveats: string[] }> = {
      primaria: {
        details: 'GPC atención médica familiar + detección oportuna de ECNT + control prenatal + atención del recién nacido. Ключевой ресурс для médico familiar в UMF (Unidades de Medicina Familiar) IMSS.',
        actions: [
          'Cartilla Nacional de Salud (по возрастным группам): https://www.gob.mx/salud',
          'PrevenIMSS (profilaxis): https://www.imss.gob.mx/salud-en-linea/programas-integrados-salud',
          'Catálogo GPC medicina familiar: http://www.cenetec-difusion.com/CMGPC/',
          'IMSS Digital (teleconsulta): https://www.imss.gob.mx/imssdigital',
        ],
        caveats: [
          'UMF — gatekeeper для специалистов через IMSS (referencia formal)',
          'Cartilla Nacional обязательна — возраст-специфичный скрининг + vacunación',
          'DM2 / HAS — основные темы GPC medicina familiar',
          'Chequeo PrevenIMSS — адаптирован по возрастным группам',
        ],
      },
      cardio: {
        details: 'GPC hipertensión arterial sistémica, insuficiencia cardíaca crónica, síndrome coronario agudo (STEMI/NSTEMI), fibrilación atrial, dislipidemia.',
        actions: [
          'GPC HAS (IMSS-076-08 — актуальная версия): http://www.cenetec-difusion.com/CMGPC/',
          'Sociedad Mexicana de Cardiología (SMC): https://www.smcardiologia.org.mx/',
          'ANCAM (Asociación Nacional de Cardiólogos): https://ancam.org.mx/',
          'Código Infarto IMSS (STEMI fast-track)',
        ],
        caveats: [
          'Código Infarto — flag-ship IMSS программа (STEMI door-to-device)',
          'Familial hypercholesterolaemia — высокая распространённость (founder effects)',
          'DOAC не все в Cuadro Básico — проверять',
          'Enfermedad de Chagas — cardiomiopатия, в северных штатах не встречается, но южные — да',
        ],
      },
      diabetes: {
        details: 'GPC diabetes mellitus tipo 2 en primer nivel + tipo 1 + DM gestacional + pie diabético + retinopatía. Мексика имеет одну из высочайших distribución обесadad/DM2 в мире.',
        actions: [
          'GPC DM2 (IMSS): http://www.cenetec-difusion.com/CMGPC/',
          'Federación Mexicana de Diabetes: https://fmdiabetes.org/',
          'ENSANUT (epidemiology data): https://ensanut.insp.mx/',
          'ALAD (Asociación Latinoamericana Diabetes): https://www.alad-latinoamerica.org/',
        ],
        caveats: [
          'DM2 prevalence ~14% — 4-я причина смертности',
          'Cuadro Básico: metformina, glibenclamida, insulina NPH/regular — базовые',
          'GLP-1 RA, SGLT2i — ограниченная доступность в IMSS',
          'Pie diabético — Clínica del pie IMSS (selected UMAA)',
        ],
      },
      gineco: {
        details: 'GPC control prenatal, preeclampsia/eclampsia, hemorragia obstétrica, atención del parto, lactancia, climaterio, tamizaje cáncer cervicouterino (CaCu) и mama.',
        actions: [
          'GPC Control Prenatal (IMSS-028-08)',
          'GPC Preeclampsia: http://www.cenetec-difusion.com/CMGPC/',
          'FEMECOG (Federación Mexicana): https://www.femecog.org.mx/',
          'Programa Cáncer de la Mujer (IMSS)',
        ],
        caveats: [
          'CaCu screening — Pap + HPV test (по GPC), бесплатно IMSS',
          'Mammografía IMSS: 40–69 лет каждые 2 года',
          'Código Mater — obstetric emergency team activation',
          'NOM-007-SSA2-2016 — regulatory frame для atención materno-infantil',
        ],
      },
      pediatria: {
        details: 'GPC atención del recién nacido, tamiz neonatal ampliado, bronquiolitis, neumonía adquirida en la comunidad, diarrea aguda, IRAs, desnutrición, vacunación CN.',
        actions: [
          'Cartilla Nacional de Vacunación: https://www.gob.mx/salud',
          'Tamiz Neonatal Ampliado (IMSS): https://www.imss.gob.mx/',
          'Academia Mexicana de Pediatría: https://www.amp.org.mx/',
          'Confederación Nacional de Pediatría (CONAPEME): https://www.conapeme.org/',
        ],
        caveats: [
          'Tamiz Neonatal Ampliado — 67 enfermedades (уникально в LAC)',
          'Esquema vacunación: BCG, HepB, Rotavirus, DPT, IPV/OPV, MMR, HPV',
          'Desnutrición crónica — fokus в sur-sureste (Chiapas, Oaxaca, Guerrero)',
          'Influenza estacional — campaña annual para < 5 y > 60',
        ],
      },
      onko: {
        details: 'GPC cáncer de mama, CaCu, colon y recto, próstata, gástrico (alta incidencia), pulmón. CENACE — acreditación centros oncológicos.',
        actions: [
          'SMEO (Sociedad Mexicana Oncología): https://www.smeo.org.mx/',
          'InCan (Instituto Nacional de Cancerología): https://www.incan.salud.gob.mx/',
          'GPC oncológicas CENETEC: http://www.cenetec-difusion.com/CMGPC/',
          'Registro Nacional de Cáncer (RNC)',
        ],
        caveats: [
          'Gastric cancer — alta incidencia (H. pylori screening / treatment relevant)',
          'Cérvico-uterino — HPV vaccination 11 y (both sexes с 2023)',
          'Biologics / CAR-T — limited en IMSS (judicialización частая)',
          'Fondo de Salud para el Bienestar — финансирование gastos catastróficos (онко)',
        ],
      },
      'salud-mental': {
        details: 'GPC depresión, ansiedad, esquizofrenia, trastorno bipolar, demencia. Limitación: acceso a psicoterapia en IMSS.',
        actions: [
          'GPC Depresión mayor (IMSS): http://www.cenetec-difusion.com/CMGPC/',
          'Instituto Nacional de Psiquiatría Ramón de la Fuente Muñiz: https://inprf.gob.mx/',
          'Línea de la Vida (suicide prevention 800-290-0024)',
          'CONADIC (adicciones): https://www.gob.mx/salud/conadic',
        ],
        caveats: [
          'Psicoterapia — ограниченный доступ в IMSS, часто referral в external',
          'Clozapina — requiere monitoreo hematológico по GPC',
          'Methadone programs — CENADIC, ограниченно',
          'Ley Nacional de Salud Mental 2022 — сдвиг на community-based',
        ],
      },
      infecciosas: {
        details: 'GPC tuberculosis, VIH/SIDA, hepatitis virales, dengue (endemic), COVID-19, IRA aguda.',
        actions: [
          'CENSIDA (VIH/SIDA): https://www.gob.mx/censida',
          'DGE (Dirección General Epidemiología): https://www.gob.mx/salud/dge',
          'GPC TB (IMSS): http://www.cenetec-difusion.com/CMGPC/',
          'InDRE (reference lab): https://www.gob.mx/salud/indre',
        ],
        caveats: [
          'TB — free-ART и free TB treatment в IMSS/ISSSTE/IMSS-Bienestar',
          'Dengue endemic — Yucatán, Guerrero, Veracruz; arbovirus triple (dengue/zika/chikv)',
          'HIV: TLD (TDF/3TC/DTG) стандарт, Fast-Track Cities (CDMX)',
          'HCV: DAAs через CENSIDA programme (elimination target 2030)',
        ],
      },
    };
    const e = map[s]!;
    return {
      value: 'GPC IMSS',
      unit: 'México',
      color: '#6B7280',
      interpretation: `Navigate: GPC México — ${s}`,
      details: `Специальность: ${s}\n\nПримеры GPC: ${e.details}\n\nСтруктура GPC IMSS:\n1. Guía de Referencia Rápida (GRR) — краткая версия для практики\n2. Guía de Evidencias y Recomendaciones (GER) — полная версия с методологией\n3. Algoritmos clínicos\n4. Catálogo maestro (identificador IMSS-XXX-YY)\n\nGPC разрабатывает Centro Nacional de Excelencia Tecnológica en Salud (CENETEC) совместно с IMSS, ISSSTE, PEMEX, Secretaría de Salud. Методология AGREE II. Обязательны для работников IMSS; широко используются в частной медицине.\n\nFragmentación del sistema: IMSS (работники формального сектора), ISSSTE (гос. служащие), Seguro Popular → INSABI → IMSS-Bienestar (для неохваченных), PEMEX/SEDENA (специальные). Частный сектор — ~50% расходов.`,
      actions: [
        ...e.actions,
        '— Общие источники GPC México —',
        'Catálogo Maestro GPC: http://www.cenetec-difusion.com/CMGPC/',
        'IMSS portal: https://www.imss.gob.mx/',
        'Secretaría de Salud: https://www.gob.mx/salud',
        'COFEPRIS: https://www.gob.mx/cofepris',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Мексики —',
        'Документы на испанском (mexicano)',
        'Fragmentación: IMSS / ISSSTE / IMSS-Bienestar / PEMEX / private',
        'Cuadro Básico — национальный формуляр (препараты вне требуют авторизации)',
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

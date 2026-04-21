// @ts-nocheck
/** Runner: sap-sac — Argentine medical societies (SAP, SAC, SAN, ...) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Аргентина',
  reference: 'SAP — Sociedad Argentina de Pediatría; SAC — Sociedad Argentina de Cardiología; SAN — Sociedad Argentina de Nefrología; SAD — Sociedad Argentina de Diabetes; SATI — Sociedad Argentina de Terapia Intensiva; Ministerio de Salud de la Nación. https://www.sap.org.ar, https://www.sac.org.ar',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'pediatria', label: 'Pediatría (SAP)' },
        { value: 'cardio', label: 'Cardiología (SAC)' },
        { value: 'nefro', label: 'Nefrología (SAN)' },
        { value: 'diabetes', label: 'Diabetes (SAD)' },
        { value: 'terapia', label: 'Terapia intensiva (SATI)' },
        { value: 'ginecologia', label: 'Ginecología (SOGIBA/FASGO)' },
        { value: 'clinica', label: 'Clínica médica (SAM — Sociedad Argentina de Medicina)' },
        { value: 'ministerio', label: 'Ministerio de Salud — guías nacionales' },
      ],
    },
  ],
  presets: [
    { label: 'SAP — Pediatría', values: { specialty: 'pediatria' } },
    { label: 'SAC — Cardiología', values: { specialty: 'cardio' } },
    { label: 'MinSalud — guías', values: { specialty: 'ministerio' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'pediatria');
    const map: Record<string, { name: string; society: string; details: string; actions: string[]; caveats: string[] }> = {
      pediatria: {
        name: 'Pediatría',
        society: 'SAP — Sociedad Argentina de Pediatría (с 1911)',
        details: 'Consensos SAP — одна из старейших и самых уважаемых педиатрических ассоциаций Латинской Америки. Calendario Nacional de Vacunación (совместно с Ministerio). Archivos Argentinos de Pediatría (журнал, высокий импакт в регионе). Guías: bronquiolitis, asma, neumonía, infecciones urinarias, desnutrición, obesidad, TEA, ADHD, pubertad, adolescencia.',
        actions: [
          'SAP portal: https://www.sap.org.ar/',
          'Archivos Argentinos de Pediatría: https://www.sap.org.ar/publicaciones/archivos-argentinos-de-pediatria/',
          'Calendario Nacional de Vacunación: https://www.argentina.gob.ar/salud/vacunas',
          'Consensos SAP (по темам): https://www.sap.org.ar/consensos',
        ],
        caveats: [
          'Calendario Nacional — все вакцины бесплатны и обязательны (Ley 27.491)',
          'Bronquiolitis — palivizumab только для high-risk ex-preterm',
          'SUM (Seguimiento Universal de Malformaciones) — SAP programme',
          'Pediatría social — важная субспециальность в SAP (Chagas, indigenous)',
        ],
      },
      cardio: {
        name: 'Cardiología',
        society: 'SAC — Sociedad Argentina de Cardiología + FAC (Federación Argentina de Cardiología)',
        details: 'Consensos SAC: hipertensión arterial, insuficiencia cardíaca, síndromes coronarios agudos, fibrilación auricular, dislipidemias, valvular. Часто адаптация ESC/ACC с учётом локальной эпидемиологии (enfermedad de Chagas — важная причина ICC в Argentina).',
        actions: [
          'SAC portal: https://www.sac.org.ar/',
          'FAC (Federación Argentina de Cardiología): https://www.fac.org.ar/',
          'Revista Argentina de Cardiología: https://www.sac.org.ar/revista-argentina-de-cardiologia/',
          'Consensos SAC: https://www.sac.org.ar/consensos/',
        ],
        caveats: [
          'Chagas cardiomyopathy — очень частая причина ICC в северных провинциях',
          'Código Rojo / SCA ST — national protocol для STEMI',
          'DOAC: все 4 в PMO, но реимбурсация зависит от obra social',
          'Dilatación cardíaca chagásica — digital CT/MRI для риск-стратификации',
        ],
      },
      nefro: {
        name: 'Nefrología',
        society: 'SAN — Sociedad Argentina de Nefrología',
        details: 'Consensos на гемодиализе, перитонеальном диализе, трансплантации, ОПП, ХБП. Registro argentino de diálisis y trasplante.',
        actions: [
          'SAN portal: https://www.san.org.ar/',
          'INCUCAI (transplant coordinator): https://www.argentina.gob.ar/salud/incucai',
          'Registro Argentino de Diálisis y Trasplante',
          'Nefrología Argentina (revista SAN)',
        ],
        caveats: [
          'Ley Justina (27.447) — presumed consent для organ donation',
          'INCUCAI — национальный coordinator для trasplantes',
          'Hemolytic-uremic syndrome (SUH) — endemic в Argentina (Escherichia coli STEC)',
          'Peritoneal dialysis — особая роль в rural areas',
        ],
      },
      diabetes: {
        name: 'Diabetes',
        society: 'SAD — Sociedad Argentina de Diabetes',
        details: 'Guías SAD для DM1, DM2, gestacional. Адаптация ADA/EASD. Высокая распространённость obesidad y DM2.',
        actions: [
          'SAD portal: https://www.sadbe.org/',
          'Revista SAD: https://www.sadbe.org/revista/',
          'ALAD (Asociación Latinoamericana de Diabetes): https://www.alad-latinoamerica.org/',
          'Programa Nacional de Prevención y Control de DM',
        ],
        caveats: [
          'Ley 23.753 — DM обеспечение 100% cobertura для insulin, tiras, jeringas',
          'GLP-1 RA — limited cobertura obras sociales (varía)',
          'CGM (continuous glucose monitoring) — covered для T1DM (по Ley)',
          'Gestational DM — IADPSG criteria приняты SAD',
        ],
      },
      terapia: {
        name: 'Terapia intensiva',
        society: 'SATI — Sociedad Argentina de Terapia Intensiva',
        details: 'Guías SATI: shock séptico, SDRA, ventilación mecánica, sedación-analgesia, delirium. Revista SATI.',
        actions: [
          'SATI portal: https://www.sati.org.ar/',
          'Revista SATI: https://revista.sati.org.ar/',
          'FEPIMCTI (federation LAC ICU): http://www.fepimcti.org/',
          'SATI ECMO working group',
        ],
        caveats: [
          'Sepsis-3 criteria приняты SATI',
          'ECMO — региональные центры (Buenos Aires, Córdoba)',
          'Chagas reactivación в ICU (inmunosupresión) — важный DDx',
          'Hantavirus (Andino) — sur Argentina, ARDS rápido',
        ],
      },
      ginecologia: {
        name: 'Ginecología',
        society: 'FASGO — Federación Argentina de Sociedades de Ginecología y Obstetricia + SOGIBA',
        details: 'Consensos: control prenatal, preeclampsia, hemorragia postparto, anticoncepción, IVE/ILE (post-Ley 27.610 de 2021 — legal aborto hasta 14 semanas).',
        actions: [
          'FASGO portal: https://www.fasgo.org.ar/',
          'SOGIBA (Buenos Aires): https://www.sogiba.org.ar/',
          'Ley 27.610 IVE/ILE protocolo (MSAL)',
          'Plan ENIA (adolescent pregnancy prevention)',
        ],
        caveats: [
          'IVE hasta 14 semanas + ILE por causales (salud, violación) — Ley 27.610 (2021)',
          'Misoprostol + mifepristona — en el vademécum nacional',
          'HPV vaccination: Cervarix (ноnapent с 2022 в calendar) — 11 años ambos sexos',
          'Consejerías — obligatorias antes/después IVE',
        ],
      },
      clinica: {
        name: 'Clínica médica',
        society: 'SAM — Sociedad Argentina de Medicina',
        details: 'Консенсусы по hipertensión, diabetes, dislipidemia, EPOC, asma, infecciones. Revista SAM.',
        actions: [
          'SAM portal: https://www.sam.org.ar/',
          'Revista Medicina (Buenos Aires): https://www.medicinabuenosaires.com/',
          'ACAM (Asociación de Clínicos de la Argentina)',
          'Congresos SAM (ежегодные)',
        ],
        caveats: [
          'Residencia Clínica Médica — 4 года стандарт',
          'Medicina Interna — больший scope чем US Internal Medicine',
          'ECOE — evaluation tool для residentes',
          'Interplay con Medicina Familiar — overlapping',
        ],
      },
      ministerio: {
        name: 'Ministerio de Salud',
        society: 'Ministerio de Salud de la Nación + PMI + Programas Nacionales',
        details: 'Guías clínicas нациоnales, Plan Materno Infantil (PMI), REMEDIAR (дистрибуция бесплатных лекарств), Programa Nacional de Chagas, tuberculosis, HIV, vacunación. Sistema Integrado Mayores (PAMI) — для пожилых.',
        actions: [
          'Ministerio de Salud: https://www.argentina.gob.ar/salud',
          'Guías MSAL: https://www.argentina.gob.ar/salud/guias-recomendaciones',
          'PAMI: https://www.pami.org.ar/',
          'ANMAT: https://www.argentina.gob.ar/anmat',
        ],
        caveats: [
          'REMEDIAR — free medicines для primary care (~70 препаратов в PMO)',
          'PMO (Programa Médico Obligatorio) — минимальный package для всех obras sociales',
          'PAMI — Obra Social специальная для jubilados (~5 млн)',
          'Chagas Programme — mandatory screening беременных + донорство крови',
        ],
      },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'Argentina',
      color: '#6B7280',
      interpretation: `Navigate: Argentine ${e.name}`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\n${e.details}`,
      actions: [
        ...e.actions,
        '— Общие источники Argentina —',
        'Ministerio de Salud: https://www.argentina.gob.ar/salud',
        'ANMAT: https://www.argentina.gob.ar/anmat',
        'SAP: https://www.sap.org.ar/',
        'SAC: https://www.sac.org.ar/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Аргентины —',
        'Документы на испанском (Rioplatense Spanish)',
        'Three-tier system: público / obras sociales / prepagas',
        'Chagas — эндемическая в Northern Argentina, релевантна многим специальностям',
      ],
      related: [
        { id: 'pcdt-br', title: 'PCDT (Brazil)' },
        { id: 'imss', title: 'IMSS (Mexico)' },
        { id: 'paho', title: 'PAHO (Pan-American)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '307.1', title: 'Педиатрия' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по клиническим стандартам Аргентины через национальные specialty societies и Ministerio de Salud.

### Ключевые общества
| Общество | Домен | С года |
|----------|-------|--------|
| **SAP** | Педиатрия | 1911 |
| **SAC** | Кардиология | 1937 |
| **SAN** | Нефрология | 1961 |
| **SAD** | Диабет | 1954 |
| **SATI** | Терапия интенсивная | 1972 |
| **FASGO** | Гинекология/акушерство | 1948 |
| **SAM** | Клиническая медицина | — |

### Three-tier система
- **Público** — провинциальные министерства + национальные hospitals
- **Obras sociales** — социальное страхование (работники формального сектора)
- **Prepagas** — частные планы (высокие доходы)
- **PAMI** — гос. страхование для пожилых

### Эндемические особенности
- **Enfermedad de Chagas** (Trypanosoma cruzi) — эндемична в северных провинциях
- Высокая распространённость obesidad (~28%), DM2, HTN
- Archivos Argentinos de Pediatría — ведущий педиатрический журнал региона

### Источники
- https://www.sap.org.ar/
- https://www.sac.org.ar/
- https://www.argentina.gob.ar/salud
- https://www.argentina.gob.ar/anmat`,
};
export default runner;

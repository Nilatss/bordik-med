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
    const map: Record<string, { name: string; society: string; details: string }> = {
      pediatria: { name: 'Pediatría', society: 'SAP — Sociedad Argentina de Pediatría (с 1911)', details: 'Consensos SAP — одна из старейших и самых уважаемых педиатрических ассоциаций Латинской Америки. Calendario Nacional de Vacunación (совместно с Ministerio). Archivos Argentinos de Pediatría (журнал, высокий импакт в регионе). Guías: bronquiolitis, asma, neumonía, infecciones urinarias, desnutrición, obesidad, TEA, ADHD, pubertad, adolescencia.' },
      cardio: { name: 'Cardiología', society: 'SAC — Sociedad Argentina de Cardiología + FAC (Federación Argentina de Cardiología)', details: 'Consensos SAC: hipertensión arterial, insuficiencia cardíaca, síndromes coronarios agudos, fibrilación auricular, dislipidemias, valvular. Часто адаптация ESC/ACC с учётом локальной эпидемиологии (enfermedad de Chagas — важная причина ICC в Argentina).' },
      nefro: { name: 'Nefrología', society: 'SAN — Sociedad Argentina de Nefrología', details: 'Consensos на гемодиализе, перитонеальном диализе, трансплантации, ОПП, ХБП. Registro argentino de diálisis y trasplante.' },
      diabetes: { name: 'Diabetes', society: 'SAD — Sociedad Argentina de Diabetes', details: 'Guías SAD для DM1, DM2, gestacional. Адаптация ADA/EASD. Высокая распространённость obesidad y DM2.' },
      terapia: { name: 'Terapia intensiva', society: 'SATI — Sociedad Argentina de Terapia Intensiva', details: 'Guías SATI: shock séptico, SDRA, ventilación mecánica, sedación-analgesia, delirium. Revista SATI.' },
      ginecologia: { name: 'Ginecología', society: 'FASGO — Federación Argentina de Sociedades de Ginecología y Obstetricia + SOGIBA', details: 'Consensos: control prenatal, preeclampsia, hemorragia postparto, anticoncepción, IVE/ILE (post-Ley 27.610 de 2021 — legal aborto hasta 14 semanas).' },
      clinica: { name: 'Clínica médica', society: 'SAM — Sociedad Argentina de Medicina', details: 'Консенсусы по hipertensión, diabetes, dislipidemia, EPOC, asma, infecciones. Revista SAM.' },
      ministerio: { name: 'Ministerio de Salud', society: 'Ministerio de Salud de la Nación + PMI + Programas Nacionales', details: 'Guías clínicas нациоnales, Plan Materno Infantil (PMI), REMEDIAR (дистрибуция бесплатных лекарств), Programa Nacional de Chagas, tuberculosis, HIV, vacunación. Sistema Integrado Mayores (PAMI) — для пожилых.' },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'Argentina',
      color: '#6B7280',
      interpretation: `Navigate: Argentine ${e.name}`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\n${e.details}\n\nКонтекст Аргентины: здравоохранение трёхсекторальное — público (provincial MoH + hospitales), obras sociales (социальное страхование для работников), private (prepagas — частные планы). ANMAT — регулятор лекарств.`,
      actions: [
        'SAP: https://www.sap.org.ar/',
        'SAC: https://www.sac.org.ar/',
        'SAN: https://www.san.org.ar/',
        'SAD: https://www.sadbe.org/',
        'SATI: https://www.sati.org.ar/',
        'Ministerio de Salud: https://www.argentina.gob.ar/salud',
        'ANMAT (регулятор): https://www.argentina.gob.ar/anmat',
        'Archivos Argentinos de Pediatría (SAP journal)',
      ],
      caveats: [
        'Документы на испанском (Rioplatense Spanish)',
        'Enfermedad de Chagas — эндемическая в Northern Argentina, важная причина кардиомиопатии',
        'Высокая распространённость obesidad (~28%), DM2, hipertensión',
        'ANMAT — регулятор лекарств (аналог FDA); Vademécum Nacional de Medicamentos',
        'Three-tier system: público / obras sociales / prepagas',
        'Ley 27.610 (2021) — легальный аборт до 14 нед. — интегрирован в гинекологическую практику',
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

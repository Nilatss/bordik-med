// @ts-nocheck
/** Runner: paho — Pan-American Health Organization / WHO AMRO */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Латинская Америка и Карибский бассейн (PAHO / WHO AMRO — 35 стран-членов)',
  reference: 'PAHO — Pan American Health Organization (WHO Regional Office for the Americas, AMRO). Международная организация здравоохранения 35 государств-членов обеих Америк. Старейшее региональное бюро (осн. 1902). https://www.paho.org',
  inputs: [
    {
      id: 'program',
      label: 'Программная область',
      type: 'select',
      options: [
        { value: 'ncd', label: 'NCD — неинфекционные заболевания (HEARTS, диабет, рак, obesidad)' },
        { value: 'infect', label: 'Инфекционные (dengue, malaria, tuberculosis, HIV, Chagas)' },
        { value: 'maternal', label: 'Maternal / child health (PMI, AIEPI)' },
        { value: 'vaccines', label: 'Иммунизация (Revolving Fund, EPI)' },
        { value: 'mental', label: 'Психическое здоровье (mhGAP, Health Agenda 2030)' },
        { value: 'ehealth', label: 'e-Health и цифровое здравоохранение' },
        { value: 'emergencias', label: 'Emergencies (COVID, Zika, оперативные риски)' },
        { value: 'antimicrobial', label: 'Antimicrobial resistance (ReLAVRA+)' },
      ],
    },
  ],
  presets: [
    { label: 'HEARTS (NCD)', values: { program: 'ncd' } },
    { label: 'Иммунизация — Revolving Fund', values: { program: 'vaccines' } },
    { label: 'AIEPI (педиатрия)', values: { program: 'maternal' } },
  ],
  compute: (v) => {
    const p = String(v.program || 'ncd');
    const map: Record<string, { name: string; details: string }> = {
      ncd: { name: 'NCD — Non-Communicable Diseases', details: 'HEARTS in the Americas — региональная инициатива PAHO/CDC для контроля артериальной гипертензии и ССР в первичной помощи (стандартизированные протоколы, team-based care, точные измерения АД). Better Care for NCDs — pilot в странах LAC. Tobacco control (Framework Convention). Salt reduction. Obesity/childhood obesity — региональная эпидемия (Mexico sugar tax 2014 — модель).' },
      infect: { name: 'Инфекционные болезни', details: 'PAHO курирует: Dengue/arbovirus (Zika 2015-16, chikungunya, yellow fever); Malaria (Elimination initiative, P. vivax/falciparum); Tuberculosis (Plan of Action 2018-2022, DR-TB); HIV (Treat All, PrEP); Chagas (Enfermedad de Chagas — hemisferic program); Leishmaniasis; Cholera (Haiti 2010+); Leprosy. Региональная лаб. сеть RELDA.' },
      maternal: { name: 'Maternal / Child Health', details: 'AIEPI (Atención Integrada a las Enfermedades Prevalentes de la Infancia) — PAHO/WHO IMCI адаптированный для LAC, используется во всех странах региона для первичной педиатрии. Maternal mortality reduction — Every Woman Every Child LAC. Breastfeeding/IYCF. Neonatal resuscitation (ACoRN, Helping Babies Breathe).' },
      vaccines: { name: 'Иммунизация', details: 'PAHO Revolving Fund — уникальная региональная закупочная система: страны-члены совместно закупают вакцины по минимальной цене. Одна из причин высокого уровня охвата в LAC (исключая недавний backslide в некоторых странах). EPI regional coordination. Polio elimination (Americas certified 1994 — первый регион). Measles elimination (achieved 2016, частичный re-emergence).' },
      mental: { name: 'Психическое здоровье', details: 'mhGAP — WHO Mental Health Gap Action Programme, адаптирован для LAC. Regional Agenda for Mental Health (Caribbean particularly). Suicide prevention. Substance use — integrated with CICAD.' },
      ehealth: { name: 'e-Health и цифровое здравоохранение', details: 'Plan de Acción sobre eSalud. Регион быстро внедряет EHR, telemedicine (boost в COVID), mobile health. IS4H (Information Systems for Health). SMART guidelines — transition from narrative to machine-readable guidelines.' },
      emergencias: { name: 'Emergencies', details: 'PAHO Emergency Operations Center. Оперативные ответы: COVID-19, Zika (2015-16), Hurricane response (Dorian 2019, Maria 2017), Haiti cholera, earthquake response. IHR 2005 координация.' },
      antimicrobial: { name: 'Antimicrobial Resistance', details: 'ReLAVRA+ — Latin American AMR Surveillance Network. Global Action Plan on AMR — региональная имплементация. One Health подход (сельское хозяйство + ветеринария + human health). Антимикробная stewardship programs.' },
    };
    const e = map[p];
    return {
      value: e.name,
      unit: 'PAHO / AMRO',
      color: '#6B7280',
      interpretation: `Navigate: PAHO ${e.name}`,
      details: `Программа: ${e.name}\n\n${e.details}\n\nPAHO (основ. 1902) — старейшее международное бюро здравоохранения, WHO Regional Office for the Americas (AMRO). 35 стран-членов. Документы публикуются на испанском, португальском, английском, французском.`,
      actions: [
        'PAHO portal: https://www.paho.org/',
        'HEARTS in the Americas: https://www.paho.org/hearts',
        'AIEPI: https://www.paho.org/aiepi',
        'PAHO Revolving Fund: https://www.paho.org/en/revolving-fund',
        'Iris — PAHO open-access repository: https://iris.paho.org/',
        'PLISA — Regional Health Data Platform',
        'PAHO Strategic Plan 2020-2025',
        'Sustainable Health Agenda for the Americas 2018-2030',
      ],
      caveats: [
        'Документы на 4 языках (ES / PT / EN / FR) — в зависимости от целевой аудитории',
        'PAHO ≠ OAS: разные системы (но тесное сотрудничество)',
        'Рекомендации — guidance для стран-членов, не обязательны к исполнению (национальная адаптация)',
        'LAC-региональная эпидемиология: arbovirus, Chagas, obesidad/DM2 эпидемия, maternal mortality в Central America/Haiti, насилие как общественная проблема здравоохранения',
        'Revolving Fund — закупка только для государственных программ (не частный сектор)',
        'Большие различия между странами: Canada/US vs Haiti/Central America',
      ],
      related: [
        { id: 'pcdt-br', title: 'PCDT (Brazil)' },
        { id: 'imss', title: 'IMSS (Mexico)' },
        { id: 'sap-sac', title: 'SAP/SAC (Argentina)' },
        { id: 'imci-africa', title: 'IMCI Africa (WHO)' },
      ],
      relatedCourses: [
        { id: '300.1', title: 'Организация здравоохранения' },
        { id: '308.1', title: 'Инфекционные болезни' },
      ],
    };
  },
  info: `### Для чего используется
**PAHO (Pan American Health Organization)** — международное агентство здравоохранения 35 стран Северной, Центральной и Южной Америки + Карибский бассейн. Одновременно WHO Regional Office for the Americas (AMRO). Старейшее международное бюро здравоохранения (осн. 1902).

### Ключевые инициативы
| Программа | Описание |
|-----------|----------|
| **HEARTS in the Americas** | Hypertension control в первичной помощи |
| **AIEPI** | Адаптация IMCI для LAC (pediatrics) |
| **Revolving Fund** | Совместная закупка вакцин (уникально в мире) |
| **Chagas elimination** | Trypanosoma cruzi |
| **ReLAVRA+** | AMR surveillance |
| **mhGAP adaptation** | Психическое здоровье |

### Исторические достижения
- **1994** — первый WHO регион с сертифицированной элиминацией полиомиелита
- **2016** — корь объявлена ликвидированной (позже частично re-emergence)
- **2015** — элиминация вертикальной передачи HIV и врождённого сифилиса в Cuba

### Документация
Публикации PAHO: 4 языка (ES / PT / EN / FR). **Iris** — открытый репозиторий: iris.paho.org.

### Источники
- https://www.paho.org/
- https://iris.paho.org/
- WHO: https://www.who.int/`,
};
export default runner;

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
    const map: Record<string, { name: string; details: string; actions: string[]; caveats: string[] }> = {
      ncd: {
        name: 'NCD — Non-Communicable Diseases',
        details: 'HEARTS in the Americas — региональная инициатива PAHO/CDC для контроля артериальной гипертензии и ССР в первичной помощи (стандартизированные протоколы, team-based care, точные измерения АД). Better Care for NCDs — pilot в странах LAC. Tobacco control (Framework Convention). Salt reduction. Obesity/childhood obesity — региональная эпидемия (Mexico sugar tax 2014 — модель).',
        actions: [
          'HEARTS in the Americas: https://www.paho.org/en/hearts-americas',
          'PAHO NCD: https://www.paho.org/en/topics/noncommunicable-diseases',
          'Global Hearts Initiative (WHO): https://www.who.int/initiatives/global-hearts',
          'Tobacco control FCTC: https://fctc.who.int/',
        ],
        caveats: [
          'HEARTS — standardised BP measurement + simplified drug protocol',
          'Sugar tax models: Mexico 2014, Chile 2016',
          'Obesidad infantil в LAC — одна из самых высоких в мире',
          'Salt reduction targets — voluntary, ограниченный прогресс',
        ],
      },
      infect: {
        name: 'Инфекционные болезни',
        details: 'PAHO курирует: Dengue/arbovirus (Zika 2015-16, chikungunya, yellow fever); Malaria (Elimination initiative, P. vivax/falciparum); Tuberculosis (Plan of Action 2018-2022, DR-TB); HIV (Treat All, PrEP); Chagas (Enfermedad de Chagas — hemisferic program); Leishmaniasis; Cholera (Haiti 2010+); Leprosy. Региональная лаб. сеть RELDA.',
        actions: [
          'PAHO Communicable Diseases: https://www.paho.org/en/topics/communicable-diseases',
          'PLISA (arbovirus surveillance): https://www3.paho.org/data/',
          'PAHO Chagas: https://www.paho.org/en/topics/chagas-disease',
          'Malaria Elimination Americas: https://www.paho.org/en/topics/malaria',
        ],
        caveats: [
          'Dengue cyclical epidemics — surge 2023–2024 (record в LAC)',
          'Chagas — endemic в 21 стране, ~6 млн infected',
          'Yellow fever — rural Amazonas, cyclical outbreaks',
          'HIV: Treat All + Fast-Track 95-95-95 цели',
        ],
      },
      maternal: {
        name: 'Maternal / Child Health',
        details: 'AIEPI (Atención Integrada a las Enfermedades Prevalentes de la Infancia) — PAHO/WHO IMCI адаптированный для LAC, используется во всех странах региона для первичной педиатрии. Maternal mortality reduction — Every Woman Every Child LAC. Breastfeeding/IYCF. Neonatal resuscitation (ACoRN, Helping Babies Breathe).',
        actions: [
          'AIEPI: https://www.paho.org/en/topics/integrated-management-childhood-illness-imci',
          'Every Woman Every Child LAC: https://www.paho.org/en/topics/maternal-health',
          'CLAP (Centro Latinoamericano de Perinatología): https://clap.paho.org/',
          'Helping Babies Breathe programme',
        ],
        caveats: [
          'Maternal mortality — highest в Haiti, Bolivia, Guatemala',
          'CLAP (Montevideo) — ведущий региональный perinatal centre',
          'CLAP perinatal clinical history — standardised форма по LAC',
          'AIEPI — локальные адаптации каждой страны',
        ],
      },
      vaccines: {
        name: 'Иммунизация',
        details: 'PAHO Revolving Fund — уникальная региональная закупочная система: страны-члены совместно закупают вакцины по минимальной цене. Одна из причин высокого уровня охвата в LAC (исключая недавний backslide в некоторых странах). EPI regional coordination. Polio elimination (Americas certified 1994 — первый регион). Measles elimination (achieved 2016, частичный re-emergence).',
        actions: [
          'PAHO Revolving Fund: https://www.paho.org/en/revolving-fund',
          'PAHO Immunization: https://www.paho.org/en/topics/immunization',
          'Vaccination Week in the Americas (April, annual)',
          'SIREVA II (pneumococcal surveillance network)',
        ],
        caveats: [
          'Revolving Fund — pooled procurement, только public sector',
          'Measles re-emergence в Venezuela, Brazil (2018–19) из-за backslide',
          'HPV: MR + HPV для boys now recommended PAHO regional',
          'Polio — Americas polio-free, но vaccination coverage declining',
        ],
      },
      mental: {
        name: 'Психическое здоровье',
        details: 'mhGAP — WHO Mental Health Gap Action Programme, адаптирован для LAC. Regional Agenda for Mental Health (Caribbean particularly). Suicide prevention. Substance use — integrated with CICAD.',
        actions: [
          'mhGAP: https://www.paho.org/en/mhgap',
          'PAHO Mental Health: https://www.paho.org/en/topics/mental-health',
          'CICAD (drugs / OAS): http://www.cicad.oas.org/',
          'LIVE LIFE — suicide prevention (WHO)',
        ],
        caveats: [
          'mhGAP Intervention Guide — non-specialist training tool',
          'Caribbean — особо высокий suicide burden (Guyana, Suriname)',
          'Mental health spending < 2% budget в большинстве LAC стран',
          'Integration mental health в primary care — goal but slow',
        ],
      },
      ehealth: {
        name: 'e-Health и цифровое здравоохранение',
        details: 'Plan de Acción sobre eSalud. Регион быстро внедряет EHR, telemedicine (boost в COVID), mobile health. IS4H (Information Systems for Health). SMART guidelines — transition from narrative to machine-readable guidelines.',
        actions: [
          'PAHO IS4H: https://www3.paho.org/ish/',
          'PAHO Digital Transformation Toolkit',
          'SMART Guidelines (WHO): https://www.who.int/teams/digital-health-and-innovation/smart-guidelines',
          'WHO Digital Health: https://www.who.int/health-topics/digital-health',
        ],
        caveats: [
          'Брешь цифрового доступа — сельские/коренные народы',
          'Данные interoperability — FHIR adoption начинается',
          'Телемедицина расцвела в COVID; регуляция неполная',
          'Data protection laws — LGPD (Brazil), varies по странам',
        ],
      },
      emergencias: {
        name: 'Emergencies',
        details: 'PAHO Emergency Operations Center. Оперативные ответы: COVID-19, Zika (2015-16), Hurricane response (Dorian 2019, Maria 2017), Haiti cholera, earthquake response. IHR 2005 координация.',
        actions: [
          'PAHO Health Emergencies: https://www.paho.org/en/health-emergencies',
          'PAHO Disaster Response: https://www.paho.org/en/topics/disasters-emergencies-and-humanitarian-action',
          'LSS/SUMA (humanitarian supply mgmt)',
          'Emergency Operations Center: https://www.paho.org/en/topics/emergency-operations-centers',
        ],
        caveats: [
          'Caribbean — hurricane season каждый год (June–November)',
          'Haiti — chronic humanitarian crisis + cholera re-emergence 2022',
          'SMART hospitals (safer, green) — региональная программа',
          'IHR 2005 — обязательное уведомление PHEIC',
        ],
      },
      antimicrobial: {
        name: 'Antimicrobial Resistance',
        details: 'ReLAVRA+ — Latin American AMR Surveillance Network. Global Action Plan on AMR — региональная имплементация. One Health подход (сельское хозяйство + ветеринария + human health). Антимикробная stewardship programs.',
        actions: [
          'ReLAVRA+: https://www.paho.org/en/topics/antimicrobial-resistance',
          'GLASS (WHO Global AMR Surveillance): https://www.who.int/initiatives/glass',
          'One Health platform (PAHO/FAO/WOAH)',
          'PAHO AMR: https://www.paho.org/en/topics/antimicrobial-resistance',
        ],
        caveats: [
          'MDR K. pneumoniae — rising в ICUs LAC',
          'Carbapenem use без prescription — частая практика в некоторых странах',
          'One Health surveillance — интеграция с ветеринарией неполная',
          'Candida auris — emerging threat в Brazil, Colombia, Venezuela',
        ],
      },
    };
    const e = map[p];
    return {
      value: e.name,
      unit: 'PAHO / AMRO',
      color: '#6B7280',
      interpretation: `Navigate: PAHO ${e.name}`,
      details: `Программа: ${e.name}\n\n${e.details}`,
      actions: [
        ...e.actions,
        '— Общие источники PAHO —',
        'PAHO portal: https://www.paho.org/',
        'Iris repository: https://iris.paho.org/',
        'PLISA — Regional Health Data Platform: https://www3.paho.org/data/',
        'Sustainable Health Agenda for the Americas 2018-2030',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для PAHO —',
        'Документы на 4 языках (ES / PT / EN / FR)',
        'Рекомендации — guidance, не обязательны (национальная адаптация)',
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

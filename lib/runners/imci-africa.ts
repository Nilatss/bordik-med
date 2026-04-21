// @ts-nocheck
/** Runner: imci-africa — Integrated Management of Childhood Illness (WHO/Africa) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Африка (Sub-Saharan Africa, WHO AFRO); также используется в Юго-Восточной Азии и LAC под разными именами (AIEPI, IMNCI)',
  reference: 'IMCI — Integrated Management of Childhood Illness, WHO + UNICEF программа (с 1995). Национальные адаптации: IMNCI (India), AIEPI (LAC), IMCI (Africa AFRO). https://www.who.int/maternal_child_adolescent/topics/child/imci/',
  inputs: [
    {
      id: 'country',
      label: 'Страна / регион',
      type: 'select',
      options: [
        { value: 'nigeria', label: 'Нигерия' },
        { value: 'ethiopia', label: 'Эфиопия' },
        { value: 'kenya', label: 'Кения' },
        { value: 'tanzania', label: 'Танзания' },
        { value: 'uganda', label: 'Уганда' },
        { value: 'ghana', label: 'Гана' },
        { value: 'drc', label: 'ДР Конго' },
        { value: 'southafrica', label: 'ЮАР' },
        { value: 'afro', label: 'WHO AFRO — региональные рекомендации' },
      ],
    },
    {
      id: 'ageGroup',
      label: 'Возрастная группа',
      type: 'select',
      options: [
        { value: 'newborn', label: 'Newborn (0-7 дней) — IMNCI Young Infant' },
        { value: 'young', label: 'Young infant (1 нед - 2 мес) — IMCI Young Infant' },
        { value: 'child', label: '2 мес - 5 лет — стандартный IMCI' },
      ],
    },
  ],
  presets: [
    { label: 'IMCI — 2м-5л Кения', values: { country: 'kenya', ageGroup: 'child' } },
    { label: 'Young infant — Нигерия', values: { country: 'nigeria', ageGroup: 'young' } },
    { label: 'Newborn — Эфиопия', values: { country: 'ethiopia', ageGroup: 'newborn' } },
  ],
  compute: (v) => {
    const c = String(v.country || 'afro');
    const ag = String(v.ageGroup || 'child');
    const ageDetails: Record<string, string> = {
      newborn: '**Newborn (0-7 days):** KMC (kangaroo mother care), ранее начало грудного вскармливания, prevention of hypothermia, eye care (tetracycline ophthalmic), cord care (chlorhexidine 7.1% в некоторых странах — WHO endorsed), неонатальный сепсис (early recognition: poor feeding, lethargy, respiratory distress, temperature instability → parenteral антибиотики ampicillin+gentamicin).',
      young: '**Young infant (1 wk - 2 months):** возможная bacterial infection (PSBI — Possible Serious Bacterial Infection) — требуется parenteral АБ; local infection; jaundice; diarrhoea; feeding problem / low weight. Специальные таблицы IMCI Young Infant.',
      child: '**2 months - 5 years:** классические IMCI categories: cough/difficult breathing (pneumonia — fast breathing по возрасту: ≥50/мин 2-12мес, ≥40/мин 1-5лет), diarrhoea (dehydration Plan A/B/C, dysentery, persistent), fever (malaria в endemic areas, measles, meningitis), ear problem, malnutrition (MUAC — 11.5-12.5 SAM/MAM, oedema, visible severe wasting), anaemia, HIV assessment.',
    };
    const countryMap: Record<string, { name: string; actions: string[]; caveats: string[] }> = {
      nigeria: {
        name: 'Нигерия',
        actions: [
          'Nigeria FMoH: https://www.health.gov.ng/',
          'Nigeria IMCI chart booklet (2014 adaptation)',
          'NPHCDA (immunization): https://nphcda.gov.ng/',
          'NMEP (malaria): https://nmcp.gov.ng/',
        ],
        caveats: [
          'Malaria: P. falciparum dominant → ACT (AL / DHA-PPQ) первая линия',
          'Sickle cell disease — высокая распространённость (~2% HbSS), скрининг IMCI-adapted',
          'Measles outbreaks — периодические, SIA кампании NPHCDA',
          'Lassa fever — endemic, febrile illness differential',
        ],
      },
      ethiopia: {
        name: 'Эфиопия',
        actions: [
          'Ethiopia MoH: https://www.moh.gov.et/',
          'Ethiopian IMNCI chart booklet (FMoH 2012)',
          'EPHI (public health): https://ephi.gov.et/',
          'HEW (Health Extension Worker) packages — community IMCI',
        ],
        caveats: [
          'HEW programme — 2 HEWs per kebele, доставляют C-IMCI',
          'Malaria: mixed P. falciparum + P. vivax (только в Африке с высокой vivax долей)',
          'SAM: high burden, Plumpy\'Nut через OTP (Outpatient Therapeutic Programme)',
          'Pastoralist populations — mobile health strategies (Afar, Somali regions)',
        ],
      },
      kenya: {
        name: 'Кения',
        actions: [
          'Kenya MoH: https://www.health.go.ke/',
          'Kenya Paediatric Protocols (Basic Paediatric Protocols — KEMRI/Wellcome)',
          'KEMRI-Wellcome Clinical Information Network',
          'NVIP (immunization): https://nvip.moh.go.ke/',
        ],
        caveats: [
          'Basic Paediatric Protocols — Kenyan standard, часто точнее чем IMCI chart',
          'HIV burden — EID (Early Infant Diagnosis) DNA PCR at 6 wks, routine',
          'Malaria: endemic в Lake/Coast regions; Highland — low',
          'Pulse oximetry — roll-out расширяется в county hospitals',
        ],
      },
      tanzania: {
        name: 'Танзания',
        actions: [
          'Tanzania MoH: https://www.moh.go.tz/',
          'Tanzania IMCI chart booklet (2013)',
          'NACP (HIV): https://nacp.go.tz/',
          'IMA World Health — community IMCI support',
        ],
        caveats: [
          'Zanzibar — малярия почти элиминирована; mainland — still endemic',
          'Community Health Workers — важный элемент C-IMCI',
          'Schistosomiasis — учитывать в differential (haematuria, abdominal)',
          'SAM: Plumpy\'Nut через RUTF supply chain',
        ],
      },
      uganda: {
        name: 'Уганда',
        actions: [
          'Uganda MoH: https://www.health.go.ug/',
          'Uganda Clinical Guidelines (UCG — MoH)',
          'Uganda IMNCI chart booklet',
          'UNEPI (immunization): https://www.health.go.ug/programs/unepi/',
        ],
        caveats: [
          'Malaria hyperendemic — ACT + RDT повсеместно',
          'Ebola outbreaks — periodic (Bundibugyo, Sudan virus); IMCI plus febrile surveillance',
          'HIV — Option B+ (lifelong ART для всех беременных) с 2012',
          'Nodding syndrome — north Uganda, IMCI screens for chronic illness',
        ],
      },
      ghana: {
        name: 'Гана',
        actions: [
          'Ghana Health Service: https://www.ghs.gov.gh/',
          'Ghana Standard Treatment Guidelines (STG 2017)',
          'CHPS compounds (Community-Based Health Planning & Services)',
          'NHIS (insurance): https://www.nhis.gov.gh/',
        ],
        caveats: [
          'NHIS покрывает IMCI-level care бесплатно для детей < 18',
          'Malaria P. falciparum endemic, RDT-directed treatment',
          'Sickle cell screening — newborn programme в major centres',
          'Buruli ulcer — endemic в некоторых districts (M. ulcerans)',
        ],
      },
      drc: {
        name: 'ДР Конго',
        actions: [
          'RDC Ministère de la Santé: https://www.minisanterdc.cd/',
          'PCIME chart booklet (French version)',
          'PEV (immunization): https://www.minisanterdc.cd/',
          'WHO AFRO DRC: https://www.afro.who.int/countries/democratic-republic-of-the-congo',
        ],
        caveats: [
          'Franglophone — PCIME (not IMCI) документация',
          'Malaria hyperendemic + monkeypox (mpox) — endemic clade Ib',
          'Измерения measles периодические, низкий vaccination coverage',
          'Conflict zones (E. DRC) — disrupted health system, MSF critical',
        ],
      },
      southafrica: {
        name: 'ЮАР',
        actions: [
          'South Africa NDoH: https://www.health.gov.za/',
          'SA IMCI chart booklet (NDoH 2014 revision)',
          'SA Paediatric Association guidelines',
          'SA EPI schedule: https://www.health.gov.za/immunization/',
        ],
        caveats: [
          'HIV — highest burden in world; PMTCT Option B+ стандарт',
          'Malaria: только low-transmission areas (Mpumalanga, Limpopo, KZN)',
          'TB: very high burden — TB screening integrated в IMCI',
          'Road to Health Booklet — каждый ребёнок, growth + immunisation',
        ],
      },
      afro: {
        name: 'WHO AFRO регион',
        actions: [
          'WHO AFRO: https://www.afro.who.int/',
          'WHO IMCI global: https://www.who.int/maternal_child_adolescent/topics/child/imci/',
          'WHO Pocket Book of Hospital Care for Children (2nd ed.)',
          'WHO ETAT (Emergency Triage Assessment and Treatment)',
        ],
        caveats: [
          'Региональные вариации malaria: endemic vs seasonal vs low-transmission',
          'HIV: ESA/WCA — разные схемы и burden',
          'SAM management: CMAM (Community-based Management of Acute Malnutrition) универсально',
          'ETAT — triage перед IMCI при hospital-level care',
        ],
      },
    };
    const e = countryMap[c];
    return {
      value: `IMCI — ${e.name}`,
      unit: 'WHO/UNICEF IMCI',
      color: '#6B7280',
      interpretation: `Navigate: IMCI ${e.name} (${ag})`,
      details: `Страна: ${e.name}\n\nВозрастная группа: ${ag === 'newborn' ? '0-7 дней (Newborn)' : ag === 'young' ? '1 нед - 2 мес (Young Infant)' : '2 мес - 5 лет (Child)'}\n\n${ageDetails[ag]}\n\nIMCI workflow:\n1. Assess — check general danger signs → main symptoms → nutrition → HIV status → immunisation\n2. Classify — светофор: RED (refer urgently), YELLOW (treat at health centre), GREEN (home care)\n3. Identify treatment\n4. Treat — first dose before referral if needed\n5. Counsel mother — home care, when to return, feeding\n6. Follow-up\n\nНациональная адаптация IMCI каждой страной учитывает: локальную этиологию малярии (P. falciparum vs P. vivax), HIV bagrount (high в Южной Африке), антибиотики first-line (resistance patterns), доступные лекарства (government formulary).`,
      actions: [
        ...e.actions,
        '— Общие источники IMCI —',
        'WHO IMCI: https://www.who.int/maternal_child_adolescent/topics/child/imci/',
        'WHO AFRO: https://www.afro.who.int/',
        'WHO Pocket Book of Hospital Care for Children (2nd ed.)',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для IMCI Africa —',
        'Документы на EN / FR / PT — по колониальной истории',
        'IMCI — протокол первичного звена (health centre level); не замена specialist care',
        'IMNCI (India), AIEPI (LAC), IMCI (Africa) — варианты одной программы WHO',
      ],
      related: [
        { id: 'paho', title: 'PAHO / AIEPI (LAC analog)' },
        { id: 'iap', title: 'IAP (India — IMNCI)' },
        { id: 'asean', title: 'ASEAN (SEA IMCI)' },
      ],
      relatedCourses: [
        { id: '307.1', title: 'Педиатрия' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**IMCI (Integrated Management of Childhood Illness)** — интегрированный WHO/UNICEF протокол ведения болезней детей 0-5 лет на уровне первичной медицинской помощи (health centre, district hospital outpatient). Разработан в 1995, 100+ стран адаптировали.

### Три компонента IMCI
1. **Improving case management skills** — training health workers
2. **Improving health systems** — drugs, supplies, referral
3. **Improving family / community practices** — C-IMCI (Community IMCI)

### Возрастные группы
| Возраст | Chart booklet |
|---------|--------------|
| 0-7 days | Newborn / IMNCI |
| 1 нед - 2 мес | Young Infant |
| 2 мес - 5 лет | IMCI classic |

### Светофорная классификация
- **PINK/RED** — severe disease → refer urgently (with pre-referral treatment)
- **YELLOW** — treat at health centre
- **GREEN** — home care + counsel

### Главные категории классификации (2-5 лет)
- Cough / difficult breathing → **pneumonia** по fast breathing
- Diarrhoea → dehydration Plan A/B/C, dysentery, persistent
- Fever → malaria, measles, meningitis
- Ear problem
- Malnutrition → MUAC, oedema
- Anaemia
- HIV exposure / infection

### Региональные адаптации
- **IMCI** — Africa (AFRO)
- **IMNCI** — India
- **AIEPI** — LAC (PAHO)
- **SEA IMCI** — Юго-Восточная Азия

### Источники
- https://www.who.int/maternal_child_adolescent/topics/child/imci/
- https://www.afro.who.int/
- WHO Pocket Book of Hospital Care for Children (2nd ed.)`,
};
export default runner;

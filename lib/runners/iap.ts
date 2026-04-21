// @ts-nocheck
/** Runner: iap — Indian Academy of Pediatrics */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Индия (также референс в ряде стран Южной Азии)',
  reference: 'Indian Academy of Pediatrics (IAP) — крупнейшая педиатрическая ассоциация Индии. IAP Advisory Committee on Vaccines and Immunization Practices (ACVIP), IAP Growth Charts Committee, IAP-PIP (Protocols in Pediatrics). https://iapindia.org',
  inputs: [
    {
      id: 'topic',
      label: 'Педиатрическая тема',
      type: 'select',
      options: [
        { value: 'immunization', label: 'Иммунизация (IAP ACVIP schedule)' },
        { value: 'growth', label: 'Рост / развитие (IAP growth charts)' },
        { value: 'nutrition', label: 'Питание / IYCF / malnutrition' },
        { value: 'infection', label: 'Инфекционные болезни' },
        { value: 'nnf', label: 'Неонатология (NNF — National Neonatology Forum)' },
        { value: 'respiratory', label: 'Респираторная (астма, бронхиолит)' },
        { value: 'emergency', label: 'Неотложная педиатрия (IAP-PIP)' },
      ],
    },
  ],
  presets: [
    { label: 'IAP Immunization', values: { topic: 'immunization' } },
    { label: 'IAP Growth charts', values: { topic: 'growth' } },
    { label: 'NNF (Neonatology)', values: { topic: 'nnf' } },
  ],
  compute: (v) => {
    const t = String(v.topic || 'immunization');
    const map: Record<string, { name: string; body: string; details: string; actions: string[]; caveats: string[] }> = {
      immunization: {
        name: 'Иммунизация',
        body: 'IAP ACVIP — Advisory Committee on Vaccines and Immunization Practices',
        details: 'IAP Immunization Schedule — ежегодное обновление, доступно на iapindia.org. Отличается от Government of India Universal Immunization Programme (UIP — бесплатный, ограниченный набор): IAP включает дополнительные вакцины (varicella, HAV, HPV, inf A/B, PCV, rotavirus, typhoid) в зависимости от платёжеспособности семьи. Катч-ап schedules для отставших детей. Специальные рекомендации для недоношенных, иммунодефицитов.',
        actions: [
          'IAP ACVIP schedule: https://iapindia.org/acvip/',
          'UIP schedule (MoHFW): https://www.mohfw.gov.in/',
          'Indian Journal of Pediatrics — ACVIP update issue (annual)',
          'Cowin (digital vaccination): https://www.cowin.gov.in/',
        ],
        caveats: [
          'HPV: IAP — с 9 лет (2-dose если < 15); UIP roll-out 2023 для девочек 9–14',
          'Rotavirus: UIP Rotavac (Indian) — 3 doses; IAP допускает и international brands',
          'PCV: UIP PCV10 (roll-out завершён 2021); IAP PCV13 в частном секторе',
          'Varicella / HAV / Typhoid conjugate — не в UIP, только IAP (платно)',
        ],
      },
      growth: {
        name: 'Рост и развитие',
        body: 'IAP Growth Charts Committee',
        details: 'IAP Growth Charts (2015, revised) — национальные центильные карты, адаптированные к индийским детям 5-18 лет (в отличие от WHO Child Growth Standards для <5 лет, которые IAP также использует). Важно: индийские дети в среднем меньше по WHO — использование только WHO может переоценить стунтинг. IAP charts — для 5-18 лет, возраст-специфичный BMI.',
        actions: [
          'IAP Growth Charts (2015): https://iapindia.org/growth-charts/',
          'WHO Child Growth Standards (<5 y): https://www.who.int/tools/child-growth-standards',
          'Indian Journal of Endocrinology — IAP BMI cutoffs article',
          'RBSK (Rashtriya Bal Swasthya Karyakram) — screening forms',
        ],
        caveats: [
          'WHO < 5 лет + IAP 5–18 лет — комбинация для полного цикла',
          'BMI cutoffs: IAP adult-equivalent 23/27 ("adult overweight/obesity equivalent" lines)',
          'Mid-parental height — полезно при short stature evaluation',
          'Premature: Fenton charts до 50 нед PMA, затем IAP',
        ],
      },
      nutrition: {
        name: 'Питание / malnutrition',
        body: 'IAP Nutrition Chapter + MoHFW / NHM',
        details: 'IYCF (Infant and Young Child Feeding), F-75/F-100 для SAM (severe acute malnutrition), Poshan Abhiyaan (national nutrition mission), iron/vitamin A supplementation. Высокая распространённость стунтинга (~36% по NFHS-5) и анемии. RBSK (Rashtriya Bal Swasthya Karyakram) — школьный скрининг.',
        actions: [
          'Poshan Abhiyaan: https://poshanabhiyaan.gov.in/',
          'Anemia Mukt Bharat: https://anemiamuktbharat.info/',
          'WHO/UNICEF IYCF counselling cards',
          'NFHS-5 data: http://rchiips.org/nfhs/',
        ],
        caveats: [
          'SAM: MUAC < 11.5 cm OR WFH < −3SD OR bilateral pedal oedema',
          'F-75 (stabilisation) → F-100 / RUTF (rehabilitation) — в NRC (Nutrition Rehab Centres)',
          'IFA (iron+folate) — supplementation через AMB school programme',
          'Vitamin A: 9 doses с 9 мес до 5 лет (UIP)',
        ],
      },
      infection: {
        name: 'Инфекционные болезни',
        body: 'IAP Infectious Diseases Chapter',
        details: 'Высокая эндемичность: туберкулёз (RNTCP / NTEP), малярия (P. vivax, P. falciparum), dengue, typhoid, leptospirosis, ЧВК. IAP consensus guidelines on pediatric TB, dengue, malaria, enteric fever. Антимикробная резистентность — острая проблема.',
        actions: [
          'NTEP (Nikshay): https://nikshay.in/',
          'NVBDCP (malaria/dengue): https://nvbdcp.gov.in/',
          'IAP Consensus on Pediatric TB (2019)',
          'ICMR AMR Network: https://iamrsn.icmr.org.in/',
        ],
        caveats: [
          'Pediatric TB: NTEP — bedaquiline/delamanid now available < 18 лет (MDR)',
          'Dengue fluid management — strict Q1–Q4h во время critical phase',
          'Enteric fever — AMR: ceftriaxone first line (chloramphenicol/ampicillin resistance)',
          'Rabies: 1-week IDRV схема (updated 2018) — cost-effective',
        ],
      },
      nnf: {
        name: 'Неонатология',
        body: 'NNF — National Neonatology Forum',
        details: 'NNF Clinical Practice Guidelines (CPGs) — перинатальная асфиксия, неонатальная гипогликемия, неонатальная желтуха, неонатальный сепсис (high burden, ресурс-лимитированные протоколы), KMC (kangaroo mother care), роль ANM / ASHA. Facility-Based Newborn Care (FBNC) + Home-Based Newborn Care (HBNC).',
        actions: [
          'NNF India: https://nnfi.org/',
          'NNF CPG archive: https://nnfi.org/cpgs',
          'FBNC / HBNC operational guidelines (MoHFW)',
          'India Newborn Action Plan (INAP)',
        ],
        caveats: [
          'Phototherapy cutoffs — NNF chart для India (differ from AAP 2022)',
          'Sepsis: ampicillin + gentamicin — 1-я линия FBNC/FBNU',
          'KMC — MoHFW national programme для LBW < 2000 г',
          'HBNC visits (ASHA): 6 visits at home за 42 дня',
        ],
      },
      respiratory: {
        name: 'Респираторная',
        body: 'IAP Respiratory Chapter',
        details: 'Childhood asthma (adapted GINA), бронхиолит (RSV high burden), pneumonia (WHO IMCI + Indian data), pollution-related respiratory disease (Delhi, Mumbai), SAM + pneumonia (high mortality).',
        actions: [
          'IAP Respiratory Chapter guidelines: https://iapindia.org/',
          'INDIAN-GINA asthma adaptation',
          'WHO IMCI (pneumonia classification)',
          'National Clean Air Programme (NCAP): https://moef.gov.in/',
        ],
        caveats: [
          'Fast breathing ≥ 50/мин (2–12 мес) / ≥ 40/мин (1–5 лет) → "pneumonia" IMCI',
          'WHO oral amoxicillin 3 дня — non-severe pneumonia (2023 update)',
          'Palivizumab — не в UIP; используется в частном секторе для ex-preterm',
          'Air pollution — Delhi AQI alerts: limit outdoor, consider HEPA',
        ],
      },
      emergency: {
        name: 'Неотложная педиатрия',
        body: 'IAP-PIP — Protocols in Pediatrics',
        details: 'IAP-PIP — карманный protocol book (ежегодное обновление): SAM, sepsis, shock, status epilepticus, DKA, snake bite (high burden), drowning, poisoning. PALS-India adapted. Ориентация на district hospital / resource-limited ресурсы.',
        actions: [
          'IAP-PIP pocket book (ежегодное обновление — печать + PDF)',
          'National Snakebite Management Protocol (MoHFW 2017)',
          'PALS-India course: https://iapindia.org/',
          'Indian Poison Information Centre (AIIMS): http://www.aiims.edu/',
        ],
        caveats: [
          'Snake bite: Indian polyvalent ASV — covers Big Four (cobra, krait, Russell\'s, saw-scaled)',
          'Aluminum phosphide poisoning — very high mortality, no specific antidote',
          'DKA fluids: cautious (cerebral edema risk), 10 мл/кг bolus только при shock',
          'Status epilepticus: midazolam IM/buccal — 1-я линия без IV',
        ],
      },
    };
    const e = map[t];
    return {
      value: e.name,
      unit: 'IAP India',
      color: '#6B7280',
      interpretation: `Navigate: IAP ${e.name}`,
      details: `Тема: ${e.name}\n\nОрган: ${e.body}\n\n${e.details}`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'IAP portal: https://iapindia.org/',
        'MoHFW: https://www.mohfw.gov.in/',
        'NHM: https://nhm.gov.in/',
        'NNF India: https://nnfi.org/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Индии —',
        'Документы на английском (медицина Индии англоязычная)',
        'IAP schedule ≠ UIP — IAP расширенный, UIP базовый (бесплатный)',
        'Ресурс-ограниченные настройки: district hospital vs tertiary — адаптировать протоколы',
      ],
      related: [
        { id: 'china', title: 'China (CMA)' },
        { id: 'asean', title: 'ASEAN guidelines' },
        { id: 'imci-africa', title: 'IMCI Africa (WHO pediatric)' },
      ],
      relatedCourses: [
        { id: '307.1', title: 'Педиатрия' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**IAP (Indian Academy of Pediatrics)** — крупнейшая педиатрическая ассоциация Индии (~34 000 членов), ведущий автор клинических рекомендаций для педиатрии в Индии.

### Ключевые продукты
| Продукт | Назначение |
|---------|-----------|
| **IAP ACVIP Immunization Schedule** | Ежегодное обновление, расширенный календарь |
| **IAP Growth Charts (5-18 y)** | Национальные центильные карты |
| **IAP-PIP** (Protocols in Pediatrics) | Pocket book clinical protocols |
| **IAP Standard Treatment Guidelines** | По специальностям |
| **NNF CPGs** | Национальная неонатология |

### Контекст Индии
- 1.4 млрд населения, 26 млн рождений/год
- Высокий burden стунтинга (~36%), анемии (~68% у женщин)
- Неонатальная смертность снижается, но остаётся ключевой
- Двухсекторальная система: общественный (UIP, RBSK, NHM) + частный (IAP)

### UIP vs IAP schedule
- **UIP** (Government): BCG, OPV, Pentavalent (DPT-HepB-Hib), Measles-Rubella, Hepatitis B, Rotavirus, IPV, PCV (rolling out)
- **IAP** (расширенный): + varicella, HAV, typhoid, HPV, influenza, PCV (независимо от UIP roll-out)

### Источники
- https://iapindia.org/
- https://nnfi.org/
- https://www.mohfw.gov.in/
- https://nhm.gov.in/`,
};
export default runner;

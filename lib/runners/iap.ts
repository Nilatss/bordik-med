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
    const map: Record<string, { name: string; body: string; details: string }> = {
      immunization: {
        name: 'Иммунизация',
        body: 'IAP ACVIP — Advisory Committee on Vaccines and Immunization Practices',
        details: 'IAP Immunization Schedule — ежегодное обновление, доступно на iapindia.org. Отличается от Government of India Universal Immunization Programme (UIP — бесплатный, ограниченный набор): IAP включает дополнительные вакцины (varicella, HAV, HPV, inf A/B, PCV, rotavirus, typhoid) в зависимости от платёжеспособности семьи. Катч-ап schedules для отставших детей. Специальные рекомендации для недоношенных, иммунодефицитов.',
      },
      growth: {
        name: 'Рост и развитие',
        body: 'IAP Growth Charts Committee',
        details: 'IAP Growth Charts (2015, revised) — национальные центильные карты, адаптированные к индийским детям 5-18 лет (в отличие от WHO Child Growth Standards для <5 лет, которые IAP также использует). Важно: индийские дети в среднем меньше по WHO — использование только WHO может переоценить стунтинг. IAP charts — для 5-18 лет, возраст-специфичный BMI.',
      },
      nutrition: {
        name: 'Питание / malnutrition',
        body: 'IAP Nutrition Chapter + MoHFW / NHM',
        details: 'IYCF (Infant and Young Child Feeding), F-75/F-100 для SAM (severe acute malnutrition), Poshan Abhiyaan (national nutrition mission), iron/vitamin A supplementation. Высокая распространённость стунтинга (~36% по NFHS-5) и анемии. RBSK (Rashtriya Bal Swasthya Karyakram) — школьный скрининг.',
      },
      infection: {
        name: 'Инфекционные болезни',
        body: 'IAP Infectious Diseases Chapter',
        details: 'Высокая эндемичность: туберкулёз (RNTCP / NTEP), малярия (P. vivax, P. falciparum), dengue, typhoid, leptospirosis, ЧВК. IAP consensus guidelines on pediatric TB, dengue, malaria, enteric fever. Антимикробная резистентность — острая проблема.',
      },
      nnf: {
        name: 'Неонатология',
        body: 'NNF — National Neonatology Forum',
        details: 'NNF Clinical Practice Guidelines (CPGs) — перинатальная асфиксия, неонатальная гипогликемия, неонатальная желтуха, неонатальный сепсис (high burden, ресурс-лимитированные протоколы), KMC (kangaroo mother care), роль ANM / ASHA. Facility-Based Newborn Care (FBNC) + Home-Based Newborn Care (HBNC).',
      },
      respiratory: {
        name: 'Респираторная',
        body: 'IAP Respiratory Chapter',
        details: 'Childhood asthma (adapted GINA), бронхиолит (RSV high burden), pneumonia (WHO IMCI + Indian data), pollution-related respiratory disease (Delhi, Mumbai), SAM + pneumonia (high mortality).',
      },
      emergency: {
        name: 'Неотложная педиатрия',
        body: 'IAP-PIP — Protocols in Pediatrics',
        details: 'IAP-PIP — карманный protocol book (ежегодное обновление): SAM, sepsis, shock, status epilepticus, DKA, snake bite (high burden), drowning, poisoning. PALS-India adapted. Ориентация на district hospital / resource-limited ресурсы.',
      },
    };
    const e = map[t];
    return {
      value: e.name,
      unit: 'IAP India',
      color: '#6B7280',
      interpretation: `Navigate: IAP ${e.name}`,
      details: `Тема: ${e.name}\n\nОрган: ${e.body}\n\n${e.details}\n\nКонтекст Индии: публичный сектор (UIP, RBSK, JSSK, NHM) + частный (IAP рекомендации). 1.4 млрд населения, 26 млн рождений/год. Высокий burden стунтинга, анемии, неонатальной смертности.`,
      actions: [
        'IAP portal: https://iapindia.org/',
        'IAP Immunization Schedule: https://iapindia.org/acvip/',
        'IAP Growth Charts: https://iapindia.org/growth-charts/',
        'NNF India: https://nnfi.org/',
        'MoHFW (Ministry of Health): https://www.mohfw.gov.in/',
        'NHM (National Health Mission): https://nhm.gov.in/',
        'IAP-PIP book (печатное издание + digital)',
        'RBSK / JSSK / POSHAN — государственные программы',
      ],
      caveats: [
        'Документы на английском (медицина Индии англоязычная)',
        'IAP schedule ≠ UIP (Universal Immunization Programme) — IAP расширенный, UIP базовый (бесплатный)',
        'Использовать IAP Growth Charts для 5-18 лет; WHO Child Growth Standards для <5 лет',
        'Ресурс-ограниченные настройки: district hospital vs tertiary; адаптировать протоколы',
        'Высокая распространённость туберкулёза, денге, малярии, ЧВК — учитывать в дифференциальной диагностике',
        'SAM + infection — очень высокая летальность без ранней ресусцитации',
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

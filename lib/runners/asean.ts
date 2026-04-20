// @ts-nocheck
/** Runner: asean — ASEAN clinical guidelines coordination */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Юго-Восточная Азия (ASEAN): Сингапур, Малайзия, Таиланд, Индонезия, Филиппины, Вьетнам, Мьянма, Камбоджа, Лаос, Бруней',
  reference: 'ASEAN (Association of Southeast Asian Nations) + национальные MoH: Singapore MOH, Malaysia MoH (KKM / MyHealth), Thailand MoPH, Indonesian MoH / PDPI, DOH Philippines, Vietnam MoH. https://asean.org/our-communities/asean-socio-cultural-community/health/',
  inputs: [
    {
      id: 'country',
      label: 'Страна',
      type: 'select',
      options: [
        { value: 'sg', label: 'Сингапур (MOH CPGs, AMS)' },
        { value: 'my', label: 'Малайзия (KKM / MyHealth / CPGs)' },
        { value: 'th', label: 'Таиланд (MoPH / Royal Colleges)' },
        { value: 'id', label: 'Индонезия (Kemenkes / PDPI / PERKI)' },
        { value: 'ph', label: 'Филиппины (DOH / PCP / PHA)' },
        { value: 'vn', label: 'Вьетнам (MoH / VNAH)' },
        { value: 'asean', label: 'ASEAN-level (региональные инициативы)' },
      ],
    },
  ],
  presets: [
    { label: 'Singapore MOH CPGs', values: { country: 'sg' } },
    { label: 'Malaysia CPGs', values: { country: 'my' } },
    { label: 'Thailand', values: { country: 'th' } },
  ],
  compute: (v) => {
    const c = String(v.country || 'sg');
    const map: Record<string, { name: string; main: string; url: string; details: string }> = {
      sg: {
        name: 'Сингапур',
        main: 'MOH (Ministry of Health) Clinical Practice Guidelines + AMS (Academy of Medicine Singapore) + College of Family Physicians',
        url: 'https://www.moh.gov.sg/hpp/all-healthcare-professionals/guidelines',
        details: 'MOH публикует CPGs по ключевым нозологиям (diabetes, hypertension, lipids, asthma, stroke, depression). Высокое методологическое качество. AMS — специализированные консенсусы. HealthHub (для пациентов). Лекарственные справочники: Singapore HSA, pharmaceutical formulary.',
      },
      my: {
        name: 'Малайзия',
        main: 'KKM (Kementerian Kesihatan Malaysia) + MyHealth Portal + CPG Secretariat',
        url: 'https://www.moh.gov.my/index.php/pages/view/195',
        details: 'MoH Malaysia (KKM) CPGs — более 60 актуальных guidelines. Вторичные порталы: MyHealth (для населения), Malaysian Medical Council. Академические общества: AMM (Academy of Medicine Malaysia), NHAM (cardiology), MTS (thoracic), MEMS (endocrine).',
      },
      th: {
        name: 'Таиланд',
        main: 'MoPH (Ministry of Public Health) + Royal Colleges (RCPT, RCST, RCOG-Thailand, RCP-Thailand)',
        url: 'https://www.moph.go.th/',
        details: 'Royal Colleges публикуют специализированные гайдлайны (Royal College of Physicians of Thailand — RCPT; Royal College of Surgeons of Thailand — RCST; и т.д.). National Health Security Office (NHSO) — universal health coverage (UCS). Thai FDA регулирует лекарства.',
      },
      id: {
        name: 'Индонезия',
        main: 'Kemenkes (Kementerian Kesehatan) + ИДИ (IDI Indonesia) + специализированные PERKI (кардио), PDPI (pulmonary), PERKENI (эндокринология)',
        url: 'https://www.kemkes.go.id/',
        details: 'Крупнейшая страна ASEAN (~280 млн). JKN-BPJS — universal health insurance. Kemenkes публикует PNPK (Pedoman Nasional Pelayanan Kedokteran) — национальные клинические протоколы. Специализированные общества: PERKI (кардио), PDPI (пульмо), PERKENI (эндо), PABI (хирургия).',
      },
      ph: {
        name: 'Филиппины',
        main: 'DOH (Department of Health) + PCP (Philippine College of Physicians) + PHA (Philippine Heart Association) + PPS (Pediatric Society)',
        url: 'https://doh.gov.ph/',
        details: 'DOH публикует National Practice Guidelines. PhilHealth — обязательное медстрахование. Специализированные общества: PHA (cardio), PPS (pediatrics), POGS (obgyn). Английский — официальный клинический язык.',
      },
      vn: {
        name: 'Вьетнам',
        main: 'MoH Vietnam + VNAH + специализированные общества',
        url: 'https://moh.gov.vn/',
        details: 'MoH публикует quốc gia (национальные) протоколы. VNAH (Vietnam National Association of Hospitals). Социальное медицинское страхование через VSS. Быстрый рост частного сектора.',
      },
      asean: {
        name: 'ASEAN-level',
        main: 'ASEAN Health Cluster (AHC) — координация между 10 странами',
        url: 'https://asean.org/our-communities/asean-socio-cultural-community/health/',
        details: 'ASEAN Post-2025 Health Development Agenda. AHC1 (Promoting Healthy Lifestyle), AHC2 (Communicable Diseases), AHC3 (Healthcare Financing), AHC4 (Food Safety). COVID response — ASEAN Emergency Public Health System. ASEAN MRA на Medical Practitioners, Dental, Nursing — взаимное признание квалификаций.',
      },
    };
    const e = map[c];
    return {
      value: e.name,
      unit: 'ASEAN',
      color: '#6B7280',
      interpretation: `Navigate: ${e.name} — ${e.main.split(' + ')[0]}`,
      details: `**Страна:** ${e.name}\n\n**Основной орган:** ${e.main}\n\n**Портал:** ${e.url}\n\n${e.details}`,
      actions: [
        `Основной портал: ${e.url}`,
        'Singapore MOH: https://www.moh.gov.sg/',
        'Malaysia MoH: https://www.moh.gov.my/',
        'Thailand MoPH: https://www.moph.go.th/',
        'Indonesia Kemenkes: https://www.kemkes.go.id/',
        'Philippines DOH: https://doh.gov.ph/',
        'Vietnam MoH: https://moh.gov.vn/',
        'ASEAN Health Cluster: https://asean.org/our-communities/asean-socio-cultural-community/health/',
      ],
      caveats: [
        'Разные уровни развития здравоохранения в регионе: Singapore — высокий доход, Cambodia/Laos/Myanmar — низкий',
        'Языки: Bahasa (ID/MY), Thai, Vietnamese, Filipino/English; Singapore/Philippines — клинический язык English',
        'Высокая эндемичность: dengue, TB, malaria (отдельные регионы), melioidosis, leptospirosis',
        'Universal coverage schemes: JKN-BPJS (ID), UCS (TH), PhilHealth (PH), MediShield (SG)',
        'Региональная фармакогенетика (HLA-B*15:02 — carbamazepine SJS в южно-азиатских популяциях)',
        'Локальные формулярии — всегда проверять доступность',
      ],
      related: [
        { id: 'china', title: 'China (CMA)' },
        { id: 'iap', title: 'IAP (India)' },
        { id: 'etg', title: 'eTG (Australia)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по системам клинических стандартов 10 стран ASEAN. Регион с высокой гетерогенностью: от Singapore (high-income, world-class) до Myanmar/Laos/Cambodia (низкий доход, ресурс-ограниченные).

### Страны ASEAN
| Код | Страна | Язык(и) |
|-----|--------|---------|
| SG | Сингапур | English |
| MY | Малайзия | Bahasa Malaysia, English |
| TH | Таиланд | Тайский |
| ID | Индонезия | Bahasa Indonesia |
| PH | Филиппины | Filipino, English |
| VN | Вьетнам | Vietnamese |
| MM | Мьянма | Бирманский |
| KH | Камбоджа | Кхмерский |
| LA | Лаос | Лаосский |
| BN | Бруней | Bahasa Melayu, English |

### Региональные инициативы
- **ASEAN Health Cluster** (AHC1-4)
- **ASEAN MRA** — взаимное признание медицинских квалификаций
- **ASEAN Emergency Public Health System**
- **ASEAN Post-2025 Health Agenda**

### Эндемические угрозы
- Dengue (все страны)
- TB (высокая burden в PH, ID, MM, VN)
- Malaria (endemic в частях TH, MM, LA, KH, ID)
- Melioidosis (TH, MY, северная AUS)
- HLA-B*15:02 — SJS с карбамазепином (Han Chinese, Thai, Malay)

### Источники
- https://asean.org/our-communities/asean-socio-cultural-community/health/`,
};
export default runner;

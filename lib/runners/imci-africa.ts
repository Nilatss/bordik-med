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
    const countryNames: Record<string, string> = {
      nigeria: 'Нигерия',
      ethiopia: 'Эфиопия',
      kenya: 'Кения',
      tanzania: 'Танзания',
      uganda: 'Уганда',
      ghana: 'Гана',
      drc: 'ДР Конго',
      southafrica: 'ЮАР',
      afro: 'WHO AFRO регион',
    };
    return {
      value: `IMCI — ${countryNames[c]}`,
      unit: 'WHO/UNICEF IMCI',
      color: '#6B7280',
      interpretation: `Navigate: IMCI ${countryNames[c]} (${ag})`,
      details: `**Страна:** ${countryNames[c]}\n\n**Возрастная группа:** ${ag === 'newborn' ? '0-7 дней (Newborn)' : ag === 'young' ? '1 нед - 2 мес (Young Infant)' : '2 мес - 5 лет (Child)'}\n\n${ageDetails[ag]}\n\n**IMCI workflow:**\n1. **Assess** — check general danger signs → main symptoms → nutrition → HIV status → immunisation\n2. **Classify** — светофор: RED (refer urgently), YELLOW (treat at health centre), GREEN (home care)\n3. **Identify treatment**\n4. **Treat** — first dose before referral if needed\n5. **Counsel mother** — home care, when to return, feeding\n6. **Follow-up**\n\nНациональная адаптация IMCI каждой страной учитывает: локальную этиологию малярии (P. falciparum vs P. vivax), HIV bagrount (high в Южной Африке), антибиотики first-line (resistance patterns), доступные лекарства (government formulary).`,
      actions: [
        'WHO IMCI: https://www.who.int/maternal_child_adolescent/topics/child/imci/',
        'IMCI chart booklets (страна-специфичные) — обычно доступны на сайте национального MoH',
        'Nigeria FMoH: https://www.health.gov.ng/',
        'Ethiopia MoH: https://www.moh.gov.et/',
        'Kenya MoH: https://www.health.go.ke/',
        'Tanzania MoH: https://www.moh.go.tz/',
        'South Africa NDoH: https://www.health.gov.za/',
        'WHO AFRO: https://www.afro.who.int/',
        'WHO Pocket Book of Hospital Care for Children (2nd ed.) — референс для secondary care',
      ],
      caveats: [
        'Документы на английском / французском (Francophone Africa: Senegal, Côte d\'Ivoire, Cameroon, DRC partial, ...) / португальском (Angola, Mozambique)',
        'IMCI — протокол первичного звена (health centre level); не замена specialist care',
        'Caveat: multiple studies показали, что IMCI имеет ограничения для новых угроз (severe pneumonia с пульсоксиметрией, SAM с amoxicillin)',
        'Адаптация к локальной эпидемиологии: malaria endemic vs non-endemic, HIV high prevalence, МАS burden',
        'IMNCI (India), AIEPI (LAC), IMCI (Africa) — варианты одной программы',
        'Обновления: WHO пересматривает chart booklets ~каждые 5-7 лет',
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

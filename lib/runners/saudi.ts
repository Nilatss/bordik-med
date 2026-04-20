// @ts-nocheck
/** Runner: saudi — Saudi Arabia MoH + SCFHS */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Саудовская Аравия (также референс в ряде стран GCC — ОАЭ, Кувейт, Бахрейн, Оман, Катар)',
  reference: 'Saudi Ministry of Health (MoH) + SCFHS — Saudi Commission for Health Specialties + Saudi FDA + специализированные общества (Saudi Heart Association — SHA, Saudi Diabetes Society — SDES). https://www.moh.gov.sa, https://www.scfhs.org.sa',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность / домен',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary care (PHC — Seha / MOH PHC manuals)' },
        { value: 'cardio', label: 'Cardiology (SHA — Saudi Heart Association)' },
        { value: 'diabetes', label: 'Diabetes / endocrinology (SDES)' },
        { value: 'onko', label: 'Oncology (SOS — Saudi Oncology Society)' },
        { value: 'maternal', label: 'Maternal / child health (SSOG, SPS)' },
        { value: 'hajj', label: 'Hajj / mass gatherings health' },
        { value: 'scfhs', label: 'SCFHS — Saudi Commission (certification, CPD, guidelines)' },
        { value: 'drugs', label: 'Лекарства (Saudi FDA — SFDA)' },
      ],
    },
  ],
  presets: [
    { label: 'Primary care (MoH)', values: { specialty: 'primary' } },
    { label: 'SCFHS — сертификация', values: { specialty: 'scfhs' } },
    { label: 'Hajj health', values: { specialty: 'hajj' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'primary');
    const map: Record<string, { name: string; body: string; details: string }> = {
      primary: { name: 'Primary care', body: 'MoH Saudi — PHC (Primary Health Care) centres + Seha Virtual Hospital + Vision 2030 health transformation', details: 'MoH публикует PHC Clinical Guidelines — стандартизированные протоколы для family medicine. Vision 2030 Health Sector Transformation: переход от MoH-центричной к model based on Health Holding Companies (HHCs) + sectors / clusters. National Program for Healthy Living.' },
      cardio: { name: 'Cardiology', body: 'SHA — Saudi Heart Association', details: 'SHA consensus — локальная адаптация ESC/ACC guidelines с учётом саудовских особенностей: ранний дебют ИБС, высокая распространённость diabetes, familial hypercholesterolemia (founder effects в некоторых семьях), консангвиновые браки → наследственные кардиомиопатии.' },
      diabetes: { name: 'Diabetes / endocrinology', body: 'SDES — Saudi Diabetes & Endocrine Society', details: 'Saudi Guidelines for Management of Diabetes. Очень высокая распространённость DM2 (~18-25% взрослых — одна из высочайших в мире). Рамадан fasting guidelines — международно важный документ (IDF-DAR + SDES). Obesity — ~35-40%.' },
      onko: { name: 'Oncology', body: 'SOS — Saudi Oncology Society + KFSH&RC (King Faisal Specialist Hospital)', details: 'Saudi Cancer Registry. Специфика: высокая частота рака щитовидной железы у женщин, колоректального, молочной железы, NHL. KFSH&RC — ведущий tertiary cancer centre региона.' },
      maternal: { name: 'Maternal / child', body: 'SSOG — Saudi Society of Obstetrics & Gynecology + SPS — Saudi Pediatric Society', details: 'Premarital screening mandatory (HbS, thalassemia). Национальный прививочный календарь (включая доп. вакцины перед Hajj: quadrivalent meningococcal, seasonal influenza). Genetic disorders — высокая распространённость из-за консангвиновых браков.' },
      hajj: { name: 'Hajj / mass gatherings', body: 'MoH Hajj Directorate + WHO Collaborating Centre for Mass Gatherings Medicine', details: '**Hajj health requirements** — ежегодные обновления (meningococcal ACWY vaccine мандаторна, yellow fever для endemic countries, polio для полиомиелит-endemic). **Heat-related illness** (>45°C), **MERS-CoV** surveillance, **respiratory infections**. Уникальный домен — масштаб 2-3 млн паломников / сезон.' },
      scfhs: { name: 'SCFHS — сертификация', body: 'Saudi Commission for Health Specialties', details: 'SCFHS регулирует: медицинское образование (Saudi Board programs, эквивалент резидентуры), регистрацию иностранных врачей (Prometric + Data Flow verification), CPD points, professional classification, лицензирование. Единый регистр всех health practitioners в KSA.' },
      drugs: { name: 'Лекарства', body: 'Saudi FDA (SFDA)', details: 'SFDA регулирует лекарства, медизделия, космецевтику, пищу. Регистрация + pharmacovigilance + GMP inspections. SFDA drug list, formulary для NUPCO (National Unified Procurement Company). Реимбурсация: государственные учреждения vs CCHI (Council of Cooperative Health Insurance) для частного сектора.' },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'Saudi Arabia',
      color: '#6B7280',
      interpretation: `Navigate: Saudi ${e.name}`,
      details: `**Домен:** ${e.name}\n\n**Орган:** ${e.body}\n\n${e.details}\n\n**Контекст KSA:** Vision 2030 Health Transformation — корпоратизация MoH, private-sector expansion, national health insurance (CCHI). Население ~35 млн (citizens ~60%, expatriates ~40%).`,
      actions: [
        'Saudi MoH: https://www.moh.gov.sa/',
        'SCFHS: https://www.scfhs.org.sa/',
        'Saudi FDA (SFDA): https://www.sfda.gov.sa/',
        'SHA (cardiology): https://saudi-heart.com/',
        'Seha Virtual Hospital: https://www.moh.gov.sa/en/eServices/SehaVirtual',
        'CCHI (health insurance): https://www.cchi.gov.sa/',
        'KFSH&RC (tertiary care): https://www.kfshrc.edu.sa/',
        'Hajj health requirements (ежегодное обновление на moh.gov.sa)',
      ],
      caveats: [
        'Документы на арабском + английском (английский широко используется в клинической практике)',
        'Vision 2030 — активная трансформация системы: MoH → Health Holding Companies + CCHI insurance',
        'Премаритальный скрининг обязателен (HbS, thalassemia) — релевантно генетическому консультированию',
        'Консангвиновые браки → высокая частота аутосомно-рецессивных заболеваний',
        'Hajj / Umrah health requirements — строгие прививки, санитарные',
        'GCC страны (ОАЭ, Кувейт, Катар, Бахрейн, Оман) — похожие системы, но собственные MoH и формуляры',
      ],
      related: [
        { id: 'paho', title: 'PAHO (reference for regional bodies)' },
        { id: 'china', title: 'China (CMA)' },
        { id: 'imci-africa', title: 'IMCI Africa' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по клиническим стандартам Саудовской Аравии — крупнейшей страны Залива (GCC) и исламского мира. MoH + SCFHS + SFDA + specialty societies.

### Ключевые органы
| Орган | Функция |
|-------|---------|
| **MoH** | Public health policy, PHC, tertiary hospitals (transitioning to HHCs) |
| **SCFHS** | Сертификация врачей, Saudi Board, CPD, регистрация |
| **SFDA** | Регулятор лекарств / медизделий / пищи |
| **CCHI** | Council of Cooperative Health Insurance (частная страховка) |
| **SHA / SDES / SOS / SSOG / SPS** | Specialty societies |

### Vision 2030
Трансформация системы здравоохранения:
- MoH → Health Holding Companies (HHCs) + regional clusters
- Private sector expansion
- Mandatory health insurance (citizens через CCHI)
- Digital health (Seha App, Sehhaty, Virtual Hospital)

### Уникальные домены
- **Hajj / Umrah health** — 2-3 млн паломников/год
- **Premarital screening** (HbS, thalassemia — mandatory)
- **Высокая распространённость DM2, obesity, FH**
- **Консангвиновые браки** → аутосомно-рецессивные генетические заболевания

### GCC контекст
Саудовские стандарты часто референс для UAE, Kuwait, Qatar, Bahrain, Oman.

### Источники
- https://www.moh.gov.sa/
- https://www.scfhs.org.sa/
- https://www.sfda.gov.sa/`,
};
export default runner;

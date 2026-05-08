/** Runner: smb-ch — SMB / Swissmedic / Swiss guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Швейцария (немецкий / французский / итальянский)',
  reference: 'Swissmedic (регулятор лекарств) + SMB Swiss Medical Board + FMH + specialty societies. https://www.swissmedic.ch, https://www.medical-board.ch, https://www.fmh.ch',
  inputs: [
    {
      id: 'topic',
      label: 'Тема / домен',
      type: 'select',
      options: [
        { value: 'drugs', label: 'Лекарства (Swissmedic / Compendium)' },
        { value: 'hta', label: 'HTA / технологии (SMB, BAG)' },
        { value: 'clinical', label: 'Клинические рекомендации (SGIM, SGK, SSMIG)' },
        { value: 'public', label: 'Общественное здоровье (BAG / OFSP)' },
      ],
    },
  ],
  presets: [
    { label: 'Лекарства (Compendium)', values: { topic: 'drugs' } },
    { label: 'Клинические рек. (SSMIG)', values: { topic: 'clinical' } },
    { label: 'HTA — SMB', values: { topic: 'hta' } },
  ],
  compute: (v) => {
    const t = String(v.topic || 'clinical');
    const map: Record<string, { name: string; body: string; access: string; examples: string; actions: string[]; caveats: string[] }> = {
      drugs: {
        name: 'Лекарственные средства',
        body: 'Swissmedic (regulator) + Compendium.ch (Arzneimittelkompendium — швейцарский аналог Vidal/Rote Liste)',
        access: 'swissmedic.ch — регистрации, отзывы, PSUR; compendium.ch — Fachinformation (SmPC) + Patienteninformation на DE/FR/IT; бесплатный доступ после регистрации профессионала',
        examples: 'Spezialitätenliste (SL) — список реимбурсируемых БАГ препаратов; OKP (Obligatorische Krankenpflegeversicherung) покрытие',
        actions: [
          'Swissmedic: https://www.swissmedic.ch/',
          'Compendium.ch: https://compendium.ch/',
          'Spezialitätenliste (BAG): https://www.spezialitaetenliste.ch/',
          'MedDRA / Swissmedic Rx regulations: https://www.swissmedic.ch/swissmedic/en/home.html',
        ],
        caveats: [
          'Off-label — возможен через Art. 71a-d KVV (case-by-case approval)',
          'Benefiting from SL = в списке BAG Spezialitätenliste с ценой и дозировкой',
          'Generic substitution — pharmacist разрешено если врач не запретил',
          'Swissmedic ≠ EMA — независимая регистрация (часто с задержкой 3–12 мес)',
        ],
      },
      hta: {
        name: 'Health Technology Assessment',
        body: 'SMB — Swiss Medical Board (независимая оценка); BAG — Bundesamt für Gesundheit (OFSP); FOPH',
        access: 'medical-board.ch — отчёты HTA с рекомендациями; BAG публикует оценки для SL (Spezialitätenliste) — criteria: wirksam/zweckmässig/wirtschaftlich (WZW)',
        examples: 'Обзоры SMB: скрининг PSA, mammography, screening колоректальный рак, vitamin D, bariatric surgery',
        actions: [
          'SMB (medical-board.ch): https://www.medical-board.ch/',
          'BAG HTA programme: https://www.bag.admin.ch/bag/en/home/versicherungen/krankenversicherung/krankenversicherung-bezeichnung-der-leistungen/hta.html',
          'BAG consultations на новые technologies',
          'SAMW (Swiss Academy of Medical Sciences): https://www.samw.ch/',
        ],
        caveats: [
          'WZW — обязательный триас (wirksam / zweckmässig / wirtschaftlich)',
          'SMB — независимое; его рекомендации не обязательны для BAG',
          'HTA отчёты — основа для inclusion/exclusion в SL',
          'Список процедур OKP-coverage публикуется в KLV Anhang 1',
        ],
      },
      clinical: {
        name: 'Клинические рекомендации',
        body: 'SSMIG — Société Suisse de Médecine Interne Générale; SGK — Kardiologie; SGG — Gynäkologie; SGP — Pädiatrie; SGED — Endokrinologie/Diabetes; SGR — Rheumatologie; и др.',
        access: 'Швейцария часто адаптирует европейские гайдлайны (ESC, EASD, EASL). Собственные: SGED consensus for Diabetes; SGK position papers; smartermedicine.ch — Choosing Wisely CH',
        examples: 'SGED consensus Diabetes Typ 2 (швейцарская адаптация ADA/EASD); SGK Herzinsuffizienz (адаптация ESC); Empfehlungen SGP impfplan (совместно с EKIF / BAG)',
        actions: [
          'SSMIG (SGAIM): https://www.sgaim.ch/',
          'SGED (Diabetes): https://www.sgedssed.ch/',
          'SGK (Kardiologie): https://www.swisscardio.ch/',
          'Smarter Medicine Switzerland: https://www.smartermedicine.ch/',
          'SGP (Pädiatrie): https://www.paediatrieschweiz.ch/',
        ],
        caveats: [
          'SGED consensus — швейцарская версия ADA/EASD, ежегодное обновление',
          'SGK часто адаптирует ESC с 6-12 мес задержкой',
          'Smarter Medicine — Top 5 "do not do" по специальностям',
          'Кантональные differences — особенно в psychiatry и palliative',
        ],
      },
      public: {
        name: 'Общественное здоровье / профилактика',
        body: 'BAG (Bundesamt für Gesundheit) / OFSP (Office fédéral de la santé publique)',
        access: 'bag.admin.ch — национальный план прививок (Schweizerischer Impfplan), скрининговые программы (раки, неонатальный скрининг), политика',
        examples: 'Schweizerischer Impfplan (annual), Screening-Empfehlungen Mammographie, Früherkennung Darmkrebs',
        actions: [
          'BAG / OFSP: https://www.bag.admin.ch/',
          'Schweizerischer Impfplan: https://www.bag.admin.ch/bag/de/home/gesund-leben/gesundheitsfoerderung-und-praevention/impfungen-prophylaxe/schweizerischer-impfplan.html',
          'EKIF (Eidgenössische Kommission für Impffragen)',
          'Krebsregister Schweiz: https://www.nicer.org/',
        ],
        caveats: [
          'Impfplan — обновляется ежегодно (январь), EKIF + BAG',
          'Mammography screening — кантональные программы (не национальная), 50–69 лет',
          'Colorectal screening: FIT или колоноскопия 50–69, покрывается OKP',
          'Newborn screening — 9 заболеваний (CF, ...) + hearing',
        ],
      },
    };
    const e = map[t]!;
    return {
      value: e.name,
      unit: 'Switzerland',
      color: '#6B7280',
      interpretation: `Navigate: Swiss ${e.name}`,
      details: `Домен: ${e.name}\n\nОрган: ${e.body}\n\nДоступ: ${e.access}\n\nПримеры: ${e.examples}`,
      actions: [
        ...e.actions,
        '— Общие источники Schweiz —',
        'Swissmedic: https://www.swissmedic.ch/',
        'BAG / OFSP: https://www.bag.admin.ch/',
        'Compendium: https://compendium.ch/',
        'FMH: https://www.fmh.ch/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Швейцарии —',
        'Три официальных языка: DE / FR / IT — документы часто только на одном',
        'WZW (wirksam/zweckmässig/wirtschaftlich) — основа для реимбурсирования',
        'Кантональные различия в организации здравоохранения',
      ],
      related: [
        { id: 'awmf-de', title: 'AWMF (Germany)' },
        { id: 'has-fr', title: 'HAS (France)' },
        { id: 'nice-uk', title: 'NICE (UK)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по клиническим стандартам Швейцарии. Швейцария — федеративная страна с 26 кантонами, три языка, уникальная система OKP (обязательное страхование), регулятор — **Swissmedic** (независимый, не ЕС/не EMA).

### Ключевые игроки
- **Swissmedic** — регистрация лекарств и медизделий
- **BAG / OFSP** — политика, страхование, прививки, скрининг
- **SMB (Swiss Medical Board)** — независимый HTA
- **FMH** — профсоюз врачей + CME
- **Specialty societies** (SSMIG, SGK, SGG, SGP, SGED...) — клинические рекомендации (часто адаптация европейских)
- **Compendium.ch** — единая БД лекарств (Fachinformation)

### Критерий WZW
Любой препарат/процедура должны быть:
- **W**irksam — эффективны
- **Z**weckmässig — целесообразны
- **W**irtschaftlich — экономически оправданы

### Источники
- https://www.swissmedic.ch/
- https://www.bag.admin.ch/
- https://www.medical-board.ch/
- https://compendium.ch/`,
};
export default runner;

// @ts-nocheck
/** Runner: nordic — Nordic countries clinical guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Скандинавия: Дания / Норвегия / Швеция / Финляндия / Исландия',
  reference: 'Национальные системы гайдлайнов: Lægehåndbogen (DK), Legehåndboka (NO), Praktisk Medicin + Internetmedicin (SE), Käypä hoito (FI).',
  inputs: [
    {
      id: 'country',
      label: 'Страна',
      type: 'select',
      options: [
        { value: 'dk', label: 'Дания (Lægehåndbogen, SST)' },
        { value: 'no', label: 'Норвегия (Legehåndboka, Helsedirektoratet)' },
        { value: 'se', label: 'Швеция (Internetmedicin, Socialstyrelsen, Praktisk Medicin)' },
        { value: 'fi', label: 'Финляндия (Käypä hoito, Duodecim)' },
        { value: 'is', label: 'Исландия (Landspítali, Heilsuvera)' },
      ],
    },
  ],
  presets: [
    { label: 'Финляндия — Käypä hoito', values: { country: 'fi' } },
    { label: 'Швеция — Internetmedicin', values: { country: 'se' } },
    { label: 'Дания — Lægehåndbogen', values: { country: 'dk' } },
  ],
  compute: (v) => {
    const c = String(v.country || 'fi');
    const map: Record<string, { name: string; main: string; url: string; lang: string; details: string; actions: string[]; caveats: string[] }> = {
      dk: {
        name: 'Дания',
        main: 'Lægehåndbogen (sundhed.dk) + Sundhedsstyrelsen (SST)',
        url: 'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/',
        lang: 'Датский',
        details: 'Lægehåndbogen — основной справочник для GP (praktiserende læge). SST — National Board of Health, публикует Nationale kliniske retningslinjer (NKR). Pro.medicin.dk — лекарственный справочник.',
        actions: [
          'Lægehåndbogen: https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/',
          'Sundhedsstyrelsen NKR: https://www.sst.dk/',
          'Pro.medicin.dk: https://pro.medicin.dk/',
          'Rationel Farmakoterapi (IRF): https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/',
        ],
        caveats: [
          'NKR — nationally binding clinical guidelines',
          'Regional differences в 5 regions (Hovedstaden, Sjælland, Syddanmark, Midtjylland, Nordjylland)',
          'Danish National Patient Registry — one of best in world',
          'Sundhed.dk — единая платформа EPJ для пациентов',
        ],
      },
      no: {
        name: 'Норвегия',
        main: 'Legehåndboka (NEL) + Helsedirektoratet Nasjonale faglige retningslinjer',
        url: 'https://legehandboka.no/',
        lang: 'Норвежский (bokmål/nynorsk)',
        details: 'Legehåndboka (NEL — Norsk Elektronisk Legehåndbok) — аналог датской Lægehåndbogen. Helsedirektoratet публикует обязательные национальные клинические протоколы. Felleskatalogen — лекарства.',
        actions: [
          'Legehåndboka (NEL): https://legehandboka.no/',
          'Helsedirektoratet retningslinjer: https://www.helsedirektoratet.no/retningslinjer',
          'Felleskatalogen: https://www.felleskatalogen.no/',
          'Helsebiblioteket: https://www.helsebiblioteket.no/',
        ],
        caveats: [
          'Fastlege (GP) — gatekeeper через HELFO registration',
          'Nasjonale faglige retningslinjer — обязательные',
          'Blåresept (blue prescription) — реимбурсация через HELFO',
          'Cardiovascular Disease Registry — качественный национальный регистр',
        ],
      },
      se: {
        name: 'Швеция',
        main: 'Internetmedicin + Socialstyrelsens Nationella riktlinjer + Praktisk Medicin + Läkemedelsboken',
        url: 'https://www.internetmedicin.se/',
        lang: 'Шведский',
        details: 'Internetmedicin — популярный электронный справочник для специалистов. Socialstyrelsen — национальные рекомендации (диабет, сердечные заболевания, рак, психическое здоровье). Praktisk Medicin — для GP. FASS — лекарственный справочник.',
        actions: [
          'Internetmedicin: https://www.internetmedicin.se/',
          'Socialstyrelsen Nationella riktlinjer: https://www.socialstyrelsen.se/',
          'FASS: https://www.fass.se/',
          'Läkemedelsboken: https://lakemedelsboken.se/',
          'Vårdhandboken: https://www.vardhandboken.se/',
        ],
        caveats: [
          '21 regions with independent healthcare organisation',
          'SKR (Sveriges Kommuner och Regioner) — coordinated quality improvement',
          'Swedish Heart Failure Registry / RiksSvikt — world-leading CHF registry',
          'Kloka Listan — regional essential drugs list (Stockholm)',
        ],
      },
      fi: {
        name: 'Финляндия',
        main: 'Käypä hoito -suositukset (Duodecim)',
        url: 'https://www.kaypahoito.fi/',
        lang: 'Финский + шведский + английские резюме',
        details: 'Käypä hoito (Current Care Guidelines) — одна из старейших и наиболее уважаемых систем гайдлайнов в мире (с 1994). Разработаны Suomalainen Lääkäriseura Duodecim. Каждое руководство: полная версия + carry card + patient version + английское резюме. Методология GRADE. ~100+ guidelines. Terveysportti — портал для профессионалов.',
        actions: [
          'Käypä hoito portal: https://www.kaypahoito.fi/',
          'Käypä hoito English summaries: https://www.kaypahoito.fi/en',
          'Terveysportti (professional): https://www.terveysportti.fi/',
          'Duodecim journal: https://www.duodecimlehti.fi/',
        ],
        caveats: [
          'GRADE методология строго соблюдается',
          'Английские резюме доступны для всех guidelines (uniquely в Nordic)',
          'Terveysportti требует подписки (покрывается работодателем обычно)',
          'Kela — национальное страхование, drug reimbursement lists',
        ],
      },
      is: {
        name: 'Исландия',
        main: 'Landspítali + Heilsuvera + Embætti landlæknis',
        url: 'https://www.landspitali.is/',
        lang: 'Исландский',
        details: 'Небольшая страна (~380 тыс.) — часто адаптация скандинавских/европейских гайдлайнов. Embætti landlæknis (Directorate of Health) публикует политики и скрининг-программы. Lyfjaskrá — лекарства.',
        actions: [
          'Landspítali (national hospital): https://www.landspitali.is/',
          'Embætti landlæknis: https://www.landlaeknir.is/',
          'Heilsuvera (patient portal): https://heilsuvera.is/',
          'Lyfjastofnun (drug agency): https://www.lyfjastofnun.is/',
        ],
        caveats: [
          'Единственная национальная больница (Landspítali в Reykjavík)',
          'deCODE Genetics data — unique genomic dataset для Iceland',
          'Прививки / скрининг по скандинавской адаптации',
          'Документы на исландском, ограниченные английские ресурсы',
        ],
      },
    };
    const e = map[c];
    return {
      value: e.main,
      unit: 'Nordic',
      color: '#6B7280',
      interpretation: `Navigate: ${e.name} — ${e.main.split(' + ')[0]}`,
      details: `Страна: ${e.name}\n\nОсновной ресурс: ${e.main}\n\nURL: ${e.url}\n\nЯзык: ${e.lang}\n\n${e.details}`,
      actions: [
        ...e.actions,
        '— Общие источники Nordic —',
        'Nordic Cochrane Centre: https://nordic.cochrane.org/',
        'Käypä hoito (FI): https://www.kaypahoito.fi/',
        'Internetmedicin (SE): https://www.internetmedicin.se/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Nordic —',
        'Документы на национальных языках; English summaries только у Käypä hoito',
        'Beveridge-модель — налоговое финансирование, universal coverage',
        'Национальные клинические регистры — сильная сторона региона',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'nhg', title: 'NHG (Netherlands)' },
        { id: 'awmf-de', title: 'AWMF (Germany)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по системам клинических рекомендаций 5 скандинавских стран. Все используют модель Beveridge (налоговое финансирование, universal coverage), но имеют собственные традиции EBM.

### Страны и ключевые ресурсы
| Страна | Основной ресурс | Для GP |
|--------|----------------|--------|
| **Финляндия** | Käypä hoito (Duodecim) | Terveysportti |
| **Швеция** | Internetmedicin, Socialstyrelsen | Praktisk Medicin |
| **Норвегия** | Helsedirektoratet NFR | Legehåndboka (NEL) |
| **Дания** | Sundhedsstyrelsen NKR | Lægehåndbogen |
| **Исландия** | Landspítali, Embætti landlæknis | — |

### Сильные стороны
- **Käypä hoito (FI)** — одна из старейших систем в мире (с 1994)
- **Nordic Cochrane Centre** — центр EBM Копенгаген
- **Регистры** (SE, DK, NO) — мировой лидер по национальным клиническим регистрам (Swedish Heart Failure Registry, Danish National Patient Registry, Norwegian Cardiovascular Disease Registry)

### Источники
- https://www.kaypahoito.fi/
- https://www.sundhed.dk/
- https://legehandboka.no/
- https://www.internetmedicin.se/`,
};
export default runner;

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
    const map: Record<string, { name: string; main: string; url: string; lang: string; details: string }> = {
      dk: {
        name: 'Дания',
        main: 'Lægehåndbogen (sundhed.dk) + Sundhedsstyrelsen (SST)',
        url: 'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/',
        lang: 'Датский',
        details: 'Lægehåndbogen — основной справочник для GP (praktiserende læge). SST — National Board of Health, публикует Nationale kliniske retningslinjer (NKR). Pro.medicin.dk — лекарственный справочник.',
      },
      no: {
        name: 'Норвегия',
        main: 'Legehåndboka (NEL) + Helsedirektoratet Nasjonale faglige retningslinjer',
        url: 'https://legehandboka.no/',
        lang: 'Норвежский (bokmål/nynorsk)',
        details: 'Legehåndboka (NEL — Norsk Elektronisk Legehåndbok) — аналог датской Lægehåndbogen. Helsedirektoratet публикует обязательные национальные клинические протоколы. Felleskatalogen — лекарства.',
      },
      se: {
        name: 'Швеция',
        main: 'Internetmedicin + Socialstyrelsens Nationella riktlinjer + Praktisk Medicin + Läkemedelsboken',
        url: 'https://www.internetmedicin.se/',
        lang: 'Шведский',
        details: 'Internetmedicin — популярный электронный справочник для специалистов. Socialstyrelsen — национальные рекомендации (диабет, сердечные заболевания, рак, психическое здоровье). Praktisk Medicin — для GP. FASS — лекарственный справочник.',
      },
      fi: {
        name: 'Финляндия',
        main: 'Käypä hoito -suositukset (Duodecim)',
        url: 'https://www.kaypahoito.fi/',
        lang: 'Финский + шведский + английские резюме',
        details: 'Käypä hoito (Current Care Guidelines) — одна из старейших и наиболее уважаемых систем гайдлайнов в мире (с 1994). Разработаны Suomalainen Lääkäriseura Duodecim. Каждое руководство: полная версия + carry card + patient version + английское резюме. Методология GRADE. ~100+ guidelines. Terveysportti — портал для профессионалов.',
      },
      is: {
        name: 'Исландия',
        main: 'Landspítali + Heilsuvera + Embætti landlæknis',
        url: 'https://www.landspitali.is/',
        lang: 'Исландский',
        details: 'Небольшая страна (~380 тыс.) — часто адаптация скандинавских/европейских гайдлайнов. Embætti landlæknis (Directorate of Health) публикует политики и скрининг-программы. Lyfjaskrá — лекарства.',
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
        `Основной портал: ${e.url}`,
        'Käypä hoito (FI): https://www.kaypahoito.fi/',
        'Lægehåndbogen (DK): https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/',
        'Legehåndboka (NO): https://legehandboka.no/',
        'Internetmedicin (SE): https://www.internetmedicin.se/',
        'Socialstyrelsen (SE): https://www.socialstyrelsen.se/',
        'Helsedirektoratet (NO): https://www.helsedirektoratet.no/',
        'Sundhedsstyrelsen (DK): https://www.sst.dk/',
      ],
      caveats: [
        'Основной язык документов — национальный; английские резюме только у Käypä hoito (FI) и некоторых SE/NO guidelines',
        'Системы здравоохранения Beveridge-модели (налоговое финансирование) — принципы похожи, но организационно разные',
        'Лекарственные справочники: pro.medicin.dk (DK), Felleskatalogen (NO), FASS (SE), Terveysportti Lääkkeet (FI)',
        'Скандинавские страны часто пионеры в скрининге (раки, неонатальный)',
        'Nordic Cochrane Centre (Копенгаген) — сильная EBM-традиция региона',
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

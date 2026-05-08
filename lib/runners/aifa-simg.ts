/** Runner: aifa-simg — AIFA + SIMG (Italy) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Италия',
  reference: 'AIFA — Agenzia Italiana del Farmaco; SIMG — Società Italiana di Medicina Generale e delle Cure Primarie; ISS — Istituto Superiore di Sanità (SNLG). https://www.aifa.gov.it, https://www.simg.it, https://snlg.iss.it',
  inputs: [
    {
      id: 'domain',
      label: 'Домен',
      type: 'select',
      options: [
        { value: 'drugs', label: 'Лекарства (AIFA, Note AIFA)' },
        { value: 'gp', label: 'Общая практика (SIMG)' },
        { value: 'national', label: 'Национальные гайдлайны (SNLG-ISS)' },
        { value: 'specialty', label: 'Специализированные (SIC, AIOM, SID, SIN...)' },
      ],
    },
  ],
  presets: [
    { label: 'AIFA — Note', values: { domain: 'drugs' } },
    { label: 'SIMG — общая практика', values: { domain: 'gp' } },
    { label: 'SNLG — национальные', values: { domain: 'national' } },
  ],
  compute: (v) => {
    const d = String(v.domain || 'gp');
    const map: Record<string, { name: string; body: string; details: string; actions: string[]; caveats: string[] }> = {
      drugs: {
        name: 'Лекарства — AIFA',
        body: 'Agenzia Italiana del Farmaco',
        details: 'Note AIFA — обязательные условия назначения рецептурных препаратов за счёт SSN (Servizio Sanitario Nazionale). Пример: Nota 13 (статины — критерии), Nota 74 (гормоны роста), Nota 79 (бисфосфонаты). Fasce di rimborsabilità: A (полное покрытие SSN), C (пациент полностью оплачивает), H (только стационар). Registri AIFA — мониторинг дорогих препаратов (онко, биологика, редкие болезни).',
        actions: [
          'AIFA Note (полный список): https://www.aifa.gov.it/note-aifa',
          'Lista di Trasparenza AIFA (генерики + оригиналы): https://www.aifa.gov.it/liste-di-trasparenza',
          'Registri AIFA (онко/биологика/редкие): https://www.aifa.gov.it/registri-farmaci-sottoposti-a-monitoraggio',
          'Farmaci innovativi — списки: https://www.aifa.gov.it/farmaci-innovativi',
        ],
        caveats: [
          'Nota 13 — статины для SSN только при определённом CV-риске (SCORE) или после события',
          'Fascia C = пациент платит 100% (не реимбурсируется)',
          'Off-label без Nota = ответственность врача + полная оплата пациентом',
          'Legge 648/1996 — путь off-label использования через регистрацию AIFA',
        ],
      },
      gp: {
        name: 'Общая практика — SIMG',
        body: 'Società Italiana di Medicina Generale',
        details: 'SIMG — ведущее общество врачей общей практики (MMG — medico di medicina generale). Документы: clinical governance, percorsi diagnostico-terapeutici (PDTA), Health Search (национальная БД GP). Примеры: PDTA diabete, PDTA BPCO, PDTA scompenso cardiaco — региональная адаптация к AUSL/ASL.',
        actions: [
          'SIMG portal: https://www.simg.it/',
          'Health Search (IQVIA): https://www.healthsearch.it/',
          'SIMG Rivista (журнал SIMG)',
          'Manuale SIMG per il MMG (онлайн + печатный)',
        ],
        caveats: [
          'PDTA — региональные, Lombardia/Veneto/ER имеют собственные варианты',
          'MMG оплачивается капитационно (SSN) — квота пациентов ≤ 1500',
          'Accordo Collettivo Nazionale (ACN) — трудовой контракт MMG, обновления каждые 3 года',
          'Certificati malattia — обязательна электронная передача (INPS)',
        ],
      },
      national: {
        name: 'SNLG — Sistema Nazionale Linee Guida',
        body: 'ISS (Istituto Superiore di Sanità) — с 2017 по legge Gelli-Bianco',
        details: 'SNLG (snlg.iss.it) — официальный национальный реестр линее-гида (Law 24/2017 — Gelli-Bianco). Линии-гида одобренные SNLG имеют юридическую защиту для врачей (safe harbour от медицинских претензий). Методология GRADE. Примеры: linee guida per la gestione del paziente con COVID-19, prevenzione TEV, screening oncologici.',
        actions: [
          'SNLG-ISS portal: https://snlg.iss.it/',
          'Legge 24/2017 (Gelli-Bianco) — текст закона: https://www.gazzettaufficiale.it/',
          'ISS — Istituto Superiore di Sanità: https://www.iss.it/',
          'CNEC (Centro Nazionale Eccellenza Clinica): https://www.iss.it/cnec',
        ],
        caveats: [
          'Только линии-гида одобренные CNEC/SNLG дают правовую защиту врачу',
          'GRADE обязательна как методологический стандарт',
          '"Buone pratiche clinico-assistenziali" — альтернативный путь при отсутствии LG',
          'Обновления LG — минимум каждые 3 года',
        ],
      },
      specialty: {
        name: 'Специализированные общества',
        body: 'SIC (Cardiologia), AIOM (Oncologia medica), SID (Diabetologia), SIN (Nefrologia), SIP (Pediatria), SIGO (Ginecologia)',
        details: 'AIOM — linee guida oncologiche annuali (высокое качество GRADE, доступны бесплатно на aiom.it); SID — standard italiani cura diabete; SIC — адаптация ESC; SIN — nefrologia; SIP — pediatria (lattante, bambino, adolescente).',
        actions: [
          'AIOM LG oncologiche: https://www.aiom.it/linee-guida-aiom/',
          'SID Standard italiani cura diabete: https://www.siditalia.it/',
          'SIC portal: https://www.sicardiologia.it/',
          'SIP pediatria: https://sip.it/',
          'SIGO ginecologia: https://www.sigo.it/',
        ],
        caveats: [
          'AIOM LG ежегодно обновляются (осенний конгресс AIOM)',
          'SIC обычно адаптирует ESC — но с Note AIFA учитывать отличия',
          'SID Standard — совместно с AMD (diabete), бесплатный PDF',
          'SIP — ежегодный консенсус по вакцинации (совместно с FIMP)',
        ],
      },
    };
    const e = map[d]!;
    return {
      value: e.name,
      unit: 'Italia',
      color: '#6B7280',
      interpretation: `Navigate: Italian ${e.name}`,
      details: `Домен: ${e.name}\n\nОрган: ${e.body}\n\n${e.details}`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'AIFA: https://www.aifa.gov.it/',
        'SNLG-ISS: https://snlg.iss.it/',
        'Ministero della Salute: https://www.salute.gov.it/',
        'SIMG: https://www.simg.it/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Италии —',
        'Документы на итальянском (английские резюме редко)',
        'Региональные различия: Lombardia, Veneto, ER — собственные protocolli aziendali',
        'Legge Gelli-Bianco (2017) — safe harbour при соблюдении LG SNLG',
      ],
      related: [
        { id: 'has-fr', title: 'HAS (France)' },
        { id: 'awmf-de', title: 'AWMF (Germany)' },
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'esc-eu', title: 'ESC (European Cardiology)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Система клинических стандартов Италии: три столпа — **AIFA** (лекарства), **SIMG** (общая практика), **SNLG-ISS** (национальные гайдлайны) + специализированные общества.

### Note AIFA
Юридически обязательные критерии назначения ряда препаратов за счёт SSN. Невыполнение — пациент платит сам.

### Fasce di rimborsabilità
| Класс | Покрытие SSN |
|-------|--------------|
| **A** | Полное (ticket — номинальный) |
| **C** | Пациент оплачивает 100% |
| **H** | Только стационар / специалист |

### Legge Gelli-Bianco (Legge 24/2017)
Гайдлайны, одобренные SNLG-ISS, защищают врача от медицинских претензий при их соблюдении.

### Источники
- https://www.aifa.gov.it/
- https://www.simg.it/
- https://snlg.iss.it/
- https://www.aiom.it/`,
};
export default runner;

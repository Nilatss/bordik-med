// @ts-nocheck
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
    const map: Record<string, { name: string; body: string; details: string }> = {
      drugs: {
        name: 'Лекарства — AIFA',
        body: 'Agenzia Italiana del Farmaco',
        details: 'Note AIFA — обязательные условия назначения рецептурных препаратов за счёт SSN (Servizio Sanitario Nazionale). Пример: Nota 13 (статины — критерии), Nota 74 (гормоны роста), Nota 79 (бисфосфонаты). Fasce di rimborsabilità: A (полное покрытие SSN), C (пациент полностью оплачивает), H (только стационар). Registri AIFA — мониторинг дорогих препаратов (онко, биологика, редкие болезни).',
      },
      gp: {
        name: 'Общая практика — SIMG',
        body: 'Società Italiana di Medicina Generale',
        details: 'SIMG — ведущее общество врачей общей практики (MMG — medico di medicina generale). Документы: clinical governance, percorsi diagnostico-terapeutici (PDTA), Health Search (национальная БД GP). Примеры: PDTA diabete, PDTA BPCO, PDTA scompenso cardiaco — региональная адаптация к AUSL/ASL.',
      },
      national: {
        name: 'SNLG — Sistema Nazionale Linee Guida',
        body: 'ISS (Istituto Superiore di Sanità) — с 2017 по legge Gelli-Bianco',
        details: 'SNLG (snlg.iss.it) — официальный национальный реестр линее-гида (Law 24/2017 — Gelli-Bianco). Линии-гида одобренные SNLG имеют юридическую защиту для врачей (safe harbour от медицинских претензий). Методология GRADE. Примеры: linee guida per la gestione del paziente con COVID-19, prevenzione TEV, screening oncologici.',
      },
      specialty: {
        name: 'Специализированные общества',
        body: 'SIC (Cardiologia), AIOM (Oncologia medica), SID (Diabetologia), SIN (Nefrologia), SIP (Pediatria), SIGO (Ginecologia)',
        details: 'AIOM — linee guida oncologiche annuali (высокое качество GRADE, доступны бесплатно на aiom.it); SID — standard italiani cura diabete; SIC — адаптация ESC; SIN — nefrologia; SIP — pediatria (lattante, bambino, adolescente).',
      },
    };
    const e = map[d];
    return {
      value: e.name,
      unit: 'Italia',
      color: '#6B7280',
      interpretation: `Navigate: Italian ${e.name}`,
      details: `Домен: ${e.name}\n\nОрган: ${e.body}\n\n${e.details}`,
      actions: [
        'AIFA: https://www.aifa.gov.it/',
        'AIFA Note: https://www.aifa.gov.it/note-aifa',
        'SIMG: https://www.simg.it/',
        'SNLG-ISS: https://snlg.iss.it/',
        'AIOM: https://www.aiom.it/',
        'SID: https://www.siditalia.it/',
        'Ministero della Salute: https://www.salute.gov.it/',
      ],
      caveats: [
        'Документы на итальянском (английские резюме редко)',
        'Fasce A/C/H — всегда проверять перед назначением (влияет на стоимость для пациента)',
        'Региональные различия: Lombardia, Veneto, Emilia-Romagna имеют собственные protocolli aziendali',
        'Legge Gelli-Bianco (2017) — линии-гида SNLG дают правовую защиту врачу',
        'Note AIFA — невыполнение = off-label = пациент оплачивает полностью + юридический риск',
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

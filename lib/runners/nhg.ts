// @ts-nocheck
/** Runner: nhg — Dutch College of General Practitioners (NHG) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Нидерланды (также используется во Фландрии)',
  reference: 'NHG — Nederlands Huisartsen Genootschap. https://richtlijnen.nhg.org/',
  inputs: [
    {
      id: 'topic',
      label: 'Тема / категория',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Сердечно-сосудистая система' },
        { value: 'endo', label: 'Эндокринология / Diabetes' },
        { value: 'resp', label: 'Респираторная система (COPD, астма)' },
        { value: 'psych', label: 'Психические расстройства' },
        { value: 'gi', label: 'ЖКТ' },
        { value: 'muskel', label: 'Опорно-двигательная система' },
        { value: 'infect', label: 'Инфекции / антибиотики' },
        { value: 'preventive', label: 'Профилактика / скрининг' },
      ],
    },
  ],
  presets: [
    { label: 'Diabetes type 2', values: { topic: 'endo' } },
    { label: 'COPD', values: { topic: 'resp' } },
    { label: 'Depressie', values: { topic: 'psych' } },
  ],
  compute: (v) => {
    const t = String(v.topic || 'cardio');
    const examples: Record<string, string> = {
      cardio: 'NHG-Standaard Cardiovasculair risicomanagement (CVRM), Atriumfibrilleren, Hartfalen, Acuut coronair syndroom, Perifeer arterieel vaatlijden.',
      endo: 'NHG-Standaard Diabetes mellitus type 2 (ключевая), Schildklieraandoeningen, Obesitas.',
      resp: 'NHG-Standaard COPD, Astma bij volwassenen, Astma bij kinderen, Acuut hoesten.',
      psych: 'NHG-Standaard Depressie, Angst, Slaapproblemen en slaapmiddelen, Problematisch alcoholgebruik, ADHD bij kinderen.',
      gi: 'NHG-Standaard Maagklachten, Prikkelbare Darm Syndroom, Obstipatie, Acute diarree, GERD.',
      muskel: 'NHG-Standaard Aspecifieke lagerugpijn, Schouderklachten, Niet-traumatische knieklachten, Artrose.',
      infect: 'NHG-Standaard Urineweginfecties, Acute keelpijn, Otitis media acuta bij kinderen, Sinusitis, SOA-consult.',
      preventive: 'PreventieConsult, Griepvaccinatie, Stoppen met roken, Het preventieve consult cardiometabool risico.',
    };
    return {
      value: 'NHG-Standaard',
      unit: 'Nederland',
      color: '#6B7280',
      interpretation: 'Navigate: richtlijnen.nhg.org',
      details: `**Категория:** ${t}\n\n**Примеры NHG-Standaarden:**\n${examples[t]}\n\n**Структура NHG-Standaard:**\n1. Inleiding + epidemiologie\n2. Richtlijnen diagnostiek (anamnese, onderzoek, aanvullend onderzoek)\n3. Richtlijnen beleid (niet-medicamenteus + medicamenteus + verwijzing)\n4. Noten — научное обоснование каждой рекомендации\n5. Patiëntenversie (thuisarts.nl)\n\nNHG-Standaarden — основа работы huisarts (семейный врач) в Нидерландах. Система Нидерландов построена на gatekeeper-модели: huisarts — обязательный первый контакт.`,
      actions: [
        'NHG Richtlijnen: https://richtlijnen.nhg.org/',
        'Thuisarts (версия для пациентов): https://www.thuisarts.nl/',
        'NHG-Praktijkhandleiding',
        'Farmacotherapeutisch Kompas: https://www.farmacotherapeutischkompas.nl/',
        'FTR / FTK для лекарственной политики',
        'NHG App — offline доступ',
      ],
      caveats: [
        'Документы на голландском (nederlands); английских переводов нет',
        'Адаптированы к голландской системе: huisarts-gatekeeper, eerste lijn vs tweede lijn',
        'Rationale каждой рекомендации в Noten — отдельная strong evidence section',
        'Обновления: каждая standaard пересматривается ~5-7 лет',
        'Реимбурсация via Zorgverzekeringswet (Zvw) и zorgverzekeraars',
        'Не путать с FMS (Federatie Medisch Specialisten) — рекомендации для специалистов tweede lijn',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'has-fr', title: 'HAS (France)' },
        { id: 'awmf-de', title: 'AWMF (Germany, DEGAM for GP)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
**NHG (Nederlands Huisartsen Genootschap)** — Нидерландское общество врачей общей практики. Авторитет №1 для huisarts в Нидерландах. Также используются во Фландрии (бельгийская часть).

### NHG-Standaarden
~100+ стандартов по всем типичным жалобам в первичной помощи. Каждая standaard: алгоритм диагностики + лечения + когда направить в tweede lijn (специалист / больница).

### Методология
- Систематический обзор литературы
- Экспертный консенсус
- Noten — детальное научное обоснование отдельно от основного текста
- Пациентский эквивалент на **thuisarts.nl**

### Нидерландская модель
- **Huisarts** — обязательный gatekeeper
- **Eerste lijn** (первичное звено) vs **Tweede lijn** (специалист/больница)
- **Zorgverzekeringswet (Zvw)** — обязательное страхование

### Источники
- https://richtlijnen.nhg.org/
- https://www.thuisarts.nl/
- https://www.farmacotherapeutischkompas.nl/`,
};
export default runner;

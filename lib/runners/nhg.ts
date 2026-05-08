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
    const map: Record<string, { details: string; actions: string[]; caveats: string[] }> = {
      cardio: {
        details: 'NHG-Standaard Cardiovasculair risicomanagement (CVRM), Atriumfibrilleren, Hartfalen, Acuut coronair syndroom, Perifeer arterieel vaatlijden.',
        actions: [
          'NHG CVRM: https://richtlijnen.nhg.org/standaarden/cardiovasculair-risicomanagement',
          'NHG Atriumfibrilleren: https://richtlijnen.nhg.org/standaarden/atriumfibrilleren',
          'NHG Hartfalen: https://richtlijnen.nhg.org/standaarden/hartfalen',
          'Multidisciplinaire richtlijn CVRM (NHG + NIV + NVVC)',
        ],
        caveats: [
          'CVRM gebruik SCORE2 (Europese tabel), niet Framingham',
          'AF: CHA2DS2-VASc + HAS-BLED; DOAC eerste keus (dabigatran, apixaban, edoxaban, rivaroxaban)',
          'Statins: simvastatine 40 mg eerste keus; rosuvastatine bij hoog risico',
          'Verwijscriteria naar cardioloog — expliciet in Standaard',
        ],
      },
      endo: {
        details: 'NHG-Standaard Diabetes mellitus type 2 (ключевая), Schildklieraandoeningen, Obesitas.',
        actions: [
          'NHG DM2: https://richtlijnen.nhg.org/standaarden/diabetes-mellitus-type-2',
          'NHG Schildklieraandoeningen: https://richtlijnen.nhg.org/standaarden/schildklieraandoeningen',
          'NHG Obesitas: https://richtlijnen.nhg.org/standaarden/obesitas',
          'Zorgstandaard Diabetes (NDF)',
        ],
        caveats: [
          'DM2 stepwise: lifestyle → metformine → SU (gliclazide) → insulin/GLP-1RA/SGLT2i',
          'HbA1c target: ≤ 53 mmol/mol (7%) bij mid-adult, minder strikt bij elderly',
          'GLP-1 RA vergoed alleen bij BMI ≥ 35 of eerder MI',
          'Zorgstandaard = multidisciplinaire keten rond patiënt',
        ],
      },
      resp: {
        details: 'NHG-Standaard COPD, Astma bij volwassenen, Astma bij kinderen, Acuut hoesten.',
        actions: [
          'NHG COPD: https://richtlijnen.nhg.org/standaarden/copd',
          'NHG Astma bij volwassenen: https://richtlijnen.nhg.org/standaarden/astma-bij-volwassenen',
          'NHG Astma bij kinderen: https://richtlijnen.nhg.org/standaarden/astma-bij-kinderen',
          'LAN (Long Alliantie Nederland): https://www.longalliantie.nl/',
        ],
        caveats: [
          'COPD: GLI-2012 spirometry reference (niet meer LLN alone)',
          'Astma: ICS-formoterol als reliever (2023 update, GINA-aligned)',
          'Saba-only niet meer aanbevolen',
          'Spirometry verplicht eerste lijn (huisartsenpost / praktijk)',
        ],
      },
      psych: {
        details: 'NHG-Standaard Depressie, Angst, Slaapproblemen en slaapmiddelen, Problematisch alcoholgebruik, ADHD bij kinderen.',
        actions: [
          'NHG Depressie: https://richtlijnen.nhg.org/standaarden/depressie',
          'NHG Angst: https://richtlijnen.nhg.org/standaarden/angst',
          'GGZ Standaarden: https://www.ggzstandaarden.nl/',
          'MIND (patient org): https://mind.nl/',
        ],
        caveats: [
          'POH-GGZ (praktijkondersteuner) — eerste lijn support в NL unique',
          'SSRI eerste keus voor depressie/angst (sertraline, citalopram)',
          'Benzodiazepines max. 2 weken (NHG strict)',
          'Verwijzing GGZ alleen na POH-GGZ screening',
        ],
      },
      gi: {
        details: 'NHG-Standaard Maagklachten, Prikkelbare Darm Syndroom, Obstipatie, Acute diarree, GERD.',
        actions: [
          'NHG Maagklachten: https://richtlijnen.nhg.org/standaarden/maagklachten',
          'NHG Prikkelbare Darm Syndroom: https://richtlijnen.nhg.org/standaarden/prikkelbare-darm-syndroom',
          'NHG Obstipatie: https://richtlijnen.nhg.org/standaarden/obstipatie',
          'Bevolkingsonderzoek darmkanker: https://www.bevolkingsonderzoeknederland.nl/',
        ],
        caveats: [
          'H. pylori: test-and-treat bij < 50 zonder alarmsymptomen',
          'PPI step-down na 4-8 weken — deprescribing focus',
          'Colorectal screening 55–75 (2-yearly iFOBT)',
          'Alarm symptoms — directe endoscopie verwijzing',
        ],
      },
      muskel: {
        details: 'NHG-Standaard Aspecifieke lagerugpijn, Schouderklachten, Niet-traumatische knieklachten, Artrose.',
        actions: [
          'NHG Aspecifieke lagerugpijn: https://richtlijnen.nhg.org/standaarden/aspecifieke-lagerugpijn',
          'NHG Schouderklachten: https://richtlijnen.nhg.org/standaarden/schouderklachten',
          'NHG Artrose: https://richtlijnen.nhg.org/standaarden/artrose-van-heup-en-knie',
          'KNGF (fysiotherapie richtlijnen)',
        ],
        caveats: [
          'Lagerugpijn: geen imaging tenzij red flags',
          'Paracetamol eerste keus — NSAID beperkt (cardio/GI risk)',
          'Opioiden vermijden (strenge NHG stance 2022)',
          'Fysio vergoeding afhankelijk van aanvullend verzekering',
        ],
      },
      infect: {
        details: 'NHG-Standaard Urineweginfecties, Acute keelpijn, Otitis media acuta bij kinderen, Sinusitis, SOA-consult.',
        actions: [
          'NHG Urineweginfecties: https://richtlijnen.nhg.org/standaarden/urineweginfecties',
          'NHG Acute keelpijn: https://richtlijnen.nhg.org/standaarden/acute-keelpijn',
          'NHG SOA-consult: https://richtlijnen.nhg.org/standaarden/soa-consult',
          'SWAB (antibiotica richtlijnen): https://swab.nl/',
        ],
        caveats: [
          'NL heeft laagste antibiotica-gebruik EU (restrictive NHG)',
          'UTI: nitrofurantoïne 5 dagen eerste keus voor vrouwen',
          'Acute keelpijn: centor-criteria; meestal viraal, geen AB',
          'OMA < 2 jr geen AB tenzij severe / bilateraal',
        ],
      },
      preventive: {
        details: 'PreventieConsult, Griepvaccinatie, Stoppen met roken, Het preventieve consult cardiometabool risico.',
        actions: [
          'NHG PreventieConsult: https://richtlijnen.nhg.org/standaarden/het-preventieve-consult-cardiometabool-risico',
          'RIVM (public health): https://www.rivm.nl/',
          'Bevolkingsonderzoek (cancer screening): https://www.bevolkingsonderzoeknederland.nl/',
          'Stoppen met roken: https://www.ikstopnu.nl/',
        ],
        caveats: [
          'Bevolkingsonderzoeken: darmkanker (55–75), borstkanker (50–75), baarmoederhals (30–60)',
          'Griepvaccinatie: ≥ 60 jr + risicogroepen (NHG-gestuurd)',
          'HPV: meisjes + jongens 10 jr (RVP)',
          'SmR (stoppen met roken) — vergoed via basisverzekering',
        ],
      },
    };
    const e = map[t]!;
    return {
      value: 'NHG-Standaard',
      unit: 'Nederland',
      color: '#6B7280',
      interpretation: 'Navigate: richtlijnen.nhg.org',
      details: `Категория: ${t}\n\nПримеры NHG-Standaarden:\n${e.details}\n\nСтруктура NHG-Standaard:\n1. Inleiding + epidemiologie\n2. Richtlijnen diagnostiek (anamnese, onderzoek, aanvullend onderzoek)\n3. Richtlijnen beleid (niet-medicamenteus + medicamenteus + verwijzing)\n4. Noten — научное обоснование каждой рекомендации\n5. Patiëntenversie (thuisarts.nl)\n\nNHG-Standaarden — основа работы huisarts (семейный врач) в Нидерландах. Система Нидерландов построена на gatekeeper-модели: huisarts — обязательный первый контакт.`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'NHG Richtlijnen: https://richtlijnen.nhg.org/',
        'Thuisarts (patient info): https://www.thuisarts.nl/',
        'Farmacotherapeutisch Kompas: https://www.farmacotherapeutischkompas.nl/',
        'NHG App — offline доступ',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для NHG —',
        'Документы на голландском; английских переводов нет',
        'Huisarts — gatekeeper, eerste lijn vs tweede lijn',
        'Niet verwarren met FMS (rekommendaties voor specialisten)',
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

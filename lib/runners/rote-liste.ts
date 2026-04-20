// @ts-nocheck
/** Runner: rote-liste */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'brand',
      label: 'Немецкое торговое наименование',
      type: 'select',
      options: [
        { value: 'aspirin', label: 'Aspirin (ASS)' },
        { value: 'novalgin', label: 'Novalgin (Metamizol)' },
        { value: 'voltaren', label: 'Voltaren (Diclofenac)' },
        { value: 'marcumar', label: 'Marcumar (Phenprocoumon)' },
        { value: 'pantozol', label: 'Pantozol (Pantoprazol)' },
        { value: 'ramipril-ct', label: 'Ramipril-CT' },
        { value: 'metformin-1a', label: 'Metformin-1A Pharma' },
      ],
    },
    {
      id: 'lookup',
      label: 'Что искать',
      type: 'select',
      options: [
        { value: 'atc', label: 'ATC-код + действующее вещество' },
        { value: 'indication', label: 'Показания (Anwendung)' },
        { value: 'ingredients', label: 'Состав + вспомогательные вещества' },
        { value: 'substitution', label: 'Aut-idem (замена дженериком)' },
      ],
    },
  ],
  compute: (v) => {
    const b = String(v.brand);
    const q = String(v.lookup);
    const data: Record<string, { inn: string; atc: string; ind: string; excipients: string }> = {
      aspirin: { inn: 'Acetylsalicylsäure (ASS)', atc: 'B01AC06 / N02BA01', ind: 'Schmerzen, Fieber, Prävention nach Myokardinfarkt', excipients: 'Maisstärke, Mikrokristalline Cellulose' },
      novalgin: { inn: 'Metamizol-Natrium', atc: 'N02BB02', ind: 'Starke akute/chronische Schmerzen, hohes Fieber (wenn andere Mittel nicht wirksam)', excipients: 'Natrium, Injektionslösung' },
      voltaren: { inn: 'Diclofenac-Natrium', atc: 'M01AB05', ind: 'Entzündlich-rheumatische Erkrankungen, Arthrose, Weichteilrheumatismus', excipients: 'Lactose, Saccharose, variabel nach Formulierung' },
      marcumar: { inn: 'Phenprocoumon', atc: 'B01AA04', ind: 'Therapie und Prophylaxe thromboembolischer Erkrankungen', excipients: 'Lactose, Magnesiumstearat' },
      pantozol: { inn: 'Pantoprazol-Natrium', atc: 'A02BC02', ind: 'Refluxösophagitis, Ulcera, Eradikation H. pylori', excipients: 'Mannitol, Crospovidon' },
      'ramipril-ct': { inn: 'Ramipril', atc: 'C09AA05', ind: 'Essenzielle Hypertonie, Herzinsuffizienz, diabetische Nephropathie', excipients: 'Lactose-Monohydrat' },
      'metformin-1a': { inn: 'Metforminhydrochlorid', atc: 'A10BA02', ind: 'Typ-2-Diabetes mellitus (insbesondere bei Übergewicht)', excipients: 'Povidon, Magnesiumstearat' },
    };
    const d = data[b] || { inn: '—', atc: '—', ind: '—', excipients: '—' };
    const outputs: Record<string, string> = {
      atc: `Wirkstoff: ${d.inn}\nATC-Code: ${d.atc}`,
      indication: `Anwendungsgebiete: ${d.ind}`,
      ingredients: `Wirkstoff: ${d.inn}\nHilfsstoffe: ${d.excipients}`,
      substitution: `Aut-idem-fähig (wenn nicht Arzt markiert). Wirkstoff: ${d.inn}. Rabattvertrag der jeweiligen Krankenkasse prüfen.`,
    };
    return {
      value: d.inn,
      unit: 'ROTE LISTE',
      interpretation: `${d.inn} (${d.atc})`,
      color: '#22C55E',
      details: `Präparat: ${b}\n\n${outputs[q] || '—'}\n\nPolní informace — v ROTE LISTE (ежегодник) или Gelbe Liste Pharmindex (онлайн).`,
      actions: [
        'Открыть rote-liste.de или gelbe-liste.de',
        'Ввести Handelsname → проверить Wirkstoff + ATC',
        'Для амбулаторной замены — сверить с Rabattverträgen (GKV)',
        'Cross-check с Fachinformation (офиц. SmPC в ЕС)',
      ],
      caveats: [
        'ROTE LISTE — коммерческий каталог (BPI); Gelbe Liste — независимая база (Medizinische Medien)',
        'Обновляется ежегодно (печатная); онлайн — постоянно',
        'Не заменяет Fachinformation (EMA/BfArM) для формальной верификации',
        'Aut-idem требует учёта рамочных договоров больничной кассы (§ 129 SGB V)',
      ],
      related: [
        { id: 'vidal', title: 'Vidal (Франция)' },
        { id: 'bnf', title: 'BNF (UK)' },
        { id: 'rls-ru', title: 'РЛС (РФ)' },
        { id: 'martindale', title: 'Martindale (межд.)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.5', title: 'Международная фармакотерапия' },
      ],
    };
  },
  reference: 'ROTE LISTE Service GmbH. ROTE LISTE. https://www.rote-liste.de/ · Gelbe Liste Pharmindex. https://www.gelbe-liste.de/',
  countries: 'Германия',
  presets: [
    { label: 'Aspirin — ATC', values: { brand: 'aspirin', lookup: 'atc' } },
    { label: 'Novalgin — показания', values: { brand: 'novalgin', lookup: 'indication' } },
    { label: 'Marcumar — состав', values: { brand: 'marcumar', lookup: 'ingredients' } },
  ],
  info: `### Для чего используется\n**ROTE LISTE** и **Gelbe Liste Pharmindex** — немецкие национальные справочники лекарственных препаратов (ЕС, BfArM).\n\n### ROTE LISTE vs Gelbe Liste\n| Параметр | ROTE LISTE | Gelbe Liste |\n|---|---|---|\n| Издатель | BPI (отраслевой) | Medizinische Medien |\n| Охват | Рецептурные препараты в ФРГ | Все (вкл. БАДы, мед. изделия) |\n| Формат | Ежегодник + онлайн | Онлайн / мобильное приложение |\n\n### Когда применять\n- Перевод немецкого рецепта на МНН (особенно для туристов/экспатов)\n- Подбор эквивалента в другой стране\n- Aut-idem / генерическая замена в ФРГ\n- Проверка ATC-кода для эпидемиологии/исследований\n\n### Источники\nhttps://www.rote-liste.de/ · https://www.gelbe-liste.de/`,
};
export default runner;

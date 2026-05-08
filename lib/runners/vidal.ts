/** Runner: vidal */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug',
      label: 'Препарат (МНН или бренд)',
      type: 'select',
      options: [
        { value: 'doliprane', label: 'Doliprane (Paracétamol)' },
        { value: 'efferalgan', label: 'Efferalgan (Paracétamol)' },
        { value: 'levothyrox', label: 'Levothyrox (Lévothyroxine)' },
        { value: 'kardegic', label: 'Kardegic (Acétylsalicylate de lysine)' },
        { value: 'previscan', label: 'Previscan (Fluindione)' },
        { value: 'amlor', label: 'Amlor (Amlodipine)' },
      ],
    },
    {
      id: 'section',
      label: 'Раздел монографии',
      type: 'select',
      options: [
        { value: 'forms', label: 'Formes et présentations' },
        { value: 'dosage', label: 'Posologie et mode d\'administration' },
        { value: 'indications', label: 'Indications' },
        { value: 'ci', label: 'Contre-indications' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.drug);
    const s = String(v.section);
    const data: Record<string, { inn: string; forms: string; posology: string; indic: string; ci: string }> = {
      doliprane: { inn: 'Paracétamol', forms: 'Cp 500 mg / 1 g, sachet, suppositoire, sirop enfant', posology: '1 g × 3-4/j (max 4 g/j), enfant 15 mg/kg × 4/j', indic: 'Douleur, fièvre', ci: 'Insuffisance hépatocellulaire sévère, hypersensibilité' },
      efferalgan: { inn: 'Paracétamol', forms: 'Cp effervescent 500 mg, sachet, suppo', posology: '1 g × 3-4/j', indic: 'Douleur, fièvre', ci: 'Insuf. hépatique, phénylcétonurie (aspartam)' },
      levothyrox: { inn: 'Lévothyroxine sodique', forms: 'Cp 25 à 200 µg', posology: '1,6 µg/kg/j le matin à jeun', indic: 'Hypothyroïdie, TSH-suppression en cancérologie thyroïdienne', ci: 'Hyperthyroïdie non traitée, insuf. surrénalienne non compensée' },
      kardegic: { inn: 'Acétylsalicylate de lysine', forms: 'Sachet 75 / 160 / 300 mg', posology: '75-160 mg × 1/j en prévention secondaire', indic: 'Prévention secondaire AVC/IDM', ci: 'Ulcère évolutif, allergie AAS, grossesse T3' },
      previscan: { inn: 'Fluindione', forms: 'Cp 20 mg sécable', posology: '20 mg/j initialement, adapter selon INR', indic: 'Prévention thromboembolique (ACFA, prothèse valvulaire)', ci: 'Grossesse, insuf. hépatique sévère, hémorragie active' },
      amlor: { inn: 'Amlodipine', forms: 'Gélule 5 / 10 mg', posology: '5-10 mg × 1/j', indic: 'HTA, angor stable', ci: 'Choc cardiogénique, IDM aigu récent' },
    };
    const e = data[d] || { inn: '—', forms: '—', posology: '—', indic: '—', ci: '—' };
    const out: Record<string, string> = {
      forms: `Formes et présentations: ${e.forms}`,
      dosage: `Posologie: ${e.posology}`,
      indications: `Indications: ${e.indic}`,
      ci: `Contre-indications: ${e.ci}`,
    };
    return {
      value: e.inn,
      unit: 'VIDAL',
      interpretation: `${e.inn} — ${d}`,
      color: '#22C55E',
      details: `Préparation: ${d} (DCI: ${e.inn})\n\n${out[s] || '—'}\n\nMonographie complète: vidal.fr — avec interactions médicamenteuses, effets indésirables, grossesse, pharmacocinétique.`,
      actions: [
        'Ouvrir vidal.fr (Франция) — professionnels de santé requièrent compte',
        'Rechercher par DCI ou nom commercial',
        'Vérifier section Interactions médicamenteuses (Hédrine) pour les associations',
        'Crosscheck avec base ANSM/HAS pour les recommandations nationales',
      ],
      caveats: [
        'VIDAL France (vidal.fr) и VIDAL Russie (vidal.ru) — разные базы с разными брендами',
        'Обновляется ежегодно в печатном виде (le Dictionnaire Vidal)',
        'Для РФ доступен Vidal Справочник — преимущественно бренды, обращающиеся в РФ',
        'Не заменяет официальный RCP (Résumé des Caractéristiques du Produit) ANSM/EMA',
      ],
      related: [
        { id: 'bnf', title: 'BNF (UK)' },
        { id: 'rls-ru', title: 'РЛС (РФ)' },
        { id: 'rote-liste', title: 'ROTE LISTE (ФРГ)' },
        { id: 'martindale', title: 'Martindale' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.5', title: 'Международная фармакотерапия' },
      ],
    };
  },
  reference: 'VIDAL. Dictionnaire VIDAL. https://www.vidal.fr/ · VIDAL Россия https://www.vidal.ru/',
  countries: 'Франция · Россия',
  presets: [
    { label: 'Doliprane — posologie', values: { drug: 'doliprane', section: 'dosage' } },
    { label: 'Levothyrox — formes', values: { drug: 'levothyrox', section: 'forms' } },
    { label: 'Previscan — CI', values: { drug: 'previscan', section: 'ci' } },
  ],
  info: `### Для чего используется\n**VIDAL** — крупнейший франкоязычный лекарственный справочник, существующий с 1914 года. Две независимые базы: VIDAL France (vidal.fr) и VIDAL Russie (vidal.ru).\n\n### Структура монографии\n1. DCI / Composition\n2. Formes et présentations\n3. Indications\n4. Posologie et mode d\'administration\n5. Contre-indications\n6. Mises en garde / Précautions\n7. Interactions médicamenteuses\n8. Grossesse / Allaitement\n9. Effets indésirables\n10. Pharmacodynamie / Pharmacocinétique\n\n### VIDAL Russie vs VIDAL France\n- Разные наборы брендов (РФ vs ЕС)\n- Русскоязычный интерфейс, адаптация под ГРЛС\n- В РФ используется наравне с РЛС`,
};
export default runner;

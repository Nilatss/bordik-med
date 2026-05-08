/** Runner: has-fr — HAS (Haute Autorité de Santé, France) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'France (also followed in Belgium, Luxembourg, Monaco; reference for Francophone Africa)',
  reference: 'Haute Autorité de Santé (HAS). https://www.has-sante.fr/. Independent scientific public authority of the French government; assesses medicines, medical devices, and healthcare practices.',
  inputs: [
    {
      id: 'domain',
      label: 'Domain',
      type: 'select',
      options: [
        { value: 'diagnostic', label: 'Diagnostic — recommandations de bonne pratique' },
        { value: 'therapeutic', label: 'Therapeutic — évaluation des médicaments / dispositifs' },
        { value: 'screening', label: 'Screening — dépistage / prévention' },
      ],
    },
  ],
  presets: [
    { label: 'Diagnostic — RBP', values: { domain: 'diagnostic' } },
    { label: 'Therapeutic — Commission Transparence', values: { domain: 'therapeutic' } },
    { label: 'Screening — prevention', values: { domain: 'screening' } },
  ],
  compute: (v) => {
    const d = String(v.domain || 'diagnostic');
    const map: Record<string, { name: string; examples: string; format: string; access: string }> = {
      diagnostic: {
        name: 'Recommandations de bonne pratique (RBP) — diagnostic',
        examples: '**HTA** (hypertension artérielle) — prise en charge de l\'HTA de l\'adulte (2016, mise à jour 2023); **Diabète de type 2** — stratégie médicamenteuse (2013, MAJ 2024); **BPCO** — diagnostic et traitement (2014, MAJ); **Dépression de l\'adulte** (2017); **Asthme de l\'adulte et adolescent** (2019); **Fibrillation atriale** (2014); **Maladie d\'Alzheimer** — diagnostic et prise en charge (2011, MAJ 2018); **AVC ischémique aigu** (2009, MAJ); **Douleur chronique** (2008).',
        format: 'Structure RBP HAS: argumentaire scientifique (revue systématique + niveaux de preuve) + synthèse + fiche mémo pour le médecin généraliste + outils pour le patient. Grades A/B/C ou "accord d\'experts" (AE).',
        access: 'Gratuit sur has-sante.fr. Traduction anglaise partielle disponible. Versions: PDF complet + fiche synthèse + fiche pertinente pour le patient.',
      },
      therapeutic: {
        name: 'Commission de la Transparence (CT) + CEESP',
        examples: '**SMR** (Service Médical Rendu) — 4 niveaux: important, modéré, faible, insuffisant → détermine le remboursement par l\'Assurance Maladie (65%, 30%, 15%, 0%). **ASMR** (Amélioration du Service Médical Rendu) — 5 niveaux: I (majeure) à V (absence) → fixe le prix vs comparateur. **CEESP** (Commission Évaluation Économique et de Santé Publique) — évaluation médico-économique (ratio coût-efficacité incrémental, ICER) pour les innovations à fort impact budgétaire.',
        format: 'Avis CT: indication évaluée, population cible, comparateur, résultats des essais cliniques (efficacité + tolérance), place dans la stratégie thérapeutique, SMR + ASMR + recommandations de remboursement. Publication: "Avis de la Commission de la Transparence".',
        access: 'Tous les avis sur has-sante.fr, section "Evaluer les médicaments". Décisions publiées au Journal Officiel après accord CEPS (Comité Économique des Produits de Santé) sur le prix.',
      },
      screening: {
        name: 'Dépistage et prévention',
        examples: '**Cancer du sein** — programme national de dépistage organisé (mammographie 50-74 ans tous les 2 ans); **Cancer colorectal** — test immunologique FIT 50-74 ans tous les 2 ans; **Cancer du col de l\'utérus** — HPV-HR test depuis 2020 (25-65 ans); **Diabète de type 2** — dépistage ciblé (facteurs de risque); **Hypertension** — mesure systématique; **Vaccinations** — calendrier vaccinal 2024 (obligations étendues 2018); **Dépression post-partum**; **Dépistage néonatal** — extension à 13 maladies (2023).',
        format: 'Recommandations de santé publique (RSP): cibles, modalités, fréquence, qualité requise, indicateurs de performance. Avis à la Direction Générale de la Santé (DGS) pour élaboration des programmes nationaux.',
        access: 'has-sante.fr + santé.fr + ameli.fr (Assurance Maladie). Recommandations souvent intégrées au Rendez-vous de prévention (Mon Bilan Prévention, depuis 2024).',
      },
    };
    const e = map[d]!;
    return {
      value: e.name,
      unit: 'HAS France',
      color: '#6B7280',
      interpretation: `HAS guidance: ${e.name}`,
      details: `Domain: ${e.name}\n\nExamples: ${e.examples}\n\nFormat / methodology: ${e.format}\n\nAccess: ${e.access}`,
      actions: [
        'HAS main portal: https://www.has-sante.fr/',
        'Recommandations de bonne pratique: https://www.has-sante.fr/jcms/c_5233/fr/recommandations-de-bonne-pratique',
        'Évaluation des médicaments (CT): https://www.has-sante.fr/jcms/c_5232/fr/medicaments',
        'Évaluation des dispositifs médicaux (CNEDiMTS)',
        'CEESP — évaluations médico-économiques',
        'Bibliothèque HAS — PDF téléchargeables gratuitement',
        'App HAS Pro (iOS/Android) — consulter RBP en mobilité',
        'Ameli.fr — remboursement selon SMR/ASMR',
      ],
      caveats: [
        'Documents en français; résumés en anglais disponibles pour certaines RBP',
        'SMR/ASMR déterminent le remboursement et le prix — spécifique au système français',
        'Mise à jour: RBP revues tous les 3-5 ans; avis CT — continus (selon AMM EMA/ANSM)',
        'HAS ≠ ANSM (Agence nationale de sécurité du médicament, qui gère les AMM et pharmacovigilance)',
        'HAS ≠ Santé publique France (épidémiologie, surveillance)',
        'Applicabilité hors France: qualité EBM élevée mais spécificités de dosage (Vidal), disponibilité, remboursement à adapter',
        'Belgique, Luxembourg, Monaco suivent souvent HAS par convention; autonomie croissante',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK analog)' },
        { id: 'gba-de', title: 'G-BA / IQWiG (Germany)' },
        { id: 'ansm', title: 'ANSM (French medicines agency)' },
        { id: 'vidal', title: 'Vidal (French drug reference)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '312.1', title: 'Медицинское образование / EBM' },
      ],
    };
  },
  info: `### Для чего используется
**HAS (Haute Autorité de Santé)** — independent scientific public authority of the French government (created 2004 by law). Its mission: improve quality of healthcare and guarantee equal access to safe and effective care.

### Main missions
1. **Evaluation of medicines and medical devices** (Commission de la Transparence — CT; CNEDiMTS for devices)
2. **Clinical practice guidelines** (Recommandations de bonne pratique — RBP)
3. **Public health recommendations** (screening, prevention, vaccination)
4. **Accreditation of healthcare organisations** (certification V2020)
5. **Medico-economic evaluation** (CEESP — for high-budget-impact innovations)
6. **Accreditation of individual practitioners** (surgeons, anaesthesiologists — mandatory for certain specialties)

### Key commissions
| Commission | Role |
|------------|------|
| **CT** (Commission de la Transparence) | Evaluate SMR + ASMR of medicines |
| **CNEDiMTS** | Evaluate medical devices |
| **CEESP** | Medico-economic evaluation |
| **CDC** (Commission des Dispositifs médicaux) | Devices |
| **CVN** (Commission Vaccination Normes) | Vaccination recommendations |

### SMR and ASMR (pivotal French concepts)
**SMR (Service Médical Rendu)** — medical benefit:
- Important → 65% reimbursement
- Modéré → 30%
- Faible → 15%
- Insuffisant → 0% (not reimbursed)

**ASMR (Amélioration du Service Médical Rendu)** — incremental medical benefit vs comparator:
- I: major
- II: important
- III: modest
- IV: minor
- V: absence

Combination SMR+ASMR drives both reimbursement and price negotiation with **CEPS** (Comité Économique des Produits de Santé).

### Links with other bodies
- **ANSM** (Agence nationale de sécurité du médicament) — marketing authorisation, pharmacovigilance (separate from HAS)
- **Santé publique France** — epidemiology, surveillance
- **Assurance Maladie (CNAM)** — reimbursement execution via ameli.fr
- **EMA** — European medicines regulation (most AMMs via centralised procedure)

### Geographic scope
- **France** (Metropolitan + DROM-COM)
- **Belgium, Luxembourg, Monaco** — frequent adoption of HAS RBP
- **Francophone Africa** — reference for many countries (Côte d'Ivoire, Senegal, Morocco, Algeria, Tunisia — partial)

### Language
- Primary: French
- Partial English summaries (especially for international TAs)

### Quality and methodology
- **GRADE** for evidence grading
- **Systematic reviews** + expert consensus
- **Public consultation** on draft RBPs
- **Conflict of interest** declarations (DPI) mandatory

### Access
**Free** on has-sante.fr: all RBPs, CT avis, CEESP evaluations, quality indicators. Mobile app HAS Pro.

### Sources
- https://www.has-sante.fr/
- https://www.ameli.fr/ (Assurance Maladie — reimbursement rules)
- https://ansm.sante.fr/ (ANSM — medicines regulation)
- Loi n° 2004-810 du 13 août 2004 (HAS creation law)`,
};
export default runner;

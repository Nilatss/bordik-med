/**
 * Integrity tests for every score-kind calculator's `bands` array.
 *
 * Why this exists: score-kind tools don't have an inline compute() — the
 * shared sumScore + findBand pipeline does the work. The risk is in the
 * BAND DATA itself: a typo in min/max creates either a gap (a real
 * patient score falls into the fallback band, which is the FIRST band,
 * so a high-risk patient gets classified as low-risk) or an overlap
 * (ambiguous result; first matching band wins, which may be wrong).
 *
 * For every imported score-kind runner we assert:
 *   1. Bands array is non-empty.
 *   2. Every integer score from 0..maxScore lands in exactly one band.
 *   3. Bands don't overlap.
 *   4. Every band has a non-empty label, color, description.
 *
 * Adding a new score-kind tool? Import it below and add its (id, runner,
 * maxScore) tuple to the SCORE_TOOLS array. The test set runs against
 * each automatically.
 */
import { describe, it, expect } from 'vitest';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

// Cardio / VTE
import chadsVasc from '@/lib/runners/chads-vasc';
import hasBled  from '@/lib/runners/has-bled';
import wellsPe  from '@/lib/runners/wells-pe';
import wellsDvt from '@/lib/runners/wells-dvt';
import caprini  from '@/lib/runners/caprini';
import heart    from '@/lib/runners/heart';
import timi     from '@/lib/runners/timi';
// Sepsis / EWS / ICU
import qsofa    from '@/lib/runners/qsofa';
import news2    from '@/lib/runners/news2';
import mews     from '@/lib/runners/mews';
// (cam-icu / ranson / forrest are calculator-kind, not score-kind —
// inline compute() instead of bands[]; covered by their own tests.)
// Respiratory / Infection
import curb65   from '@/lib/runners/curb65';
import centor   from '@/lib/runners/centor';
// GI
import bisap    from '@/lib/runners/bisap';
import childMeld from '@/lib/runners/child-meld';
// Surgery / Acute abdomen
import alvarado from '@/lib/runners/alvarado';
import bishop   from '@/lib/runners/bishop';
// Neuro / Pain / Function / Comorbidity
import gcs      from '@/lib/runners/gcs';
import apgar    from '@/lib/runners/apgar';
import braden   from '@/lib/runners/braden';
import ecog     from '@/lib/runners/ecog';
import charlson from '@/lib/runners/charlson';
// Substance use
import cage     from '@/lib/runners/cage';
import auditC   from '@/lib/runners/audit-c';
// Mental health screeners
import gad7     from '@/lib/runners/gad7';
import phq9     from '@/lib/runners/phq9';
import epworth  from '@/lib/runners/epworth';
// Stroke / TIA / vascular
import abcd2    from '@/lib/runners/abcd2';
import nihss    from '@/lib/runners/nihss';
import duke     from '@/lib/runners/duke';
// VTE / pre-op
import padua    from '@/lib/runners/padua';
import rcri     from '@/lib/runners/rcri';
import bova     from '@/lib/runners/bova';
// Pulmonology
import bode     from '@/lib/runners/bode';
// Triage
import esi      from '@/lib/runners/esi';
import ats      from '@/lib/runners/ats';
// Pain / neuro
import flacc    from '@/lib/runners/flacc';
import dn4      from '@/lib/runners/dn4';
// Cardio rhythm symptoms
import ehra     from '@/lib/runners/ehra';
// Strep throat
import feverpain from '@/lib/runners/feverpain';
// UGI bleeding
import aims65   from '@/lib/runners/aims65';
import gbs      from '@/lib/runners/gbs';
import rockall  from '@/lib/runners/rockall';
// Cognition / delirium
import fourAt   from '@/lib/runners/4at';
import miniCog  from '@/lib/runners/mini-cog';
import moca     from '@/lib/runners/moca';
import mmse     from '@/lib/runners/mmse';
// HIT (heparin-induced thrombocytopenia)
import fourT    from '@/lib/runners/4t';
// PE severity
import pesi     from '@/lib/runners/pesi';
// Heart failure
import killip   from '@/lib/runners/killip';
import nyha     from '@/lib/runners/nyha';
// Sleep apnea screening
import stopBang from '@/lib/runners/stop-bang';
// SAH severity
import huntHess from '@/lib/runners/hunt-hess';
import wfns     from '@/lib/runners/wfns';
// Nutrition risk
import must     from '@/lib/runners/must';
import nrs2002  from '@/lib/runners/nrs2002';
// Paediatric early warning
import pews     from '@/lib/runners/pews';
// Septic arthritis (kids)
import kocher   from '@/lib/runners/kocher';
// Frailty
import cfs      from '@/lib/runners/cfs';
import edmonton from '@/lib/runners/edmonton-frail';
// Performance / function
import barthel  from '@/lib/runners/barthel';
import katzAdl  from '@/lib/runners/katz-adl';
import kps      from '@/lib/runners/kps';
import tinetti  from '@/lib/runners/tinetti';
// Sepsis / organ failure
import sofa     from '@/lib/runners/sofa';
// Pre-surgery / risk
import asaPs    from '@/lib/runners/asa-ps';
// Pulmonary risk / triage
import perc     from '@/lib/runners/perc';
import geneva   from '@/lib/runners/geneva';
// Brain / TIA / SAH / TBI
import marshall from '@/lib/runners/marshall-ct';
import canCt    from '@/lib/runners/can-ct-head';
import ich      from '@/lib/runners/ich';
import dragon   from '@/lib/runners/dragon';
// Newborn / paediatric / obstetric
import meows    from '@/lib/runners/meows';
import silverman from '@/lib/runners/silverman';
import downes   from '@/lib/runners/downes';
import ballard  from '@/lib/runners/ballard';
import finnegan from '@/lib/runners/finnegan';
// Brugada (LQTS uses .5 increments — incompatible with integer integrity test)
import brugada  from '@/lib/runners/brugada';
// Pain
import nrs2002Px from '@/lib/runners/painad';
// Asthma / COPD
import act      from '@/lib/runners/act';
// Falls
import morse    from '@/lib/runners/morse';
// Migraine / headache
import ichd3    from '@/lib/runners/ichd3';
import mcgill   from '@/lib/runners/mcgill';
// Glucose / diabetes
import h2fpef   from '@/lib/runners/h2fpef';
// Khorana cancer-VTE
import khorana  from '@/lib/runners/khorana';
// CSPINE / cervical spine clearance
import pecarn   from '@/lib/runners/pecarn-cspine';
// Crohn's / colitis activity
import cdai     from '@/lib/runners/cdai';
// Smoking dependence
import fagerstrom from '@/lib/runners/fagerstrom';
// Paediatric appendicitis / asthma / croup
import alvaradoPas from '@/lib/runners/alvarado-pas';
import pas        from '@/lib/runners/pas';
import pram       from '@/lib/runners/pram';
import westley    from '@/lib/runners/westley';
// Triage (START is a category classifier, not a monotonic score —
// its band ranges intentionally overlap; skip integrity test)
import ctas       from '@/lib/runners/ctas';
import mts        from '@/lib/runners/mts';
// Headache / dyspnoea / angina
import snoop      from '@/lib/runners/snoop';
import mmrc       from '@/lib/runners/mmrc';
import ccs        from '@/lib/runners/ccs';
// Nutrition
import mna        from '@/lib/runners/mna';
import glim       from '@/lib/runners/glim';
import nutric     from '@/lib/runners/nutric';
import sga        from '@/lib/runners/sga';
import strongkids from '@/lib/runners/strongkids';
// Coma / LOC
import four       from '@/lib/runners/four';
import avpu       from '@/lib/runners/avpu';
import acdu       from '@/lib/runners/acdu';
import pgcs       from '@/lib/runners/pgcs';
// Stroke etiology / vascular
import toast      from '@/lib/runners/toast';
import fast       from '@/lib/runners/fast';
import hachinski  from '@/lib/runners/hachinski';
// Cognitive
import mace2      from '@/lib/runners/mace2';
import slums      from '@/lib/runners/slums';
import mchat      from '@/lib/runners/mchat';
// Epilepsy / neuro
import ilae       from '@/lib/runners/ilae';
import engel      from '@/lib/runners/engel';
import hughesGbs  from '@/lib/runners/hughes-gbs';
import mgfa       from '@/lib/runners/mgfa';
// Bleeding / VTE prophylaxis
import improveBl  from '@/lib/runners/improve-bleed';
import rcogVte    from '@/lib/runners/rcog-vte';
// Pain (paediatric)
import nips       from '@/lib/runners/nips';
import fpsR       from '@/lib/runners/fps-r';
import wongBaker  from '@/lib/runners/wong-baker';
// Prostate / urology
import ipss       from '@/lib/runners/ipss';
// Dehydration
import whoDehydr  from '@/lib/runners/who-dehydr';
// Vascular
import ceap       from '@/lib/runners/ceap';
import villalta   from '@/lib/runners/villalta';
// QT / drug-induced
import tisdale    from '@/lib/runners/tisdale';
// Hypertension target organ
import htnTod     from '@/lib/runners/htn-tod';
// Heart failure / chest pain
import accAhaHf   from '@/lib/runners/acc-aha-hf';
import framHf     from '@/lib/runners/framingham-hf';
import edacs      from '@/lib/runners/edacs';
import sgarbossa  from '@/lib/runners/sgarbossa';
// Surgery / pre-op
import clavien    from '@/lib/runners/clavien';
import nsqip      from '@/lib/runners/nsqip';
import possum     from '@/lib/runners/possum';
import pts        from '@/lib/runners/pts';
import simpson    from '@/lib/runners/simpson';
// Pain / delirium / sedation
import cpot       from '@/lib/runners/cpot';
import cam        from '@/lib/runners/cam';
import drs        from '@/lib/runners/drs';
// Neuro / nerve / spine
import asia       from '@/lib/runners/asia';
import houseBrack from '@/lib/runners/house-brackmann';
import slic       from '@/lib/runners/slic';
import spetzler   from '@/lib/runners/spetzler';
import rancho     from '@/lib/runners/rancho';
import stess      from '@/lib/runners/stess';
import ctcae      from '@/lib/runners/ctcae-neuro';
import tcns       from '@/lib/runners/tcns';
// Vascular / aortic
import crawford   from '@/lib/runners/crawford';
import stanford   from '@/lib/runners/stanford';
import rutherford from '@/lib/runners/rutherford';
import wilkins    from '@/lib/runners/wilkins';
// Neonatal / paediatric
import crib       from '@/lib/runners/crib';
import dubowitz   from '@/lib/runners/dubowitz';
import kramer     from '@/lib/runners/kramer';
import thompson   from '@/lib/runners/thompson';
import tanner     from '@/lib/runners/tanner';
import tal        from '@/lib/runners/tal';
// Obstetric / postnatal
import epds       from '@/lib/runners/epds';
// Ankle radiograph
import ottawaAnk  from '@/lib/runners/ottawa-ankle';
// ADHD
import vanderbilt from '@/lib/runners/vanderbilt';
// Orthopaedic / fracture classifiers (single-select grade → single-point band)
import garden       from '@/lib/runners/garden';
import weber        from '@/lib/runners/weber';
import neer         from '@/lib/runners/neer';
import schatzker    from '@/lib/runners/schatzker';
import gustilo      from '@/lib/runners/gustilo';
import rockwood     from '@/lib/runners/rockwood';
import salterHarris from '@/lib/runners/salter-harris';
import tscherne     from '@/lib/runners/tscherne';
// Severity grades (added after stage-3 maxScore off-by-one — bar never filled)
import neoBpdNih    from '@/lib/runners/neo-bpd-nih';
import straw10      from '@/lib/runners/straw10';

interface ScoreRunner { bands: ScoreBand[]; maxScore: number }

// Priority list: highest clinical impact first. Each entry adds 5
// invariant assertions — adding a new tool here is the cheapest way
// to expand band-data coverage.
const SCORE_TOOLS: Array<[string, ScoreRunner]> = [
  // Cardio / VTE
  ['chads-vasc', chadsVasc as unknown as ScoreRunner],
  ['has-bled',   hasBled   as unknown as ScoreRunner],
  ['wells-pe',   wellsPe   as unknown as ScoreRunner],
  ['wells-dvt',  wellsDvt  as unknown as ScoreRunner],
  ['caprini',    caprini   as unknown as ScoreRunner],
  ['heart',      heart     as unknown as ScoreRunner],
  ['timi',       timi      as unknown as ScoreRunner],
  // Sepsis / EWS / ICU
  ['qsofa',      qsofa     as unknown as ScoreRunner],
  ['news2',      news2     as unknown as ScoreRunner],
  ['mews',       mews      as unknown as ScoreRunner],
  // Respiratory / Infection
  ['curb65',     curb65    as unknown as ScoreRunner],
  ['centor',     centor    as unknown as ScoreRunner],
  // GI
  ['bisap',      bisap     as unknown as ScoreRunner],
  ['child-meld', childMeld as unknown as ScoreRunner],
  // Surgery
  ['alvarado',   alvarado  as unknown as ScoreRunner],
  ['bishop',     bishop    as unknown as ScoreRunner],
  // Neuro / Pain / Function / Comorbidity
  ['gcs',        gcs       as unknown as ScoreRunner],
  ['apgar',      apgar     as unknown as ScoreRunner],
  ['braden',     braden    as unknown as ScoreRunner],
  ['ecog',       ecog      as unknown as ScoreRunner],
  ['charlson',   charlson  as unknown as ScoreRunner],
  // Substance use
  ['cage',       cage      as unknown as ScoreRunner],
  ['audit-c',    auditC    as unknown as ScoreRunner],
  // Mental health
  ['gad7',       gad7      as unknown as ScoreRunner],
  ['phq9',       phq9      as unknown as ScoreRunner],
  ['epworth',    epworth   as unknown as ScoreRunner],
  // Stroke / TIA / vascular
  ['abcd2',      abcd2     as unknown as ScoreRunner],
  ['nihss',      nihss     as unknown as ScoreRunner],
  ['duke',       duke      as unknown as ScoreRunner],
  // VTE / pre-op risk
  ['padua',      padua     as unknown as ScoreRunner],
  ['rcri',       rcri      as unknown as ScoreRunner],
  ['bova',       bova      as unknown as ScoreRunner],
  // Pulmonology
  ['bode',       bode      as unknown as ScoreRunner],
  // Triage
  ['esi',        esi       as unknown as ScoreRunner],
  ['ats',        ats       as unknown as ScoreRunner],
  // Pain / neuro
  ['flacc',      flacc     as unknown as ScoreRunner],
  ['dn4',        dn4       as unknown as ScoreRunner],
  // Cardio rhythm symptoms
  ['ehra',       ehra      as unknown as ScoreRunner],
  // Strep throat
  ['feverpain',  feverpain as unknown as ScoreRunner],
  // UGI bleeding
  ['aims65',     aims65    as unknown as ScoreRunner],
  ['gbs',        gbs       as unknown as ScoreRunner],
  ['rockall',    rockall   as unknown as ScoreRunner],
  // Cognition / delirium
  ['4at',        fourAt    as unknown as ScoreRunner],
  ['mini-cog',   miniCog   as unknown as ScoreRunner],
  ['moca',       moca      as unknown as ScoreRunner],
  ['mmse',       mmse      as unknown as ScoreRunner],
  // HIT
  ['4t',         fourT     as unknown as ScoreRunner],
  // PE severity
  ['pesi',       pesi      as unknown as ScoreRunner],
  // Heart failure
  ['killip',     killip    as unknown as ScoreRunner],
  ['nyha',       nyha      as unknown as ScoreRunner],
  // Sleep apnea
  ['stop-bang',  stopBang  as unknown as ScoreRunner],
  // SAH
  ['hunt-hess',  huntHess  as unknown as ScoreRunner],
  ['wfns',       wfns      as unknown as ScoreRunner],
  // Nutrition
  ['must',       must      as unknown as ScoreRunner],
  ['nrs2002',    nrs2002   as unknown as ScoreRunner],
  // Paediatric early warning
  ['pews',       pews      as unknown as ScoreRunner],
  // Septic arthritis
  ['kocher',     kocher    as unknown as ScoreRunner],
  // Frailty
  ['cfs',        cfs       as unknown as ScoreRunner],
  ['edmonton',   edmonton  as unknown as ScoreRunner],
  // Performance / function
  ['barthel',    barthel   as unknown as ScoreRunner],
  ['katz-adl',   katzAdl   as unknown as ScoreRunner],
  ['kps',        kps       as unknown as ScoreRunner],
  ['tinetti',    tinetti   as unknown as ScoreRunner],
  // Sepsis / organ failure
  ['sofa',       sofa      as unknown as ScoreRunner],
  // Pre-surgery
  ['asa-ps',     asaPs     as unknown as ScoreRunner],
  // PE rule-out / risk
  ['perc',       perc      as unknown as ScoreRunner],
  ['geneva',     geneva    as unknown as ScoreRunner],
  // Brain / TIA / TBI
  ['marshall-ct', marshall as unknown as ScoreRunner],
  ['can-ct-head', canCt    as unknown as ScoreRunner],
  ['ich',        ich       as unknown as ScoreRunner],
  ['dragon',     dragon    as unknown as ScoreRunner],
  // Newborn / paediatric / obstetric
  ['meows',      meows     as unknown as ScoreRunner],
  ['silverman',  silverman as unknown as ScoreRunner],
  ['downes',     downes    as unknown as ScoreRunner],
  ['ballard',    ballard   as unknown as ScoreRunner],
  ['finnegan',   finnegan  as unknown as ScoreRunner],
  // Rhythm
  ['brugada',    brugada   as unknown as ScoreRunner],
  // Pain
  ['painad',     nrs2002Px as unknown as ScoreRunner],
  // Asthma
  ['act',        act       as unknown as ScoreRunner],
  // Falls
  ['morse',      morse     as unknown as ScoreRunner],
  // Headache classification
  ['ichd3',      ichd3     as unknown as ScoreRunner],
  ['mcgill',     mcgill    as unknown as ScoreRunner],
  // Cardiac / metabolic
  ['h2fpef',     h2fpef    as unknown as ScoreRunner],
  // Cancer-associated VTE
  ['khorana',    khorana   as unknown as ScoreRunner],
  // C-spine clearance
  ['pecarn-cspine', pecarn as unknown as ScoreRunner],
  // Smoking
  ['fagerstrom', fagerstrom as unknown as ScoreRunner],
  // Paediatric appendicitis / asthma / croup
  ['alvarado-pas', alvaradoPas as unknown as ScoreRunner],
  ['pas',        pas       as unknown as ScoreRunner],
  ['pram',       pram      as unknown as ScoreRunner],
  ['westley',    westley   as unknown as ScoreRunner],
  // Triage
  ['ctas',       ctas      as unknown as ScoreRunner],
  ['mts',        mts       as unknown as ScoreRunner],
  // Headache / dyspnoea / angina
  ['snoop',      snoop     as unknown as ScoreRunner],
  ['mmrc',       mmrc      as unknown as ScoreRunner],
  ['ccs',        ccs       as unknown as ScoreRunner],
  // Nutrition
  ['mna',        mna       as unknown as ScoreRunner],
  ['glim',       glim      as unknown as ScoreRunner],
  ['nutric',     nutric    as unknown as ScoreRunner],
  ['sga',        sga       as unknown as ScoreRunner],
  ['strongkids', strongkids as unknown as ScoreRunner],
  // Coma / LOC
  ['four',       four      as unknown as ScoreRunner],
  ['avpu',       avpu      as unknown as ScoreRunner],
  ['acdu',       acdu      as unknown as ScoreRunner],
  ['pgcs',       pgcs      as unknown as ScoreRunner],
  // Stroke etiology / vascular
  ['toast',      toast     as unknown as ScoreRunner],
  ['fast',       fast      as unknown as ScoreRunner],
  ['hachinski',  hachinski as unknown as ScoreRunner],
  // Cognitive
  ['mace2',      mace2     as unknown as ScoreRunner],
  ['slums',      slums     as unknown as ScoreRunner],
  ['mchat',      mchat     as unknown as ScoreRunner],
  // Epilepsy / neuro
  ['ilae',       ilae      as unknown as ScoreRunner],
  ['engel',      engel     as unknown as ScoreRunner],
  ['hughes-gbs', hughesGbs as unknown as ScoreRunner],
  ['mgfa',       mgfa      as unknown as ScoreRunner],
  // Bleeding / VTE prophylaxis
  ['improve-bleed', improveBl as unknown as ScoreRunner],
  ['rcog-vte',   rcogVte   as unknown as ScoreRunner],
  // Paediatric pain
  ['nips',       nips      as unknown as ScoreRunner],
  ['fps-r',      fpsR      as unknown as ScoreRunner],
  ['wong-baker', wongBaker as unknown as ScoreRunner],
  // Urology
  ['ipss',       ipss      as unknown as ScoreRunner],
  // Dehydration
  ['who-dehydr', whoDehydr as unknown as ScoreRunner],
  // Vascular
  ['ceap',       ceap      as unknown as ScoreRunner],
  ['villalta',   villalta  as unknown as ScoreRunner],
  // QT
  ['tisdale',    tisdale   as unknown as ScoreRunner],
  // HTN target organ
  ['htn-tod',    htnTod    as unknown as ScoreRunner],
  // Heart failure / chest pain
  ['acc-aha-hf', accAhaHf  as unknown as ScoreRunner],
  ['framingham-hf', framHf as unknown as ScoreRunner],
  ['edacs',      edacs     as unknown as ScoreRunner],
  ['sgarbossa',  sgarbossa as unknown as ScoreRunner],
  // Surgery / pre-op
  ['clavien',    clavien   as unknown as ScoreRunner],
  ['nsqip',      nsqip     as unknown as ScoreRunner],
  ['possum',     possum    as unknown as ScoreRunner],
  ['pts',        pts       as unknown as ScoreRunner],
  ['simpson',    simpson   as unknown as ScoreRunner],
  // Pain / delirium / sedation
  ['cpot',       cpot      as unknown as ScoreRunner],
  ['cam',        cam       as unknown as ScoreRunner],
  ['drs',        drs       as unknown as ScoreRunner],
  // Neuro / nerve / spine
  ['asia',       asia      as unknown as ScoreRunner],
  ['house-brackmann', houseBrack as unknown as ScoreRunner],
  ['slic',       slic      as unknown as ScoreRunner],
  ['spetzler',   spetzler  as unknown as ScoreRunner],
  ['rancho',     rancho    as unknown as ScoreRunner],
  ['stess',      stess     as unknown as ScoreRunner],
  ['ctcae-neuro', ctcae    as unknown as ScoreRunner],
  ['tcns',       tcns      as unknown as ScoreRunner],
  // Vascular / aortic / mitral
  ['crawford',   crawford  as unknown as ScoreRunner],
  ['stanford',   stanford  as unknown as ScoreRunner],
  ['rutherford', rutherford as unknown as ScoreRunner],
  ['wilkins',    wilkins   as unknown as ScoreRunner],
  // Neonatal / paediatric
  ['crib',       crib      as unknown as ScoreRunner],
  ['dubowitz',   dubowitz  as unknown as ScoreRunner],
  ['kramer',     kramer    as unknown as ScoreRunner],
  ['thompson',   thompson  as unknown as ScoreRunner],
  ['tanner',     tanner    as unknown as ScoreRunner],
  ['tal',        tal       as unknown as ScoreRunner],
  // Postnatal depression
  ['epds',       epds      as unknown as ScoreRunner],
  // Ankle X-ray rule
  ['ottawa-ankle', ottawaAnk as unknown as ScoreRunner],
  // ADHD
  ['vanderbilt', vanderbilt as unknown as ScoreRunner],
  // Orthopaedic / fracture classifiers — single-select grade maps to a
  // single-point band. Added after the stage-3 bug audit found overlapping
  // bands (first-match-wins returned the lower grade → clinical undertriage).
  ['garden',        garden       as unknown as ScoreRunner],
  ['weber',         weber        as unknown as ScoreRunner],
  ['neer',          neer         as unknown as ScoreRunner],
  ['schatzker',     schatzker    as unknown as ScoreRunner],
  ['gustilo',       gustilo      as unknown as ScoreRunner],
  ['rockwood',      rockwood     as unknown as ScoreRunner],
  ['salter-harris', salterHarris as unknown as ScoreRunner],
  ['tscherne',      tscherne     as unknown as ScoreRunner],
  // Severity grades — maxScore must equal the top grade or the bar never fills.
  ['neo-bpd-nih',   neoBpdNih    as unknown as ScoreRunner],
  ['straw10',       straw10      as unknown as ScoreRunner],
];

describe('score-band integrity', () => {
  for (const [id, runner] of SCORE_TOOLS) {
    describe(id, () => {
      it('declares non-empty bands', () => {
        expect(Array.isArray(runner.bands)).toBe(true);
        expect(runner.bands.length).toBeGreaterThan(0);
      });

      it(`every clinically-possible score maps to exactly one band`, () => {
        // Some scales (e.g. GCS) have a floor > 0. Walk from the band's
        // declared minimum to maxScore — anything below the floor isn't
        // a real clinical input.
        const floor = Math.min(...runner.bands.map((b) => b.min));
        for (let s = floor; s <= runner.maxScore; s++) {
          const matches = runner.bands.filter((b) => s >= b.min && s <= b.max);
          expect(matches.length, `${id}: score ${s} matched ${matches.length} bands`).toBe(1);
        }
      });

      it('bands don\'t overlap', () => {
        const sorted = [...runner.bands].sort((a, b) => a.min - b.min);
        for (let i = 1; i < sorted.length; i++) {
          expect(
            sorted[i]!.min,
            `${id}: band[${i}] starts at ${sorted[i]!.min}, before band[${i - 1}] ends at ${sorted[i - 1]!.max}`,
          ).toBeGreaterThan(sorted[i - 1]!.max);
        }
      });

      it('every band has label, color, description', () => {
        for (const b of runner.bands) {
          expect(b.label, `${id} band ${b.min}-${b.max} has empty label`).toBeTruthy();
          expect(b.color, `${id} band ${b.min}-${b.max} has empty color`).toMatch(/^#[0-9A-F]{3,8}$/i);
          expect(b.description, `${id} band ${b.min}-${b.max} has empty description`).toBeTruthy();
        }
      });

      it('findBand returns exactly the band whose range contains the score', () => {
        const floor = Math.min(...runner.bands.map((b) => b.min));
        for (let s = floor; s <= runner.maxScore; s++) {
          const expected = runner.bands.find((b) => s >= b.min && s <= b.max)!;
          const got = findBand(runner.bands, s);
          expect(got).toBe(expected);
        }
      });
    });
  }
});

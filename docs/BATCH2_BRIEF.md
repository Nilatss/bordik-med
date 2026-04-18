# Batch 2 — 49 Diagnostic Scales (Category 2)

## Overview
49 tools in Category "2. Диагностические шкалы". Mix of score tools (most) and a few calculators. Split across 8 subcategories.

## Approach
Follow `docs/RUNNER_TEMPLATE.md` exactly. Read 2-3 existing score runners for pattern:
- `news2` (~line 2192) — early warning score
- `wells-dvt` (~line 1608) — pretest probability
- `chads-vasc` (~line 1414) — stratification

## Tools (grouped by subcategory)

### Триаж (5) — mostly score-style classification
1. `esi` — ESI v.5: 5-level triage (США standard). Score-type with 5 bands.
2. `mts` — Manchester Triage: 5 colours (red/orange/yellow/green/blue). UK/Европа.
3. `ctas` — CTAS: 5 levels Canadian standard.
4. `ats` — ATS: 5 levels Australian.
5. `start` — START/JumpSTART/SALT: MCI triage (Immediate/Delayed/Minor/Expectant).

### Раннее распознавание (3) — score tools
6. `mews` — Modified Early Warning Score: vitals scoring, 5-point bands.
7. `pews` — Paediatric EWS (Bedside PEWS / RCPCH): kids 0-16.
8. `meows` — Modified Early OB Warning Score: pregnancy.

### Боль (10) — mostly simple scales
9. `vas` — VAS 0-100 mm / NRS 0-10. Calculator (single number 0-10, bands: none/mild/moderate/severe).
10. `wong-baker` — Wong-Baker FACES: 0, 2, 4, 6, 8, 10 for children 3+.
11. `flacc` — FLACC (Face/Legs/Activity/Cry/Consolability): 5 items × 0-2, total 0-10. Pre-verbal 2mo-7y.
12. `fps-r` — FPS-R: 0/2/4/6/8/10 faces, school-age.
13. `nips` — NIPS (Neonatal Infant Pain Scale): 6 items, 0-7. Also CRIES (neonatal post-op), N-PASS, PIPP-R.
14. `painad` — PAINAD (dementia): 5 items × 0-2, total 0-10.
15. `mcgill` — McGill Pain Questionnaire (short-form SF-MPQ-2): 22 descriptors, intensity scale.
16. `bpi` — Brief Pain Inventory: worst/average pain (0-10) + interference (0-10).
17. `dn4` — DN4 for neuropathic pain: 10 items, ≥4 = neuropathic (sens 83%, spec 90%).
18. `cpot` — Critical-Care Pain Observation Tool / BPS: 4 items for ICU intubated patients.

### Функциональный статус (9)
19. `kps` — Karnofsky 0-100 (step 10). Performance status oncology.
20. `ecog` — ECOG 0-5 (also WHO/Zubrod). Oncology. Map Karnofsky-ECOG.
21. `barthel` — Barthel Index 0-100 (ADL). 10 items, 4 bands.
22. `katz-adl` — Katz ADL (6 items, 0-6) / Lawton IADL (0-8) / FIM (18 items × 1-7).
23. `cfs` — Clinical Frailty Scale Rockwood 1-9.
24. `edmonton-frail` — Edmonton Frail Scale / FRAIL (5-item) / Fried (5-item) / PRISMA-7.
25. `morse` — Morse Fall Scale: 6 items, total 0-125. Risk: 0-24 no, 25-44 low, 45+ high.
26. `tinetti` — Tinetti POMA (balance 16 + gait 12 = 28). / Berg Balance 0-56. / TUG (seconds).
27. `braden` — Braden 6-23 (pressure ulcer risk). / Norton 5-20. / Waterlow ≥10.

### Питание (7)
28. `must` — MUST: BMI + weight loss + acute disease. 0-6.
29. `nrs2002` — NRS-2002: nutrition risk + disease severity. ≥3 = at risk.
30. `mna` — MNA / MNA-SF (<12 = at risk, <8 = malnourished).
31. `sga` — SGA: A/B/C (well/mild-mod/severe).
32. `glim` — GLIM 2019: phenotype + etiologic criteria.
33. `strongkids` — STRONGkids (paed 0-17): 0-5 points.
34. `nutric` — NUTRIC score (ICU): 0-10.

### ВТЭ / Кровотечение (9)
35. `geneva` — Geneva revised / simplified: PE pretest, 0-11.
36. `years` — YEARS: 3-item PE rule-out + D-dimer.
37. `4t` — 4T score for HIT (heparin-induced thrombocytopenia). 0-8.
38. `padua` — Padua Prediction Score (medical VTE). ≥4 = high risk.
39. `caprini` — Caprini RAM surgical VTE. 0-5, 5-8, ≥9 bands.
40. `rcog-vte` — RCOG VTE in pregnancy: antenatal + postnatal scores.
41. `khorana` — Khorana: cancer VTE. 0-7.
42. `improve-bleed` — IMPROVE bleeding risk in hospitalised.
43. `pesi` — PESI / sPESI: PE severity / mortality prediction.

### Периоперационная (4)
44. `charlson` — Charlson Comorbidity Index: 17 conditions, weighted. Age-adjusted variant. Elixhauser alt. Van Walraven variant.
45. `possum` — POSSUM physiological + operative severity. P-POSSUM variant.
46. `nsqip` — ACS NSQIP surgical risk calculator: ~20 variables.
47. `clavien` — Clavien-Dindo I-V + CCI (Comprehensive Complication Index).

### Делирий (2)
48. `cam` — CAM Inouye: 4 features, ≥3 = delirium. Variants: CAM-ICU, 3D-CAM, b-CAM.
49. `4at` — 4AT: alertness/AMT4/attention/change. ≥4 = probable delirium. Also DOS, ICDSC, Nu-DESC.

## Structural requirements per tool (from RUNNER_TEMPLATE)

Every runner:
- `kind: 'score'` or `'calculator'`
- `inputs` with points or units
- `bands` (score) OR `compute()` (calculator)
- `maxScore` (score)
- `reference`, `countries`, `info`, `presets`
- `caveats` (2-4 items)
- `related` (2-3 tool ids, from valid list in tool catalogue)
- `relatedCourses` (0-3 course ids, only if genuine)
- For calculator: `details`, `actions`, `scale` per band within compute()
- For score: `details`, `actions` on ≥1 high-clinical-impact band

## Clinical accuracy (LEGAL — must be correct)

Each cutoff/band/threshold MUST match its original source:
- ESI: Gilboy et al 2020 (AHRQ handbook)
- NEWS2: RCP 2017
- MEWS: Subbe et al 2001
- Wells/Geneva: Le Gal 2006
- 4T: Warkentin 2003
- Padua: Barbar 2010
- Caprini: Caprini 2005 (updated 2010)
- PESI: Aujesky 2005, sPESI: Jiménez 2010
- Charlson: Charlson 1987 (age-adjusted 1994)
- CAM: Inouye 1990
- 4AT: Bellelli 2014
- FLACC: Merkel 1997
- PAINAD: Warden 2003
- DN4: Bouhassira 2005
- CFS: Rockwood 2005 / Clin Frailty 2020 update
- Barthel: Mahoney/Barthel 1965
- KPS: Karnofsky 1948 (McGraw-Hill ed 1975)
- MUST: BAPEN 2003
- NRS-2002: Kondrup 2003
- GLIM: Cederholm 2019

## Where to insert

Append all 49 runners at the END of `TOOL_RUNNERS` object just before the closing `};`.

## Workflow

1. Read `docs/RUNNER_TEMPLATE.md`
2. Read 2–3 score examples (news2, wells-dvt, chads-vasc)
3. Implement each runner using the template
4. Verify with `npx tsc --noEmit` at the end
5. Report: list of all 49 ids with 1-line each

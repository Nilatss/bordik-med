# Graph Report - bordik-med  (2026-05-06)

## Corpus Check
- 976 files · ~1,428,742 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2202 nodes · 2269 edges · 950 communities (931 shown, 19 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b20fa22`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 137|Community 137]]
- [[_COMMUNITY_Community 139|Community 139]]
- [[_COMMUNITY_Community 947|Community 947]]
- [[_COMMUNITY_Community 948|Community 948]]
- [[_COMMUNITY_Community 949|Community 949]]

## God Nodes (most connected - your core abstractions)
1. `fetch()` - 26 edges
2. `lookupPath()` - 24 edges
3. `lookupPath()` - 24 edges
4. `getSupabaseServerClient()` - 17 edges
5. `open()` - 15 edges
6. `isDir()` - 15 edges
7. `open()` - 15 edges
8. `isDir()` - 15 edges
9. `Spec: Guidelines Catalog` - 15 edges
10. `findBand()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `loadIcdIndex()` --calls--> `fetch()`  [INFERRED]
  components/search/CommandPalette.tsx → public/sw.js
- `loadCatalogMeta()` --calls--> `fetch()`  [INFERRED]
  components/search/CommandPalette.tsx → public/sw.js
- `fetchPublished()` --calls--> `fetch()`  [INFERRED]
  scripts/snapshot-content.mjs → public/sw.js
- `P0-1 GFR Infinity Guard` --semantically_similar_to--> `P0-CQ-1 Golden tests on CRITICAL_TOOL_IDS`  [INFERRED] [semantically similar]
  AUDIT_REPORT_2026-05-06.md → docs/AUDIT_PASS_4_TODO.md
- `P0-2 740 runners @ts-nocheck` --semantically_similar_to--> `P1-CQ-1 noUncheckedIndexedAccess + exactOptionalPropertyTypes`  [INFERRED] [semantically similar]
  AUDIT_REPORT_2026-05-06.md → docs/AUDIT_PASS_4_TODO.md

## Hyperedges (group relationships)
- **P0 audit findings (medical safety)** — audit_p0_1_gfr_guard, audit_p0_2_ts_nocheck, p0_cq_1_golden_tests [INFERRED 0.85]
- **Content roadmap killer features** — drug_interaction_checker, dose_adjustment, pediatric_doses, guidelines_catalog, icd10_classifications_hub [EXTRACTED 1.00]
- **AUDIT_PASS_4 Sprint 0 P0 items** — p0_sec_1_gemini_query, p0_sec_2_abort_controller, p0_sec_3_upstash, p0_sec_4_atomic_delete, p0_sec_5_output_guard, p0_cq_1_golden_tests, p0_devops_1_sentry [EXTRACTED 1.00]
- **Drug Interactions verification workflow** — concept_drug_interaction_checker, concept_k1_verify, spec_drug_interactions, concept_cr_1_hardcode [EXTRACTED 1.00]
- **UI design system tokens** — ui_kit, ui_guidelines, concept_callout_pattern, concept_neutral_by_default, concept_brand_blue [EXTRACTED 1.00]
- **Course module 1.1 foundational topics** — concept_homeostasis, concept_poiseuille, concept_mendel_inheritance, concept_action_potential, concept_sensitivity_specificity, concept_biopsychosocial, concept_ebbinghaus [EXTRACTED 1.00]

## Communities (950 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (37): analyzePath(), convertReturnValue(), findObject(), fromWireType(), getMounts(), makeBlendComponent(), makeBlendState(), makeBufferEntry() (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (37): analyzePath(), convertReturnValue(), findObject(), fromWireType(), getMounts(), makeBlendComponent(), makeBlendState(), makeBufferEntry() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (12): deviceCategory(), effectiveConnection(), reportToolTimeToResult(), buildCategoryCounts(), buildCountryCounts(), buildSubcategoryCounts(), countryFlag(), countryMatches() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): GET(), captureToSentry(), classifyDirective(), looksSuspicious(), POST(), DELETE(), POST(), buildFinalizePrompt() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (40): chdir(), chmod(), create(), createDataFile(), createFile(), createNode(), createStandardStreams(), destroyNode() (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (23): _addSyncListener(), addToPrecacheList(), cacheDidUpdate(), cachedResponseWillBeUsed(), constructor(), createHandlerBoundToUrl(), el(), er() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (30): chdir(), createNode(), destroyNode(), flagsToPermissionString(), hashAddNode(), hashName(), hashRemoveNode(), isBlkdev() (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (14): ampToDb(), loop(), tick(), detectHeadphones(), runCalibration(), samplePatch(), tick(), updateHints() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (25): b(), cacheMatch(), cachePut(), _ensureResponseSafeToCache(), fetch(), fetchAndCachePut(), findMatchingRoute(), getCacheKey() (+17 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (14): SupabaseSyncMounter(), signOut(), recordConsent(), fullLogout(), enqueueSync(), flushSyncQueue(), hasPendingSync(), readQueue() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (16): getModuleById(), cleanTerm(), extractKeyTerms(), extractSentences(), generateContentQuestions(), getCourseTestSlice(), getModuleTestSlice(), hashString() (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.1
Nodes (22): createStream(), doMsync(), dupStream(), _fd_read(), _fd_write(), getattr(), getStreamFromFD(), ioctl() (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (21): chmod(), create(), createDataFile(), createDefaultDevices(), createDefaultDirectories(), createDevice(), createFile(), createPath() (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (5): isValidEmail(), normalizeLang(), useLang(), useT(), commit()

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (20): abort(), assert(), close(), closeStream(), createLazyFile(), expandFileStorage(), _fd_close(), _fd_seek() (+12 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (20): abort(), assert(), close(), closeStream(), createLazyFile(), expandFileStorage(), _fd_close(), _fd_seek() (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (19): checkOpExists(), chown(), doChmod(), doChown(), doSetAttr(), doTruncate(), fchmod(), fchown() (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (19): createStream(), doMsync(), dupStream(), _fd_read(), _fd_write(), getStreamFromFD(), ioctl(), ioctl_tcgets() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (7): formatCooldown(), formatTimer(), getCooldownRemaining(), gradeModuleTest(), gradeTest(), getHighestPassedLevel(), isModuleTestUnlocked()

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (16): delete(), deleteCacheAndMetadata(), deleteEntry(), em(), expireEntries(), f(), g(), getAll() (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.27
Nodes (10): bulkCacheTools(), cacheTool(), getCacheSizeBytes(), hasCacheStorage(), isToolCached(), TOOL_URL(), uncacheTool(), start() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.16
Nodes (3): createContext(), ExceptionInfo, initRuntime()

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (15): checkOpExists(), chown(), doChmod(), doChown(), doSetAttr(), fchmod(), fchown(), ftruncate() (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.21
Nodes (15): calculateAt(), fstat(), getattr(), getStr(), isChrdev(), isDevice(), lstat(), stat() (+7 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (3): createContext(), ExceptionInfo, initRuntime()

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (15): ACC/AHA COR/LOE classification, ATLS 11th Edition (xABCDE), CHA2DS2-VASc / CHA2DS2-VA, Dose Adjustment CKD/Liver (K2), ESC ACS 2023, ESC AF 2024 (AF-CARE), GINA 2025 Asthma, GOLD 2025 COPD (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.21
Nodes (7): getCourseById(), getCourseSearchIndex(), getModuleForCourse(), getModulesBySection(), getSectionById(), searchCourses(), useStudyTimer()

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (14): addEntry(), _addRequest(), clone(), fetchDidFail(), fromRequest(), getFirstEntryId(), pushEntry(), pushRequest() (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.3
Nodes (13): buildSlices(), emitFile(), emitIndex(), findCoursesWithContent(), geminiCall(), generateForCourse(), generateViaAnthropic(), generateViaGemini() (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (13): _awaitComplete(), d(), destroy(), doneWaiting(), _getResponse(), handleAll(), M(), N() (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.21
Nodes (13): Classifications Hub (#3a), Cmd-K global fuzzy search, CR-1 hardcoded '83 pairs' bug, CredibleMeds QT scale, Drug Interaction Checker (K1), ICD-10 Lookup (МКБ-10), K1-Verify (clinical pharmacologist audit), North Star Metric (WAU-врачей) (+5 more)

### Community 31 - "Community 31"
Cohesion: 0.26
Nodes (12): createDefaultDevices(), createDefaultDirectories(), createDevice(), createPath(), createSpecialDirectories(), mkdev(), mkdir(), mkdirTree() (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.2
Nodes (12): AUDIT_TODO_2026-05 product audit, CONTENT_ROADMAP killer features, #2 Dose adjustment renal/hepatic, #1 Drug Interaction Checker, ФЗ № 28-ФЗ 28.02.2025 (regulatory risk), #5 Guidelines catalog (~250 docs), #3a Unified ICD/МКБ classifications hub, МКБ-10 lookup (T6) (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (12): ACC/AHA ACS 2025 Guideline, Action potential (потенциал действия), ASCVD Risk Estimator / PREVENT, Biopsychosocial model, Ebbinghaus forgetting curve / Anki, GRACE / TIMI / HEART scores, Homeostasis (gomeostaz), Mendel inheritance patterns (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.27
Nodes (10): AMBOSS (competitor), Freemium MDCalc-style monetization, ФЗ № 28-ФЗ regulation, MDCalc (competitor), Pediatric Dose Calc (K3), RAG AI Explanations, UpToDate (competitor), USMLE-style Vignette Cases (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.24
Nodes (10): Brand blue #2563EB, Calculator tooltips (info icons), Callout pattern (info/warn/error/success), <Highlight/> shared component, Main container 32px rounding, Neutral-by-default color rule, Provenance block (source + date), TODO Pass 2 (UX/UI polish) (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.31
Nodes (4): clearState(), loadState(), saveState(), storageKey()

### Community 38 - "Community 38"
Cohesion: 0.31
Nodes (5): fireVisibilityViolation(), handleBlur(), handleKeydown(), handleVisibility(), isViolationKey()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (5): countryFlag(), countryMatches(), countryMeta(), matchCountry(), primaryCountriesFor()

### Community 41 - "Community 41"
Cohesion: 0.28
Nodes (9): getEndEntryFromIndex(), getFirstEntryByQueueName(), getLastEntryByQueueName(), popEntry(), popRequest(), _removeEntry(), _removeRequest(), shiftEntry() (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.39
Nodes (9): calculateAt(), getStr(), lstat(), stat(), ___syscall_lstat64(), ___syscall_newfstatat(), ___syscall_openat(), ___syscall_stat64() (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (9): AUDIT_REPORT_2026-05-06, P0-1 GFR Infinity Guard, P0-2 740 runners @ts-nocheck, P1-1 aa-grad vs aa-gradient duplicate, P1-3 Scale segments 288 issues, P1-4 SI/US unit conversion not centralized, P1-6 Large files split candidates, P0-CQ-1 Golden tests on CRITICAL_TOOL_IDS (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (9): BACKLOG.md post-audit, 152-FZ ст.21 24h Roskomnadzor notification, GDPR Art.33 72h notification, P0-SEC-3 In-memory rate-limit -> Upstash, Secret rotation schedule, SECURITY_SETUP IR runbook, Subprocessors (Supabase/Vercel/Google/Resend/Cloudflare), Test coverage 948 tests / 181 tools (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (9): P1-5 /api/sync POST missing assertSameOrigin, AUDIT_PASS_4_TODO (29 findings), P0-DEVOPS-1 Sentry+RUM+Uptime, P0-SEC-1 GEMINI_API_KEY in query string, P0-SEC-2 Cascaded fallback timeout, P0-SEC-4 atomic /api/account/delete RPC, P0-SEC-5 DOMParser output guard, P1-SEC-1 CSP Report-Only -> Enforce (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (9): BATCH2_BRIEF 49 diagnostic scales, kind:'calculator' formula contract, CAM / 4AT delirium tools, Charlson Comorbidity Index, ESI v.5 triage runner, NEWS2 / MEWS / PEWS early warning, ResultCard rendering order, RUNNER_TEMPLATE for tools-runners.ts (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.36
Nodes (4): fetchLatestRelease(), onReady(), onWaiting(), readLastSeen()

### Community 48 - "Community 48"
Cohesion: 0.32
Nodes (4): loadCatalogMeta(), loadIcdIndex(), expandQuery(), normalize()

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (8): createWasm(), findWasmBinary(), getBinarySync(), getWasmBinary(), getWasmImports(), instantiateArrayBuffer(), instantiateAsync(), locateFile()

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (8): createWasm(), findWasmBinary(), getBinarySync(), getWasmBinary(), getWasmImports(), instantiateArrayBuffer(), instantiateAsync(), locateFile()

### Community 51 - "Community 51"
Cohesion: 0.46
Nodes (7): loadReferenceFor(), main(), parseCatalog(), parseMeta(), sha(), todayIso(), unescapeString()

### Community 52 - "Community 52"
Cohesion: 0.39
Nodes (5): decodeText(), isListPara(), paragraphToMd(), paraStyle(), paraText()

### Community 53 - "Community 53"
Cohesion: 0.25
Nodes (8): P1-2 Golden test coverage 5%, Em-dash -> hyphen normalization, next-pwa dead dependency 5 high CVE, 12 orphan runners not in catalog, scripts/smoke-runners.mjs, STRESS_TEST_TODO 14 items, TestGuard consent + grace 10s + 48h lockout, TestActiveView 60-min timer + back nav

### Community 56 - "Community 56"
Cohesion: 0.48
Nodes (5): fetchJson(), getCatalog(), getManifest(), getToolDetail(), TOOL_DETAIL_URL()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (3): useCatalog(), formatStudyTime(), getTotalStudyTime()

### Community 58 - "Community 58"
Cohesion: 0.48
Nodes (5): evalNode(), parse(), safeEval(), tokenize(), validateDslSpec()

### Community 59 - "Community 59"
Cohesion: 0.38
Nodes (3): body(), geminiBatch(), PROMPT_FOR_TOPIC()

### Community 61 - "Community 61"
Cohesion: 0.47
Nodes (6): getFullscreenElement(), setCanvasSize(), setFullscreenCanvasSize(), setWindowedCanvasSize(), updateCanvasDimensions(), updateResizeListeners()

### Community 62 - "Community 62"
Cohesion: 0.47
Nodes (6): getFullscreenElement(), setCanvasSize(), setFullscreenCanvasSize(), setWindowedCanvasSize(), updateCanvasDimensions(), updateResizeListeners()

### Community 63 - "Community 63"
Cohesion: 0.53
Nodes (4): fixInfoBlock(), joinSections(), splitByHeadings(), transformBody()

### Community 65 - "Community 65"
Cohesion: 0.6
Nodes (3): deviceCategory(), effectiveConnection(), reportMetric()

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (5): calculateMouseCoords(), calculateMouseEvent(), getMovementX(), getMovementY(), setMouseCoords()

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (5): calculateMouseCoords(), calculateMouseEvent(), getMovementX(), getMovementY(), setMouseCoords()

### Community 68 - "Community 68"
Cohesion: 0.4
Nodes (5): CLAUDE.md project memory, Graphify code-graph integration, html2canvas over autoTable (Cyrillic fonts), Bordik Memory System (claude-code adaptation), PDF download for reference tables

### Community 69 - "Community 69"
Cohesion: 0.4
Nodes (5): BACKEND.md Supabase setup, docs/README.md index, P1-SEC-3 RLS versions leak, supabase/schema.sql (5 tables), Supabase RLS as only access control

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (5): claude-code-memory-setup pattern, /resume and /save commands, Session: memory-system setup, Sessions README, Sessions Template

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (3): getArticle(), getAvailableLessonTypes(), hasContent()

### Community 73 - "Community 73"
Cohesion: 0.83
Nodes (3): displayEmoji(), displayLabel(), findOption()

### Community 74 - "Community 74"
Cohesion: 0.83
Nodes (3): emit(), isRedactKey(), sanitizeValue()

### Community 78 - "Community 78"
Cohesion: 0.83
Nodes (3): parseInput(), pickHint(), processFile()

### Community 80 - "Community 80"
Cohesion: 0.83
Nodes (3): collectStrings(), stripAsterisks(), visit()

### Community 83 - "Community 83"
Cohesion: 0.5
Nodes (4): LCP StorageBanner late render, PERF_DIAGNOSTIC baseline, SSR SectionCards LCP fix (PR #16/#17), Supabase chunk 92% unused on home

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (4): editor_role (med_editor/med_reviewer/auditor), Supabase RLS hardening, supa_audit + 4-eye review, Supabase README

## Knowledge Gaps
- **72 isolated node(s):** `P1-1 aa-grad vs aa-gradient duplicate`, `P1-3 Scale segments 288 issues`, `P1-4 SI/US unit conversion not centralized`, `P1-6 Large files split candidates`, `html2canvas over autoTable (Cyrillic fonts)` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetch()` connect `Community 8` to `Community 96`, `Community 3`, `Community 5`, `Community 59`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 56`, `Community 27`, `Community 28`, `Community 29`, `Community 94`, `Community 95`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `instantiateAsync()` connect `Community 49` to `Community 0`, `Community 8`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `instantiateAsync()` connect `Community 50` to `Community 8`, `Community 1`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `fetch()` (e.g. with `geminiCall()` and `POST()`) actually correct?**
  _`fetch()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `getSupabaseServerClient()` (e.g. with `POST()` and `DELETE()`) actually correct?**
  _`getSupabaseServerClient()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `P1-1 aa-grad vs aa-gradient duplicate`, `P1-3 Scale segments 288 issues`, `P1-4 SI/US unit conversion not centralized` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
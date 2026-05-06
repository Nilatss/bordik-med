# Graph Report - .  (2026-05-06)

## Corpus Check
- Large corpus: 1042 files · ~1,412,909 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 2185 nodes · 2259 edges · 944 communities (928 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_MediaPipe WASM (vision SIMD)|MediaPipe WASM (vision SIMD)]]
- [[_COMMUNITY_MediaPipe WASM (vision noSIMD)|MediaPipe WASM (vision noSIMD)]]
- [[_COMMUNITY_API routes & middleware|API routes & middleware]]
- [[_COMMUNITY_Tool view & diagnostics|Tool view & diagnostics]]
- [[_COMMUNITY_WASM filesystem ops|WASM filesystem ops]]
- [[_COMMUNITY_Service Worker (Serwist)|Service Worker (Serwist)]]
- [[_COMMUNITY_Test proctoring & consent|Test proctoring & consent]]
- [[_COMMUNITY_SW cache strategies|SW cache strategies]]
- [[_COMMUNITY_WASM hash & node ops|WASM hash & node ops]]
- [[_COMMUNITY_Auth sync & logout|Auth sync & logout]]
- [[_COMMUNITY_Sidebar nav & i18n|Sidebar nav & i18n]]
- [[_COMMUNITY_WASM device factory|WASM device factory]]
- [[_COMMUNITY_WASM stream  FD ops|WASM stream / FD ops]]
- [[_COMMUNITY_Question generator|Question generator]]
- [[_COMMUNITY_Tools catalog & filters|Tools catalog & filters]]
- [[_COMMUNITY_SW cache expiration|SW cache expiration]]
- [[_COMMUNITY_WASM file checks|WASM file checks]]
- [[_COMMUNITY_WASM streams (noSIMD)|WASM streams (noSIMD)]]
- [[_COMMUNITY_WASM file checks (noSIMD)|WASM file checks (noSIMD)]]
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
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
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
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 139|Community 139]]
- [[_COMMUNITY_Community 941|Community 941]]
- [[_COMMUNITY_Community 942|Community 942]]
- [[_COMMUNITY_Community 943|Community 943]]

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

## Communities (944 total, 16 thin omitted)

### Community 0 - "MediaPipe WASM (vision SIMD)"
Cohesion: 0.02
Nodes (36): analyzePath(), convertReturnValue(), ExitStatus, findObject(), fromWireType(), makeBlendComponent(), makeBlendState(), makeBufferEntry() (+28 more)

### Community 1 - "MediaPipe WASM (vision noSIMD)"
Cohesion: 0.02
Nodes (35): analyzePath(), convertReturnValue(), findObject(), fromWireType(), makeBlendComponent(), makeBlendState(), makeBufferEntry(), makeColorAttachment() (+27 more)

### Community 2 - "API routes & middleware"
Cohesion: 0.07
Nodes (28): GET(), captureToSentry(), classifyDirective(), looksSuspicious(), POST(), DELETE(), POST(), buildFinalizePrompt() (+20 more)

### Community 3 - "Tool view & diagnostics"
Cohesion: 0.05
Nodes (5): deviceCategory(), effectiveConnection(), reportToolTimeToResult(), safeUrlTransform(), findBand()

### Community 4 - "WASM filesystem ops"
Cohesion: 0.11
Nodes (38): chdir(), chmod(), create(), createDataFile(), createFile(), createLazyFile(), createStandardStreams(), destroyNode() (+30 more)

### Community 5 - "Service Worker (Serwist)"
Cohesion: 0.1
Nodes (19): _addSyncListener(), addToPrecacheList(), constructor(), createHandlerBoundToUrl(), el(), er(), ey(), fetchDidFail() (+11 more)

### Community 6 - "Test proctoring & consent"
Cohesion: 0.14
Nodes (14): ampToDb(), loop(), tick(), detectHeadphones(), runCalibration(), samplePatch(), tick(), updateHints() (+6 more)

### Community 7 - "SW cache strategies"
Cohesion: 0.14
Nodes (25): b(), cacheMatch(), cachePut(), _ensureResponseSafeToCache(), fetch(), fetchAndCachePut(), findMatchingRoute(), getCacheKey() (+17 more)

### Community 8 - "WASM hash & node ops"
Cohesion: 0.16
Nodes (26): chdir(), destroyNode(), flagsToPermissionString(), getMounts(), hashAddNode(), hashName(), hashRemoveNode(), isDir() (+18 more)

### Community 9 - "Auth sync & logout"
Cohesion: 0.12
Nodes (14): SupabaseSyncMounter(), signOut(), recordConsent(), fullLogout(), enqueueSync(), flushSyncQueue(), hasPendingSync(), readQueue() (+6 more)

### Community 10 - "Sidebar nav & i18n"
Cohesion: 0.13
Nodes (5): isValidEmail(), normalizeLang(), useLang(), useT(), commit()

### Community 11 - "WASM device factory"
Cohesion: 0.17
Nodes (20): chmod(), create(), createDataFile(), createDefaultDevices(), createDefaultDirectories(), createDevice(), createFile(), createPath() (+12 more)

### Community 12 - "WASM stream / FD ops"
Cohesion: 0.12
Nodes (20): abort(), assert(), close(), closeStream(), createLazyFile(), expandFileStorage(), _fd_close(), _fd_seek() (+12 more)

### Community 13 - "Question generator"
Cohesion: 0.21
Nodes (16): getModuleById(), cleanTerm(), extractKeyTerms(), extractSentences(), generateContentQuestions(), getCourseTestSlice(), getModuleTestSlice(), hashString() (+8 more)

### Community 14 - "Tools catalog & filters"
Cohesion: 0.15
Nodes (8): buildCategoryCounts(), buildCountryCounts(), buildSubcategoryCounts(), countryFlag(), countryMatches(), matchCountry(), primaryCountriesFor(), useToolSearch()

### Community 15 - "SW cache expiration"
Cohesion: 0.13
Nodes (19): delete(), deleteCacheAndMetadata(), deleteEntry(), expireEntries(), f(), g(), getAll(), getAllEntriesByQueueName() (+11 more)

### Community 16 - "WASM file checks"
Cohesion: 0.13
Nodes (19): checkOpExists(), chown(), doChmod(), doChown(), doSetAttr(), doTruncate(), fchmod(), fchown() (+11 more)

### Community 17 - "WASM streams (noSIMD)"
Cohesion: 0.13
Nodes (19): abort(), assert(), close(), closeStream(), expandFileStorage(), _fd_close(), _fd_seek(), forceLoadFile() (+11 more)

### Community 18 - "WASM file checks (noSIMD)"
Cohesion: 0.14
Nodes (17): checkOpExists(), chown(), doChmod(), doChown(), doSetAttr(), fchmod(), fchown(), fstat() (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (7): formatCooldown(), formatTimer(), getCooldownRemaining(), gradeModuleTest(), gradeTest(), getHighestPassedLevel(), isModuleTestUnlocked()

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (16): createStream(), doMsync(), dupStream(), _fd_read(), _fd_write(), getStreamFromFD(), ioctl(), ioctl_tcgets() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (16): createStream(), doMsync(), dupStream(), _fd_read(), _fd_write(), getStreamFromFD(), ioctl(), ioctl_tcgets() (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (10): bulkCacheTools(), cacheTool(), getCacheSizeBytes(), hasCacheStorage(), isToolCached(), TOOL_URL(), uncacheTool(), start() (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (3): createContext(), ExceptionInfo, initRuntime()

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (3): createContext(), ExceptionInfo, initRuntime()

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (15): ACC/AHA COR/LOE classification, ATLS 11th Edition (xABCDE), CHA2DS2-VASc / CHA2DS2-VA, Dose Adjustment CKD/Liver (K2), ESC ACS 2023, ESC AF 2024 (AF-CARE), GINA 2025 Asthma, GOLD 2025 COPD (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.3
Nodes (13): buildSlices(), emitFile(), emitIndex(), findCoursesWithContent(), geminiCall(), generateForCourse(), generateViaAnthropic(), generateViaGemini() (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.21
Nodes (13): addEntry(), _addRequest(), clone(), fromRequest(), getFirstEntryId(), pushEntry(), registerSync(), replayRequests() (+5 more)

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (13): _awaitComplete(), d(), destroy(), doneWaiting(), _getResponse(), handleAll(), M(), N() (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.21
Nodes (13): Classifications Hub (#3a), Cmd-K global fuzzy search, CR-1 hardcoded '83 pairs' bug, CredibleMeds QT scale, Drug Interaction Checker (K1), ICD-10 Lookup (МКБ-10), K1-Verify (clinical pharmacologist audit), North Star Metric (WAU-врачей) (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (12): createNode(), createStandardStreams(), getattr(), init(), isBlkdev(), isChrdev(), isDevice(), isFIFO() (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.26
Nodes (12): createDefaultDevices(), createDefaultDirectories(), createDevice(), createPath(), createSpecialDirectories(), mkdev(), mkdir(), mkdirTree() (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (12): AUDIT_PASS_4_TODO (29 findings), BACKEND.md Supabase setup, docs/README.md index, P0-DEVOPS-1 Sentry+RUM+Uptime, P0-SEC-2 Cascaded fallback timeout, P0-SEC-4 atomic /api/account/delete RPC, P0-SEC-5 DOMParser output guard, P1-SEC-1 CSP Report-Only -> Enforce (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.2
Nodes (12): AUDIT_TODO_2026-05 product audit, CONTENT_ROADMAP killer features, #2 Dose adjustment renal/hepatic, #1 Drug Interaction Checker, ФЗ № 28-ФЗ 28.02.2025 (regulatory risk), #5 Guidelines catalog (~250 docs), #3a Unified ICD/МКБ classifications hub, МКБ-10 lookup (T6) (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (12): ACC/AHA ACS 2025 Guideline, Action potential (потенциал действия), ASCVD Risk Estimator / PREVENT, Biopsychosocial model, Ebbinghaus forgetting curve / Anki, GRACE / TIMI / HEART scores, Homeostasis (gomeostaz), Mendel inheritance patterns (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.27
Nodes (6): getCourseById(), getCourseSearchIndex(), getModuleForCourse(), getModulesBySection(), getSectionById(), searchCourses()

### Community 36 - "Community 36"
Cohesion: 0.2
Nodes (11): cacheDidUpdate(), cachedResponseWillBeUsed(), em(), _getCacheExpiration(), _getDateHeaderTimestamp(), _getId(), getTimestamp(), _isResponseDateFresh() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (11): createNode(), getattr(), isBlkdev(), isChrdev(), isDevice(), isFIFO(), isFile(), isLink() (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (11): AUDIT_REPORT_2026-05-06, P0-1 GFR Infinity Guard, P0-2 740 runners @ts-nocheck, P1-1 aa-grad vs aa-gradient duplicate, P1-3 Scale segments 288 issues, P1-4 SI/US unit conversion not centralized, P1-5 /api/sync POST missing assertSameOrigin, P1-6 Large files split candidates (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.36
Nodes (10): calculateAt(), getStr(), lstat(), stat(), ___syscall_faccessat(), ___syscall_lstat64(), ___syscall_newfstatat(), ___syscall_openat() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.36
Nodes (10): calculateAt(), getStr(), lstat(), stat(), ___syscall_faccessat(), ___syscall_lstat64(), ___syscall_newfstatat(), ___syscall_openat() (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.27
Nodes (10): AMBOSS (competitor), Freemium MDCalc-style monetization, ФЗ № 28-ФЗ regulation, MDCalc (competitor), Pediatric Dose Calc (K3), RAG AI Explanations, UpToDate (competitor), USMLE-style Vignette Cases (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (10): Brand blue #2563EB, Calculator tooltips (info icons), Callout pattern (info/warn/error/success), <Highlight/> shared component, Main container 32px rounding, Neutral-by-default color rule, Provenance block (source + date), TODO Pass 2 (UX/UI polish) (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.31
Nodes (4): clearState(), loadState(), saveState(), storageKey()

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (5): fireVisibilityViolation(), handleBlur(), handleKeydown(), handleVisibility(), isViolationKey()

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (5): countryFlag(), countryMatches(), countryMeta(), matchCountry(), primaryCountriesFor()

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (9): BATCH2_BRIEF 49 diagnostic scales, kind:'calculator' formula contract, CAM / 4AT delirium tools, Charlson Comorbidity Index, ESI v.5 triage runner, NEWS2 / MEWS / PEWS early warning, ResultCard rendering order, RUNNER_TEMPLATE for tools-runners.ts (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.36
Nodes (4): fetchLatestRelease(), onReady(), onWaiting(), readLastSeen()

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (5): splitIntoTabs(), getArticle(), getAvailableLessonTypes(), hasContent(), useStudyTimer()

### Community 50 - "Community 50"
Cohesion: 0.32
Nodes (4): loadCatalogMeta(), loadIcdIndex(), expandQuery(), normalize()

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (8): createWasm(), findWasmBinary(), getBinarySync(), getWasmBinary(), getWasmImports(), instantiateArrayBuffer(), instantiateAsync(), locateFile()

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (8): createWasm(), findWasmBinary(), getBinarySync(), getWasmBinary(), getWasmImports(), instantiateArrayBuffer(), instantiateAsync(), locateFile()

### Community 53 - "Community 53"
Cohesion: 0.46
Nodes (7): loadReferenceFor(), main(), parseCatalog(), parseMeta(), sha(), todayIso(), unescapeString()

### Community 54 - "Community 54"
Cohesion: 0.39
Nodes (5): decodeText(), isListPara(), paragraphToMd(), paraStyle(), paraText()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (3): useCatalog(), formatStudyTime(), getTotalStudyTime()

### Community 58 - "Community 58"
Cohesion: 0.48
Nodes (5): fetchJson(), getCatalog(), getManifest(), getToolDetail(), TOOL_DETAIL_URL()

### Community 59 - "Community 59"
Cohesion: 0.48
Nodes (5): evalNode(), parse(), safeEval(), tokenize(), validateDslSpec()

### Community 60 - "Community 60"
Cohesion: 0.38
Nodes (3): body(), geminiBatch(), PROMPT_FOR_TOPIC()

### Community 62 - "Community 62"
Cohesion: 0.47
Nodes (6): getFullscreenElement(), setCanvasSize(), setFullscreenCanvasSize(), setWindowedCanvasSize(), updateCanvasDimensions(), updateResizeListeners()

### Community 63 - "Community 63"
Cohesion: 0.47
Nodes (6): getFullscreenElement(), setCanvasSize(), setFullscreenCanvasSize(), setWindowedCanvasSize(), updateCanvasDimensions(), updateResizeListeners()

### Community 64 - "Community 64"
Cohesion: 0.53
Nodes (4): fixInfoBlock(), joinSections(), splitByHeadings(), transformBody()

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (6): P1-2 Golden test coverage 5%, BACKLOG.md post-audit, P0-SEC-3 In-memory rate-limit -> Upstash, scripts/smoke-runners.mjs, Test coverage 948 tests / 181 tools, Vercel 100/day Hobby quota issue

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (6): Em-dash -> hyphen normalization, next-pwa dead dependency 5 high CVE, 12 orphan runners not in catalog, STRESS_TEST_TODO 14 items, TestGuard consent + grace 10s + 48h lockout, TestActiveView 60-min timer + back nav

### Community 68 - "Community 68"
Cohesion: 0.6
Nodes (3): deviceCategory(), effectiveConnection(), reportMetric()

### Community 70 - "Community 70"
Cohesion: 0.5
Nodes (5): calculateMouseCoords(), calculateMouseEvent(), getMovementX(), getMovementY(), setMouseCoords()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (5): calculateMouseCoords(), calculateMouseEvent(), getMovementX(), getMovementY(), setMouseCoords()

### Community 72 - "Community 72"
Cohesion: 0.4
Nodes (5): CLAUDE.md project memory, Graphify code-graph integration, html2canvas over autoTable (Cyrillic fonts), Bordik Memory System (claude-code adaptation), PDF download for reference tables

### Community 73 - "Community 73"
Cohesion: 0.4
Nodes (5): 152-FZ ст.21 24h Roskomnadzor notification, GDPR Art.33 72h notification, Secret rotation schedule, SECURITY_SETUP IR runbook, Subprocessors (Supabase/Vercel/Google/Resend/Cloudflare)

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (5): claude-code-memory-setup pattern, /resume and /save commands, Session: memory-system setup, Sessions README, Sessions Template

### Community 76 - "Community 76"
Cohesion: 0.83
Nodes (3): displayEmoji(), displayLabel(), findOption()

### Community 78 - "Community 78"
Cohesion: 0.83
Nodes (3): emit(), isRedactKey(), sanitizeValue()

### Community 81 - "Community 81"
Cohesion: 0.83
Nodes (3): parseInput(), pickHint(), processFile()

### Community 83 - "Community 83"
Cohesion: 0.83
Nodes (3): collectStrings(), stripAsterisks(), visit()

### Community 86 - "Community 86"
Cohesion: 0.5
Nodes (4): LCP StorageBanner late render, PERF_DIAGNOSTIC baseline, SSR SectionCards LCP fix (PR #16/#17), Supabase chunk 92% unused on home

### Community 87 - "Community 87"
Cohesion: 0.5
Nodes (4): editor_role (med_editor/med_reviewer/auditor), Supabase RLS hardening, supa_audit + 4-eye review, Supabase README

## Knowledge Gaps
- **72 isolated node(s):** `P1-1 aa-grad vs aa-gradient duplicate`, `P1-3 Scale segments 288 issues`, `P1-4 SI/US unit conversion not centralized`, `P1-6 Large files split candidates`, `html2canvas over autoTable (Cyrillic fonts)` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetch()` connect `SW cache strategies` to `Community 96`, `Community 97`, `API routes & middleware`, `Community 98`, `Community 26`, `Service Worker (Serwist)`, `Community 60`, `Community 48`, `Community 50`, `Community 51`, `Community 52`, `Community 58`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `instantiateAsync()` connect `Community 51` to `MediaPipe WASM (vision SIMD)`, `SW cache strategies`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `instantiateAsync()` connect `Community 52` to `MediaPipe WASM (vision noSIMD)`, `SW cache strategies`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `fetch()` (e.g. with `geminiCall()` and `POST()`) actually correct?**
  _`fetch()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `getSupabaseServerClient()` (e.g. with `POST()` and `DELETE()`) actually correct?**
  _`getSupabaseServerClient()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `P1-1 aa-grad vs aa-gradient duplicate`, `P1-3 Scale segments 288 issues`, `P1-4 SI/US unit conversion not centralized` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MediaPipe WASM (vision SIMD)` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
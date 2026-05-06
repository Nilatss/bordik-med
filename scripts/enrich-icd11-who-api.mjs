// Phase 2: обогащение МКБ-11 данными из WHO ICD-11 API.
// Подгружает definitions, RU-переводы, inclusion/exclusion, coding notes.
//
// ТРЕБУЕТ: client_id и client_secret от https://icd.who.int/icdapi
// (бесплатная регистрация ~5 минут).
//
// Использование:
//   $env:ICD_CLIENT_ID="<id>"
//   $env:ICD_CLIENT_SECRET="<secret>"
//   node scripts/enrich-icd11-who-api.mjs
//
// Скрипт идемпотентен: можно прерывать и перезапускать — он сохраняет
// прогресс в data/raw/icd11-enriched.partial.json.
//
// Длительность: ~2-3 часа на полную базу (31 632 кода @ 5 req/sec).
// Rate limit WHO API: 30 запросов/сек на токен (мы держим запас).

import fs from 'node:fs';

const CLIENT_ID = process.env.ICD_CLIENT_ID;
const CLIENT_SECRET = process.env.ICD_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set ICD_CLIENT_ID and ICD_CLIENT_SECRET environment variables.');
  console.error('Register at https://icd.who.int/icdapi to get them (free).');
  process.exit(1);
}

const TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const API_BASE = 'https://id.who.int/icd/release/11/2024-01/mms';
const RELEASE = '2024-01';
const LANG = 'ru'; // grab Russian translations

const inputPath = './public/icd11-mms.json';
const outputPath = './public/icd11-mms.json'; // overwrite same file
const partialPath = './data/raw/icd11-enriched.partial.json';

// ── OAuth token (expires 1 hour, we refresh proactively) ──────────────
let token = null;
let tokenExpires = 0;
async function getToken() {
  if (token && Date.now() < tokenExpires - 60_000) return token;
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'icdapi_access',
    }),
  });
  if (!r.ok) throw new Error(`Token fetch failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  token = j.access_token;
  tokenExpires = Date.now() + (j.expires_in * 1000);
  return token;
}

// ── Fetch single entity ─────────────────────────────────────────────────
async function fetchEntity(conceptId) {
  const t = await getToken();
  const r = await fetch(`${API_BASE}/${conceptId}`, {
    headers: {
      'Authorization': `Bearer ${t}`,
      'Accept': 'application/json',
      'Accept-Language': LANG,
      'API-Version': 'v2',
    },
  });
  if (!r.ok) {
    if (r.status === 401) { token = null; return fetchEntity(conceptId); }
    if (r.status === 404) return null;
    throw new Error(`Fetch ${conceptId} failed: ${r.status}`);
  }
  return r.json();
}

// ── Concept ID extraction from MMS code via foundation URI lookup ──────
// simpleTabulation has Foundation URI per row. We can rebuild by matching
// MMS code to the entity. Easiest: query the search endpoint by code.
async function findConceptByCode(code) {
  const t = await getToken();
  const r = await fetch(`${API_BASE}/codeinfo/${encodeURIComponent(code)}`, {
    headers: {
      'Authorization': `Bearer ${t}`,
      'Accept': 'application/json',
      'Accept-Language': LANG,
      'API-Version': 'v2',
    },
  });
  if (!r.ok) return null;
  return r.json();
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const bank = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  let partial = {};
  if (fs.existsSync(partialPath)) {
    partial = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
    console.log(`Resuming from partial: ${Object.keys(partial).length} codes already enriched`);
  }

  let done = 0;
  let failed = 0;
  const total = bank.codes.length;
  const start = Date.now();

  // We process in batches of 5 concurrent (rate-friendly)
  const BATCH = 5;
  const queue = bank.codes.filter(c => !partial[c.code]);
  console.log(`To enrich: ${queue.length} codes (${total - queue.length} cached).`);

  for (let i = 0; i < queue.length; i += BATCH) {
    const slice = queue.slice(i, i + BATCH);
    await Promise.all(slice.map(async (c) => {
      try {
        // Step 1: codeinfo to get the linearization URI
        const ci = await findConceptByCode(c.code);
        if (!ci || !ci.stemId) { failed++; return; }
        const conceptId = ci.stemId.split('/').pop();
        // Step 2: full entity in RU
        const e = await fetchEntity(conceptId);
        if (!e) { failed++; return; }
        partial[c.code] = {
          conceptId,
          title_ru: e.title?.['@value'] ?? null,
          definition_ru: e.definition?.['@value'] ?? null,
          longDefinition_ru: e.longDefinition?.['@value'] ?? null,
          codingNote_ru: e.codingNote?.['@value'] ?? null,
          inclusion: (e.inclusion ?? []).map(x => x.label?.['@value']).filter(Boolean),
          exclusion: (e.exclusion ?? []).map(x => x.label?.['@value']).filter(Boolean),
          synonyms_ru: (e.synonym ?? []).map(x => x.label?.['@value']).filter(Boolean),
        };
        done++;
      } catch (err) {
        console.error(`  ${c.code}: ${err.message}`);
        failed++;
      }
    }));

    // Save progress every 50 batches (~250 codes)
    if ((i / BATCH) % 50 === 0) {
      fs.writeFileSync(partialPath, JSON.stringify(partial, null, 0));
      const elapsed = (Date.now() - start) / 1000;
      const rate = done / elapsed;
      const eta = Math.round((queue.length - i) / rate / 60);
      console.log(`Progress: ${done}/${queue.length} (failed ${failed}) · ${rate.toFixed(1)} req/s · ETA ${eta} min`);
    }
  }

  fs.writeFileSync(partialPath, JSON.stringify(partial, null, 0));
  console.log(`\n=== DONE === Enriched: ${done}, Failed: ${failed}`);

  // Merge enriched into bank
  for (const c of bank.codes) {
    const e = partial[c.code];
    if (!e) continue;
    if (e.title_ru) c.title_ru = e.title_ru;
    if (e.definition_ru) c.definition = e.definition_ru;
    if (e.longDefinition_ru) c.longDefinition = e.longDefinition_ru;
    if (e.codingNote_ru) c.codingNote = e.codingNote_ru;
    if (e.inclusion?.length) c.inclusion = e.inclusion;
    if (e.exclusion?.length) c.exclusion = e.exclusion;
    if (e.synonyms_ru?.length) c.synonyms = e.synonyms_ru;
  }

  bank.version = '2.0.0';
  bank.lastUpdated = new Date().toISOString().slice(0, 10);
  bank.notes = 'Phase 2: обогащено через WHO ICD-11 API — RU-переводы названий + definitions + inclusion/exclusion + coding notes.';
  bank.release = RELEASE;

  const json = JSON.stringify(bank, null, 2) + '\n';
  fs.writeFileSync(outputPath, json);
  fs.writeFileSync('./data/icd11-mms.json', json);
  console.log(`\nWrote ${outputPath} (${(json.length/1024/1024).toFixed(2)} MB)`);
}

main().catch(e => { console.error(e); process.exit(1); });

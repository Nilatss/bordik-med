// Полный обход всего дерева МКБ-11 MMS 2024-01 через WHO API.
// Iterative BFS — ходит по всем chapter/block/category включая
// post-coordination и residual ветки. Идемпотентный, с partial-сохранением.

import fs from 'node:fs';

const CLIENT_ID = process.env.ICD_CLIENT_ID;
const CLIENT_SECRET = process.env.ICD_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set ICD_CLIENT_ID and ICD_CLIENT_SECRET');
  process.exit(1);
}

const TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const ROOT = 'https://id.who.int/icd/release/11/2024-01/mms';
const partialPath = './data/raw/icd11-fulltree.partial.json';

let token = null;
let tokenExpires = 0;
let tokenInflight = null; // single-flight: одна параллельная попытка
async function getToken() {
  if (token && Date.now() < tokenExpires - 60_000) return token;
  if (tokenInflight) return tokenInflight;
  tokenInflight = (async () => {
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
    if (!r.ok) throw new Error(`Token fail: ${r.status} ${await r.text()}`);
    const j = await r.json();
    token = j.access_token;
    tokenExpires = Date.now() + (j.expires_in * 1000);
    return token;
  })();
  try { return await tokenInflight; } finally { tokenInflight = null; }
}

async function fetchEntity(uri, lang = 'ru') {
  // WHO возвращает child URIs как http:// — но при редиректе на https://
  // fetch стрипает Authorization header (security). Переписываем сразу.
  if (uri.startsWith('http://')) uri = 'https://' + uri.slice(7);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const t = await getToken();
      const r = await fetch(uri, {
        headers: {
          'Authorization': 'Bearer ' + t,
          'Accept': 'application/json',
          'Accept-Language': lang,
          'API-Version': 'v2',
        },
      });
      if (r.status === 401) { token = null; await new Promise(s => setTimeout(s, 200)); continue; }
      if (r.status === 429) { await new Promise(s => setTimeout(s, 2000 * (attempt + 1))); continue; }
      if (r.status >= 500) { await new Promise(s => setTimeout(s, 1000)); continue; }
      if (!r.ok) {
        console.error(`  [HTTP ${r.status}] ${uri}`);
        return null;
      }
      return await r.json();
    } catch (e) {
      console.error(`  [throw attempt=${attempt}] ${uri}: ${e.message}`);
      if (attempt === 3) return null;
      await new Promise(s => setTimeout(s, 1000 * (attempt + 1)));
    }
  }
  console.error(`  [exhausted] ${uri}`);
  return null;
}

const visited = new Map();
let processed = 0;
let failed = 0;
const start = Date.now();

if (fs.existsSync(partialPath)) {
  const p = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
  for (const [k, v] of Object.entries(p)) visited.set(k, v);
  console.log(`Resume: ${visited.size} entities cached`);
}

function save() {
  const obj = Object.fromEntries(visited);
  fs.writeFileSync(partialPath, JSON.stringify(obj, null, 0));
}

(async () => {
  // BFS queue
  const queue = [{ uri: ROOT, parentUri: null, parentChapter: null }];
  if (visited.has(ROOT) === false) {
    // Pre-load root info
    const root = await fetchEntity(ROOT);
    console.log('Root title:', root.title?.['@value']);
    console.log('Root children:', root.child?.length);
    visited.set(ROOT, {
      id: 'mms-root',
      classKind: 'root',
      title_ru: root.title?.['@value'],
    });
    if (root.child) {
      for (const c of root.child) queue.push({ uri: c, parentUri: ROOT, parentChapter: null });
    }
  } else {
    console.log('Root already in cache, scanning queue from cache...');
    // Rebuild queue from cache: any entity with children we haven't visited yet
    for (const [uri, info] of visited.entries()) {
      if (!info?.children) continue;
      for (const c of info.children) {
        if (!visited.has(c)) queue.push({ uri: c, parentUri: uri, parentChapter: info.chapter });
      }
    }
    console.log(`Reconstructed queue: ${queue.length}`);
  }

  // Process with concurrency
  const PAR = 6;
  const inflight = new Set();

  async function processOne(item) {
    if (visited.has(item.uri)) return;
    const ent = await fetchEntity(item.uri);
    if (!ent) {
      failed++;
      visited.set(item.uri, null);
      return;
    }
    const id = item.uri.split('/').pop();
    const isChapter = ent.classKind === 'chapter';
    const chapter = isChapter ? (ent.code || id) : item.parentChapter;
    visited.set(item.uri, {
      id,
      parentUri: item.parentUri,
      classKind: ent.classKind || null,
      chapter,
      code: ent.code || null,
      blockId: ent.blockId || null,
      title_ru: ent.title?.['@value'] || null,
      definition: ent.definition?.['@value'] || null,
      longDefinition: ent.longDefinition?.['@value'] || null,
      codingNote: ent.codingNote?.['@value'] || null,
      inclusion: (ent.inclusion ?? []).map(x => x.label?.['@value']).filter(Boolean),
      exclusion: (ent.exclusion ?? []).map(x => x.label?.['@value']).filter(Boolean),
      isLeaf: !ent.child || ent.child.length === 0,
      children: ent.child || [],
    });
    processed++;
    // Enqueue children
    if (ent.child) {
      for (const c of ent.child) {
        if (!visited.has(c)) queue.push({ uri: c, parentUri: item.uri, parentChapter: chapter });
      }
    }
    if (processed % 500 === 0) {
      const elapsed = (Date.now() - start) / 1000;
      const rate = processed / elapsed;
      console.log(`Processed ${processed} (failed ${failed}), queue ${queue.length}, ${rate.toFixed(1)} req/s, total cached ${visited.size}`);
      save();
    }
  }

  while (queue.length || inflight.size) {
    while (queue.length && inflight.size < PAR) {
      const item = queue.shift();
      const p = processOne(item).catch((e) => {
        console.error(`  [processOne err] ${item.uri}: ${e.message}`);
        failed++;
      }).finally(() => inflight.delete(p));
      inflight.add(p);
    }
    if (inflight.size) {
      await Promise.race(inflight).catch(() => {});
    }
  }

  save();
  console.log(`\n=== DONE === Total: ${visited.size}, processed ${processed}, failed ${failed}`);
  console.log(`Time: ${Math.round((Date.now() - start) / 60000)} min`);
})();

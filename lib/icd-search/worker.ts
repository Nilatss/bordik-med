/**
 * ICD search worker — local-first архитектура.
 *
 * Бизнес-логика:
 *   1. Fetch slim JSON ({code, title, chapter}) с Service Worker cache
 *   2. Пытается прочитать pre-indexed bank из IndexedDB → если есть, instant load
 *   3. Иначе строит index и записывает в IndexedDB
 *   4. Принимает search-запросы из main thread через Comlink
 *   5. Lazy-fetches details (definitions/inclusion/exclusion) когда нужно
 *
 * Почему worker:
 *   - JSON.parse(13 MB) = 120ms на low-end, блокирует UI
 *   - Pre-build inverted index = 145ms, тоже блок
 *   - Search filter = 8-50ms на keystroke
 *   - Всё это пере-делано в worker → main thread ВСЕГДА 60fps
 */

import * as Comlink from 'comlink';
import { get, set } from 'idb-keyval';

interface SlimCode {
  code: string;
  title: string;
  chapter: string;
}

interface SlimBank {
  version: string;
  lastUpdated?: string;
  chapters: { id: string; range: string; title: string }[];
  codes: SlimCode[];
}

interface IndexedCode extends SlimCode {
  _codeLc: string;
  _titleLc: string;
}

interface SearchResult {
  code: string;
  title: string;
  chapter: string;
  score: number;
}

interface CodeDetails {
  definition?: string;
  longDefinition?: string;
  codingNote?: string;
  inclusion?: string[];
  exclusion?: string[];
  inheritedDefinition?: string;
  inheritedLongDefinition?: string;
  inheritedInclusion?: string[];
  inheritedFrom?: string;
}

/** Сигнатура bank — меняется при rebuild data файла → invalidate IDB. */
function bankSignature(bank: SlimBank): string {
  return `${bank.version || 'v?'}-${bank.lastUpdated || '?'}-${bank.codes.length}`;
}

class IcdSearchEngine {
  private indexed: IndexedCode[] = [];
  private chapters: SlimBank['chapters'] = [];
  private bankSig = '';
  private detailsMap: Record<string, CodeDetails> | null = null;
  private detailsLoading: Promise<void> | null = null;

  /**
   * Загружает slim bank. Алгоритм:
   *   1. Fetch slim (через SW CacheFirst — обычно <50ms)
   *   2. Compute signature {version}-{lastUpdated}-{codeCount}
   *   3. Check IDB: если cached.sig === sig → use cached parsed index
   *   4. Иначе re-parse + index + cache
   *
   * Auto-invalidation: signature меняется автоматически при rebuild
   * slim файла → не нужно вручную bump версии.
   */
  async loadSlim(slimUrl: string, idbKey: string): Promise<{
    codes: number; chapters: number; fromCache: boolean
  }> {
    // 1. Fetch slim (small file, SW cached)
    const r = await fetch(slimUrl);
    if (!r.ok) throw new Error(`Failed to fetch slim: ${r.status}`);
    const bank = (await r.json()) as SlimBank;
    const sig = bankSignature(bank);

    // 2. Check IDB by signature
    try {
      const cached = await get<{
        sig: string;
        chapters: SlimBank['chapters'];
        indexed: IndexedCode[];
      }>(idbKey);
      if (cached && cached.sig === sig) {
        this.indexed = cached.indexed;
        this.chapters = cached.chapters;
        this.bankSig = cached.sig;
        return {
          codes: this.indexed.length,
          chapters: this.chapters.length,
          fromCache: true,
        };
      }
    } catch {/* IDB unavailable, continue */}

    // 3. Build fresh index
    this.chapters = bank.chapters;
    this.indexed = new Array(bank.codes.length);
    for (let i = 0; i < bank.codes.length; i++) {
      const c = bank.codes[i]!;
      const cleanTitle = c.title.replace(/^(?:[-–—] ){1,3}/, '').trim();
      this.indexed[i] = {
        code: c.code,
        title: cleanTitle,
        chapter: c.chapter,
        _codeLc: c.code.toLowerCase(),
        _titleLc: cleanTitle.toLowerCase().replace(/ё/g, 'е'),
      };
    }
    this.bankSig = sig;

    // 4. Persist (fire-and-forget)
    void set(idbKey, {
      sig,
      chapters: this.chapters,
      indexed: this.indexed,
    });

    return {
      codes: this.indexed.length,
      chapters: this.chapters.length,
      fromCache: false,
    };
  }

  /**
   * Search by query. Returns top-K results sorted by relevance.
   * @param query — пользовательский запрос (raw)
   * @param chapter — опциональный фильтр по главе (если указан)
   * @param limit — макс. результатов (default 200)
   */
  search(query: string, chapter: string | null = null, limit = 200): SearchResult[] {
    const q = query.trim().toLowerCase().replace(/ё/g, 'е');
    if (!q) {
      return chapter
        ? this.indexed
            .filter((c) => c.chapter === chapter)
            .slice(0, limit)
            .map((c) => ({ code: c.code, title: c.title, chapter: c.chapter, score: 0 }))
        : [];
    }

    // Bucket sort by relevance score
    const buckets: IndexedCode[][] = [[], [], [], [], [], [], []];
    const pool = chapter
      ? this.indexed.filter((c) => c.chapter === chapter)
      : this.indexed;

    for (const c of pool) {
      const code = c._codeLc;
      const title = c._titleLc;
      let b = -1;
      if (code === q) b = 0;
      else if (code.startsWith(q)) b = 1;
      else if (title.startsWith(q)) b = 2;
      else if (title.includes(' ' + q)) b = 3;
      else if (title.includes(q)) b = 4;
      else if (code.includes(q)) b = 5;
      if (b !== -1) buckets[b]!.push(c);
    }

    const out: SearchResult[] = [];
    const scores = [100, 80, 60, 40, 20, 10, 0];
    for (let bi = 0; bi < buckets.length && out.length < limit; bi++) {
      const bucket = buckets[bi]!;
      bucket.sort((a, b) => a.code.localeCompare(b.code));
      for (const c of bucket) {
        if (out.length >= limit) break;
        out.push({ code: c.code, title: c.title, chapter: c.chapter, score: scores[bi]! });
      }
    }
    return out;
  }

  /**
   * Get all codes in a specific chapter (for browse mode).
   */
  getChapterCodes(chapter: string, offset = 0, limit = 50): SlimCode[] {
    return this.indexed
      .filter((c) => c.chapter === chapter)
      .slice(offset, offset + limit)
      .map((c) => ({ code: c.code, title: c.title, chapter: c.chapter }));
  }

  /**
   * Get total count per chapter (for browse UI).
   */
  getChapterCounts(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const c of this.indexed) {
      out[c.chapter] = (out[c.chapter] ?? 0) + 1;
    }
    return out;
  }

  /**
   * Lazy-load details bundle. Vetoed parallel calls — single in-flight
   * promise. После успеха детали в this.detailsMap.
   */
  async loadDetails(detailsUrl: string): Promise<void> {
    if (this.detailsMap) return;
    if (this.detailsLoading) return this.detailsLoading;
    this.detailsLoading = (async () => {
      try {
        const r = await fetch(detailsUrl);
        if (!r.ok) return;
        this.detailsMap = (await r.json()) as Record<string, CodeDetails>;
      } catch {/* fallback — details not available */}
      finally {
        this.detailsLoading = null;
      }
    })();
    return this.detailsLoading;
  }

  /**
   * Get details for a specific code. Returns null if not loaded yet
   * or no details available.
   */
  getDetails(code: string): CodeDetails | null {
    return this.detailsMap?.[code] ?? null;
  }

  /**
   * Force reload — invalidate IDB cache. Используется при cache bust.
   */
  async invalidate(idbKey: string): Promise<void> {
    try { await set(idbKey, undefined); } catch {/* */}
    this.indexed = [];
    this.chapters = [];
    this.detailsMap = null;
  }
}

// Expose via Comlink
const engine = new IcdSearchEngine();
Comlink.expose(engine);

export type { IcdSearchEngine, SearchResult, SlimCode, CodeDetails };

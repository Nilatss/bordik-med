/**
 * P2-PERF-NEW-14 — Generic JSON parsing Web Worker.
 *
 * Use case: компоненты, которые fetch'ат большие JSON (drug-interactions
 * 2.5MB, neonatal-monographs 800KB), сейчас парсят их в main-thread:
 *
 *   const r = await fetch(url);
 *   const data = await r.json();        // ← блокирует UI на 80-200ms
 *
 * Этот worker оффлоадит парсинг + опциональную трансформацию (e.g.,
 * Map indexing) в background thread:
 *
 *   import { fetchJsonInWorker } from '@/lib/json-worker/client';
 *   const data = await fetchJsonInWorker<DrugInteractions>(
 *     '/drug-interactions.json',
 *     { transform: 'index-by-key', key: 'pair' }
 *   );
 *
 * Поддерживается через Comlink RPC; pattern взят из lib/icd-search/.
 *
 * Singleton — один worker на весь app, разные fetch'и не конфликтуют
 * (worker single-threaded, но они не блокируют main).
 */

import * as Comlink from 'comlink';

export interface JsonWorkerOpts {
  /** Optional fetch headers (auth, accept-language). */
  headers?: Record<string, string>;
  /**
   * Transform после parse:
   *   - 'none' (default): возвращает raw parsed JSON
   *   - 'index-by-key': если массив, индексирует по указанному key
   *     в Object<key, item> (быстрый O(1) lookup в client'е)
   */
  transform?: 'none' | 'index-by-key';
  /** Ключ для 'index-by-key' transform (например 'id' или 'pair'). */
  key?: string;
  /**
   * Лимит размера body в байтах. Сверх — throw 'json-too-large'.
   * Defence от случайного fetch'a огромного file'а в worker (память
   * worker'а отдельная, OOM убьёт его).
   */
  maxBytes?: number;
}

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024; // 50MB upper bound

export interface JsonWorkerEngine {
  fetchJson(url: string, opts?: JsonWorkerOpts): Promise<unknown>;
}

const engine: JsonWorkerEngine = {
  async fetchJson(url, opts = {}) {
    const init: RequestInit = {
      method: 'GET',
      // P2-NEW-4 SSRF guard pattern (matched by sw.ts конвенция)
      redirect: 'error',
      cache: 'default',
    };
    if (opts.headers) init.headers = opts.headers;
    const r = await fetch(url, init);
    if (!r.ok) {
      throw new Error(`fetch-${r.status}: ${url}`);
    }
    // Content-Length sanity check before consuming body
    const cl = r.headers.get('content-length');
    if (cl && Number(cl) > (opts.maxBytes ?? DEFAULT_MAX_BYTES)) {
      throw new Error(`json-too-large: ${cl} bytes`);
    }
    const text = await r.text();
    if (text.length > (opts.maxBytes ?? DEFAULT_MAX_BYTES)) {
      throw new Error(`json-too-large: ${text.length} bytes`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`json-parse-error: ${(e as Error).message}`);
    }

    if (opts.transform === 'index-by-key' && opts.key && Array.isArray(parsed)) {
      const indexed: Record<string, unknown> = {};
      for (const item of parsed as Array<Record<string, unknown>>) {
        const k = item?.[opts.key];
        if (typeof k === 'string' || typeof k === 'number') {
          indexed[String(k)] = item;
        }
      }
      return indexed;
    }
    return parsed;
  },
};

// Comlink expose — даёт client.ts type-safe RPC interface
Comlink.expose(engine);

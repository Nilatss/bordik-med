/**
 * P2-PERF-NEW-14 — Main-thread прокси для JSON parsing worker.
 *
 * Pattern: same as lib/icd-search/client.ts — Comlink wrap singleton
 * Worker. Worker создаётся lazily на первый fetch.
 *
 * Use:
 *   import { fetchJsonInWorker } from '@/lib/json-worker/client';
 *
 *   const data = await fetchJsonInWorker<DrugInteractions>(
 *     '/drug-interactions.json',
 *     { transform: 'index-by-key', key: 'pair', maxBytes: 5_000_000 }
 *   );
 *
 * Когда стоит использовать:
 *   - JSON >500KB: парсинг занимает >50ms на mid-range mobile
 *   - На critical UI thread (страница уже интерактивна, новые данные
 *     не должны blocking-ить input/scroll)
 *
 * НЕ нужно для:
 *   - Маленькие JSON <100KB (overhead больше чем benefit)
 *   - SSR / RSC контекст (workers только в browser)
 *   - One-shot fetch при initial mount (тогда блокирующий парсинг ОК)
 */
import * as Comlink from 'comlink';
import type { JsonWorkerEngine, JsonWorkerOpts } from './worker';

let workerInstance: Worker | null = null;
let workerProxy: Comlink.Remote<JsonWorkerEngine> | null = null;

function getWorker(): Comlink.Remote<JsonWorkerEngine> {
  if (workerProxy) return workerProxy;
  if (typeof Worker === 'undefined') {
    throw new Error('Web Workers not supported');
  }
  workerInstance = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
    name: 'json-parse',
  });
  workerProxy = Comlink.wrap<JsonWorkerEngine>(workerInstance);
  return workerProxy;
}

/**
 * Fetch + parse JSON в worker thread.
 * @returns parsed JSON (или indexed object при transform='index-by-key')
 */
export async function fetchJsonInWorker<T = unknown>(
  url: string,
  opts: JsonWorkerOpts = {},
): Promise<T> {
  const engine = getWorker();
  return (await engine.fetchJson(url, opts)) as T;
}

/**
 * Fallback на main-thread если worker недоступен (SSR / unsupported).
 * Полезен в universal/isomorphic кейсах:
 *   const data = typeof Worker !== 'undefined'
 *     ? await fetchJsonInWorker<T>(url)
 *     : await fetchJsonOnMain<T>(url);
 */
export async function fetchJsonOnMain<T = unknown>(
  url: string,
  opts: JsonWorkerOpts = {},
): Promise<T> {
  const init: RequestInit = {
    method: 'GET',
    redirect: 'error',
  };
  // exactOptionalPropertyTypes — добавляем headers только если есть
  if (opts.headers) init.headers = opts.headers;
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`fetch-${r.status}: ${url}`);
  return (await r.json()) as T;
}

/** Terminate worker — для cleanup в HMR / тестах. */
export function terminateJsonWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    workerProxy = null;
  }
}

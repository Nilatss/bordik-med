/**
 * Main-thread прокси для ICD search worker.
 * Использует Comlink для type-safe RPC.
 *
 * Singleton — один воркер на оба ICD-источника (МКБ-10 + МКБ-11),
 * данные изолированы по idbKey.
 */
import * as Comlink from 'comlink';
import type { IcdSearchEngine, SearchResult, SlimCode, CodeDetails } from './worker';

let workerInstance: Worker | null = null;
let workerProxy: Comlink.Remote<IcdSearchEngine> | null = null;

function getWorker(): Comlink.Remote<IcdSearchEngine> {
  if (workerProxy) return workerProxy;
  if (typeof Worker === 'undefined') {
    throw new Error('Web Workers not supported');
  }
  workerInstance = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
    name: 'icd-search',
  });
  workerProxy = Comlink.wrap<IcdSearchEngine>(workerInstance);
  return workerProxy;
}

export interface IcdEngineHandle {
  loadSlim(slimUrl: string, idbKey: string): Promise<{
    codes: number; chapters: number; fromCache: boolean;
  }>;
  search(query: string, chapter?: string | null, limit?: number): Promise<SearchResult[]>;
  getChapterCodes(chapter: string, offset?: number, limit?: number): Promise<SlimCode[]>;
  getChapterCounts(): Promise<Record<string, number>>;
  loadDetails(detailsUrl: string): Promise<void>;
  getDetails(code: string): Promise<CodeDetails | null>;
}

export function getIcdEngine(): IcdEngineHandle {
  return getWorker() as unknown as IcdEngineHandle;
}

/** Terminate worker — для cleanup в HMR / тестах. */
export function terminateIcdEngine(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    workerProxy = null;
  }
}

/**
 * Lazy-loads the ICD-10 starter index from /icd10-starter.json.
 *
 * Concurrent calls that arrive before the first fetch resolves share the same
 * in-flight Promise, so only ONE network request is ever made per page load.
 * This mirrors the dedup pattern already used by CommandPalette's loadToolsIndex.
 */

export interface IcdEntry {
  code: string;
  title: string;
  chapter: string;
}

let icdIndex: IcdEntry[] | null = null;
let icdIndexLoading: Promise<IcdEntry[] | null> | null = null;

export async function loadIcdIndex(): Promise<IcdEntry[] | null> {
  if (icdIndex) return icdIndex;
  if (icdIndexLoading) return icdIndexLoading;
  icdIndexLoading = (async () => {
    try {
      const r = await fetch('/icd10-starter.json', { cache: 'force-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as { codes?: IcdEntry[] };
      icdIndex = data.codes ?? [];
      return icdIndex;
    } catch (err) {
      console.warn('[cmdk] icd index load failed', err);
      // Leave icdIndex as null so the next palette open retries.
      return null;
    } finally {
      icdIndexLoading = null;
    }
  })();
  return icdIndexLoading;
}

/** Reset cache — for testing only. */
export function _resetIcdCache(): void {
  icdIndex = null;
  icdIndexLoading = null;
}

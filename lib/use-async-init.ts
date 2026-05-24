'use client';

/**
 * useAsyncInit — offline-first error boundary for async initialisation.
 *
 * Motivation: async browser APIs (Cache Storage, IndexedDB, Supabase auth)
 * reject in constrained environments — private/incognito mode on shared
 * hospital PCs, low-RAM Android phones, locked-down kiosk browsers. The
 * common bug across the app is:
 *
 *     const [data, setData] = useState(null);
 *     useEffect(() => { init().then(setData).catch(() => {}); }, []);
 *     // on failure `data` stays null forever → the UI silently shows
 *     // a loading skeleton that never resolves.
 *
 * Field medics (rural / mobile shifts) hit exactly these environments, so
 * a blank screen reads as "the app is broken". This hook runs the async
 * initialiser, tracks an explicit status, and lets the consumer render a
 * visible fallback + retry instead of disappearing.
 *
 * Usage:
 *     const cat = useAsyncInit(getCatalog);
 *     if (cat.status === 'error') return <RetryCard onRetry={cat.retry} />;
 *     if (cat.status === 'loading') return <Skeleton />;
 *     return <List items={cat.data} />;
 *
 * Cancellation: a result that resolves/rejects after unmount (or after a
 * retry supersedes it) is ignored — no setState-after-unmount warnings.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncInitState<T> =
  | { status: 'loading'; data: null; error: null; retry: () => void }
  | { status: 'ready'; data: T; error: null; retry: () => void }
  | { status: 'error'; data: null; error: Error; retry: () => void };

export interface UseAsyncInitOptions {
  /**
   * Re-run keys. When any value changes the initialiser re-runs (same
   * semantics as a useEffect dependency array). Defaults to `[]` (run once
   * on mount). Pass primitives only — referential deps cause re-run loops.
   */
  deps?: readonly unknown[];
  /**
   * Called once on every settled failure with the coerced Error. Use it to
   * forward to Sentry / `log.warn`. Kept separate from rendering so the
   * hook stays presentation-agnostic.
   */
  onError?: (error: Error) => void;
}

function toError(e: unknown): Error {
  if (e instanceof Error) return e;
  return new Error(typeof e === 'string' ? e : 'Async init failed');
}

/**
 * Run `fn` on mount (and whenever `opts.deps` change). Returns an explicit
 * `{ status, data, error, retry }` so the consumer can branch on failure.
 */
export function useAsyncInit<T>(
  fn: () => Promise<T>,
  opts: UseAsyncInitOptions = {},
): AsyncInitState<T> {
  const { deps = [], onError } = opts;

  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; data: T | null; error: Error | null }>(
    { status: 'loading', data: null, error: null },
  );

  // A monotonically increasing run id. Only the latest run is allowed to
  // commit state, so a slow first attempt can't overwrite a retry's result.
  const runIdRef = useRef(0);

  // Keep the latest fn / onError without making them re-run triggers — the
  // caller usually passes inline closures whose identity changes each render.
  // Assigned in a passive effect (not during render) so a retry click always
  // reads the freshest closure; the initial useRef value covers first mount.
  const fnRef = useRef(fn);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    fnRef.current = fn;
    onErrorRef.current = onError;
  });

  const run = useCallback(() => {
    const myRun = ++runIdRef.current;
    setState((prev) =>
      prev.status === 'loading' && prev.data === null && prev.error === null
        ? prev
        : { status: 'loading', data: null, error: null },
    );
    fnRef.current().then(
      (data) => {
        if (myRun === runIdRef.current) setState({ status: 'ready', data, error: null });
      },
      (e) => {
        if (myRun !== runIdRef.current) return;
        const error = toError(e);
        onErrorRef.current?.(error);
        setState({ status: 'error', data: null, error });
      },
    );
  }, []);

  useEffect(() => {
    run();
    return () => {
      // Bump the run id so an in-flight promise from this effect can't
      // commit after unmount / dependency change.
      runIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are spread from opts.deps; run is stable
  }, deps);

  // `retry` is stable and re-issues the initialiser. Safe to call from a
  // button onClick. Bumping run id first invalidates any pending attempt.
  const retry = useCallback(() => { run(); }, [run]);

  if (state.status === 'ready') {
    return { status: 'ready', data: state.data as T, error: null, retry };
  }
  if (state.status === 'error') {
    return { status: 'error', data: null, error: state.error as Error, retry };
  }
  return { status: 'loading', data: null, error: null, retry };
}

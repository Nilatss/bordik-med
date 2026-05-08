/**
 * P2-CR-3 — Discriminated union helpers для async state.
 *
 * Существующий паттерн в кодовой базе (например, `useState<Phase>` в
 * DiagnosticTest) — string-literal discriminator. Хорош для simple
 * flow, но падает когда нужно прикрутить payload к каждому состоянию:
 *
 *   - 'loading'      → нет данных пока
 *   - 'success'      → data: T
 *   - 'error'        → message: string + retry-able flag
 *
 * Без discriminated union TypeScript не может сузить `state.data`
 * после `if (state.phase === 'success')`. Этот файл вводит дженерик
 * `AsyncResult<T, E>` + helpers, которые TS narrow'ит автоматически.
 *
 * Использование:
 *   import { type AsyncResult, idle, loading, success, failure } from '@/lib/async-state';
 *
 *   const [state, setState] = useState<AsyncResult<User>>(idle());
 *
 *   async function load() {
 *     setState(loading());
 *     try {
 *       const user = await fetchUser();
 *       setState(success(user));
 *     } catch (e) {
 *       setState(failure((e as Error).message));
 *     }
 *   }
 *
 *   // Render:
 *   if (state.status === 'idle')    return null;
 *   if (state.status === 'loading') return <Spinner />;
 *   if (state.status === 'failure') return <Error msg={state.error} />;
 *   //                  ↓ TS знает что это success — `state.data` доступен
 *   return <Profile user={state.data} />;
 */

export type AsyncResult<T, E = string> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'failure'; readonly error: E };

/** Constructor для idle-state (initial). */
export function idle<T = unknown, E = string>(): AsyncResult<T, E> {
  return { status: 'idle' };
}

/** Constructor для loading-state (fetching). */
export function loading<T = unknown, E = string>(): AsyncResult<T, E> {
  return { status: 'loading' };
}

/** Constructor для success-state с payload. */
export function success<T, E = string>(data: T): AsyncResult<T, E> {
  return { status: 'success', data };
}

/** Constructor для failure-state с error message. */
export function failure<T = unknown, E = string>(error: E): AsyncResult<T, E> {
  return { status: 'failure', error };
}

/* ─── Type-guards (для exhaustive-check'ов в render-функциях). */

export function isIdle<T, E>(r: AsyncResult<T, E>): r is { status: 'idle' } {
  return r.status === 'idle';
}

export function isLoading<T, E>(r: AsyncResult<T, E>): r is { status: 'loading' } {
  return r.status === 'loading';
}

export function isSuccess<T, E>(r: AsyncResult<T, E>): r is { status: 'success'; data: T } {
  return r.status === 'success';
}

export function isFailure<T, E>(r: AsyncResult<T, E>): r is { status: 'failure'; error: E } {
  return r.status === 'failure';
}

/* ─── Higher-order helpers. */

/**
 * Map success'ный результат, не трогая остальные состояния.
 *   const r2 = mapSuccess(r, (user) => user.name);
 */
export function mapSuccess<T, U, E>(
  r: AsyncResult<T, E>,
  fn: (data: T) => U,
): AsyncResult<U, E> {
  return r.status === 'success' ? { status: 'success', data: fn(r.data) } : r;
}

/**
 * fold — pattern-match всех 4 ветвей с обязательной обработкой каждой.
 * TypeScript exhaustive check гарантирует, что новое состояние не
 * пропустят при добавлении в union.
 *
 *   const view = fold(state, {
 *     idle:    () => null,
 *     loading: () => <Spinner />,
 *     success: (data) => <Profile user={data} />,
 *     failure: (e)    => <Error msg={e} />,
 *   });
 */
export function fold<T, E, R>(
  r: AsyncResult<T, E>,
  handlers: {
    idle: () => R;
    loading: () => R;
    success: (data: T) => R;
    failure: (error: E) => R;
  },
): R {
  switch (r.status) {
    case 'idle': return handlers.idle();
    case 'loading': return handlers.loading();
    case 'success': return handlers.success(r.data);
    case 'failure': return handlers.failure(r.error);
  }
}

/**
 * Удобный helper для оборачивания async-функции в AsyncResult-flow.
 * Возвращает [state, runner]. Обновляет state на каждом этапе.
 *
 * Не реализован как hook (зависит от useState/useCallback) — этот
 * файл должен оставаться pure utility без React-зависимостей.
 * Для hook-варианта обёрнуть в feature-specific custom hook:
 *
 *   import { useState, useCallback } from 'react';
 *   import { type AsyncResult, idle, loading, success, failure } from '@/lib/async-state';
 *
 *   export function useAsync<T>(fn: () => Promise<T>) {
 *     const [state, setState] = useState<AsyncResult<T>>(idle());
 *     const run = useCallback(async () => {
 *       setState(loading());
 *       try { setState(success(await fn())); }
 *       catch (e) { setState(failure((e as Error).message ?? 'unknown')); }
 *     }, [fn]);
 *     return [state, run] as const;
 *   }
 */

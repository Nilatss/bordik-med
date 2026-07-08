/**
 * Display-helpers for the diagnostic test UI.
 *
 * P1-CR-3 — extracted from DiagnosticTest.tsx step 1/N.
 */

/** Map topic identifier (en) → русский display label. */
export function topicRu(topic: string): string {
  const map: Record<string, string> = {
    anatomy: 'анатомия',
    physiology: 'физиология',
    biochemistry: 'биохимия',
    pharmacology: 'фармакология',
    pathology: 'патология',
    'internal-medicine': 'внутренние болезни',
    surgery: 'хирургия',
    pediatrics: 'педиатрия',
    obstetrics: 'акушерство',
    emergency: 'неотложка',
    'public-health': 'общественное здоровье',
    ethics: 'этика',
    'clinical-skills': 'клинические навыки',
    'lab-diagnostics': 'лабораторная диагностика',
    imaging: 'визуализация',
  };
  return map[topic] ?? topic;
}

/** Translate level → русский. */
export function levelRu(level: 'basic' | 'intermediate' | 'advanced'): string {
  return level === 'basic' ? 'базовый'
    : level === 'advanced' ? 'продвинутый'
    : 'средний';
}

/**
 * Decide which API call the "Попробовать снова" button should retry.
 *
 * Bug: the retry button used to always re-issue `action:'next'`. When the
 * LAST question had already been answered (history.length >= total) and
 * `finalize()` was the call that failed, retrying with `action:'next'`
 * hits the server's `history.length >= TOTAL_QUESTIONS` guard, which
 * replies with `test-complete` — an error the UI has no other way to
 * clear. The user is stuck in an unbreakable retry loop and can only
 * escape by closing (discarding the finished test) or restarting
 * (discarding the 30 already-answered questions).
 *
 * `total` is read from the last fetched question (`current?.total`) since
 * `current` still holds question 30 after `finalize()` fails — it's only
 * ever replaced by a later successful `fetchNext`.
 */
export function pickRetryAction(
  historyLength: number,
  total: number | null | undefined,
): 'next' | 'finalize' {
  return historyLength >= (total ?? 30) && historyLength > 0 ? 'finalize' : 'next';
}

/**
 * Translate a backend error code into a user-actionable message instead
 * of dumping raw "gemini-429: You exceeded your current quota..." strings.
 * Codes are emitted by the `/api/diagnostic` route — see that file for
 * the canonical list.
 */
export function friendlyError(code: string): { msg: string; retryable: boolean } {
  if (code.includes('429') || /quota|rate.?limit/i.test(code)) {
    return { msg: 'Сервис перегружен. Подождите минутку и попробуйте снова.', retryable: true };
  }
  if (code.includes('timeout') || code.includes('budget')) {
    return { msg: 'Сервис отвечает дольше обычного. Попробуйте снова.', retryable: true };
  }
  if (code === 'gemini-not-configured' || code === 'bank-unavailable') {
    return { msg: 'Сервис временно недоступен. Попробуйте позже.', retryable: false };
  }
  return { msg: 'Не удалось получить следующий вопрос. Попробуйте ещё раз.', retryable: true };
}

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
 * Whether "Попробовать снова" after a `next`-phase failure is safe to send
 * as another `action: 'next'` call. The server rejects `next` once
 * `history.length >= totalQuestions` (see app/api/diagnostic/route.ts) —
 * so once the last question has been answered, only `finalize` can ever
 * succeed. Retrying `next` at that point would 400 forever, leaving the
 * user stuck with no way out except abandoning the completed test.
 */
export function canRetryNext(historyLength: number, totalQuestions: number): boolean {
  return historyLength < totalQuestions;
}

/**
 * Resolve the "X/Y верных ответов" score shown on the 'done' screen.
 *
 * When the user opens a previously-saved diagnostic result, the component
 * seeds `final` from the cached result but starts `history` empty (no
 * re-fetch of the 30 answered turns) — so a score derived purely from
 * `history` always reads "0/0" for a returning user, even though the real
 * score is sitting in the cached result. Prefer the live `history` while a
 * test is actually being taken (it's the source of truth then); fall back
 * to the cached score once `history` is empty.
 */
export function resolveDiagnosticScore(
  historyLength: number,
  correctInHistory: number,
  cachedResult: { correct: number; total: number } | null,
): { correct: number; total: number } {
  if (historyLength > 0) return { correct: correctInHistory, total: historyLength };
  if (cachedResult) return { correct: cachedResult.correct, total: cachedResult.total };
  return { correct: 0, total: 0 };
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

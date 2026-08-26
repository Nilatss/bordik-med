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

/**
 * Which action the error panel's "Попробовать снова" button should
 * re-run. Retry must replay the SAME action that failed: once all 30
 * questions are answered, the server rejects a 'next' request with
 * 'test-complete' (history already full), so retrying 'next' after a
 * failed 'finalize' loops forever and the user can never actually
 * retry the recommendation step they were stuck on.
 */
export function resolveRetryAction(failedAction: 'next' | 'finalize'): 'next' | 'finalize' {
  return failedAction === 'finalize' ? 'finalize' : 'next';
}

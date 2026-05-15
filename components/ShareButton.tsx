'use client';

/**
 * P2-UX-3 — Web Share API wrapper.
 *
 * Single button that uses native share sheet when available
 * (`navigator.share`, ~99% mobile + recent desktop) and falls back to
 * clipboard copy with a temporary "Скопировано" affordance.
 *
 * Usage:
 *   <ShareButton title="BMI калькулятор" url="https://…/tools/bmi" />
 *
 * No tracking, no third-party SDK. Pure Platform API.
 */
import { useState } from 'react';

interface Props {
  title: string;
  text?: string;
  url?: string;          // defaults to current location
  className?: string;
  children?: React.ReactNode;
}

type State = 'idle' | 'copied' | 'error';

export function ShareButton({ title, text, url, className, children }: Props) {
  const [state, setState] = useState<State>('idle');

  async function onClick() {
    const targetUrl = url ?? (typeof location !== 'undefined' ? location.href : '');
    // exactOptionalPropertyTypes: avoid passing literal `undefined` to
    // optional fields. ShareData.text is `?: string` (not `| undefined`),
    // so we conditionally spread it instead.
    const data: ShareData = { title, url: targetUrl, ...(text !== undefined && { text }) };

    // 1. Native share sheet — best UX, lets user pick any app.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if ('canShare' in navigator && typeof navigator.canShare === 'function') {
          if (!navigator.canShare(data)) throw new Error('not-shareable');
        }
        await navigator.share(data);
        return;
      } catch (err) {
        // AbortError = user dismissed, that's fine. Anything else falls
        // through to clipboard.
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 2. Clipboard fallback.
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
        setState('copied');
        setTimeout(() => setState('idle'), 1800);
        return;
      }
    } catch {/* fall through */}

    setState('error');
    setTimeout(() => setState('idle'), 2200);
  }

  // P1-CR-4: migrated from inline style to Tailwind utility classes.
  const bgClass = state === 'copied' ? 'bg-[#22C55E]' : 'bg-[#3B82F6]';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Поделиться: ${title}`}
      className={`py-2 px-3.5 ${bgClass} text-white border-none rounded-[10px] font-[var(--font-body)] text-[13px] font-semibold cursor-pointer transition-colors duration-[180ms] ${className ?? ''}`.trim()}
    >
      {state === 'copied' ? 'Ссылка скопирована' :
       state === 'error'  ? 'Не удалось скопировать' :
       (children ?? 'Поделиться')}
    </button>
  );
}

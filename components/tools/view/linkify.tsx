/**
 * linkify — wrap http(s):// URLs в plain-text fields в clickable <a>.
 *
 * P1-CR-3 step 4/8 — extracted from ToolView.tsx.
 *
 * Используется для actions/caveats/details runners-полей где часто
 * embedded reference URLs.
 */
import type { ReactNode } from 'react';
import { URL_REGEX } from '@/lib/tool-view/utils';

export function linkify(text: string): ReactNode {
  if (!text || !text.includes('http')) return text;
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563EB] underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

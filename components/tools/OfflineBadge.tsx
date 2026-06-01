'use client';

import { useEffect, useState } from 'react';
import { isToolCached, cacheTool } from '@/lib/offline-cache';

/**
 * Small status indicator + one-click "save offline" toggle for a single
 * tool. Renders as a discreet pill - green dot + "Доступно офлайн" when
 * cached, otherwise neutral grey + "Сохранить офлайн" button.
 *
 * Used inside ToolView's header so the user can pre-cache the tool they
 * are likely to need without internet (during a clinical shift, in transit).
 */
export function OfflineBadge({ toolId, label }: { toolId: string; label?: string }) {
  const [state, setState] = useState<'unknown' | 'cached' | 'available' | 'saving'>('unknown');

  useEffect(() => {
    let cancelled = false;
    isToolCached(toolId)
      .then((c) => {
        if (!cancelled) setState(c ? 'cached' : 'available');
      })
      .catch(() => {
        if (!cancelled) setState('available');
      });
    return () => { cancelled = true; };
  }, [toolId]);

  const handleSave = async () => {
    setState('saving');
    try {
      const ok = await cacheTool(toolId);
      setState(ok ? 'cached' : 'available');
    } catch {
      setState('available');
    }
  };

  if (state === 'unknown') return null;

  // Cached state: зелёный pill в едином стиле с FavouriteButton (body-font,
  // не uppercase, чуть крупнее) — чтобы кнопки в шапке /tools/[id]
  // выглядели как один комплект, а не как «два разных артефакта».
  if (state === 'cached') {
    return (
      <span className="inline-flex items-center gap-1.5 py-[5px] pl-2 pr-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full font-[var(--font-body)] text-[11px] font-semibold text-[#065F46]">
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {label ?? 'Доступно офлайн'}
      </span>
    );
  }

  const cursorClass = state === 'saving' ? 'cursor-wait' : 'cursor-pointer';

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === 'saving'}
      aria-label={state === 'saving' ? 'Сохраняем для офлайн-доступа' : 'Скачать для офлайн-доступа'}
      className={`inline-flex items-center gap-1.5 py-[5px] pl-2 pr-2.5 bg-[#F0F1F5] hover:bg-[#E2E4EA] border border-transparent rounded-full ${cursorClass} font-[var(--font-body)] text-[11px] font-semibold text-[#6B7280] hover:text-[#1A1A1A] transition-[background,color,border-color] duration-[160ms]`}
    >
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {state === 'saving' ? 'Сохраняем…' : 'Скачать'}
    </button>
  );
}

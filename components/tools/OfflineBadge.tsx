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
    isToolCached(toolId).then((c) => {
      if (!cancelled) setState(c ? 'cached' : 'available');
    });
    return () => { cancelled = true; };
  }, [toolId]);

  const handleSave = async () => {
    setState('saving');
    const ok = await cacheTool(toolId);
    setState(ok ? 'cached' : 'available');
  };

  if (state === 'unknown') return null;

  // Cached state: зелёный pill в едином стиле с FavouriteButton (body-font,
  // не uppercase, чуть крупнее) — чтобы кнопки в шапке /tools/[id]
  // выглядели как один комплект, а не как «два разных артефакта».
  if (state === 'cached') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px 5px 8px',
        background: '#ECFDF5', border: '1px solid #A7F3D0',
        borderRadius: 999,
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
        color: '#065F46',
      }}>
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {label ?? 'Доступно офлайн'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === 'saving'}
      aria-label={state === 'saving' ? 'Сохраняем для офлайн-доступа' : 'Скачать для офлайн-доступа'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px 5px 8px',
        background: '#F0F1F5', border: '1px solid transparent',
        borderRadius: 999, cursor: state === 'saving' ? 'wait' : 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
        color: '#6B7280',
        transition: 'background 160ms, color 160ms, border-color 160ms',
      }}
      onMouseEnter={(e) => { if (state !== 'saving') { e.currentTarget.style.background = '#E2E4EA'; e.currentTarget.style.color = '#1A1A1A'; } }}
      onMouseLeave={(e) => { if (state !== 'saving') { e.currentTarget.style.background = '#F0F1F5'; e.currentTarget.style.color = '#6B7280'; } }}
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

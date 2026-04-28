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

  if (state === 'cached') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px',
        background: '#ECFDF5', border: '1px solid #A7F3D0',
        borderRadius: 999,
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#065F46', letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
        {label ?? 'Доступно офлайн'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === 'saving'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px',
        background: '#F5F6F8', border: '1px solid #E5E7EB',
        borderRadius: 999, cursor: state === 'saving' ? 'wait' : 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#4B5563', letterSpacing: '0.04em', textTransform: 'uppercase',
        transition: 'background 150ms, color 150ms',
      }}
      onMouseEnter={(e) => { if (state !== 'saving') { e.currentTarget.style.background = '#E8E9ED'; e.currentTarget.style.color = '#1A1A1A'; } }}
      onMouseLeave={(e) => { if (state !== 'saving') { e.currentTarget.style.background = '#F5F6F8'; e.currentTarget.style.color = '#4B5563'; } }}
    >
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {state === 'saving' ? 'Сохраняем…' : 'Сохранить офлайн'}
    </button>
  );
}

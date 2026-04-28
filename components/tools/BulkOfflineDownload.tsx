'use client';

import { useEffect, useRef, useState } from 'react';
import { bulkCacheTools, getCacheSizeBytes } from '@/lib/offline-cache';

/**
 * Bulk download modal. Loads all available tool IDs from the catalog
 * and lets the user precache the entire set for offline use. Designed
 * for medics about to enter a low-/no-network area (rural shift, plane,
 * field hospital).
 *
 * Trigger: callsite renders <BulkOfflineDownload /> and controls the
 * `open` state. Modal handles the rest - confirmation, progress, error.
 */
export function BulkOfflineDownload({
  open, onClose, toolIds,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass the list of tool IDs to download. Typically only `.available` tools. */
  toolIds: readonly string[];
}) {
  const [progress, setProgress] = useState(0);     // 0..1
  const [stage, setStage] = useState<'confirm' | 'running' | 'done' | 'error'>('confirm');
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);
  const [estBytes, setEstBytes] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    setStage('confirm');
    setResult(null);
    getCacheSizeBytes().then(setEstBytes);
  }, [open]);

  const start = async () => {
    setStage('running');
    abortRef.current = new AbortController();
    const r = await bulkCacheTools(
      toolIds,
      (done, total) => setProgress(done / total),
      abortRef.current.signal,
    );
    setResult(r);
    setStage('done');
  };

  const cancel = () => {
    abortRef.current?.abort();
    setStage('done');
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      onClick={() => stage !== 'running' && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: '#FFFFFF', borderRadius: 16,
          padding: '24px 24px 20px',
          boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
        }}
      >
        <h3 style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.01em',
        }}>
          Сохранить инструменты для офлайн
        </h3>

        {stage === 'confirm' && (
          <>
            <p style={{
              margin: '0 0 14px',
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280', lineHeight: 1.55,
            }}>
              {toolIds.length} инструментов будет скачано и доступно без интернета.
              Сейчас в офлайн-кэше браузер занимает ~{(estBytes / 1024 / 1024).toFixed(1)} МБ.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={btnSecondary}>Отмена</button>
              <button onClick={start} style={btnPrimary}>Начать загрузку</button>
            </div>
          </>
        )}

        {stage === 'running' && (
          <>
            <p style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#1A1A1A',
            }}>
              Загружаем… {Math.round(progress * 100)}%
            </p>
            <div style={{
              height: 6, borderRadius: 999, background: '#F1F3F6', overflow: 'hidden',
              marginBottom: 14,
            }}>
              <div style={{
                height: '100%', width: `${progress * 100}%`,
                background: '#3B82F6', borderRadius: 999,
                transition: 'width 80ms linear',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={cancel} style={btnSecondary}>Остановить</button>
            </div>
          </>
        )}

        {stage === 'done' && result && (
          <>
            <p style={{
              margin: '0 0 14px',
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#1A1A1A', lineHeight: 1.55,
            }}>
              Готово. Скачано: <strong>{result.ok}</strong>
              {result.fail > 0 && <>, ошибок: <strong style={{ color: '#B91C1C' }}>{result.fail}</strong></>}.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnPrimary}>Закрыть</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 10,
  background: '#3B82F6', color: '#FFFFFF',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};
const btnSecondary: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 10,
  background: 'transparent', color: '#6B7280',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};

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
    getCacheSizeBytes().then(setEstBytes).catch(() => { /* Cache API unavailable — estimate stays 0 */ });
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
      className="fixed inset-0 z-[9999] bg-[rgba(15,23,42,0.45)] flex items-center justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-[16px] pt-6 px-6 pb-5 shadow-[0_24px_48px_rgba(15,23,42,0.24)]"
      >
        <h3 className="mt-0 mb-2 mx-0 font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] tracking-[-0.01em]">
          Сохранить инструменты для офлайн
        </h3>

        {stage === 'confirm' && (
          <>
            <p className="mt-0 mb-[14px] mx-0 font-[var(--font-body)] text-[13px] text-[#6B7280] leading-[1.55]">
              {toolIds.length} инструментов будет скачано и доступно без интернета.
              Сейчас в офлайн-кэше браузер занимает ~{(estBytes / 1024 / 1024).toFixed(1)} МБ.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className={btnSecondaryClass}>Отмена</button>
              <button onClick={start} className={btnPrimaryClass}>Начать загрузку</button>
            </div>
          </>
        )}

        {stage === 'running' && (
          <>
            <p className="mt-0 mb-3 mx-0 font-[var(--font-body)] text-[13px] text-[#1A1A1A]">
              Загружаем… {Math.round(progress * 100)}%
            </p>
            <div className="h-1.5 rounded-full bg-[#F1F3F6] overflow-hidden mb-[14px]">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-[width] duration-[80ms] linear w-[var(--bulk-progress)]"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic progress %
                style={{ ['--bulk-progress' as string]: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={cancel} className={btnSecondaryClass}>Остановить</button>
            </div>
          </>
        )}

        {stage === 'done' && result && (
          <>
            <p className="mt-0 mb-[14px] mx-0 font-[var(--font-body)] text-[13px] text-[#1A1A1A] leading-[1.55]">
              Готово. Скачано: <strong>{result.ok}</strong>
              {result.fail > 0 && <>, ошибок: <strong className="text-[#B91C1C]">{result.fail}</strong></>}.
            </p>
            <div className="flex justify-end">
              <button onClick={onClose} className={btnPrimaryClass}>Закрыть</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const btnPrimaryClass =
  'py-[9px] px-[18px] rounded-[10px] bg-[#3B82F6] text-white border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold';
const btnSecondaryClass =
  'py-[9px] px-4 rounded-[10px] bg-transparent text-[#6B7280] border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold';

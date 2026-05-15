/**
 * FinalizingPanel — phase 'finalizing'. Spinner + streaming preview под ним.
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 *
 * P1-PERF-NEW-5 — streaming preview: показываем raw text от Gemini по
 * мере прихода chunks. Truncate последние 240 chars (живой "хвост"
 * generation'а), чтобы UI не «прыгал» при разрастании текста.
 * Опционально — есть только если streamingPreview непустой
 * (т.е. сервер действительно вернул NDJSON и chunk'и приходят).
 */
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';
import { fadeProps, panelClass, loadingTextClass } from './styles';

export function FinalizingPanel({ streamingPreview }: { streamingPreview: string }) {
  return (
    <motion.div key="finalizing" {...fadeProps} className={panelClass}>
      <Spinner />
      <p className={loadingTextClass}>Анализируем ответы и собираем рекомендацию…</p>
      {streamingPreview.length > 20 && (
        <p className="mt-[14px] py-2.5 px-[14px] bg-[#F5F6F8] rounded-[10px] font-[var(--font-mono,ui-monospace)] text-[11.5px] text-[#6B7280] leading-[1.5] max-w-[480px] italic opacity-85 overflow-hidden text-ellipsis [-webkit-line-clamp:3] [-webkit-box-orient:vertical] [display:-webkit-box]">
          {streamingPreview.length > 240
            ? '…' + streamingPreview.slice(-240)
            : streamingPreview}
        </p>
      )}
    </motion.div>
  );
}

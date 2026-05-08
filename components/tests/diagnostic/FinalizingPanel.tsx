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
import { fadeProps, panelStyle, loadingTextStyle } from './styles';

export function FinalizingPanel({ streamingPreview }: { streamingPreview: string }) {
  return (
    <motion.div key="finalizing" {...fadeProps} style={panelStyle}>
      <Spinner />
      <p style={loadingTextStyle}>Анализируем ответы и собираем рекомендацию…</p>
      {streamingPreview.length > 20 && (
        <p style={{
          marginTop: 14,
          padding: '10px 14px',
          background: '#F5F6F8',
          borderRadius: 10,
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11.5,
          color: '#6B7280',
          lineHeight: 1.5,
          maxWidth: 480,
          fontStyle: 'italic',
          opacity: 0.85,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          {streamingPreview.length > 240
            ? '…' + streamingPreview.slice(-240)
            : streamingPreview}
        </p>
      )}
    </motion.div>
  );
}

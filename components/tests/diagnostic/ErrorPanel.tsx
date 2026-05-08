/**
 * ErrorPanel — phase 'error'. Red-dot title + error message + retry/close.
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import { fadeProps, panelStyle, primaryBtn, secondaryBtn } from './styles';

interface Props {
  errorMsg: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function ErrorPanel({ errorMsg, onRetry, onClose }: Props) {
  return (
    <motion.div key="error" {...fadeProps} style={{
      ...panelStyle, background: '#F5F6F8',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
        color: '#1A1A1A', marginBottom: 6,
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: 999,
          background: '#F87171', display: 'inline-block',
        }} />
        Что-то пошло не так
      </p>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 13, color: '#4B5563',
        lineHeight: 1.5, marginBottom: 14,
      }}>
        {errorMsg ?? 'Неизвестная ошибка.'}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onRetry} style={primaryBtn}>
          Попробовать снова
        </button>
        <button onClick={onClose} style={secondaryBtn}>Закрыть</button>
      </div>
    </motion.div>
  );
}

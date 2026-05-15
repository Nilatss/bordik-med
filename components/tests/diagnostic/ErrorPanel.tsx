/**
 * ErrorPanel — phase 'error'. Red-dot title + error message + retry/close.
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import { fadeProps, primaryBtnClass, secondaryBtnClass } from './styles';

interface Props {
  errorMsg: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function ErrorPanel({ errorMsg, onRetry, onClose }: Props) {
  return (
    <motion.div
      key="error"
      {...fadeProps}
      className="bg-[#F5F6F8] border border-[#F0F1F5] rounded-[18px] p-[clamp(20px,4vw,28px)]"
    >
      <p className="font-[var(--font-body)] text-sm font-semibold text-[#1A1A1A] mb-1.5 inline-flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#F87171] inline-block" />
        Что-то пошло не так
      </p>
      <p className="font-[var(--font-body)] text-[13px] text-[#4B5563] leading-[1.5] mb-[14px]">
        {errorMsg ?? 'Неизвестная ошибка.'}
      </p>
      <div className="flex gap-2">
        <button onClick={onRetry} className={primaryBtnClass}>
          Попробовать снова
        </button>
        <button onClick={onClose} className={secondaryBtnClass}>Закрыть</button>
      </div>
    </motion.div>
  );
}

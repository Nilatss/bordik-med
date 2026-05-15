/**
 * LoadingPanel — phase 'loading'. Spinner + status text «Готовим следующий вопрос».
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 */
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';
import { fadeProps, panelClass, loadingTextClass } from './styles';

export function LoadingPanel() {
  return (
    <motion.div key="loading" {...fadeProps} className={panelClass}>
      <Spinner />
      <p className={loadingTextClass}>Готовим следующий вопрос…</p>
    </motion.div>
  );
}

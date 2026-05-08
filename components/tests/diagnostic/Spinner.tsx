/**
 * Spinner — небольшой crawler для loading/finalizing phase в DiagnosticTest.
 *
 * P1-CR-3 step 2/6 — extracted from DiagnosticTest.tsx.
 *
 * Глобальный keyframe + цвет в app/globals.css (`.bordik-spinner`).
 * Раньше использовался `<style jsx global>` с локальным @keyframes,
 * но на десктопе под Next 16/Turbopack стиль не успевал инъектиться
 * до старта анимации в AnimatePresence-обёртке — спиннер не крутился.
 */
export function Spinner() {
  return <div className="bordik-spinner" aria-label="Загрузка…" role="status" />;
}

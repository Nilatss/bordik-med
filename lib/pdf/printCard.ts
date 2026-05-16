/**
 * printCard — trigger native browser print dialog with isolation styling.
 *
 * Approach: classic CSS visibility trick. We set `body.print-mode` + mark
 * target element with `data-print-target`. CSS rules in @media print hide
 * everything except the target, expand it to fill the page, strip
 * interactive elements (buttons, chevrons), and force colours through to
 * the printed output.
 *
 * User then chooses "Save as PDF" from the browser print dialog — works
 * cross-platform (Chrome, Safari, Firefox, Edge) without any extra deps.
 *
 * Why not jsPDF/react-pdf?
 *   - bundle bloat (+100-500KB for code we use for one feature)
 *   - drug/protocol cards are text-heavy → native print = perfect fidelity
 *   - users can adjust margins, paper size, orientation в native dialog
 *   - resulting PDF inherits OS accessibility (selectable text, alt text)
 *
 * Usage:
 *   <button onClick={() => printCard('drug-amp-iv', 'Ампициллин IV')}>
 *     Печать
 *   </button>
 *
 * The target element must have `id="drug-amp-iv"` so we can find it.
 */
export function printCard(elementId: string, pdfTitle: string): void {
  if (typeof document === 'undefined') return; // SSR guard

  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`[printCard] Element #${elementId} not found in DOM`);
    return;
  }

  // Save originals so we can restore on cleanup.
  const originalTitle = document.title;

  // The PDF filename in Chrome's "Save as PDF" dialog uses document.title.
  // Sanitize: strip leading/trailing punct, collapse whitespace.
  const cleanTitle = pdfTitle.trim().replace(/[\\/:*?"<>|]+/g, '').slice(0, 100);
  document.title = cleanTitle || 'Bordik Med';

  // Mark target + body so CSS @media print rules apply.
  el.setAttribute('data-print-target', 'true');
  document.body.classList.add('print-mode');

  const cleanup = (): void => {
    el.removeAttribute('data-print-target');
    document.body.classList.remove('print-mode');
    document.title = originalTitle;
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Some browsers don't fire afterprint (e.g. if user closes dialog
  // without printing). Failsafe: clean up after 30s regardless.
  setTimeout(() => {
    if (document.body.classList.contains('print-mode')) {
      cleanup();
    }
  }, 30_000);

  // Yield to the event loop so DOM updates (data-print-target attribute,
  // body class) apply before the print dialog snapshots the page.
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      // Defensive: some embedded/headless contexts disallow print()
      console.warn('[printCard] window.print() failed:', err);
      cleanup();
    }
  }, 50);
}

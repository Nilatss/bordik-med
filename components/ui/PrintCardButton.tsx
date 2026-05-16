'use client';

/**
 * PrintCardButton — clickable button that triggers a print-to-PDF for the
 * expanded card content. Used in DrugCard / GuidelineCard / ChecklistCard /
 * NurseProcedureCard in NeonatalHandbook.tsx + similar reference cards.
 *
 * Design: small pill, neutral palette (matches FavoriteStarButton), 26px
 * square so it lines up next to the favourite star in card headers.
 *
 * Tooltip shows the action ("Печать карточки"); the printed PDF inherits
 * `pdfTitle` as document.title so Chrome's "Save as PDF" dialog suggests
 * a meaningful filename out of the box.
 *
 * The button itself MUST live OUTSIDE the [data-print-target] subtree so
 * it doesn't appear in the printed output. We rely on absolute positioning
 * (parent card is `relative`) — same pattern used for FavoriteStarButton.
 */

import { printCard } from '@/lib/pdf/printCard';

interface PrintCardButtonProps {
  /** ID of the DOM element to print (the expanded card body). */
  targetId: string;
  /** Title for the PDF filename (Chrome's Save dialog seeds from document.title). */
  pdfTitle: string;
  /** Optional accessibility label override. */
  ariaLabel?: string;
  /** Optional extra className for positioning (e.g. absolute placement). */
  className?: string;
}

export function PrintCardButton({
  targetId,
  pdfTitle,
  ariaLabel,
  className = '',
}: PrintCardButtonProps): React.JSX.Element {
  const handleClick = (e: React.MouseEvent): void => {
    // Prevent parent <button> (card toggle) from firing.
    e.stopPropagation();
    e.preventDefault();
    printCard(targetId, pdfTitle);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? `Печать карточки: ${pdfTitle}`}
      title="Печать / сохранить как PDF"
      className={`shrink-0 w-[26px] h-[26px] rounded-lg inline-flex items-center justify-center cursor-pointer transition-[background-color,color,box-shadow,border-color] duration-[160ms] border bg-white hover:bg-[#F5F6F8] text-[#9CA3AF] hover:text-[#1A1A1A] border-transparent shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] ${className}`}
    >
      <svg
        width={13}
        height={13}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    </button>
  );
}

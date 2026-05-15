/**
 * StatPill — small label/value pill used on the course intro screen.
 *
 * Extracted from CoursePage.tsx (P1-CR-3 god-component split). Tiny
 * presentational component, no state. Reused by the intro stat-row
 * (topics / tests / section).
 */

interface StatPillProps {
  label: string;
  value: string;
}

export default function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="bg-[#F5F6F8] rounded-xl py-3 px-3.5 flex flex-col gap-1 min-w-0">
      <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
        {label}
      </span>
      <span className="font-[var(--font-body)] text-[13.5px] font-semibold text-[#1A1A1A] leading-[1.35] overflow-hidden text-ellipsis whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

/**
 * NavButton, BackButton — простые navigation primitives для ToolView.
 *
 * P1-CR-3 step 5/8 — extracted from ToolView.tsx.
 */
import { ArrowLeft } from '@/components/icons';

export function NavButton({ onClick, label, dir, primary }: {
  onClick: () => void;
  label: string;
  dir: 'prev' | 'next';
  primary?: boolean;
}) {
  const stateClass = primary
    ? 'bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB]'
    : 'bg-[#F5F6F8] text-[#1A1A1A] font-medium hover:bg-[#EFF1F4]';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 py-2.5 px-4 ${stateClass} border-none rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] transition-colors duration-[180ms] max-w-[50%] overflow-hidden text-ellipsis whitespace-nowrap`}
    >
      {dir === 'prev' ? '← ' : ''}{label}{dir === 'next' ? ' →' : ''}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-transparent hover:bg-[#F0F1F5] border-none cursor-pointer font-[var(--font-body)] text-[13px] font-medium text-[#6B7280] py-1.5 px-2.5 rounded-lg mb-4 self-start transition-colors duration-150"
    >
      <ArrowLeft size={16} />
      Назад
    </button>
  );
}

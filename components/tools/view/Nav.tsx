/**
 * NavButton, BackButton — простые navigation primitives для ToolView.
 *
 * P1-CR-3 step 5/8 — extracted from ToolView.tsx.
 */
import type { CSSProperties } from 'react';
import { ArrowLeft } from '@/components/icons';

export function NavButton({ onClick, label, dir, primary }: {
  onClick: () => void;
  label: string;
  dir: 'prev' | 'next';
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: primary ? '#3B82F6' : '#F5F6F8',
        color: primary ? '#FFFFFF' : '#1A1A1A',
        border: 'none', borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: primary ? 600 : 500,
        transition: 'background 180ms',
        maxWidth: '50%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = primary ? '#2563EB' : '#EFF1F4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = primary ? '#3B82F6' : '#F5F6F8';
      }}
    >
      {dir === 'prev' ? '← ' : ''}{label}{dir === 'next' ? ' →' : ''}
    </button>
  );
}

const backBtnStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
  color: '#6B7280', padding: '6px 10px', borderRadius: 8,
  marginBottom: 16, alignSelf: 'flex-start',
};

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={backBtnStyle}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F1F5'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <ArrowLeft size={16} />
      Назад
    </button>
  );
}

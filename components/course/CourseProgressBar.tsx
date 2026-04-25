'use client';

/**
 * Striped green progress track with inline position label and end label —
 * styled 1:1 with the insurance-policy reference screenshot. Diagonal hatch
 * pattern uses repeating-linear-gradient over a solid #22C55E base.
 *
 * Used on the course intro page (showing 0% before start) and inside
 * TabbedLessonViewer (live progress while user moves through tabs).
 */
export default function CourseProgressBar({
  pct, currentLabel, endLabel, startCaption, endCaption,
}: {
  pct: number;
  currentLabel: string;
  endLabel: string;
  startCaption: string;
  endCaption: string;
}) {
  // Clamp so the inside chip always has space to render
  const safePct = Math.max(8, Math.min(100, pct));
  return (
    <div style={{ width: '100%' }}>
      {/* Bar */}
      <div style={{
        position: 'relative',
        height: 32,
        borderRadius: 6,
        background: '#F1F3F6',
        overflow: 'hidden',
      }}>
        {/* Filled portion with diagonal hatch */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${safePct}%`,
          background:
            'repeating-linear-gradient(115deg, #22C55E 0 10px, #1FB85A 10px 20px)',
          borderRadius: 6,
          transition: 'width 350ms ease',
          display: 'flex', alignItems: 'center', paddingLeft: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            color: '#FFFFFF', whiteSpace: 'nowrap',
            textShadow: '0 1px 1px rgba(0,0,0,0.12)',
          }}>
            {currentLabel}
          </span>
        </div>

        {/* End label — sits on the right edge. Switches to white once the
            green bar grows over it (≥ 80 %) so it stays readable on the
            stripe pattern. */}
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
          color: safePct >= 80 ? '#FFFFFF' : '#6B7280',
          textShadow: safePct >= 80 ? '0 1px 1px rgba(0,0,0,0.18)' : 'none',
          transition: 'color 200ms ease',
        }}>
          {endLabel}
        </span>
      </div>

      {/* Captions row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 6,
        fontFamily: 'var(--font-body)', fontSize: 11, color: '#6B7280',
      }}>
        <span>{startCaption}</span>
        <span style={{ fontWeight: 600, color: '#3B82F6' }}>
          {pct}% пройдено
        </span>
        <span>{endCaption}</span>
      </div>
    </div>
  );
}

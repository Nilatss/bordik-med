/**
 * Shared inline styles for the diagnostic test components.
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 *
 * Held как run-time CSS objects (а не CSS modules), потому что:
 *   1. компонент модальный — стили инжектятся on-demand,
 *   2. весь стиль платформы пока inline (см. P1-CR-4 backlog),
 *   3. предсказуемые имена помогают grep'ать по всему проекту.
 */
import type { CSSProperties } from 'react';

export const fadeProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] as const },
};

// Note: panelStyle / loadingTextStyle сознательно без `CSSProperties`
// аннотации — framer-motion's `style` prop требует `MotionStyle`, который
// под `exactOptionalPropertyTypes: true` не совпадает с `CSSProperties`
// (последний имеет `?: T` оптионалы без `| undefined`). Inferred тип
// устраивает обоих consumers (мотион + plain div).
export const panelStyle = {
  background: '#FFFFFF',
  border: '1px solid #F0F1F5',
  borderRadius: 18,
  padding: 'clamp(20px, 4vw, 28px)',
};

export const loadingTextStyle = {
  marginTop: 12,
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#6B7280',
  textAlign: 'center' as const,
};

export const primaryBtn: CSSProperties = {
  padding: '10px 20px', borderRadius: 10,
  background: '#2563EB', color: '#FFFFFF',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
  transition: 'background 180ms',
};

export const secondaryBtn: CSSProperties = {
  padding: '10px 16px', borderRadius: 10,
  background: 'transparent', color: '#6B7280',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};

export const pillStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '4px 10px', borderRadius: 999,
  background: '#FFFFFF', color: '#1A1A1A',
  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  border: '1px solid #E5E7EB',
};

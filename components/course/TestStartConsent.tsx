'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TestStartConsentProps {
  testLabel: string;
  questionCount: number;
  timeMinutes: number;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Consent / rules screen shown before every test attempt.
 * User must tick the checkbox to unlock the "Начать тест" button.
 * Explicitly lists forbidden actions and consequences so the user cannot
 * claim "I did not know" after a violation.
 */
export default function TestStartConsent({
  testLabel, questionCount, timeMinutes, onAccept, onDecline,
}: TestStartConsentProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
        padding: '24px 28px',
        background: '#F5F6F8',
        borderRadius: 16,
      }}
    >
      {/* Label */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 6,
      }}>
        {testLabel}
      </p>

      {/* Title with warning icon */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: '#1A1A1A', margin: '0 0 18px 0',
        letterSpacing: '-0.02em',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#FFFBEB', color: '#B45309',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        Правила прохождения теста
      </h3>

      {/* Rules - forbidden */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '16px 20px', marginBottom: 12,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.06em',
          margin: '0 0 10px 0',
        }}>
          Во время теста запрещено
        </p>
        <ul style={{
          margin: 0, paddingLeft: 20,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Переключаться на другие вкладки или окна</li>
          <li>Сворачивать браузер</li>
          <li>Открывать режим разработчика (F12)</li>
          <li>Копировать вопросы или ответы</li>
        </ul>
      </div>

      {/* Rules - consequences */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '16px 20px', marginBottom: 12,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em',
          margin: '0 0 10px 0',
        }}>
          При нарушении
        </p>
        <ul style={{
          margin: 0, paddingLeft: 20,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Даётся 10 секунд, чтобы вернуться в окно теста</li>
          <li>1-е и 2-е нарушения - предупреждение</li>
          <li>3-е нарушение - тест автоматически завершается, попытка не засчитывается</li>
          <li><strong style={{ color: '#B91C1C' }}>Повторная попытка будет доступна только через 48 часов</strong></li>
        </ul>
      </div>

      {/* Test params */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18,
      }}>
        <div style={{
          flex: 1, padding: '10px 14px',
          background: '#FFFFFF', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
          </svg>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Вопросов</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{questionCount}</p>
          </div>
        </div>
        <div style={{
          flex: 1, padding: '10px 14px',
          background: '#FFFFFF', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
          </svg>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Время</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{timeMinutes} мин</p>
          </div>
        </div>
      </div>

      {/* Consent checkbox */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        background: agreed ? '#ECFDF5' : '#FFFFFF',
        borderRadius: 10,
        cursor: 'pointer',
        marginBottom: 16,
        transition: 'background 180ms',
        border: `1px solid ${agreed ? '#A7F3D0' : 'transparent'}`,
      }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{
            width: 18, height: 18, flexShrink: 0, marginTop: 1,
            accentColor: '#10B981', cursor: 'pointer',
          }}
        />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500,
          color: '#1A1A1A', lineHeight: 1.5,
        }}>
          Я прочитал правила, согласен с ними и понимаю последствия нарушений.
        </span>
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onDecline}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'transparent', color: '#6B7280',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'color 180ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
        >
          Отмена
        </button>
        <button
          onClick={onAccept}
          disabled={!agreed}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10,
            background: agreed ? '#1A1A1A' : '#E2E4EA',
            color: agreed ? '#FFFFFF' : '#9CA3AF',
            border: 'none',
            cursor: agreed ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'background 180ms',
          }}
          onMouseEnter={(e) => { if (agreed) e.currentTarget.style.background = '#000000'; }}
          onMouseLeave={(e) => { if (agreed) e.currentTarget.style.background = '#1A1A1A'; }}
        >
          Начать тест
          {agreed && (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}

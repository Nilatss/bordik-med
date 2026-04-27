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
 *
 * Design: neutral callout style that matches the rest of the app. No red /
 * orange block-captions inside the rules cards — all section labels are
 * uppercase grey mono (like field labels elsewhere). The warning icon in
 * the header is also neutral grey — we've already told the user this is
 * a test, they don't need a yellow hazard sign.
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
        padding: '28px 32px',
        background: '#F5F6F8',
        borderRadius: 20,
      }}
    >
      {/* Label */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: '0 0 8px 0',
      }}>
        {testLabel}
      </p>

      {/* Title + neutral icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#FFFFFF', color: '#6B7280',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
          </svg>
        </span>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', margin: 0,
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Правила прохождения теста
        </h3>
      </div>

      {/* Camera + microphone requirement — first because it gates the test */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 10,
        borderLeft: '3px solid #3B82F6',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          Обязательно для прохождения
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Включённая камера и микрофон на протяжении всего теста</li>
          <li>Освещённая комната и хорошо видимое лицо в кадре</li>
          <li>Тишина — посторонние голоса будут засчитаны как нарушение</li>
        </ul>
      </div>

      {/* Forbidden — neutral callout style */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 10,
        borderLeft: '3px solid #D1D5DB',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          Во время теста запрещено
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Переключаться на другие вкладки или окна</li>
          <li>Сворачивать браузер</li>
          <li>Открывать режим разработчика (F12)</li>
          <li>Копировать вопросы или ответы</li>
          <li>Закрывать камеру или говорить вслух</li>
        </ul>
      </div>

      {/* Consequences — same neutral treatment */}
      <div style={{
        background: '#FFFFFF', borderRadius: 12,
        padding: '18px 20px', marginBottom: 18,
        borderLeft: '3px solid #D1D5DB',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 10px 0',
        }}>
          При нарушении
        </p>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: 'var(--font-body)', fontSize: 13.5,
          color: '#374151', lineHeight: 1.7,
        }}>
          <li>Даётся 10 секунд, чтобы вернуться в окно теста</li>
          <li>1-е и 2-е нарушения - предупреждение</li>
          <li>3-е нарушение - тест завершается, попытка не засчитывается</li>
          <li>Повторная попытка будет доступна только через 48 часов</li>
        </ul>
      </div>

      {/* Test params — chip pills in the muted-neutral palette */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18,
      }}>
        <div style={{
          flex: 1, padding: '12px 16px',
          background: '#FFFFFF', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#F5F6F8', color: '#6B7280',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" />
            </svg>
          </span>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Вопросов</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{questionCount}</p>
          </div>
        </div>
        <div style={{
          flex: 1, padding: '12px 16px',
          background: '#FFFFFF', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#F5F6F8', color: '#6B7280',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
          </span>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Время</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{timeMinutes} мин</p>
          </div>
        </div>
      </div>

      {/* Consent — matches the checkbox look used elsewhere in the app
          (square with black tick on check, white 1px shadow idle). */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        background: '#FFFFFF',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 18,
        transition: 'background 180ms',
      }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          background: agreed ? '#1A1A1A' : '#F5F6F8',
          boxShadow: agreed ? 'none' : '0 0 0 1px #E2E4EA inset',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
          transition: 'background 150ms, box-shadow 150ms',
        }}>
          {agreed && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
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

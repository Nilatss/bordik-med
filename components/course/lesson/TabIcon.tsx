/**
 * P1-CR-3 step 2/7 — TabIcon SVG sprite for lesson TOC.
 *
 * Self-contained presentational component. Inline SVG paths (нет внешних
 * dependencies) — bundle-friendly, нет dependency на icon-library.
 *
 * Используется в:
 *   - LessonHeader (active tab icon, size=24)
 *   - LessonTOC (in TOC list, size=16, через iconKey)
 *
 * iconKey values приходят из splitIntoTabs() (см. lib/course/lesson-tabs.ts):
 *   intro / biology / chemistry / physics / math / psychology /
 *   language / learning / check / glossary / tests
 *
 * Default fallback (clock icon) — для unknown iconKey.
 */
interface TabIconProps {
  name: string;
  size?: number;
}

export function TabIcon({ name, size = 16 }: TabIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'intro':
      return (
        <svg {...common}>
          <path d="M12 2v6M4.93 4.93l4.24 4.24M2 12h6M4.93 19.07l4.24-4.24M12 22v-6M19.07 19.07l-4.24-4.24M22 12h-6M19.07 4.93l-4.24 4.24" />
        </svg>
      );
    case 'biology':
      return (
        <svg {...common}>
          <path d="M4 4c8 4 8 12 16 16M20 4c-8 4-8 12-16 16" />
          <path d="M6 6h4M14 6h4M6 18h4M14 18h4" />
        </svg>
      );
    case 'chemistry':
      return (
        <svg {...common}>
          <path d="M9 2v7.5L4 20a2 2 0 001.7 3h12.6a2 2 0 001.7-3L15 9.5V2" />
          <line x1="9" y1="2" x2="15" y2="2" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      );
    case 'physics':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'math':
      return (
        <svg {...common}>
          <line x1="5" y1="5" x2="19" y2="5" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="5" y1="19" x2="19" y2="19" />
        </svg>
      );
    case 'psychology':
      return (
        <svg {...common}>
          <path d="M15.5 2A6.5 6.5 0 009 8.5c0 3 1.5 4.5 1.5 7v3A2.5 2.5 0 0013 21h.5A2.5 2.5 0 0016 18.5V16h1a2 2 0 002-2v-3a2 2 0 012-2 6.5 6.5 0 00-6.5-7z" />
        </svg>
      );
    case 'language':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
        </svg>
      );
    case 'learning':
      return (
        <svg {...common}>
          <path d="M22 10L12 4 2 10l10 6 10-6z" />
          <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case 'glossary':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case 'tests':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9l2 2 4-4" />
          <line x1="8" y1="15" x2="16" y2="15" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
}

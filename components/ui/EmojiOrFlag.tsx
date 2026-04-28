'use client';

// Country flags — shipped as inline SVG React components from
// country-flag-icons. Bundled with the app, no CDN or network needed,
// guaranteed to render on Windows Chrome/Firefox where emoji flag
// glyphs are missing from system fonts.
import {
  US, GB, DE, FR, CA, AU, NZ, JP, CN, KR, IN, BR, MX, ES, IT, CH, AT, NL,
  SA, RU, KZ, BY, UA, TR, IL, ZA, EG, NO, SE, DK, FI, IS,
} from 'country-flag-icons/react/3x2';

// country-flag-icons exports a FlagComponent with a custom props type
// (HTMLSVGElement intersection). We treat it structurally via `any` for
// the registry — actual call site only uses `style` + `aria-hidden`.
type FlagComp = (props: { style?: React.CSSProperties; 'aria-hidden'?: string | boolean }) => React.JSX.Element;

/** ISO 3166-1 alpha-2 → React SVG flag component. */
const FLAG_COMPONENTS: Record<string, FlagComp> = {
  US, GB, DE, FR, CA, AU, NZ, JP, CN, KR, IN, BR, MX, ES, IT, CH, AT, NL,
  SA, RU, KZ, BY, UA, TR, IL, ZA, EG, NO, SE, DK, FI, IS,
} as unknown as Record<string, FlagComp>;

/**
 * Renders country flags as local SVGs bundled with the app via
 * `country-flag-icons` — no CDN, no network request, works offline,
 * guaranteed to show on Windows Chrome/Firefox where flag emoji
 * glyphs are missing from system fonts.
 *
 * For multi-country regions (Latin America, Scandinavia, CIS, ASEAN,
 * International) we map to a custom inline coloured badge.
 */
interface Props {
  emoji: string;
  size?: number;
}

// Custom inline SVGs for multi-country regions that don't have a single
// country flag (globe emoji, EU flag etc.). Each is a simple coloured
// circle with a region abbreviation — readable and lightweight.
const REGION_SVGS: Record<string, { label: string; bg: string; fg: string }> = {
  '🌍': { label: 'UN', bg: '#3B82F6', fg: '#FFFFFF' },
  '🌎': { label: 'LA', bg: '#10B981', fg: '#FFFFFF' },
  '🌏': { label: 'AS', bg: '#F59E0B', fg: '#FFFFFF' },
  '🌐': { label: 'CIS', bg: '#6366F1', fg: '#FFFFFF' },
  '🇪🇺': { label: 'EU', bg: '#003399', fg: '#FFCC00' },
};

/** Map a 2-codepoint flag emoji → ISO 3166-1 alpha-2 UPPERCASE ("US", "GB"). */
function flagToIso(str: string): string | null {
  if (!str) return null;
  const cps: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) cps.push(cp);
  }
  if (cps.length !== 2) return null;
  const a = cps[0];
  const b = cps[1];
  if (a === undefined || b === undefined) return null;
  const BASE = 0x1F1E6; // regional indicator A
  if (a < BASE || a > 0x1F1FF || b < BASE || b > 0x1F1FF) return null;
  // U+1F1E6 = A, so offset + 0x41 gives ASCII upper-case letter.
  const ch1 = String.fromCharCode(a - BASE + 0x41);
  const ch2 = String.fromCharCode(b - BASE + 0x41);
  return `${ch1}${ch2}`;
}

export default function EmojiOrFlag({ emoji, size = 18 }: Props) {
  // Region badge (Latin America, CIS, ASEAN, UN) rendered as a neutral
  // coloured pill — no network, no emoji font dependency.
  const region = REGION_SVGS[emoji];
  if (region) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size * 1.33, // keep roughly the same aspect ratio as country flags (4:3)
          height: size,
          flexShrink: 0,
          borderRadius: 2,
          background: region.bg,
          color: region.fg,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: Math.round(size * 0.55),
          fontWeight: 700,
          letterSpacing: '-0.02em',
          verticalAlign: 'middle',
        }}
      >
        {region.label}
      </span>
    );
  }

  const iso = flagToIso(emoji);
  if (iso) {
    // Bundled flag — comes in via country-flag-icons/react/3x2 and
    // ships inline as part of the JS bundle. No CDN, works offline,
    // renders identically in every browser.
    const Flag = FLAG_COMPONENTS[iso];
    const width = Math.round(size * 1.33);
    if (Flag) {
      return (
        <Flag
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            flexShrink: 0,
            borderRadius: 2,
            width,
            height: size,
          }}
          aria-hidden="true"
        />
      );
    }
    // Fallback for any ISO we didn't explicitly import — shows the
    // 2-letter code in a grey pill so the UI doesn't break silently.
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height: size,
          background: '#E2E4EA',
          color: '#374151',
          fontSize: Math.round(size * 0.55),
          fontWeight: 700,
          borderRadius: 2,
          fontFamily: 'var(--font-mono, monospace)',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      >
        {iso}
      </span>
    );
  }

  // Anything else → native emoji font.
  return (
    <span style={{
      fontSize: size,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size * 1.2,
      flexShrink: 0,
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif',
    }}>
      {emoji}
    </span>
  );
}

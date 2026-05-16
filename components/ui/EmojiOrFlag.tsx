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
        className="inline-flex items-center justify-center shrink-0 rounded-[2px] font-[var(--font-mono,monospace)] font-bold tracking-[-0.02em] align-middle bg-[var(--region-bg)] text-[var(--region-fg)] w-[calc(var(--region-size)*1.33)] h-[var(--region-size)] text-[calc(var(--region-size)*0.55)]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic region palette + size
        style={{
          ['--region-bg' as string]: region.bg,
          ['--region-fg' as string]: region.fg,
          ['--region-size' as string]: `${size}px`,
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
          // eslint-disable-next-line react/forbid-dom-props -- country-flag-icons accepts inline style with dynamic width/height
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
        className="inline-flex items-center justify-center bg-[#E2E4EA] text-[#374151] font-bold rounded-[2px] font-[var(--font-mono,monospace)] align-middle shrink-0 h-[var(--flag-h)] w-[var(--flag-w)] text-[calc(var(--flag-h)*0.55)]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic flag size
        style={{
          ['--flag-w' as string]: `${width}px`,
          ['--flag-h' as string]: `${size}px`,
        }}
      >
        {iso}
      </span>
    );
  }

  // Anything else → native emoji font.
  return (
    <span
      className="leading-none inline-flex items-center justify-center shrink-0 font-['Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji','Twemoji_Mozilla',sans-serif] text-[var(--emoji-size)] w-[calc(var(--emoji-size)*1.2)]"
      // eslint-disable-next-line react/forbid-dom-props -- dynamic emoji size
      style={{ ['--emoji-size' as string]: `${size}px` }}
    >
      {emoji}
    </span>
  );
}

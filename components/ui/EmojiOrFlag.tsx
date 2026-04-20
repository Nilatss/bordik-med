'use client';

/**
 * Renders flag emojis as proper images (Windows Chrome, Firefox lack flag
 * emoji glyphs and would otherwise show blank squares). Falls back to the
 * native emoji font for non-flag emoji like 🌍.
 *
 * Sources:
 *   – Country flags  → flagcdn.com (ISO 3166-1 alpha-2) — battle-tested CDN
 *   – Multi-flag emoji (ЕС, PAHO etc.) → jsDelivr npm twemoji (SVG)
 *   – Everything else → native font with emoji fallback chain
 */
interface Props {
  emoji: string;
  size?: number;
}

/** Map a 2-codepoint flag emoji → ISO 3166-1 alpha-2 ("us", "gb", ...). */
function flagToIso(str: string): string | null {
  if (!str) return null;
  const cps: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) cps.push(cp);
  }
  if (cps.length !== 2) return null;
  const [a, b] = cps;
  const BASE = 0x1F1E6; // regional indicator A
  if (a < BASE || a > 0x1F1FF || b < BASE || b > 0x1F1FF) return null;
  // U+1F1E6 = A (0x41), so offset + 0x41 gives ascii upper-case letter.
  const ch1 = String.fromCharCode(a - BASE + 0x61);
  const ch2 = String.fromCharCode(b - BASE + 0x61);
  return `${ch1}${ch2}`;
}

/** Twemoji filename for non-flag emoji (globe, world maps, ...). */
function emojiToTwemojiFile(str: string): string | null {
  if (!str) return null;
  const cps: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined && cp !== 0xFE0F /* variation selector */) cps.push(cp);
  }
  if (cps.length === 0) return null;
  return cps.map((cp) => cp.toString(16)).join('-');
}

export default function EmojiOrFlag({ emoji, size = 18 }: Props) {
  const iso = flagToIso(emoji);

  if (iso) {
    // w40 = 40-px wide PNG (sharp at 2x up to 20 px); w80 for larger.
    const bucket = size > 24 ? 'w80' : 'w40';
    return (
      <img
        src={`https://flagcdn.com/${bucket}/${iso}.png`}
        width={size}
        height={Math.round(size * 0.75)}
        alt=""
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          borderRadius: 2,
        }}
        draggable={false}
        loading="lazy"
      />
    );
  }

  // Non-flag emoji (🌍 🌎 🌐 🇪🇺 isn't a real flag — it's ISO EU, no image).
  // Try twemoji SVG via jsDelivr npm, fall back to native font on error.
  const twFile = emojiToTwemojiFile(emoji);
  if (twFile) {
    return (
      <img
        src={`https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/svg/${twFile}.svg`}
        width={size}
        height={size}
        alt=""
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
        draggable={false}
        loading="lazy"
        onError={(e) => {
          // Fallback: replace with native span if twemoji 404
          const el = e.currentTarget;
          const span = document.createElement('span');
          span.textContent = emoji;
          span.style.cssText = `font-size:${size}px;line-height:1;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;`;
          el.replaceWith(span);
        }}
      />
    );
  }

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

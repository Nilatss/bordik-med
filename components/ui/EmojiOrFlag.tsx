'use client';

/**
 * Renders flag emojis via Twemoji SVG (emoji-style, works on Windows too).
 * Other emojis render natively with proper emoji font fallback.
 */
interface Props {
  emoji: string;
  size?: number;
}

/** If emoji is a flag (two regional-indicator codepoints), return Twemoji filename. */
function flagToTwemojiCode(str: string): string | null {
  if (!str) return null;
  const cps: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) cps.push(cp);
  }
  if (cps.length !== 2) return null;
  const [a, b] = cps;
  const BASE = 0x1F1E6;
  if (a < BASE || a > 0x1F1FF || b < BASE || b > 0x1F1FF) return null;
  return `${a.toString(16)}-${b.toString(16)}`;
}

export default function EmojiOrFlag({ emoji, size = 18 }: Props) {
  const flagCode = flagToTwemojiCode(emoji);

  if (flagCode) {
    return (
      <img
        src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${flagCode}.svg`}
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

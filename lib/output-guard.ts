/**
 * Defence-in-depth output guard for AI-generated text.
 *
 * Used after `Gemini` / similar models return free-form strings that we
 * are about to splat back into the browser (rendered through React, but
 * only AFTER our own JSON layer — which means a clever payload can
 * survive react-markdown's pipeline if we don't pre-screen).
 *
 * Why we don't trust a one-shot regex (the previous implementation):
 *   - HTML-entity smuggling: `&#x6A;avascript:` decodes to `javascript:`
 *     after the browser sees it but before any href click.
 *   - Tab / NUL injection: `jav&#x09;ascript:` — protocol parsers strip
 *     control chars before matching scheme.
 *   - SVG `<svg onload=…>` and MathML — both can carry handlers without
 *     a `<script>` tag in sight.
 *   - CSS `expression()` (legacy IE), `<style>` injection.
 *
 * What this module does:
 *   1. Multi-pass entity decode (`&#x..`, `&#..`, named) until stable.
 *   2. Strip control chars (NUL/TAB/CR/LF) so they cannot break a
 *      protocol token like `j a v a s c r i p t :` after decoding.
 *   3. Quick regex on the decoded string for forbidden URI schemes —
 *      catches `javascript:`, `vbscript:`, `data:text/html`, `blob:`,
 *      `file:` even when they appear as plain text.
 *   4. Parse via parse5 → walk the fragment tree:
 *        - reject any element from FORBIDDEN_TAGS
 *        - reject any attribute matching `/^on/i` (event handlers)
 *        - reject any `href` / `src` / `xlink:href` with a forbidden
 *          protocol after another decode round
 *
 * This is a *deny-by-default-on-suspicion* guard — false positives are
 * acceptable (we drop the AI response and surface 502); false negatives
 * are the thing we are paranoid about.
 *
 * Usage:
 *   import { isOutputSafe } from '@/lib/output-guard';
 *   const verdict = isOutputSafe(geminiText);
 *   if (!verdict.safe) return new Response(`output_blocked:${verdict.reason}`, { status: 502 });
 */
import { parseFragment } from 'parse5';

const FORBIDDEN_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'meta', 'link',
  'svg', 'math', 'form', 'input', 'button', 'textarea',
  'base', 'frame', 'frameset', 'noscript',
]);

const FORBIDDEN_ATTR_PREFIX = /^on/i;       // onclick, onload, onerror, onmouseover, …

// Used for attribute values (href, src, xlink:href): full URI — the value
// IS the URL, so `^` is correct (only dangerous at the start of a URL).
const FORBIDDEN_PROTOCOL = /^\s*(javascript|vbscript|data|blob|file):/i;

// Used for plain-text scanning of the entire decoded output. We ONLY look
// for javascript: and vbscript: because data:, blob:, file: appear in
// normal medical sentences ("the data: analysis shows…") and would cause
// false-positive blocks.  The `^` was previously applied here too, which
// silently missed embedded URIs like "Learn more at javascript:void(0)" in
// the middle of a response — the documented intent ("catches even when they
// appear as plain text") was not met.
const FORBIDDEN_PROTOCOL_IN_TEXT = /javascript:|vbscript:/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  Tab: '\t', NewLine: '\n',
};

function decodeEntities(s: string): string {
  // Multi-pass: nested entities like `&amp;#x6A;` need 2 passes.
  let prev = '';
  let cur = s;
  for (let i = 0; i < 5 && prev !== cur; i++) {
    prev = cur;
    cur = cur
      .replace(/&#x([0-9a-f]+);?/gi, (_, h) => {
        const cp = parseInt(h, 16);
        return Number.isFinite(cp) && cp <= 0x10ffff ? String.fromCodePoint(cp) : _;
      })
      .replace(/&#(\d+);?/g, (_, d) => {
        const cp = parseInt(d, 10);
        return Number.isFinite(cp) && cp <= 0x10ffff ? String.fromCodePoint(cp) : _;
      })
      .replace(/&([a-zA-Z]+);?/g, (m, n) => NAMED_ENTITIES[n] ?? m);
  }
  return cur;
}

// P2-NEW-5 — regex для control-chars выражен через RegExp constructor
// со строковыми escape-последовательностями. Раньше literal
// /[\x00-\x1F]/ сохранялся как сырые control-bytes (`grep` показывал
// файл как binary, IDE могла поломать). Source теперь plain ASCII.
const CONTROL_CHARS_RE = new RegExp('[\\x00-\\x1F]', 'g');

function stripControl(s: string): string {
  // Drop NUL through US (0x00–0x1F). Без этого 'jav<TAB>ascript:'
  // обошёл бы naive scheme regex.
  return s.replace(CONTROL_CHARS_RE, '');
}

export interface GuardVerdict {
  safe: boolean;
  reason?: string;
}

interface AttrLike { name: string; value: string }
interface NodeLike {
  tagName?: string;
  attrs?: AttrLike[];
  childNodes?: NodeLike[];
}

export function isOutputSafe(text: string): GuardVerdict {
  if (typeof text !== 'string' || text.length === 0) return { safe: true };

  // 1 + 2: decode + de-control before any pattern match.
  const decoded = stripControl(decodeEntities(text));

  // 3. Plain-text protocol detection — catches `javascript:` / `vbscript:`
  // anywhere in the decoded output, not just at the start.  This handles
  // the case where the model embeds a dangerous URI in the middle of an
  // otherwise normal sentence ("Check this: javascript:alert(1)").
  // `data:`, `blob:`, `file:` are intentionally excluded from the global
  // scan — they appear naturally in medical text and would cause false
  // positives; the tree walk (step 4) handles them in attribute context.
  if (FORBIDDEN_PROTOCOL_IN_TEXT.test(decoded)) {
    return { safe: false, reason: 'forbidden_protocol_in_text' };
  }

  // 4. Tree walk. parseFragment is forgiving and never throws.
  let frag: NodeLike;
  try {
    frag = parseFragment(decoded) as unknown as NodeLike;
  } catch {
    // If parse5 chokes (it shouldn't), treat as unsafe — better drop
    // than allow.
    return { safe: false, reason: 'parser_error' };
  }

  let unsafe: string | undefined;
  function walk(n: NodeLike): void {
    if (unsafe) return;
    if (n.tagName) {
      const t = n.tagName.toLowerCase();
      if (FORBIDDEN_TAGS.has(t)) {
        unsafe = `forbidden_tag:${t}`;
        return;
      }
    }
    if (Array.isArray(n.attrs)) {
      for (const a of n.attrs) {
        if (FORBIDDEN_ATTR_PREFIX.test(a.name)) {
          unsafe = `forbidden_attr:${a.name}`;
          return;
        }
        if (a.name === 'href' || a.name === 'src' || a.name === 'xlink:href') {
          // Decode the attribute value too — entities inside attrs are
          // a classic bypass vector.
          const v = stripControl(decodeEntities(a.value ?? ''));
          if (FORBIDDEN_PROTOCOL.test(v)) {
            unsafe = `forbidden_protocol_in_attr:${a.name}`;
            return;
          }
        }
        if (a.name === 'style') {
          // CSS `expression()` (legacy IE) and `url(javascript:…)` — be
          // strict, just reject any style attribute on AI output.
          unsafe = 'forbidden_style_attr';
          return;
        }
      }
    }
    if (Array.isArray(n.childNodes)) {
      for (const c of n.childNodes) {
        walk(c);
        if (unsafe) return;
      }
    }
  }
  walk(frag);

  return unsafe ? { safe: false, reason: unsafe } : { safe: true };
}

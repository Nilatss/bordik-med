/**
 * Defence-in-depth helpers for `react-markdown`.
 *
 * react-markdown 9+ already blocks `javascript:` and a few other
 * dangerous schemes via its `defaultUrlTransform`, but the policy is
 * loose by design (it allows `data:` for images). For our medical-edu
 * context we want a tighter allowlist — specifically, anything coming
 * from the AI (Gemini diagnostic answers) must NEVER produce a
 * `javascript:`, `data:`, `vbscript:`, `blob:` or `file:` link, even
 * accidentally.
 *
 * This module exports a `safeUrlTransform` that:
 *   - rejects any non-allowlisted protocol → returns empty string
 *     (react-markdown drops the link)
 *   - allows http(s), mailto, tel, relative paths, anchor fragments
 *   - lower-cases + trims before checking
 *
 * Wire into ReactMarkdown:
 *   <ReactMarkdown urlTransform={safeUrlTransform} ...>
 */

const ALLOWED_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', 'sms:'];

/**
 * Returns the URL unchanged if safe, or an empty string to strip the link.
 * react-markdown calls this for every href/src.
 */
export function safeUrlTransform(url: string): string {
  if (!url) return '';
  const lower = url.toLowerCase().trim();

  // Relative paths and anchor fragments - safe.
  if (lower.startsWith('/') || lower.startsWith('#') || lower.startsWith('?')) {
    return url;
  }

  // Allowlisted protocols.
  for (const p of ALLOWED_PREFIXES) {
    if (lower.startsWith(p)) return url;
  }

  // Anything else (javascript:, data:, vbscript:, blob:, file:, etc.)
  // is dropped. Returning '' makes react-markdown render the link text
  // as plain text without an <a> wrapper.
  return '';
}

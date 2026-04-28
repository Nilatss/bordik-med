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

import { defaultSchema } from 'rehype-sanitize';
// hast-util-sanitize types are strict about attribute tuples; we keep
// our schema as `any` to avoid replicating the entire PropertyDefinition
// union here. The runtime shape is what rehype-sanitize expects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanitizeSchema = any;

const ALLOWED_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', 'sms:'];

/**
 * rehype-sanitize schema for AI- or user-generated markdown.
 *
 * Builds on rehype's `defaultSchema` (which already blocks <script>,
 * <style>, on* event handlers, and most dangerous tags) and tightens
 * a few medical-edu specific things:
 *
 *   - drop <iframe>, <object>, <embed>, <form>, <input>, <button>,
 *     <textarea>, <select> entirely (defaultSchema already blocks
 *     <script>/<style>/<svg>; we explicitly reinforce)
 *   - tag attributes: keep className for our own renderers, allow
 *     `target` only with rel=noopener-noreferrer enforcement on links
 *   - allow `code`, `pre`, `table`, `tbody`, `thead`, `tr`, `th`, `td`
 *     (medical content needs tables for normal-ranges)
 *
 * Wire into ReactMarkdown:
 *   import rehypeSanitize from 'rehype-sanitize';
 *   <ReactMarkdown rehypePlugins={[[rehypeSanitize, sanitizeSchema]]} ...>
 */
export const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  // Tag list = defaultSchema's allowlist minus anything we don't want.
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (t) => !['iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select'].includes(t),
  ),
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    // Allow our render-time className hook on every element.
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
    // Anchors: keep href + title; let our urlTransform gate the protocol.
    a: [
      ...((defaultSchema.attributes?.a as Array<unknown>) ?? []),
      'href',
      'title',
      ['rel', 'noopener', 'noreferrer', 'nofollow'],
      ['target', '_blank'],
    ],
    // Images: src + alt + title only - no srcset / loading / decoding.
    img: [
      ...((defaultSchema.attributes?.img as Array<unknown>) ?? []),
      'src',
      'alt',
      'title',
    ],
  },
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ['http', 'https', 'mailto', 'tel', 'sms'],
    src:  ['http', 'https'],
  },
};

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

import { NextResponse } from 'next/server';
import { withSameOrigin, apiError } from '@/lib/api-helpers';
import { log } from '@/lib/log';

/**
 * POST /api/feedback
 *
 * Forwards user feedback to a Telegram chat via the Bot API. Accepts
 * `multipart/form-data`:
 *   - text:  string                 (required, the feedback body)
 *   - files: File[] (optional, name="file")  up to 5 attachments × 5 MB each
 *
 * Required env vars (set in Vercel project settings):
 *   TELEGRAM_BOT_TOKEN  - from @BotFather
 *   TELEGRAM_CHAT_ID    - chat / channel id where the bot posts (negative
 *                         for groups, positive for private chats with the
 *                         bot owner; obtainable via @userinfobot or
 *                         https://api.telegram.org/bot<TOKEN>/getUpdates)
 *
 * Limits enforced server-side: 5 files × 5 MB and 4000-char text body
 * (Telegram message limit is 4096 - we leave room for the prefix).
 */
const MAX_FILES        = 5;
const MAX_FILE_BYTES   = 5 * 1024 * 1024;     // 5 MB per file
const MAX_TEXT_LEN     = 4000;
const TG_API           = 'https://api.telegram.org';

export const runtime = 'nodejs';
// Avoid edge: Telegram requires multipart/form-data when sending files,
// and Node FormData support is more reliable on the Node runtime.
export const dynamic  = 'force-dynamic';

export async function POST(req: Request) {
  // P2-NEW-1 — origin guard (раньше open POST). withSameOrigin
  // не требует auth, но блокирует cross-origin запросы.
  return withSameOrigin(req, async () => {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT  = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT) {
    return apiError('backend-not-configured', 503);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-form' }, { status: 400 });
  }

  const rawText = String(form.get('text') ?? '').trim();
  if (!rawText) {
    return NextResponse.json({ ok: false, error: 'empty-text' }, { status: 400 });
  }
  const text = rawText.slice(0, MAX_TEXT_LEN);

  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: 'too-many-files' }, { status: 400 });
  }
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'file-too-large', name: f.name },
        { status: 400 },
      );
    }
  }

  // Optional context picked up from the request - useful for triage
  const ua = req.headers.get('user-agent') ?? '';
  const ref = req.headers.get('referer') ?? '';
  const ts = new Date().toISOString();

  const header = [
    '🟢 *Bordik feedback*',
    `🕒 ${ts}`,
    ref ? `📄 \`${escapeMd(ref)}\`` : null,
    ua  ? `🖥️ \`${escapeMd(ua.slice(0, 200))}\`` : null,
    '',
    escapeMd(text),
  ].filter(Boolean).join('\n');

  // 1. Always send the text first
  try {
    const r = await fetch(`${TG_API}/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT,
        text: header,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
      // P2-NEW-4 — SSRF guard
      redirect: 'error',
    });
    if (!r.ok) {
      // P2-SEC — структурированный лог через lib/log с redaction вместо
      // голого console.error (Telegram body раньше тёк в plaintext-логи).
      // log.error пропускает через redactor (token-pattern маскируется).
      log.error({
        event: 'feedback_tg_send_failed',
        status: r.status,
        // body НЕ логируем — может содержать sensitive bot-state
      });
      return NextResponse.json(
        { ok: false, error: 'tg-send-failed', status: r.status },
        { status: 502 },
      );
    }
  } catch (err) {
    log.error({
      event: 'feedback_tg_send_threw',
      message: (err as Error).message ?? 'unknown',
    });
    return NextResponse.json({ ok: false, error: 'tg-network' }, { status: 502 });
  }

  // 2. Attach each file as a separate Telegram document (simpler and more
  //    reliable than a media-group when files have mixed types).
  for (const f of files) {
    const tgForm = new FormData();
    tgForm.append('chat_id', CHAT);
    tgForm.append('caption', f.name);
    tgForm.append('document', f, f.name);
    try {
      const r = await fetch(`${TG_API}/bot${TOKEN}/sendDocument`, {
        method: 'POST',
        body: tgForm,
        // P2-NEW-4 — SSRF guard
        redirect: 'error',
      });
      if (!r.ok) {
        log.error({
          event: 'feedback_tg_doc_failed',
          fileName: f.name,
          status: r.status,
        });
        // Continue with the rest - the main text already went through.
      }
    } catch (err) {
      log.error({
        event: 'feedback_tg_doc_threw',
        fileName: f.name,
        message: (err as Error).message ?? 'unknown',
      });
    }
  }

    return NextResponse.json({ ok: true });
  });
}

/** Escape Markdown V2 reserved characters per Telegram docs. */
function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

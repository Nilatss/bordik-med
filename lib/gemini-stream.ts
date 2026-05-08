/**
 * P1-PERF-NEW-5 — Gemini streaming helper.
 *
 * Использует `streamGenerateContent` endpoint Gemini вместо обычного
 * `generateContent`. Чанки text приходят по мере генерации модели,
 * server передаёт их клиенту через ReadableStream → client UI может
 * показать accumulated text без waiting full response (3-8s).
 *
 * Совместимо с Edge runtime: использует только fetch + ReadableStream
 * + TextDecoder (все Edge-builtin).
 *
 * Use:
 *   for await (const chunk of streamGemini(prompt, ac.signal)) {
 *     accumulated += chunk;
 *     // emit к клиенту через TransformStream
 *   }
 *
 * Multi-model fallback (как в geminiCall) пока НЕ implementированы —
 * streaming используется только для /finalize, где fallback есть на
 * application-level (rule-based если Gemini fails). Если первый
 * модель в списке падает в стриминге, мы НЕ пробуем следующий —
 * просто falls back к ruleBasedFinalize.
 */

import { reserveGeminiQuota } from './gemini-quota';
import { log } from './log';

const STREAM_TOTAL_BUDGET_MS = 12_000; // больше чем non-stream (8.5s) — Vercel pro limits 25s

interface GeminiStreamChunk {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

/**
 * AsyncIterable генератор text-chunks от Gemini stream endpoint.
 * Yields raw text fragments по мере прихода SSE-style data lines.
 * НЕ accumulate — caller сам собирает (для гибкости).
 */
export async function* streamGemini(
  prompt: string,
  model: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) throw new Error('gemini-not-configured');

  // P2-NEW-9 — daily quota
  const quota = await reserveGeminiQuota();
  if (!quota.ok) {
    log.warn({ event: 'gemini_daily_cap_exceeded_stream', used: quota.used, cap: quota.cap });
    throw new Error(`gemini-daily-cap-exceeded (${quota.used}/${quota.cap})`);
  }

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  // Gemini stream endpoint:
  //   POST /v1beta/models/<model>:streamGenerateContent?alt=sse
  // alt=sse formats output as Server-Sent Events (data: <chunk>\n\n).
  // Без alt=sse — newline-delimited JSON, less convenient to parse.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

  const ac = new AbortController();
  const totalTimer = setTimeout(() => ac.abort(), STREAM_TOTAL_BUDGET_MS);
  // Forward parent abort signal
  signal?.addEventListener('abort', () => ac.abort());

  let r: Response;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': KEY,
        accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: ac.signal,
      // P2-NEW-4 SSRF guard
      redirect: 'error',
    });
  } catch (err) {
    clearTimeout(totalTimer);
    const aborted = (err as Error)?.name === 'AbortError';
    log.warn({ event: 'gemini_stream_fetch_failed', model, aborted });
    throw new Error(`gemini-stream-${aborted ? 'timeout' : 'fetch-failed'} (${model}): ${(err as Error).message}`);
  }

  if (!r.ok || !r.body) {
    clearTimeout(totalTimer);
    const txt = await r.text().catch(() => '');
    log.warn({ event: 'gemini_stream_http_error', model, status: r.status, body: txt.slice(0, 200) });
    throw new Error(`gemini-stream-${r.status} (${model}): ${txt.slice(0, 200)}`);
  }

  // SSE parser: каждый event = "data: <json>\n\n". Чанки могут приходить
  // partial — буферизуем по newline-pairs.
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split on event boundaries (\n\n)
      let idx;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const eventBlock = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        // Парсим event-block: каждая line вида `data: <payload>` или `event: <name>`
        const dataLines = eventBlock
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trim());
        if (dataLines.length === 0) continue;

        const payload = dataLines.join('\n');
        if (payload === '[DONE]') return;

        try {
          const parsed = JSON.parse(payload) as GeminiStreamChunk;
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          // Malformed chunk — log + skip, не падаем (упустим chunk, но
          // следующий может прийти cleanly)
          log.warn({ event: 'gemini_stream_bad_chunk', preview: payload.slice(0, 100) });
        }
      }
    }
  } finally {
    clearTimeout(totalTimer);
    try { reader.releaseLock(); } catch { /* already released */ }
  }
}

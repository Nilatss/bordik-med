/**
 * Regression test for Bug 2 (streaming reader cleanup).
 *
 * Before fix: the NDJSON reader loop in DiagnosticTest.finalize() had no
 * try/finally. If reader.read() threw (e.g. network dropped mid-stream),
 * the ReadableStreamDefaultReader was never cancelled, leaving the stream
 * body locked and the underlying TCP connection open until GC.
 *
 * After fix: a try/finally wraps the for-loop, ensuring reader.cancel() is
 * always called — whether the loop completes normally, receives 'done', or
 * throws.
 *
 * These tests exercise the cleanup contract using Node 18+ built-in
 * ReadableStream — no DOM required.
 */
import { describe, it, expect, vi } from 'vitest';

interface NdjsonEvent {
  type: string;
  text?: string;
  result?: unknown;
}

/** Mirrors the fixed loop in DiagnosticTest.finalize(). */
async function consumeNdjsonReader(
  reader: ReadableStreamDefaultReader<string>,
): Promise<{ finalResult: unknown | null }> {
  let buf = '';
  let finalResult: unknown = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += value;
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        try {
          const evt = JSON.parse(line) as NdjsonEvent;
          if (evt.type === 'done' && evt.result) {
            finalResult = evt.result;
          }
        } catch { /* skip malformed line */ }
      }
    }
  } finally {
    // This is the fix: always cancel, even if read() threw.
    reader.cancel().catch(() => { /* already closed */ });
  }
  return { finalResult };
}

describe('NDJSON streaming reader cleanup', () => {
  it('calls reader.cancel() after a successful read-to-end', async () => {
    const lines = [
      '{"type":"chunk","text":"Анализирую…"}\n',
      '{"type":"done","result":{"profession":"Педиатр"}}\n',
    ];
    let i = 0;
    const stream = new ReadableStream<string>({
      pull(controller) {
        if (i < lines.length) controller.enqueue(lines[i++]!);
        else controller.close();
      },
    });

    const reader = stream.getReader();
    const cancelSpy = vi.spyOn(reader, 'cancel');

    const { finalResult } = await consumeNdjsonReader(reader);

    expect((finalResult as Record<string, unknown>)?.profession).toBe('Педиатр');
    expect(cancelSpy).toHaveBeenCalledOnce();
  });

  it('calls reader.cancel() even when read() rejects mid-stream', async () => {
    const stream = new ReadableStream<string>({
      pull(controller) {
        controller.error(new TypeError('network error'));
      },
    });

    const reader = stream.getReader();
    const cancelSpy = vi.spyOn(reader, 'cancel');

    // consumeNdjsonReader re-throws from the loop but always runs finally.
    await expect(consumeNdjsonReader(reader)).rejects.toThrow('network error');

    expect(cancelSpy).toHaveBeenCalledOnce();
  });

  it('calls reader.cancel() when stream closes without a "done" event', async () => {
    const stream = new ReadableStream<string>({
      pull(controller) {
        controller.enqueue('{"type":"chunk","text":"stage 1"}\n');
        controller.close();
      },
    });

    const reader = stream.getReader();
    const cancelSpy = vi.spyOn(reader, 'cancel');

    const { finalResult } = await consumeNdjsonReader(reader);

    expect(finalResult).toBeNull();
    expect(cancelSpy).toHaveBeenCalledOnce();
  });
});

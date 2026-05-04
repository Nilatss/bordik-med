import { NextResponse } from 'next/server';
import * as v from 'valibot';
import { identifyAndLimit } from '@/lib/rate-limit';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isOutputSafe as isOutputSafeStrict } from '@/lib/output-guard';
import { assertSameOrigin } from '@/lib/origin-check';
import { log } from '@/lib/log';

// Rate limits are enforced via lib/rate-limit.identifyAndLimit, which
// uses Upstash sliding-window when UPSTASH_REDIS_REST_URL is set and
// falls back to in-memory token bucket otherwise. Per-IP: 30/min,
// per-user: 60/min. One diagnostic test ≈ 16 calls.

/**
 * Adaptive diagnostic test backed by Google Gemini.
 *
 * POST /api/diagnostic
 *
 * Body shape:
 *   { action: 'next', history: TurnHistory[] }
 *   { action: 'finalize', history: TurnHistory[], modules: ModuleSummary[] }
 *
 * Each request burns one Gemini call. We use the same free-tier endpoint
 * (`gemini-2.0-flash`) the offline question generator already uses, so
 * the rate-limit budget is shared - one diagnostic test ≈ 16 calls
 * (15 questions + 1 finalize), which fits comfortably in the 1500/day
 * free quota for the project token.
 *
 * Required env: GEMINI_API_KEY (server-side only).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Free-tier daily quotas are PER-MODEL on Gemini. We try the primary model
// first and silently fall back to lighter models when 429 hits (quota out).
// Order is intentional: best-quality first, lighter fallbacks after.
// Gemini free-tier daily quotas are PER-MODEL. Try newest/cheapest first
// because they have the freshest, most generous quotas. The 1.5 series was
// deprecated in April 2025 and removed from v1beta - excluded here.
const GEMINI_MODELS = (process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : [
      'gemini-2.5-flash-lite',  // newest, lightest, biggest free quota
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
    ]
);
// 30 questions covers more topics so the recommendation has real
// signal across anatomy / physiology / pharmacology / clinical etc.
// 15 was too short to differentiate specialties confidently. Each
// question is one Gemini call → ~31 calls total per test (30 + 1
// finalize), still inside the per-day free-tier quota for the
// fallback chain (gemini-2.5-flash-lite has 1500 RPD on its own).
const TOTAL_QUESTIONS = 30;

interface Turn {
  question: string;
  options: string[];        // 4 strings
  correctIndex: number;
  selectedIndex: number;
  topic: string;
}

interface ModuleSummary {
  id: number;
  sectionId: string;
  title: string;
  description: string;
}

const SYSTEM_PROMPT_NEXT = `Ты - адаптивный диагностический агент медицинской платформы Bordik. Твоя задача - оценить уровень знаний пользователя в разных областях медицины, задавая ОДИН следующий вопрос за раз.

Правила:
1. Опираясь на предыдущие ответы, выбери НАИБОЛЕЕ ИНФОРМАТИВНЫЙ следующий вопрос:
   - Если пользователь уверенно отвечает в одной области - переключись на другую
   - Если ошибается - попробуй чуть проще или копни в смежную тему, чтобы понять глубину пробела
   - Покрой за весь тест базовые разделы: анатомия, физиология, биохимия, фармакология, патология, клинические дисциплины, неотложка, общественное здоровье
2. Уровень сложности подстраивай под уже виденные ответы. Не делай 30 одинаково лёгких или одинаково сложных подряд.
3. Вопросы пиши на русском языке, чёткие формулировки, без двусмысленностей.
4. ВСЕГДА 4 варианта ответа, ровно один правильный.
5. ОБЯЗАТЕЛЬНО возвращай поле "topic" одним из: anatomy, physiology, biochemistry, pharmacology, pathology, internal-medicine, surgery, pediatrics, obstetrics, emergency, public-health, ethics, clinical-skills, lab-diagnostics, imaging.

Ответ - строго один JSON-объект:
{
  "question": "string (текст вопроса)",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "topic": "string из списка выше",
  "explanation": "короткое объяснение почему правильный ответ - правильный (1-2 предложения)"
}

НИКАКИХ markdown-блоков, преамбул, комментариев. Только сырой JSON.`;

const SYSTEM_PROMPT_FINALIZE = `Ты - советник медицинской платформы Bordik. По ответам пользователя в адаптивном диагностическом тесте составь персонализированную рекомендацию.

Дано:
- история ответов с темами и правильностью
- список модулей платформы (id + название + описание)

Верни строго JSON:
{
  "profession": "название одной наиболее подходящей медицинской специальности на русском",
  "professionRationale": "2-3 предложения почему именно эта специальность - на основе сильных сторон и интересов",
  "level": "basic" | "intermediate" | "advanced",
  "strengths": ["краткое описание 1", "краткое описание 2", "краткое описание 3"],
  "weaknesses": ["пробел 1", "пробел 2", "пробел 3"],
  "recommendedModuleIds": [число, число, число, число, число],
  "studyPlan": "одно сжатое предложение с планом обучения на 1-2 предложения"
}

Правила:
- recommendedModuleIds: 3-6 ID из переданного списка, отсортированных по релевантности (самый важный первый). Берёшь только те id, которые есть в списке.
- profession - это рекомендация дальнейшего профессионального направления (например "Анестезиолог-реаниматолог", "Семейный врач", "Хирург", "Педиатр", "Кардиолог" и т.д.).
- НИКАКИХ markdown, преамбул, комментариев. Только сырой JSON.`;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

// Vercel Hobby function timeout = 10s. Leave 1.5s headroom for input
// parsing, validation, JSON shape checks and serialization.
const GEMINI_TOTAL_BUDGET_MS = 8_500;
const GEMINI_PER_MODEL_BUDGET_MS = 2_500;

async function geminiCall(prompt: string, expectArray = false): Promise<unknown> {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) throw new Error('gemini-not-configured');
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };
  const bodyStr = JSON.stringify(body);

  const start = Date.now();
  let lastErr: Error | null = null;
  for (const model of GEMINI_MODELS) {
    // Hard total-budget gate: if the next call would push us past the
    // budget, bail with a synthetic 503 instead of risking a 504.
    const elapsed = Date.now() - start;
    if (elapsed >= GEMINI_TOTAL_BUDGET_MS - 500) {
      throw lastErr ?? new Error('gemini-total-budget-exhausted');
    }
    const remaining = GEMINI_TOTAL_BUDGET_MS - elapsed;
    const perModelBudget = Math.min(GEMINI_PER_MODEL_BUDGET_MS, remaining);

    // P0-SEC-1: API key in `x-goog-api-key` header instead of query
    // string. The key never touches access logs, request URLs, traces.
    // P0-SEC-2: per-model AbortController so a slow upstream cannot
    // burn the whole 10s function budget.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), perModelBudget);
    let r: Response;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': KEY,
        },
        body: bodyStr,
        signal: ac.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      const aborted = (err as Error)?.name === 'AbortError';
      lastErr = new Error(`gemini-${aborted ? 'timeout' : 'fetch-failed'} (${model}): ${(err as Error).message}`);
      log.warn({ event: 'gemini_per_model_fail', model, aborted });
      continue;
    }
    clearTimeout(timer);

    if (r.ok) {
      const data = (await r.json()) as GeminiResponse;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (m && m[1]) parsed = JSON.parse(m[1]);
        else throw new Error('gemini-bad-json');
      }
      if (expectArray && !Array.isArray(parsed)) {
        throw new Error('gemini-expected-array');
      }
      return parsed;
    }
    const txt = await r.text().catch(() => '');
    lastErr = new Error(`gemini-${r.status} (${model}): ${txt.slice(0, 200)}`);
    // Auth (401/403) and malformed request (400) won't be fixed by retry, bail.
    if (r.status === 401 || r.status === 403 || r.status === 400) {
      throw lastErr;
    }
    log.warn({ event: 'gemini_status_retry', model, status: r.status });
  }
  throw lastErr ?? new Error('gemini-all-models-failed');
}

function buildNextPrompt(history: Turn[]): string {
  const summary = history.map((t, i) => {
    const correct = t.selectedIndex === t.correctIndex ? '✓' : '✗';
    const picked = t.options[t.selectedIndex] ?? '?';
    const right = t.options[t.correctIndex] ?? '?';
    return `Q${i + 1} [${t.topic}] ${correct} ${t.question}\n   Дано вариантов: ${t.options.length}\n   Выбрал: «${picked}»${correct === '✗' ? `\n   Правильный: «${right}»` : ''}`;
  }).join('\n');
  const meta = history.length === 0
    ? 'Это ПЕРВЫЙ вопрос - начни со средне-сложного по анатомии или физиологии, чтобы откалибровать базу.'
    : `Уже задано ${history.length} вопросов из ${TOTAL_QUESTIONS}. Подбери СЛЕДУЮЩИЙ вопрос с учётом истории ниже.`;
  return `${SYSTEM_PROMPT_NEXT}\n\n${meta}\n\nИстория:\n${summary || '(пусто)'}\n\nВерни ровно один JSON-объект следующего вопроса.`;
}

function buildFinalizePrompt(history: Turn[], modules: ModuleSummary[]): string {
  const summary = history.map((t, i) => {
    const correct = t.selectedIndex === t.correctIndex ? '✓' : '✗';
    return `${i + 1}. [${t.topic}] ${correct} «${t.question}» → выбрал «${t.options[t.selectedIndex] ?? '?'}»`;
  }).join('\n');
  const correctCount = history.filter((t) => t.selectedIndex === t.correctIndex).length;
  const moduleList = modules.map((m) =>
    `${m.id} | ${m.sectionId} | ${m.title} | ${m.description.slice(0, 120)}`,
  ).join('\n');
  return `${SYSTEM_PROMPT_FINALIZE}

Статистика: ${correctCount}/${history.length} верных ответов (${Math.round((correctCount / history.length) * 100)}%).

История ответов:
${summary}

Доступные модули платформы (формат: id | section | название | описание):
${moduleList}

Верни строго JSON-объект.`;
}

/* ── Strict input schemas. Reject anything we wouldn't act on, including
   prompt-injection attempts that try to smuggle "system" instructions via
   extra fields or oversized history. */
const TurnSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1), v.maxLength(2000)),
  options: v.pipe(v.array(v.pipe(v.string(), v.maxLength(500))), v.length(4)),
  correctIndex: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(3)),
  selectedIndex: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(3)),
  topic: v.pipe(v.string(), v.maxLength(50)),
});
const ModuleSummarySchema = v.object({
  id: v.number(),
  sectionId: v.pipe(v.string(), v.maxLength(40)),
  title: v.pipe(v.string(), v.maxLength(200)),
  description: v.pipe(v.string(), v.maxLength(500)),
});
const PostBodySchema = v.object({
  action: v.picklist(['next', 'finalize']),
  history: v.pipe(v.array(TurnSchema), v.maxLength(TOTAL_QUESTIONS)),
  modules: v.optional(v.pipe(v.array(ModuleSummarySchema), v.maxLength(200))),
});

/* ── Output guard. Defence-in-depth: lib/output-guard.ts uses parse5
   plus multi-pass entity decode so HTML-entity smuggling
   (`&#x6A;avascript:`), SVG `onload`, MathML, and tab-injected
   protocols (`jav&#x09;ascript:`) cannot survive into the response
   payload. The previous one-shot regex (kept here as a soft pre-check)
   stays for fast-path rejection of obvious cases. */
const FAST_FORBIDDEN = /<\s*script|<\s*iframe|javascript:|vbscript:|data:text\/html/i;
function checkOutput(s: string): { safe: boolean; reason?: string } {
  if (FAST_FORBIDDEN.test(s)) return { safe: false, reason: 'fast-regex' };
  return isOutputSafeStrict(s);
}

export async function POST(req: Request) {
  // P2-SEC-4 — Origin allowlist; defends against extension-context
  // and cross-subdomain CSRF where SameSite=Lax wouldn't help.
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  // Per-user rate limit: prefer authenticated id, fall back to hashed IP.
  // Failure to read auth is non-fatal; we still rate-limit by IP hash.
  let userId: string | null = null;
  try {
    const sb = await getSupabaseServerClient();
    if (sb) {
      const { data: { user } } = await sb.auth.getUser();
      userId = user?.id ?? null;
    }
  } catch {/* anon usage allowed; identifyRequest will hash the IP */}

  const decision = await identifyAndLimit(req, userId);
  if (!decision.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate-limited', retryAfter: decision.retryAfter },
      { status: 429, headers: decision.headers },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }
  const parsed = v.safeParse(PostBodySchema, raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'invalid-input', issues: parsed.issues.slice(0, 3).map((i) => i.message) },
      { status: 400 },
    );
  }
  const action = parsed.output.action;
  const history = parsed.output.history;

  if (action === 'next') {
    if (history.length >= TOTAL_QUESTIONS) {
      return NextResponse.json({ ok: false, error: 'test-complete' }, { status: 400 });
    }
    try {
      const result = await geminiCall(buildNextPrompt(history));
      const q = result as {
        question?: string;
        options?: string[];
        correctIndex?: number;
        topic?: string;
        explanation?: string;
      };
      if (
        !q.question ||
        !Array.isArray(q.options) || q.options.length !== 4 ||
        typeof q.correctIndex !== 'number' ||
        !Number.isInteger(q.correctIndex) ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length ||
        !q.topic
      ) {
        return NextResponse.json({ ok: false, error: 'gemini-invalid-shape' }, { status: 502 });
      }
      // Output guard - reject AI responses that contain HTML / JS / dangerous URIs.
      // Check each text field individually so a guard hit names the field.
      for (const [name, val] of Object.entries({
        question: q.question,
        explanation: q.explanation ?? '',
        ...Object.fromEntries(q.options.map((o, i) => [`option${i}`, o])),
      })) {
        const verdict = checkOutput(val);
        if (!verdict.safe) {
          log.warn({ event: 'output_guard_block', field: name, reason: verdict.reason });
          return NextResponse.json({ ok: false, error: 'gemini-output-unsafe', field: name }, { status: 502 });
        }
      }
      return NextResponse.json({
        ok: true,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        topic: q.topic,
        explanation: q.explanation ?? '',
        index: history.length,
        total: TOTAL_QUESTIONS,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error({ event: 'diagnostic_next_failed', message: msg.slice(0, 200) });
      const status = msg === 'gemini-not-configured' ? 503 : 502;
      return NextResponse.json({ ok: false, error: msg }, { status });
    }
  }

  if (action === 'finalize') {
    const modules = parsed.output.modules ?? [];
    if (history.length === 0 || modules.length === 0) {
      return NextResponse.json({ ok: false, error: 'empty-input' }, { status: 400 });
    }
    try {
      const result = await geminiCall(buildFinalizePrompt(history, modules));
      const f = result as {
        profession?: string;
        professionRationale?: string;
        level?: string;
        strengths?: string[];
        weaknesses?: string[];
        recommendedModuleIds?: number[];
        studyPlan?: string;
      };
      if (!f.profession || !Array.isArray(f.recommendedModuleIds)) {
        return NextResponse.json({ ok: false, error: 'gemini-invalid-shape' }, { status: 502 });
      }
      // Sanitize: keep only IDs that exist in the supplied module list
      const validIds = new Set(modules.map((m) => m.id));
      const cleanIds = f.recommendedModuleIds.filter((id) => validIds.has(id)).slice(0, 6);
      return NextResponse.json({
        ok: true,
        profession: f.profession,
        professionRationale: f.professionRationale ?? '',
        level: (f.level === 'basic' || f.level === 'advanced') ? f.level : 'intermediate',
        strengths: Array.isArray(f.strengths) ? f.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(f.weaknesses) ? f.weaknesses.slice(0, 5) : [],
        recommendedModuleIds: cleanIds,
        studyPlan: f.studyPlan ?? '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[diagnostic.finalize] failed', msg);
      const status = msg === 'gemini-not-configured' ? 503 : 502;
      return NextResponse.json({ ok: false, error: msg }, { status });
    }
  }

  return NextResponse.json({ ok: false, error: 'unknown-action' }, { status: 400 });
}

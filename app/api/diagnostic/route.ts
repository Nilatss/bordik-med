import { NextResponse } from 'next/server';
import * as v from 'valibot';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

// ────────────────────────────────────────────────────────────────────
// Static question bank (data/diagnostic-question-bank.json).
//
// The bank is generated offline by `npm run build:question-bank` (one
// Gemini call per topic, all run from a developer machine) so the
// runtime route can pick a question without ever talking to an LLM.
// This eliminates the 429 / quota-exhausted failure mode that the
// per-question Gemini path introduced.
//
// Loaded lazily on first request and cached for the lifetime of the
// Lambda. The file ships in the deployed bundle (server-side only;
// not exposed under /public, since we don't want users grabbing the
// whole question pool with answers from a static URL).
// ────────────────────────────────────────────────────────────────────
interface BankQuestion {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

let bankCache: BankQuestion[] | null = null;

function loadBank(): BankQuestion[] {
  if (bankCache) return bankCache;
  try {
    const filePath = join(process.cwd(), 'data', 'diagnostic-question-bank.json');
    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as { questions?: BankQuestion[] };
    bankCache = Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (err) {
    log.error({ event: 'bank_load_failed', message: String(err).slice(0, 200) });
    bankCache = [];
  }
  return bankCache;
}

/**
 * Pick the next question from the bank with adaptive selection:
 *   1. Skip anything already shown in this session (history).
 *   2. Prefer topics the user has been asked LEAST so far — keeps the
 *      30-question test broad across the 15 topics in the bank.
 *   3. Within the chosen topic, prefer a difficulty tier matched to
 *      the user's running correctness rate:
 *          rate < 40 %  → easy
 *          rate 40-70 % → medium
 *          rate > 70 %  → hard
 *      If the matching tier is empty for that topic, fall back to any
 *      tier so we never starve the user of a question.
 */
function pickNextQuestion(history: Turn[]): BankQuestion | null {
  const bank = loadBank();
  if (bank.length === 0) return null;

  const seen = new Set(history.map((t) => `${t.topic}::${t.question}`));
  const remaining = bank.filter((q) => !seen.has(`${q.topic}::${q.question}`));
  if (remaining.length === 0) return null;

  // Topic balance: count how many times each topic has been used.
  const topicCount: Record<string, number> = {};
  for (const t of history) topicCount[t.topic] = (topicCount[t.topic] ?? 0) + 1;

  // Pick the topic(s) with the lowest usage count, restricted to topics
  // we still have questions for.
  const availableTopics = [...new Set(remaining.map((q) => q.topic))];
  let minUsage = Infinity;
  for (const t of availableTopics) {
    const u = topicCount[t] ?? 0;
    if (u < minUsage) minUsage = u;
  }
  const candidateTopics = availableTopics.filter((t) => (topicCount[t] ?? 0) === minUsage);
  const targetTopic = candidateTopics[Math.floor(Math.random() * candidateTopics.length)] ?? candidateTopics[0];
  if (!targetTopic) return null;

  // Difficulty tier from running correctness rate.
  const correct = history.filter((t) => t.selectedIndex === t.correctIndex).length;
  const rate = history.length > 0 ? correct / history.length : 0.5;
  const targetDiff: 'easy' | 'medium' | 'hard' =
    rate < 0.4 ? 'easy' : rate > 0.7 ? 'hard' : 'medium';

  const inTopic = remaining.filter((q) => q.topic === targetTopic);
  const matched = inTopic.filter((q) => q.difficulty === targetDiff);
  const pool = matched.length > 0 ? matched : inTopic;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

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

// ────────────────────────────────────────────────────────────────────
// Rule-based finalize fallback.
//
// Used when the Gemini call for the personalised recommendation fails
// (quota, timeout, malformed JSON, network blip). Produces a strictly
// data-driven summary so the user never lands on a "что-то пошло не
// так" panel after answering 30 questions.
//
// What we compute:
//   - Per-topic correctness rate (among topics the user actually saw)
//   - Top 3 strongest topics (rate ≥ 70 % AND at least one question)
//   - Top 3 weakest topics (rate < 50 %)
//   - Profession from the dominant strong topic (TOPIC_TO_PROFESSION)
//   - Level from overall correctness: <40 % basic, 40-70 % intermediate,
//     >70 % advanced
//   - Recommended modules: first up-to-4 modules from the supplied list
//     that match the strong-topic sectionId mapping; if none match,
//     fall back to the first 4 modules verbatim.
//
// The output shape mirrors the AI version exactly so the client doesn't
// need a separate code path.
// ────────────────────────────────────────────────────────────────────
const TOPIC_TO_PROFESSION: Record<string, { name: string; rationale: string }> = {
  pediatrics:        { name: 'Педиатр', rationale: 'Сильные ответы по педиатрическим темам показывают подходящий профиль для работы с детьми.' },
  emergency:         { name: 'Врач скорой / реаниматолог', rationale: 'Уверенные знания неотложной помощи указывают на склонность к интенсивной медицине.' },
  obstetrics:        { name: 'Акушер-гинеколог', rationale: 'Хорошие результаты по акушерству и гинекологии — основа профильной специальности.' },
  surgery:           { name: 'Хирург', rationale: 'Сильные ответы по хирургическим темам подсказывают этот путь.' },
  pharmacology:      { name: 'Клинический фармаколог', rationale: 'Уверенное знание фармакологии — базис для рациональной фармакотерапии.' },
  pathology:         { name: 'Патоморфолог', rationale: 'Сильная патоморфологическая база подсказывает диагностический трек.' },
  'lab-diagnostics': { name: 'Врач лабораторной диагностики', rationale: 'Лабораторная диагностика — ваша сильная сторона; стоит развивать.' },
  imaging:           { name: 'Рентгенолог', rationale: 'Сильное визуальное мышление и знание визуализации — путь рентгенолога.' },
  'public-health':   { name: 'Эпидемиолог / общественное здоровье', rationale: 'Системное мышление и знание основ здравоохранения — для популяционной медицины.' },
  'internal-medicine': { name: 'Семейный врач / терапевт', rationale: 'Широкие клинические знания — основа первичного звена.' },
};

const TOPIC_TO_HUMAN: Record<string, string> = {
  anatomy: 'анатомия',
  physiology: 'физиология',
  biochemistry: 'биохимия',
  pharmacology: 'фармакология',
  pathology: 'патология',
  'internal-medicine': 'клиническая медицина',
  surgery: 'хирургия',
  pediatrics: 'педиатрия',
  obstetrics: 'акушерство',
  emergency: 'неотложная помощь',
  'public-health': 'общественное здоровье',
  ethics: 'медицинская этика',
  'clinical-skills': 'клинические навыки',
  'lab-diagnostics': 'лабораторная диагностика',
  imaging: 'медицинская визуализация',
};

function ruleBasedFinalize(history: Turn[], modules: ModuleSummary[]): {
  profession: string;
  professionRationale: string;
  level: 'basic' | 'intermediate' | 'advanced';
  strengths: string[];
  weaknesses: string[];
  recommendedModuleIds: number[];
  studyPlan: string;
} {
  const total = history.length;
  const correct = history.filter((t) => t.selectedIndex === t.correctIndex).length;
  const overallRate = total > 0 ? correct / total : 0;
  const level: 'basic' | 'intermediate' | 'advanced' =
    overallRate < 0.4 ? 'basic' : overallRate > 0.7 ? 'advanced' : 'intermediate';

  // Per-topic stats
  const stats: Record<string, { correct: number; total: number }> = {};
  for (const t of history) {
    const k = t.topic;
    if (!stats[k]) stats[k] = { correct: 0, total: 0 };
    stats[k].total++;
    if (t.selectedIndex === t.correctIndex) stats[k].correct++;
  }
  const ratesByTopic = Object.entries(stats).map(([topic, s]) => ({
    topic,
    rate: s.correct / s.total,
    n: s.total,
  }));

  const strong = [...ratesByTopic].filter((r) => r.rate >= 0.7).sort((a, b) => b.rate - a.rate).slice(0, 3);
  const weak   = [...ratesByTopic].filter((r) => r.rate <  0.5).sort((a, b) => a.rate - b.rate).slice(0, 3);

  // Pick profession: first strong topic that has a mapping; fall back
  // to general practice if none match.
  let prof = { name: 'Семейный врач', rationale: 'Сбалансированные знания подходят для широкой клинической практики.' };
  for (const s of strong) {
    const mapped = TOPIC_TO_PROFESSION[s.topic];
    if (mapped) {
      prof = mapped;
      break;
    }
  }

  // Recommended modules: just take the first 4 from the supplied list
  // — the SPA still navigates by id, and we don't have a reliable
  // topic→sectionId map from the wire format.
  const recommendedModuleIds = modules.slice(0, 4).map((m) => m.id);

  const strengthsText = strong.length > 0
    ? strong.map((s) => {
        const label = TOPIC_TO_HUMAN[s.topic] ?? s.topic;
        return `${label.charAt(0).toUpperCase()}${label.slice(1)} — ${Math.round(s.rate * 100)}% верных`;
      })
    : ['Базовые знания подтверждены — продолжайте обучение по плану'];

  const weaknessesText = weak.length > 0
    ? weak.map((w) => {
        const label = TOPIC_TO_HUMAN[w.topic] ?? w.topic;
        return `${label.charAt(0).toUpperCase()}${label.slice(1)} — ${Math.round(w.rate * 100)}% верных`;
      })
    : ['Уверенные ответы во всех темах — углубляйте профильную специальность'];

  const studyPlan = level === 'basic'
    ? 'Сейчас укрепите фундамент: анатомия, физиология, биохимия. Затем переходите к клиническим модулям.'
    : level === 'advanced'
    ? 'У вас крепкая база. Сосредоточьтесь на клинических модулях по выбранной специальности и неотложной помощи.'
    : 'Сбалансированный профиль. Заполняйте пробелы из слабых тем и параллельно углубляйтесь в клинические модули.';

  return {
    profession: prof.name,
    professionRationale: prof.rationale,
    level,
    strengths: strengthsText,
    weaknesses: weaknessesText,
    recommendedModuleIds,
    studyPlan,
  };
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
    // Pick from the pre-generated question bank instead of calling
    // Gemini per question. Eliminates the runtime API dependency that
    // used to surface as "AI временно перегружен" toasts whenever
    // multiple users took the test in the same minute.
    const picked = pickNextQuestion(history);
    if (!picked) {
      // Bank is empty / corrupt. Falling back to AI here would
      // re-introduce the rate-limit failure mode we're trying to
      // eliminate, so we return an honest error instead.
      log.error({ event: 'question_bank_empty' });
      return NextResponse.json({ ok: false, error: 'bank-unavailable' }, { status: 503 });
    }
    return NextResponse.json({
      ok: true,
      question: picked.question,
      options: picked.options,
      correctIndex: picked.correctIndex,
      topic: picked.topic,
      explanation: picked.explanation ?? '',
      index: history.length,
      total: TOTAL_QUESTIONS,
    });
  }

  if (action === 'finalize') {
    const modules = parsed.output.modules ?? [];
    if (history.length === 0 || modules.length === 0) {
      return NextResponse.json({ ok: false, error: 'empty-input' }, { status: 400 });
    }
    // Try Gemini first for the personalised recommendation. If it's
    // down / over quota / wrong shape, fall through to a rule-based
    // synthesis so the test always finishes with SOMETHING useful
    // shown to the user — never a "Что-то пошло не так" panel after
    // they completed 30 questions.
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
        log.warn({ event: 'finalize_invalid_shape_falling_back' });
        return NextResponse.json({ ok: true, ...ruleBasedFinalize(history, modules) });
      }
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
      log.warn({ event: 'finalize_ai_failed_falling_back', message: msg.slice(0, 200) });
      // Never leak the AI failure to the user — synthesise a
      // reasonable recommendation from the answer history.
      return NextResponse.json({ ok: true, ...ruleBasedFinalize(history, modules) });
    }
  }

  return NextResponse.json({ ok: false, error: 'unknown-action' }, { status: 400 });
}

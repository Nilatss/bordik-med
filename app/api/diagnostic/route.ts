import { NextResponse } from 'next/server';
import * as v from 'valibot';

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
const TOTAL_QUESTIONS = 15;   // bounded - longer feels like a chore

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
2. Уровень сложности подстраивай под уже виденные ответы. Не делай 15 одинаково лёгких или одинаково сложных подряд.
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

  let lastErr: Error | null = null;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const data = (await r.json()) as GeminiResponse;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (m) parsed = JSON.parse(m[1]);
        else throw new Error('gemini-bad-json');
      }
      if (expectArray && !Array.isArray(parsed)) {
        throw new Error('gemini-expected-array');
      }
      return parsed;
    }
    const txt = await r.text().catch(() => '');
    lastErr = new Error(`gemini-${r.status} (${model}): ${txt.slice(0, 200)}`);
    // Fall back on quota (429), temporary errors (5xx), AND model-not-found
    // (404) - any of these mean THIS model can't help right now, but a
    // different model might. Auth (401/403) and malformed request (400)
    // won't be fixed by retry, so bail.
    if (r.status === 401 || r.status === 403 || r.status === 400) {
      throw lastErr;
    }
    console.warn(`[diagnostic] ${model} returned ${r.status}, trying next model`);
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

/* ── Output guard. Strip Gemini responses that contain forbidden
   protocols / HTML so a prompt injection can't smuggle a clickable
   javascript: payload through us into the user's browser. */
const FORBIDDEN_OUTPUT = /<\s*script|<\s*iframe|javascript:|vbscript:|data:text\/html/i;
function isOutputSafe(s: string): boolean {
  return !FORBIDDEN_OUTPUT.test(s);
}

export async function POST(req: Request) {
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
        typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3 ||
        !q.topic
      ) {
        return NextResponse.json({ ok: false, error: 'gemini-invalid-shape' }, { status: 502 });
      }
      // Output guard - reject AI responses that contain HTML / JS / dangerous URIs
      const allText = q.question + ' ' + q.options.join(' ') + ' ' + (q.explanation ?? '');
      if (!isOutputSafe(allText)) {
        return NextResponse.json({ ok: false, error: 'gemini-output-unsafe' }, { status: 502 });
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
      console.error('[diagnostic.next] failed', msg);
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

#!/usr/bin/env node
/**
 * AI question generator (FREE — Google Gemini).
 *
 * For every course in `lib/content/` that has lesson markdown, calls
 * Gemini (free tier, no credit card required) to produce 200 high-quality
 * multiple-choice questions, written to
 * `lib/questions/generated/course-{id}.ts` as TS modules exporting:
 *   • courseTests:  Record<TestLevel, TestQuestion[20]>   // 5 × 20 = 100
 *   • moduleSlice:  TestQuestion[100]                     // for module final
 *
 * USAGE:
 *   1. Get a free API key at https://aistudio.google.com/apikey
 *      (no credit card, free tier ~1500 requests/day, Gemini 2.0 Flash)
 *   2. Run:
 *
 *      PowerShell:
 *        $env:GEMINI_API_KEY = "AIzaSy..."
 *        npm run ai:questions
 *
 *      bash/zsh:
 *        export GEMINI_API_KEY=AIzaSy...
 *        npm run ai:questions
 *
 * Optional environment:
 *   AI_QG_COURSE=100.1      # generate only that course
 *   AI_QG_FORCE=1           # regenerate even if file exists
 *   AI_QG_MODEL=gemini-2.0-flash   # override the default Gemini model
 *   ANTHROPIC_API_KEY=...   # fallback: paid Claude path (used only if no GEMINI_API_KEY)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'lib', 'content');
const OUT_DIR = join(ROOT, 'lib', 'questions', 'generated');
const INDEX_OUT = join(OUT_DIR, 'index.ts');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const PROVIDER = GEMINI_KEY ? 'gemini' : ANTHROPIC_KEY ? 'anthropic' : null;

if (!PROVIDER) {
  console.error('No API key found.');
  console.error('');
  console.error('FREE option (recommended): Google Gemini');
  console.error('  1. Get a free key at https://aistudio.google.com/apikey');
  console.error('  2. PowerShell:  $env:GEMINI_API_KEY = "AIzaSy..."');
  console.error('     bash:        export GEMINI_API_KEY=AIzaSy...');
  console.error('  3. Re-run:      npm run ai:questions');
  console.error('');
  console.error('Or paid: ANTHROPIC_API_KEY=sk-ant-... npm run ai:questions');
  process.exit(1);
}

const TARGET_COURSE = process.env.AI_QG_COURSE || null;
const FORCE = process.env.AI_QG_FORCE === '1';
const GEMINI_MODEL = process.env.AI_QG_MODEL || 'gemini-2.0-flash';

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log(`[provider: ${PROVIDER}${PROVIDER === 'gemini' ? ` · ${GEMINI_MODEL}` : ''}]`);

/* ─── Discover courses with content ─────────────────────────── */
function findCoursesWithContent() {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.ts'));
  const out = [];
  for (const f of files) {
    const m = f.match(/^course-(\d+)-(\d+)\.ts$/);
    if (!m) continue;
    out.push({ courseId: `${m[1]}.${m[2]}`, file: join(CONTENT_DIR, f) });
  }
  return out;
}

function loadCourseMarkdown(file) {
  const src = readFileSync(file, 'utf8');
  const first = src.indexOf('`');
  const last = src.lastIndexOf('`');
  if (first < 0 || last < 0 || last <= first) return '';
  return src.slice(first + 1, last);
}

/* ─── Prompt ─────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `Ты — методист медицинского образования. Тебе дан учебный материал — это ЕДИНСТВЕННЫЙ источник, из которого можно брать факты для вопросов.

🔒 КРИТИЧЕСКОЕ ПРАВИЛО (нарушение = брак):
Каждый вопрос должен проверять факт, ПРЯМО упомянутый в материале. Если ты не можешь процитировать конкретное предложение/строку таблицы из материала, подтверждающее правильный ответ — НЕ создавай этот вопрос. Запрещено:
• Привлекать общие медицинские знания, которых нет в материале
• Спрашивать про термины, не упомянутые в материале (например, "биопсия", "гиперемия", "тироксин", "плевра", "антиген" — если их нет в тексте, такие вопросы запрещены)
• Спрашивать про факты, выходящие за рамки материала (например, размер органов, цифры, которых нет в тексте)
• Использовать в дистракторах термины, которых нет в материале

✅ Каждый вопрос строится только из:
• таблиц материала (ячейки таблиц — главный источник фактов)
• конкретных утверждений из абзацев
• цифр, формул, классификаций, явно указанных в тексте

Технические требования:
1. Формулировка — полноценное предложение БЕЗ пропусков ("___"), без обращений на "ты".
2. Все 4 варианта правдоподобны и из одной категории, при этом ВСЕ варианты (и правильный, и дистракторы) должны быть терминами/понятиями ИЗ ЭТОГО ЖЕ МАТЕРИАЛА.
3. Запрещено: "все перечисленные", "ничего из перечисленного", "А и Б".
4. НЕ брать формулировки из заголовков (## Тема X.Y).
5. Вопросы не повторяются — ни по смыслу, ни по формулировке.
6. Распределение типов:
   • 60% — фактологические по таблицам и абзацам
   • 25% — клинические связи, явно указанные в материале
   • 15% — на различение похожих понятий, упомянутых в материале вместе
7. Все на русском.
8. correctIndex — индекс правильного варианта (0–3), распределение случайное.

Сколько получится по этим правилам — столько и сгенерируй (целевое — 200, но если материал не позволяет — лучше меньше, но строго по тексту). НЕ выдумывай вопросы, чтобы добрать до 200.

Формат ответа — ТОЛЬКО JSON-массив без обёрток:
[
  { "id": "ai-COURSE-N", "question": "...", "options": ["...","...","...","..."], "correctIndex": 0|1|2|3 },
  ...
]`;

function userPromptFor(courseId, markdown, batch) {
  const focus = batch ? `\n\nЭТО ЗАПРОС №${batch.idx} из ${batch.total} — нужно сгенерировать ${batch.size} вопросов, тематически отличных от других батчей.\nФокус этого батча: ${batch.focus}` : '';
  const count = batch ? batch.size : 200;
  return `КУРС: ${courseId}\n\nМАТЕРИАЛ:\n\n${markdown}${focus}\n\nСформируй ровно ${count} вопросов в виде JSON-массива.`;
}

/* ─── Provider implementations ───────────────────────────────── */

async function geminiCall(courseId, markdown, batch) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + '\n\n---\n\n' + userPromptFor(courseId, markdown, batch) }],
    }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 65000,
      responseMimeType: 'application/json',
    },
  };
  // Retry on transient 5xx with exponential backoff. 429 (quota) is fatal —
  // re-run later. 5xx + ECONNRESET get up to 4 retries.
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      const wait = 1000 * Math.pow(2, attempt);
      process.stdout.write(`(net err, retry in ${wait / 1000}s) `);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return parseJsonArray(text);
    }
    const errText = await res.text();
    if (res.status === 503 || res.status === 502 || res.status === 500) {
      if (attempt < maxAttempts) {
        const wait = 1000 * Math.pow(2, attempt);
        process.stdout.write(`(${res.status}, retry in ${wait / 1000}s) `);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
    }
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 500)}`);
  }
  throw new Error('Gemini API: exhausted retries');
}

/** Run 4 batches × 50 questions to bypass per-call output-token caps. */
async function generateViaGemini(courseId, markdown) {
  const focuses = [
    'клеточная биология, генетика, наследственность (Тема 1)',
    'химия и pH, биологические молекулы, лекарства (Тема 2)',
    'физика и медицина, статистика, расчёт доз (Темы 3–4)',
    'психология, медицинская терминология, методы обучения (Темы 5–7)',
  ];
  const all = [];
  for (let i = 0; i < focuses.length; i++) {
    process.stdout.write(`[batch ${i + 1}/${focuses.length}] `);
    const arr = await geminiCall(courseId, markdown, {
      idx: i + 1,
      total: focuses.length,
      size: 50,
      focus: focuses[i],
    });
    all.push(...arr);
  }
  return all;
}

async function generateViaAnthropic(courseId, markdown) {
  const body = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPromptFor(courseId, markdown) }],
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text ?? '';
  return parseJsonArray(text);
}

function parseJsonArray(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = cleaned.indexOf('[');
  if (start < 0) throw new Error('No JSON array in response');
  // Try strict parse from [ to last ]
  const end = cleaned.lastIndexOf(']');
  if (end > start) {
    try {
      const arr = JSON.parse(cleaned.slice(start, end + 1));
      if (Array.isArray(arr)) return arr;
    } catch {
      /* fall through to recovery */
    }
  }
  // Recovery: walk through the content from `[`, parse each top-level JSON
  // object greedily. This salvages the longest prefix of valid questions
  // when the model truncates mid-output.
  const out = [];
  let i = start + 1;
  while (i < cleaned.length) {
    while (i < cleaned.length && /[\s,]/.test(cleaned[i])) i++;
    if (cleaned[i] !== '{') break;
    let depth = 0, j = i, inStr = false, esc = false;
    for (; j < cleaned.length; j++) {
      const ch = cleaned[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') inStr = false;
      } else {
        if (ch === '"') inStr = true;
        else if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) { j++; break; }
        }
      }
    }
    if (depth !== 0) break;
    try {
      out.push(JSON.parse(cleaned.slice(i, j)));
    } catch {
      break;
    }
    i = j;
  }
  if (out.length === 0) throw new Error('Could not recover any JSON objects');
  return out;
}

const generateForCourse = (courseId, markdown) =>
  PROVIDER === 'gemini'
    ? generateViaGemini(courseId, markdown)
    : generateViaAnthropic(courseId, markdown);

/* ─── Sanitize + slice questions ─────────────────────────────── */
function sanitize(courseId, raw) {
  const seen = new Set();
  const out = [];
  for (const q of raw) {
    if (!q || typeof q.question !== 'string') continue;
    if (!Array.isArray(q.options) || q.options.length !== 4) continue;
    if (q.options.some((o) => typeof o !== 'string' || o.length === 0)) continue;
    if (![0, 1, 2, 3].includes(q.correctIndex)) continue;
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: `ai-${courseId}-${out.length}`,
      question: q.question.trim(),
      options: [q.options[0].trim(), q.options[1].trim(), q.options[2].trim(), q.options[3].trim()],
      correctIndex: q.correctIndex,
    });
  }
  return out;
}

function buildSlices(_courseId, questions) {
  const courseTests = {};
  for (let level = 1; level <= 5; level++) {
    courseTests[level] = questions.slice((level - 1) * 20, level * 20);
  }
  const moduleSlice = questions.slice(100, 200);
  return { courseTests, moduleSlice };
}

function emitFile(courseId, slices) {
  const safeId = courseId.replace(/\./g, '_');
  const path = join(OUT_DIR, `course-${safeId}.ts`);
  let body = '/* AUTO-GENERATED by scripts/ai-generate-questions.mjs — do not edit by hand. */\n';
  body += `import type { TestQuestion } from '../../quiz';\n\n`;
  body += `export const courseTests_${safeId}: Record<1 | 2 | 3 | 4 | 5, TestQuestion[]> = {\n`;
  for (let level = 1; level <= 5; level++) {
    body += `  ${level}: ${JSON.stringify(slices.courseTests[level], null, 2)},\n`;
  }
  body += '};\n\n';
  body += `export const moduleSlice_${safeId}: TestQuestion[] = ${JSON.stringify(slices.moduleSlice, null, 2)};\n`;
  writeFileSync(path, body);
  return path;
}

function emitIndex() {
  const files = readdirSync(OUT_DIR).filter((f) => f.startsWith('course-') && f.endsWith('.ts'));
  let body = '/* AUTO-GENERATED — barrel for AI-generated question modules. */\n';
  body += `import type { TestQuestion } from '../../quiz';\n`;
  for (const f of files) {
    const safeId = f.replace(/^course-/, '').replace(/\.ts$/, '');
    body += `import { courseTests_${safeId}, moduleSlice_${safeId} } from './course-${safeId}';\n`;
  }
  body += '\n';
  body += `export const AI_COURSE_TESTS: Record<string, Record<1 | 2 | 3 | 4 | 5, TestQuestion[]>> = {\n`;
  for (const f of files) {
    const safeId = f.replace(/^course-/, '').replace(/\.ts$/, '');
    const courseId = safeId.replace(/_/g, '.');
    body += `  '${courseId}': courseTests_${safeId},\n`;
  }
  body += '};\n\n';
  body += `export const AI_MODULE_SLICES: Record<string, TestQuestion[]> = {\n`;
  for (const f of files) {
    const safeId = f.replace(/^course-/, '').replace(/\.ts$/, '');
    const courseId = safeId.replace(/_/g, '.');
    body += `  '${courseId}': moduleSlice_${safeId},\n`;
  }
  body += '};\n';
  writeFileSync(INDEX_OUT, body);
}

/* ─── Main ───────────────────────────────────────────────────── */
async function main() {
  const courses = findCoursesWithContent();
  const target = TARGET_COURSE ? courses.filter((c) => c.courseId === TARGET_COURSE) : courses;
  if (target.length === 0) {
    console.error(`No matching course found. Available: ${courses.map((c) => c.courseId).join(', ')}`);
    process.exit(1);
  }
  for (const c of target) {
    const safeId = c.courseId.replace(/\./g, '_');
    const outFile = join(OUT_DIR, `course-${safeId}.ts`);
    if (existsSync(outFile) && !FORCE) {
      console.log(`= skip ${c.courseId} (already generated, AI_QG_FORCE=1 to regenerate)`);
      continue;
    }
    const md = loadCourseMarkdown(c.file);
    if (!md.trim()) { console.log(`! skip ${c.courseId} — empty content`); continue; }
    process.stdout.write(`> ${c.courseId} (${md.length} chars) ... `);
    try {
      const raw = await generateForCourse(c.courseId, md);
      const sane = sanitize(c.courseId, raw);
      console.log(`got ${raw.length} → kept ${sane.length}`);
      if (sane.length < 100) {
        console.warn(`! warning: only ${sane.length} valid questions for ${c.courseId} (need 200 for full coverage)`);
      }
      const slices = buildSlices(c.courseId, sane);
      const path = emitFile(c.courseId, slices);
      console.log(`  wrote ${path}`);
    } catch (e) {
      console.error(`! ${c.courseId}: ${e.message}`);
    }
  }
  emitIndex();
  console.log('Done.');
}

main();

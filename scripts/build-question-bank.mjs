#!/usr/bin/env node
/**
 * Generate the static diagnostic test question bank.
 *
 * Why this script exists
 * ----------------------
 * The /api/diagnostic route used to call Gemini once per question (30
 * calls per test, plus 1 finalize). On Gemini's free tier that
 * regularly tripped the 429 rate limit when several users took the
 * test concurrently; users saw "AI временно перегружен" toasts
 * partway through their test and lost progress.
 *
 * Pre-generating the question pool offline removes the runtime
 * dependency entirely. The route now picks from this JSON file in O(1)
 * per question — zero API calls, zero latency, zero quota concerns.
 * Finalize still uses Gemini (1 call per completed test) for the
 * personalised recommendation; that call has a rule-based fallback if
 * the API itself is down.
 *
 * Usage
 * -----
 *   GEMINI_API_KEY=... node scripts/build-question-bank.mjs
 *
 * Idempotent: re-running overwrites the bank with a fresh batch. If
 * you want to extend the bank instead of replacing it, edit
 * `data/diagnostic-question-bank.json` by hand or merge two runs.
 *
 * The 15 topics mirror the diagnostic prompt's `topic` enum. We
 * generate ~5 questions per topic (75 total) so the test (30 Q) can
 * present a varied set without immediate repeats and so the topic
 * mix can adapt to the user's correctness rate.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'data', 'diagnostic-question-bank.json');

// Auto-load .env.local so a local run doesn't need shell exports.
function loadDotenv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadDotenv();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY not set (env or .env.local). Aborting.');
  process.exit(1);
}

const TOPICS = [
  'anatomy', 'physiology', 'biochemistry', 'pharmacology', 'pathology',
  'internal-medicine', 'surgery', 'pediatrics', 'obstetrics', 'emergency',
  'public-health', 'ethics', 'clinical-skills', 'lab-diagnostics', 'imaging',
];

const PER_TOPIC = 5;
const PROMPT_FOR_TOPIC = (topic) => `Сгенерируй ${PER_TOPIC} вопросов для адаптивного диагностического теста медицинской платформы Bordik по теме "${topic}".

Уровни сложности — равномерно распределены: 1 базовый, 2 средних, 2 продвинутых.

Каждый вопрос:
- Чёткая формулировка на русском, без двусмысленностей
- РОВНО 4 варианта ответа, ОДИН правильный
- Объяснение в 1-2 предложениях, почему ответ правильный
- Без markdown, эмодзи, HTML

Верни строго JSON-массив из ${PER_TOPIC} объектов:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0,
    "topic": "${topic}",
    "explanation": "string",
    "difficulty": "easy" | "medium" | "hard"
  },
  ...
]

Никаких преамбул, комментариев, markdown-блоков. Только сырой JSON-массив.`;

// Model fallback chain — each free-tier model has an independent
// daily quota. If 2.5-flash-lite is drained, 2.0-flash-lite still has
// budget, and so on. Order is preference: cheapest/biggest-quota first.
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

const body = (topic) => JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: PROMPT_FOR_TOPIC(topic) }] }],
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  },
});

async function geminiBatch(topic) {
  let lastErr = null;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
        body: body(topic),
      });
      if (r.status === 429) {
        lastErr = new Error(`${model}: quota`);
        continue; // try next model
      }
      if (!r.ok) {
        lastErr = new Error(`${model}: HTTP ${r.status}`);
        continue;
      }
      const data = await r.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      if (!Array.isArray(parsed)) throw new Error(`expected array for ${topic}`);
      return { questions: parsed, model };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error(`all models failed for ${topic}`);
}

function validate(q, topic, idx) {
  const errs = [];
  if (typeof q.question !== 'string' || q.question.length < 10) errs.push('question');
  if (!Array.isArray(q.options) || q.options.length !== 4) errs.push('options');
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) errs.push('correctIndex');
  if (typeof q.explanation !== 'string') errs.push('explanation');
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errs.push('difficulty');
  if (errs.length) {
    console.warn(`  skip ${topic}#${idx}: invalid fields [${errs.join(',')}]`);
    return false;
  }
  return true;
}

// Resume from existing bank — preserves manually edited / previously
// successful generations across re-runs. Re-running fills only the
// topics that didn't yield enough questions yet.
let bank = [];
if (existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, 'utf8'));
    if (Array.isArray(prev.questions)) bank = prev.questions;
  } catch { /* corrupt → start fresh */ }
}
const countByTopic = (t) => bank.filter((b) => b.topic === t).length;

for (const topic of TOPICS) {
  if (countByTopic(topic) >= PER_TOPIC) {
    console.log(`Skip ${topic}: already has ${countByTopic(topic)} questions`);
    continue;
  }
  process.stdout.write(`Generating ${topic}… `);
  try {
    const { questions, model } = await geminiBatch(topic);
    let kept = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!validate(q, topic, i)) continue;
      const topicCount = countByTopic(topic);
      bank.push({
        id: `${topic}-${topicCount + 1}`,
        topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      });
      kept++;
    }
    console.log(`✓ ${kept}/${questions.length} via ${model}`);
    // Be polite to the free-tier rate limiter — small delay between
    // topics so we don't burst and trip the per-minute window.
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err) {
    console.log(`✗ ${err.message}`);
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  topics: TOPICS,
  questions: bank,
}, null, 2), 'utf8');

const byTopic = TOPICS.map((t) => `${t}: ${bank.filter((b) => b.topic === t).length}`).join(', ');
console.log(`\nBank ready: ${bank.length} questions → ${OUT}`);
console.log(`Per-topic counts: ${byTopic}`);

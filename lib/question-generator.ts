/**
 * Content-driven test question generator.
 *
 * Strategy: pull every lesson markdown for a course, mine it for
 *   • headings  (## Title)
 *   • bold terms (**Term**)
 *   • short factual sentences
 * then assemble cloze-deletion (fill-in-the-blank) questions where a key
 * term is blanked out. Distractors come from other terms in the same
 * course content so options stay topically plausible.
 *
 * Key invariants:
 *   • The same course always produces the same ORDERED pool (seeded RNG)
 *     so test 1 and test 2 of the course always get different slices.
 *   • Within the pool every question is unique — both the "blanked"
 *     sentence and the correct term are deduped.
 *   • Module final test pulls the LATER half of the pool (after the 5
 *     course tests) so it never repeats course-test questions.
 */

import { content as courseContent } from './content';
import type { TestQuestion } from './quiz';

/* ───────────────────────────────────────────────────────────────
   Markdown stripping
   ─────────────────────────────────────────────────────────────── */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')         // fenced code blocks
    .replace(/`[^`\n]+`/g, ' ')              // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')   // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
    .replace(/<[^>]+>/g, ' ')                // raw HTML
    .replace(/\|/g, ' ')                     // table pipes
    .replace(/^\s*[-*+]\s+/gm, '')           // list bullets
    .replace(/^\s*\d+\.\s+/gm, '')           // numbered list
    .replace(/^#{1,6}\s+/gm, '')             // heading markers
    .replace(/[*_~]/g, '')                   // emphasis chars
    .replace(/\s+/g, ' ')                    // collapse whitespace
    .trim();
}

function extractSentences(md: string): string[] {
  // Split by sentence terminators that end a clause. Keep only
  // mid-length sentences — too short are not informative, too long
  // make the question text unwieldy.
  const cleaned = stripMarkdown(md);
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZА-ЯЁ])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 260);
}

function extractKeyTerms(md: string): string[] {
  const terms = new Set<string>();
  let m: RegExpExecArray | null;

  // Bold-emphasised terms: **Term**
  const boldRe = /\*\*([^*\n]{2,60})\*\*/g;
  while ((m = boldRe.exec(md)) !== null) {
    const t = m[1].trim().replace(/^[«"]|[»"]$/g, '');
    if (looksLikeTerm(t)) terms.add(t);
  }

  // ## Headings (level 2-4)
  const headRe = /^#{2,4}\s+(.+)$/gm;
  while ((m = headRe.exec(md)) !== null) {
    const t = m[1].trim().replace(/[*`]/g, '');
    if (looksLikeTerm(t)) terms.add(t);
  }

  // First column of markdown table rows is usually the term.
  const rowRe = /^\|\s*\*?\*?([^|*\n]{2,40})\*?\*?\s*\|/gm;
  while ((m = rowRe.exec(md)) !== null) {
    const t = m[1].trim();
    if (looksLikeTerm(t) && !/^[-:]+$/.test(t)) terms.add(t);
  }

  return Array.from(terms);
}

function looksLikeTerm(t: string): boolean {
  if (t.length < 3 || t.length > 60) return false;
  if (/^\d+$/.test(t)) return false;
  // Reject obvious sentence starts ("Для каждого X...")
  if (/[.!?]/.test(t)) return false;
  // Reject pure punctuation / markdown leftovers
  if (!/[А-Яа-яA-Za-z]/.test(t)) return false;
  return true;
}

/* ───────────────────────────────────────────────────────────────
   Seeded pseudo-random — keeps the question order stable per course.
   ─────────────────────────────────────────────────────────────── */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}
function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = makeRng(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ───────────────────────────────────────────────────────────────
   Public — deterministic, deduped pool of cloze questions.
   ─────────────────────────────────────────────────────────────── */
export function generateContentQuestions(courseId: string): TestQuestion[] {
  const lessons = courseContent[courseId];
  if (!lessons) return [];

  const allMd = Object.values(lessons).filter(Boolean).join('\n\n');
  if (!allMd.trim()) return [];

  const sentences = extractSentences(allMd);
  const terms = extractKeyTerms(allMd);
  if (sentences.length === 0 || terms.length < 4) return [];

  const seed = hashString(courseId);
  const shuffled = seededShuffle(sentences, seed);

  const questions: TestQuestion[] = [];
  const usedSentences = new Set<string>();
  const usedClozes = new Set<string>();

  for (let i = 0; i < shuffled.length; i++) {
    const sentence = shuffled[i];
    if (usedSentences.has(sentence)) continue;

    // Pick the LONGEST term that occurs in the sentence (more specific).
    const matched = terms
      .filter((t) => sentence.includes(t))
      .sort((a, b) => b.length - a.length)[0];
    if (!matched) continue;

    const cloze = sentence.replace(matched, '_____');
    if (usedClozes.has(cloze)) continue;
    usedSentences.add(sentence);
    usedClozes.add(cloze);

    // Distractors — three other terms, length-matched to keep options
    // visually balanced.
    const distractorPool = terms.filter((t) => t !== matched);
    if (distractorPool.length < 3) continue;
    const distractors = seededShuffle(distractorPool, seed + i + 1).slice(0, 3);

    const options = seededShuffle([matched, ...distractors], seed + i * 7 + 13);
    const correctIndex = options.indexOf(matched) as 0 | 1 | 2 | 3;
    if (options.length !== 4) continue;

    questions.push({
      id: `gen-${courseId}-${questions.length}`,
      question: `Заполните пропуск: «${cloze}»`,
      options: [options[0], options[1], options[2], options[3]],
      correctIndex,
    });

    if (questions.length >= 220) break;
  }

  return questions;
}

/* ───────────────────────────────────────────────────────────────
   Slice helpers — guarantees no overlap between course test levels
   (1..5) and the module final.
   ─────────────────────────────────────────────────────────────── */

/** First 100 questions are reserved for the 5 course tests (20 each). */
export function getCourseTestSlice(courseId: string, level: number): TestQuestion[] {
  const pool = generateContentQuestions(courseId);
  if (pool.length === 0) return [];
  const start = (level - 1) * 20;
  return pool.slice(start, start + 20);
}

/** Module final pulls from positions [100..200) of every course in the module
 *  and falls through to additional slices if the early pool is exhausted. */
export function getModuleTestSlice(courseIds: string[]): TestQuestion[] {
  const seen = new Set<string>();
  const out: TestQuestion[] = [];
  // First pass: take from the "after-course-tests" slice of each course.
  for (const cid of courseIds) {
    const pool = generateContentQuestions(cid);
    for (let i = 100; i < pool.length && out.length < 100; i++) {
      const q = pool[i];
      if (seen.has(q.question)) continue;
      seen.add(q.question);
      out.push(q);
    }
    if (out.length >= 100) break;
  }
  // Second pass: if courses are short on content, grab anything not yet used.
  if (out.length < 100) {
    for (const cid of courseIds) {
      const pool = generateContentQuestions(cid);
      for (const q of pool) {
        if (out.length >= 100) break;
        if (seen.has(q.question)) continue;
        seen.add(q.question);
        out.push(q);
      }
      if (out.length >= 100) break;
    }
  }
  return out;
}

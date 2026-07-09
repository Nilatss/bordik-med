/**
 * Regression test for the cloze-answer-leak bug in
 * lib/question-generator.ts (generateContentQuestions).
 *
 * `generateContentQuestions` is the primary real-question source for
 * every course except '100.1' today (lib/questions/generated/index.ts
 * only has AI-generated questions for that one course; moduleData in
 * lib/questions/index.ts is empty) — so a leak here is not a rare
 * fallback path, it's the question bank most students actually see.
 *
 * Bug: the cloze builder used `sentence.replace(matched, '_____')`, which
 * only blanks the FIRST occurrence of the answer term. Medical prose
 * commonly repeats the key term within one sentence (enumeration,
 * comparison, restatement) — when it does, the second occurrence stays
 * in plain text right next to the blank, handing the user the answer.
 *
 * Fix: blank every occurrence via `sentence.split(matched).join('_____')`.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/content', () => ({
  content: {
    'test-cloze-leak': {
      main: [
        '**Инсулин** — гормон поджелудочной железы.',
        '',
        'Инсулин синтезируется бета-клетками поджелудочной железы, а также Инсулин регулирует уровень глюкозы в крови человека.',
        '',
        '**Глюкагон** повышает уровень глюкозы в крови, противодействуя действию гормона при гипогликемии у пациента.',
        '',
        '**Адреналин** усиливает секрецию гормонов надпочечников в стрессовых ситуациях у человека.',
        '',
        '**Кортизол** влияет на метаболизм глюкозы и белков в организме взрослого человека.',
      ].join('\n'),
    },
  },
}));

describe('generateContentQuestions · cloze answer leak', () => {
  it('blanks out every occurrence of the answer term, not just the first', async () => {
    const { generateContentQuestions } = await import('@/lib/question-generator');
    const questions = generateContentQuestions('test-cloze-leak');

    const leaking = questions.find((q) => {
      // The correct answer text, verbatim, must not appear anywhere in
      // the rendered question stem — that would hand the user the answer.
      const correctText = q.options[q.correctIndex];
      return correctText.length > 0 && q.question.includes(correctText);
    });

    expect(leaking).toBeUndefined();

    // Sanity: we actually exercised the repeated-term sentence (two
    // occurrences of "Инсулин" both blanked, not one blanked + one leaked).
    const insulinQuestion = questions.find((q) =>
      q.question.includes('синтезируется бета-клетками'),
    );
    expect(insulinQuestion).toBeDefined();
    expect(insulinQuestion?.question).not.toContain('Инсулин');
    expect((insulinQuestion?.question.match(/_____/g) ?? []).length).toBe(2);
  });
});

#!/usr/bin/env node
/**
 * import-prevuz-courses.mjs — one-shot importer that converts the 6
 * pre-university (довузовые) course markdown files into the platform's
 * `lib/content/course-100-N.ts` standard, matching `course-100-1.ts`.
 *
 * Transformation (info is NEVER altered — only structure / heading levels):
 *   1. Drop the source title chrome (everything before the first intro
 *      heading: ВВЕДЕНИЕ / ПРЕДИСЛОВИЕ / Концепция / Введение и архитектура).
 *   2. Prepend the platform header block + 3-col meta table (decorative,
 *      dropped by splitIntoTabs which only renders `# ` tabs, but kept for
 *      file-format parity with course-100-1).
 *   3. Heading level shift so the tab splitter (`# ` = tab) works:
 *        - intro `## …` → `# Введение в модуль`
 *        - other `## X` → `# X`   (these become tabs)
 *        - `### X`      → `## X`  (subsections within a tab)
 *        - `#### X`     → `### X`
 *      Заключение headings are renamed to "Итоги модуля" so the splitter's
 *      `заключ` skip-rule doesn't drop their content.
 *   4. Drop standalone `---` horizontal rules (sections are delimited by
 *      `# ` headings in the platform format).
 *   5. Append the `- Конец Модуля 1.N -` footer.
 *
 * Output: lib/content/course-100-{2..7}.ts, each `export const course100_N`.
 * Run: node scripts/import-prevuz-courses.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT, '..', 'курсы ( довузовая )');
const OUT_DIR = path.join(ROOT, 'lib', 'content');

const COURSES = [
  { id: '100.2', n: 2, file: 'Биология ( общая, молекулярная, клеточная ).md', title: 'Биология (общая, молекулярная, клеточная)' },
  { id: '100.3', n: 3, file: 'химия ( общая, органическая, неорганическая ).md', title: 'Химия (общая, органическая, неорганическая)' },
  { id: '100.4', n: 4, file: 'Физика ( общая, биофизика ).md', title: 'Физика (общая, биофизика)' },
  { id: '100.5', n: 5, file: 'Математика и статистика ( математический аппарат для медицинских наук ).md', title: 'Математика и статистика' },
  { id: '100.6', n: 6, file: 'Психология ( общая, медицинская ) основы психологии и медицинской психологии.md', title: 'Психология (общая, медицинская)' },
  { id: '100.7', n: 7, file: 'социология и антропология ( социальные и культурные аспекты здоровья ).md', title: 'Социология и антропология' },
];

const INTRO_RE = /^##\s+.*(введ|предислов|концепци|архитектур)/i;
const CONCLUSION_RE = /(заключ)/i;
const HR_RE = /^\s*-{3,}\s*$/;

/** Apply heading-level shift + HR removal to the body lines. */
function transformBody(lines) {
  const out = [];
  let introSeen = false;
  let topicCount = 0;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, ''); // rstrip
    if (HR_RE.test(line)) continue; // drop horizontal rules

    // Intro heading → canonical "# Введение в модуль"
    if (!introSeen && INTRO_RE.test(line)) {
      out.push('# Введение в модуль');
      introSeen = true;
      continue;
    }
    // `#### X` → `### X`
    if (/^####\s+/.test(line)) {
      out.push(line.replace(/^####\s+/, '### '));
      continue;
    }
    // `### X` → `## X`
    if (/^###\s+/.test(line)) {
      out.push(line.replace(/^###\s+/, '## '));
      continue;
    }
    // `## X` → `# X`  (tab). Заключение → "Итоги модуля" (avoid skip-rule).
    if (/^##\s+/.test(line)) {
      const text = line.replace(/^##\s+/, '');
      if (CONCLUSION_RE.test(text)) {
        out.push('# Итоги модуля');
      } else {
        out.push('# ' + text);
      }
      topicCount++;
      continue;
    }
    out.push(line);
  }
  return { body: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), topicCount };
}

/** Build the platform header block (decorative — dropped by tab splitter). */
function headerBlock(course, topicCount) {
  return [
    'ГЛОБАЛЬНАЯ МЕДИЦИНСКАЯ ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА',
    `РАЗДЕЛ 1.${course.n}`,
    'ДОВУЗОВСКАЯ ПОДГОТОВКА',
    course.title,
    '',
    `| 🎯  Уровень <br> Базовый (Pre-Entry) | 👥  Аудитория <br> Абитуриенты 10-11 класс | ⏱  Объём <br> ${topicCount} тем |`,
    '| --- | --- | --- |',
    '',
  ].join('\n');
}

/** Escape a string for safe embedding in a JS template literal. */
function escapeTemplate(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

let written = 0;
for (const course of COURSES) {
  const srcPath = path.join(SRC_DIR, course.file);
  if (!fs.existsSync(srcPath)) {
    console.error(`MISSING: ${srcPath}`);
    continue;
  }
  const raw = fs.readFileSync(srcPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  // Find first intro heading; drop title chrome before it.
  let startIdx = lines.findIndex((l) => INTRO_RE.test(l));
  if (startIdx < 0) {
    // Fallback: drop only the first `# TITLE` line.
    startIdx = lines.findIndex((l) => /^#\s+/.test(l));
    startIdx = startIdx < 0 ? 0 : startIdx + 1;
  }
  const bodyLines = lines.slice(startIdx);

  const { body, topicCount } = transformBody(bodyLines);
  const header = headerBlock(course, topicCount);
  // Footer wrapped in a `# Что дальше?` section so `splitIntoTabs` skips it
  // (its `заключ|что дальше` rule). Bare-appending the footer leaked the
  // `- Конец Модуля -` line into the last real tab (e.g. the glossary).
  const footer = [
    '',
    '# Что дальше?',
    '',
    'Этот модуль — часть блока довузовской подготовки. Переходите к следующим предметам блока, чтобы собрать полный фундамент для поступления в медицинский вуз.',
    '',
    `- Конец Модуля 1.${course.n} -`,
  ].join('\n');
  const full = `${header}\n${body}\n${footer}\n`;

  const varName = `course100_${course.n}`;
  const ts = `export const ${varName} = \`\n${escapeTemplate(full)}\`;\n`;
  const outPath = path.join(OUT_DIR, `course-100-${course.n}.ts`);
  fs.writeFileSync(outPath, ts, 'utf8');
  written++;
  console.log(`✓ ${course.id} → course-100-${course.n}.ts (${topicCount} тем, ${full.length} chars)`);
}

console.log(`\nDone — wrote ${written}/${COURSES.length} course files.`);

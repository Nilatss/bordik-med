/**
 * P1-CR-3 — Tab data model + splitter (extracted from TabbedLessonViewer).
 *
 * `splitIntoTabs` парсит markdown lesson body, разрезанный по h1-headings
 * (`# Заголовок`), на массив Tab объектов. Каждый Tab — самостоятельная
 * секция с iconKey + short label для TOC.
 *
 * Также используется CoursePage.tsx для подсчёта количества табов
 * без mounting'а viewer'а.
 */

export interface Tab {
  id: string;
  title: string;
  short: string;
  iconKey: string;
  body: string;
  kind?: 'tests' | 'selfcheck';
}

/** Split markdown by top-level `# ` headings into tabs. */
export function splitIntoTabs(md: string): Tab[] {
  const lines = md.split('\n');
  const tabs: Tab[] = [];
  let current: Tab | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      current.body = buffer.join('\n').trim();
      tabs.push(current);
    }
  };

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && h1[1]) {
      flush();
      const title = h1[1].trim();
      // Skip "Что дальше?" / "Заключение" sections entirely
      if (/заключ|что дальше/i.test(title)) {
        current = null;
        buffer = [];
        continue;
      }
      // Pick icon key and shortname based on subject
      let iconKey = 'intro';
      let short = title;

      if (/глоссарий/i.test(title)) {
        iconKey = 'glossary';
        short = 'Глоссарий';
      } else if (/контроль|самопровер/i.test(title)) {
        iconKey = 'check';
        short = 'Самопроверка';
        current = { id: `t${tabs.length}`, title, short, iconKey, body: '', kind: 'selfcheck' };
        buffer = [];
        continue;
      } else if (/^(?:РАЗДЕЛ|Раздел|ЧАСТЬ|Часть|ГЛАВА|Глава|БЛОК|Блок|ТЕМА|Тема)\s+[\dIVXLCМ]+/i.test(title)) {
        // Section-prefixed heading (РАЗДЕЛ 1 / ЧАСТЬ I / Глава 2 / Блок 3 /
        // Тема N). Deep single-subject courses (Биология, Химия, Физика…)
        // name every section after the subject, which would otherwise all
        // collapse to the same subject short-label below. Extract the
        // descriptive part after the marker+number so each tab gets a
        // distinct label.
        //
        // MUST run BEFORE both the `введение` check and subject detection:
        // a section like "Раздел 1. Введение в социологию" otherwise matched
        // `/введение/` and produced a SECOND "Введение" tab clashing with
        // the real "# Введение в модуль" intro tab.
        iconKey = 'topic';
        const m = title.match(/^(?:РАЗДЕЛ|Раздел|ЧАСТЬ|Часть|ГЛАВА|Глава|БЛОК|Блок|ТЕМА|Тема)\s+[\dIVXLCМ]+[.):]?\s*(.+)$/i);
        const baseTxt = (m && m[1] ? m[1] : title).trim();
        const rest = (baseTxt.split(/\s[—–-]\s|:/)[0] ?? baseTxt).trim();
        short = rest.length > 24 ? rest.slice(0, 22) + '…' : rest;
      } else if (/введение/i.test(title)) {
        iconKey = 'intro';
        short = 'Введение';
      } else if (/биолог/i.test(title)) {
        iconKey = 'biology';
        short = 'Биология';
      } else if (/хим/i.test(title)) {
        iconKey = 'chemistry';
        short = 'Химия';
      } else if (/физик/i.test(title)) {
        iconKey = 'physics';
        short = 'Физика';
      } else if (/математик|статист/i.test(title)) {
        iconKey = 'math';
        short = 'Математика';
      } else if (/психолог/i.test(title)) {
        iconKey = 'psychology';
        short = 'Психология';
      } else if (/англ|язык/i.test(title)) {
        iconKey = 'language';
        short = 'Английский';
      } else if (/учить|обуч/i.test(title)) {
        iconKey = 'learning';
        short = 'Как учиться';
      } else {
        // Fallback: take text after "Тема N. " and before " - "
        const m = title.match(/^Тема\s+\d+\.?\s*(.+)$/i);
        const baseTxt = m && m[1] ? m[1] : title;
        const rest = (baseTxt.split(/[--:]/)[0] ?? baseTxt).trim();
        short = rest.length > 22 ? rest.slice(0, 20) + '…' : rest;
      }

      current = { id: `t${tabs.length}`, title, short, iconKey, body: '' };
      buffer = [];
    } else {
      if (!current) {
        // Content before first h1 - skip or collect as intro
        continue;
      }
      buffer.push(line);
    }
  }
  flush();
  return tabs;
}

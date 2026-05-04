#!/usr/bin/env node
/**
 * Export every tool's metadata into human-friendly files:
 *   docs/all-tools.csv  — universal (Excel / Google Sheets / SQL import)
 *   docs/all-tools.md   — readable, grouped by category
 *
 * Source of truth is `public/tools-data/*.json` — the same files the
 * runtime route /tools/[id] reads. Re-run any time after the catalog
 * changes; idempotent, overwrites both outputs.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'public', 'tools-data');
const DOCS = join(ROOT, 'docs');
if (!existsSync(DOCS)) mkdirSync(DOCS, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.json')).sort();
const tools = files.map((f) => {
  const j = JSON.parse(readFileSync(join(SRC, f), 'utf8'));
  return {
    id: j.id ?? '',
    title: j.title ?? '',
    description: j.description ?? '',
    category: j.category ?? '',
    subcategory: j.subcategory ?? '',
    kind: j.kind ?? '',
    countries: j.countries ?? '',
    hasRunner: j.hasRunner ? 'yes' : 'no',
    version: j.version ?? '',
  };
});

// ── CSV (UTF-8 with BOM so Excel opens cyrillic correctly) ───────────
const csvEsc = (s) => {
  const v = String(s ?? '').replace(/"/g, '""');
  return /[",\n\r]/.test(v) ? `"${v}"` : v;
};
const HEADERS = ['id', 'title', 'category', 'subcategory', 'kind', 'countries', 'hasRunner', 'version', 'description'];
const csv = [
  HEADERS.join(','),
  ...tools.map((t) => HEADERS.map((h) => csvEsc(t[h])).join(',')),
].join('\n');
writeFileSync(join(DOCS, 'all-tools.csv'), '﻿' + csv, 'utf8');

// ── Markdown grouped by category ─────────────────────────────────────
const byCat = {};
for (const t of tools) {
  (byCat[t.category] = byCat[t.category] || []).push(t);
}
const cats = Object.keys(byCat).sort();
const cellEsc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const md = [];
md.push('# Все инструменты Bordik Med');
md.push('');
md.push(`Всего: **${tools.length}** инструментов в **${cats.length}** разделах. Сгенерировано из \`public/tools-data/*.json\` ${new Date().toISOString().slice(0, 10)}.`);
md.push('');
md.push('Поля:');
md.push('- **ID** — slug, используется в URL `/tools/<id>`');
md.push('- **Название** — отображаемое имя на странице инструмента');
md.push('- **Подраздел** — узкая группа в рамках категории');
md.push('- **Тип** — `calculator` (формула) или `score` (балльная шкала)');
md.push('- **Страны** — клинический гайдлайн / регион применения');
md.push('- **Runner** — есть ли интерактивная реализация (`yes`/`no`)');
md.push('');
md.push('## Содержание');
md.push('');
for (const cat of cats) {
  const slug = cat.toLowerCase().replace(/[^\wа-я0-9]+/gi, '-');
  md.push(`- [${cat}](#${slug}) — ${byCat[cat].length}`);
}
md.push('');

for (const cat of cats) {
  md.push(`## ${cat}`);
  md.push('');
  md.push('| ID | Название | Подраздел | Тип | Страны | Runner |');
  md.push('|---|---|---|---|---|---|');
  for (const t of byCat[cat].sort((a, b) => a.title.localeCompare(b.title, 'ru'))) {
    md.push(`| \`${t.id}\` | ${cellEsc(t.title)} | ${cellEsc(t.subcategory)} | ${t.kind} | ${cellEsc(t.countries)} | ${t.hasRunner} |`);
  }
  md.push('');
}
writeFileSync(join(DOCS, 'all-tools.md'), md.join('\n'), 'utf8');

console.log(`✓ docs/all-tools.csv  (${(csv.length / 1024).toFixed(1)} KB, ${tools.length} rows)`);
console.log(`✓ docs/all-tools.md   (${(md.join('\n').length / 1024).toFixed(1)} KB, ${cats.length} categories)`);
console.log('');
console.log('Распределение по разделам:');
for (const c of cats) console.log(`  ${c} — ${byCat[c].length}`);

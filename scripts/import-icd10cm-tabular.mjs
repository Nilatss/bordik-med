// Парсит icd10cm_tabular_2026.xml (CMS) и извлекает inclusion/exclusion/notes
// для всех кодов. Записывает в icd10cm-details.json.
//
// XML структура:
//   <chapter><section><diag>
//     <name>A00.1</name>
//     <desc>Cholera due to Vibrio cholerae 01, biovar eltor</desc>
//     <inclusionTerm><note>...</note><note>...</note></inclusionTerm>
//     <excludes1><note>...</note></excludes1>
//     <excludes2><note>...</note></excludes2>
//     <useAdditionalCode><note>...</note></useAdditionalCode>
//     <codeFirst><note>...</note></codeFirst>
//     <codeAlso><note>...</note></codeAlso>
//     <notes><note>...</note></notes>
//   </diag></section></chapter>

import fs from 'node:fs';

const xmlPath = './data/raw/icd10cm-tabular/Table and Index/icd10cm_tabular_2026.xml';
const detailsPath = './public/icd10cm-details.json';
const dDetailsPath = './data/icd10cm-details.json';

const xml = fs.readFileSync(xmlPath, 'utf8');

// Lightweight regex-based parser. Полный XML parse через xmldom был бы
// безопаснее, но 9.7 MB файла regex обрабатывает за секунды.
const codes = {};

// Match <diag>...</diag> NESTED. Используем итеративный подход: ищем
// все <diag>, парсим содержимое до сбалансированной </diag>.
const diagRegex = /<diag>([\s\S]*?)<\/diag>/g;
// Это плохо работает для nested — давайте перейдём к иерархическому подходу.
// Вместо matching, мы извлекаем КАЖДЫЙ <name>X</name> и его SIBLING-блоки.

// Правильный подход: извлечь блоки между <diag> ... </diag> учитывая вложенность.
function extractDiagBlocks(s) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith('<diag>', i)) {
      if (depth === 0) start = i + 6;
      depth++;
      i += 5;
    } else if (s.startsWith('</diag>', i)) {
      depth--;
      if (depth === 0 && start !== -1) {
        blocks.push(s.slice(start, i));
        start = -1;
      }
      i += 6;
    }
  }
  return blocks;
}

function unwrapDiag(content) {
  // Все top-level элементы перед первым вложенным <diag>
  const firstNested = content.indexOf('<diag>');
  return firstNested === -1 ? content : content.slice(0, firstNested);
}

function extractName(content) {
  const m = content.match(/<name>([^<]+)<\/name>/);
  return m ? m[1].trim() : null;
}

function extractNotes(content, tag) {
  // Возвращает массив <note> внутри <tag>...</tag>
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    const inner = m[1];
    const noteRe = /<note>([\s\S]*?)<\/note>/g;
    let nm;
    while ((nm = noteRe.exec(inner)) !== null) {
      const text = nm[1].replace(/\s+/g, ' ').trim();
      if (text) out.push(text);
    }
  }
  return out;
}

function processDiag(content) {
  const own = unwrapDiag(content);
  const name = extractName(own);
  if (!name) return;

  const inclusion = extractNotes(own, 'inclusionTerm');
  const excludes1 = extractNotes(own, 'excludes1');
  const excludes2 = extractNotes(own, 'excludes2');
  const useAdditional = extractNotes(own, 'useAdditionalCode');
  const codeFirst = extractNotes(own, 'codeFirst');
  const codeAlso = extractNotes(own, 'codeAlso');
  const notesArr = extractNotes(own, 'notes');

  if (inclusion.length || excludes1.length || excludes2.length
      || useAdditional.length || codeFirst.length || codeAlso.length
      || notesArr.length) {
    const o = {};
    if (inclusion.length) o.inclusion = inclusion;
    // ICD-10-CM имеет 2 типа excludes — объединяем с пометками
    const excl = [];
    for (const e of excludes1) excl.push(e);
    for (const e of excludes2) excl.push(e);
    if (excl.length) o.exclusion = excl;
    if (useAdditional.length) o.codingNote = 'Use additional code: ' + useAdditional.join('; ');
    if (codeFirst.length) o.codingNote = (o.codingNote ? o.codingNote + ' | ' : '') + 'Code first: ' + codeFirst.join('; ');
    if (codeAlso.length) o.codingNote = (o.codingNote ? o.codingNote + ' | ' : '') + 'Code also: ' + codeAlso.join('; ');
    if (notesArr.length) o.definition = notesArr.join('. ');
    codes[name] = o;
  }

  // Recurse into nested <diag>
  const blocks = extractDiagBlocks(content);
  for (const b of blocks) processDiag(b);
}

// Top-level <diag> blocks
const topBlocks = extractDiagBlocks(xml);
console.log(`Top-level diags: ${topBlocks.length}`);
for (const b of topBlocks) processDiag(b);

console.log(`Codes with details: ${Object.keys(codes).length}`);

// Также наследуем от родителя (как сделали для МКБ-11)
function findParent(code) {
  if (code.includes('.')) return code.replace(/\.[^.]+$/, '');
  if (code.length > 1) return code.slice(0, -1);
  return null;
}

let inheritedCount = 0;
const allKnownCodes = new Set();
// Соберём все кодов из основного slim
const slim = JSON.parse(fs.readFileSync('./public/icd10cm-slim.json', 'utf8'));
for (const c of slim.codes) allKnownCodes.add(c.code);

for (const c of slim.codes) {
  if (codes[c.code]) continue; // уже есть свои
  let parent = findParent(c.code);
  let depth = 0;
  while (parent && depth < 5) {
    if (codes[parent]) {
      const p = codes[parent];
      const o = {};
      if (p.definition) o.inheritedDefinition = p.definition;
      if (p.inclusion) o.inheritedInclusion = p.inclusion;
      o.inheritedFrom = parent;
      codes[c.code] = o;
      inheritedCount++;
      break;
    }
    parent = findParent(parent);
    depth++;
  }
}

console.log(`Inherited from parents: ${inheritedCount}`);
console.log(`Total with some details: ${Object.keys(codes).length}`);

const json = JSON.stringify(codes);
fs.writeFileSync(detailsPath, json);
fs.writeFileSync(dDetailsPath, json);

const stat = fs.statSync(detailsPath);
console.log(`Output: ${detailsPath} (${(stat.size/1024/1024).toFixed(2)} MB)`);

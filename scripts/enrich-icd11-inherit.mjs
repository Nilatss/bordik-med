// B24 fix: подкоды без своих definitions наследуют их от родителя.
// Например 1A11.0 (Пищевое отравление ботулотоксином) не имеет
// description от WHO, но 1A11 (Ботулизм) — имеет. После inheritance
// у 1A11.0 будет показываться description родителя с пометкой "от родителя".
//
// Иерархия в МКБ-11: parent = code.replace(/\.\w+$/, '') — отрезает
// последний компонент.
//   1A11.0 → 1A11
//   1A11   → (chapter) — нет parent в коде
//
// Если parent не найден через trim, идём вверх ещё (1A11.0a → 1A11.0 → 1A11).

import fs from 'node:fs';

const corePath = './public/icd11-mms.json';
const extPath = './public/icd11-mms-ext.json';
const dCorePath = './data/icd11-mms.json';
const dExtPath = './data/icd11-mms-ext.json';

const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const ext = JSON.parse(fs.readFileSync(extPath, 'utf8'));

// Объединённая мапа всех кодов
const allCodes = [...core.codes, ...ext.codes];
const byCode = new Map(allCodes.map(c => [c.code, c]));

function findParentCode(code) {
  // Снимаем последний "сегмент" (после точки или последнего символа в block-кодах)
  if (code.includes('.')) {
    return code.replace(/\.[^.]+$/, ''); // 1A11.0 → 1A11
  }
  // Без точки: 1A11 → 1A1, 1A1 → 1A, 1A → 1
  if (code.length > 1) {
    return code.slice(0, -1);
  }
  return null;
}

// Для каждого кода без description — ищем родителя с description.
let inherited = 0;
for (const c of allCodes) {
  if (c.definition || c.longDefinition) continue;
  // Пытаемся подняться по иерархии через trim кода
  let parentCode = findParentCode(c.code);
  let depth = 0;
  while (parentCode && depth < 5) {
    const p = byCode.get(parentCode);
    if (p && (p.definition || p.longDefinition)) {
      // Наследуем
      if (p.definition) {
        c.inheritedDefinition = p.definition;
        c.inheritedFrom = p.code;
      }
      if (p.longDefinition) {
        c.inheritedLongDefinition = p.longDefinition;
        c.inheritedFrom = p.code;
      }
      // Inclusion / exclusion родителя обычно не наследуются (они уточняют скоп родителя),
      // но если у ребёнка совсем ничего нет — берём для контекста.
      if (!c.inclusion?.length && p.inclusion?.length) {
        c.inheritedInclusion = p.inclusion;
      }
      inherited++;
      break;
    }
    parentCode = findParentCode(parentCode);
    depth++;
  }
}

// Записываем обратно
const splitCore = { ...core, codes: core.codes.map(c => byCode.get(c.code)) };
const splitExt = { ...ext, codes: ext.codes.map(c => byCode.get(c.code)) };

fs.writeFileSync(corePath, JSON.stringify(splitCore, null, 2) + '\n');
fs.writeFileSync(extPath, JSON.stringify(splitExt, null, 2) + '\n');
fs.writeFileSync(dCorePath, JSON.stringify(splitCore, null, 2) + '\n');
fs.writeFileSync(dExtPath, JSON.stringify(splitExt, null, 2) + '\n');

const stats = {
  total: allCodes.length,
  ownDef: allCodes.filter(c => c.definition).length,
  ownLong: allCodes.filter(c => c.longDefinition).length,
  inherited,
  totalWithSomeDesc: allCodes.filter(c => c.definition || c.longDefinition || c.inheritedDefinition || c.inheritedLongDefinition).length,
};

console.log('=== Inheritance result ===');
console.log(`Total codes:                  ${stats.total}`);
console.log(`Own definition:               ${stats.ownDef}`);
console.log(`Own longDefinition:           ${stats.ownLong}`);
console.log(`Inherited from parent:        ${stats.inherited}`);
console.log(`Total with some description:  ${stats.totalWithSomeDesc} (${Math.round(100 * stats.totalWithSomeDesc / stats.total)}%)`);

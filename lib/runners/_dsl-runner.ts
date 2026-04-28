/**
 * Declarative DSL runner for simple "sum-of-points → band" scales.
 *
 * Many clinical scales follow the same pattern: each input contributes
 * a weight when checked, sum produces a total, total falls into one of
 * a few bands which interpret the score. Hand-coding a runner per scale
 * is repetitive and locks domain experts out of editing.
 *
 * This runner accepts a small JSON spec (storable in DB and edited via
 * CMS) and evaluates it deterministically. The expression language is
 * intentionally minimal and whitelisted - NO eval(), NO new Function() -
 * to make it safe to load specs straight from the editor table without
 * exposing the app to remote-code-execution.
 *
 * Supported in `when` expressions:
 *   - identifiers: `score`, plus any input id you reference
 *   - integer & decimal literals: `5`, `12.3`, `-1`
 *   - comparison: `>=`, `>`, `<=`, `<`, `==`, `!=`
 *   - boolean ops: `&&`, `||`, `!`
 *   - parens: `(score >= 5 && score < 7) || age > 75`
 *   - arithmetic: `+`, `-`, `*`, `/`
 *
 * Anything else (function calls, member access, regex, ...) is rejected
 * at parse time. Result type is `boolean`.
 */

export type Severity = 'low' | 'moderate' | 'high' | 'critical';
export type I18nLabel = Record<string, string>;

export interface DslInput {
  id: string;
  /** Weight added when the input is truthy / numeric. */
  weight: number;
  /** Optional - render hint for the editor UI. */
  type?: 'checkbox' | 'number' | 'enum';
  options?: ReadonlyArray<{ value: string; weight: number }>;
}

export interface DslBand {
  when: string;
  severity: Severity;
  label: I18nLabel;
  details?: I18nLabel;
}

export interface DslSpec {
  kind: 'sum';
  inputs: ReadonlyArray<DslInput>;
  bands: ReadonlyArray<DslBand>;
  maxScore: number;
}

export interface DslResult {
  score: number;
  band: DslBand | null;
}

/* ── 1. Tokenize the expression ──────────────────────────────────── */
type TokenKind =
  | 'num' | 'id'
  | '>=' | '>' | '<=' | '<' | '==' | '!=' | '!'
  | '&&' | '||'
  | '+' | '-' | '*' | '/'
  | '(' | ')';

interface Token { kind: TokenKind; text: string; pos: number }

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i;
      while (j < n && /[0-9.]/.test(src[j])) j++;
      tokens.push({ kind: 'num', text: src.slice(i, j), pos: i });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(src[j])) j++;
      tokens.push({ kind: 'id', text: src.slice(i, j), pos: i });
      i = j;
      continue;
    }
    // Two-char operators
    const two = src.slice(i, i + 2);
    if (two === '>=' || two === '<=' || two === '==' || two === '!=' ||
        two === '&&' || two === '||') {
      tokens.push({ kind: two, text: two, pos: i });
      i += 2;
      continue;
    }
    // One-char operators
    if ('><+-*/()!'.includes(ch)) {
      tokens.push({ kind: ch as TokenKind, text: ch, pos: i });
      i++;
      continue;
    }
    throw new Error(`Unexpected character '${ch}' at pos ${i} in: ${src}`);
  }
  return tokens;
}

/* ── 2. Recursive descent parser ─────────────────────────────────── */
type Node =
  | { type: 'num'; value: number }
  | { type: 'id'; name: string }
  | { type: 'unary'; op: '!' | '-'; arg: Node }
  | { type: 'bin'; op: TokenKind; left: Node; right: Node };

function parse(expr: string): Node {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = (kind?: TokenKind): Token => {
    const t = tokens[pos];
    if (!t) throw new Error(`Unexpected end of expression: ${expr}`);
    if (kind && t.kind !== kind) throw new Error(`Expected ${kind}, got ${t.kind} at pos ${t.pos}`);
    pos++;
    return t;
  };

  // Precedence (low to high): || , && , ==/!= , >=/>/<=/< , +/- , */ /, unary, primary
  function parseOr(): Node {
    let left = parseAnd();
    while (peek()?.kind === '||') { consume(); left = { type: 'bin', op: '||', left, right: parseAnd() }; }
    return left;
  }
  function parseAnd(): Node {
    let left = parseEq();
    while (peek()?.kind === '&&') { consume(); left = { type: 'bin', op: '&&', left, right: parseEq() }; }
    return left;
  }
  function parseEq(): Node {
    let left = parseCmp();
    while (peek()?.kind === '==' || peek()?.kind === '!=') {
      const op = consume().kind;
      left = { type: 'bin', op, left, right: parseCmp() };
    }
    return left;
  }
  function parseCmp(): Node {
    let left = parseAdd();
    while (peek()?.kind === '>=' || peek()?.kind === '>' ||
           peek()?.kind === '<=' || peek()?.kind === '<') {
      const op = consume().kind;
      left = { type: 'bin', op, left, right: parseAdd() };
    }
    return left;
  }
  function parseAdd(): Node {
    let left = parseMul();
    while (peek()?.kind === '+' || peek()?.kind === '-') {
      const op = consume().kind;
      left = { type: 'bin', op, left, right: parseMul() };
    }
    return left;
  }
  function parseMul(): Node {
    let left = parseUnary();
    while (peek()?.kind === '*' || peek()?.kind === '/') {
      const op = consume().kind;
      left = { type: 'bin', op, left, right: parseUnary() };
    }
    return left;
  }
  function parseUnary(): Node {
    if (peek()?.kind === '!') { consume(); return { type: 'unary', op: '!', arg: parseUnary() }; }
    if (peek()?.kind === '-') { consume(); return { type: 'unary', op: '-', arg: parseUnary() }; }
    return parsePrimary();
  }
  function parsePrimary(): Node {
    const t = peek();
    if (!t) throw new Error(`Unexpected end of expression: ${expr}`);
    if (t.kind === 'num') { consume(); return { type: 'num', value: parseFloat(t.text) }; }
    if (t.kind === 'id')  { consume(); return { type: 'id', name: t.text }; }
    if (t.kind === '(')   { consume(); const inner = parseOr(); consume(')'); return inner; }
    throw new Error(`Unexpected token ${t.kind} at pos ${t.pos} in: ${expr}`);
  }

  const ast = parseOr();
  if (pos < tokens.length) {
    throw new Error(`Trailing tokens in expression: ${expr}`);
  }
  return ast;
}

/* ── 3. Evaluator ─────────────────────────────────────────────────── */
function evalNode(node: Node, ctx: Record<string, number>): number {
  switch (node.type) {
    case 'num': return node.value;
    case 'id':  return ctx[node.name] ?? 0;
    case 'unary':
      if (node.op === '!') return evalNode(node.arg, ctx) ? 0 : 1;
      if (node.op === '-') return -evalNode(node.arg, ctx);
      return 0;
    case 'bin': {
      const l = evalNode(node.left, ctx);
      const r = evalNode(node.right, ctx);
      switch (node.op) {
        case '+':  return l + r;
        case '-':  return l - r;
        case '*':  return l * r;
        case '/':  return r === 0 ? 0 : l / r;
        case '>=': return l >= r ? 1 : 0;
        case '>':  return l >  r ? 1 : 0;
        case '<=': return l <= r ? 1 : 0;
        case '<':  return l <  r ? 1 : 0;
        case '==': return l === r ? 1 : 0;
        case '!=': return l !== r ? 1 : 0;
        case '&&': return (l && r) ? 1 : 0;
        case '||': return (l || r) ? 1 : 0;
        default:   return 0;
      }
    }
  }
}

/** Public: parse + evaluate to a boolean. Throws on malformed input. */
export function safeEval(expr: string, ctx: Record<string, number>): boolean {
  return evalNode(parse(expr), ctx) !== 0;
}

/* ── 4. Sum-of-points runner ─────────────────────────────────────── */
/**
 * Evaluates a sum-of-points spec against user-supplied input values.
 *  - boolean inputs contribute their full `weight` when truthy
 *  - number inputs contribute `weight * value`
 *  - enum inputs read the value's matching `options[].weight`
 * Then walks bands in order and returns the first matching one.
 */
export function runDsl(
  spec: DslSpec,
  values: Record<string, number | boolean | string>,
): DslResult {
  let score = 0;
  for (const inp of spec.inputs) {
    const raw = values[inp.id];
    if (raw === undefined || raw === null) continue;
    if (inp.type === 'enum' && typeof raw === 'string' && inp.options) {
      const opt = inp.options.find((o) => o.value === raw);
      if (opt) score += opt.weight;
    } else if (typeof raw === 'boolean') {
      if (raw) score += inp.weight;
    } else if (typeof raw === 'number' && !Number.isNaN(raw)) {
      score += inp.weight * raw;
    }
  }
  const ctx: Record<string, number> = { score };
  // Also expose individual inputs as variables for more advanced predicates
  for (const inp of spec.inputs) {
    const raw = values[inp.id];
    if (typeof raw === 'number') ctx[inp.id] = raw;
    else if (typeof raw === 'boolean') ctx[inp.id] = raw ? 1 : 0;
  }
  const band = spec.bands.find((b) => {
    try { return safeEval(b.when, ctx); }
    catch { return false; }
  }) ?? null;
  return { score, band };
}

/* ── 5. Static validator (used by the CMS / build script) ────────── */
/**
 * Verify a spec at edit time. Returns an array of human-readable issues
 * (empty = OK). Use this in the admin UI before saving a draft.
 */
export function validateDslSpec(spec: DslSpec): string[] {
  const issues: string[] = [];
  if (spec.kind !== 'sum') issues.push(`Unknown kind "${spec.kind}", expected "sum"`);
  if (!Array.isArray(spec.inputs) || spec.inputs.length === 0) {
    issues.push('inputs[] must be a non-empty array');
  }
  if (!Array.isArray(spec.bands) || spec.bands.length === 0) {
    issues.push('bands[] must be a non-empty array');
  }
  for (let i = 0; i < spec.bands.length; i++) {
    const b = spec.bands[i];
    try { parse(b.when); }
    catch (err) {
      issues.push(`bands[${i}].when invalid: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return issues;
}

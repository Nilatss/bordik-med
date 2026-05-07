import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * P1-SEC — origin-check для CSRF. Принимаем mutating-запросы только
 * если они инициированы из нашего же origin. Современные браузеры
 * отправляют `Sec-Fetch-Site: same-origin` для in-app fetch и
 * `cross-site` или `none` для атакующего origin (от <form> или CSRF
 * gadget). Fallback на `Origin` header для старых браузеров.
 */
function isSameOrigin(req: Request): boolean {
  const sfs = req.headers.get('sec-fetch-site');
  if (sfs === 'same-origin' || sfs === 'same-site') return true;
  if (sfs && sfs !== 'same-origin' && sfs !== 'same-site') return false;
  // Fallback (старые браузеры — Sec-Fetch-Site не отправляют)
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/**
 * P1-SEC — whitelist полей в patch + строгая type-проверка. До этого
 * `patch: Record<string, unknown>` лился прямо в `.update()`, что
 * позволяло writer'у с med_editor ролью переписать `id`, `created_by`,
 * `reviewed_by`, `status` и обойти 4-eye principle. Зод не используем
 * (deps minimisation), пишем явный валидатор.
 */
const ALLOWED_PATCH_KEYS = new Set([
  'name_ru', 'name_en', 'group_id', 'tags',
  'description_md', 'inputs', 'formula', 'guideline_source', 'guideline_doi',
  'category', 'specialty', 'kind', 'version',
]);

interface PatchResult {
  ok: true;
  data: Record<string, unknown>;
}

interface PatchError {
  ok: false;
  error: string;
}

function validatePatch(raw: unknown): PatchResult | PatchError {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'patch-not-object' };
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_PATCH_KEYS.has(k)) {
      return { ok: false, error: `field-not-allowed:${k}` };
    }
    // Базовая type-проверка по виду поля
    if (k === 'tags' && !Array.isArray(v)) {
      return { ok: false, error: 'tags-must-be-array' };
    }
    if ((k === 'inputs' || k === 'formula') && v !== null && typeof v !== 'object') {
      return { ok: false, error: `${k}-must-be-object-or-null` };
    }
    // Все остальные whitelist-поля = string | null
    const stringFields = ['name_ru', 'name_en', 'group_id', 'description_md',
      'guideline_source', 'guideline_doi', 'category', 'specialty', 'kind', 'version'];
    if (stringFields.includes(k) && v !== null && typeof v !== 'string') {
      return { ok: false, error: `${k}-must-be-string-or-null` };
    }
    // Длина строк — защита от стуффинга
    if (typeof v === 'string' && v.length > 50_000) {
      return { ok: false, error: `${k}-too-long` };
    }
    out[k] = v;
  }
  return { ok: true, data: out };
}

/**
 * Editor API for a single tool. Authenticates the caller via the active
 * Supabase session, checks the editor_role from JWT app_metadata, and
 * applies the requested action.
 *
 * Body:
 *   { action: 'save' | 'submit-review' | 'approve' | 'archive',
 *     patch: Partial<ToolRow> }
 *
 * RLS additionally enforces who can write to which row - we duplicate
 * the role check here to give a friendly 403 instead of a confusing
 * "row violates row-level security policy" 401.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // P1-SEC — CSRF guard
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'cross-origin-not-allowed' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const sb = await getSupabaseServerClient();
  if (!sb) return NextResponse.json({ ok: false, error: 'backend-not-configured' }, { status: 503 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const role = (user.app_metadata?.editor_role as string | undefined) ?? '';
  if (!['med_editor', 'med_reviewer'].includes(role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  let body: { action?: string; patch?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }

  const action = body.action;
  // P1-SEC — schema validation on patch
  const validated = validatePatch(body.patch ?? {});
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }
  const patch = validated.data;

  // Common metadata fields written on every action
  const meta = {
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  if (action === 'save') {
    const { error } = await sb.from('tools').update({ ...patch, ...meta }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'submit-review') {
    if (role !== 'med_editor' && role !== 'med_reviewer') {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }
    const { error } = await sb.from('tools').update({
      ...patch,
      status: 'review',
      ...meta,
    }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'approve') {
    if (role !== 'med_reviewer') {
      return NextResponse.json({ ok: false, error: 'reviewer-required' }, { status: 403 });
    }
    // Read current row first - if proposer == reviewer, refuse (4-eye principle)
    const { data: existing, error: readErr } = await sb
      .from('tools')
      .select('updated_by, created_by, version')
      .eq('id', id)
      .maybeSingle();
    if (readErr) return NextResponse.json({ ok: false, error: readErr.message }, { status: 400 });
    if (existing?.updated_by && existing.updated_by === user.id) {
      return NextResponse.json({ ok: false, error: 'four-eye-violation' }, { status: 409 });
    }
    const { error } = await sb.from('tools').update({
      ...patch,
      status: 'published',
      reviewed_by: user.id,
      reviewed_on: new Date().toISOString().slice(0, 10),
      ...meta,
    }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    // Snapshot the published payload to tools_versions for history
    const { data: snapshot } = await sb.from('tools').select('*').eq('id', id).maybeSingle();
    if (snapshot) {
      await sb.from('tools_versions').insert({
        tool_id: id,
        version: snapshot.version ?? '1.0.0',
        changelog_md: 'Approved via admin UI',
        guideline_source: snapshot.guideline_source ?? 'unspecified',
        guideline_doi: snapshot.guideline_doi ?? null,
        approved_by: user.id,
        payload: snapshot,
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'archive') {
    if (role !== 'med_reviewer') {
      return NextResponse.json({ ok: false, error: 'reviewer-required' }, { status: 403 });
    }
    const { error } = await sb.from('tools').update({
      status: 'archived',
      ...meta,
    }).eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'unknown-action' }, { status: 400 });
}

import { withRole, parseJsonBody, apiError, apiOk } from '@/lib/api-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

interface PatchOk { ok: true; data: Record<string, unknown> }
interface PatchFail { ok: false; error: string }

function validatePatch(raw: unknown): PatchOk | PatchFail {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'patch-not-object' };
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_PATCH_KEYS.has(k)) {
      return { ok: false, error: `field-not-allowed:${k}` };
    }
    if (k === 'tags' && !Array.isArray(v)) {
      return { ok: false, error: 'tags-must-be-array' };
    }
    if ((k === 'inputs' || k === 'formula') && v !== null && typeof v !== 'object') {
      return { ok: false, error: `${k}-must-be-object-or-null` };
    }
    const stringFields = ['name_ru', 'name_en', 'group_id', 'description_md',
      'guideline_source', 'guideline_doi', 'category', 'specialty', 'kind', 'version'];
    if (stringFields.includes(k) && v !== null && typeof v !== 'string') {
      return { ok: false, error: `${k}-must-be-string-or-null` };
    }
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
 * Auth + CSRF + role-check выполняются через withRole helper
 * (см. lib/api-helpers.ts).
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return withRole(req, ['med_editor', 'med_reviewer'], async (sb, user, role) => {
    const parsed = await parseJsonBody<{ action?: string; patch?: Record<string, unknown> }>(req);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const action = body.action;
    const validated = validatePatch(body.patch ?? {});
    if (!validated.ok) return apiError(validated.error, 400);
    const patch = validated.data;

    const meta = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    if (action === 'save') {
      // Defence-in-depth (also enforced by trg_tools_four_eye in
      // supabase/p1-tools-four-eye.sql): never silently mutate a live
      // published tool. To edit published content, move it back to review
      // via submit-review, which un-publishes it and forces re-approval.
      const { data: cur, error: curErr } = await sb
        .from('tools').select('status').eq('id', id).maybeSingle();
      if (curErr) { console.error('[admin/tools] db error:', curErr.message); return apiError('database-error', 400); }
      if (cur?.status === 'published') return apiError('published-immutable', 409);
      const { error } = await sb.from('tools').update({ ...patch, ...meta }).eq('id', id);
      if (error) { console.error('[admin/tools] db error:', error.message); return apiError('database-error', 400); }
      return apiOk();
    }

    if (action === 'submit-review') {
      const { error } = await sb.from('tools').update({
        ...patch,
        status: 'review',
        ...meta,
      }).eq('id', id);
      if (error) { console.error('[admin/tools] db error:', error.message); return apiError('database-error', 400); }
      return apiOk();
    }

    if (action === 'approve') {
      if (role !== 'med_reviewer') {
        return apiError('reviewer-required', 403);
      }
      // 4-eye: proposer != reviewer
      const { data: existing, error: readErr } = await sb
        .from('tools')
        .select('updated_by, created_by, version')
        .eq('id', id)
        .maybeSingle();
      if (readErr) { console.error('[admin/tools] db error:', readErr.message); return apiError('database-error', 400); }
      if (existing?.updated_by && existing.updated_by === user.id) {
        return apiError('four-eye-violation', 409);
      }
      // SECURITY (stage-2 audit): do NOT spread `patch` here. Approve must
      // publish EXACTLY the row that was reviewed — applying client-supplied
      // `patch` at approve time let a reviewer inject unreviewed content into
      // a published medical calculator. Content edits go through
      // save / submit-review BEFORE approval.
      const { error } = await sb.from('tools').update({
        status: 'published',
        reviewed_by: user.id,
        reviewed_on: new Date().toISOString().slice(0, 10),
        ...meta,
      }).eq('id', id);
      if (error) { console.error('[admin/tools] db error:', error.message); return apiError('database-error', 400); }

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
      return apiOk();
    }

    if (action === 'archive') {
      if (role !== 'med_reviewer') {
        return apiError('reviewer-required', 403);
      }
      const { error } = await sb.from('tools').update({
        status: 'archived',
        ...meta,
      }).eq('id', id);
      if (error) { console.error('[admin/tools] db error:', error.message); return apiError('database-error', 400); }
      return apiOk();
    }

    return apiError('unknown-action', 400);
  });
}

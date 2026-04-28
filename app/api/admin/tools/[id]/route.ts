import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const patch = body.patch ?? {};

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

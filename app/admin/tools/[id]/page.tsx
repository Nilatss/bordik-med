import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ToolEditForm } from './ToolEditForm';

interface ToolFull {
  id: string;
  version: string;
  name: Record<string, string> | null;
  description: Record<string, string> | null;
  category: string;
  subcategory: string;
  countries: string | null;
  kind: 'calculator' | 'score' | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  has_runner: boolean;
  reviewed_by: string | null;
  reviewed_on: string | null;
  guideline_source: string | null;
  guideline_doi: string | null;
  created_at: string;
  updated_at: string;
}

export default async function AdminToolEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await getSupabaseServerClient();
  if (!sb) return <p>Backend not configured.</p>;

  const { data, error } = await sb
    .from('tools')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return (
      <div style={{
        padding: 24, background: '#FEE2E2', border: '1px solid #FECACA',
        borderRadius: 12, color: '#991B1B',
      }}>
        Ошибка: {error.message}
      </div>
    );
  }
  if (!data) notFound();

  const tool = data as ToolFull;

  // Recent audit history for this row.
  const { data: history } = await sb
    .from('audit.record_version')
    .select('ts, op, record, old_record')
    .eq('table_name', 'tools')
    .or(`record->>id.eq.${id},old_record->>id.eq.${id}`)
    .order('ts', { ascending: false })
    .limit(20)
    // Use defensive any-cast - audit schema isn't exposed in generated types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .returns<any[]>();

  // Current user role (from JWT app_metadata).
  // The admin layout already verified auth; this second call is for the role
  // only. Wrap in try/catch so a transient Supabase error doesn't crash the
  // server component — the layout's auth gate is the real guard.
  let role = '';
  try {
    const { data: { user } } = await sb.auth.getUser();
    role = (user?.app_metadata?.editor_role as string | undefined) ?? '';
  } catch {
    // auth service temporarily unreachable; layout already verified the
    // session so we can safely render with empty role (read-only view).
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <a href="/admin" style={{
          color: '#6B7280', textDecoration: 'none', fontSize: 13,
        }}>
          ← Назад к списку
        </a>
      </div>
      <ToolEditForm tool={tool} role={role} />

      <h2 style={{
        marginTop: 36, marginBottom: 12,
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
      }}>
        История изменений
      </h2>
      <div style={{
        background: '#FFFFFF', border: '1px solid #E5E7EB',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {!history || history.length === 0 ? (
          <p style={{ padding: 18, color: '#6B7280', margin: 0 }}>
            Записей аудита пока нет.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {history.map((h, i) => (
              <li key={i} style={{
                padding: '12px 18px',
                borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                display: 'flex', gap: 16, alignItems: 'center',
                fontSize: 13,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: '#9CA3AF', minWidth: 160,
                }}>
                  {new Date(h.ts).toLocaleString('ru')}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: h.op === 'INSERT' ? '#ECFDF5' : h.op === 'DELETE' ? '#FEE2E2' : '#FEF3C7',
                  color: h.op === 'INSERT' ? '#065F46' : h.op === 'DELETE' ? '#991B1B' : '#92400E',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  {h.op}
                </span>
                <span style={{ color: '#6B7280', flex: 1, minWidth: 0 }}>
                  {h.op === 'UPDATE' && h.record && h.old_record
                    ? buildDiffSummary(h.old_record, h.record)
                    : h.op === 'INSERT'
                      ? 'Создан'
                      : h.op === 'DELETE'
                        ? 'Удалён'
                        : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function buildDiffSummary(oldR: Record<string, unknown>, newR: Record<string, unknown>): string {
  const changed: string[] = [];
  for (const key of Object.keys(newR)) {
    if (key === 'updated_at' || key === 'updated_by') continue;
    const a = JSON.stringify(oldR[key]);
    const b = JSON.stringify(newR[key]);
    if (a !== b) changed.push(key);
  }
  if (changed.length === 0) return 'без изменений';
  return `изменены: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ` (+${changed.length - 5})` : ''}`;
}

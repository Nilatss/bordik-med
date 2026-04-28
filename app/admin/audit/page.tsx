import { getSupabaseServerClient } from '@/lib/supabase/server';

interface AuditRow {
  ts: string;
  op: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
  auth_uid: string | null;
}

export default async function AdminAuditPage() {
  const sb = await getSupabaseServerClient();
  if (!sb) return <p>Backend not configured.</p>;

  // Fetch the last 100 audit rows across all content tables. RLS allows
  // only med_reviewer / auditor to read this.
  const { data, error } = await sb
    .schema('audit')
    .from('record_version')
    .select('ts, op, table_name, record, old_record, auth_uid')
    .order('ts', { ascending: false })
    .limit(100)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .returns<any[]>();

  if (error) {
    return (
      <div style={{
        padding: 24, background: '#FEF3C7', border: '1px solid #FDE68A',
        borderRadius: 12, color: '#92400E',
      }}>
        {error.code === '42501' || /permission denied/i.test(error.message)
          ? 'Доступ к аудиту разрешён только ролям med_reviewer и auditor.'
          : `Ошибка загрузки аудита: ${error.message}`}
      </div>
    );
  }

  const rows = (data ?? []) as AuditRow[];

  return (
    <div>
      <h1 style={{
        margin: '0 0 8px',
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
      }}>
        Аудит-лог
      </h1>
      <p style={{
        margin: '0 0 20px', color: '#6B7280', fontSize: 13,
      }}>
        Последние 100 операций над контентными таблицами. Старше — через
        SQL-запрос к <code>audit.record_version</code>.
      </p>

      {rows.length === 0 ? (
        <p style={{ color: '#6B7280' }}>Записей пока нет.</p>
      ) : (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {rows.map((h, i) => {
              const recId = (h.record?.id ?? h.old_record?.id) as string | undefined;
              return (
                <li key={i} style={{
                  padding: '12px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                  display: 'grid', gridTemplateColumns: '180px 80px 180px 80px 1fr',
                  gap: 14, alignItems: 'center', fontSize: 13,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
                  }}>
                    {new Date(h.ts).toLocaleString('ru')}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: h.op === 'INSERT' ? '#ECFDF5' : h.op === 'DELETE' ? '#FEE2E2' : '#FEF3C7',
                    color: h.op === 'INSERT' ? '#065F46' : h.op === 'DELETE' ? '#991B1B' : '#92400E',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.04em', textAlign: 'center',
                  }}>
                    {h.op}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1A1A1A',
                  }}>
                    {h.table_name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6B7280',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {recId ?? '—'}
                  </span>
                  <span style={{ color: '#6B7280', minWidth: 0 }}>
                    {h.op === 'UPDATE' && h.record && h.old_record
                      ? buildDiff(h.old_record, h.record)
                      : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function buildDiff(oldR: Record<string, unknown>, newR: Record<string, unknown>): string {
  const changed: string[] = [];
  for (const key of Object.keys(newR)) {
    if (key === 'updated_at' || key === 'updated_by') continue;
    const a = JSON.stringify(oldR[key]);
    const b = JSON.stringify(newR[key]);
    if (a !== b) changed.push(key);
  }
  return changed.length === 0 ? '—' : changed.slice(0, 5).join(', ');
}

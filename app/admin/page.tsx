import { getSupabaseServerClient } from '@/lib/supabase/server';

interface ToolRow {
  id: string;
  version: string;
  name: Record<string, string> | null;
  category: string;
  subcategory: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  has_runner: boolean;
  updated_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft:     { bg: '#F3F4F6', fg: '#4B5563' },
  review:    { bg: '#FEF3C7', fg: '#92400E' },
  published: { bg: '#ECFDF5', fg: '#065F46' },
  archived:  { bg: '#FEE2E2', fg: '#991B1B' },
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  review: 'На проверке',
  published: 'Опубликован',
  archived: 'В архиве',
};

export default async function AdminToolsPage() {
  const sb = await getSupabaseServerClient();
  if (!sb) {
    return <p>Backend not configured.</p>;
  }

  const { data, error } = await sb
    .from('tools')
    .select('id, version, name, category, subcategory, status, has_runner, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    if (error.code === '42P01' /* relation does not exist */ || /relation .* does not exist/i.test(error.message)) {
      return (
        <div style={{
          padding: 24, background: '#FEF3C7', border: '1px solid #FDE68A',
          borderRadius: 12, color: '#92400E', lineHeight: 1.6,
        }}>
          <strong>Схема не применена.</strong>
          <p style={{ margin: '8px 0 0' }}>
            Запустите <code>supabase/content-schema.sql</code> в SQL Editor
            (или <code>supabase db push --include-all</code>). После этого
            таблица <code>tools</code> появится и эта страница покажет
            каталог редактируемого контента.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B7280' }}>
            Подробности: {error.message}
          </p>
        </div>
      );
    }
    return (
      <div style={{
        padding: 24, background: '#FEE2E2', border: '1px solid #FECACA',
        borderRadius: 12, color: '#991B1B',
      }}>
        Ошибка загрузки: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as ToolRow[];
  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

  return (
    <div>
      {/* Status summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['draft', 'review', 'published', 'archived'] as const).map((s) => {
          const palette = STATUS_COLORS[s];
          return (
            <div key={s} style={{
              padding: '12px 16px', borderRadius: 12,
              background: palette.bg, color: palette.fg,
              minWidth: 140,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
                opacity: 0.7,
              }}>
                {STATUS_LABEL[s]}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
              }}>
                {byStatus[s] ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{
            margin: 0, fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
          }}>
            Tools ({rows.length})
          </h2>
          <a href="/admin/tools/new" style={{
            padding: '7px 14px', borderRadius: 8,
            background: '#3B82F6', color: '#FFFFFF',
            textDecoration: 'none', fontWeight: 600, fontSize: 13,
          }}>
            + Новый
          </a>
        </div>
        {rows.length === 0 ? (
          <p style={{ padding: 24, color: '#6B7280', margin: 0 }}>
            Пока ни одного инструмента в БД. Импортируйте каталог через
            <code> scripts/import-content.mjs</code> или нажмите «Новый».
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', textAlign: 'left' }}>
                <th style={th}>ID</th>
                <th style={th}>Название</th>
                <th style={th}>Раздел</th>
                <th style={th}>Версия</th>
                <th style={th}>Статус</th>
                <th style={th}>Обновлено</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const palette = STATUS_COLORS[r.status] ?? STATUS_COLORS.draft;
                const title = r.name?.ru ?? r.name?.en ?? r.id;
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ ...td, fontFamily: 'var(--font-mono)', color: '#6B7280', fontSize: 12 }}>
                      {r.id}
                    </td>
                    <td style={{ ...td, fontWeight: 500 }}>{title}</td>
                    <td style={{ ...td, color: '#6B7280', fontSize: 13 }}>
                      {r.category} <span style={{ color: '#D1D5DB' }}>·</span> {r.subcategory}
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {r.version}
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 999,
                        background: palette.bg, color: palette.fg,
                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td style={{ ...td, color: '#6B7280', fontSize: 12 }}>
                      {new Date(r.updated_at).toLocaleString('ru')}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <a href={`/admin/tools/${encodeURIComponent(r.id)}`} style={{
                        color: '#3B82F6', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                      }}>
                        Открыть →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '10px 16px',
  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: '#6B7280',
};
const td: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14, color: '#1A1A1A',
};

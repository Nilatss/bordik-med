'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

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

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  review: 'На проверке',
  published: 'Опубликован',
  archived: 'В архиве',
};

/**
 * In-place editor for a single tool. Uses fetch to /api/admin/tools/[id]
 * for save + workflow transitions. Workflow buttons are conditionally
 * rendered based on the current user's role.
 */
export function ToolEditForm({ tool, role }: { tool: ToolFull; role: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [version, setVersion] = useState(tool.version);
  const [nameRu, setNameRu] = useState(tool.name?.ru ?? '');
  const [nameEn, setNameEn] = useState(tool.name?.en ?? '');
  const [nameUz, setNameUz] = useState(tool.name?.uz ?? '');
  const [descRu, setDescRu] = useState(tool.description?.ru ?? '');
  const [category, setCategory] = useState(tool.category);
  const [subcategory, setSubcategory] = useState(tool.subcategory);
  const [countries, setCountries] = useState(tool.countries ?? '');
  const [kind, setKind] = useState<'calculator' | 'score' | ''>(tool.kind ?? '');
  const [guidelineSource, setGuidelineSource] = useState(tool.guideline_source ?? '');
  const [guidelineDoi, setGuidelineDoi] = useState(tool.guideline_doi ?? '');

  const isReviewer = role === 'med_reviewer';
  const canEdit = role === 'med_editor' || role === 'med_reviewer';
  const canSave = canEdit && tool.status !== 'published';

  const submit = async (action: 'save' | 'submit-review' | 'approve' | 'archive') => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const r = await fetch(`/api/admin/tools/${encodeURIComponent(tool.id)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action,
            patch: {
              version,
              name: { ru: nameRu, en: nameEn, uz: nameUz },
              description: { ru: descRu },
              category,
              subcategory,
              countries: countries.trim() || null,
              kind: kind || null,
              guideline_source: guidelineSource.trim() || null,
              guideline_doi: guidelineDoi.trim() || null,
            },
          }),
        });
        const json = await r.json();
        if (!r.ok || !json.ok) {
          setError(json.error || `HTTP ${r.status}`);
          return;
        }
        setSuccess(
          action === 'save' ? 'Сохранено как черновик'
          : action === 'submit-review' ? 'Отправлено на проверку'
          : action === 'approve' ? 'Опубликовано'
          : action === 'archive' ? 'В архиве'
          : 'OK'
        );
        router.refresh();
      } catch (e) {
        setError((e as Error).message ?? String(e));
      }
    });
  };

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E5E7EB',
      borderRadius: 12, padding: 24,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
            letterSpacing: '0.04em',
          }}>
            ID: {tool.id} · Текущий статус
          </span>
          <h1 style={{
            margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          }}>
            {STATUS_LABEL[tool.status] ?? tool.status}
          </h1>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div style={{
          marginBottom: 14, padding: '10px 14px',
          background: '#FEE2E2', border: '1px solid #FECACA',
          borderRadius: 8, color: '#991B1B', fontSize: 13,
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          marginBottom: 14, padding: '10px 14px',
          background: '#ECFDF5', border: '1px solid #A7F3D0',
          borderRadius: 8, color: '#065F46', fontSize: 13,
        }}>
          {success}
        </div>
      )}

      {/* Fields */}
      <div style={{ display: 'grid', gap: 14 }}>
        <Row label="Версия (semver)">
          <input value={version} onChange={(e) => setVersion(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Название (RU)">
          <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Название (EN)">
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Название (UZ)">
          <input value={nameUz} onChange={(e) => setNameUz(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Описание (RU)">
          <textarea
            value={descRu}
            onChange={(e) => setDescRu(e.target.value)}
            disabled={!canSave}
            rows={3}
            style={{ ...input, resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-body)' }}
          />
        </Row>
        <Row label="Раздел">
          <input value={category} onChange={(e) => setCategory(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Подраздел">
          <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} disabled={!canSave} style={input} />
        </Row>
        <Row label="Страны (· как разделитель)">
          <input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            disabled={!canSave}
            placeholder="Международный (WHO) · США (FDA)"
            style={input}
          />
        </Row>
        <Row label="Тип">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as 'calculator' | 'score' | '')}
            disabled={!canSave}
            style={input}
          >
            <option value="">— не указано —</option>
            <option value="calculator">Калькулятор</option>
            <option value="score">Шкала</option>
          </select>
        </Row>
        <Row label="Источник (гайдлайн)">
          <input
            value={guidelineSource}
            onChange={(e) => setGuidelineSource(e.target.value)}
            disabled={!canSave}
            placeholder="ESC 2024 AF Guidelines"
            style={input}
          />
        </Row>
        <Row label="DOI">
          <input
            value={guidelineDoi}
            onChange={(e) => setGuidelineDoi(e.target.value)}
            disabled={!canSave}
            placeholder="10.1093/eurheartj/ehae176"
            style={input}
          />
        </Row>
      </div>

      {/* Workflow buttons */}
      <div style={{
        display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap',
        paddingTop: 18, borderTop: '1px solid #F3F4F6',
      }}>
        {canEdit && tool.status === 'draft' && (
          <button onClick={() => submit('save')} disabled={isPending} style={btnSecondary}>
            Сохранить черновик
          </button>
        )}
        {canEdit && tool.status === 'draft' && (
          <button onClick={() => submit('submit-review')} disabled={isPending} style={btnPrimary}>
            На проверку →
          </button>
        )}
        {isReviewer && tool.status === 'review' && (
          <>
            <button onClick={() => submit('save')} disabled={isPending} style={btnSecondary}>
              Сохранить
            </button>
            <button onClick={() => submit('approve')} disabled={isPending} style={btnApprove}>
              ✓ Опубликовать
            </button>
          </>
        )}
        {isReviewer && tool.status !== 'archived' && (
          <button onClick={() => submit('archive')} disabled={isPending} style={btnDanger}>
            В архив
          </button>
        )}
        {tool.status === 'published' && (
          <span style={{
            padding: '8px 14px',
            color: '#6B7280', fontSize: 12,
          }}>
            Опубликованные нельзя редактировать напрямую — создайте change request
            или сначала «снимите с публикации» (archive → новый draft).
          </span>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'start' }}>
      <span style={{
        paddingTop: 8,
        fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6B7280',
        letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      <span style={{ minWidth: 0 }}>{children}</span>
    </label>
  );
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#1A1A1A',
  outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8,
  background: '#3B82F6', color: '#FFFFFF',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};
const btnSecondary: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8,
  background: '#F3F4F6', color: '#1A1A1A',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};
const btnApprove: React.CSSProperties = {
  ...btnPrimary,
  background: '#10B981',
};
const btnDanger: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8,
  background: 'transparent', color: '#991B1B',
  border: '1px solid #FECACA', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
};

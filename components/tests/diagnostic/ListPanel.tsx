/**
 * ListPanel — bullet-list card for strengths / weaknesses в результате
 * адаптивного теста.
 *
 * P1-CR-3 step 2/6 — extracted from DiagnosticTest.tsx.
 *
 * Bordik palette: same #F5F6F8 surface for every card. Семантический
 * цвет (зелёный для сильных, янтарный для слабых) survives только как
 * bullet-point dot — enough signal без pastel-блока который clashes
 * с остальной платформой.
 */
export function ListPanel({ title, tone, items }: {
  title: string;
  tone: 'green' | 'amber';
  items: string[];
}) {
  const dotClass = tone === 'green' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]';
  return (
    <div className="py-[14px] px-4 bg-[#F5F6F8] rounded-[14px]">
      <p className="mt-0 mb-2.5 mx-0 font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.08em]">
        {title}
      </p>
      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2 font-[var(--font-body)] text-[13px] text-[#1A1A1A] leading-[1.45]">
            <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${dotClass}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

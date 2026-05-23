'use client';

import { useRef, useState, type ReactNode } from 'react';
import { log } from '@/lib/log';

interface Props {
  children: ReactNode;
  title?: string;
}

/**
 * "Download as PDF" button for reference tables.
 * Strategy: render a print-optimized HTML version of the table inside a hidden offscreen node,
 * rasterize it with html2canvas (keeps Montserrat + Cyrillic exactly as seen),
 * then embed into a jsPDF file and trigger download.
 */
export default function DownloadableTable({ children, title = 'Таблица' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!ref.current || busy) return;
    const originalTable = ref.current.querySelector('table');
    if (!originalTable) return;

    setBusy(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Build an offscreen printable wrapper with the exact fonts used by the app
      const date = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      const printable = document.createElement('div');
      printable.style.cssText = [
        'position: absolute',
        'left: -99999px',
        'top: 0',
        'width: 900px',
        'background: #FFFFFF',
        'padding: 36px 44px',
        "font-family: 'Montserrat Variable', 'Montserrat', 'Segoe UI', Arial, sans-serif",
        'color: #1A1A1A',
      ].join('; ');

      printable.innerHTML = `
        <div style="
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 12px; margin-bottom: 18px;
          border-bottom: 2px solid #1A1A1A;
        ">
          <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.01em;">Bordik</span>
          <span style="
            font-family: 'JetBrains Mono Variable', 'JetBrains Mono', 'Consolas', monospace;
            font-size: 10px; color: #9CA3AF;
            text-transform: uppercase; letter-spacing: 0.08em;
          ">${date}</span>
        </div>
        <h1 style="
          font-size: 22px; font-weight: 700; margin: 0 0 18px 0;
          letter-spacing: -0.01em; line-height: 1.25;
        ">${escapeHtml(title)}</h1>
      `;

      // Clone the table and style it for print
      const clone = originalTable.cloneNode(true) as HTMLTableElement;
      clone.style.cssText = [
        'width: 100%',
        'border-collapse: collapse',
        'font-size: 13px',
        'line-height: 1.5',
        'color: #1A1A1A',
      ].join('; ');

      // Style headers
      clone.querySelectorAll('thead th').forEach((el) => {
        (el as HTMLElement).style.cssText = [
          'text-align: left',
          'background: #F0F1F5',
          'padding: 12px 14px',
          'font-size: 10px',
          'font-weight: 700',
          'text-transform: uppercase',
          'letter-spacing: 0.08em',
          'color: #6B7280',
          'border-bottom: 2px solid #E5E7EB',
          "font-family: 'Montserrat Variable', 'Montserrat', 'Segoe UI', Arial, sans-serif",
        ].join('; ');
      });

      // Style body cells + zebra rows
      const bodyRows = clone.querySelectorAll('tbody tr');
      bodyRows.forEach((tr, rowIdx) => {
        (tr as HTMLElement).querySelectorAll('td').forEach((el, cellIdx) => {
          (el as HTMLElement).style.cssText = [
            'padding: 12px 14px',
            'border-bottom: 1px solid #EEF0F3',
            'vertical-align: top',
            cellIdx === 0 ? 'font-weight: 700; color: #1A1A1A;' : 'color: #333;',
            rowIdx % 2 === 1 ? 'background: #FAFBFC;' : '',
          ].join('; ');
        });
      });

      printable.appendChild(clone);

      const footer = document.createElement('div');
      footer.style.cssText = [
        'margin-top: 24px',
        'padding-top: 12px',
        'border-top: 1px solid #EEF0F3',
        'text-align: center',
        'font-size: 10px',
        'color: #9CA3AF',
        "font-family: 'JetBrains Mono Variable', 'JetBrains Mono', 'Consolas', monospace",
      ].join('; ');
      footer.textContent = 'Powered by Bordik · bordik.academy';
      printable.appendChild(footer);

      document.body.appendChild(printable);

      let canvas: Awaited<ReturnType<typeof html2canvas>>;
      try {
        // Wait a tick so fonts apply
        await new Promise((r) => setTimeout(r, 80));
        canvas = await html2canvas(printable, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          useCORS: true,
          logging: false,
        });
      } finally {
        // Always remove the offscreen element — even if html2canvas throws
        // (e.g. CORS error, canvas size limit) so we never leak DOM nodes.
        document.body.removeChild(printable);
      }

      // Build PDF: A4 portrait, fit the canvas preserving aspect ratio, paginate if needed
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - margin * 2) {
        // Fits on one page
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight
        );
      } else {
        // Paginate by slicing the canvas vertically
        const pageCanvasHeight = Math.floor(
          (canvas.width * (pageHeight - margin * 2)) / imgWidth
        );
        let srcY = 0;
        let pageIdx = 0;
        while (srcY < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - srcY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0, srcY,
              canvas.width, sliceHeight,
              0, 0,
              canvas.width, sliceHeight
            );
          }
          const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
          if (pageIdx > 0) pdf.addPage();
          pdf.addImage(
            sliceCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            margin,
            imgWidth,
            sliceImgHeight
          );
          srcY += sliceHeight;
          pageIdx++;
        }
      }

      // Transliterate Cyrillic → Latin for filename (better compatibility across OS/browsers)
      const translit = (s: string): string => {
        const map: Record<string, string> = {
          а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
          з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
          п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
          ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
        };
        return s
          .toLowerCase()
          .split('')
          .map((ch) => map[ch] ?? ch)
          .join('');
      };
      const safeName =
        'bordik-' +
        (translit(title)
          .replace(/[\\/:*?"<>|]/g, '')
          .replace(/[^a-z0-9\-\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80) || 'table');
      pdf.save(`${safeName}.pdf`);
    } catch (err) {
      // P2-NEW-12 — структурный лог через lib/log с redaction.
      log.error({
        event: 'pdf_generation_failed',
        message: (err as Error)?.message ?? String(err).slice(0, 200),
      });
      alert('Не удалось сгенерировать PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-[18px]">
      <div ref={ref}>
        {children}
      </div>
      <div className="flex justify-end mt-2.5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          title="Скачать таблицу как PDF"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F5F6F8] border border-[#E2E4EA] hover:border-[#D1D5DB] rounded-lg font-[var(--font-body)] text-xs font-semibold text-[#374151] transition-[background-color,border-color] duration-[180ms] ${
            busy ? 'cursor-wait opacity-60' : 'cursor-pointer opacity-100'
          }`}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {busy ? 'Генерация...' : 'Скачать PDF'}
        </button>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// components/InvoicePdfButton.tsx
'use client';

import { useRef } from 'react';

export default function InvoicePdfButton({ targetId = 'invoice-content', fileName = 'invoice.pdf' }) {
  const isLoadingRef = useRef(false);

  async function handleDownload() {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById(targetId);
      if (!element) throw new Error('Invoice content not found');
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: 'webp', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (err) {
      alert('Failed to generate PDF: ' + (err?.message || err));
    } finally {
      isLoadingRef.current = false;
    }
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={handleDownload}
    >
      Download PDF
    </button>
  );
}

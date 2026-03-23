/* ============================================
   FILE: DocumentActions.tsx
   PURPOSE: DocumentActions component
   DEPENDENCIES: react, lucide-react
   EXPORTS: DocumentActions (default)
   ============================================ */
/**
 * DocumentActions — Action buttons for the generated document
 *
 * FILE: components/DocumentActions.tsx
 * PURPOSE: Print, email, WhatsApp, copy, and PDF export actions.
 * DEPENDENCIES: lucide-react, pdfLetterService, officeProfile
 */
import { useState, useCallback } from 'react';
import { Printer, Mail, MessageSquare, ArrowRight, Edit, Copy, FileDown } from 'lucide-react';
import { generateLetterPdf } from '../../../services/pdfLetterService';
import { downloadBlob } from '../../../services/pdfFormService';
import { getActiveProfile } from '../../../data/officeProfile';

// #region Types

/** Props for DocumentActions */
interface Props {
  /** Generated document content (HTML) */
  documentContent: string;
  /** Document subject line */
  subject: string;
  /** Callback to go back to editor */
  onBackToEditor: () => void;
  /** Callback to start a new document */
  onNewDocument: () => void;
}

// #endregion

// #region Component

/**
 * Renders action buttons for printing, emailing, or sharing the generated document.
 *
 * @example
 * <DocumentActions documentContent={html} subject="..." onBackToEditor={f} onNewDocument={f} />
 */
export default function DocumentActions({ documentContent, subject, onBackToEditor, onNewDocument }: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);

  /** Print via new window */
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(getPrintHTML(documentContent, subject));
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  /** Email via mailto */
  const handleEmail = () => {
    const body = subject + '\n\n(ראה מסמך מצורף)';
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  /** WhatsApp share */
  const handleWhatsApp = () => {
    const text = `📄 ${subject}\n\n(מסמך מצורף — נשלח מ-המוח של אלדד)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  /** Copy content as text */
  const handleCopy = () => {
    const div = document.createElement('div');
    div.innerHTML = documentContent;
    navigator.clipboard.writeText(div.textContent || '').then(() => {
      alert('הטקסט הועתק ללוח!');
    });
  };

  /** Export as PDF with office letterhead */
  const handlePdfExport = useCallback(async () => {
    setPdfBusy(true);
    try {
      const profile = getActiveProfile();
      const div = document.createElement('div');
      div.innerHTML = documentContent;
      const plainText = div.textContent || '';
      const bodyLines = plainText.split('\n').filter(l => l.trim());

      const blob = await generateLetterPdf({
        recipientName: '',
        clientName: '',
        clientId: '',
        subject,
        bodyLines,
        profile,
      });
      downloadBlob(blob, `${subject || 'מסמך'}.pdf`);
    } catch (err) {
      alert('שגיאה ביצירת PDF: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setPdfBusy(false);
    }
  }, [documentContent, subject]);

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 10,
      justifyContent: 'center', padding: '20px 0',
    }}>
      <ActionButton
        icon={<FileDown size={18} />}
        label={pdfBusy ? 'מייצר...' : 'הפק PDF'}
        color="#a78bfa"
        onClick={handlePdfExport}
      />
      <ActionButton
        icon={<Printer size={18} />} label="הדפסה" color="#818cf8"
        onClick={handlePrint}
      />
      <ActionButton
        icon={<Mail size={18} />} label="שלח במייל" color="#60a5fa"
        onClick={handleEmail}
      />
      <ActionButton
        icon={<MessageSquare size={18} />} label="WhatsApp" color="#22c55e"
        onClick={handleWhatsApp}
      />
      <ActionButton
        icon={<Copy size={18} />} label="העתק טקסט" color="#f59e0b"
        onClick={handleCopy}
      />
      <ActionButton
        icon={<Edit size={18} />} label="חזרה לעריכה" color="#94a3b8"
        onClick={onBackToEditor}
      />
      <ActionButton
        icon={<ArrowRight size={18} />} label="מסמך חדש" color="#2dd4bf"
        onClick={onNewDocument}
      />
    </div>
  );
}

// #endregion

// #region Sub-components

/** Reusable styled action button */
function ActionButton({ icon, label, color, onClick }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 10, border: 'none',
        background: `${color}15`, color,
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
        boxShadow: `0 0 0 1px ${color}30`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}25`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `${color}15`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {icon} {label}
    </button>
  );
}

// #endregion

// #region Print Helpers

/**
 * Generates a complete HTML document for the print window.
 *
 * @param content — HTML content body
 * @param title — Document title / subject
 * @returns Complete HTML string
 */
function getPrintHTML(content: string, title: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700&display=swap');
  body { font-family: 'Heebo', sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
  @page { size: A4; margin: 15mm; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>${content}</body>
</html>`;
}

// #endregion

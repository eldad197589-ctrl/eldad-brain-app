/* ============================================
   FILE: printService.ts
   PURPOSE: Centralized print service — opens clean HTML in new window
            with header, footer, logo, RTL Hebrew for print/PDF.
            Uses table thead/tfoot trick for repeating headers/footers.
   DEPENDENCIES: agreementData
   EXPORTS: printAgreement, printGenericDocument
   ============================================ */

// #region Types

/** Options for printing a generic document */
interface PrintDocumentOptions {
  /** Document title (shown in browser tab + header) */
  title: string;
  /** HTML body content */
  bodyHtml: string;
  /** Optional subtitle under the title */
  subtitle?: string;
}

// #endregion

// #region Logo SVG

/** D&E logo as inline SVG string */
const LOGO_SVG = `
<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" style="height:80px;width:auto">
  <text x="12" y="62" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#c9a84c">D</text>
  <text x="48" y="44" font-family="Georgia, serif" font-size="32" fill="#c9a84c">&amp;</text>
  <text x="58" y="62" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#5b7fa5">E</text>
  <text x="60" y="82" text-anchor="middle" font-family="Heebo, sans-serif" font-size="10" fill="#5b7fa5">ניהול דוד אלדד רו"ח</text>
</svg>`;

// #endregion

// #region Print CSS

/** Full print-ready CSS — clean A4 layout with professional typography */
const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4; margin: 12mm 15mm 18mm 15mm; }

  body {
    font-family: 'Heebo', 'Rubik', sans-serif;
    direction: rtl;
    color: #1e293b;
    font-size: 11pt;
    line-height: 1.7;
    background: white;
    padding: 0;
  }

  /* === Header / Footer via table trick === */
  .print-wrapper { width: 100%; border-collapse: collapse; }
  .print-wrapper thead { display: table-header-group; }
  .print-wrapper tfoot { display: table-footer-group; }
  .print-wrapper tbody { display: table-row-group; }
  .print-wrapper td { padding: 0; border: none; }

  .page-header {
    padding: 0 0 8px 0;
    border-bottom: 3px solid #c9a84c;
    margin-bottom: 12px;
  }
  .page-header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-text { text-align: center; flex: 1; }
  .header-text h1 { font-size: 14pt; font-weight: 800; color: #1e3a5f; margin: 0; }
  .header-text .subtitle { font-size: 9pt; color: #64748b; margin-top: 2px; }

  .page-footer {
    padding: 8px 0 0 0;
    border-top: 2px solid #e2e8f0;
    font-size: 7.5pt;
    color: #94a3b8;
    text-align: center;
    line-height: 1.5;
  }
  .page-footer a { color: #5b7fa5; text-decoration: none; }

  /* === Document Title === */
  .doc-title { text-align: center; margin: 16px 0 20px; }
  .doc-title h2 { font-size: 18pt; font-weight: 900; color: #1e293b; margin: 0 0 4px; }
  .doc-title .doc-subtitle { font-size: 10pt; color: #64748b; }
  .doc-title .doc-date { font-size: 9pt; color: #94a3b8; margin-top: 4px; }

  /* === Sections === */
  .section { margin-bottom: 16px; break-inside: avoid; }
  .section-title {
    font-size: 13pt; font-weight: 800; color: #1e3a5f;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px; margin-bottom: 8px;
  }
  .sub-clause { margin-bottom: 6px; padding: 4px 8px; font-size: 10.5pt; line-height: 1.8; }
  .sub-clause-id { font-weight: 700; color: #4338ca; margin-left: 6px; font-size: 10pt; }
  .highlight-box {
    margin: 6px 0 10px 0; padding: 8px 12px;
    background: #fffbeb; border: 1px solid #f59e0b;
    border-right: 4px solid #f59e0b; border-radius: 4px;
    font-size: 10pt; color: #92400e; line-height: 1.7;
  }

  /* === Tables === */
  table.data-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
  table.data-table th {
    background: #f1f5f9; color: #374151; font-weight: 700;
    padding: 8px 12px; border: 1px solid #d1d5db; text-align: right;
  }
  table.data-table td { padding: 8px 12px; border: 1px solid #e5e7eb; color: #1e293b; }

  /* === Signatures === */
  .signatures { display: flex; justify-content: space-around; margin-top: 40px; break-inside: avoid; }
  .sig-box { text-align: center; width: 28%; }
  .sig-line { height: 50px; border-bottom: 1px solid #374151; margin-bottom: 8px; }
  .sig-name { font-weight: 700; font-size: 10pt; color: #1e293b; }
  .sig-role { font-size: 8pt; color: #64748b; }

  .parties { margin: 12px 0 16px; font-size: 10.5pt; line-height: 2; }
  .gold-line { height: 3px; background: linear-gradient(to left, #f59e0b, #fbbf24, #f59e0b); margin: 4px 0 16px; }

  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
`;

// #endregion

// #region HTML Builder

/**
 * Build a complete print-ready HTML document with header/footer on every page.
 * Uses the <table><thead>/<tfoot> trick for repeating headers/footers.
 */
function buildPrintHTML(options: PrintDocumentOptions): string {
  const today = new Date().toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <table class="print-wrapper">
    <thead>
      <tr><td>
        <div class="page-header">
          <div class="page-header-inner">
            <div>${LOGO_SVG}</div>
            <div class="header-text">
              <h1>ניהול דוד אלדד רו"ח</h1>
              <div class="subtitle">DAVID ELDAD CPA MANAGEMENT</div>
            </div>
          </div>
          <div class="gold-line"></div>
        </div>
      </td></tr>
    </thead>
    <tfoot>
      <tr><td>
        <div class="page-footer">
          סניף ראשל"צ | מאירוביץ 55 | טל': 03-9661234 | פקס: 077-9167711 |
          <a href="mailto:eldad@robium.net">eldad@robium.net</a><br>
          סניף אשקלון | ישפה 2 | ${today}
        </div>
      </td></tr>
    </tfoot>
    <tbody>
      <tr><td>
        <div class="doc-title">
          <h2>${options.title}</h2>
          ${options.subtitle ? `<div class="doc-subtitle">${options.subtitle}</div>` : ''}
          <div class="doc-date">תאריך: ${today}</div>
        </div>
        ${options.bodyHtml}
      </td></tr>
    </tbody>
  </table>

  <div class="no-print" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999">
    <button onclick="window.print()" style="
      padding:12px 32px;border-radius:10px;border:none;
      background:linear-gradient(135deg,#c9a84c,#f59e0b);color:white;
      font-family:Heebo,sans-serif;font-size:14px;font-weight:700;
      cursor:pointer;box-shadow:0 4px 20px rgba(201,168,76,0.4)">
      🖨️ שמור כ-PDF / הדפס
    </button>
  </div>
</body>
</html>`;
}

// #endregion

// #region Agreement Printer

/**
 * Opens a new window with the Founders Agreement formatted for print.
 * Pulls data from agreementData.ts and renders clean HTML.
 */
export function printAgreement(): void {
  import('./agreementData').then(({
    AGREEMENT_CLAUSES, EQUITY_TABLE, SIGNATURES,
  }) => {
    // Build parties section
    const partiesHtml = `
      <div class="parties">
        <strong>שנערך ונחתם ביום ___ בחודש ___ שנת 2026, בין הצדדים:</strong><br>
        1. <strong>אלדד דוד</strong>, ת.ז. 032263899 (להלן: "צד א'" או "אלדד");<br>
        2. <strong>קיריל יאקימנקו</strong>, ת.ז. 321271132 (להלן: "צד ב'" או "קיריל");<br>
        3. <strong>אהרוני שלחן אוסנת</strong>, ת.ז. 038230215 (להלן: "צד ג'" או "אוסנת");<br>
        <em>(כולם יקראו להלן: "המייסדים" או "השותפים").</em>
      </div>`;

    // Build clauses
    let clausesHtml = '';
    for (const clause of AGREEMENT_CLAUSES) {
      let subHtml = '';
      for (const sub of clause.subClauses) {
        if (sub.text) {
          const lines = sub.text.split('\\n').join('<br>');
          subHtml += `<div class="sub-clause">
            <span class="sub-clause-id">סעיף ${sub.id}</span>
            ${lines}
          </div>`;
        }
        if (sub.highlight) {
          subHtml += `<div class="highlight-box">💡 ${sub.highlight}</div>`;
        }
      }
      clausesHtml += `
        <div class="section">
          <div class="section-title">${clause.number}. ${clause.title}</div>
          ${subHtml}
        </div>`;
    }

    // Build equity table
    const equityHtml = `
      <div class="section">
        <div class="section-title">טבלת אחזקות</div>
        <table class="data-table">
          <thead>
            <tr><th>שם המייסד</th><th>אחוז אחזקה</th><th>תפקיד</th></tr>
          </thead>
          <tbody>
            ${EQUITY_TABLE.map(r => `<tr><td>${r.name}</td><td style="font-family:monospace;font-weight:700">${r.percent}</td><td>${r.role}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Build signatures
    const sigHtml = `
      <div class="signatures">
        ${SIGNATURES.map(s => `
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-name">${s.name}</div>
            <div class="sig-role">${s.role}</div>
          </div>`).join('')}
      </div>`;

    const bodyHtml = partiesHtml + clausesHtml + equityHtml + sigHtml;

    const html = buildPrintHTML({
      title: 'הסכם מייסדים (Founders Agreement)',
      subtitle: 'לייסוד חברת רוביום בע"מ ("Robium Ltd" / "רוביום בע"מ")',
      bodyHtml,
    });

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  });
}

// #endregion

// #region Generic Document Printer

/**
 * Opens a new window with any document content formatted for print.
 */
export function printGenericDocument(options: PrintDocumentOptions): void {
  const html = buildPrintHTML(options);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// #endregion

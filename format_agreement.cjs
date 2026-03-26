const fs = require('fs');
const path = require('path');

const originalPath = path.join(__dirname, 'public/legacy/robium_final_agreement.html');
const rawPath = path.join(__dirname, 'public/legacy/robium_agreement_updated.html');

const originalHtml = fs.readFileSync(originalPath, 'utf8');
let rawHtml = fs.readFileSync(rawPath, 'utf8');

// Extract header and footer from original
const header = originalHtml.substring(0, originalHtml.indexOf('<div class="date">'));
const footer = `
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-line"></div>
                <strong>אלדד דוד</strong>
                <div style="font-size: 0.9em; color: var(--secondary); margin-top: 5px;">M.Partner / CEO</div>
            </div>

            <div class="signature-box">
                <div class="signature-line"></div>
                <strong>קיריל יאקימנקו</strong>
                <div style="font-size: 0.9em; color: var(--secondary); margin-top: 5px;">CTO</div>
            </div>

            <div class="signature-box">
                <div class="signature-line"></div>
                <strong>אוסנת אהרוני שלחון</strong>
                <div style="font-size: 0.9em; color: var(--secondary); margin-top: 5px;">CRO / HR</div>
            </div>
        </div>
    </div>
</body>
</html>`;

// Optional: clean up the mammoth HTML to use proper headers instead of <p><strong>1.
rawHtml = rawHtml.replace(/<p><strong>(\d+[א-ת]?\.\s*.*?)<\/strong><\/p>/g, '<h2>$1</h2>');
rawHtml = rawHtml.replace(/<p><strong>(.*?שותפות לא רשומה.*?)<\/strong><\/p>/, '<h1>$1</h1>');
rawHtml = rawHtml.replace(/<p>(.*?רוביאום בע"מ.*?)<\/p>/, '<div class="subtitle">$1</div>');

// Remove the raw signature lines from mammoth
rawHtml = rawHtml.replace(/<p>_________________[\s\S]*?אוסנת אהרוני שלחון<\/p>/g, '');
rawHtml = rawHtml.replace(/<p><strong>ולראיה באו הצדדים על החתום<\/strong><\/p>/g, '');

const finalHtml = header + '\n<div class="date">תאריך: _________________</div>\n' + rawHtml + footer;

fs.writeFileSync(rawPath, finalHtml, 'utf8');
console.log('Successfully formatted the updated agreement!');

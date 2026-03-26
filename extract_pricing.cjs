import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

async function extractDocx(filePath) {
    try {
        console.log(`Extracting: ${path.basename(filePath)}`);
        const result = await mammoth.extractRawText({path: filePath});
        console.log(result.value.substring(0, 1500)); // Print first 1500 chars to read
        console.log('--- END OF DOC ---\n');
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    const dir = "c:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\smart bareau robium\\הצעות מחיר מעודכנות סופית 16.12.25";
    await extractDocx(path.join(dir, "מחירון.docx"));
    await extractDocx(path.join(dir, "שאלון הכר את הלקוח.docx"));
}

run();

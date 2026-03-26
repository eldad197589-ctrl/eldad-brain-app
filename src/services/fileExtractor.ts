/* ============================================
   FILE: fileExtractor.ts
   PURPOSE: Extract clean text from local files (PDF, DOCX, TXT, MD) in the browser
   DEPENDENCIES: pdfjs-dist, mammoth
   EXPORTS: extractTextFromFile
   ============================================ */
import * as pdfjsLib from 'pdfjs-dist';
// Vite uses ?url to get the URL of an asset
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extract clean text from a File object (from file input or File System Access API)
 * Supports: .txt, .md, .json, .docx, .pdf
 *
 * @param file - The HTML5 File object to read
 * @returns The extracted text as a string
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 1. Plain Text formats (TXT, MD, JSON, CSV)
  if (['txt', 'md', 'json', 'csv', 'html'].includes(extension || '')) {
    return await file.text();
  }

  // 2. Microsoft Word (DOCX)
  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (err) {
      console.error(`[FileExtractor] Failed to read docs ${file.name}:`, err);
      throw new Error(`Failed to read Word document: ${file.name}`);
    }
  }

  // 3. Document (PDF)
  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      // Loop through all pages and extract text
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Ensure items have 'str' property before mapping
        let pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
          
        // OCR FALLBACK FOR SCANNED PDFS
        // If the page string is empty, it's highly likely a scanned document.
        if (pageText.trim().length < 10) {
          console.log(`[FileExtractor] Empty text layer detected on ${file.name} page ${i}. Initializing OCR...`);
          try {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              
              // @ts-ignore
              await page.render(renderContext).promise;
              
              // Run Tesseract OCR in Hebrew and English
              const workerResult = await Tesseract.recognize(canvas, 'heb+eng');
              const ocrText = workerResult.data.text;
              
              if (ocrText && ocrText.trim().length > 0) {
                console.log(`[FileExtractor] OCR Success on page ${i}! Extracted ${ocrText.length} chars.`);
                pageText = ocrText;
              }
            } // end if(context)
          } catch (ocrErr: unknown) {
            console.error(`[FileExtractor] OCR failed on page ${i}:`, ocrErr);
            const ocrMsg = ocrErr instanceof Error ? ocrErr.message : String(ocrErr);
            throw new Error(`שגיאת סריקת תמונה (OCR): ${ocrMsg}`);
          }
        }

        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch (err) {
      console.error(`[FileExtractor] Failed to read PDF ${file.name}:`, err);
      throw new Error(`Failed to read PDF document: ${file.name}`);
    }
  }

  // Unsupported format
  throw new Error(`Unsupported file type: .${extension}`);
}

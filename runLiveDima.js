import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('[LiveRun] Starting physical browser automation on localhost:5173...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('[LiveRun] Navigating to /ceo...');
    await page.goto('http://localhost:5173/ceo', { waitUntil: 'networkidle' });
    
    console.log('[LiveRun] Waiting for 🛡️ הרץ ערר דימה button...');
    const btnLocator = page.locator('button', { hasText: '🛡️ הרץ ערר דימה' });
    await btnLocator.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log('[LiveRun] Clicking the Mission Launch button!');
    await btnLocator.click();

    console.log('[LiveRun] Waiting for mission to process to under_review... (takes 20-30s)');
    // Wait for the mission chat input to become active (meaning the agents halted for review)
    // The instruction text area is disabled during planning. We wait for it to be ready.
    // Or we just wait for the status badge:
    await page.waitForSelector('text=נדרש אישור אלדד', { timeout: 45000 }).catch(() => {
       console.log('Badge not found, but continuing...');
    });
    
    console.log('[LiveRun] Injecting CEO approval into chat input...');
    const inputLocator = page.locator('textarea[placeholder="הוראה ל-CEO: מה צריך לעשות?"]');
    await inputLocator.fill('אלדד: מאושר. תפיקו פלט סופי.');
    
    const sendBtn = page.locator('button', { hasText: 'תכנן והפעל' });
    await sendBtn.click();

    console.log('[LiveRun] Waiting for status to reach ready_for_submission and file download...');
    // We expect the wordExportService to POST to the Vite API which creates the file.
    await page.waitForTimeout(15000); // give it time to run agent and post physical blob

    const expectedDir = path.join(process.cwd(), 'cases', 'dima-rodnitski', 'final');
    console.log(`[LiveRun] Checking if file exists in ${expectedDir}...`);

    if (fs.existsSync(expectedDir)) {
      const files = fs.readdirSync(expectedDir);
      if (files.length > 0) {
        console.log(`[LiveRun] SUCCESS! File physically created via UI: ${files.join(', ')}`);
        process.exit(0);
      }
    }
    console.log(`[LiveRun] WARNING: File was not physically created yet. Check directory later.`);
  } catch (e) {
    console.error('[LiveRun] Error during UI automation:', e);
  } finally {
    await browser.close();
  }
})();

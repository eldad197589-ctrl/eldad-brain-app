/* ============================================
   FILE: caseHistory.ts
   PURPOSE: זיכרון לתיק — חיפוש מיילים קשורים ב-Gmail והעשרת CaseBundle
   DEPENDENCIES: ./client, ./auth, ./caseBundle,
                 ../../system/knowledge/warCompensationKnowledge (Knowledge Layer)
   EXPORTS: enrichCaseBundleWithHistory, findRelatedEmails
   ============================================ */
import { fetchGmailMessages } from './client';
import { getGmailToken } from './auth';
import type { CaseContext, CaseBundle, CaseMaterial } from './caseBundle';
import { WAR_COMP_WARS } from '../../system/knowledge/warCompensationKnowledge';

// #region Search Query Builder

/**
 * בונה query לחיפוש Gmail לפי הקשר תיק.
 * מחפש לפי שם לקוח + מילות מפתח רלוונטיות לסוג התיק.
 * @returns Gmail search query string
 */
function buildCaseSearchQuery(ctx: CaseContext): string {
  const parts: string[] = [];

  // שם לקוח — חובה
  if (ctx.clientName) {
    parts.push(`"${ctx.clientName}"`);
  }

  // מילות מפתח לפי סוג תיק
  const typeKeywords: Record<string, string> = {
    // Knowledge Layer — חיפוש מעמיק עם שמות מבצעים
    war_compensation_red_track: `(מסלול אדום OR פיצוי מלחמה OR נזק עקיף OR קרן הפיצויים OR ${WAR_COMP_WARS.map(w => w.name).join(' OR ')} OR ערר OR תגובה OR מכתב OR השלמת מסמכים)`,
    lawsuit: '(תביעה OR כתב הגנה OR בית משפט OR ערר)',
    appeal: '(ערר OR ערעור OR ועדת ערר OR החלטה)',
    tax_audit: '(שומה OR ביקורת OR דוח שנתי OR רשות המסים)',
    insurance_claim: '(ביטוח לאומי OR תביעה OR מסמכים)',
    penalty: '(קנס OR עיצום OR התראה OR ביטול)',
    regulatory: '(רשם OR חברות OR דיווח OR פרוטוקול)',
    client_request: '(בקשה OR מסמך OR ייפוי כוח)',
    general: '',
  };

  const kw = typeKeywords[ctx.caseType] || '';
  if (kw) parts.push(kw);

  // חיפוש בשנה האחרונה
  parts.push('newer_than:365d');

  return parts.join(' ');
}

// #endregion

// #region Find Related Emails

/**
 * מחפש מיילים קשורים לתיק ב-Gmail API.
 * אם אין token — חוזר ריק (לא שובר, לא מבקש login).
 * @returns רשימת CaseMaterial מתוך מיילים שנמצאו
 */
export async function findRelatedEmails(ctx: CaseContext): Promise<CaseMaterial[]> {
  // בדוק אם יש token — בלי לבקש login
  const token = getGmailToken();
  if (!token) {
    console.log('[CaseHistory] ⚠️ No Gmail token — skipping history search');
    return [];
  }

  if (!ctx.clientName) {
    console.log('[CaseHistory] ⚠️ No client name — cannot search history');
    return [];
  }

  const query = buildCaseSearchQuery(ctx);
  console.log(`[CaseHistory] 🔍 Searching Gmail: "${query.slice(0, 60)}..."`);

  try {
    const messages = await fetchGmailMessages(token, 15, query);

    const materials: CaseMaterial[] = messages.map(msg => {
      // זיהוי סוג: האם זה מייל שנשלח (from = me) או שהתקבל
      const isSent = /me|eldad|אלדד/i.test(msg.from);

      // זיהוי מכתב תגובה קודם (prior_response_letter)
      const isPriorResponse = isSent && /תגובה|מענה|re:|מכתב/i.test(msg.subject);

      let materialType: CaseMaterial['type'] = 'email';
      if (isPriorResponse) materialType = 'prior_response_letter';
      else if (isSent) materialType = 'sent_letter';

      return {
        id: `hist-${msg.id}`,
        type: materialType,
        title: msg.subject,
        date: msg.date,
        sourceRef: msg.id,
        snippet: msg.body.slice(0, 200),
        status: 'available' as const,
      };
    });

    const priorCount = materials.filter(m => m.type === 'prior_response_letter').length;
    const sentCount = materials.filter(m => m.type === 'sent_letter').length;
    const receivedCount = materials.filter(m => m.type === 'email').length;

    console.log(
      `[CaseHistory] 📚 Found ${materials.length} related emails ` +
      `(${priorCount} prior responses, ${sentCount} sent, ${receivedCount} received)`
    );

    return materials;
  } catch (err) {
    console.warn('[CaseHistory] ⚠️ Gmail search failed:', err);
    return [];
  }
}

// #endregion

// #region Bundle Enrichment

/**
 * מעשיר CaseBundle עם היסטוריית מיילים מ-Gmail.
 * נקרא רק כש-caseContext זוהה (legal_task, authority_request, etc.).
 * לא משנה את ה-classifier ולא את ה-router — רק מוסיף הקשר.
 *
 * @param bundle — התיק שנוצר
 * @param ctx — הקשר התיק שזוהה
 * @returns מספר חומרים חדשים שנוספו
 */
export async function enrichCaseBundleWithHistory(
  bundle: CaseBundle,
  ctx: CaseContext
): Promise<number> {
  const historicalMaterials = await findRelatedEmails(ctx);

  let added = 0;
  for (const material of historicalMaterials) {
    // dedup: לא להוסיף חומר שכבר קיים ב-bundle
    const exists = bundle.materials.some(
      m => m.sourceRef === material.sourceRef
    );
    if (!exists) {
      bundle.materials.push(material);
      added++;
    }
  }

  // עדכון missingItems: אם מצאנו מכתב שנשלח → אולי "כתב הגנה" כבר קיים
  if (added > 0) {
    updateMissingFromHistory(bundle, historicalMaterials);
  }

  console.log(
    `[CaseHistory] 📁 Bundle "${bundle.caseKey}" enriched: +${added} materials ` +
    `(total: ${bundle.materials.length}, missing: ${bundle.missingItems.length})`
  );

  return added;
}

/**
 * בדיקה: האם חומר שנמצא בהיסטוריה מכסה פריט מה-missingItems?
 */
function updateMissingFromHistory(bundle: CaseBundle, materials: CaseMaterial[]): void {
  const allText = materials.map(m => `${m.title} ${m.snippet}`).join(' ');

  const coveragePatterns: Record<string, RegExp> = {
    // lawsuit
    'כתב תביעה': /כתב תביעה/i,
    'כתב הגנה': /כתב הגנה/i,
    'ייפוי כוח': /ייפוי כ(ו|ו?)ח/i,
    'אסמכתאות': /אסמכת|מסמכים תומכים|ראיות/i,
    // appeal
    'החלטה מקורית': /החלטה|פסק דין/i,
    'נימוקי ערר': /נימוקי ערר|נימוקים/i,
    'מסמכים תומכים': /מסמכים|נספחים/i,
    // tax
    'דוח שנתי': /דו"?ח שנתי|דוח מס/i,
    'אישורי ניכוי': /אישור ניכוי|טופס 857|טופס 106/i,
    'הודעת קנס': /הודעת קנס|עיצום/i,
    // war_compensation_red_track
    'החלטת הרשות / המכתב שהתקבל': /החלטה|הודעה|מכתב.*רשות|רשות.*מכתב/i,
    'מכתב תגובה קודם': /תגובה|מענה|re:/i,
    'טיוטת ערר': /ערר|ערעור|טיוטה/i,
    'אסמכתאות תומכות': /אסמכת|מסמכים תומכים|ראיות|נספח/i,
    'חישובים / נתוני נזק': /חישוב|נזק|הפסד|פיצוי|סכום/i,
    'מסמכי לקוח רלוונטיים': /מסמכי לקוח|ייפוי כוח|זיהוי/i,
  };

  bundle.missingItems = bundle.missingItems.filter(item => {
    const pattern = coveragePatterns[item];
    if (pattern && pattern.test(allText)) {
      console.log(`[CaseHistory] ✅ Missing item resolved from history: "${item}"`);
      return false; // הוסר מהחסרים
    }
    return true; // עדיין חסר
  });
}

// #endregion

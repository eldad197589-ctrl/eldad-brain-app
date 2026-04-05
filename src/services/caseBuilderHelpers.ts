/* ============================================
   FILE: caseBuilderHelpers.ts
   PURPOSE: Helper functions for caseBuilder to normalize inputs and compute fields.
   DEPENDENCIES: ../data/caseTypes, ../services/emailClassifier,
                 ../integrations/gmail/caseBundle
   EXPORTS: normalizeEmails, normalizeDocuments, computeRiskFlags,
            computeMissingItems, computeStatus, computeTimeline,
            findCaseBundle, computeInitialDraft, deriveSuggestedBlocks
   ============================================ */
import type {
  CaseEmail, CaseDocument, CaseDocumentType,
  CaseProcessType, CaseStatus, CaseTimelineEvent, CaseDraft,
  SuggestedAttackBlock
} from '../data/caseTypes';
import { classifyEmail } from './emailClassifier';
import { identifyCaseContext, getAllBundles } from '../integrations/gmail/caseBundle';
import { generateAppealDraft } from '../integrations/gmail/draftGenerator';
import type { RawEmail, RawDocument, CaseSourceInput } from './caseBuilderTypes';
import { AttackPoint } from './decisionAttackEngine';

// #region Email Normalization

/**
 * Normalize raw emails → CaseEmail[] with classification.
 * Sorted by date descending (newest first).
 */
export function normalizeEmails(rawEmails: RawEmail[]): CaseEmail[] {
  return rawEmails
    .map(raw => {
      const cls = classifyEmail(raw.from, raw.subject);
      const email: CaseEmail = {
        id: raw.id,
        from: raw.from,
        to: raw.to,
        cc: raw.cc || '',
        subject: raw.subject,
        date: raw.date,
        snippet: raw.snippet,
        classification: {
          category: cls.category,
          confidence: cls.confidence,
          isWork: cls.isWork,
        },
      };
      return email;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

// #endregion

// #region Document Normalization

/** Auto-classify document type from filename */
function classifyDocType(fileName: string): CaseDocumentType {
  const lower = fileName.toLowerCase();
  if (/נימוקי?\s*החלטה|מכתב\s*החלטה/i.test(fileName)) return 'decision_document';
  if (/מכתב\s*רשמי/i.test(fileName)) return 'response_letter';
  if (/רישיון/i.test(fileName)) return 'license';
  if (/חישוב|הפסד/i.test(fileName)) return 'calculation';
  if (/ספר\s*עסקאות|חשבונית/i.test(fileName)) return 'business_records';
  if (/בקשה.*מסמכים|השלמת\s*מסמכים/i.test(fileName)) return 'request_letter';
  if (/scan|סריקה/i.test(lower)) return 'supporting_scan';
  return 'other';
}

/** Auto-generate description from filename */
function generateDescription(fileName: string, type: CaseDocumentType): string {
  const DESC_MAP: Partial<Record<CaseDocumentType, string>> = {
    decision_document: 'מסמך החלטה / נימוקי דחייה',
    response_letter: 'מכתב תגובה רשמי',
    license: 'רישיון / אישור מקצועי',
    calculation: 'חישוב / טבלת נתונים',
    business_records: 'רישום עסקי / ספר עסקאות',
    request_letter: 'בקשת השלמת מסמכים מהרשות',
    supporting_scan: 'סריקה תומכת',
    attachment: 'נספח',
  };
  return DESC_MAP[type] || `קובץ: ${fileName}`;
}

/**
 * Normalize raw documents → CaseDocument[].
 * Auto-classify type and generate description if not provided.
 */
export function normalizeDocuments(rawDocs: RawDocument[]): CaseDocument[] {
  return rawDocs.map((raw, idx) => {
    const type = raw.type || classifyDocType(raw.fileName);
    const description = raw.description || generateDescription(raw.fileName, type);
    return {
      id: `doc-${String(idx + 1).padStart(2, '0')}`,
      fileName: raw.fileName,
      type,
      description,
      source: raw.source,
      relativePath: raw.relativePath,
      wasSubmitted: raw.wasSubmitted ?? false,
      submissionDate: raw.submissionDate,
    };
  });
}

// #endregion

// #region Computed Fields

/** Compute risk flags from sources */
export function computeRiskFlags(
  input: CaseSourceInput,
  emails: CaseEmail[],
  documents: CaseDocument[],
): string[] {
  const flags: string[] = [];

  // Deadline proximity
  const daysLeft = Math.ceil(
    (new Date(input.deadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 60) {
    flags.push(`דדליין ערר: ${daysLeft} ימים (${input.deadline})`);
  }

  // Use caseBundle's identifyCaseContext for deeper risk signals
  const contextEmails = emails.slice(0, 5);
  for (const email of contextEmails) {
    const ctx = identifyCaseContext(email.from, email.subject, email.snippet);
    if (ctx.confidence > 50 && ctx.matchedSignals.length > 0) {
      // Found a strong signal — check if decision was ignored
      if (/החלטה|דחייה|נימוקי/i.test(email.subject)) {
        const hasResponseLetter = documents.some(d => d.type === 'response_letter' && d.wasSubmitted);
        if (hasResponseLetter) {
          flags.push('ההחלטה התעלמה ממכתב תגובה שנשלח');
        }
      }
      break; // one context check is enough
    }
  }

  // Incomplete submission — some docs exist but weren't submitted
  const unsubmitted = documents.filter(d => !d.wasSubmitted && d.type !== 'supporting_scan');
  if (unsubmitted.length > 0 && documents.some(d => d.wasSubmitted)) {
    flags.push(`${unsubmitted.length} מסמכים טרם הוגשו`);
  }

  // Legal precedent flag for war compensation appeals
  if (input.processType === 'war_compensation_appeal') {
    flags.push('ההחלטה לא התייחסה לפסיקה (ע"א 749/87)');
  }

  return flags;
}

/** Compute missing items based on processType and existing docs */
export function computeMissingItems(
  processType: CaseProcessType,
  documents: CaseDocument[],
): string[] {
  const missing: string[] = [];
  const docTypes = new Set(documents.map(d => d.type));

  if (processType === 'war_compensation_appeal') {
    // Expert CPA opinion is always recommended for appeals
    if (!docTypes.has('other')) {
      missing.push('חוות דעת רו"ח מומחה (אופציונלי — חיזוק)');
    }
  }

  if (processType === 'tax_audit') {
    if (!docTypes.has('calculation')) missing.push('חישובי מס');
    if (!docTypes.has('business_records')) missing.push('ספרי חשבונות');
  }

  return missing;
}

/** Compute status from document state and deadline */
export function computeStatus(
  documents: CaseDocument[],
  deadline: string,
): CaseStatus {
  const allSubmitted = documents.length > 0 && documents.every(d => d.wasSubmitted);
  if (allSubmitted) return 'submitted';

  const daysLeft = Math.ceil(
    (new Date(deadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return 'closed';

  const hasSubmissions = documents.some(d => d.wasSubmitted);
  if (hasSubmissions) return 'reviewing';

  return 'collecting';
}

/** Compute timeline from emails, documents, and deadlines */
export function computeTimeline(
  emails: CaseEmail[],
  documents: CaseDocument[],
  deadline: string,
): CaseTimelineEvent[] {
  const events: CaseTimelineEvent[] = [];

  // 1. Emails
  emails.forEach(e => {
    const isSent = e.from.includes('eldad197589@gmail.com');
    events.push({
      id: `ev-email-${e.id}`,
      date: e.date,
      type: isSent ? 'email_sent' : 'email_received',
      description: `מייל: ${e.subject}`,
    });
  });

  // 2. Submitted Documents
  documents.filter(d => d.wasSubmitted && d.submissionDate).forEach(d => {
    events.push({
      id: `ev-doc-${d.id}`,
      date: d.submissionDate!,
      type: 'document_submitted',
      description: `הגשת מסמך: ${d.description}`,
    });
  });

  // 3. Decisions Received
  documents.filter(d => d.type === 'decision_document' && d.source === 'local_folder').forEach((d, idx) => {
    events.push({
      id: `ev-dec-${idx}`,
      date: d.submissionDate || '2026-02-25', // Fallback for Dima's case if date is missing
      type: 'decision_received',
      description: `קבלת החלטה: ${d.description}`,
    });
  });

  // 4. Deadline
  events.push({
    id: 'ev-deadline',
    date: deadline,
    type: 'deadline',
    description: 'מועד אחרון לפעולה',
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

/** Extract matching caseBundle if exists */
export function findCaseBundle(clientName: string) {
  const bundles = getAllBundles();
  const normalizedClient = clientName.trim().split(' ')[0]; // Match logic
  return bundles.find(b => b.clientName.includes(normalizedClient)) || undefined;
}

/** Compute a basic draft if there's enough context */
export function computeInitialDraft(
  processType: CaseProcessType,
  documents: CaseDocument[],
  attackMap?: AttackPoint[],
): CaseDraft | null {
  if (processType === 'war_compensation_appeal') {
    const hasDecision = documents.some(d => d.type === 'decision_document');
    // Existing authored response has priority:
    const eldadResponse = documents.find(d => d.type === 'response_letter');
    
    // Require at least a decision document or a response letter
    if (!hasDecision && !eldadResponse) {
      return null;
    }
    
    // Sufficiency check:
    let warning: string | null = null;
    const status: 'draft' | 'under_review' | 'approved_by_eldad' | 'ready_for_submission' = 'draft';

    if (eldadResponse) {
      warning = 'נדרש עיבוי מטיעון קיים של אלדד';
    }

    // Derive suggested blocks from attackMap if available
    const suggestedBlocks = attackMap ? deriveSuggestedBlocks(attackMap) : undefined;

    // === BUILD BODY FROM BLOCKS (when authored responses exist) ===
    const allAuthored = suggestedBlocks && suggestedBlocks.length > 0 &&
      suggestedBlocks.every(b => b.source === 'authored_response');

    let body: string;
    let templateType: string;

    if (allAuthored && suggestedBlocks) {
      // Build real body from 5 authored blocks — zero placeholders
      body = buildBodyFromBlocks(suggestedBlocks);
      templateType = 'war_compensation_appeal';
    } else {
      // Fallback: generic template (for cases without authored responses)
      const rawDraft = generateAppealDraft(
        'החלטת רשות המסים — מסלול אדום',
        new Date().toISOString(),
        null,
        'war_compensation_red_track'
      );
      body = rawDraft.body;
      templateType = rawDraft.templateType;
    }
    
    return {
      templateType,
      subject: 'ערר על החלטה — פיצוי מלחמה מסלול אדום — בקשה מס׳ 58749955',
      body,
      status,
      sufficiencyWarning: warning,
      suggestedBlocks,
      createdAt: new Date().toISOString(),
    };
  }
  
  return null;
}

/**
 * Builds a complete professional appeal body (v5 structure).
 * 8 sections: header, intro, normative, factual, evidence, defects, claims, relief.
 * Block counter-arguments are woven into section ו (discussion of claims).
 */
function buildBodyFromBlocks(blocks: SuggestedAttackBlock[]): string {
  // === section ו: build from blocks dynamically ===
  const claimsDiscussion = blocks.map((block, i) => {
    const num = i + 1;
    return `טענת הרשות ${num}:\n${block.authorityClaim}\n\nהמענה שלנו:\n${block.counterArgument}`;
  }).join('\n\n');

  return `לכבוד
ועדת הערר
קרן הפיצויים — מס רכוש וקרן פיצויים
רשות המסים בישראל

הנדון: ערר על החלטת דחייה מיום 25.02.2026
מספר בקשה: 58749955
המערער: דימה רודניצקי
המייצג: דוד אלדד, רו"ח — מייצג מורשה


א. פתח דבר

מר דימה רודניצקי הוא מתווך נדל"ן מורשה הפועל מאשקלון. ביום 25.02.2026 נדחתה בקשתו לפיצוי במסלול האדום, על אף שמלוא המסמכים הנדרשים הוגשו במועד.

הערר שלפניכם מבקש לבחון מחדש את ההחלטה, מהנימוקים הבאים:
1. ההחלטה התעלמה מראיות מהותיות שהוגשו לתיק.
2. ההחלטה נשענה על קביעה עובדתית שגויה — שעסקת רחוב התלמוד "יצאה לפועל" — בעוד שבפועל עסקת המכירה בוטלה, ומה שהתקיים הייתה השכרה נפרדת.
3. ההחלטה לא הפרידה בין שתי עסקאות עצמאיות ושונות.
4. ההליך פגום: ההחלטה הקדימה את עצמה, ונומקה ב"אי הגעה להסכמות" — שאינה עילת דחייה בדין.
5. הקשר הסיבתי בין המלחמה למניעת הפעילות העסקית של מתווך מקומי באשקלון — ישיר, מתועד, ואינו ניתן לעקיפה.

סכום הנזק הנתבע: 77,080 ₪ כולל מע"מ.


ב. המסגרת הנורמטיבית

הערר מוגש מכוח חוק מס רכוש וקרן פיצויים, תשכ"א–1961, ותקנות מס רכוש וקרן פיצויים (תשלום פיצויים) (נזק מלחמה ונזק עקיף), התשע"ד–2014, כפי שתוקנו בעקבות מבצע "חרבות ברזל".

המסלול האדום נועד לפצות עוסקים ביישובי ספר שנפגעו מהלחימה. תנאי הזכאות:
- תושבות או מיקום עסק ביישוב ספר מוכרז
- פעילות עסקית לפני פרוץ המלחמה
- נזק עקיף — ירידת הכנסות, אובדן עסקאות, או מניעת פעילות בשל הלחימה

עיר אשקלון הוכרזה כיישוב ספר בתקופת מבצע "חרבות ברזל".

לעניין הקשר הסיבתי — ההלכה הפסוקה קובעת כי המבחן הוא אובייקטיבי-כלכלי:
ע"א 749/87 מוסך המרכז בע"מ נ' צרפתי — יש לבחון את שאלת ביטול העסקאות בימי אבל במלחמה על פי מבחן "האדם הסביר" ולא לפסול עסקאות רק משום מניע פנימי או סיבה סובייקטיבית שללקוח הייתה בנוסף טרגדיה. המבחן הכלכלי גובר: אדם סביר אכן היה נמנע מקיום עסקת נדל"ן בעיר מופגזת תחת מניעה צבאית.


ג. הרקע העובדתי

מר דימה רודניצקי, תושב אשקלון, מתווך נדל"ן מורשה מאז 19.3.2014 (ותק של למעלה מ-12 שנה). משרדו ממוקם באשקלון. לקוחותיו — קונים, מוכרים ושוכרים בעיר.

בשנת 2023, מר רודניצקי עבר משכיר לעצמאי. עסק התיווך נפתח בחודש ספטמבר 2023 — שבועות ספורים בלבד לפני פרוץ המלחמה. בחודש הראשון של הפעילות העצמאית נוצרה הכנסה שהמעידה על מהלך עסקים רגיל טרם הלחימה.

עסקה א' — רחוב התלמוד, אשקלון (עסקת מכירה)
מר רודניצקי תיווך בעסקת מכירת נכס ברחוב התלמוד. חשבונית מס מספר 1001 הוצאה ביום 21.9.2023 בגין עמלת תיווך על עסקה זו (מול הלקוח נרשם אלכס תיווך ע.מ. 310574769). העסקה התבטלה לאור פרוץ המלחמה. העמלה הצפויה על ביצועה המלא עמדה על: 51,480 ₪ כולל מע"מ.
מה שהרשות מזהה כ"עסקה שיצאה לפועל" בנובמבר 2023 הייתה השכרה שביצע הבעלים לאחר ביטול עסקת המכירה — השכרה שלדימה לא היה בה יד והוא לא תיווך בה.

עסקה ב' — רחוב האצ"ל 40, אשקלון (עסקה נפרדת)
עסקה נפרדת ועצמאית בנכס שונה לחלוטין. בעסקה זו דימה ליווה לקוחות שונים. המגעים הבשילו לכדי סגירה והעסקה הייתה בסף חתימה לפני ה-07.10. העמלה הצפויה: 25,600 ₪ כולל מע"מ.

הוראות פיקוד העורף והשיתוק העסקי
עסקת תיווך נדל"ן מחייבת נוכחות פיזית בנכסים באשקלון ופגישות במשרד. בשל הוראות הרשויות המאיימות והמגבילות באשקלון בחודשים דנן — נמנעה כל אפשרות חוקית ואנכית להמשך הליכים אלו, ולכן העסקאות שותקו.


ד. התשתית הראייתית והחישוב

סכום המניעה והנזק הנתבע:
עמלת תיווך — רחוב התלמוד (מכירה שבוטלה): 51,480 ₪ כולל מע"מ
עמלת תיווך — רחוב האצ"ל 40 (עסקה שנמנעה): 25,600 ₪ כולל מע"מ
סה"כ נזק עקיף מוכח במסלול האדום: 77,080 ₪ כולל מע"מ
(כמפורט בתחשיב הנספח מיום 28.08.2025)

ראיות שהוגשו כדין:
1. רישיון מתווך מקורי (19.3.2014) — הוכחת ותק 12 שנה.
2. רישיון מתווך מחודש (2025) — עסק פעיל ורציף.
3. חישוב הפסד מלחמת חרבות ברזל (XLS).
4. ספר עסקאות ליום 21.9.23.
5. מכתב תגובה רשמי (7 סעיפים) — מענה מלא לכל דרישות המפקחת, הוגש ביום 04.12.2025.


ה. פגמים בהחלטת הרשות

ה.1 — חריגה מסמכות ואי מתן משקל לראיות
ביום 08.02.2026 הודיעה המפקחת כי "לא הצלחנו להגיע להסכמות". נזכיר - ההליך המנהלי אינו מותנה ב"הסכמה". חלה על המפקח חובה לדון בראיות המוצגות. ההחלטה התעלמה כליל מחישוב ההפסד ומתיעוד הלקוח ("אלכס") שבספר העסקאות, תוך הפרה של חובת ההנמקה וההלכה. עקרון קטיף עצמו דורש עיון ולא דחייה על הסף.

ה.2 — טענה חלופית — מסלול מחזורים
למען הזהירות בלבד, יודגש כי גם לו באופן תיאורטי היה נשלל תוקפן של העסקאות הספציפיות, לאור העובדה שהעסק פועל באזור ספר ואבדה לו הכנסה, הוא מקיים זכאות לפחות לחלופת "מסלול מחזורים" נוכח הירידה המוחלטת במחזור בין התקופות הרלוונטיות. אנו עומדים על עקרון המסלול האדום, אך מזכירים חובה זו של הקופה הציבורית.


ו. מענה משפטי-עובדתי לטענות הרשות

${claimsDiscussion}


ז. סיכום וסעד מבוקש

קשר סיבתי מוצק וברור בין השיתוק שנכפה על העיר אשקלון לנזקי העוסק מר רודניצקי גובש אמש על בסיס עובדות, חשבוניות ומבחני אדם סביר.
כלל עילות הדחייה נסתרו במסמכים.

סעד מבוקש:
1. ועדת הערר מתבקשת לבטל ההחלטה השגויה מיום 25.02.2026.
2. לאשר את קבלת התביעה באופן מלא בסך: 77,080 ₪ כולל מע"מ.
3. לאשר תשלום נסיבות כמתחייב.

בכבוד רב,
דוד אלדד, רו"ח
מייצג מורשה`;
}

/**
 * Derives SuggestedAttackBlocks from attackMap.
 * Filters out missing_evidence — only actionable points become blocks.
 * All blocks start with includeInDraft = false (manual selection by Eldad).
 */
export function deriveSuggestedBlocks(attackMap: AttackPoint[]): SuggestedAttackBlock[] {
  return attackMap
    .filter(p => p.strengthLevel !== 'missing_evidence')
    .map((p, idx) => ({
      id: `sab-${String(idx + 1).padStart(2, '0')}`,
      authorityClaim: p.authorityClaim,
      counterArgument: p.counterArgument,
      supportingEvidence: p.supportingEvidence,
      strengthLevel: p.strengthLevel as 'strong' | 'medium' | 'weak',
      includeInDraft: false,
      source: p.source,
      authoredArgumentId: p.authoredArgumentId,
    }));
}

// #endregion

/* ============================================
   FILE: caseBundle.ts
   PURPOSE: ניהול תיקים מבוסס-חומר — caseBundle: איסוף, זיהוי, סיכום, ורק אז ניסוח
   DEPENDENCIES: ./classificationTypes, ./draftGenerator,
                 ../../system/knowledge/warCompensationKnowledge (Knowledge Layer)
   EXPORTS: CaseBundle, CaseBundleStatus, CaseMaterial, CaseContext,
            identifyCaseContext, createOrUpdateBundle, getAllBundles,
            advanceBundleStatus, generateCaseSummary
   ============================================ */
import { generateResponseDraft, generateAppealDraft } from './draftGenerator';
import type { DraftResult } from './draftGenerator';
import { WAR_COMP_REQUIRED_MATERIALS, WAR_COMP_DEADLINES, WAR_COMP_SANCTIONS, WAR_COMP_APPEAL_RULES } from '../../system/knowledge/warCompensationKnowledge';

// #region Types

/** סטטוס תיק */
export type CaseBundleStatus =
  | 'case_review_required'
  | 'case_bundle_ready'
  | 'draft_response_ready';

/** סוג תיק */
export type CaseType =
  | 'lawsuit'
  | 'war_compensation_red_track'
  | 'appeal'
  | 'tax_audit'
  | 'insurance_claim'
  | 'penalty'
  | 'client_request'
  | 'regulatory'
  | 'general';

/** חומר בתיק */
export interface CaseMaterial {
  id: string;
  type: 'email' | 'sent_letter' | 'attachment' | 'local_file' | 'court_doc' | 'prior_response_letter';
  title: string;
  date: string;
  /** מקור: gmail message id, file path, etc. */
  sourceRef: string;
  /** תקציר קצר */
  snippet: string;
  /** קיים או חסר */
  status: 'available' | 'missing' | 'referenced';
}

/** הקשר תיק שזוהה ממייל */
export interface CaseContext {
  clientName: string | null;
  caseType: CaseType;
  topic: string;
  relatedCaseKey: string | null;
  confidence: number;
  matchedSignals: string[];
}

/** חבילת תיק מלאה */
export interface CaseBundle {
  id: string;
  clientName: string;
  caseType: CaseType;
  topic: string;
  caseKey: string;
  status: CaseBundleStatus;
  materials: CaseMaterial[];
  missingItems: string[];
  /** Knowledge Layer — דגלי סיכון שזוהו משכבת הידע */
  riskFlags: string[];
  /** Knowledge Layer — האם דרוש review אנושי */
  requiresHumanReview: boolean;
  /** סיבת ה-review (אם נדרש) */
  reviewReason: string | null;
  /** מידע על deadlines רלוונטיים */
  deadlineWarning: string | null;
  summary: string | null;
  responseDraft: DraftResult | null;
  appealDraft: DraftResult | null;
  createdAt: string;
  updatedAt: string;
}

// #endregion

// #region Case Identification

/** מילות מפתח לזיהוי סוג תיק — סדר חשוב! ספציפי לפני כללי */
const CASE_TYPE_SIGNALS: { pattern: RegExp; type: CaseType; label: string }[] = [
  // מסלול אדום / פיצוי מלחמה — חייב להיות לפני lawsuit כללי
  { pattern: /מסלול אדום|פיצוי מלחמה|נזק עקיף|חרבות ברזל|iron swords|war.?compensation/i, type: 'war_compensation_red_track', label: 'פיצוי מלחמה — מסלול אדום' },
  // Knowledge Layer — מבצעים נוספים
  { pattern: /עם כלביא|im.?kalbia/i, type: 'war_compensation_red_track', label: 'פיצויים — מבצע עם כלביא' },
  { pattern: /שאגת הארי/i, type: 'war_compensation_red_track', label: 'הקלות — שאגת הארי' },
  { pattern: /צוק איתן|protective.?edge/i, type: 'war_compensation_red_track', label: 'פיצוי מלחמה — צוק איתן' },
  { pattern: /תביעה|lawsuit|claim/i, type: 'lawsuit', label: 'תביעה' },
  { pattern: /ערר|ערעור|appeal/i, type: 'appeal', label: 'ערר/ערעור' },
  { pattern: /ביקורת מס|שומה|tax audit/i, type: 'tax_audit', label: 'ביקורת מס' },
  { pattern: /ביטוח לאומי|תביעת ביטוח/i, type: 'insurance_claim', label: 'ביטוח' },
  { pattern: /קנס|עיצום|penalty|fine/i, type: 'penalty', label: 'קנס/עיצום' },
  { pattern: /רשם החברות|רגולטור|regulatory/i, type: 'regulatory', label: 'רגולציה' },
  { pattern: /לקוח|client|בקשת/i, type: 'client_request', label: 'בקשת לקוח' },
];

/** ביטויי שם לקוח מתוך subject */
const CLIENT_PATTERNS = [
  /(?:תיק|עניין|לקוח|נגד|vs\.?)\s*:?\s*([א-ת\w]{2,30}(?:\s[א-ת\w]{2,30}){0,3})/i,
  /(?:בעניין|re:?)\s*:?\s*([א-ת\w]{2,30}(?:\s[א-ת\w]{2,30}){0,3})/i,
];

/**
 * מנסה לזהות הקשר תיק ממייל.
 * @returns CaseContext עם שם לקוח, סוג, נושא, ומפתח תיק
 */
export function identifyCaseContext(
  from: string, subject: string, body: string
): CaseContext {
  const fullText = `${subject} ${body}`;
  const signals: string[] = [];

  // זיהוי סוג תיק
  let caseType: CaseType = 'general';
  for (const sig of CASE_TYPE_SIGNALS) {
    if (sig.pattern.test(fullText)) {
      caseType = sig.type;
      signals.push(`type: ${sig.label}`);
      break;
    }
  }

  // זיהוי שם לקוח
  let clientName: string | null = null;
  for (const p of CLIENT_PATTERNS) {
    const m = fullText.match(p);
    if (m && m[1].trim().length >= 2) {
      clientName = m[1].trim();
      signals.push(`client: ${clientName}`);
      break;
    }
  }
  // Fallback: מ-from
  if (!clientName) {
    const fromName = from.match(/^([^<@]+)/);
    if (fromName && fromName[1].trim().length >= 3) {
      clientName = fromName[1].trim();
    }
  }

  // נושא
  const topic = subject.slice(0, 80);

  // מפתח תיק — שם לקוח + סוג
  const caseKey = clientName
    ? `${clientName.replace(/\s+/g, '_')}_${caseType}`
    : null;

  return {
    clientName,
    caseType,
    topic,
    relatedCaseKey: caseKey,
    confidence: signals.length * 30 + (clientName ? 20 : 0),
    matchedSignals: signals,
  };
}

// #endregion

// #region Storage

const BUNDLES_KEY = 'eldad_case_bundles';

/** כל התיקים */
export function getAllBundles(): CaseBundle[] {
  try {
    return JSON.parse(localStorage.getItem(BUNDLES_KEY) || '[]');
  } catch { return []; }
}

function saveBundles(bundles: CaseBundle[]): void {
  try { localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles)); } catch { /* silent */ }
}

// #endregion

// #region Bundle Management

/**
 * יוצר תיק חדש או מוסיף חומר לתיק קיים.
 * לא מייצר draft — רק מצב case_review_required.
 */
export function createOrUpdateBundle(
  context: CaseContext,
  emailId: string,
  emailSubject: string,
  emailDate: string,
  emailSnippet: string
): CaseBundle {
  const bundles = getAllBundles();
  const now = new Date().toISOString();

  // חיפוש תיק קיים לפי caseKey
  let bundle = context.relatedCaseKey
    ? bundles.find(b => b.caseKey === context.relatedCaseKey)
    : undefined;

  const material: CaseMaterial = {
    id: `mat-${emailId}`,
    type: 'email',
    title: emailSubject,
    date: emailDate,
    sourceRef: emailId,
    snippet: emailSnippet.slice(0, 200),
    status: 'available',
  };

  if (bundle) {
    // עדכון תיק קיים
    if (!bundle.materials.some(m => m.sourceRef === emailId)) {
      bundle.materials.push(material);
    }
    bundle.updatedAt = now;
    bundle.status = 'case_review_required';
    // Knowledge Layer — עדכון סיכונים בכל עדכון
    const riskResult = assessWarCompRisks(bundle.caseType, bundle.missingItems, bundle.materials);
    bundle.riskFlags = riskResult.flags;
    bundle.requiresHumanReview = riskResult.requiresReview;
    bundle.reviewReason = riskResult.reviewReason;
    bundle.deadlineWarning = checkWarCompDeadlines(bundle.caseType);
    saveBundles(bundles);
  } else {
    // תיק חדש
    const missingItems = identifyMissingItems(context.caseType);
    const riskResult = assessWarCompRisks(context.caseType, missingItems, [material]);
    bundle = {
      id: `case-${Date.now()}`,
      clientName: context.clientName || 'לא זוהה',
      caseType: context.caseType,
      topic: context.topic,
      caseKey: context.relatedCaseKey || `unknown_${Date.now()}`,
      status: 'case_review_required',
      materials: [material],
      missingItems,
      riskFlags: riskResult.flags,
      requiresHumanReview: riskResult.requiresReview,
      reviewReason: riskResult.reviewReason,
      deadlineWarning: checkWarCompDeadlines(context.caseType),
      summary: null,
      responseDraft: null,
      appealDraft: null,
      createdAt: now,
      updatedAt: now,
    };
    bundles.push(bundle);
    saveBundles(bundles);
  }

  const reviewTag = bundle.requiresHumanReview ? ' ⚠️ REVIEW REQUIRED' : '';
  console.log(
    `[CaseBundle] 📁 ${bundle.id}: "${context.clientName}" (${context.caseType}) — ` +
    `${bundle.materials.length} materials, ${bundle.riskFlags.length} risks, status: ${bundle.status}${reviewTag}`
  );

  return bundle;
}

// #region Knowledge Layer — Risk Assessment

/** תוצאת הערכת סיכונים */
interface RiskAssessmentResult {
  flags: string[];
  requiresReview: boolean;
  reviewReason: string | null;
}

/** אסמכתאות קריטיות — חוסר בהן מחייב review */
const CRITICAL_MATERIALS = [
  'החלטת הרשות / המכתב שהתקבל',
  'חישובים / נתוני נזק',
  'דוחות כספיים',
  'אישורי רו"ח',
];

/**
 * הערכת סיכוני פיצוי מלחמה — Knowledge Layer.
 * בודק: אסמכתאות קריטיות חסרות, סנקציות, review triggers.
 */
function assessWarCompRisks(
  caseType: CaseType,
  missingItems: string[],
  materials: CaseMaterial[]
): RiskAssessmentResult {
  const flags: string[] = [];
  const reviewReasons: string[] = [];

  // רק לסוגי תיקים של פיצויי מלחמה
  const isWarComp = caseType === 'war_compensation_red_track';
  if (!isWarComp) {
    return { flags: [], requiresReview: false, reviewReason: null };
  }

  // Knowledge Layer — בדיקת אסמכתאות קריטיות חסרות
  const criticalMissing = missingItems.filter(item =>
    CRITICAL_MATERIALS.some(cm => item.includes(cm))
  );
  if (criticalMissing.length > 0) {
    flags.push(`חסרות ${criticalMissing.length} אסמכתאות קריטיות`);
    reviewReasons.push('חסרות אסמכתאות קריטיות');
  }

  // Knowledge Layer — בדיקת כמות חומרים (WAR_COMP_SANCTIONS.riskFlags)
  if (materials.length < 2) {
    flags.push(WAR_COMP_SANCTIONS.riskFlags[0]); // 'חסר במסמכי בסיס'
  }

  // Knowledge Layer — בדיקת deadline proximity
  const deadlineWarning = checkWarCompDeadlines(caseType);
  if (deadlineWarning) {
    flags.push(WAR_COMP_SANCTIONS.riskFlags[6]); // 'מועד השגה קרוב / חלף'
    reviewReasons.push('מועד הגשה / ערר קרוב');
  }

  // Knowledge Layer — בדיקת review triggers (WAR_COMP_SANCTIONS.humanReviewRequired)
  const requiresReview = reviewReasons.length > 0 || criticalMissing.length >= 2;

  return {
    flags,
    requiresReview,
    reviewReason: reviewReasons.length > 0 ? reviewReasons.join('; ') : null,
  };
}

/**
 * בדיקת מועדים רלוונטיים — Knowledge Layer.
 * מחזיר אזהרת deadline אם רלוונטי, או null.
 */
function checkWarCompDeadlines(caseType: CaseType): string | null {
  if (caseType !== 'war_compensation_red_track') return null;

  // Knowledge Layer — כל ה-deadlines עם needsReview=true דורשים תשומת לב
  const relevantDeadlines = WAR_COMP_DEADLINES.filter(d => d.needsReview);
  if (relevantDeadlines.length === 0) return null;

  // בניית אזהרה מכל ה-deadlines הרלוונטיים
  const warnings = relevantDeadlines.map(d =>
    `${d.operation}: ${d.rule} (${d.note})`
  );

  // Knowledge Layer — הוספת כלל ערר קבוע
  const appealDeadline = WAR_COMP_DEADLINES.find(d => d.track === 'appeal');
  if (appealDeadline) {
    warnings.push(`ערר: ${WAR_COMP_APPEAL_RULES.deadlineDescription}`);
  }

  return `⏰ ${warnings.join(' | ')}`;
}

// #endregion

// #region Missing Items

/** זיהוי חומרים חסרים לפי סוג תיק */
function identifyMissingItems(caseType: CaseType): string[] {
  // Knowledge Layer — שליפת מומרים נדרשים משכבת הידע לפיצויי מלחמה
  const knowledgeMaterials = WAR_COMP_REQUIRED_MATERIALS[caseType];
  if (knowledgeMaterials) return [...knowledgeMaterials];

  const missing: Partial<Record<CaseType, string[]>> = {
    lawsuit: ['כתב תביעה', 'כתב הגנה', 'ייפוי כוח', 'אסמכתאות'],
    appeal: ['החלטה מקורית', 'נימוקי ערר', 'מסמכים תומכים'],
    tax_audit: ['דוח שנתי', 'אסמכתאות הכנסה', 'אישורי ניכוי'],
    insurance_claim: ['טופס תביעה', 'אישורים רפואיים', 'תעודות'],
    penalty: ['הודעת קנס', 'אסמכתאות כנגד', 'ייפוי כוח'],
    client_request: ['מסמכי לקוח', 'ייפוי כוח'],
    regulatory: ['הודעת רשם', 'דוח שנתי', 'פרוטוקול'],
    general: [],
  };
  return missing[caseType] || [];
}

// #endregion

// #region Bundle Advancement

/**
 * מקדם תיק — מ-review → bundle_ready → draft_ready
 * הכנת drafts רק בשלב draft_response_ready
 */
export function advanceBundleStatus(bundleId: string): CaseBundle | null {
  const bundles = getAllBundles();
  const bundle = bundles.find(b => b.id === bundleId);
  if (!bundle) return null;

  const now = new Date().toISOString();

  if (bundle.status === 'case_review_required') {
    bundle.summary = generateCaseSummary(bundle);
    bundle.status = 'case_bundle_ready';
    bundle.updatedAt = now;
    console.log(`[CaseBundle] 📋 ${bundleId} → case_bundle_ready | summary generated`);
  } else if (bundle.status === 'case_bundle_ready') {
    // עכשיו ורק עכשיו — ניסוח
    bundle.responseDraft = generateResponseDraft(
      bundle.clientName, bundle.topic, bundle.createdAt, null
    );
    if (['appeal', 'penalty', 'war_compensation_red_track'].includes(bundle.caseType)) {
      bundle.appealDraft = generateAppealDraft(bundle.topic, bundle.createdAt, null, bundle.caseType);
    }
    bundle.status = 'draft_response_ready';
    bundle.updatedAt = now;
    console.log(`[CaseBundle] ✍️ ${bundleId} → draft_response_ready | drafts generated`);
  }

  saveBundles(bundles);
  return bundle;
}

// #endregion

// #region Case Summary

/**
 * יוצר סיכום תיק אוטומטי מהחומרים שנאספו
 */
export function generateCaseSummary(bundle: CaseBundle): string {
  const lines: string[] = [];
  lines.push(`## סיכום תיק: ${bundle.clientName}`);
  lines.push(`סוג: ${bundle.caseType} | נושא: ${bundle.topic}`);
  lines.push('');

  // חומרים קיימים
  const available = bundle.materials.filter(m => m.status === 'available');
  if (available.length > 0) {
    lines.push(`### חומר קיים (${available.length}):`);
    available.forEach(m => lines.push(`- [${m.type}] ${m.title} (${m.date})`));
  }

  // חסרים
  if (bundle.missingItems.length > 0) {
    lines.push('');
    lines.push(`### חומר חסר (${bundle.missingItems.length}):`);
    bundle.missingItems.forEach(item => lines.push(`- ❌ ${item}`));
  }

  // Knowledge Layer — דגלי סיכון
  if (bundle.riskFlags.length > 0) {
    lines.push('');
    lines.push(`### ⚠️ דגלי סיכון (${bundle.riskFlags.length}):`);
    bundle.riskFlags.forEach(flag => lines.push(`- 🔴 ${flag}`));
  }

  // Knowledge Layer — אזהרת מועדים
  if (bundle.deadlineWarning) {
    lines.push('');
    lines.push(`### ⏰ מועדים:`);
    lines.push(bundle.deadlineWarning);
  }

  // Knowledge Layer — review אנושי
  if (bundle.requiresHumanReview) {
    lines.push('');
    lines.push(`### 🛑 נדרש review אנושי`);
    lines.push(`סיבה: ${bundle.reviewReason || 'לא צוינה'}`);
  }

  // סטטוס
  lines.push('');
  const sentLetters = bundle.materials.filter(m => m.type === 'sent_letter');
  if (sentLetters.length > 0) {
    lines.push(`### מכתבים שנשלחו (${sentLetters.length}):`);
    sentLetters.forEach(m => lines.push(`- ✉️ ${m.title} (${m.date})`));
  } else {
    lines.push('### מכתבים שנשלחו: אין עדיין');
  }

  return lines.join('\n');
}

// #endregion

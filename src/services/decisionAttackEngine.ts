/* ============================================
   FILE: decisionAttackEngine.ts
   PURPOSE: מנוע לניתוח החלטות במחלוקת ובניית מפת תקיפה עובדתית/משפטית לערר
   DEPENDENCIES: ../data/caseTypes, ../integrations/gmail/caseBundle
   EXPORTS: buildAttackMap, AttackPoint, IssueType, StrengthLevel
   ============================================ */
import type { CaseDocument, CaseProcessType, AuthoredArgument } from '../data/caseTypes';
import type { CaseBundle } from '../integrations/gmail/caseBundle';

// #region Types

export type IssueType =
  | 'factual_gap'
  | 'legal_gap'
  | 'missing_basis'
  | 'contradiction'
  | 'unsupported_assumption'
  | 'ignored_evidence';

export type StrengthLevel =
  | 'strong'
  | 'medium'
  | 'weak'
  | 'missing_evidence';

export interface AttackPoint {
  /** הטענה המקורית של הרשות */
  authorityClaim: string;
  /** סוג הכשל שניתוח המערכת גילה בטענה */
  issueType: IssueType;
  /** הסבר מילולי על מהות החולשה בטענת הרשות */
  weaknessExplanation: string;
  /** הטיעון הנגדי שלנו (מבוסס על תגובת אלדד אם קיימת) */
  counterArgument: string;
  /** מסמכים תומכים */
  supportingEvidence: string[];
  /** עוצמת התקיפה */
  strengthLevel: StrengthLevel;
  /** מקור הטיעון הנגדי — תגובת אלדד או טיעון גנרי */
  source: 'authored_response' | 'generic';
  /** מזהה AuthoredArgument תואם */
  authoredArgumentId?: string;
}

export interface AttackEngineInput {
  decisionText: string;
  authoredResponseText: string | null;
  /** טיעונים מנותחים מתגובת אלדד — עדיפות על טקסט גולמי */
  authoredArguments?: AuthoredArgument[];
  caseDocuments: CaseDocument[];
  caseBundle?: CaseBundle;
  processType: CaseProcessType;
}

// #endregion

// #region Main Orchestrator

/**
 * בונה מפת תקיפה מסודרת נגד החלטת הרשות
 */
export function buildAttackMap(input: AttackEngineInput): AttackPoint[] {
  // 1. חילוץ טענות החלטה מהטקסט (כרגע דמה/סימולטיבי, יעבוד מול LLM בהמשך)
  const claims = extractAuthorityClaims(input.decisionText);

  const attackMap: AttackPoint[] = [];

  for (const claim of claims) {
    // 2. סיווג סוג הפירצה / היעדר ביסוס
    const issueType = classifyClaimWeakness(claim, input.processType);

    // 3. טיעון נגדי — עדיפות לטיעונים מנותחים מתגובת אלדד
    const matchResult = matchCounterFromAuthored(
      claim, input.authoredArguments, input.authoredResponseText
    );

    // 4. חיבור ראיות קיימות לתיק
    const supportingEvidence = attachSupportingEvidence(claim, issueType, input.caseDocuments);

    // 5. קביעת חוזק
    const isAuthored = matchResult.source === 'authored_response';
    let strengthLevel: StrengthLevel = 'medium';
    if (supportingEvidence.length === 0 && !isAuthored) {
      strengthLevel = 'missing_evidence';
    } else if (isAuthored && supportingEvidence.length > 0) {
      strengthLevel = 'strong';
    } else if (isAuthored) {
      strengthLevel = 'medium';
    } else if (supportingEvidence.length === 0) {
      strengthLevel = 'weak';
    }

    attackMap.push({
      authorityClaim: claim,
      issueType,
      weaknessExplanation: generateWeaknessExplanation(issueType),
      counterArgument: matchResult.counterArgument || 'טיעון גנרי (השלמה): נדרש לבסס טענת נגד מעמיקה המפריכה את קביעת הרשות.',
      supportingEvidence,
      strengthLevel,
      source: matchResult.source,
      authoredArgumentId: matchResult.authoredArgumentId,
    });
  }

  return attackMap;
}

// #endregion

// #region Internal Engine Steps

/**
 * 1. חילוץ הטענות המרכזיות מהחלטת הרשות.
 */
function extractAuthorityClaims(decisionText: string): string[] {
  if (!decisionText || decisionText.trim() === '') {
    return ['החלטה כללית של הרשות ללא פירוט נימוקים מספק על פני המסמך'];
  }

  // סימולציה: פירוק לפסקאות מרכזיות
  const lines = decisionText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 20); // התעלמות מכותרות קצרות

  return lines.length > 0 ? lines : [decisionText];
}

/**
 * 2. זיהוי הפירצה (Weakness) בטענת הרשות
 */
function classifyClaimWeakness(claim: string, processType: CaseProcessType): IssueType {
  const lower = claim.toLowerCase();
  
  if (lower.includes('הוכח') || lower.includes('ראיות') || lower.includes('אסמכתאות')) {
    return 'ignored_evidence';
  }
  if (lower.includes('חוק') || lower.includes('סעיף') || lower.includes('פסיקה') || lower.includes('תקנה')) {
    return 'legal_gap';
  }
  if (lower.includes('סביר') || lower.includes('הנחה') || lower.includes('מניח')) {
    return 'unsupported_assumption';
  }
  if (lower.includes('בניגוד') || lower.includes('סתירה')) {
    return 'contradiction';
  }
  if (lower.includes('עובדה') || lower.includes('נתון') || /\d/.test(claim)) {
    return 'factual_gap';
  }
  
  return 'missing_basis';
}

/**
 * 3. שליפת טיעון נגדי — עדיפות ל-AuthoredArgument מנותח, fallback לטקסט גולמי.
 */
function matchCounterFromAuthored(
  claim: string,
  authoredArguments?: AuthoredArgument[],
  fallbackText?: string | null,
): { counterArgument: string; source: 'authored_response' | 'generic'; authoredArgumentId?: string } {
  // עדיפות 1: טיעונים מנותחים
  if (authoredArguments && authoredArguments.length > 0) {
    const best = findBestMatch(claim, authoredArguments);
    if (best) {
      return {
        counterArgument: best.argumentText,
        source: 'authored_response',
        authoredArgumentId: best.id,
      };
    }
  }
  // עדיפות 2: fallback — אם יש טקסט גולמי
  if (fallbackText && fallbackText.length > 30) {
    return {
      counterArgument: 'מעוגן בטיעון הקיים (מתוך התגובה שנוסחה ע"י אלדד): יצוק למסמך המקורי.',
      source: 'authored_response',
    };
  }
  return { counterArgument: '', source: 'generic' };
}

/** מציאת הטיעון הכי מתאים לטענת רשות — חפיפת מילים */
function findBestMatch(claim: string, args: AuthoredArgument[]): AuthoredArgument | null {
  const claimWords = tokenize(claim);
  if (claimWords.length === 0) return args[0] || null;

  let best: AuthoredArgument | null = null;
  let bestScore = 0;

  for (const arg of args) {
    const argWords = new Set(tokenize(arg.argumentText));
    const overlap = claimWords.filter(w => argWords.has(w)).length;
    const score = overlap / claimWords.length;
    if (score > bestScore) {
      bestScore = score;
      best = arg;
    }
  }
  return bestScore >= 0.1 ? best : (args[0] || null);
}

/** טוקניזציה בסיסית — מילות תוכן בלבד */
function tokenize(text: string): string[] {
  const stops = new Set(['של', 'את', 'על', 'עם', 'לא', 'כי', 'אם', 'או', 'גם', 'כל', 'זה', 'הוא', 'היא']);
  return text.replace(/[^א-תa-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !stops.has(w));
}

/**
 * 4. מיפוי ראיות קיימות לחיזוק טיעון הנגד
 */
function attachSupportingEvidence(
  claim: string,
  issueType: IssueType,
  documents: CaseDocument[]
): string[] {
  const evidence: string[] = [];

  // בחירת המסמכים התומכים לפי סוג הפירצה מול מה שהוגש כבר
  if (issueType === 'factual_gap' || issueType === 'ignored_evidence') {
    const records = documents.filter(d => ['business_records', 'calculation', 'license'].includes(d.type));
    records.forEach(r => evidence.push(`[${r.type}] ${r.description}`));
  }

  if (issueType === 'legal_gap' || issueType === 'contradiction') {
    const letters = documents.filter(d => d.type === 'response_letter');
    letters.forEach(l => evidence.push(`[אסמכתא במכתב] ${l.description}`));
  }

  // סינון כפילויות ולקיחת עד 3 ראיות חזקות
  return Array.from(new Set(evidence)).slice(0, 3);
}

/**
 * פונקציה תומכת: טקסט הסבר מנורמל לכל טיפוס פירצה
 */
function generateWeaknessExplanation(issueType: IssueType): string {
  const explanations: Record<IssueType, string> = {
    factual_gap: 'הסקת המסקנות של הרשות נשענת על מצע עובדתי חסר או שגוי.',
    legal_gap: 'שגגה ביישום הוראות החוק או התעלמות מהלכה פסוקה רלוונטית.',
    missing_basis: 'קביעה שרירותית של הרשות בעלמא, ללא הפניה למקור נורמטיבי או תשתיתי ברור.',
    contradiction: 'דרישה או הנמקה הסותרת החלטות קודמות, נוהל רשמי או את עצמה.',
    unsupported_assumption: 'הרשות גזרה הנחות ללא עיגון בממצאים האובייקטיביים של התיק.',
    ignored_evidence: 'התעלמות מראיות פוזיטיביות ומהותיות שהוגשו כדין.',
  };
  return explanations[issueType];
}

// #endregion

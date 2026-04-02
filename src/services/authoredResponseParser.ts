/* ============================================
   FILE: authoredResponseParser.ts
   PURPOSE: מנתח תגובת אלדד לטיעונים מובנים — מנוע הטיעון הראשי
   DEPENDENCIES: ../data/caseTypes
   EXPORTS: parseAuthoredResponse, ParsedResponseOutput, ParserInput
   ============================================ */
import type { AuthoredArgument, AuthoredArgumentType, CaseDocument } from '../data/caseTypes';
import type { AttackPoint } from './decisionAttackEngine';

// #region Types

/** קלט לפרסר */
export interface ParserInput {
  authoredResponseText: string;
  decisionText?: string;
  caseDocuments: CaseDocument[];
  attackMap?: AttackPoint[];
}

/** פלט הפרסר */
export interface ParsedResponseOutput {
  arguments: AuthoredArgument[];
  responseSummary: string;
  uncoveredAuthorityClaims: string[];
}

/** הפניה פנימית לטענת רשות */
interface ClaimRef {
  id: string;
  text: string;
}

// #endregion

// #region Main Parser

/**
 * מנתח את תגובת אלדד לטיעונים מובנים.
 * מחזיר טיעונים מנותחים, סיכום, וטענות רשות שאין להן מענה.
 */
export function parseAuthoredResponse(input: ParserInput): ParsedResponseOutput {
  if (!input.authoredResponseText || input.authoredResponseText.trim().length < 30) {
    return { arguments: [], responseSummary: '', uncoveredAuthorityClaims: [] };
  }

  // 1. פירוק לפסקאות ממוספרות
  const paragraphs = splitIntoParagraphs(input.authoredResponseText);

  // 2. חילוץ טענות רשות למיפוי
  const authorityClaims: ClaimRef[] = input.attackMap
    ? input.attackMap.map((p, i) => ({ id: `ac-${String(i + 1).padStart(2, '0')}`, text: p.authorityClaim }))
    : extractClaimsFromText(input.decisionText || '');

  // 3. ניתוח כל פסקה לטיעון מובנה
  const args: AuthoredArgument[] = paragraphs.map((para, idx) => {
    const argType = classifyArgumentType(para);
    const matchedClaims = matchToClaims(para, authorityClaims);
    const evidence = matchToEvidence(para, input.caseDocuments);
    const strength = estimateStrength(evidence.length, matchedClaims.length);

    return {
      id: `aa-${String(idx + 1).padStart(2, '0')}`,
      title: extractTitle(para, idx),
      argumentText: para.replace(/^\d+\.\s*/, '').trim(),
      argumentType: argType,
      relatedAuthorityClaimIds: matchedClaims.map(c => c.id),
      supportingEvidenceIds: evidence.map(e => e.id),
      strengthEstimate: strength,
      sourceParagraphs: [para],
    };
  });

  // 4. טענות רשות לא מכוסות
  const coveredIds = new Set(args.flatMap(a => a.relatedAuthorityClaimIds));
  const uncoveredAuthorityClaims = authorityClaims
    .filter(c => !coveredIds.has(c.id))
    .map(c => c.text);

  // 5. סיכום
  const responseSummary = buildSummary(args, uncoveredAuthorityClaims);

  return { arguments: args, responseSummary, uncoveredAuthorityClaims };
}

// #endregion

// #region Paragraph Splitting

/** פירוק טקסט לפסקאות ממוספרות */
function splitIntoParagraphs(text: string): string[] {
  // ניסיון פירוק לפי מספור: "1. ", "2. " וכו'
  const numbered = text.split(/\n\s*(?=\d+\.\s+)/)
    .map(s => s.trim())
    .filter(s => s.length > 30);

  if (numbered.length > 1) return numbered;

  // fallback: פירוק לפי שורות ריקות
  return text.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30);
}

// #endregion

// #region Classification

/** מילות מפתח לסיווג סוגי טיעון */
const TYPE_KEYWORDS: Record<AuthoredArgumentType, string[]> = {
  factual: ['מתווך', 'אשקלון', 'עסק', 'נדל"ן', 'פעילות', 'מיקום', 'נוכחות', 'פיזית', 'שטח', 'פגישות', 'סיורים'],
  legal: ['סיבתי', 'קשר', 'חוק', 'סעיף', 'פסיקה', 'זכאות', 'ספר', 'ישיר', 'מלחמה', 'חרבות', 'אוקטובר'],
  evidentiary: ['רישיון', 'חשבונית', 'מסמך', 'חישוב', 'מחזור', 'הפסד', 'ראיה', 'אסמכתא', 'טבלה', 'הנהלת חשבונות'],
  procedural: ['דחייה', 'בקשה', 'אפליה', 'מתווכים אחרים', 'פיצוי', 'מסלול', 'קיבלו'],
};

/** סיווג טיעון לפי מילות מפתח */
function classifyArgumentType(paragraph: string): AuthoredArgumentType {
  let bestType: AuthoredArgumentType = 'factual';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [AuthoredArgumentType, string[]][]) {
    const score = keywords.filter(kw => paragraph.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }
  return bestType;
}

// #endregion

// #region Matching

/** מילות עצירה עבריות לסינון */
const STOP_WORDS = new Set([
  'של', 'את', 'על', 'עם', 'מן', 'אל', 'בין', 'לא', 'כי', 'אם', 'או', 'גם',
  'אין', 'הוא', 'היא', 'הם', 'כל', 'לו', 'לנו', 'כך', 'זה', 'זו', 'זאת',
  'מי', 'מה', 'איך', 'לפי', 'שלום', 'בכבוד', 'בברכה', 'רב', 'מר', 'שנת',
  'ב', 'ל', 'מ', 'ה', 'ו', 'כ', 'ש', 'הן', 'אנו', 'יום', 'לפני', 'אחרי',
]);

/** חילוץ מילות תוכן מטקסט */
function extractContentWords(text: string): string[] {
  return text
    .replace(/[^א-תa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/** מיפוי פסקה לטענות רשות לפי חפיפת מילים */
function matchToClaims(paragraph: string, claims: ClaimRef[]): ClaimRef[] {
  const paraWords = new Set(extractContentWords(paragraph));
  const matched: ClaimRef[] = [];

  for (const claim of claims) {
    const claimWords = extractContentWords(claim.text);
    if (claimWords.length === 0) continue;

    const overlap = claimWords.filter(w => paraWords.has(w)).length;
    const score = overlap / claimWords.length;

    // סף מינימלי: 15% חפיפה או לפחות 2 מילים משותפות
    if (score >= 0.15 || overlap >= 2) {
      matched.push(claim);
    }
  }
  return matched;
}

/** מיפוי פסקה לראיות תומכות */
function matchToEvidence(paragraph: string, docs: CaseDocument[]): CaseDocument[] {
  const lower = paragraph.toLowerCase();
  return docs.filter(d => {
    // התאמה לפי מילות מפתח מתיאור המסמך
    const descWords = extractContentWords(d.description);
    const matchCount = descWords.filter(w => lower.includes(w)).length;
    return matchCount >= 2;
  }).slice(0, 3);
}

/** הערכת חוזק טיעון */
function estimateStrength(
  evidenceCount: number,
  claimMatchCount: number,
): 'strong' | 'medium' | 'weak' {
  if (evidenceCount > 0 && claimMatchCount > 0) return 'strong';
  if (evidenceCount > 0 || claimMatchCount > 0) return 'medium';
  return 'weak';
}

// #endregion

// #region Helpers

/** חילוץ כותרת קצרה מפסקה */
function extractTitle(paragraph: string, index: number): string {
  // הסרת מספור
  const clean = paragraph.replace(/^\d+\.\s*/, '').trim();
  // לקיחת המשפט הראשון (עד נקודה או מקף)
  const firstSentence = clean.split(/[.—–\n]/)[0]?.trim() || '';
  if (firstSentence.length > 5 && firstSentence.length <= 80) {
    return firstSentence;
  }
  // קיצור אם ארוך מדי
  if (firstSentence.length > 80) {
    return firstSentence.slice(0, 77) + '...';
  }
  return `טיעון ${index + 1}`;
}

/** חילוץ טענות מטקסט החלטה */
function extractClaimsFromText(decisionText: string): ClaimRef[] {
  if (!decisionText || decisionText.trim() === '') return [];

  return decisionText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 20)
    .map((text, i) => ({
      id: `ac-${String(i + 1).padStart(2, '0')}`,
      text,
    }));
}

/** בניית סיכום */
function buildSummary(
  args: AuthoredArgument[],
  uncovered: string[],
): string {
  const byType = {
    factual: args.filter(a => a.argumentType === 'factual').length,
    legal: args.filter(a => a.argumentType === 'legal').length,
    evidentiary: args.filter(a => a.argumentType === 'evidentiary').length,
    procedural: args.filter(a => a.argumentType === 'procedural').length,
  };
  const strong = args.filter(a => a.strengthEstimate === 'strong').length;

  const parts = [
    `${args.length} טיעונים חולצו מתגובת אלדד`,
    `(${byType.factual} עובדתיים, ${byType.legal} משפטיים, ${byType.evidentiary} ראייתיים, ${byType.procedural} פרוצדורליים)`,
    `${strong} טיעונים חזקים`,
  ];

  if (uncovered.length > 0) {
    parts.push(`${uncovered.length} טענות רשות עדיין לא מכוסות`);
  }
  return parts.join(' · ');
}

// #endregion

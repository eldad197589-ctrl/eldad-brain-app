/* ============================================
   FILE: knowledgeRegistry.ts
   PURPOSE: Knowledge Registry API — ממשק גנרי לשכבת ידע מקצועי.
            מאפשר רישום, שליפה וחיפוש ידע לפי תחום.
   DEPENDENCIES: ./knowledge/warCompensationKnowledge
   EXPORTS: DomainKnowledge, registerKnowledge, getKnowledge,
            getKnowledgeKeywords, getAllKnowledgeDomains
   ============================================ */
import {
  WAR_COMP_KEYWORDS,
  WAR_COMP_SUBTYPES,
  WAR_COMP_AUTHORITY_BODIES,
  WAR_COMP_REQUIRED_MATERIALS,
  WAR_COMP_SENDER_DOMAINS,
  WAR_COMP_WARS,
} from './knowledge/warCompensationKnowledge';

// #region Types

/** ממשק ידע מקצועי לתחום */
export interface DomainKnowledge {
  /** מזהה תחום — תואם ל-processId ב-Registry */
  domainId: string;
  /** שם תצוגה */
  title: string;
  /** מילות מפתח לזיהוי */
  keywords: string[];
  /** דומיינים של שולחים מוכרים */
  senderDomains: Record<string, { category: string; label: string }>;
  /** חומרים נדרשים לפי subtype */
  requiredMaterials: Record<string, string[]>;
  /** מטא-דאטה נוסף — שונה לפי תחום */
  meta: Record<string, unknown>;
}

// #endregion

// #region Registry Storage

const registry = new Map<string, DomainKnowledge>();

// #endregion

// #region Public API

/**
 * רישום ידע מקצועי לתחום.
 * @param knowledge — אובייקט ידע מלא
 */
export function registerKnowledge(knowledge: DomainKnowledge): void {
  registry.set(knowledge.domainId, knowledge);
  console.log(`[KnowledgeRegistry] ✅ Registered: "${knowledge.title}" (${knowledge.domainId})`);
}

/**
 * שליפת ידע לפי מזהה תחום.
 * @returns DomainKnowledge או undefined
 */
export function getKnowledge(domainId: string): DomainKnowledge | undefined {
  return registry.get(domainId);
}

/**
 * מחזיר את כל מילות המפתח לתחום נתון.
 * @returns מערך מילות מפתח, או מערך ריק אם התחום לא רשום
 */
export function getKnowledgeKeywords(domainId: string): string[] {
  return registry.get(domainId)?.keywords ?? [];
}

/**
 * מחזיר את כל התחומים הרשומים.
 */
export function getAllKnowledgeDomains(): string[] {
  return [...registry.keys()];
}

// #endregion

// #region Auto-Seed: War Compensation

registerKnowledge({
  domainId: 'war_compensation',
  title: 'פיצויי מלחמה',
  keywords: WAR_COMP_KEYWORDS,
  senderDomains: WAR_COMP_SENDER_DOMAINS,
  requiredMaterials: WAR_COMP_REQUIRED_MATERIALS,
  meta: {
    subtypes: WAR_COMP_SUBTYPES,
    authorityBodies: WAR_COMP_AUTHORITY_BODIES,
    wars: WAR_COMP_WARS,
  },
});

// #endregion

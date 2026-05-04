/* ============================================
   FILE: ManualPreviewWorkbench.tsx
   PURPOSE: Internal manual preview workbench for local-only Brain preview cascade.
   DEPENDENCIES: React
   EXPORTS: ManualPreviewWorkbench component
   ============================================ */

// #region Dependencies
import { useState, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import BrainKnowledgeInventoryPreview from './BrainKnowledgeInventoryPreview';
import IntakeSignalSummary from './IntakeSignalSummary';
import ScannedEvidenceBatchPreview from './ScannedEvidenceBatchPreview';
import VatMappingTablePreview from './VatMappingTablePreview';
import { EVIDENCE_FILE_OPERATION_BLOCK_POLICY, EVIDENCE_FOLDER_RELATIONSHIP_POLICY } from '../../../work-spine/evidence/evidence-spine-policy';
import { OUTPUT_PREVIEW_TYPE_REGISTRY, STATIC_OUTPUT_PREVIEWS } from '../../../work-spine/output-preview/output-preview-seed';
import { REAL_ACTIONS_POLICY_MAP } from '../../../work-spine/policy/real-actions-policy-map';
import { WORKFLOW_DOMAIN_REGISTRY } from '../../../work-spine/workflow/workflow-domain-registry';
import { STATIC_WORKFLOW_MAPS } from '../../../work-spine/workflow/workflow-map-seed';
import type { OutputPreviewRegistryEntry, OutputPreviewType, ProfessionalOutputPreview } from '../../../work-spine/output-preview/output-preview-types';
import type { RealActionPolicy } from '../../../work-spine/policy/real-actions-policy-types';
import type { ProfessionalWorkflowMap, WorkflowDomain, WorkflowDomainRegistryEntry } from '../../../work-spine/workflow/workflow-map-types';
// #endregion

// #region Types
/** Source types available for the manual preview workbench. */
type ManualPreviewSourceType = 'manual_text' | 'scan' | 'email' | 'drive' | 'protocol';

/** Local form state for the manual preview workbench. */
interface ManualPreviewFormState {
  title: string;
  sourceType: ManualPreviewSourceType;
  metadataSummary: string;
  clientOrCaseLabel: string;
  domainLabel: string;
}

/** Preview section derived from local form metadata only. */
interface PreviewSection {
  title: string;
  body: readonly string[];
  simulation?: boolean;
}

/** Local batch/bookkeeping-system/VAT-period signals derived from text only. */
interface BatchAwareness {
  hasBatchSignal: boolean;
  hasDuplicateRisk: boolean;
  hasBookkeepingSystemSignal: boolean;
  hasMixedPeriodSignal: boolean;
  duplicateRiskLabel: 'גבוה' | 'בינוני' | 'נמוך';
  bookkeepingSystemStatusAssumption: string;
}

/** Static Work Spine knowledge resolved for the current local preview. */
interface StaticWorkbenchKnowledge {
  workflowDomain: WorkflowDomainRegistryEntry;
  workflowMap: ProfessionalWorkflowMap;
  outputRegistryEntries: readonly OutputPreviewRegistryEntry[];
  outputPreviewSamples: readonly ProfessionalOutputPreview[];
  vatSubmissionPolicy?: RealActionPolicy;
}

/** Props for PreviewBadge. */
interface PreviewBadgeProps {
  simulation?: boolean;
}

/** Props for PreviewCard. */
interface PreviewCardProps {
  section: PreviewSection;
}

/** Props for FieldTextInput. */
interface FieldTextInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Props for FieldTextArea. */
interface FieldTextAreaProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}
// #endregion

// #region Constants
const SOURCE_TYPES: readonly ManualPreviewSourceType[] = ['manual_text', 'scan', 'email', 'drive', 'protocol'];

const SOURCE_TYPE_LABELS: Record<ManualPreviewSourceType, string> = { manual_text: 'טקסט ידני', scan: 'סריקה', email: 'מייל', drive: 'Drive', protocol: 'פרוטוקול' };
const FIELD_LABELS = { title: 'כותרת המסמך / המשימה', sourceType: 'סוג מקור', metadataSummary: 'תקציר / תיאור קצר', clientOrCaseLabel: 'לקוח / תיק', domainLabel: 'תחום מקצועי' } as const;
const PLACEHOLDERS = { title: 'לדוגמה: חשבונית בזק לחודש 04/2026', metadataSummary: 'לדוגמה: חשבונית ספק שנסרקה לצורך בדיקת מע״מ והנהלת חשבונות', clientOrCaseLabel: 'לדוגמה: דוד אלדד מע״מ / דימה / צילה', domainLabel: 'לדוגמה: VAT / שכר / דיני עבודה' } as const;
const OUTPUT_TYPE_HEBREW_LABELS: Record<OutputPreviewType, string> = {
  letter: 'מכתב',
  task_summary: 'סיכום משימה',
  scan_intake_report: 'דוח קליטת סריקה',
  protocol_action_summary: 'סיכום פעולות מפרוטוקול',
  vat_review_memo: 'מזכר בדיקת מע״מ',
  evidence_summary: 'סיכום ראיות',
  professional_opinion_draft: 'טיוטת חוות דעת מקצועית',
};

const RISK_HEBREW_LABELS = {
  none: 'ללא',
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה',
  critical: 'קריטית',
} as const;

const INITIAL_FORM_STATE: ManualPreviewFormState = { title: '', sourceType: 'manual_text', metadataSummary: '', clientOrCaseLabel: '', domainLabel: '' };
const shellStyle = { minHeight: '100vh', padding: '32px', color: '#e5edf7', background: '#0a0e1a', direction: 'rtl', textAlign: 'right' } as const;
const panelStyle = { maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 20 } as const;
const formGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 } as const;
const cardStyle = { border: '1px solid rgba(148, 163, 184, 0.24)', borderRadius: 8, background: 'rgba(15, 23, 42, 0.82)', padding: 18 } as const;
const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1px solid rgba(148, 163, 184, 0.28)', borderRadius: 8, background: 'rgba(2, 6, 23, 0.76)', color: '#f8fafc', padding: '10px 12px' } as const;
// #endregion

// #region Helpers
const hasPreviewInput = (form: ManualPreviewFormState): boolean =>
  Boolean(form.title.trim() || form.metadataSummary.trim() || form.clientOrCaseLabel.trim());

const includesAny = (value: string, terms: readonly string[]): boolean =>
  terms.some((term) => value.includes(term.toLowerCase()));

const buildSearchableText = (form: ManualPreviewFormState): string =>
  [form.title, form.sourceType, form.metadataSummary, form.clientOrCaseLabel, form.domainLabel].join(' ').toLowerCase();

const isVatBookkeepingCandidate = (form: ManualPreviewFormState): boolean => {
  const searchable = buildSearchableText(form);

  return includesAny(searchable, ['vat', 'מע"מ', 'מע״מ', 'הנהלת חשבונות', 'חשבונית', 'ספק']);
};

const resolveWorkflowDomainId = (form: ManualPreviewFormState, vatCandidate: boolean): WorkflowDomain => {
  const searchable = buildSearchableText(form);

  if (includesAny(searchable, ['protocol', 'פרוטוקול'])) return 'protocol_task_management';
  if (includesAny(searchable, ['vat', 'מע"מ', 'מע״מ']) || vatCandidate) return 'vat';
  if (includesAny(searchable, ['bookkeeping', 'הנהלת חשבונות', 'חשבונית', 'ספק'])) return 'bookkeeping';
  if (includesAny(searchable, ['payroll', 'שכר'])) return 'payroll';
  if (includesAny(searchable, ['דיני עבודה', 'labor'])) return 'labor_law';

  return 'client_case_filing';
};

const getRequiredWorkflowDomain = (domainId: WorkflowDomain): WorkflowDomainRegistryEntry => {
  const registryEntry = WORKFLOW_DOMAIN_REGISTRY.find((entry) => entry.domain === domainId);

  if (!registryEntry) {
    throw new Error(`Missing static workflow domain entry: ${domainId}`);
  }

  return registryEntry;
};

const getRequiredWorkflowMap = (domainId: WorkflowDomain): ProfessionalWorkflowMap => {
  const workflowMap = STATIC_WORKFLOW_MAPS.find((map) => map.domain === domainId);

  if (!workflowMap) {
    throw new Error(`Missing static workflow map: ${domainId}`);
  }

  return workflowMap;
};

const uniqueOutputTypes = (outputTypes: readonly OutputPreviewType[]): readonly OutputPreviewType[] =>
  Array.from(new Set(outputTypes));

const resolveOutputTypes = (
  form: ManualPreviewFormState,
  workflowDomain: WorkflowDomainRegistryEntry,
  vatCandidate: boolean,
): readonly OutputPreviewType[] => {
  const outputTypes: OutputPreviewType[] = [...workflowDomain.expectedOutputTypes];

  if (form.sourceType === 'scan') outputTypes.unshift('scan_intake_report');
  if (vatCandidate) outputTypes.push('vat_review_memo', 'task_summary', 'evidence_summary');
  if (form.sourceType === 'protocol') outputTypes.push('protocol_action_summary', 'task_summary');

  return uniqueOutputTypes(outputTypes);
};

const resolveStaticWorkbenchKnowledge = (
  form: ManualPreviewFormState,
  vatCandidate: boolean,
): StaticWorkbenchKnowledge => {
  const domainId = resolveWorkflowDomainId(form, vatCandidate);
  const workflowDomain = getRequiredWorkflowDomain(domainId);
  const workflowMap = getRequiredWorkflowMap(domainId);
  const outputTypes = resolveOutputTypes(form, workflowDomain, vatCandidate);
  const outputRegistryEntries = OUTPUT_PREVIEW_TYPE_REGISTRY.filter((entry) => outputTypes.includes(entry.outputType));
  const outputPreviewSamples = STATIC_OUTPUT_PREVIEWS.filter((preview) => outputTypes.includes(preview.outputType));
  const vatSubmissionPolicy = REAL_ACTIONS_POLICY_MAP.find((policy) => policy.actionName === 'submit_vat_report');

  return { workflowDomain, workflowMap, outputRegistryEntries, outputPreviewSamples, vatSubmissionPolicy };
};

const detectBatchAwareness = (form: ManualPreviewFormState): BatchAwareness => {
  const searchable = buildSearchableText(form);
  const periodMatches = searchable.match(/\d{1,2}\.\d{2}/g) ?? [];
  const hasBatchSignal = includesAny(searchable, ['קבצים', 'מספר חשבונות', 'חבילת', 'קבוצת']) || /\d+\s*(חשבונות|קבלות|מסמכים)/.test(searchable);
  const hasDuplicateRisk = includesAny(searchable, ['סיכון כפילות', 'כפילות', 'כבר נקלט', 'נקלטו', 'לבדוק כפילות']);
  const hasBookkeepingSystemSignal = includesAny(searchable, ['מערכת הנהלת החשבונות', 'תוכנת הנהלת החשבונות', 'סטטוס קליטה', 'טרם נקלט', 'טרם נבדק', 'נקלט במערכת הנהלת החשבונות', 'לקליטה במערכת הנהלת החשבונות']);
  const hasMixedPeriodSignal = periodMatches.length > 1 || includesAny(searchable, ['תקופות', 'תקופת מע"מ', 'תקופת מע״מ', 'דוח מע"מ', 'דוח מע״מ']) || /\d{1,2}-\d{1,2}\/\d{4}/.test(searchable);
  const duplicateRiskLabel = hasDuplicateRisk ? 'גבוה' : hasBatchSignal || hasMixedPeriodSignal ? 'בינוני' : 'נמוך';
  const bookkeepingSystemStatusAssumption = includesAny(searchable, ['טרם נקלט', 'טרם נבדק', 'לקליטה במערכת הנהלת החשבונות']) ? 'טרם נקלט / טרם נבדק' : hasBookkeepingSystemSignal ? 'נדרש אימות מול תוכנת הנהלת החשבונות' : '';

  return { hasBatchSignal, hasDuplicateRisk, hasBookkeepingSystemSignal, hasMixedPeriodSignal, duplicateRiskLabel, bookkeepingSystemStatusAssumption };
};

const detectLikelyDocumentType = (form: ManualPreviewFormState, vatCandidate: boolean): string => {
  if (vatCandidate) return 'חשבונית ספק / ראיית הנהלת חשבונות למע״מ';
  if (form.sourceType === 'protocol') return 'מטא-דאטה של פרוטוקול פגישה';
  if (form.sourceType === 'email') return 'קליטת מטא-דאטה ממייל';
  if (form.sourceType === 'drive') return 'מטא-דאטה של מסמך Drive';
  if (form.sourceType === 'scan') return 'מטא-דאטה של מסמך סרוק';
  return 'מטא-דאטה מטקסט ידני';
};

const detectConfidenceLabel = (form: ManualPreviewFormState, vatCandidate: boolean): 'low' | 'medium' | 'high' => {
  if (vatCandidate && form.title.trim() && form.metadataSummary.trim()) return 'high';
  if (form.title.trim() || form.metadataSummary.trim()) return 'medium';
  return 'low';
};

const formatOutputSuggestions = (knowledge: StaticWorkbenchKnowledge): readonly string[] =>
  knowledge.outputRegistryEntries.map((entry) => {
    const previewSample = knowledge.outputPreviewSamples.find((preview) => preview.outputType === entry.outputType);
    const previewPurpose = previewSample?.professionalPurpose ? ` | מטרת תצוגה: ${previewSample.professionalPurpose}` : '';

    return `${entry.outputType} — ${OUTPUT_TYPE_HEBREW_LABELS[entry.outputType]} | יצירת תוצר חסומה: ${entry.generationBlocked ? 'כן' : 'לא'}${previewPurpose}`;
  });

const buildWorkflowGuidance = (knowledge: StaticWorkbenchKnowledge): readonly string[] => [
  `מפת תהליך סטטית: ${knowledge.workflowMap.workflowId}.`,
  `משפחת תהליך משוערת: ${knowledge.workflowMap.hebrewLabel}.`,
  `רמת סיכון לפי רישום Stage 11: ${RISK_HEBREW_LABELS[knowledge.workflowMap.riskLevel]}.`,
  `דרישת בודק: ${knowledge.workflowMap.reviewerRequirement}`,
  'אין הרצת תהליך ואין יצירת פעולה מתוך סביבת העבודה.',
];

const buildPolicyGuidance = (knowledge: StaticWorkbenchKnowledge): readonly string[] => {
  if (!knowledge.vatSubmissionPolicy) {
    return ['לא נמצאה מדיניות סטטית להגשת דוח מע״מ; כל פעולה אמיתית נשארת חסומה.'];
  }

  return [
    `מדיניות פעולה סטטית: ${knowledge.vatSubmissionPolicy.policyId}.`,
    `הגשת דוח מע״מ (${knowledge.vatSubmissionPolicy.actionName}) נשארת חסומה, ידנית בלבד, וברמת סיכון ${RISK_HEBREW_LABELS[knowledge.vatSubmissionPolicy.riskName]}.`,
    `סטטוס מדיניות: ${knowledge.vatSubmissionPolicy.status} | חסימת מימוש: ${knowledge.vatSubmissionPolicy.implementationBlocked ? 'כן' : 'לא'} | ידני בלבד: ${knowledge.vatSubmissionPolicy.manualOnly ? 'כן' : 'לא'}.`,
    'אין פעולה אמיתית, אין שליחה, ואין רישום מתוך Workbench.',
  ];
};

const buildEvidencePolicyGuidance = (): readonly string[] => [
  `מדיניות ראיות סטטית: ${EVIDENCE_FOLDER_RELATIONSHIP_POLICY.policyId}.`,
  'נדרש מעקב מקור לפני כל שימוש מקצועי.',
  'תיק מקור רשמי הוא מושג מטא-דאטה בלבד במסך הזה; אין פתרון נתיב אמיתי ואין יצירת תיקייה.',
  `כל פעולות הקובץ חסומות לפי ${EVIDENCE_FILE_OPERATION_BLOCK_POLICY.policyId}.`,
];

const buildVatGuidance = (vatCandidate: boolean): readonly string[] =>
  vatCandidate
    ? [
        'נראה שהמסמך רלוונטי לבדיקת מע״מ ולהנהלת חשבונות.',
        'סיווג מוצע: חשבונית ספק לבדיקה.',
        'יש לבדוק תאריך חשבונית, שם ספק, סכום לפני מע״מ, סכום מע״מ, תקופת דיווח, כפילות, וסיווג עסקי/פרטי/מעורב.',
        'תצוגה מקדימה בלבד, לא ייעוץ חשבונאי; נדרשת בדיקת אלדד לפני כל מסקנה מקצועית.',
      ]
    : [
        'לא זוהה עדיין סימן ברור למע״מ או להנהלת חשבונות.',
        'אם זה שייך לבדיקת מע״מ, הוסף נתוני מס, חשבונית, ספק, סכום או תקופת דיווח.',
      ];

const buildBatchAccountingSystemGuidance = (awareness: BatchAwareness): PreviewSection | null => {
  if (!awareness.hasBatchSignal && !awareness.hasDuplicateRisk && !awareness.hasBookkeepingSystemSignal && !awareness.hasMixedPeriodSignal) return null;

  return {
    title: 'בדיקת חבילת מסמכים / כפילות / מערכת הנהלת החשבונות',
    body: [
      'פרשנות מקומית של סביבת העבודה — לא כלל חשבונאי מחייב.',
      awareness.hasBatchSignal ? 'זוהתה חבילת מסמכים ולא פריט בודד.' : 'יש אינדיקציה שייתכן שלא מדובר בפריט בודד.',
      'יש לבדוק כל חשבון בנפרד לפני קליטה.',
      `סיכון כפילות: ${awareness.duplicateRiskLabel}.`,
      awareness.bookkeepingSystemStatusAssumption ? `סטטוס קליטה במערכת הנהלת החשבונות לפי ההנחה: ${awareness.bookkeepingSystemStatusAssumption}.` : 'סטטוס קליטה במערכת הנהלת החשבונות לא אומת מתוך התצוגה.',
      'אצל אלדד כרגע מערכת הנהלת החשבונות החיצונית היא מייבן.',
      'יש למפות כל חשבון לתקופת המע״מ הנכונה.',
      'אין להניח שכל 9 החשבונות שייכים לדוח מע״מ 03-04/2026.',
      'יש להשוות מול תוכנת הנהלת החשבונות / דוח מע״מ קודם לפני קליטה.',
    ],
  };
};

const buildQcSummary = (awareness: BatchAwareness): readonly string[] => [
  'אזהרות בקרת איכות: חסר סכום חשבונית, חסר שם ספק, חסר תאריך חשבונית, חסר מסמך מקור, המקור הוזן ידנית, אין שמירה במערכת.',
  ...(awareness.hasBatchSignal ? ['מדובר בחבילת מסמכים ולא במסמך יחיד'] : []),
  ...(awareness.hasDuplicateRisk ? ['יש סיכון כפילות'] : []),
  ...(awareness.hasMixedPeriodSignal ? ['יש תקופות דיווח שונות'] : []),
  ...(awareness.hasBatchSignal || awareness.hasMixedPeriodSignal ? ['נדרש מיפוי פרטני לכל חשבון', 'לא ניתן לקלוט כקבוצה אחת ללא בדיקה'] : []),
];

const buildSuggestedNextSteps = (awareness: BatchAwareness): readonly string[] =>
  awareness.hasBatchSignal || awareness.hasDuplicateRisk || awareness.hasMixedPeriodSignal
    ? [
        'להכין טבלת מיפוי לכל חשבון: תאריך, תקופה, סכום, מע״מ, האם נקלט במערכת הנהלת החשבונות',
        'לסמן חשבונות שכבר נקלטו ולהוציא אותם מהקליטה',
        'לשייך כל חשבון לתקופת הדיווח המתאימה',
        'רק לאחר מכן להחליט מה לקלוט במערכת הנהלת החשבונות',
      ]
    : [
        'בדוק אם החשבונית שייכת לתקופת המע״מ הנכונה',
        'ודא שהחשבונית לא נקלטה כבר',
        'הוסף סכום, תאריך וספק אם רוצים להפיק תצוגה מדויקת יותר',
        'אם זה מסמך אמיתי — שמור אותו בתיק המקור הרשמי מחוץ למערכת עד שיהיה Gate לקבצים',
      ];

const buildPreviewSections = (form: ManualPreviewFormState): readonly PreviewSection[] => {
  const title = form.title.trim() || 'Untitled manual preview';
  const client = form.clientOrCaseLabel.trim() || 'No client or case label';
  const summary = form.metadataSummary.trim() || 'No metadata summary entered';
  const vatCandidate = isVatBookkeepingCandidate(form);
  const staticKnowledge = resolveStaticWorkbenchKnowledge(form, vatCandidate);
  const likelyDocumentType = detectLikelyDocumentType(form, vatCandidate);
  const confidenceLabel = detectConfidenceLabel(form, vatCandidate);
  const batchAwareness = detectBatchAwareness(form);
  const batchSection = buildBatchAccountingSystemGuidance(batchAwareness);

  return [
    {
      title: 'תצוגת קלט',
      body: [`${form.sourceType} | ${title} | ${summary}`],
    },
    {
      title: 'סיכום עבודה מעשי',
      body: [
        `נראה שמדובר ב: ${likelyDocumentType}.`,
        `למה זה חשוב: ייתכן ש-${client} צריך החלטת הנהלת חשבונות או ראיות עם מקור ברור.`,
        'מה אלדד צריך לבדוק עכשיו: סכום, תאריך, ספק, תקופת מע״מ, והאם הפריט כבר נקלט במקום אחר.',
      ],
    },
    {
      title: 'סיווג מקצועי',
      body: [
        `תחום מוצע: ${staticKnowledge.workflowDomain.hebrewLabel} (${staticKnowledge.workflowDomain.domain})`,
        `סוג מסמך משוער: ${likelyDocumentType}`,
        `משפחת תהליך משוערת: ${staticKnowledge.workflowMap.hebrewLabel}`,
        `רמת ביטחון: ${confidenceLabel === 'high' ? 'גבוהה' : confidenceLabel === 'medium' ? 'בינונית' : 'נמוכה'}`,
        `רמת סיכון סטטית: ${RISK_HEBREW_LABELS[staticKnowledge.workflowDomain.defaultRiskLevel]}`,
      ],
    },
    { title: 'הצעת ניתוב', body: [`${staticKnowledge.workflowMap.workflowId} | ${client} | נתיב תצוגה מקומית בלבד`, ...buildWorkflowGuidance(staticKnowledge)] },
    {
      title: 'הנחיית מע״מ והנהלת חשבונות',
      body: buildVatGuidance(vatCandidate),
    },
    ...(batchSection ? [batchSection] : []),
    {
      title: 'תצוגת אישור / סימולציה',
      body: ['metadata_preview_only | נדרשת בדיקה מקומית', 'לא נוצר מצב אישור קבוע מתוך המסך הזה.'],
      simulation: true,
    },
    {
      title: 'תצוגה תפעולית',
      body: ['חבילת תצוגה היפותטית | כל ההשפעות האמיתיות חסומות', 'לא נוצר אובייקט תפעולי.'],
    },
    {
      title: 'הצעת תוצר',
      body: [
        'תוצרי תצוגה מוצעים מתוך רישום Stage 10 בלבד:',
        ...formatOutputSuggestions(staticKnowledge),
        `מבוסס רק על ${form.sourceType}, ${staticKnowledge.workflowDomain.hebrewLabel}, והמטא-דאטה שהוזנו.`,
      ],
    },
    {
      title: 'סיכום בקרת איכות',
      body: buildQcSummary(batchAwareness),
    },
    {
      title: 'רשימת בדיקת ראיות',
      body: [
        ...buildEvidencePolicyGuidance(),
        'נדרש מעקב מקור',
        'נדרש מסמך מקור',
        'נדרש שם ספק',
        'נדרשים שדות סכום / תאריך / מע״מ',
        'נדרשת הוכחת תשלום אם רלוונטי',
        'נדרש אימות תווית לקוח / תיק',
      ],
    },
    {
      title: 'רמזי ראיות',
      body: [`${client} | רמז למעקב מקור בלבד`, `מדיניות תיק מקור: ${EVIDENCE_FOLDER_RELATIONSHIP_POLICY.scope}.`, 'את המסמך האמיתי יש לשמור בתיק המקור הרשמי מחוץ לתצוגה הזו.'],
    },
    {
      title: 'רמזי למידה',
      body: [`${staticKnowledge.workflowDomain.hebrewLabel} | רמז תצפית לא מחייב`, 'אין כתיבה לזיכרון או ליומן ידע.'],
    },
    {
      title: 'הצעד הבא המוצע לאלדד',
      body: buildSuggestedNextSteps(batchAwareness),
    },
    {
      title: 'פאנל בטיחות',
      body: [
        ...buildPolicyGuidance(staticKnowledge),
        'אין שמירה במערכת',
        'אין חיבור לספקי מידע',
        'אין גישה לקבצים',
        'לא נוצרה משימה תפעולית',
        'לא נרשמה פקודת הנהלת חשבונות',
        'לא תויק מסמך',
      ],
    },
  ];
};
// #endregion

// #region Components
function PreviewBadge({ simulation }: PreviewBadgeProps) {
  return (
    <span style={{ color: '#67e8f9', fontWeight: 800, marginInlineStart: 8 }}>
      [תצוגה מקדימה]{simulation ? ' [סימולציה]' : ''}
    </span>
  );
}

function PreviewCard({ section }: PreviewCardProps) {
  return (
    <article data-testid="manual-preview-section" style={cardStyle}>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>
        {section.title}
        <PreviewBadge simulation={section.simulation} />
      </h3>
      <ul style={{ margin: 0, paddingInlineStart: 18, color: '#cbd5e1', lineHeight: 1.6 }}>
        {section.body.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </article>
  );
}

function FieldTextInput({ id, label, placeholder, value, onChange }: FieldTextInputProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>{label}</span>
      <input id={id} aria-label={label} placeholder={placeholder} value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function FieldTextArea({ id, label, placeholder, value, onChange }: FieldTextAreaProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 7 }}>
      <span>{label}</span>
      <textarea
        id={id}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={5}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </label>
  );
}
// #endregion

// #region Component
/**
 * ManualPreviewWorkbench — Local-only internal workbench for previewing manual Brain metadata.
 *
 * @example
 * <ManualPreviewWorkbench />
 */
export default function ManualPreviewWorkbench() {
  const [form, setForm] = useState<ManualPreviewFormState>(INITIAL_FORM_STATE);
  const previewSections = buildPreviewSections(form);
  const previewReady = hasPreviewInput(form);
  const searchableText = useMemo(() => buildSearchableText(form), [form]);
  const batchAwareness = useMemo(() => detectBatchAwareness(form), [form]);

  const updateText = (field: keyof ManualPreviewFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateSourceType = (event: ChangeEvent<HTMLSelectElement>) =>
    setForm((current) => ({ ...current, sourceType: event.target.value as ManualPreviewSourceType }));

  return (
    <main style={shellStyle} dir="rtl" lang="he">
      <section style={panelStyle}>
        <div style={{ ...cardStyle, borderColor: 'rgba(251, 191, 36, 0.55)' }}>
          <strong>⚠️ סביבת עבודה פנימית — תצוגה מקדימה בלבד — שום דבר לא נשמר</strong>
        </div>

        <form style={{ ...cardStyle, display: 'grid', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Manual Preview Workbench</h1>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>הזן כאן קלט ידני כדי לראות כיצד המוח היה מסווג, בודק ומציע המשך טיפול — ללא שמירה וללא פעולה אמיתית.</p>
          <div style={formGridStyle}>
            <FieldTextInput id="manual-preview-title" label={FIELD_LABELS.title} placeholder={PLACEHOLDERS.title} value={form.title} onChange={updateText('title')} />
            <label htmlFor="manual-preview-source-type" style={{ display: 'grid', gap: 7 }}>
              <span>{FIELD_LABELS.sourceType}</span>
              <select id="manual-preview-source-type" aria-label={FIELD_LABELS.sourceType} value={form.sourceType} onChange={updateSourceType} style={inputStyle}>
                {SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>{SOURCE_TYPE_LABELS[sourceType]}</option>
                ))}
              </select>
            </label>
            <FieldTextInput id="manual-preview-client" label={FIELD_LABELS.clientOrCaseLabel} placeholder={PLACEHOLDERS.clientOrCaseLabel} value={form.clientOrCaseLabel} onChange={updateText('clientOrCaseLabel')} />
            <FieldTextInput id="manual-preview-domain" label={FIELD_LABELS.domainLabel} placeholder={PLACEHOLDERS.domainLabel} value={form.domainLabel} onChange={updateText('domainLabel')} />
          </div>
          <FieldTextArea id="manual-preview-summary" label={FIELD_LABELS.metadataSummary} placeholder={PLACEHOLDERS.metadataSummary} value={form.metadataSummary} onChange={updateText('metadataSummary')} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setForm(INITIAL_FORM_STATE)}>איפוס</button>
            <button type="button" onClick={() => setForm({ ...INITIAL_FORM_STATE })}>נקה</button>
          </div>
        </form>

        {previewReady ? (
          <> <IntakeSignalSummary searchableText={searchableText} />
            <section aria-label="preview cascade" style={{ display: 'grid', gap: 14 }}>
              {previewSections.map((section) => <PreviewCard key={section.title} section={section} />)}
            </section>
            <VatMappingTablePreview
              hasBatchSignal={batchAwareness.hasBatchSignal}
              hasDuplicateRisk={batchAwareness.hasDuplicateRisk}
              searchableText={searchableText}
            />
            <ScannedEvidenceBatchPreview searchableText={searchableText} />
            <BrainKnowledgeInventoryPreview searchableText={searchableText} />
          </>
        ) : null}
      </section>
    </main>
  );
}
// #endregion

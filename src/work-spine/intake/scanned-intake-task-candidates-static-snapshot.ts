/* ============================================
   FILE: scanned-intake-task-candidates-static-snapshot.ts
   PURPOSE: Static read-only snapshot from the approved scanned intake task candidate dry run.
   DEPENDENCIES: None
   EXPORTS: SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT and related display types
   ============================================ */

// #region Types
export interface ScannedIntakeTaskCandidateStaticItem {
  taskCandidateId: string;
  sourceGroupName: string;
  suggestedTitle: string;
  titleSource: 'auto_folder_name';
  sourceFilesCount: number;
  sampleSourceFileNames: string[];
  confidence: 'low';
  taskStatus: 'candidate';
  requiresEldadApproval: true;
  suggestedDueDate: null;
  suggestedMatterId: null;
  suggestedOwner: null;
  suggestedPriority: null;
  reviewStatus: 'not_reviewed';
  decisionRequired: true;
  canPromoteToWorkItem: false;
  missingDecisionFields: readonly ScannedIntakeTaskCandidateMissingDecisionField[];
  recommendedNextHumanAction: 'אלדד צריך לבדוק את מקור המשימה לפני פתיחה';
}

export type ScannedIntakeTaskCandidateMissingDecisionField =
  | 'matterDecision'
  | 'taskTitleApproval'
  | 'ownerDecision'
  | 'dueDateDecision'
  | 'priorityDecision'
  | 'evidenceReview';

export interface ScannedIntakeTaskCandidateStaticSnapshot {
  summary: {
    totalTaskCandidates: number;
    titleMismatches: number;
    genericTitleViolations: number;
    warningsCount: number;
  };
  warnings: Array<{
    code: string;
    count: number;
    warningAlteredTitle: false;
  }>;
  taskCandidates: ScannedIntakeTaskCandidateStaticItem[];
}
// #endregion

// #region Review Checklist
const TASK_CANDIDATE_REVIEW_CHECKLIST: Pick<
  ScannedIntakeTaskCandidateStaticItem,
  'reviewStatus' | 'decisionRequired' | 'canPromoteToWorkItem' | 'missingDecisionFields' | 'recommendedNextHumanAction'
> = {
  reviewStatus: 'not_reviewed',
  decisionRequired: true,
  canPromoteToWorkItem: false,
  missingDecisionFields: [
    'matterDecision',
    'taskTitleApproval',
    'ownerDecision',
    'dueDateDecision',
    'priorityDecision',
    'evidenceReview',
  ],
  recommendedNextHumanAction: 'אלדד צריך לבדוק את מקור המשימה לפני פתיחה',
};
// #endregion

// #region Snapshot
export const SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT: ScannedIntakeTaskCandidateStaticSnapshot = {
  summary: {
    totalTaskCandidates: 18,
    titleMismatches: 0,
    genericTitleViolations: 0,
    warningsCount: 6,
  },
  warnings: [
    {
      code: 'source_group_name_contains_action_verb',
      count: 6,
      warningAlteredTitle: false,
    },
  ],
  taskCandidates: [
    {
      taskCandidateId: 'scan-task-153ukhq',
      sourceGroupName: 'אוזנה ניסים טיפול מס',
      suggestedTitle: 'תיקיית סריקה: אוזנה ניסים טיפול מס',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 2,
      sampleSourceFileNames: [
        'טופס יפוי כוח חתום אוזנה ניסים.pdf',
        'טופס יפוי כוח רוח התקבל מהבן של ניסים אוזנה יניב במייל.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-10zjef1',
      sourceGroupName: 'הודעות חשובות מגוגל',
      suggestedTitle: 'תיקיית סריקה: הודעות חשובות מגוגל',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 2,
      sampleSourceFileNames: [
        'Gmail - מחיר ההיכרות של Google One עומד להסתיים בתאריך 23 באפר׳ 2026.pdf',
        'Gmail - מחיר ההיכרות של PDF Reader App _ Read All PDF עומד להסתיים בתאריך 21 באפר׳ 2026.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-j1y0lx',
      sourceGroupName: 'חומר למע דוד אלדד 3-4.26',
      suggestedTitle: 'תיקיית סריקה: חומר למע דוד אלדד 3-4.26',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 11,
      sampleSourceFileNames: [
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-17 באפר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 באפר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 במרץ 2026.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1kvce9g',
      sourceGroupName: 'שובר לתשלום ארנונה 3-4.26 דוד אלדד',
      suggestedTitle: 'תיקיית סריקה: שובר לתשלום ארנונה 3-4.26 דוד אלדד',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['שובר תקופתי ומעבר לביצוע תשלום מקוון לאשקלון.pdf'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1vuhote',
      sourceGroupName: '2026-04-12 חשבון חשמל דוד אלדד ששולם 11.25-1.26',
      suggestedTitle: 'תיקיית סריקה: 2026-04-12 חשבון חשמל דוד אלדד ששולם 11.25-1.26',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['חשבון חשמל 11.25-1.26.pdf'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1lbwdha',
      sourceGroupName: 'חוב חשמל לתשלום דוד אלדד 9.1.26 ועד 9.3.26',
      suggestedTitle: 'תיקיית סריקה: חוב חשמל לתשלום דוד אלדד 9.1.26 ועד 9.3.26',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['חשבונית חשמל לתקופה.pdf'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-e9iwom',
      sourceGroupName: '2026-04-12 חשבונית נטוויזן 8.1.26 דוד אלדד',
      suggestedTitle: 'תיקיית סריקה: 2026-04-12 חשבונית נטוויזן 8.1.26 דוד אלדד',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['נט וויזן חשבונית.pdf'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1mn8fcn',
      sourceGroupName: '2026-04-12 חשבונית צמיגי המילניום מסחר ושירותים תיקון תקן רכב אלדד',
      suggestedTitle: 'תיקיית סריקה: 2026-04-12 חשבונית צמיגי המילניום מסחר ושירותים תיקון תקן רכב אלדד',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['חשבונית צמיגי המילניום.pdf'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-s4ja5s',
      sourceGroupName: 'חומר מגיע למייל ממויין למוסדות אלדד',
      suggestedTitle: 'תיקיית סריקה: חומר מגיע למייל ממויין למוסדות אלדד',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 9,
      sampleSourceFileNames: [
        'בזק חשבון 12.25 דוד אלדד.pdf',
        'בזק חשבון ינואר 2026 דוד אלדד.pdf',
        'חשבון בזק מרץ 2026.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-14bz1oz',
      sourceGroupName: 'חשבונות גוגל פטורות ממעמ',
      suggestedTitle: 'תיקיית סריקה: חשבונות גוגל פטורות ממעמ',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 5,
      sampleSourceFileNames: [
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-13 בפבר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 בפבר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-5 בינו׳ 2026.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1sjlpr5',
      sourceGroupName: 'חותמת דוד אלדד רוח',
      suggestedTitle: 'תיקיית סריקה: חותמת דוד אלדד רוח',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['WhatsApp Image 2026-04-26 at 11.31.01.jpeg'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-mz3p1r',
      sourceGroupName: 'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
      suggestedTitle: 'תיקיית סריקה: חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 4,
      sampleSourceFileNames: [
        'balance_confirmation_09042026_210219.pdf',
        '‏‏cardcurrentdebittransactions_20260409205600 - עותק.pdf',
        'lasttransactions_20260409210134.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1lewek9',
      sourceGroupName: 'טיפול בחובות מי אשקלון',
      suggestedTitle: 'תיקיית סריקה: טיפול בחובות מי אשקלון',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 3,
      sampleSourceFileNames: [
        'חשבון תקופתי מים 1-2.26 דוד אלדד.pdf',
        'חשבון תקופתי מים 11-12.25 דוד אלדד.pdf',
        'חשבון תקופתי מים ספטמבר אוקטובר 2025 דוד אלדד.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-19r0cv2',
      sourceGroupName: 'טיפול בתשלום אמבולנס פינוי אמא של אלדד',
      suggestedTitle: 'תיקיית סריקה: טיפול בתשלום אמבולנס פינוי אמא של אלדד',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 1,
      sampleSourceFileNames: ['cffe5cfe-1bb6-4608-b5c1-2836075f8218.jpg'],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-awc9ph',
      sourceGroupName: 'טיפול שוטף רוביום',
      suggestedTitle: 'תיקיית סריקה: טיפול שוטף רוביום',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 4,
      sampleSourceFileNames: [
        'העברה מחשבון של אלדד לעורך דין גל בן דוד עבור שכר טרחה חברה 1770 שח.pdf',
        'חשבונית שכט טרחה עורך דין.pdf',
        'יפוי כוח דוד אלדד רוביום רשות המיסים.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1nitnqb',
      sourceGroupName: 'הצהרת בעל מניות ודירקטור קיריל רוביום',
      suggestedTitle: 'תיקיית סריקה: הצהרת בעל מניות ודירקטור קיריל רוביום',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 2,
      sampleSourceFileNames: [
        'הצהרת בעלי מניות- קיריל חתום.pdf',
        'הצהרת דירקטור-קיריל חתום.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-xi80zk',
      sourceGroupName: 'מסמכים בכורי פריש בדיקת דיני עבודה',
      suggestedTitle: 'תיקיית סריקה: מסמכים בכורי פריש בדיקת דיני עבודה',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 6,
      sampleSourceFileNames: [
        'חוזה עבודה אישי עמוד 1-6.PDF',
        'חשבון עסקה 19.10.25.pdf',
        'טופס 106 שנת 2025.pdf',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
    {
      taskCandidateId: 'scan-task-1epqt4z',
      sourceGroupName: 'מסמכים שונים סיירת א.ח ראשון בביטחון בעמ',
      suggestedTitle: 'תיקיית סריקה: מסמכים שונים סיירת א.ח ראשון בביטחון בעמ',
      titleSource: 'auto_folder_name',
      sourceFilesCount: 6,
      sampleSourceFileNames: [
        'הסכם שירות דף ראשון א.גיא הובלות ציוד כבד בעמ ח.פ. 516634193.jpeg',
        'הסכם שירות דף ראשון אריק ששון שאיבת חול וסחר בעמ ח.פ. 515214203.jpg',
        'הסכם שירות דף ראשון יגאל עבודות בניה וכלונסאות בעמ ח.פ. 515653525.jpeg',
      ],
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      ...TASK_CANDIDATE_REVIEW_CHECKLIST,
    },
  ],
};
// #endregion

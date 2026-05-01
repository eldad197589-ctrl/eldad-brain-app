/* ============================================
   FILE: scanned-intake-static-snapshot.ts
   PURPOSE: Static read-only snapshot from the latest scanned intake staging dry run.
   DEPENDENCIES: None
   EXPORTS: SCANNED_INTAKE_STATIC_SNAPSHOT and related display types
   ============================================ */

// #region Types
export interface ScannedIntakeStaticGroup {
  parentFolderName: string;
  relativeFolder: string;
  folderPath: string;
  candidatesCount: number;
  sampleFileNames: string[];
}

export interface ScannedIntakeStaticSnapshot {
  summary: {
    totalCandidates: number;
    groupsCount: number;
    warningsCount: number;
    errors: number;
  };
  listing: {
    supportedFiles: number;
    ignoredFiles: number;
    scannedFolders: number;
    maxDepthSkipped: number;
    errors: number;
  };
  groups: ScannedIntakeStaticGroup[];
}
// #endregion

// #region Snapshot
export const SCANNED_INTAKE_STATIC_SNAPSHOT: ScannedIntakeStaticSnapshot = {
  summary: {
    totalCandidates: 61,
    groupsCount: 18,
    warningsCount: 0,
    errors: 0,
  },
  listing: {
    supportedFiles: 61,
    ignoredFiles: 71,
    scannedFolders: 35,
    maxDepthSkipped: 0,
    errors: 0,
  },
  groups: [
    {
      parentFolderName: 'אוזנה ניסים טיפול מס',
      relativeFolder: 'אוזנה ניסים טיפול מס',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\אוזנה ניסים טיפול מס',
      candidatesCount: 2,
      sampleFileNames: [
        'טופס יפוי כוח חתום אוזנה ניסים.pdf',
        'טופס יפוי כוח רוח התקבל מהבן של ניסים אוזנה יניב במייל.pdf',
      ],
    },
    {
      parentFolderName: 'הודעות חשובות מגוגל',
      relativeFolder: 'הודעות חשובות מגוגל',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\הודעות חשובות מגוגל',
      candidatesCount: 2,
      sampleFileNames: [
        'Gmail - מחיר ההיכרות של Google One עומד להסתיים בתאריך 23 באפר׳ 2026.pdf',
        'Gmail - מחיר ההיכרות של PDF Reader App _ Read All PDF עומד להסתיים בתאריך 21 באפר׳ 2026.pdf',
      ],
    },
    {
      parentFolderName: 'חומר למע דוד אלדד 3-4.26',
      relativeFolder: 'חומר למע דוד אלדד 3-4.26',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למע דוד אלדד 3-4.26',
      candidatesCount: 11,
      sampleFileNames: [
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-17 באפר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 באפר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 במרץ 2026.pdf',
      ],
    },
    {
      parentFolderName: 'שובר לתשלום ארנונה 3-4.26 דוד אלדד',
      relativeFolder: 'חומר למע דוד אלדד 3-4.26\\שובר לתשלום ארנונה 3-4.26 דוד אלדד',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למע דוד אלדד 3-4.26\\שובר לתשלום ארנונה 3-4.26 דוד אלדד',
      candidatesCount: 1,
      sampleFileNames: ['שובר תקופתי ומעבר לביצוע תשלום מקוון לאשקלון.pdf'],
    },
    {
      parentFolderName: '2026-04-12 חשבון חשמל דוד אלדד ששולם 11.25-1.26',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\הוצאות מעורבות לבדיקה\\2026-04-12 חשבון חשמל דוד אלדד ששולם 11.25-1.26',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\הוצאות מעורבות לבדיקה\\2026-04-12 חשבון חשמל דוד אלדד ששולם 11.25-1.26',
      candidatesCount: 1,
      sampleFileNames: ['חשבון חשמל 11.25-1.26.pdf'],
    },
    {
      parentFolderName: 'חוב חשמל לתשלום דוד אלדד 9.1.26 ועד 9.3.26',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\הוצאות מעורבות לבדיקה\\חוב חשמל לתשלום דוד אלדד 9.1.26 ועד 9.3.26',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\הוצאות מעורבות לבדיקה\\חוב חשמל לתשלום דוד אלדד 9.1.26 ועד 9.3.26',
      candidatesCount: 1,
      sampleFileNames: ['חשבונית חשמל לתקופה.pdf'],
    },
    {
      parentFolderName: '2026-04-12 חשבונית נטוויזן 8.1.26 דוד אלדד',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\חומר ידני-הגיע בדואר-נסרק ידנית\\2026-04-12 חשבונית נטוויזן 8.1.26 דוד אלדד',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\חומר ידני-הגיע בדואר-נסרק ידנית\\2026-04-12 חשבונית נטוויזן 8.1.26 דוד אלדד',
      candidatesCount: 1,
      sampleFileNames: ['נט וויזן חשבונית.pdf'],
    },
    {
      parentFolderName: '2026-04-12 חשבונית צמיגי המילניום מסחר ושירותים תיקון תקן רכב אלדד',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\חומר ידני-הגיע בדואר-נסרק ידנית\\2026-04-12 חשבונית צמיגי המילניום מסחר ושירותים תיקון תקן רכב אלדד',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\חומר ידני-הגיע בדואר-נסרק ידנית\\2026-04-12 חשבונית צמיגי המילניום מסחר ושירותים תיקון תקן רכב אלדד',
      candidatesCount: 1,
      sampleFileNames: ['חשבונית צמיגי המילניום.pdf'],
    },
    {
      parentFolderName: 'חומר מגיע למייל ממויין למוסדות אלדד',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\חומר מגיע למייל ממויין למוסדות אלדד',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\חומר מגיע למייל ממויין למוסדות אלדד',
      candidatesCount: 9,
      sampleFileNames: [
        'בזק חשבון 12.25 דוד אלדד.pdf',
        'בזק חשבון ינואר 2026 דוד אלדד.pdf',
        'חשבון בזק מרץ 2026.pdf',
      ],
    },
    {
      parentFolderName: 'חשבונות גוגל פטורות ממעמ',
      relativeFolder: 'חומר למעמ דוד אלדד 1-2.26\\חומר מגיע למייל ממויין למוסדות אלדד\\חשבונות גוגל פטורות ממעמ',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חומר למעמ דוד אלדד 1-2.26\\חומר מגיע למייל ממויין למוסדות אלדד\\חשבונות גוגל פטורות ממעמ',
      candidatesCount: 5,
      sampleFileNames: [
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-13 בפבר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-2 בפבר׳ 2026.pdf',
        'Gmail - הקבלה שלך על הזמנה ב-Google Play מ-5 בינו׳ 2026.pdf',
      ],
    },
    {
      parentFolderName: 'חותמת דוד אלדד רוח',
      relativeFolder: 'חותמת דוד אלדד רוח',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חותמת דוד אלדד רוח',
      candidatesCount: 1,
      sampleFileNames: ['WhatsApp Image 2026-04-26 at 11.31.01.jpeg'],
    },
    {
      parentFolderName: 'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
      relativeFolder: 'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
      candidatesCount: 4,
      sampleFileNames: [
        'balance_confirmation_09042026_210219.pdf',
        '‏‏cardcurrentdebittransactions_20260409205600 - עותק.pdf',
        'lasttransactions_20260409210134.pdf',
      ],
    },
    {
      parentFolderName: 'טיפול בחובות מי אשקלון',
      relativeFolder: 'טיפול בחובות מי אשקלון',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\טיפול בחובות מי אשקלון',
      candidatesCount: 3,
      sampleFileNames: [
        'חשבון תקופתי מים 1-2.26 דוד אלדד.pdf',
        'חשבון תקופתי מים 11-12.25 דוד אלדד.pdf',
        'חשבון תקופתי מים ספטמבר אוקטובר 2025 דוד אלדד.pdf',
      ],
    },
    {
      parentFolderName: 'טיפול בתשלום אמבולנס פינוי אמא של אלדד',
      relativeFolder: 'טיפול בתשלום אמבולנס פינוי אמא של אלדד',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\טיפול בתשלום אמבולנס פינוי אמא של אלדד',
      candidatesCount: 1,
      sampleFileNames: ['cffe5cfe-1bb6-4608-b5c1-2836075f8218.jpg'],
    },
    {
      parentFolderName: 'טיפול שוטף רוביום',
      relativeFolder: 'טיפול שוטף רוביום',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\טיפול שוטף רוביום',
      candidatesCount: 4,
      sampleFileNames: [
        'העברה מחשבון של אלדד לעורך דין גל בן דוד עבור שכר טרחה חברה 1770 שח.pdf',
        'חשבונית שכט טרחה עורך דין.pdf',
        'יפוי כוח דוד אלדד רוביום רשות המיסים.pdf',
      ],
    },
    {
      parentFolderName: 'הצהרת בעל מניות ודירקטור קיריל רוביום',
      relativeFolder: 'טיפול שוטף רוביום\\הצהרת בעל מניות ודירקטור קיריל רוביום',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\טיפול שוטף רוביום\\הצהרת בעל מניות ודירקטור קיריל רוביום',
      candidatesCount: 2,
      sampleFileNames: [
        'הצהרת בעלי מניות- קיריל חתום.pdf',
        'הצהרת דירקטור-קיריל חתום.pdf',
      ],
    },
    {
      parentFolderName: 'מסמכים בכורי פריש בדיקת דיני עבודה',
      relativeFolder: 'מסמכים בכורי פריש בדיקת דיני עבודה',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\מסמכים בכורי פריש בדיקת דיני עבודה',
      candidatesCount: 6,
      sampleFileNames: [
        'חוזה עבודה אישי עמוד 1-6.PDF',
        'חשבון עסקה 19.10.25.pdf',
        'טופס 106 שנת 2025.pdf',
      ],
    },
    {
      parentFolderName: 'מסמכים שונים סיירת א.ח ראשון בביטחון בעמ',
      relativeFolder: 'מסמכים שונים סיירת א.ח ראשון בביטחון בעמ',
      folderPath: 'C:\\Users\\1\\OneDrive\\שולחן העבודה\\אלדד\\גרוויטי תקיות\\המוח של אלדד\\סריקות\\מסמכים שונים סיירת א.ח ראשון בביטחון בעמ',
      candidatesCount: 6,
      sampleFileNames: [
        'הסכם שירות דף ראשון א.גיא הובלות ציוד כבד בעמ ח.פ. 516634193.jpeg',
        'הסכם שירות דף ראשון אריק ששון שאיבת חול וסחר בעמ ח.פ. 515214203.jpg',
        'הסכם שירות דף ראשון יגאל עבודות בניה וכלונסאות בעמ ח.פ. 515653525.jpeg',
      ],
    },
  ],
};
// #endregion

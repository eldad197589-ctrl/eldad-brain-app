/* ============================================
   FILE: competitorsData.ts
   PURPOSE: Static competitor data for market comparison page
   DEPENDENCIES: None
   EXPORTS: Competitor, TortureTestRow, CapabilityItem, COMPETITORS, TORTURE_TEST_ROWS
   ============================================ */
export type Competitor = {
    name: string;
    price: string;
    hebrew: string;
    type: string;
    weakness: string;
};

export type TortureTestRow = {
    dim: string;
    teams: string;
    whisper: string;
    proto: string;
    note: string;
};

export type CapabilityItem = {
    cap: string;
    status: string;
    color: 'emerald' | 'amber';
    note: string;
};

export const COMPETITORS: Competitor[] = [
    // ── ישראליים ──
    { name: 'Winn.AI 🇮🇱', price: 'Enterprise', hebrew: 'חלקי', type: 'Sales AI', weakness: 'מתמקד אך ורק בניתוח עסקאות לאנשי מכירות; לא מענה חוצה-ארגון לפגישות הנהלה וצוות' },
    { name: 'AudioCodes Voice.AI 🇮🇱', price: 'Enterprise', hebrew: '✅ מלא', type: 'Call Center / תשתית', weakness: 'תשתית טלקום ובוטים למוקדים — אינה סוכן קצה (SaaS) זמין המצטרף לפגישות משרדיות' },
    { name: 'Verbit 🇮🇱', price: 'Enterprise', hebrew: '✅ מלא', type: 'מתמלל', weakness: 'תמלול גרידא (משפט וחינוך) ללא אינטליגנציה אקטיבית וסוכן AI המסוגל לגזור משימות' },
    { name: 'NICE CXone 🇮🇱', price: 'Enterprise', hebrew: '✅ מלא', type: 'Call Center', weakness: 'פלטפורמה כבדה למוקדי שירות המוניים — לא עוזר ממוקד לפגישות B2B יומיומיות' },
    { name: 'Sumit-AI 🇮🇱', price: '₪100-200', hebrew: '✅ מלא', type: 'מתמלל / עוזר', weakness: 'סיכום פסיבי בלבד; פרוטוקול הוא סוכן AI אקטיבי שיודע לפעול (CRM, משימות, פגישות המשך)' },
    { name: 'VoiceBox 🇮🇱', price: 'Enterprise', hebrew: '✅ מלא', type: 'מתמלל / Call Center', weakness: 'אנליזה קולית ארגונית — לא עוזר פגישות וירטואלי המייצר פרוטוקול עבודה לעובד הקצה' },
    { name: 'Gong.io 🇮🇱', price: 'Enterprise (מאות ₪)', hebrew: '✅ מלא', type: 'Sales AI', weakness: 'יקר מאוד, מיועד לאימון צוותי מכירות — מורכב ויקר מדי כעוזר פגישות לכל עובד בארגון' },
    { name: 'Kangaroo AI 🇮🇱', price: 'טרם ידוע', hebrew: 'חלקי', type: 'סוכן AI / עוזר פגישות', weakness: 'עברית חלקית בלבד; פרוטוקול מציע חוויית שפת אם חלקה ומלאה' },
    { name: 'MemoPen (Recorio) 🇮🇱', price: '₪399 חד-פעמי', hebrew: '✅ מלא', type: 'חומרה / עט AI', weakness: 'גאדג\'ט הקלטה סיני (dropshipping); תמלול בסיסי בלבד — אין סוכן AI, אין חילוץ משימות, CRM או למידה ארגונית' },
    { name: 'AI21 Labs 🇮🇱', price: 'API', hebrew: '✅ מלא', type: 'תשתית (מודל שפה)', weakness: 'מנוע שפה למפתחים — אין ממשק קצה (SaaS) מוכן ללקוח העסקי' },

    // ── גלובליים ──
    { name: 'Google Gemini (Meet)', price: '~₪75 (Workspace)', hebrew: '✅ כתוביות חיות', type: 'עוזר כללי', weakness: 'מוצר גלובלי ורחב שאינו תפור לדקויות ולסלנג של התרבות העסקית בישראל' },
    { name: 'Zoom AI Companion', price: 'כלול במנוי', hebrew: '✅ כתוביות', type: 'עוזר כללי', weakness: 'נעול בתוך Zoom בלבד; פרוטוקול אגנוסטי — פועל בכל פלטפורמה ובפגישות פיזיות' },
    { name: 'Cisco Webex AI', price: 'Enterprise', hebrew: 'חלקי', type: 'עוזר כללי', weakness: 'עברית חסרה; דורש שימוש בלעדי בתשתיות סיסקו' },
    { name: 'Microsoft Copilot', price: '₪77-156', hebrew: '✅ מלא', type: 'עוזר כללי', weakness: 'תלוי ברישיונות M365, לא מחובר לסלולר, לא סוכן AI ממוקד פגישות' },
    { name: 'Fireflies.ai', price: '~₪70 ($19 Pro)', hebrew: 'חלקי', type: 'סוכן AI / עוזר', weakness: 'עברית זקוקה לשיפור; לא מתמודד עם ערבוב אנגלית-עברית (Heblish) הנפוץ בהיי-טק' },
    { name: 'Otter.ai', price: '~₪75 ($20 Pro)', hebrew: '❌ אין', type: 'מתמלל / עוזר', weakness: 'חוסר תמיכה מוחלט בעברית — לא רלוונטי ללקוח העסקי הישראלי' },
    { name: 'TurboScribe', price: '~₪40 ($10)', hebrew: '✅ מלא', type: 'מתמלל', weakness: 'כלי סטטי להעלאת קבצים — חסר נוכחות בזמן אמת, זיהוי דוברים וניהול משימות' },
];

export const TORTURE_TEST_ROWS: TortureTestRow[] = [
    { dim: 'קלט', teams: 'אותה שיחה', whisper: 'אותה שיחה', proto: 'אותה שיחה', note: '' },
    { dim: 'דיוק תמלול עברית', teams: '~70%', whisper: '~80%', proto: '~92%', note: 'fine-tuned pipeline' },
    { dim: 'זיהוי דוברים', teams: '❌ אין', whisper: '❌ אין', proto: '✅ 4+ דוברים', note: '' },
    { dim: 'חילוץ משימות', teams: '❌ ידני', whisper: '❌ אין', proto: '✅ 7+ משימות + אחראים', note: '' },
    { dim: 'אימייל Follow-up', teams: '❌ לא זמין', whisper: '❌ לא זמין', proto: '✅ אוטומטי', note: '' },
    { dim: 'תמיכה בטלפוניה', teams: 'Zoom/Teams בלבד', whisper: 'העלאת קובץ בלבד', proto: 'PBX, SIP, נייד, Zoom, Teams', note: '' },
];

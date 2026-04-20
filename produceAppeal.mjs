/* ============================================
   FILE: produceAppeal.mjs
   PURPOSE: Production script — generates DOCX + HTML + ZIP
            for Dima Rodnitsky appeal, using wordExportService
   SOURCE OF TRUTH: caseBuilderHelpers.ts v25
   QA: Passed 12/12 checks (2026-04-06)
   ============================================ */

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel, SectionType, PageNumber } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Source of Truth: 11 counter-arguments ───
const CLAIMS = [
  { claim: 'סעיף 1: תביעתך הוגשה בנוגע לעסקך בתחום התיווך שכתובתו רשומה באשקלון...', counter: 'אנו מאשרים את מסגרת הערר: כתובת העסק באשקלון, והתביעה מוגשת למסלול האדום בגין נזק עקיף לתקופת אוקטובר-דצמבר 2023 עקב מלחמת "חרבות ברזל".' },
  { claim: 'סעיף 2-3: "נזק עקיף" מוגדר בחוק מס רכוש...', counter: 'אכן, נזק עקיף כולל קודם כל "מניעת רווח" ביישוב ספר עקב המלחמה. תביעתנו כולה מתבססת על מניעת הרווח מעסקאות התיווך שעמדו בסף סגירה (בסך 77,080 ₪) ולא יצאו לפועל בשל המצב הביטחוני במדינה.' },
  { claim: 'סעיף 4: תנאי לזכאות לפיצוי...', counter: 'מוסכם. התנאים המצטברים לזכאות פיצוי יישוב ספר, כאמור בתקנות מס רכוש, חלים במלואם על העוסק: עסק פעיל ערב המלחמה, הממוקם ביישוב ספר (אשקלון), שניזוק באופן ישיר בשל הלחימה.' },
  { claim: 'סעיף 5: נטל ההוכחה...', counter: 'הרשות נשענת על שלוש הלכות שונות לעניין נטל ההוכחה (קטיף, עמק איילון ובקעות). להלן ניתוח חלוקת ההלכות אשר ממחיש את שגיאתה היסודית של הרשות ביישומן:\n\nפסקי הדין: רע"א 1942/12 רהיטי עמק איילון ו-ע"א 6904/97 בקעות\n1. עובדות מרכזיות: מחלוקות סביב סף ההוכחה הנדרש להכרה בנזק עקיף בעסקים בזמן לחימה.\n2. ההלכה שנקבעה: הרף ההוכחתי הנדרש אינו "מעבר לכל ספק סביר" פלילי, אלא הרף האזרחי של "מאזן ההסתברויות" (מעל 50% סבירות).\n3. מה הרשות מבקשת ללמוד: שהעוסק בתיקנן לא עמד בנטל ההוכחה שביטול העסקאות נובע מהמלחמה.\n4. ההבחנה ויישומה בתיק: לא זו בלבד שההלכה חלה – היא פועלת לזכותו המלאה של המערער. במאזן הסתברויות אזרחי, קרוב הרבה יותר לוודאי ששיתוקה הפיזי של אשקלון, כולל איסור תנועה, הוא הסיבה המכרעת לנפילת עסקאות הנדל"ן, ולא צירוף מקרים. העוסק הרים את הנטל לחלוטין.\n\nפסק דין: רע"א 6948/13 קטיף\n1. עובדות מרכזיות: עסקים שנפגעו מתקופת "אווירה ביטחונית קשה" וביקשו פיצוי גלובלי ללא מסמכים עסקיים פרטניים.\n2. ההלכה שנקבעה: על מנת לקבל פיצוי יש להציג "ראיות פרטניות" לנזק ולא להסתמך רק על טענת האווירה.\n3. מה הרשות מבקשת ללמוד: שהעוסק מפריח טענות עמומות ללא הוכחה פרטנית.\n4. היישום בתיק דימה: בניגוד גמור לעובדות הלכת קטיף, הוגשו במקרה דנן ראיות פרטניות ומדויקות – ספר עסקאות מחודש ספטמבר וחשבוניות תואמות המקבעות מסלול עסקי ברור. התעלמות הרשות מראיות אלו שוגה עובדתית.' },
  { claim: 'סעיף 6: בכל המסמכים שהומצאו אין בנמצא אף מסמך...', counter: 'הרשות טוענת כי אין מסמך שמקשר בין העסקאות שבוטלו לבין העסק. עסקאות שבוטלו במלחמה קודם חתימה מסודרת — טבעי שלא יבשילו לכלל חוזה חתום סופי, וזהו עוקצו של נזק עקיף (מניעת התקשרות). פעילות העסק הרגילה הוכחה בצורה תקינה מספר העסקאות מספטמבר.' },
  { claim: 'סעיף 7: אותה עסקה יחידה שדווחה למע"מ...', counter: 'ההאשמה על "תיקון בדיעבד במטרה לקבל מקדמה" הינה שגויה מיסודה. חשבונית מס\' 1001 ע"ס 15,000 ₪ משקפת עסקת אמת ודווחה בחודש 09/2023. תשלומי המע"מ בגינה שולמו במועד החוקי (ניתן לאימות במערכות שע"מ). התביעה דנן איננה בגין חשבונית זו, אלא תביעת נזק עקיף בסך 77,080 ₪ בגין העמלות שנמנעו כשהעסקאות העתידיות בוטלו בתקופת הלחימה. הדיווח מנובמבר איננו המצאת עבר, אלא פעולה תקינה.' },
  { claim: 'סעיף 8: כלל לא הוכח שהייתה פעילות בעסק...', counter: 'הטענה כי לא הוכחה פעילות עסקית טרם המלחמה נסתרת עובדתית. הוכח (באמצעות חשבונית 1001 שעליה חל מע"מ כדין וספר העסקאות מספטמבר) כי בספטמבר 2023, לאחר מעברו של רודניצקי לעצמאות, בוצעה עסקת השכרה שהניבה פרי. קיום מספר עסקאות בקנה (התלמוד והאצ"ל) שהמתינו להבשלה מגבה את מהלך העסקים הרגיל, אשר נגדע באבחה באוקטובר 2023.' },
  { claim: 'סעיף 9: בנוגע לשתי העסקאות שנטען שבוטלו...', counter: 'קביעת הרשות כי העסקה ברחוב התלמוד "יצאה אל הפועל בנובמבר 2023" הינה שגויה מבחינה עובדתית. עסקת המכירה (העמלה המונעת עליה נסובה התביעה) בוטלה כליל בגלל המלחמה. מה שהתרחש בנובמבר 2023 הינו פעולת השכרה חלופית שביצע הבעלים בעצמו וללא מעורבות מתווך. יציאת עסקת שכירות פרטית לפועל אינה מעידה על ביצוע עסקת המכירה — אשר בוטלה אקטיבית עקב המלחמה, וגרמה נזק לרודניצקי.' },
  { claim: 'סעיף 10: בנוגע לעסקה ברחוב האצ"ל 40...', counter: 'ביחס לעסקת רחוב האצ"ל 40 (עמלה מונעת של 25,600 ₪), הרשות טוענת כי העסקה נפלה מטרגדיה אישית וסובייקטיבית. טענה זו נסתרת חזיתית על ידי הפסיקה:\n\nפסק דין: ע"א 749/87 מוסך המרכז נ\' צרפתי\n1. עובדות מרכזיות: מחלוקת על קיומו של סיכול וקשר סיבתי בדיני חוזים תחת נסיבות שבהן נמנעה השלמת התחייבות בשל גורמים חיצוניים.\n2. ההלכה שנקבעה: דיני הקשר הסיבתי האזרחיים נבחנים במבחן הכלכלי-אובייקטיבי של "האדם הסביר", ולא לפי רחשי ליבו ונסיבותיו הסובייקטיביות (או הטרגיות) של הלקוח הבודד.\n3. מה הרשות מבקשת ללמוד: הרשות מתבייתת על תירוץ אישי וסובייקטיבי של הקונה על מנת לנתק את ביטול העסקה מאירועי המלחמה באשקלון.\n4. יישום נכון בתיק: ההלכה מחייבת לקבל את טענותינו. העיר אשקלון הושמה תחת מתקפת טילים שמנעה לחלוטין את פעילות התיווך בעיר. במצב אובייקטיבי זה של עיר תחת כפיית מלחמה – "האדם הסביר" מנקודת מבט כלכלית נרתע מלרכוש שם נכס כדבר שבשגרה. המניע הכלכלי-ביטחוני מצוי שם ומספק את המסגרת לקשר הסיבתי, ובולע בתוכו לחלוטין כל רובד טרגי פרטי שניצת. המציאות מוכיחה נזק ביטחוני עקיף ללא עוררין.' },
  { claim: 'סעיף 11: ברע"א 718/01 בית הארחה עין גדי...', counter: 'טענת היעדר הקשר הסיבתי של הרשות נשענת על היקש צורם ומופרך להלכת עין גדי. להלן ההבחנה המשפטית החורצת מדוע אשקלון אינה עין גדי, ומהווה הלכה למעשה את המודל של הלכת קיבוץ נירים:\n\nפסק דין: רע"א 718/01 בית הארחה עין גדי נ\' מנהל קרן פיצויים\n1. עובדות מרכזיות: בעלי בית הארחה מרוחק תבעו על אבדן תיירות עקב חרדות ציבוריות בתקופת מלחמת המפרץ, שעה שעירם כלל לא הותקפה והממשלה לא סגרה את פתחי המלון.\n2. ההלכה שנקבעה: נזק כלכלי שנוצר אך ורק בשל השפעה מוראלית ארצית כללית ו"אווירה לאומית" אינו מקים זכאות לנזק עקיף ללא הגבלה קונקרטית לאותו האזור.\n3. מה הרשות מבקשת ללמוד: שהפסד העסקאות של המערער נובע מאותה "השפעה כללית" אווירתית של מלחמת חרבות ברזל, במקום פגיעה במיקום קונקרטי.\n4. ההבחנה: אשקלון הינה עיר תחת אש בעלת מעמד יישוב ספר, עליה הופעלו בפועל מגבלות התקהלות ותנועה כפויות מפיקוד העורף. הפעילות נחסמה אופרטיבית ולא "אווירתית". הפסיקה הזו אינה דרה בכפיפה אחת עם דמותה של עיר מופגזת במגבלת תנועה.\n\nפסק דין: רע"א 5902/12 קרן פיצויים נ\' קיבוץ נירים\n1. עובדות מרכזיות: קיבוץ שלא הופצץ ישירות אך בשל הוראות הרשויות שאסרו טיסות ריסוס – נהרסו יבוליו.\n2. ההלכה שנקבעה: "פעולת מניעה" אקטיבית של הרשויות (כגון איסור טיסה או תנועה) מקימה קשר סיבתי לנזק העקיף ומזכה בפיצוי.\n3. היישום בתיק: אשקלון, בניגוד לעין גדי, כופפה על ידי פיקוד העורף להגבלות מוחלטות שמנעו פיזית התכנסות אנושית ותנועה בחופשיות. הנזק נובע מהוראות מניעה צבאיות במסגרת פגיעה קונקרטית ממוקדת בעיר נצורה, ובכך מחבר ומצמיד את הקשר הסיבתי ההדוק הנדרש ממיקומו הפיזי של העסק ביישוב הספר שלנו.' },
  { claim: 'סעיף 12: על כן ולאור כל האמור לעיל, תביעתך נדחית על הסף.', counter: 'מסקנת הדחייה על הסף בטעות יסודה. העוסק עומד בכל תנאי החוק והתקנות: מפעיל עסק פעיל ערב המלחמה (שהוכח), במקום עסקו ביישוב ספר מובהק, וספג אובדן עסקאות ישיר כתוצאה ממציאות מלחמתית במאזן הסתברויות מתאים (ואף בראיות פרטניות כנדרש בהלכת קטיף). אין למצוא צידוק בחוק לדחייה שרירותית של נזק עקיף זה.' },
];

// ─── Build claims discussion (section ו) ───
const claimsDiscussion = CLAIMS.map((c, i) =>
  `טענת הרשות ${i + 1}:\n${c.claim}\n\nהמענה שלנו:\n${c.counter}`
).join('\n\n');

// ─── Full body (from caseBuilderHelpers.ts v25 template) ───
const FULL_BODY = `לכבוד
ועדת הערר
קרן הפיצויים — מס רכוש וקרן פיצויים
רשות המסים בישראל

הנדון: ערר על החלטת דחייה מיום 25.02.2026
מספר בקשה: 58749955
המערער: דימה רודניצקי


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

מר דימה רודניצקי, תושב אשקלון, מתווך נדל"ן מורשה מאז 19.3.2014 (ותק של למעלה מ-12 שנה). משרדו ממוקם באשקלון.

בשנת 2023, מר רודניצקי עבר משכיר לעצמאי. עסק התיווך נפתח בחודש ספטמבר 2023 — שבועות ספורים בלבד לפני פרוץ המלחמה. בחודש זה נוצרה פעילות עסקית רגילה, אשר תועדה בספר העסקאות מיום 21.9.2023 באמצעות חשבונית מס 1001 (מול הלקוח "אלכס תיווך"), פעילות המעידה על מהלך עסקים שוטף וחי ערב המלחמה.
בחודש העוקב פרצה המלחמה, ושתי עסקאות גדולות עליהן עמל המתווך — בוטלו לחלוטין:

עסקה א' — רחוב התלמוד, אשקלון (עסקת מכירה)
מר רודניצקי ליווה והוביל עסקת מכירת נכס ברחוב התלמוד טרם המלחמה. העסקה התבטלה לאור פרוץ האירועים הביטחוניים באשקלון. העמלה הצפויה למתווך על ביצועה המלא עמדה על: 51,480 ₪ כולל מע"מ.
מה שהרשות מזהה שגוית כ"עסקה שיצאה לפועל" בנובמבר 2023 הייתה עסקת השכרה שביצע הבעלים לאחר ביטול עסקת המכירה — השכרה פרטית שלדימה לא היה בה יד והוא לא תיווך בה ולא הפיק ממנה שקל.

עסקה ב' — רחוב האצ"ל 40, אשקלון (עסקה נפרדת)
עסקה נפרדת ועצמאית בנכס שונה. המגעים הבשילו לכדי סגירה והעסקה הייתה בסף חתימה לפני ה-07.10. עם פרוץ הלחימה והשיתוק, בוטלה העסקה. העמלה הצפויה: 25,600 ₪ כולל מע"מ.


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

המסד הראייתי המונח בתיק מצביע באופן חד-משמעי על קיומו של נזק עקיף וישיר כתוצאה ממלחמת חרבות ברזל באשקלון. דחיית התביעה על הסף מבוססת על שרשרת כשלים מצטברת מצד הרשות:
1. התעלמות מראיות: הרשות התעלמה ממסמכים וראיות פרטניות שהוגשו כדין (אסמכתאות 3-5), המעידים על פעילות עסקית שוטפת שנקטעה עקב המלחמה.
2. שגיאות עובדתיות: הרשות קבעה כי העסק לא פעל, בניגוד לתיעוד של עסקאות ומגעים שהבשילו ובוטלו בגלל המצב הביטחוני.
3. שגיאה משפטית ביישום פסיקה: הרשות נשענה על הלכת עין גדי (נזק אווירתי כללי) ועל הלכות קטיף ועמק איילון (נטל ראיה), תוך פרשנות שגויה שהתעלמה מהמבחן הכלכלי האובייקטיבי — לפיו מניעה כפויה (צווי פיקוד העורף) ביישוב ספר מופגז, מקיימת במלואה את דרישת הקשר הסיבתי (הלכת מוסך המרכז נ' צרפתי, הלכת קיבוץ נירים).

החלטת הרשות מהווה פגם מנהלי חמור היורד לשורש ההליך. אשר על כן, ועדת הערר הנכבדה מתבקשת להורות כדלקמן:

סעד ראשי:
א. לבטל את החלטת הרשות מיום 25.02.2026.
ב. לקבל את התביעה במלואה, לקבוע קשר סיבתי, ולאשר תשלום פיצויים בסך 77,080 ₪ כולל מע"מ.

סעד חלופי:
ככל שהוועדה תמצא כי מתקיים קשר סיבתי אך נותר ספק לעניין התחשיב הכמותי — להשיב את התיק למפקח לבחינה מחודשת ושמאות כלכלית מול נתוני המערער, תוך ביטול הדחייה על הסף.

בכבוד רב,

__________________________
דימה רודניצקי, המערער

(הערר והתחשיבים נערכו בסיוע מקצועי של דוד אלדד, רו"ח)`;

// ─── RTL Helpers ───
const HEBREW_RE = /[\u0590-\u05FF]/;
function isHebrew(t) { return HEBREW_RE.test(t); }
function splitRuns(text, bold = false, fontSize = 22) {
  if (!text) return [];
  const segs = text.match(/[\u0590-\u05FF\s\u0600-\u06FF"'״׳,.\-–—:;!?()/\d%₪]+|[A-Za-z0-9\s&@#$%^*+=<>{}[\]|\\~`'".,\-–—:;!?()/]+/g);
  if (!segs) return [new TextRun({ text, font: 'David Libre', size: fontSize, bold, rightToLeft: true })];
  return segs.map(s => {
    const heb = isHebrew(s);
    return new TextRun({ text: s.trim() ? s : ' ', font: heb ? 'David Libre' : 'Calibri', size: fontSize, bold, rightToLeft: heb });
  });
}

// ─── Build DOCX ───
async function buildDocx() {
  console.log('[PRODUCE] Building DOCX...');
  const lines = FULL_BODY.split('\n');
  const children = [];

  // Section headings detection
  const sectionRE = /^(א|ב|ג|ד|ה|ו|ז)\.\s/;
  const subSectionRE = /^(ה\.\d|ו\.\d)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '' })] }));
      continue;
    }

    // Main section heading
    if (sectionRE.test(trimmed)) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        bidirectional: true,
        spacing: { before: 300, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' } },
        children: splitRuns(trimmed, true, 26),
      }));
      continue;
    }

    // Addressee block ("לכבוד", "ועדת הערר", etc.)
    if (trimmed === 'לכבוד' || trimmed.startsWith('ועדת הערר') || trimmed.startsWith('קרן הפיצויים') || trimmed.startsWith('רשות המסים')) {
      children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 40 },
        children: splitRuns(trimmed, true, 24),
      }));
      continue;
    }

    // Subject/case info lines
    if (trimmed.startsWith('הנדון:') || trimmed.startsWith('מספר בקשה:') || trimmed.startsWith('המערער:')) {
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { after: 40 },
        children: splitRuns(trimmed, true, 22),
      }));
      continue;
    }

    // Signature line
    if (trimmed.startsWith('____')) {
      children.push(new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '' })] }));
      children.push(new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: '___________________________', font: 'David Libre', size: 22 })],
      }));
      continue;
    }

    // Relief sub-items
    if (trimmed.startsWith('סעד ראשי:') || trimmed.startsWith('סעד חלופי:')) {
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { before: 200, after: 80 },
        children: splitRuns(trimmed, true, 22),
      }));
      continue;
    }

    // Counter-arg headers
    if (trimmed.startsWith('טענת הרשות ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        bidirectional: true,
        spacing: { before: 200, after: 80 },
        children: splitRuns(trimmed, true, 22),
      }));
      continue;
    }

    if (trimmed.startsWith('המענה שלנו:')) {
      children.push(new Paragraph({
        bidirectional: true,
        spacing: { before: 80, after: 60 },
        children: splitRuns(trimmed, true, 21),
      }));
      continue;
    }

    // Default paragraph
    children.push(new Paragraph({
      bidirectional: true,
      spacing: { after: 80 },
      children: splitRuns(trimmed, false, 21),
    }));
  }

  const today = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'David Libre', size: 22, rightToLeft: true },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1000, bottom: 1200, right: 1200, left: 1200 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: {
          options: {
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: 'ניהול דוד אלדד רו"ח', font: 'David Libre', size: 20, bold: true, color: '1E3A5F', rightToLeft: true }),
                  new TextRun({ text: '  |  DAVID ELDAD CPA MANAGEMENT', font: 'Calibri', size: 16, color: '5B7FA5' }),
                ],
              }),
              new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A84C' } }, spacing: { after: 100 } }),
            ],
          },
        },
      },
      footers: {
        default: {
          options: {
            children: [
              new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' } }, spacing: { before: 100 } }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: true,
                children: [
                  new TextRun({ text: `${today} | עמוד `, font: 'David Libre', size: 14, color: '94A3B8', rightToLeft: true }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 14, color: '94A3B8' }),
                ],
              }),
            ],
          },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const docxPath = path.join(OUTPUT_DIR, 'ערר_דימה_רודניצקי_58749955.docx');
  fs.writeFileSync(docxPath, buffer);
  console.log(`[PRODUCE] DOCX saved: ${docxPath} (${buffer.length} bytes)`);
  return docxPath;
}

// ─── Build HTML ───
function buildHtml() {
  console.log('[PRODUCE] Building HTML...');
  const paragraphs = FULL_BODY.split('\n').map(line => {
    const t = line.trim();
    if (!t) return '<br/>';
    if (/^(א|ב|ג|ד|ה|ו|ז)\.\s/.test(t)) return `<h2>${t}</h2>`;
    if (t.startsWith('טענת הרשות ')) return `<h3 class="claim">${t}</h3>`;
    if (t.startsWith('המענה שלנו:')) return `<p class="counter"><strong>${t}</strong></p>`;
    if (t.startsWith('סעד ראשי:') || t.startsWith('סעד חלופי:')) return `<h4>${t}</h4>`;
    if (t.startsWith('הנדון:') || t.startsWith('מספר בקשה:') || t.startsWith('המערער:')) return `<p class="meta"><strong>${t}</strong></p>`;
    if (t.startsWith('____')) return '<hr class="sig-line"/>';
    return `<p>${t}</p>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ערר — דימה רודניצקי | בקשה 58749955</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=David+Libre:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'David Libre', serif; font-size: 14px; line-height: 1.8; color: #1e293b;
    max-width: 800px; margin: 0 auto; padding: 40px 32px; background: #fff; direction: rtl; }
  h2 { font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin: 28px 0 12px; }
  h3.claim { font-size: 15px; color: #b91c1c; margin: 20px 0 6px; }
  h4 { font-size: 15px; margin: 20px 0 8px; }
  p { margin: 4px 0; }
  p.meta { font-weight: 700; }
  p.counter { color: #166534; margin: 4px 0 12px; }
  hr.sig-line { border: none; border-top: 1px solid #333; width: 200px; margin: 30px auto 4px 0; }
  .header { text-align: center; color: #1e3a5f; font-size: 16px; font-weight: 700; border-bottom: 3px solid #c9a84c; padding-bottom: 8px; margin-bottom: 20px; }
  .footer { text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 40px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">ניהול דוד אלדד רו"ח | DAVID ELDAD CPA MANAGEMENT</div>
${paragraphs}
<div class="footer">הופק מתוך מערכת ניהול דוד אלדד | ${new Date().toLocaleDateString('he-IL')}</div>
</body>
</html>`;

  const htmlPath = path.join(OUTPUT_DIR, 'ערר_דימה_רודניצקי_58749955.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`[PRODUCE] HTML saved: ${htmlPath}`);
  return htmlPath;
}

// ─── Build ZIP ───
async function buildZip(docxPath, htmlPath) {
  console.log('[PRODUCE] Building ZIP...');
  const zipPath = path.join(OUTPUT_DIR, 'חבילת_הגשה_דימה_רודניצקי.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`[PRODUCE] ZIP saved: ${zipPath} (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.file(docxPath, { name: path.basename(docxPath) });
    archive.file(htmlPath, { name: path.basename(htmlPath) });
    // Add QA report
    const qaReport = path.join(__dirname, '..', '..', '.gemini', 'antigravity', 'brain',
      'a44d4f51-f0e5-46fd-8476-fd630a1ae54e', 'qa_report_v25_final.md');
    if (fs.existsSync(qaReport)) {
      archive.file(qaReport, { name: 'QA_report_v25.md' });
    }
    archive.finalize();
  });
}

// ─── Main ───
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  PRODUCTION PIPELINE — Dima Rodnitsky v25');
  console.log('  Source: caseBuilderHelpers.ts v25');
  console.log('  QA: 12/12 PASS');
  console.log('═══════════════════════════════════════════');

  const docxPath = await buildDocx();
  const htmlPath = buildHtml();
  const zipPath = await buildZip(docxPath, htmlPath);

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  PRODUCTION COMPLETE');
  console.log(`  DOCX: ${docxPath}`);
  console.log(`  HTML:  ${htmlPath}`);
  console.log(`  ZIP:   ${zipPath}`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => { console.error('PRODUCTION FAILED:', err); process.exit(1); });

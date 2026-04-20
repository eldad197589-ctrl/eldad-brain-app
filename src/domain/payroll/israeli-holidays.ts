/**
 * FILE: israeli-holidays.ts
 * PURPOSE: Israeli Holiday Calendar & Rest Day Utilities
 * PROMOTED FROM: employee-system/employee-platform/src/lib/israeli-holidays.ts
 * PROMOTION DATE: 2026-04-15
 * ADAPTATION: NONE — verbatim copy
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

/**
 * Israeli Holiday Calendar
 * לוח חגים ישראלי
 * 
 * Contains dates for Israeli holidays with entry times (eve) and exit times
 * Used for calculating rest day premium rates
 */

// Holiday types
export type HolidayType =
    | 'sabbath'           // שבת
    | 'rosh_hashana'      // ראש השנה
    | 'yom_kippur'        // יום כיפור
    | 'sukkot'            // סוכות
    | 'simchat_torah'     // שמחת תורה
    | 'pesach'            // פסח
    | 'shavuot'           // שבועות
    | 'independence_day'  // יום העצמאות
    | 'memorial_day'      // יום הזיכרון
    | 'holocaust_day'     // יום השואה
    | 'purim'             // פורים
    | 'hanukkah'          // חנוכה
    | 'tisha_bav'         // תשעה באב
    | 'election_day';     // יום בחירות

export interface Holiday {
    date: string;           // YYYY-MM-DD
    name: string;           // Hebrew name
    type: HolidayType;
    isRestDay: boolean;     // האם יום מנוחה מלא (שבת/חג)
    eveHoursReduction: number; // שעות מקוצרות בערב החג (0 = אין קיצור)
}

// Default entry time for Sabbath/holidays (can be overridden with actual sunset)
export const DEFAULT_REST_DAY_ENTRY_HOUR = 18; // 18:00

/**
 * Get Sabbath/Holiday entry hour (approximate sunset time by season)
 * כניסת שבת/חג - שעת שקיעה משוערת לפי עונה
 */
export function getSabbathEntryHour(date: string): number {
    const month = new Date(date).getMonth() + 1; // 1-12

    // Summer (April-September): Later sunset ~19:00-20:00
    if (month >= 4 && month <= 9) {
        return 19;
    }
    // Winter (October-March): Earlier sunset ~16:30-18:00
    return 17;
}

/**
 * Get Sabbath/Holiday exit hour (approximately 40-60 minutes after sunset + 3 stars)
 * צאת שבת/חג - כ-40-60 דקות אחרי השקיעה (צאת הכוכבים)
 */
export function getSabbathExitHour(date: string): number {
    const month = new Date(date).getMonth() + 1; // 1-12

    // Summer (April-September): Later exit ~20:00-21:00
    if (month >= 4 && month <= 9) {
        return 20;
    }
    // Winter (October-March): Earlier exit ~17:30-19:00
    return 18;
}

/**
 * Check if a time is after Sabbath exit (Motzei Shabbat)
 * בדיקה אם השעה היא אחרי צאת שבת (מוצאי שבת)
 */
export function isAfterSabbathExit(date: string, timeStr: string): boolean {
    if (!timeStr) return false;

    const [hour] = timeStr.split(':').map(Number);
    const exitHour = getSabbathExitHour(date);

    return hour >= exitHour;
}

// Get day of week in Hebrew
export function getHebrewDayOfWeek(date: Date): string {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
}

// Check if a date is Friday
export function isFriday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getDay() === 5;
}

// Check if a date is Saturday (Sabbath)
export function isSaturday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getDay() === 6;
}

// Israeli holidays for 2024-2026 (expandable)
export const ISRAELI_HOLIDAYS: Holiday[] = [
    // 2024
    { date: '2024-10-02', name: 'ראש השנה א׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 1 },
    { date: '2024-10-03', name: 'ראש השנה ב׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 0 },
    { date: '2024-10-11', name: 'יום כיפור', type: 'yom_kippur', isRestDay: true, eveHoursReduction: 3 },
    { date: '2024-10-16', name: 'סוכות', type: 'sukkot', isRestDay: true, eveHoursReduction: 1 },
    { date: '2024-10-23', name: 'שמחת תורה', type: 'simchat_torah', isRestDay: true, eveHoursReduction: 1 },
    { date: '2024-12-25', name: 'חנוכה (נר ראשון)', type: 'hanukkah', isRestDay: false, eveHoursReduction: 0 },

    // 2025
    { date: '2025-03-13', name: 'פורים', type: 'purim', isRestDay: false, eveHoursReduction: 0 },
    { date: '2025-04-12', name: 'פסח (ליל הסדר)', type: 'pesach', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-04-13', name: 'פסח א׳', type: 'pesach', isRestDay: true, eveHoursReduction: 0 },
    { date: '2025-04-18', name: 'פסח ז׳', type: 'pesach', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-04-24', name: 'יום השואה', type: 'holocaust_day', isRestDay: false, eveHoursReduction: 0 },
    { date: '2025-05-01', name: 'יום הזיכרון', type: 'memorial_day', isRestDay: false, eveHoursReduction: 0 },
    { date: '2025-05-02', name: 'יום העצמאות', type: 'independence_day', isRestDay: false, eveHoursReduction: 0 },
    { date: '2025-06-01', name: 'שבועות', type: 'shavuot', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-08-02', name: 'תשעה באב', type: 'tisha_bav', isRestDay: false, eveHoursReduction: 0 },
    { date: '2025-09-22', name: 'ראש השנה א׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-09-23', name: 'ראש השנה ב׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 0 },
    { date: '2025-10-01', name: 'יום כיפור', type: 'yom_kippur', isRestDay: true, eveHoursReduction: 3 },
    { date: '2025-10-06', name: 'סוכות', type: 'sukkot', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-10-13', name: 'שמחת תורה', type: 'simchat_torah', isRestDay: true, eveHoursReduction: 1 },
    { date: '2025-12-14', name: 'חנוכה (נר ראשון)', type: 'hanukkah', isRestDay: false, eveHoursReduction: 0 },

    // 2026
    { date: '2026-03-03', name: 'פורים', type: 'purim', isRestDay: false, eveHoursReduction: 0 },
    { date: '2026-04-01', name: 'פסח (ליל הסדר)', type: 'pesach', isRestDay: true, eveHoursReduction: 1 },
    { date: '2026-04-02', name: 'פסח א׳', type: 'pesach', isRestDay: true, eveHoursReduction: 0 },
    { date: '2026-04-07', name: 'פסח ז׳', type: 'pesach', isRestDay: true, eveHoursReduction: 1 },
    { date: '2026-05-21', name: 'שבועות', type: 'shavuot', isRestDay: true, eveHoursReduction: 1 },
    { date: '2026-09-11', name: 'ראש השנה א׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 1 },
    { date: '2026-09-12', name: 'ראש השנה ב׳', type: 'rosh_hashana', isRestDay: true, eveHoursReduction: 0 },
    { date: '2026-09-20', name: 'יום כיפור', type: 'yom_kippur', isRestDay: true, eveHoursReduction: 3 },
    { date: '2026-09-25', name: 'סוכות', type: 'sukkot', isRestDay: true, eveHoursReduction: 1 },
    { date: '2026-10-02', name: 'שמחת תורה', type: 'simchat_torah', isRestDay: true, eveHoursReduction: 1 },
];

/**
 * Get holiday info for a specific date
 */
export function getHolidayForDate(date: string): Holiday | undefined {
    return ISRAELI_HOLIDAYS.find(h => h.date === date);
}

/**
 * Check if a date is a rest day (Sabbath or holiday)
 */
export function isRestDay(date: string): boolean {
    const d = new Date(date);

    // Saturday is always a rest day
    if (isSaturday(d)) return true;

    // Check if it's a holiday rest day
    const holiday = getHolidayForDate(date);
    return holiday?.isRestDay || false;
}

/**
 * Check if the day BEFORE this date is a rest day eve
 * (meaning this date's work might have started during rest day)
 */
export function isAfterRestDayEve(date: string): { isEve: boolean; restDayName: string } {
    const d = new Date(date);

    // If it's Saturday, the previous day (Friday) was Sabbath eve
    if (isSaturday(d)) {
        return { isEve: true, restDayName: 'שבת' };
    }

    // Check if this date is a holiday (meaning yesterday was holiday eve)
    const holiday = getHolidayForDate(date);
    if (holiday?.isRestDay) {
        return { isEve: true, restDayName: holiday.name };
    }

    return { isEve: false, restDayName: '' };
}

/**
 * Get tomorrow's date string
 */
export function getTomorrowDate(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

/**
 * Check if tomorrow is a rest day (for calculating eve status)
 */
export function isTomorrowRestDay(date: string): { isRestDayEve: boolean; restDayName: string; eveHoursReduction: number } {
    const tomorrow = getTomorrowDate(date);
    const d = new Date(date);

    // If today is Friday, tomorrow is Saturday (Sabbath)
    if (isFriday(d)) {
        return { isRestDayEve: true, restDayName: 'שבת', eveHoursReduction: 1 };
    }

    // Check if tomorrow is a holiday rest day
    const holiday = getHolidayForDate(tomorrow);
    if (holiday?.isRestDay) {
        return {
            isRestDayEve: true,
            restDayName: holiday.name,
            eveHoursReduction: holiday.eveHoursReduction
        };
    }

    return { isRestDayEve: false, restDayName: '', eveHoursReduction: 0 };
}

/**
 * Calculate hours before and after rest day entry for a shift
 * @param checkIn - Check in time (HH:mm)
 * @param checkOut - Check out time (HH:mm)
 * @param restDayEntryHour - Hour when rest day starts (default 18:00)
 * @returns Object with hours before and after rest day entry
 */
export function splitHoursAtRestDayEntry(
    checkIn: string,
    checkOut: string,
    totalHours: number,
    restDayEntryHour: number = DEFAULT_REST_DAY_ENTRY_HOUR
): { hoursBeforeEntry: number; hoursAfterEntry: number } {
    if (!checkIn || !checkOut) {
        return { hoursBeforeEntry: 0, hoursAfterEntry: totalHours };
    }

    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    const checkInMinutes = inHour * 60 + inMin;
    const checkOutMinutes = outHour * 60 + outMin;
    const restDayEntryMinutes = restDayEntryHour * 60;

    // Handle overnight shifts
    const isOvernight = checkOutMinutes < checkInMinutes;
    const effectiveCheckOutMinutes = isOvernight ? checkOutMinutes + 24 * 60 : checkOutMinutes;

    // If shift starts after rest day entry, all hours are rest day hours
    if (checkInMinutes >= restDayEntryMinutes) {
        return { hoursBeforeEntry: 0, hoursAfterEntry: totalHours };
    }

    // If shift ends before rest day entry, all hours are regular
    if (effectiveCheckOutMinutes <= restDayEntryMinutes) {
        return { hoursBeforeEntry: totalHours, hoursAfterEntry: 0 };
    }

    // Shift crosses rest day entry - split the hours
    const minutesBeforeEntry = restDayEntryMinutes - checkInMinutes;
    const hoursBeforeEntry = minutesBeforeEntry / 60;
    const hoursAfterEntry = totalHours - hoursBeforeEntry;

    return {
        hoursBeforeEntry: Math.max(0, hoursBeforeEntry),
        hoursAfterEntry: Math.max(0, hoursAfterEntry)
    };
}

/**
 * Get the label for holiday type in Hebrew
 */
export function getHolidayTypeLabel(type: HolidayType): string {
    const labels: Record<HolidayType, string> = {
        sabbath: 'שבת',
        rosh_hashana: 'ראש השנה',
        yom_kippur: 'יום כיפור',
        sukkot: 'סוכות',
        simchat_torah: 'שמחת תורה',
        pesach: 'פסח',
        shavuot: 'שבועות',
        independence_day: 'יום העצמאות',
        memorial_day: 'יום הזיכרון',
        holocaust_day: 'יום השואה',
        purim: 'פורים',
        hanukkah: 'חנוכה',
        tisha_bav: 'תשעה באב',
        election_day: 'יום בחירות',
    };
    return labels[type] || type;
}

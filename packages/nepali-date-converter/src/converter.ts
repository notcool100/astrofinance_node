import {
    BsDate,
    BS_MONTH_DAYS,
    BS_AD_REFERENCE,
    BS_MIN_YEAR,
    BS_MAX_YEAR,
    MONTH_NAMES_EN,
    MONTH_NAMES_NE,
} from './calendar-data';

export type { BsDate };

/**
 * Convert Gregorian (AD) date to Bikram Sambat (BS) date
 * @param adDate - JavaScript Date object (AD/Gregorian)
 * @returns BsDate object with year, month, and day
 */
export function adToBs(adDate: Date): BsDate {
    // Get the reference point: BS 2000-01-01 = AD 1943-04-14
    const referenceAd = new Date(
        BS_AD_REFERENCE.adYear,
        BS_AD_REFERENCE.adMonth - 1,
        BS_AD_REFERENCE.adDay
    );

    // Calculate difference in days
    const diffTime = adDate.getTime() - referenceAd.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        throw new Error('Date is before the supported range (BS 2000-01-01)');
    }

    // Start from the reference BS date
    let bsYear = BS_AD_REFERENCE.bsYear;
    let bsMonth = BS_AD_REFERENCE.bsMonth;
    let bsDay = BS_AD_REFERENCE.bsDay;
    let remainingDays = diffDays;

    // Add the days
    while (remainingDays > 0) {
        const daysInCurrentMonth = getDaysInBsMonth(bsYear, bsMonth);
        const daysLeftInMonth = daysInCurrentMonth - bsDay + 1;

        if (remainingDays >= daysLeftInMonth) {
            // Move to next month
            remainingDays -= daysLeftInMonth;
            bsDay = 1;
            bsMonth++;

            if (bsMonth > 12) {
                bsMonth = 1;
                bsYear++;
            }

            if (bsYear > BS_MAX_YEAR) {
                throw new Error('Date is beyond the supported range (BS 2100-12-30)');
            }
        } else {
            // Add remaining days to current month
            bsDay += remainingDays;
            remainingDays = 0;
        }
    }

    return { year: bsYear, month: bsMonth, day: bsDay };
}

/**
 * Convert Bikram Sambat (BS) date to Gregorian (AD) date
 * @param bsDate - BS date object with year, month, and day
 * @returns JavaScript Date object (AD/Gregorian)
 */
export function bsToAd(bsDate: BsDate): Date {
    const { year, month, day } = bsDate;

    // Validate BS date
    if (!isBsDateValid(year, month, day)) {
        throw new Error(`Invalid BS date: ${year}-${month}-${day}`);
    }

    // Start from the reference point
    let totalDays = 0;

    // Count days from BS 2000-01-01 to the given BS date
    // First, count complete years
    for (let y = BS_AD_REFERENCE.bsYear; y < year; y++) {
        totalDays += getTotalDaysInBsYear(y);
    }

    // Then, count complete months in the target year
    for (let m = 1; m < month; m++) {
        totalDays += getDaysInBsMonth(year, m);
    }

    // Finally, add the days
    totalDays += day - 1; // -1 because we're counting from day 1

    // Create the reference AD date
    const referenceAd = new Date(
        BS_AD_REFERENCE.adYear,
        BS_AD_REFERENCE.adMonth - 1,
        BS_AD_REFERENCE.adDay
    );

    // Add the total days to reference date
    const resultDate = new Date(referenceAd);
    resultDate.setDate(resultDate.getDate() + totalDays);

    return resultDate;
}

/**
 * Get the number of days in a specific BS month
 * @param year - BS year
 * @param month - BS month (1-12)
 * @returns Number of days in the month
 */
export function getDaysInBsMonth(year: number, month: number): number {
    if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
        throw new Error(`Year ${year} is out of range (${BS_MIN_YEAR}-${BS_MAX_YEAR})`);
    }

    if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month}. Must be between 1 and 12`);
    }

    const yearIndex = year - BS_MIN_YEAR;
    return BS_MONTH_DAYS[yearIndex][month - 1];
}

/**
 * Get total days in a BS year
 * @param year - BS year
 * @returns Total number of days in the year
 */
export function getTotalDaysInBsYear(year: number): number {
    if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
        throw new Error(`Year ${year} is out of range (${BS_MIN_YEAR}-${BS_MAX_YEAR})`);
    }

    const yearIndex = year - BS_MIN_YEAR;
    return BS_MONTH_DAYS[yearIndex].reduce((sum, days) => sum + days, 0);
}

/**
 * Validate if a BS date is valid
 * @param year - BS year
 * @param month - BS month (1-12)
 * @param day - BS day
 * @returns true if valid, false otherwise
 */
export function isBsDateValid(year: number, month: number, day: number): boolean {
    if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
        return false;
    }

    if (month < 1 || month > 12) {
        return false;
    }

    if (day < 1) {
        return false;
    }

    const daysInMonth = getDaysInBsMonth(year, month);
    return day <= daysInMonth;
}

/**
 * Format BS date as string
 * @param bsDate - BS date object
 * @param format - Format string ('YYYY-MM-DD', 'YYYY/MM/DD', etc.)
 * @returns Formatted date string
 */
export function formatBsDate(
    bsDate: BsDate,
    format: string = 'YYYY-MM-DD'
): string {
    const year = bsDate.year.toString();
    const month = bsDate.month.toString().padStart(2, '0');
    const day = bsDate.day.toString().padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
}

/**
 * Format BS date with month name
 * @param bsDate - BS date object
 * @param locale - 'en' for English, 'ne' for Nepali
 * @returns Formatted date string (e.g., "15 Baisakh 2081")
 */
export function formatBsDateWithMonth(
    bsDate: BsDate,
    locale: 'en' | 'ne' = 'en'
): string {
    const monthNames = locale === 'ne' ? MONTH_NAMES_NE : MONTH_NAMES_EN;
    const monthName = monthNames[bsDate.month - 1];
    return `${bsDate.day} ${monthName} ${bsDate.year}`;
}

/**
 * Parse BS date string in YYYY-MM-DD format
 * @param dateString - Date string
 * @returns BsDate object or null if invalid
 */
export function parseBsDate(dateString: string): BsDate | null {
    const match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) {
        return null;
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    if (!isBsDateValid(year, month, day)) {
        return null;
    }

    return { year, month, day };
}

/**
 * Get current BS date
 * @returns Current BS date
 */
export function getCurrentBsDate(): BsDate {
    return adToBs(new Date());
}

/**
 * Get month name in specified locale
 * @param month - Month number (1-12)
 * @param locale - 'en' for English, 'ne' for Nepali
 * @returns Month name
 */
export function getMonthName(month: number, locale: 'en' | 'ne' = 'en'): string {
    if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month}`);
    }
    const monthNames = locale === 'ne' ? MONTH_NAMES_NE : MONTH_NAMES_EN;
    return monthNames[month - 1];
}

/**
 * Get all month names
 * @param locale - 'en' for English, 'ne' for Nepali
 * @returns Array of month names
 */
export function getMonthNames(locale: 'en' | 'ne' = 'en'): string[] {
    return locale === 'ne' ? [...MONTH_NAMES_NE] : [...MONTH_NAMES_EN];
}

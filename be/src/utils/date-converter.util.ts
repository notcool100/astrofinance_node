import {
    adToBs,
    bsToAd,
    formatBsDate,
    formatBsDateWithMonth,
    parseBsDate,
    isBsDateValid,
    BsDate,
} from '@astrofinance/nepali-date-converter';

/**
 * Date conversion utility for backend services
 * Provides helper functions for AD <-> BS date conversions with error handling
 */

/**
 * Convert AD date to BS date string (YYYY-MM-DD format)
 * @param adDate - JavaScript Date object or ISO string
 * @returns BS date string or null if conversion fails
 */
export function convertAdToBsString(adDate: Date | string | null | undefined): string | null {
    if (!adDate) return null;

    try {
        const dateObj = typeof adDate === 'string' ? new Date(adDate) : adDate;
        if (isNaN(dateObj.getTime())) return null;

        const bsDate = adToBs(dateObj);
        return formatBsDate(bsDate);
    } catch (error) {
        console.error('Error converting AD to BS:', error);
        return null;
    }
}

/**
 * Convert BS date string to AD date
 * @param bsDateString - BS date in YYYY-MM-DD format
 * @returns JavaScript Date object or null if conversion fails
 */
export function convertBsToAdDate(bsDateString: string | null | undefined): Date | null {
    if (!bsDateString) return null;

    try {
        const bsDate = parseBsDate(bsDateString);
        if (!bsDate) return null;

        return bsToAd(bsDate);
    } catch (error) {
        console.error('Error converting BS to AD:', error);
        return null;
    }
}

/**
 * Sync dates: if AD is provided, calculate BS; if BS is provided, calculate AD
 * @param adDate - AD date
 * @param bsDateString - BS date string
 * @returns Object with both AD and BS dates
 */
export function syncDates(
    adDate?: Date | string | null,
    bsDateString?: string | null
): { adDate: Date | null; bsDate: string | null } {
    // If both are provided, use AD as source of truth
    if (adDate) {
        const dateObj = typeof adDate === 'string' ? new Date(adDate) : adDate;
        return {
            adDate: dateObj,
            bsDate: convertAdToBsString(dateObj),
        };
    }

    // If only BS is provided, convert to AD
    if (bsDateString) {
        const adDateObj = convertBsToAdDate(bsDateString);
        return {
            adDate: adDateObj,
            bsDate: bsDateString,
        };
    }

    return { adDate: null, bsDate: null };
}

/**
 * Validate and convert date input (accepts either AD or BS)
 * @param dateInput - Can be AD date or BS date string
 * @param isBsInput - Whether the input is in BS format
 * @returns Object with both AD and BS dates or null if invalid
 */
export function processDateInput(
    dateInput: Date | string | null | undefined,
    isBsInput: boolean = false
): { adDate: Date; bsDate: string } | null {
    if (!dateInput) return null;

    try {
        if (isBsInput) {
            const bsString = typeof dateInput === 'string' ? dateInput : '';
            const result = syncDates(undefined, bsString);
            if (result.adDate && result.bsDate) {
                return { adDate: result.adDate, bsDate: result.bsDate };
            }
        } else {
            const adDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            const result = syncDates(adDate, undefined);
            if (result.adDate && result.bsDate) {
                return { adDate: result.adDate, bsDate: result.bsDate };
            }
        }
    } catch (error) {
        console.error('Error processing date input:', error);
    }

    return null;
}

/**
 * Format BS date for display
 * @param bsDateString - BS date string (YYYY-MM-DD)
 * @param locale - 'en' or 'ne'
 * @returns Formatted date string
 */
export function formatBsForDisplay(
    bsDateString: string | null | undefined,
    locale: 'en' | 'ne' = 'en'
): string {
    if (!bsDateString) return '';

    try {
        const bsDate = parseBsDate(bsDateString);
        if (!bsDate) return bsDateString;

        return formatBsDateWithMonth(bsDate, locale);
    } catch (error) {
        return bsDateString;
    }
}

/**
 * Prepare date fields for database insertion
 * Accepts either AD or BS date and returns both
 * @param dateInput - Date input (can be AD or BS)
 * @param fieldName - Name of the date field (for error messages)
 * @param isBsInput - Whether input is in BS format
 * @returns Object with both AD and BS dates ready for DB
 */
export function prepareDateForDb(
    dateInput: Date | string | null | undefined,
    fieldName: string,
    isBsInput: boolean = false
): { adDate: Date | null; bsDate: string | null } {
    if (!dateInput) {
        return { adDate: null, bsDate: null };
    }

    const processed = processDateInput(dateInput, isBsInput);
    if (!processed) {
        console.warn(`Invalid date for ${fieldName}:`, dateInput);
        return { adDate: null, bsDate: null };
    }

    return { adDate: processed.adDate, bsDate: processed.bsDate };
}

/**
 * Add BS dates to response object
 * Takes a database record and adds formatted BS dates
 * @param record - Database record with AD dates
 * @returns Same record with BS dates added (if not already present)
 */
export function enrichWithBsDates<T extends Record<string, any>>(
    record: T,
    dateFields: { adField: keyof T; bsField: keyof T }[]
): T {
    const enriched = { ...record };

    for (const { adField, bsField } of dateFields) {
        // If BS date is not populated but AD date exists, calculate it
        if (!enriched[bsField] && enriched[adField]) {
            enriched[bsField] = convertAdToBsString(enriched[adField] as any) as any;
        }
    }

    return enriched;
}

/**
 * Validate BS date string
 * @param bsDateString - BS date string to validate
 * @returns true if valid, false otherwise
 */
export function validateBsDate(bsDateString: string): boolean {
    try {
        const bsDate = parseBsDate(bsDateString);
        if (!bsDate) return false;

        return isBsDateValid(bsDate.year, bsDate.month, bsDate.day);
    } catch {
        return false;
    }
}

/**
 * Get current BS date
 * @returns Current date in BS format (YYYY-MM-DD)
 */
export function getCurrentBsDate(): string {
    const now = new Date();
    return convertAdToBsString(now) || '';
}

export type { BsDate };

import {
  adToBs,
  bsToAd,
  formatBsDate,
  formatBsDateWithMonth,
  parseBsDate,
  BsDate,
} from '@astrofinance/nepali-date-converter';

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a time string
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Format a date string to a datetime string
 * @param dateString - ISO date string
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
};

/**
 * Format a number as currency (Nepali Rupees)
 * @param amount - Number to format
 * @returns Formatted currency string with Rs symbol
 */
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined) return '';

  try {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs ${formattedNumber}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `Rs ${amount.toFixed(2)}`;
  }
};

/**
 * Convert AD date to BS date string
 * @param adDate - JavaScript Date object or ISO string
 * @returns BS date string (YYYY-MM-DD) or empty string
 */
export const convertAdToBsString = (adDate: Date | string | null | undefined): string => {
  if (!adDate) return '';

  try {
    const dateObj = typeof adDate === 'string' ? new Date(adDate) : adDate;
    if (isNaN(dateObj.getTime())) return '';

    const bsDate = adToBs(dateObj);
    return formatBsDate(bsDate);
  } catch (error) {
    console.error('Error converting AD to BS:', error);
    return '';
  }
};

/**
 * Convert BS date string to AD date
 * @param bsDateString - BS date in YYYY-MM-DD format
 * @returns JavaScript Date object or null
 */
export const convertBsToAdDate = (bsDateString: string | null | undefined): Date | null => {
  if (!bsDateString) return null;

  try {
    const bsDate = parseBsDate(bsDateString);
    if (!bsDate) return null;

    return bsToAd(bsDate);
  } catch (error) {
    console.error('Error converting BS to AD:', error);
    return null;
  }
};

/**
 * Format BS date for display
 * @param bsDateString - BS date string (YYYY-MM-DD)
 * @param locale - 'en' or 'ne'
 * @returns Formatted BS date
 */
export const formatBsForDisplay = (
  bsDateString: string | null | undefined,
  locale: 'en' | 'ne' = 'en'
): string => {
  if (!bsDateString) return '';

  try {
    const bsDate = parseBsDate(bsDateString);
    if (!bsDate) return bsDateString;

    return formatBsDateWithMonth(bsDate, locale);
  } catch (error) {
    return bsDateString;
  }
};

/**
 * Format date showing both AD and BS
 * @param adDate - AD date
 * @param bsDateString - BS date string (optional, will calculate if not provided)
 * @returns Formatted string like "2024-01-15 (2080-09-30)"
 */
export const formatDualDate = (
  adDate: Date | string | null | undefined,
  bsDateString?: string | null
): string => {
  if (!adDate) return '';

  try {
    const adFormatted = formatDate(adDate as string);
    const bsString = bsDateString || convertAdToBsString(adDate);
    const bsFormatted = bsString ? formatBsForDisplay(bsString) : '';

    if (bsFormatted) {
      return `${adFormatted} (${bsFormatted})`;
    }
    return adFormatted;
  } catch (error) {
    console.error('Error formatting dual date:', error);
    return formatDate(adDate as string);
  }
};

export type { BsDate };
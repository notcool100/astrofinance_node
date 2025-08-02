/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string,
  currency = 'USD',
  locale = 'en-US'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Format a date
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale = 'en-US'
): string => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Format a date and time
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date,
  locale = 'en-US'
): string => {
  return formatDate(
    date,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    locale
  );
};

/**
 * Format a percentage
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export const formatPercent = (
  value: number | string,
  decimals = 2,
  locale = 'en-US'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue / 100);
};

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | string,
  decimals = 2,
  locale = 'en-US'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};
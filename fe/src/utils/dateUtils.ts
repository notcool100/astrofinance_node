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
/**
 * Currency conversion utilities for handling rupees and paisa
 * In many South Asian financial systems, amounts are stored in paisa (1/100th of a rupee)
 * but displayed and entered by users in rupees
 */

/**
 * Convert rupees to paisa (multiply by 100)
 * @param rupees - Amount in rupees
 * @returns Amount in paisa
 */
export const rupeesToPaisa = (rupees: number | string | { toString(): string }): number => {
  const rupeesNum = typeof rupees === 'string' ? parseFloat(rupees) : Number(rupees.toString());
  return Math.round(rupeesNum * 100);
};

/**
 * Convert paisa to rupees (divide by 100)
 * @param paisa - Amount in paisa
 * @returns Amount in rupees
 */
export const paisaToRupees = (paisa: number | string | { toString(): string }): number => {
  const paisaNum = typeof paisa === 'string' ? parseFloat(paisa) : Number(paisa.toString());
  return paisaNum / 100;
};

/**
 * Format amount for display (always in rupees)
 * @param amount - Amount that might be in paisa or rupees
 * @param isInPaisa - Whether the amount is in paisa (default: false)
 * @returns Formatted amount in rupees
 */
export const formatCurrency = (amount: number | string | { toString(): string }, isInPaisa: boolean = false): number => {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : Number(amount.toString());
  return isInPaisa ? paisaToRupees(amountNum) : amountNum;
};

/**
 * Prepare amount for database storage (convert to paisa)
 * @param amount - Amount in rupees
 * @returns Amount in paisa for database storage
 */
export const prepareForStorage = (amount: number | string): number => {
  return rupeesToPaisa(amount);
};

/**
 * Prepare amount for journal entry (ensure it's in rupees)
 * @param amount - Amount that might be in paisa
 * @param isInPaisa - Whether the amount is in paisa
 * @returns Amount in rupees for journal entry
 */
export const prepareForJournalEntry = (amount: number | string | { toString(): string }, isInPaisa: boolean = false): number => {
  return formatCurrency(amount, isInPaisa);
};

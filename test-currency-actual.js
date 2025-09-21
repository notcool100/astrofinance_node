// Test the actual currency utility functions to find the bug

// Copy the exact functions from the backend
const rupeesToPaisa = (rupees) => {
  const rupeesNum = typeof rupees === 'string' ? parseFloat(rupees) : Number(rupees.toString());
  return Math.round(rupeesNum * 100);
};

const paisaToRupees = (paisa) => {
  const paisaNum = typeof paisa === 'string' ? parseFloat(paisa) : Number(paisa.toString());
  return paisaNum / 100;
};

const formatCurrency = (amount, isInPaisa = false) => {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : Number(amount.toString());
  return isInPaisa ? paisaToRupees(amountNum) : amountNum;
};

const prepareForJournalEntry = (amount, isInPaisa = false) => {
  return formatCurrency(amount, isInPaisa);
};

console.log('=== Testing Currency Functions ===');

// Test the exact scenario from the user's issue
const transactionAmount = 999; // User's transaction amount
console.log(`Transaction amount: ${transactionAmount}`);

// Test prepareForJournalEntry with isInPaisa=false (should return 999)
const journalAmount = prepareForJournalEntry(transactionAmount, false);
console.log(`prepareForJournalEntry(999, false): ${journalAmount}`);

// Test if there's a bug where the logic is reversed
console.log('\n=== Testing for Logic Reversal Bug ===');
console.log('If the logic was accidentally reversed, it would be:');
console.log('return isInPaisa ? amountNum : rupeesToPaisa(amountNum);');
console.log('This would give:', false ? transactionAmount : rupeesToPaisa(transactionAmount));

// Test the individual functions
console.log('\n=== Testing Individual Functions ===');
console.log(`rupeesToPaisa(999): ${rupeesToPaisa(999)}`); // Should be 99900
console.log(`paisaToRupees(999): ${paisaToRupees(999)}`); // Should be 9.99
console.log(`formatCurrency(999, false): ${formatCurrency(999, false)}`); // Should be 999
console.log(`formatCurrency(999, true): ${formatCurrency(999, true)}`); // Should be 9.99

// Test with the user's exact values
console.log('\n=== Testing User\'s Exact Values ===');
console.log(`User transaction: 999`);
console.log(`Journal entry shows: 9990 (999 * 10)`);
console.log(`If rupeesToPaisa was called: ${rupeesToPaisa(999)} (999 * 100)`);
console.log(`If amount was multiplied by 10: ${999 * 10}`);

// Check if there's a 10x multiplication happening somewhere
console.log('\n=== Looking for 10x Multiplication ===');
console.log(`999 * 10 = ${999 * 10}`);
console.log(`999 * 100 = ${999 * 100}`);
console.log(`999 / 10 = ${999 / 10}`);
console.log(`999 / 100 = ${999 / 100}`);

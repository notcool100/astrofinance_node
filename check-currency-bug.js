// Check if there's a bug in the actual currency utility file
const fs = require('fs');

// Read the actual file content
const fileContent = fs.readFileSync('./be/src/common/utils/currency.util.ts', 'utf8');

// Check for specific patterns that might indicate a bug
console.log('=== Checking for Currency Conversion Bugs ===');

// Check the formatCurrency function
const formatCurrencyMatch = fileContent.match(/export const formatCurrency[^}]+}/s);
if (formatCurrencyMatch) {
  console.log('formatCurrency function:');
  console.log(formatCurrencyMatch[0]);
  console.log('');
}

// Check for any accidental logic reversal
if (fileContent.includes('return isInPaisa ? amountNum : rupeesToPaisa(amountNum)')) {
  console.log('🚨 BUG FOUND: Logic is reversed in formatCurrency!');
  console.log('The function is calling rupeesToPaisa when isInPaisa is false!');
} else if (fileContent.includes('return isInPaisa ? paisaToRupees(amountNum) : amountNum')) {
  console.log('✅ Logic looks correct in formatCurrency');
} else {
  console.log('❓ Could not find the return statement in formatCurrency');
}

// Check for any typos in function names
const typos = [
  'rupeesToPaisa(amountNum)',
  'paisaToRupees(amount)',
  'formatCurrency(amount, true)',
  'prepareForStorage(amount)'
];

typos.forEach(typo => {
  if (fileContent.includes(typo)) {
    console.log(`Found potential issue: ${typo}`);
  }
});

// Check if there are any other multiplication operations
const multiplicationMatches = fileContent.match(/\* 100|\* 10/g);
if (multiplicationMatches) {
  console.log('Found multiplication operations:');
  multiplicationMatches.forEach(match => console.log(match));
}

// Look for any division operations
const divisionMatches = fileContent.match(/\/ 100|\/ 10/g);
if (divisionMatches) {
  console.log('Found division operations:');
  divisionMatches.forEach(match => console.log(match));
}


import { prepareForJournalEntry } from './src/common/utils/currency.util';

console.log('Testing prepareForJournalEntry with actual backend functions:');
console.log('prepareForJournalEntry(10, false):', prepareForJournalEntry(10, false));
console.log('prepareForJournalEntry(10, true):', prepareForJournalEntry(10, true));
  
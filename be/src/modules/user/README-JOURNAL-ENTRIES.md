# Automatic Journal Entry Creation for User Transactions

This document explains how automatic journal entries are created when user transactions occur in the system.

## Overview

When a user transaction is created (deposit, withdrawal, transfer, etc.), the system automatically creates corresponding journal entries in the accounting system. This ensures that all financial transactions are properly recorded in the general ledger.

## Implementation

### 1. Transaction Types and Account Mappings

Each user transaction type is mapped to specific chart of accounts:

| Transaction Type | Debit Account | Credit Account | Description |
|------------------|---------------|----------------|-------------|
| DEPOSIT | CASH | USER_DEPOSITS | Customer deposits money |
| WITHDRAWAL | USER_DEPOSITS | CASH | Customer withdraws money |
| INTEREST_CREDIT | INTEREST_EXPENSE | USER_DEPOSITS | Interest credited to customer |
| FEE_DEBIT | USER_DEPOSITS | FEE_INCOME | Fee charged to customer |
| TRANSFER_IN | CASH | USER_DEPOSITS | Money transferred in |
| TRANSFER_OUT | USER_DEPOSITS | CASH | Money transferred out |
| ADJUSTMENT | CASH/ADJUSTMENT_INCOME | ADJUSTMENT_INCOME/CASH | Account adjustments |

### 2. Files Modified

#### `journal-entry-mapping.util.ts`
- Contains the account mapping logic
- `createJournalEntryForUserTransaction()` function creates journal entries
- `getUserTransactionAccountMapping()` returns account mappings for transaction types

#### `transaction.controller.ts`
- Modified `createTransaction()` function to automatically create journal entries
- Journal entry creation is wrapped in try-catch to prevent transaction failure

#### `transaction.utils.ts`
- Modified `transferFunds()` function to create journal entries for both transfer transactions
- Modified `applyInterest()` function to create journal entries for interest credits

### 3. How It Works

1. **Transaction Creation**: When a user transaction is created, the system:
   - Creates the transaction record
   - Calculates new account balance
   - Updates the account

2. **Journal Entry Creation**: After the transaction is created:
   - Determines the appropriate debit and credit accounts based on transaction type
   - Creates a journal entry with proper debit/credit lines
   - Links the journal entry to the transaction via `journalEntryId`

3. **Error Handling**: If journal entry creation fails:
   - The error is logged but doesn't fail the transaction
   - The transaction is still created successfully
   - This ensures system reliability

### 4. Database Schema

The `UserAccountTransaction` table has a `journalEntryId` field that links to the `JournalEntry` table:

```sql
-- UserAccountTransaction table
journalEntryId String? -- Links to JournalEntry.id

-- JournalEntry table
id String @id @default(uuid())
entryNumber String @unique
entryDate DateTime
narration String
status JournalEntryStatus @default(POSTED)
journalEntryLines JournalEntryLine[]
```

### 5. Testing

Use the test utility to verify the implementation:

```typescript
import { testJournalEntryCreation } from './utils/test-journal-entries';

// Test with a valid admin user ID
const results = await testJournalEntryCreation('admin-user-id');
```

### 6. Configuration

The system requires the following chart of accounts to be set up. Use the setup script to create them:

```bash
# Run the setup script to create required accounts
npx ts-node -e "
import { setupChartOfAccounts } from './src/modules/user/utils/setup-chart-of-accounts';
import prisma from './src/config/database';

async function main() {
  await setupChartOfAccounts();
  await prisma.\$disconnect();
}
main();
"
```

Required accounts:
- CASH (Asset account) - Code: 1001
- USER_DEPOSITS (Liability account) - Code: 2001
- INTEREST_EXPENSE (Expense account) - Code: 5001
- FEE_INCOME (Income account) - Code: 4001
- ADJUSTMENT_INCOME (Income account) - Code: 4004

### 7. Benefits

1. **Automatic Recording**: No manual journal entry creation required
2. **Consistency**: All transactions are recorded in the same format
3. **Audit Trail**: Complete audit trail from transaction to journal entry
4. **Real-time**: Journal entries are created immediately with transactions
5. **Error Resilience**: Transaction creation doesn't fail if journal entry creation fails

### 8. Future Enhancements

- Add support for different account types (e.g., different cash accounts for different branches)
- Implement configurable account mappings
- Add validation for account existence before transaction creation
- Add support for multi-currency transactions

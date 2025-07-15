# Accounting & Financial Reporting Module

## Overview
The Accounting & Financial Reporting module manages all financial transactions, journal entries, and generates various financial reports. It ensures accurate record-keeping and provides insights into the financial health of the organization.

## Submodules

### 1. Chart of Accounts

#### Features
- **Account Management**
  - Account creation and configuration
  - Account hierarchy management
  - Account categorization
  - Account status control
  
- **Account Types**
  - Assets
  - Liabilities
  - Equity
  - Income
  - Expenses

#### Technical Implementation
- Hierarchical data structure for accounts
- Account code generation
- Balance calculation algorithms
- Account status tracking

### 2. Journal Entries

#### Features
- **Entry Creation**
  - Double-entry accounting
  - Multi-line transactions
  - Narration and reference
  - Supporting document attachment
  
- **Entry Management**
  - Entry review and approval
  - Entry modification (with audit trail)
  - Entry reversal
  - Recurring entries

#### Technical Implementation
- Transaction validation (debits = credits)
- Journal entry numbering system
- Audit logging for all changes
- Document attachment handling

### 3. Day Book

#### Features
- **Daily Transaction Log**
  - Chronological transaction listing
  - Transaction filtering and search
  - Transaction details view
  - Daily summary statistics
  
- **Daily Reconciliation**
  - System vs. physical cash reconciliation
  - Discrepancy highlighting
  - Adjustment entry creation
  - Daily closing process

#### Technical Implementation
- Date-based transaction aggregation
- Filtering and search algorithms
- Balance calculation for reconciliation
- Closing process workflow

### 4. Financial Reports

#### Features
- **Balance Sheet**
  - Assets, liabilities, and equity
  - Comparative balance sheets
  - Detailed and summary views
  - Notes to accounts
  
- **Trial Balance**
  - Account-wise debit and credit balances
  - Balance verification
  - Adjusting entries
  - Pre-closing and post-closing views
  
- **Income Statement**
  - Revenue and expense tracking
  - Profit/loss calculation
  - Comparative statements
  - Ratio analysis

#### Technical Implementation
- Report generation algorithms
- Data aggregation for different periods
- PDF/Excel export functionality
- Caching for performance optimization

### 5. Transaction Tallying

#### Features
- **Daily Tallying**
  - Cash transaction verification
  - System vs. physical count reconciliation
  - Discrepancy management
  - Daily closing certification
  
- **Periodic Audits**
  - Random verification checks
  - Audit trail review
  - Exception reporting
  - Compliance verification

#### Technical Implementation
- Reconciliation algorithms
- Discrepancy detection
- Audit logging
- Approval workflow

## API Endpoints

### Chart of Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `GET /api/accounts/types` - Get account types
- `GET /api/accounts/balance` - Get account balances

### Journal Entries
- `GET /api/journal-entries` - List journal entries
- `POST /api/journal-entries` - Create journal entry
- `GET /api/journal-entries/:id` - Get entry details
- `PUT /api/journal-entries/:id` - Update entry
- `POST /api/journal-entries/:id/reverse` - Reverse entry
- `POST /api/journal-entries/recurring` - Create recurring entry

### Day Book
- `GET /api/day-book` - Get day book entries
- `POST /api/day-book/reconcile` - Reconcile daily transactions
- `POST /api/day-book/close` - Close day book

### Financial Reports
- `GET /api/reports/balance-sheet` - Generate balance sheet
- `GET /api/reports/trial-balance` - Generate trial balance
- `GET /api/reports/income-statement` - Generate income statement
- `GET /api/reports/export/:type` - Export report to PDF/Excel

## Database Schema

### Chart of Accounts Table
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  account_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- asset, liability, equity, income, expense
  parent_id INTEGER REFERENCES accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(20) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  narration TEXT NOT NULL,
  reference VARCHAR(100),
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval VARCHAR(20), -- monthly, quarterly, etc.
  recurring_day INTEGER,
  status VARCHAR(20) DEFAULT 'posted', -- draft, posted, reversed
  created_by INTEGER REFERENCES admin_users(id),
  approved_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Journal Entry Lines Table
```sql
CREATE TABLE journal_entry_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES accounts(id),
  debit_amount DECIMAL(15, 2) DEFAULT 0,
  credit_amount DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Day Book Table
```sql
CREATE TABLE day_book (
  id SERIAL PRIMARY KEY,
  transaction_date DATE NOT NULL,
  is_reconciled BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  system_cash_balance DECIMAL(15, 2) NOT NULL,
  physical_cash_balance DECIMAL(15, 2),
  discrepancy_amount DECIMAL(15, 2),
  discrepancy_notes TEXT,
  closed_by INTEGER REFERENCES admin_users(id),
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Account Balances Table
```sql
CREATE TABLE account_balances (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  as_of_date DATE NOT NULL,
  debit_balance DECIMAL(15, 2) DEFAULT 0,
  credit_balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(account_id, as_of_date)
);
```

## UI Components

### Chart of Accounts
- Account hierarchy tree view
- Account creation/edit form
- Account details view
- Account balance display

### Journal Entries
- Journal entry form with dynamic line items
- Entry listing with filters
- Entry details view
- Reversal confirmation dialog

### Day Book
- Daily transaction listing
- Reconciliation interface
- Discrepancy resolution form
- Day closing confirmation

### Financial Reports
- Report parameter selection form
- Tabular report display
- Graphical representations
- Export options

## Development Tasks

### Frontend Tasks
1. Create account management interfaces
2. Implement journal entry form with validation
3. Design day book and reconciliation UI
4. Build financial report generation interfaces
5. Create data visualization components
6. Implement report export functionality
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop chart of accounts management APIs
2. Implement journal entry processing with validation
3. Create day book and reconciliation services
4. Develop financial report generation algorithms
5. Implement data export services
6. Create scheduled tasks for recurring entries
7. Develop audit logging for financial transactions

## Testing Strategy

### Unit Tests
- Account balance calculation tests
- Journal entry validation tests
- Financial report calculation tests

### Integration Tests
- Journal entry workflow tests
- Day book reconciliation tests
- Report generation tests

### UI Tests
- Form validation tests
- Report parameter selection tests
- Export functionality tests

## Dependencies

### Frontend
- React Table for financial data display
- Recharts for financial visualizations
- React Hook Form for transaction forms
- React-to-print for report printing

### Backend
- Financial calculation libraries
- PDF/Excel generation libraries
- Transaction management utilities
- Scheduled task manager for recurring entries
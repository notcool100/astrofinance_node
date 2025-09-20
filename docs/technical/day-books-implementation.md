# Day Books Technical Implementation

This document provides technical details about the day book module implementation in AstroFinance, intended for developers working on the system.

## Database Schema

The day book functionality is built on the following Prisma schema:

```prisma
model DayBook {
  id                String    @id @default(uuid())
  transactionDate   DateTime
  systemCashBalance Decimal   @db.Decimal(15, 2)
  physicalCashBalance Decimal? @db.Decimal(15, 2)
  discrepancyAmount Decimal?  @db.Decimal(15, 2)
  discrepancyNotes  String?   @db.Text
  isReconciled      Boolean   @default(false)
  isClosed          Boolean   @default(false)
  
  // Audit fields
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdById       String?
  createdBy         User?     @relation("DayBookCreatedBy", fields: [createdById], references: [id])
  reconciledById    String?
  reconciledBy      User?     @relation("DayBookReconciledBy", fields: [reconciledById], references: [id])
  reconciledAt      DateTime?
  closedById        String?
  closedBy          User?     @relation("DayBookClosedBy", fields: [closedById], references: [id])
  closedAt          DateTime?
  
  // Relationships
  journalEntries    JournalEntry[]
  
  @@index([transactionDate])
  @@index([isReconciled])
  @@index([isClosed])
}
```

## API Endpoints

### Day Book Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounting/day-books` | List day books with pagination and filtering |
| GET | `/api/accounting/day-books/:id` | Get a specific day book by ID |
| POST | `/api/accounting/day-books` | Create a new day book |
| POST | `/api/accounting/day-books/:id/reconcile` | Reconcile a day book |
| POST | `/api/accounting/day-books/:id/close` | Close a day book |
| GET | `/api/accounting/day-books/:id/summary` | Get summary statistics for a day book |

## Request/Response Formats

### Create Day Book

**Request:**
```json
{
  "transactionDate": "2023-07-15",
  "systemCashBalance": 5000.00
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transactionDate": "2023-07-15T00:00:00.000Z",
  "systemCashBalance": 5000.00,
  "physicalCashBalance": null,
  "discrepancyAmount": null,
  "discrepancyNotes": null,
  "isReconciled": false,
  "isClosed": false,
  "createdAt": "2023-07-15T09:00:00.000Z",
  "updatedAt": "2023-07-15T09:00:00.000Z",
  "createdById": "123e4567-e89b-12d3-a456-426614174000",
  "reconciledById": null,
  "reconciledAt": null,
  "closedById": null,
  "closedAt": null
}
```

### Reconcile Day Book

**Request:**
```json
{
  "physicalCashBalance": 4950.00,
  "discrepancyNotes": "Cash drawer short by Rs 50. Will investigate with cashiers."
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transactionDate": "2023-07-15T00:00:00.000Z",
  "systemCashBalance": 5000.00,
  "physicalCashBalance": 4950.00,
  "discrepancyAmount": -50.00,
  "discrepancyNotes": "Cash drawer short by Rs 50. Will investigate with cashiers.",
  "isReconciled": true,
  "isClosed": false,
  "createdAt": "2023-07-15T09:00:00.000Z",
  "updatedAt": "2023-07-15T17:30:00.000Z",
  "createdById": "123e4567-e89b-12d3-a456-426614174000",
  "reconciledById": "123e4567-e89b-12d3-a456-426614174000",
  "reconciledAt": "2023-07-15T17:30:00.000Z",
  "closedById": null,
  "closedAt": null
}
```

### Day Book Summary

**Response:**
```json
{
  "summary": {
    "totalEntries": 42,
    "totalDebits": 15000.00,
    "totalCredits": 15000.00,
    "accountTypeSummary": {
      "ASSET": {
        "debits": 10000.00,
        "credits": 5000.00
      },
      "LIABILITY": {
        "debits": 2000.00,
        "credits": 3000.00
      },
      "REVENUE": {
        "debits": 0.00,
        "credits": 7000.00
      },
      "EXPENSE": {
        "debits": 3000.00,
        "credits": 0.00
      }
    }
  },
  "journalEntries": [
    {
      "id": "7f8d9e10-f11e-12d3-a456-426614174000",
      "entryNumber": "JE-2023-0042",
      "entryDate": "2023-07-15T14:30:00.000Z",
      "narration": "Sale of merchandise",
      "status": "POSTED",
      "journalEntryLines": [
        {
          "id": "a1b2c3d4-e5f6-7890-a123-456789abcdef",
          "accountId": "acc-123456",
          "debitAmount": 1000.00,
          "creditAmount": 0.00
        },
        {
          "id": "b2c3d4e5-f6a7-8901-b234-56789abcdef0",
          "accountId": "acc-654321",
          "debitAmount": 0.00,
          "creditAmount": 1000.00
        }
      ]
    }
    // Additional journal entries...
  ]
}
```

## Business Logic Implementation

### Day Book Creation

1. Validate the transaction date and system cash balance
2. Create a new day book record with initial state (not reconciled, not closed)
3. Associate the current user as the creator

### Reconciliation Process

1. Verify the day book exists and is not already reconciled or closed
2. Validate the physical cash balance (must be a positive number)
3. Calculate the discrepancy amount (physical - system)
4. Update the day book with reconciliation information
5. Set the reconciled flag to true and record the reconciliation timestamp and user

### Closing Process

1. Verify the day book exists, is reconciled, and not already closed
2. Set the closed flag to true
3. Record the closing timestamp and user
4. Prevent further modifications to the day book

## Frontend Components

### Day Book List Page

- Displays all day books with filtering options
- Shows reconciliation and closing status
- Provides actions based on day book status

### Day Book Creation Page

- Form to enter transaction date and system cash balance
- Validation for required fields and proper formats

### Day Book Detail Page

- Displays comprehensive day book information
- Shows summary statistics and associated journal entries
- Provides reconciliation interface for unreconciled day books
- Offers closing option for reconciled but unclosed day books

## State Management

Day books follow a strict state progression:

1. **Created**: Initial state when a day book is first created
   - `isReconciled = false`
   - `isClosed = false`

2. **Reconciled**: After physical cash count is entered and reconciled
   - `isReconciled = true`
   - `isClosed = false`

3. **Closed**: Final state after the day book is officially closed
   - `isReconciled = true`
   - `isClosed = true`

## Security Considerations

- Only authenticated users can access day book functionality
- Role-based permissions control who can create, reconcile, and close day books
- Audit trails record all user actions
- Closed day books are protected from modification

## Integration Points

### Journal Entry System

- Journal entries can be associated with day books
- Day book summaries include aggregated journal entry data

### User Management

- User information is recorded for audit purposes
- User roles determine available actions

### Reporting System

- Day book data feeds into financial reports
- Reconciliation statistics support operational analysis

## Error Handling

- Validation errors return appropriate HTTP 400 responses with details
- Not found errors return HTTP 404 responses
- Authorization errors return HTTP 403 responses
- Server errors are logged and return HTTP 500 responses

## Performance Considerations

- Indexes on frequently queried fields (transactionDate, isReconciled, isClosed)
- Pagination for day book listings
- Optimized queries for summary calculations

## Testing Strategy

- Unit tests for business logic functions
- Integration tests for API endpoints
- End-to-end tests for complete workflows
- Mock data for testing different day book states

## Deployment Notes

- Database migrations handle schema changes
- Feature flags can control rollout of new functionality
- Version compatibility between frontend and backend must be maintained
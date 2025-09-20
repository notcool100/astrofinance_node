# User Transaction API Documentation

This document outlines the API endpoints for managing user account transactions in the Financial Management System.

## Overview

The Transaction API allows administrators and staff to:
- Create new transactions (deposits, withdrawals, etc.)
- View transaction history for user accounts
- Get transaction details
- Cancel/reverse transactions
- View transaction summaries

## Base URL

All endpoints are relative to: `/api/user`

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Create Transaction

Creates a new transaction for a user account.

- **URL**: `/accounts/:accountId/transactions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions Required**: `admin.transactions.create` or `staff.transactions.create`

#### Request Body

```json
{
  "transactionType": "DEPOSIT",
  "amount": 1000.00,
  "description": "Initial deposit",
  "referenceNumber": "DEP-12345",
  "transactionMethod": "CASH",
  "transactionDate": "2025-07-15T10:30:00Z"
}
```

#### Path Parameters

- `accountId` - UUID of the user account

#### Response

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "uuid",
      "accountId": "uuid",
      "transactionType": "DEPOSIT",
      "amount": 1000.00,
      "transactionDate": "2025-07-15T10:30:00Z",
      "description": "Initial deposit",
      "referenceNumber": "DEP-12345",
      "runningBalance": 1000.00,
      "performedById": "admin-uuid",
      "transactionMethod": "CASH",
      "createdAt": "2025-07-15T10:30:00Z"
    },
    "newBalance": 1000.00
  }
}
```

### Get Transactions by Account

Retrieves transactions for a specific account with pagination and filtering options.

- **URL**: `/accounts/:accountId/transactions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions Required**: `admin.transactions.view` or `staff.transactions.view`

#### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Number of items per page (default: 10, max: 100)
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `transactionType` - Filter by transaction type

#### Path Parameters

- `accountId` - UUID of the user account

#### Response

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "accountId": "uuid",
        "transactionType": "DEPOSIT",
        "amount": 1000.00,
        "transactionDate": "2025-07-15T10:30:00Z",
        "description": "Initial deposit",
        "referenceNumber": "DEP-12345",
        "runningBalance": 1000.00,
        "performedById": "admin-uuid",
        "transactionMethod": "CASH",
        "createdAt": "2025-07-15T10:30:00Z",
        "performedBy": {
          "id": "admin-uuid",
          "username": "admin",
          "fullName": "Admin User"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    },
    "accountInfo": {
      "accountNumber": "SB-12345",
      "accountType": "SAVINGS",
      "balance": 5000.00,
      "userName": "John Doe"
    }
  }
}
```

### Get Transaction by ID

Retrieves details of a specific transaction.

- **URL**: `/transactions/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions Required**: `admin.transactions.view` or `staff.transactions.view`

#### Path Parameters

- `id` - UUID of the transaction

#### Response

```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    "transactionType": "DEPOSIT",
    "amount": 1000.00,
    "transactionDate": "2025-07-15T10:30:00Z",
    "description": "Initial deposit",
    "referenceNumber": "DEP-12345",
    "runningBalance": 1000.00,
    "performedById": "admin-uuid",
    "transactionMethod": "CASH",
    "createdAt": "2025-07-15T10:30:00Z",
    "account": {
      "id": "uuid",
      "accountNumber": "SB-12345",
      "accountType": "SAVINGS",
      "balance": 5000.00,
      "user": {
        "id": "uuid",
        "fullName": "John Doe",
        "contactNumber": "9876543210"
      }
    },
    "performedBy": {
      "id": "admin-uuid",
      "username": "admin",
      "fullName": "Admin User"
    },
    "journalEntry": null
  }
}
```

### Cancel Transaction

Cancels/reverses a transaction.

- **URL**: `/transactions/:id/cancel`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions Required**: `admin.transactions.cancel`

#### Request Body

```json
{
  "reason": "Incorrect amount entered"
}
```

#### Path Parameters

- `id` - UUID of the transaction to cancel

#### Response

```json
{
  "success": true,
  "message": "Transaction canceled successfully",
  "data": {
    "originalTransaction": {
      "id": "uuid",
      "accountId": "uuid",
      "transactionType": "DEPOSIT",
      "amount": 1000.00,
      "transactionDate": "2025-07-15T10:30:00Z",
      "description": "Initial deposit",
      "referenceNumber": "DEP-12345",
      "runningBalance": 1000.00,
      "performedById": "admin-uuid",
      "transactionMethod": "CASH",
      "createdAt": "2025-07-15T10:30:00Z"
    },
    "reversalTransaction": {
      "id": "uuid",
      "accountId": "uuid",
      "transactionType": "WITHDRAWAL",
      "amount": 1000.00,
      "transactionDate": "2025-07-15T11:30:00Z",
      "description": "Reversal of transaction uuid: Incorrect amount entered",
      "referenceNumber": "REV-12345678",
      "runningBalance": 0.00,
      "performedById": "admin-uuid",
      "transactionMethod": "SYSTEM",
      "createdAt": "2025-07-15T11:30:00Z"
    },
    "newBalance": 0.00
  }
}
```

### Get Transaction Summary

Retrieves a summary of transactions for an account.

- **URL**: `/accounts/:accountId/transactions/summary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions Required**: `admin.transactions.view` or `staff.transactions.view`

#### Path Parameters

- `accountId` - UUID of the user account

#### Response

```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "accountInfo": {
      "accountNumber": "SB-12345",
      "accountType": "SAVINGS",
      "balance": 5000.00,
      "userName": "John Doe"
    },
    "summary": {
      "totalDeposits": 3000.00,
      "totalWithdrawals": 1000.00,
      "totalInterestEarned": 50.00,
      "totalFees": 10.00,
      "transactionCount": 10,
      "lastTransactionDate": "2025-07-15T10:30:00Z"
    },
    "period": {
      "startDate": "2025-07-01T00:00:00Z",
      "endDate": "2025-07-31T23:59:59Z"
    }
  }
}
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "message": "Amount must be positive",
      "path": ["amount"]
    }
  ]
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Account not found"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Unauthorized. Admin user ID not found."
}
```

### Business Logic Error

```json
{
  "success": false,
  "message": "Insufficient balance for withdrawal"
}
```

### Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

## Transaction Types

- `DEPOSIT` - Money added to account
- `WITHDRAWAL` - Money removed from account
- `INTEREST_CREDIT` - Interest earned on account
- `FEE_DEBIT` - Fees charged to account
- `ADJUSTMENT` - Manual adjustment to account balance
- `TRANSFER_IN` - Money received from another account
- `TRANSFER_OUT` - Money sent to another account

## Notes

- Transactions cannot be modified after creation
- Only transactions within the last 24 hours can be canceled
- Canceling a transaction creates a reversal transaction
- All transactions are logged for audit purposes
- Transaction amounts are stored with 2 decimal places
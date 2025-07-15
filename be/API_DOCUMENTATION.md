# AstroFinance API Documentation

## Overview

AstroFinance API is a comprehensive backend service for microfinance management. It provides endpoints for user management, loan processing, accounting, expense tracking, tax calculation, notifications, and reporting.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Admin Authentication

- `POST /admin/auth/login`: Admin login
  - Request: `{ "username": "admin", "password": "Admin@123" }`
  - Response: `{ "user": {...}, "token": "..." }`

- `POST /admin/auth/logout`: Admin logout
  - Request: No body required
  - Response: `{ "message": "Logged out successfully" }`

- `GET /admin/auth/profile`: Get current admin profile
  - Response: `{ "id": "...", "username": "...", ... }`

- `POST /admin/auth/change-password`: Change admin password
  - Request: `{ "currentPassword": "...", "newPassword": "..." }`
  - Response: `{ "message": "Password changed successfully" }`

#### User Authentication

- `POST /user/auth/login`: User login
  - Request: `{ "email": "user@example.com", "password": "Password123!" }`
  - Response: `{ "user": {...}, "token": "..." }`

- `POST /user/auth/register`: User registration
  - Request: `{ "fullName": "...", "email": "...", "contactNumber": "...", "password": "..." }`
  - Response: `{ "user": {...}, "token": "..." }`

- `GET /user/auth/profile`: Get current user profile
  - Response: `{ "id": "...", "fullName": "...", ... }`

- `PUT /user/auth/profile`: Update user profile
  - Request: `{ "fullName": "...", "contactNumber": "..." }`
  - Response: `{ "id": "...", "fullName": "...", ... }`

- `POST /user/auth/change-password`: Change user password
  - Request: `{ "currentPassword": "...", "newPassword": "..." }`
  - Response: `{ "message": "Password changed successfully" }`

## Admin Module

### Admin Users

- `GET /admin/users`: Get all admin users
  - Query Parameters:
    - `search`: Search term for username or email
    - `status`: Filter by status (`active` or `inactive`)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /admin/users/:id`: Get admin user by ID
  - Response: `{ "id": "...", "username": "...", ... }`

- `POST /admin/users`: Create new admin user
  - Request: `{ "username": "...", "email": "...", "password": "...", "fullName": "..." }`
  - Response: `{ "id": "...", "username": "...", ... }`

- `PUT /admin/users/:id`: Update admin user
  - Request: `{ "username": "...", "email": "...", "fullName": "...", "isActive": true }`
  - Response: `{ "id": "...", "username": "...", ... }`

- `POST /admin/users/:id/reset-password`: Reset admin user password
  - Request: `{ "newPassword": "..." }`
  - Response: `{ "message": "Password reset successfully" }`

### Roles and Permissions

- `GET /admin/roles`: Get all roles
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /admin/roles/:id`: Get role by ID
  - Response: `{ "id": "...", "name": "...", "permissions": [...] }`

- `POST /admin/roles`: Create new role
  - Request: `{ "name": "...", "description": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /admin/roles/:id`: Update role
  - Request: `{ "name": "...", "description": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /admin/roles/:id`: Delete role
  - Response: `{ "message": "Role deleted successfully" }`

- `PUT /admin/roles/:id/permissions`: Update role permissions
  - Request: `{ "permissionIds": ["...", "..."] }`
  - Response: `{ "id": "...", "name": "...", "permissions": [...] }`

- `GET /admin/roles/permissions`: Get all permissions
  - Response: `[{ "id": "...", "code": "...", ... }]`

### Navigation

- `GET /admin/navigation/groups`: Get all navigation groups
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `POST /admin/navigation/groups`: Create navigation group
  - Request: `{ "name": "...", "description": "...", "order": 1 }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /admin/navigation/groups/:id`: Update navigation group
  - Request: `{ "name": "...", "description": "...", "order": 1 }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /admin/navigation/groups/:id`: Delete navigation group
  - Response: `{ "message": "Navigation group deleted successfully" }`

- `GET /admin/navigation`: Get all navigation items
  - Response: `[{ "id": "...", "label": "...", ... }]`

- `POST /admin/navigation`: Create navigation item
  - Request: `{ "label": "...", "icon": "...", "url": "...", "order": 1, "groupId": "..." }`
  - Response: `{ "id": "...", "label": "...", ... }`

- `PUT /admin/navigation/:id`: Update navigation item
  - Request: `{ "label": "...", "icon": "...", "url": "...", "order": 1, "groupId": "..." }`
  - Response: `{ "id": "...", "label": "...", ... }`

- `DELETE /admin/navigation/:id`: Delete navigation item
  - Response: `{ "message": "Navigation item deleted successfully" }`

- `GET /admin/navigation/structure`: Get navigation structure
  - Response: `[{ "group": {...}, "items": [...] }]`

- `GET /admin/navigation/user`: Get navigation for current user
  - Response: `[{ "group": {...}, "items": [...] }]`

- `PUT /admin/navigation/roles/:id`: Update role navigation
  - Request: `{ "navigationIds": ["...", "..."] }`
  - Response: `{ "id": "...", "name": "...", "navigation": [...] }`

## User Module

### Users

- `GET /user/users`: Get all users
  - Query Parameters:
    - `search`: Search term for name, email, or contact number
    - `status`: Filter by status (`active` or `inactive`)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /user/users/:id`: Get user by ID
  - Response: `{ "id": "...", "fullName": "...", ... }`

- `POST /user/users`: Create new user
  - Request: `{ "fullName": "...", "email": "...", "contactNumber": "...", "password": "..." }`
  - Response: `{ "id": "...", "fullName": "...", ... }`

- `PUT /user/users/:id`: Update user
  - Request: `{ "fullName": "...", "email": "...", "contactNumber": "..." }`
  - Response: `{ "id": "...", "fullName": "...", ... }`

- `POST /user/users/:id/reset-password`: Reset user password
  - Request: `{ "newPassword": "..." }`
  - Response: `{ "message": "Password reset successfully" }`

- `GET /user/users/:id/loans`: Get user loans
  - Query Parameters:
    - `status`: Filter by status (`ACTIVE`, `CLOSED`, `DEFAULTED`, `WRITTEN_OFF`)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /user/users/:id/loan-applications`: Get user loan applications
  - Query Parameters:
    - `status`: Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `DISBURSED`)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

## Loan Module

### Loan Types

- `GET /loan/types`: Get all loan types
  - Query Parameters:
    - `active`: Filter by active status (`true` or `false`)
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /loan/types/:id`: Get loan type by ID
  - Response: `{ "id": "...", "name": "...", ... }`

- `POST /loan/types`: Create new loan type
  - Request: `{ "name": "...", "code": "...", "interestType": "FLAT", "minAmount": 1000, "maxAmount": 50000, "minTenure": 3, "maxTenure": 36, "interestRate": 12 }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /loan/types/:id`: Update loan type
  - Request: `{ "name": "...", "interestType": "FLAT", "minAmount": 1000, "maxAmount": 50000, "minTenure": 3, "maxTenure": 36, "interestRate": 12 }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /loan/types/:id`: Delete loan type
  - Response: `{ "message": "Loan type deleted successfully" }`

### Loan Applications

- `GET /loan/applications`: Get all loan applications
  - Query Parameters:
    - `status`: Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `DISBURSED`)
    - `loanType`: Filter by loan type ID
    - `startDate`: Filter by application date (start)
    - `endDate`: Filter by application date (end)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /loan/applications/:id`: Get loan application by ID
  - Response: `{ "id": "...", "amount": 5000, ... }`

- `POST /loan/applications`: Create new loan application
  - Request: `{ "userId": "...", "loanTypeId": "...", "amount": 5000, "tenure": 12, "purpose": "..." }`
  - Response: `{ "id": "...", "amount": 5000, ... }`

- `PUT /loan/applications/:id/status`: Update loan application status
  - Request: `{ "status": "APPROVED", "notes": "..." }`
  - Response: `{ "id": "...", "status": "APPROVED", ... }`

- `POST /loan/applications/:id/documents`: Upload loan document
  - Request: Multipart form data with `document` file and `documentType` field
  - Response: `{ "id": "...", "documentType": "...", ... }`

### Loans

- `GET /loan/loans`: Get all loans
  - Query Parameters:
    - `status`: Filter by status (`ACTIVE`, `CLOSED`, `DEFAULTED`, `WRITTEN_OFF`)
    - `loanType`: Filter by loan type ID
    - `startDate`: Filter by disbursement date (start)
    - `endDate`: Filter by disbursement date (end)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /loan/loans/:id`: Get loan by ID
  - Response: `{ "id": "...", "amount": 5000, ... }`

- `GET /loan/loans/:id/schedule`: Get loan repayment schedule
  - Response: `[{ "installmentNumber": 1, "dueDate": "...", "amount": 500, ... }]`

- `POST /loan/loans/disburse`: Disburse loan
  - Request: `{ "applicationId": "...", "disbursementDate": "...", "disbursementMethod": "BANK_TRANSFER", "accountNumber": "..." }`
  - Response: `{ "id": "...", "amount": 5000, ... }`

- `POST /loan/loans/:id/payments`: Record loan payment
  - Request: `{ "amount": 500, "paymentDate": "...", "paymentMethod": "CASH", "reference": "..." }`
  - Response: `{ "id": "...", "amount": 500, ... }`

- `POST /loan/loans/:id/calculate-settlement`: Calculate early settlement
  - Request: `{ "settlementDate": "..." }`
  - Response: `{ "outstandingPrincipal": 3000, "interestDue": 200, "fees": 100, "penalties": 50, "totalSettlementAmount": 3350 }`

- `POST /loan/loans/:id/settle`: Process early settlement
  - Request: `{ "settlementDate": "...", "amount": 3350, "paymentMethod": "BANK_TRANSFER", "reference": "..." }`
  - Response: `{ "id": "...", "status": "CLOSED", ... }`

### Loan Calculator

- `POST /loan/calculator/emi`: Calculate EMI
  - Request: `{ "amount": 5000, "tenure": 12, "interestRate": 12, "interestType": "FLAT" }`
  - Response: `{ "emi": 458.33, "totalInterest": 600, "totalAmount": 5600 }`

- `POST /loan/calculator/schedule`: Generate amortization schedule
  - Request: `{ "amount": 5000, "tenure": 12, "interestRate": 12, "interestType": "FLAT", "startDate": "..." }`
  - Response: `[{ "installmentNumber": 1, "dueDate": "...", "principal": 416.67, "interest": 50, "amount": 466.67, "balance": 4583.33 }]`

## Accounting Module

### Chart of Accounts

- `GET /accounting/accounts`: Get all accounts
  - Query Parameters:
    - `type`: Filter by account type (`ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`)
    - `active`: Filter by active status (`true` or `false`)
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /accounting/accounts/structure`: Get account structure
  - Response: `[{ "id": "...", "name": "...", "children": [...] }]`

- `GET /accounting/accounts/:id`: Get account by ID
  - Response: `{ "id": "...", "name": "...", ... }`

- `POST /accounting/accounts`: Create new account
  - Request: `{ "name": "...", "code": "...", "type": "ASSET", "parentId": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /accounting/accounts/:id`: Update account
  - Request: `{ "name": "...", "code": "...", "isActive": true }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /accounting/accounts/:id`: Delete account
  - Response: `{ "message": "Account deleted successfully" }`

### Journal Entries

- `GET /accounting/journal-entries`: Get all journal entries
  - Query Parameters:
    - `status`: Filter by status (`PENDING`, `APPROVED`, `REJECTED`)
    - `startDate`: Filter by entry date (start)
    - `endDate`: Filter by entry date (end)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /accounting/journal-entries/:id`: Get journal entry by ID
  - Response: `{ "id": "...", "entryDate": "...", "items": [...] }`

- `POST /accounting/journal-entries`: Create new journal entry
  - Request: `{ "entryDate": "...", "reference": "...", "description": "...", "items": [{ "accountId": "...", "debit": 1000, "credit": 0, "description": "..." }] }`
  - Response: `{ "id": "...", "entryDate": "...", ... }`

- `PUT /accounting/journal-entries/:id/status`: Update journal entry status
  - Request: `{ "status": "APPROVED", "notes": "..." }`
  - Response: `{ "id": "...", "status": "APPROVED", ... }`

- `DELETE /accounting/journal-entries/:id`: Delete journal entry
  - Response: `{ "message": "Journal entry deleted successfully" }`

### Financial Reports

- `GET /accounting/reports/accounts/:id/balance`: Get account balance
  - Query Parameters:
    - `startDate`: Start date for balance calculation
    - `endDate`: End date for balance calculation
  - Response: `{ "account": {...}, "openingBalance": 1000, "debits": 500, "credits": 200, "closingBalance": 1300 }`

- `GET /accounting/reports/trial-balance`: Get trial balance
  - Query Parameters:
    - `asOfDate`: Date for trial balance (default: current date)
  - Response: `{ "asOfDate": "...", "accounts": [{ "account": {...}, "debit": 1000, "credit": 0 }] }`

- `GET /accounting/reports/income-statement`: Get income statement
  - Query Parameters:
    - `startDate`: Start date for income statement
    - `endDate`: End date for income statement
  - Response: `{ "startDate": "...", "endDate": "...", "income": [...], "expenses": [...], "netIncome": 5000 }`

- `GET /accounting/reports/balance-sheet`: Get balance sheet
  - Query Parameters:
    - `asOfDate`: Date for balance sheet (default: current date)
  - Response: `{ "asOfDate": "...", "assets": [...], "liabilities": [...], "equity": [...] }`

- `GET /accounting/reports/general-ledger`: Get general ledger
  - Query Parameters:
    - `accountId`: Filter by account ID
    - `startDate`: Start date for general ledger
    - `endDate`: End date for general ledger
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "account": {...}, "openingBalance": 1000, "entries": [...], "closingBalance": 1300, "pagination": {...} }`

## Expense Module

### Expense Categories

- `GET /expense/categories`: Get all expense categories
  - Query Parameters:
    - `type`: Filter by type (`OPERATIONAL`, `ADMINISTRATIVE`, `FINANCIAL`, `OTHER`)
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /expense/categories/:id`: Get expense category by ID
  - Response: `{ "id": "...", "name": "...", ... }`

- `POST /expense/categories`: Create new expense category
  - Request: `{ "name": "...", "description": "...", "type": "OPERATIONAL", "accountId": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /expense/categories/:id`: Update expense category
  - Request: `{ "name": "...", "description": "...", "type": "OPERATIONAL", "accountId": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /expense/categories/:id`: Delete expense category
  - Response: `{ "message": "Expense category deleted successfully" }`

### Expenses

- `GET /expense`: Get all expenses
  - Query Parameters:
    - `category`: Filter by category ID
    - `startDate`: Filter by expense date (start)
    - `endDate`: Filter by expense date (end)
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response: `{ "data": [...], "pagination": {...} }`

- `GET /expense/:id`: Get expense by ID
  - Response: `{ "id": "...", "amount": 100, ... }`

- `POST /expense`: Create new expense
  - Request: `{ "categoryId": "...", "amount": 100, "description": "...", "expenseDate": "...", "reference": "...", "paymentMethod": "CASH" }`
  - Response: `{ "id": "...", "amount": 100, ... }`

- `PUT /expense/:id`: Update expense
  - Request: `{ "categoryId": "...", "amount": 100, "description": "...", "expenseDate": "...", "reference": "...", "paymentMethod": "CASH" }`
  - Response: `{ "id": "...", "amount": 100, ... }`

- `POST /expense/:id/approve`: Approve expense
  - Request: `{ "notes": "..." }`
  - Response: `{ "id": "...", "status": "APPROVED", ... }`

- `POST /expense/:id/reject`: Reject expense
  - Request: `{ "notes": "..." }`
  - Response: `{ "id": "...", "status": "REJECTED", ... }`

- `DELETE /expense/:id`: Delete expense
  - Response: `{ "message": "Expense deleted successfully" }`

## Tax Module

### Tax Types

- `GET /tax/types`: Get all tax types
  - Query Parameters:
    - `active`: Filter by active status (`true` or `false`)
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /tax/types/:id`: Get tax type by ID
  - Response: `{ "id": "...", "name": "...", "rates": [...] }`

- `POST /tax/types`: Create new tax type
  - Request: `{ "name": "...", "code": "...", "description": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /tax/types/:id`: Update tax type
  - Request: `{ "name": "...", "description": "...", "isActive": true }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /tax/types/:id`: Delete tax type
  - Response: `{ "message": "Tax type deleted successfully" }`

### Tax Rates

- `GET /tax/rates`: Get all tax rates
  - Query Parameters:
    - `taxTypeId`: Filter by tax type ID
    - `active`: Filter by active status (`true` or `false`)
  - Response: `[{ "id": "...", "rate": 18, ... }]`

- `GET /tax/rates/:id`: Get tax rate by ID
  - Response: `{ "id": "...", "rate": 18, ... }`

- `POST /tax/rates`: Create new tax rate
  - Request: `{ "taxTypeId": "...", "rate": 18, "effectiveDate": "...", "expiryDate": "..." }`
  - Response: `{ "id": "...", "rate": 18, ... }`

- `PUT /tax/rates/:id`: Update tax rate
  - Request: `{ "rate": 18, "effectiveDate": "...", "expiryDate": "...", "isActive": true }`
  - Response: `{ "id": "...", "rate": 18, ... }`

- `DELETE /tax/rates/:id`: Delete tax rate
  - Response: `{ "message": "Tax rate deleted successfully" }`

### Tax Calculation

- `POST /tax/calculate`: Calculate tax
  - Request: `{ "taxTypeId": "...", "amount": 1000, "date": "..." }`
  - Response: `{ "taxType": "VAT", "taxRate": 18, "amount": 1000, "taxAmount": 180, "totalAmount": 1180 }`

## Notification Module

### SMS Templates

- `GET /notification/sms/templates`: Get all SMS templates
  - Query Parameters:
    - `event`: Filter by SMS event ID
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /notification/sms/templates/:id`: Get SMS template by ID
  - Response: `{ "id": "...", "name": "...", ... }`

- `POST /notification/sms/templates`: Create new SMS template
  - Request: `{ "name": "...", "content": "...", "smsEventId": "..." }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /notification/sms/templates/:id`: Update SMS template
  - Request: `{ "name": "...", "content": "...", "smsEventId": "...", "isActive": true }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /notification/sms/templates/:id`: Delete SMS template
  - Response: `{ "message": "SMS template deleted successfully" }`

### SMS Events

- `GET /notification/sms/events`: Get all SMS events
  - Response: `[{ "id": "...", "name": "...", ... }]`

### SMS Testing

- `POST /notification/sms/test`: Send test SMS
  - Request: `{ "templateId": "...", "phoneNumber": "...", "placeholders": { "name": "John", "amount": "1000" } }`
  - Response: `{ "success": true, "message": "Test SMS sent successfully", "details": {...} }`

## Report Module

### Report Templates

- `GET /report/templates`: Get all report templates
  - Query Parameters:
    - `category`: Filter by category (`LOAN`, `ACCOUNTING`, `USER`, `ADMIN`, `SYSTEM`, `CUSTOM`)
  - Response: `[{ "id": "...", "name": "...", ... }]`

- `GET /report/templates/:id`: Get report template by ID
  - Response: `{ "id": "...", "name": "...", ... }`

- `POST /report/templates`: Create new report template
  - Request: `{ "name": "...", "description": "...", "category": "LOAN", "query": "SELECT * FROM loans WHERE status = :status", "parameters": { "status": { "type": "string", "required": true } } }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `PUT /report/templates/:id`: Update report template
  - Request: `{ "name": "...", "description": "...", "category": "LOAN", "query": "...", "parameters": {...}, "isActive": true }`
  - Response: `{ "id": "...", "name": "...", ... }`

- `DELETE /report/templates/:id`: Delete report template
  - Response: `{ "message": "Report template deleted successfully" }`

### Report Generation

- `POST /report/run/:id`: Run report
  - Request: `{ "parameters": { "status": "ACTIVE" } }`
  - Response: `{ "template": {...}, "parameters": {...}, "generatedAt": "...", "data": [...] }`

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```
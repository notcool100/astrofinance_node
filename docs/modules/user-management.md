# User Management Module

## Overview
The User Management module handles the creation, management, and organization of client accounts within the Financial Management System. It supports different user types and provides comprehensive client information management.

## Submodules

### 1. User Registration

#### Features
- **Client Registration**
  - Capture personal details (name, contact, address)
  - ID document verification
  - Initial account setup
  - User type assignment (SB, BB, MB)
  
- **Account Creation**
  - Account number generation
  - Initial deposit processing
  - Welcome kit generation
  - SMS notification on registration

#### Technical Implementation
- Form validation with client and server-side checks
- Document upload with validation
- Unique account number generation algorithm
- Integration with SMS notification service

### 2. User Profile Management

#### Features
- **Profile Viewing**
  - Personal information display
  - Account details and balances
  - Transaction history
  - Loan status overview
  
- **Profile Editing**
  - Update personal information
  - Change contact details
  - Update address information
  - ID document updates

#### Technical Implementation
- Secure profile data retrieval
- Audit logging for profile changes
- Field-level validation
- History tracking of profile changes

### 3. User Type Management

#### Features
- **SB (Sadaran Bachat) Management**
  - Regular savings account features
  - Standard interest calculations
  - Regular transaction capabilities
  
- **BB (Baal Bachat) Management**
  - Child savings account features
  - Guardian information management
  - Special interest rates
  - Age-based restrictions
  
- **MB (Masik Bachat) Management**
  - Monthly deposit scheme
  - Fixed deposit amount tracking
  - Penalty for missed deposits
  - Maturity handling

#### Technical Implementation
- User type-specific business rules
- Interest calculation based on account type
- Automated monthly processing for MB accounts
- Age verification for BB accounts

### 4. User Search and Listing

#### Features
- **Advanced Search**
  - Search by name, ID, account number
  - Filter by user type
  - Filter by account status
  - Filter by date range
  
- **User Listing**
  - Paginated user list
  - Sortable columns
  - Quick action buttons
  - Export functionality

#### Technical Implementation
- Optimized database queries for search
- Server-side pagination
- Caching for frequent searches
- CSV/Excel export functionality

## API Endpoints

### User Registration
- `POST /api/users` - Create new user
- `GET /api/user-types` - Get available user types

### User Profile
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user information
- `GET /api/users/:id/accounts` - Get user accounts
- `GET /api/users/:id/transactions` - Get user transactions
- `GET /api/users/:id/loans` - Get user loans

### User Type Management
- `PUT /api/users/:id/type` - Change user type
- `GET /api/user-types/:type/settings` - Get type-specific settings

### User Search
- `GET /api/users` - List/search users
- `GET /api/users/export` - Export user data

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT NOT NULL,
  id_type VARCHAR(50) NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  user_type VARCHAR(10) NOT NULL, -- SB, BB, MB
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(10) NOT NULL, -- Savings, Loan, etc.
  balance DECIMAL(15, 2) DEFAULT 0.00,
  interest_rate DECIMAL(5, 2) NOT NULL,
  opening_date DATE NOT NULL,
  last_transaction_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BB Account Details Table (for Baal Bachat)
```sql
CREATE TABLE bb_account_details (
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE PRIMARY KEY,
  guardian_name VARCHAR(100) NOT NULL,
  guardian_relation VARCHAR(50) NOT NULL,
  guardian_contact VARCHAR(20) NOT NULL,
  guardian_id_type VARCHAR(50) NOT NULL,
  guardian_id_number VARCHAR(50) NOT NULL,
  maturity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MB Account Details Table (for Masik Bachat)
```sql
CREATE TABLE mb_account_details (
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE PRIMARY KEY,
  monthly_deposit_amount DECIMAL(15, 2) NOT NULL,
  deposit_day INTEGER NOT NULL, -- Day of month for deposit
  term_months INTEGER NOT NULL,
  missed_deposits INTEGER DEFAULT 0,
  maturity_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## UI Components

### User Registration
- Multi-step registration form
- Document upload interface
- User type selection with explanations
- Success confirmation screen

### User Profile
- Profile information display
- Account summary cards
- Transaction history table
- Edit profile form

### User Search
- Advanced search form
- User listing table
- Action buttons for each user
- Export options

### User Type Management
- User type details view
- Type change confirmation dialog
- Type-specific settings forms

## Development Tasks

### Frontend Tasks
1. Create user registration multi-step form
2. Implement document upload with preview
3. Design user profile view and edit interfaces
4. Build user search and listing components
5. Create user type management interfaces
6. Implement data export functionality
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop user registration API with validation
2. Implement user profile management endpoints
3. Create user type-specific business logic
4. Develop search and filtering functionality
5. Implement data export services
6. Create account number generation service
7. Develop user activity tracking

## Testing Strategy

### Unit Tests
- User validation logic tests
- Account number generation tests
- User type-specific calculation tests

### Integration Tests
- User registration flow tests
- Profile update API tests
- Search functionality tests

### UI Tests
- Form validation tests
- Multi-step form navigation tests
- Responsive design tests

## Dependencies

### Frontend
- React Hook Form for complex forms
- React Query for data fetching
- React Table for user listings
- React Dropzone for document uploads

### Backend
- Express.js for API endpoints
- Multer for file uploads
- CSV-Writer for data exports
- Joi for validation
# Loan Module

## Overview
The Loan Module manages the entire loan lifecycle from application to closure, supporting different loan types with various interest calculation methods. It includes features for loan application processing, EMI calculation, repayment tracking, and loan status management.

## Submodules

### 1. Loan Application

#### Features
- **Application Form**
  - Loan type selection (Flat, Diminishing)
  - Loan amount and tenure input
  - Purpose of loan
  - Applicant details
  - Document upload
  
- **Application Processing**
  - Application review interface
  - Document verification
  - Credit assessment
  - Approval/rejection workflow
  - Terms and conditions generation

#### Technical Implementation
- Multi-step form with state management
- Document upload with validation
- Workflow engine for application processing
- Automated credit scoring (optional)

### 2. EMI Calculator

#### Features
- **Calculation Engine**
  - Flat interest calculation
  - Diminishing interest calculation
  - Tenure-based EMI computation
  - Total interest and payment calculation
  
- **Interactive Interface**
  - Loan amount slider
  - Tenure selector
  - Interest rate input
  - Real-time calculation
  - Amortization schedule preview

#### Technical Implementation
- Financial calculation algorithms
- Client-side and server-side calculation
- Interactive UI components
- Printable/exportable results

### 3. Loan Disbursement

#### Features
- **Disbursement Processing**
  - Approval confirmation
  - Disbursement amount verification
  - Account crediting
  - Documentation generation
  - Notification to borrower
  
- **Disbursement Tracking**
  - Disbursement history
  - Disbursement status updates
  - Audit trail

#### Technical Implementation
- Integration with accounting module
- Transaction processing
- Document generation
- SMS notification integration

### 4. Repayment Management

#### Features
- **Installment Tracking**
  - Due date monitoring
  - Payment collection recording
  - Overdue payment handling
  - Partial payment processing
  
- **Repayment Schedule**
  - Amortization table generation
  - Principal and interest breakdown
  - Remaining balance calculation
  - Schedule adjustments for irregular payments

#### Technical Implementation
- Scheduled tasks for due date monitoring
- Payment allocation algorithms
- Late fee calculation
- Rescheduling functionality

### 5. Loan Closure

#### Features
- **Early Settlement**
  - Foreclosure amount calculation
  - Settlement processing
  - Discount/penalty application
  - Closure documentation
  
- **Regular Closure**
  - Final payment verification
  - Loan account closure
  - Completion certificate generation
  - Record archiving

#### Technical Implementation
- Early settlement calculation algorithms
- Integration with accounting for settlements
- Document generation
- Status update workflows

## API Endpoints

### Loan Application
- `GET /api/loan-types` - Get available loan types
- `POST /api/loans/applications` - Submit loan application
- `GET /api/loans/applications/:id` - Get application details
- `PUT /api/loans/applications/:id/status` - Update application status

### EMI Calculator
- `POST /api/calculator/emi` - Calculate EMI
- `POST /api/calculator/amortization` - Generate amortization schedule

### Loan Management
- `GET /api/loans` - List/search loans
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans/:id/disburse` - Process disbursement
- `GET /api/loans/:id/schedule` - Get repayment schedule
- `POST /api/loans/:id/payments` - Record payment
- `PUT /api/loans/:id/reschedule` - Reschedule loan
- `POST /api/loans/:id/close` - Process loan closure

## Database Schema

### Loan Types Table
```sql
CREATE TABLE loan_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  interest_type VARCHAR(20) NOT NULL, -- flat, diminishing
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  min_tenure INTEGER NOT NULL, -- in months
  max_tenure INTEGER NOT NULL, -- in months
  interest_rate DECIMAL(5, 2) NOT NULL,
  processing_fee_percent DECIMAL(5, 2) DEFAULT 0,
  late_fee_amount DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loan Applications Table
```sql
CREATE TABLE loan_applications (
  id SERIAL PRIMARY KEY,
  application_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  loan_type_id INTEGER REFERENCES loan_types(id),
  amount DECIMAL(15, 2) NOT NULL,
  tenure INTEGER NOT NULL, -- in months
  purpose TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, disbursed
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_date TIMESTAMP,
  approved_by INTEGER REFERENCES admin_users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loans Table
```sql
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  loan_number VARCHAR(20) UNIQUE NOT NULL,
  application_id INTEGER REFERENCES loan_applications(id),
  user_id INTEGER REFERENCES users(id),
  loan_type_id INTEGER REFERENCES loan_types(id),
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure INTEGER NOT NULL, -- in months
  emi_amount DECIMAL(15, 2) NOT NULL,
  disbursement_date DATE,
  first_payment_date DATE,
  last_payment_date DATE,
  total_interest DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  processing_fee DECIMAL(10, 2) DEFAULT 0,
  outstanding_principal DECIMAL(15, 2) NOT NULL,
  outstanding_interest DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, closed, defaulted
  closure_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loan Installments Table
```sql
CREATE TABLE loan_installments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  remaining_principal DECIMAL(15, 2) NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
  late_fee DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loan Payments Table
```sql
CREATE TABLE loan_payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  installment_id INTEGER REFERENCES loan_installments(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  principal_component DECIMAL(15, 2) NOT NULL,
  interest_component DECIMAL(15, 2) NOT NULL,
  late_fee_component DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  received_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## UI Components

### Loan Application
- Loan type selection interface
- Multi-step application form
- Document upload component
- Application status tracker

### EMI Calculator
- Interactive calculator with sliders
- Amortization schedule table
- Graphical representation of payments
- Print/export functionality

### Loan Management
- Loan listing with filters
- Loan details view
- Repayment schedule display
- Payment recording interface

### Loan Closure
- Early settlement calculator
- Closure confirmation dialog
- Closure certificate generator

## Development Tasks

### Frontend Tasks
1. Create loan application multi-step form
2. Implement interactive EMI calculator
3. Design loan listing and details views
4. Build repayment schedule component
5. Create payment recording interface
6. Implement loan closure workflows
7. Design printable reports and certificates

### Backend Tasks
1. Develop loan application processing APIs
2. Implement EMI calculation algorithms
3. Create loan disbursement services
4. Develop repayment tracking system
5. Implement payment allocation logic
6. Create loan closure and settlement services
7. Develop scheduled tasks for due date monitoring

## Testing Strategy

### Unit Tests
- EMI calculation tests for different scenarios
- Payment allocation algorithm tests
- Due date calculation tests

### Integration Tests
- Loan application workflow tests
- Disbursement process tests
- Payment recording tests
- Loan closure tests

### UI Tests
- Form validation tests
- Calculator functionality tests
- Repayment schedule rendering tests

## Dependencies

### Frontend
- React Hook Form for application forms
- Recharts for payment visualizations
- React-Table for installment schedules
- React-PDF for document generation

### Backend
- Financial calculation libraries
- PDF generation libraries
- Scheduled task manager
- Transaction management utilities
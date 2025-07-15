# Expense Tracking Module

## Overview
The Expense Tracking module manages all operational expenses of the microfinance institution. It provides features for expense recording, categorization, approval workflows, budget management, and expense reporting.

## Submodules

### 1. Expense Categories

#### Features
- **Category Management**
  - Create and manage expense categories
  - Hierarchical category structure
  - Category status control
  - Budget allocation by category
  
- **Category Types**
  - Fixed expenses (rent, utilities)
  - Variable expenses (supplies, travel)
  - Capital expenses
  - Operational expenses

#### Technical Implementation
- Hierarchical data structure for categories
- Budget allocation algorithms
- Category status tracking
- Integration with accounting module

### 2. Expense Recording

#### Features
- **Expense Entry**
  - Record expense details
  - Attach receipts/invoices
  - Assign to categories
  - Tag with projects/departments
  
- **Recurring Expenses**
  - Set up recurring expense templates
  - Schedule automatic entries
  - Notification for upcoming expenses
  - Variance tracking

#### Technical Implementation
- Form validation for expense entries
- Document upload and storage
- Recurring expense scheduling
- Integration with notification system

### 3. Approval Workflow

#### Features
- **Approval Levels**
  - Configure approval thresholds
  - Multi-level approval chains
  - Delegation of approval authority
  - Approval deadline management
  
- **Approval Process**
  - Expense submission
  - Reviewer assignment
  - Approval/rejection with comments
  - Final processing

#### Technical Implementation
- Workflow engine for approvals
- Notification system for pending approvals
- Audit logging of approval actions
- Escalation for delayed approvals

### 4. Budget Management

#### Features
- **Budget Definition**
  - Annual/quarterly/monthly budgets
  - Category-wise allocation
  - Department/project budgets
  - Budget revision history
  
- **Budget Monitoring**
  - Actual vs. budget comparison
  - Variance analysis
  - Trend visualization
  - Forecasting

#### Technical Implementation
- Budget calculation algorithms
- Variance computation
- Historical data analysis
- Forecasting models

### 5. Expense Reporting

#### Features
- **Standard Reports**
  - Expense summary by category
  - Expense trends over time
  - Budget variance reports
  - Department/project expense reports
  
- **Custom Reports**
  - Report parameter configuration
  - Custom grouping and filtering
  - Visualization options
  - Export capabilities

#### Technical Implementation
- Report generation engine
- Data aggregation services
- Visualization components
- Export functionality

## API Endpoints

### Expense Categories
- `GET /api/expenses/categories` - List all categories
- `POST /api/expenses/categories` - Create new category
- `GET /api/expenses/categories/:id` - Get category details
- `PUT /api/expenses/categories/:id` - Update category
- `GET /api/expenses/category-types` - Get category types

### Expense Recording
- `GET /api/expenses` - List/search expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/:id/receipts` - Upload receipt

### Approval Workflow
- `GET /api/expenses/pending-approval` - Get expenses pending approval
- `PUT /api/expenses/:id/approve` - Approve expense
- `PUT /api/expenses/:id/reject` - Reject expense
- `GET /api/expenses/approval-settings` - Get approval settings
- `PUT /api/expenses/approval-settings` - Update approval settings

### Budget Management
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get budget details
- `PUT /api/budgets/:id` - Update budget
- `GET /api/budgets/:id/variance` - Get budget variance

### Expense Reporting
- `GET /api/expenses/reports/summary` - Get expense summary
- `GET /api/expenses/reports/trend` - Get expense trend
- `GET /api/expenses/reports/budget-variance` - Get budget variance report
- `POST /api/expenses/reports/custom` - Generate custom report

## Database Schema

### Expense Categories Table
```sql
CREATE TABLE expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES expense_categories(id),
  category_type VARCHAR(50) NOT NULL, -- fixed, variable, capital, operational
  budget_allocation_percent DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  expense_number VARCHAR(20) UNIQUE NOT NULL,
  category_id INTEGER REFERENCES expense_categories(id),
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  payee VARCHAR(100),
  payment_method VARCHAR(50) NOT NULL, -- cash, bank, credit card
  reference_number VARCHAR(100),
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20), -- monthly, quarterly, etc.
  recurring_day INTEGER,
  department VARCHAR(100),
  project VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid
  created_by INTEGER REFERENCES admin_users(id),
  approved_by INTEGER REFERENCES admin_users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expense Receipts Table
```sql
CREATE TABLE expense_receipts (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Approval Levels Table
```sql
CREATE TABLE approval_levels (
  id SERIAL PRIMARY KEY,
  level_name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2),
  approver_role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expense Approvals Table
```sql
CREATE TABLE expense_approvals (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
  approval_level_id INTEGER REFERENCES approval_levels(id),
  approver_id INTEGER REFERENCES admin_users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  action_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Budgets Table
```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- annual, quarterly, monthly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  department VARCHAR(100),
  project VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, closed
  created_by INTEGER REFERENCES admin_users(id),
  approved_by INTEGER REFERENCES admin_users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Budget Allocations Table
```sql
CREATE TABLE budget_allocations (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES expense_categories(id),
  allocated_amount DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## UI Components

### Expense Categories
- Category hierarchy tree view
- Category creation/edit form
- Budget allocation interface
- Category status controls

### Expense Recording
- Expense entry form
- Receipt upload and preview
- Recurring expense configuration
- Expense listing with filters

### Approval Workflow
- Approval configuration interface
- Pending approvals dashboard
- Approval/rejection form
- Approval history view

### Budget Management
- Budget creation form
- Allocation by category interface
- Budget vs. actual comparison
- Budget revision history

### Expense Reporting
- Report parameter selection
- Interactive data visualization
- Tabular report display
- Export options

## Development Tasks

### Frontend Tasks
1. Create expense category management interfaces
2. Implement expense entry form with receipt upload
3. Design approval workflow screens
4. Build budget management interfaces
5. Create expense reporting and visualization components
6. Implement recurring expense configuration
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop expense category management APIs
2. Implement expense recording with validation
3. Create approval workflow engine
4. Develop budget management services
5. Implement expense reporting and analytics
6. Create recurring expense scheduling
7. Develop receipt storage and retrieval services

## Testing Strategy

### Unit Tests
- Expense validation logic tests
- Budget allocation algorithm tests
- Approval workflow logic tests

### Integration Tests
- Expense creation and approval flow tests
- Budget creation and monitoring tests
- Reporting generation tests

### UI Tests
- Form validation tests
- File upload functionality tests
- Report parameter selection tests

## Dependencies

### Frontend
- React Hook Form for expense forms
- React Dropzone for receipt uploads
- React Table for expense listings
- Recharts for budget visualizations

### Backend
- Multer for file uploads
- PDF generation for receipts
- Scheduled tasks for recurring expenses
- Reporting engine integration
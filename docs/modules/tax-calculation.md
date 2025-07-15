# Tax Calculation Module

## Overview
The Tax Calculation module handles all tax-related calculations, reporting, and compliance requirements for the microfinance institution. It supports various tax types, rates, and generates necessary tax reports and certificates.

## Submodules

### 1. Tax Configuration

#### Features
- **Tax Rate Management**
  - Configure different tax types
  - Set tax rates and thresholds
  - Define tax periods
  - Configure exemptions and deductions
  
- **Tax Rules Engine**
  - Rule-based tax application
  - Product-specific tax rules
  - Customer category tax rules
  - Transaction type tax rules

#### Technical Implementation
- Configurable tax rule engine
- Version control for tax rates
- Effective date management
- Rule priority handling

### 2. TDS (Tax Deducted at Source)

#### Features
- **TDS Calculation**
  - Interest income TDS calculation
  - Threshold-based application
  - Exemption handling
  - Rate differentiation by customer type
  
- **TDS Deduction**
  - Automatic deduction from interest
  - Manual adjustment capability
  - Deduction scheduling
  - Deduction reversal handling

#### Technical Implementation
- Integration with interest calculation
- Threshold checking algorithms
- Automatic deduction processing
- Audit logging for all TDS transactions

### 3. Tax Reporting

#### Features
- **Periodic Reports**
  - Monthly tax collection summary
  - Quarterly tax returns
  - Annual tax statements
  - Tax reconciliation reports
  
- **Customer Tax Certificates**
  - TDS certificate generation
  - Annual interest and tax statement
  - Certificate distribution
  - Certificate verification

#### Technical Implementation
- Report generation engine
- PDF certificate generation
- Digital signature integration (optional)
- Bulk processing capabilities

### 4. Tax Compliance

#### Features
- **Regulatory Compliance**
  - Tax authority filing preparation
  - Compliance checklist
  - Deadline monitoring
  - Audit support documentation
  
- **Tax Remittance**
  - Tax payment scheduling
  - Payment tracking
  - Challan/voucher generation
  - Remittance reconciliation

#### Technical Implementation
- Compliance calendar with alerts
- Document management for compliance
- Integration with accounting for remittance
- Historical compliance record keeping

## API Endpoints

### Tax Configuration
- `GET /api/tax/types` - List tax types
- `GET /api/tax/rates` - Get tax rates
- `PUT /api/tax/rates` - Update tax rates
- `GET /api/tax/rules` - Get tax rules
- `POST /api/tax/rules` - Create tax rule
- `PUT /api/tax/rules/:id` - Update tax rule

### TDS Management
- `GET /api/tax/tds/calculations` - List TDS calculations
- `POST /api/tax/tds/calculate` - Calculate TDS for account/period
- `GET /api/tax/tds/exemptions` - List TDS exemptions
- `POST /api/tax/tds/exemptions` - Create TDS exemption
- `PUT /api/tax/tds/adjustments/:id` - Adjust TDS entry

### Tax Reporting
- `GET /api/tax/reports/summary` - Generate tax summary report
- `GET /api/tax/reports/returns` - Generate tax returns report
- `GET /api/tax/certificates` - List generated certificates
- `POST /api/tax/certificates/generate` - Generate tax certificates
- `GET /api/tax/certificates/:id` - Get certificate details
- `GET /api/tax/certificates/:id/download` - Download certificate

### Tax Compliance
- `GET /api/tax/compliance/calendar` - Get compliance calendar
- `GET /api/tax/compliance/checklist` - Get compliance checklist
- `PUT /api/tax/compliance/checklist/:id` - Update compliance status
- `GET /api/tax/remittance` - List tax remittances
- `POST /api/tax/remittance` - Create tax remittance record

## Database Schema

### Tax Types Table
```sql
CREATE TABLE tax_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tax Rates Table
```sql
CREATE TABLE tax_rates (
  id SERIAL PRIMARY KEY,
  tax_type_id INTEGER REFERENCES tax_types(id),
  rate DECIMAL(5, 2) NOT NULL,
  threshold_amount DECIMAL(15, 2),
  effective_from DATE NOT NULL,
  effective_to DATE,
  customer_category VARCHAR(50), -- individual, corporate, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tax Rules Table
```sql
CREATE TABLE tax_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tax_type_id INTEGER REFERENCES tax_types(id),
  product_type VARCHAR(50), -- savings, loan, etc.
  transaction_type VARCHAR(50), -- interest, fee, etc.
  customer_category VARCHAR(50),
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TDS Calculations Table
```sql
CREATE TABLE tds_calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  account_id INTEGER REFERENCES accounts(id),
  transaction_id INTEGER, -- Reference to interest transaction
  calculation_date DATE NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  tds_rate DECIMAL(5, 2) NOT NULL,
  tds_amount DECIMAL(15, 2) NOT NULL,
  is_exempted BOOLEAN DEFAULT false,
  exemption_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'calculated', -- calculated, deducted, adjusted, reversed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TDS Exemptions Table
```sql
CREATE TABLE tds_exemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exemption_type VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  valid_from DATE NOT NULL,
  valid_to DATE,
  document_path VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  verified_by INTEGER REFERENCES admin_users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tax Certificates Table
```sql
CREATE TABLE tax_certificates (
  id SERIAL PRIMARY KEY,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  tax_type_id INTEGER REFERENCES tax_types(id),
  financial_year VARCHAR(10) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_income DECIMAL(15, 2) NOT NULL,
  total_tax DECIMAL(15, 2) NOT NULL,
  generated_by INTEGER REFERENCES admin_users(id),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'generated', -- generated, delivered, downloaded
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tax Remittances Table
```sql
CREATE TABLE tax_remittances (
  id SERIAL PRIMARY KEY,
  tax_type_id INTEGER REFERENCES tax_types(id),
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE,
  reference_number VARCHAR(100),
  challan_number VARCHAR(100),
  remarks TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, verified
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## UI Components

### Tax Configuration
- Tax type and rate management interface
- Tax rule configuration form
- Effective date selector
- Rule priority management

### TDS Management
- TDS calculation preview
- Exemption management interface
- TDS adjustment form
- TDS transaction listing

### Tax Reporting
- Report parameter selection form
- Report preview with filtering
- Certificate generation interface
- Certificate preview and download

### Tax Compliance
- Compliance calendar view
- Checklist with status indicators
- Remittance recording interface
- Compliance document management

## Development Tasks

### Frontend Tasks
1. Create tax configuration interfaces
2. Implement TDS calculation preview
3. Design tax report generation forms
4. Build certificate generation and preview
5. Create compliance calendar and checklist
6. Implement remittance recording interface
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop tax rule engine
2. Implement TDS calculation algorithms
3. Create tax report generation services
4. Develop certificate generation with PDF output
5. Implement compliance tracking system
6. Create remittance management services
7. Develop integration with accounting module

## Testing Strategy

### Unit Tests
- Tax calculation algorithm tests
- Rule application logic tests
- Certificate generation tests

### Integration Tests
- End-to-end tax calculation tests
- Report generation tests
- Accounting integration tests

### UI Tests
- Configuration form validation tests
- Report parameter selection tests
- Certificate preview tests

## Dependencies

### Frontend
- React Hook Form for configuration forms
- React-PDF for certificate preview
- React-Table for tax data display
- Date-FNS for tax period calculations

### Backend
- PDF generation libraries
- Tax calculation utilities
- Report generation services
- Document storage integration
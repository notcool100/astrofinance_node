# Report Generation & Printing Module

## Overview
The Report Generation & Printing module provides comprehensive reporting capabilities across all aspects of the Financial Management System. It enables users to generate, customize, export, and print various reports for operational, analytical, and compliance purposes.

## Submodules

### 1. Report Configuration

#### Features
- **Report Template Management**
  - Create and edit report templates
  - Define report parameters
  - Configure report layout
  - Set default filters and sorting
  
- **Report Categories**
  - User/Client reports
  - Loan reports
  - Financial reports
  - Operational reports
  - Compliance reports

#### Technical Implementation
- Template engine with customizable layouts
- Parameter definition framework
- Layout configuration storage
- Template versioning

### 2. Report Generation

#### Features
- **Parameter Selection**
  - Date range selection
  - Filter criteria definition
  - Grouping options
  - Sorting preferences
  
- **Report Processing**
  - Data retrieval and aggregation
  - Calculation of derived metrics
  - Formatting and styling
  - Pagination handling

#### Technical Implementation
- Query builder for data retrieval
- Data aggregation engine
- Asynchronous processing for large reports
- Caching strategy for frequent reports

### 3. Report Export

#### Features
- **Export Formats**
  - PDF generation
  - Excel/CSV export
  - HTML output
  - JSON data export
  
- **Export Options**
  - Layout customization
  - Include/exclude columns
  - Header/footer configuration
  - Branding and styling

#### Technical Implementation
- PDF generation service
- Excel/CSV formatting
- Responsive HTML templates
- Export job queuing for large reports

### 4. Report Printing

#### Features
- **Print Layout**
  - Print-optimized formatting
  - Page size and orientation
  - Header and footer on each page
  - Print preview
  
- **Batch Printing**
  - Multiple report printing
  - Print job management
  - Print history tracking
  - Print server integration (optional)

#### Technical Implementation
- Print-specific CSS
- Browser print API integration
- Print preview rendering
- Print job tracking

### 5. Scheduled Reports

#### Features
- **Report Scheduling**
  - Frequency configuration (daily, weekly, monthly)
  - Recipient management
  - Delivery method selection (email, download)
  - Parameter pre-configuration
  
- **Delivery Management**
  - Email delivery with attachments
  - Secure download links
  - Delivery status tracking
  - Retry mechanism for failed deliveries

#### Technical Implementation
- Scheduled task management
- Email service integration
- Secure link generation
- Delivery status monitoring

## API Endpoints

### Report Configuration
- `GET /api/reports/templates` - List report templates
- `POST /api/reports/templates` - Create report template
- `GET /api/reports/templates/:id` - Get template details
- `PUT /api/reports/templates/:id` - Update template
- `GET /api/reports/categories` - Get report categories

### Report Generation
- `GET /api/reports/parameters/:templateId` - Get report parameters
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/data/:reportId` - Get report data
- `GET /api/reports/status/:jobId` - Check report generation status

### Report Export
- `POST /api/reports/:id/export/pdf` - Export report to PDF
- `POST /api/reports/:id/export/excel` - Export report to Excel
- `POST /api/reports/:id/export/csv` - Export report to CSV
- `GET /api/reports/downloads/:exportId` - Download exported report

### Scheduled Reports
- `GET /api/reports/scheduled` - List scheduled reports
- `POST /api/reports/scheduled` - Create scheduled report
- `PUT /api/reports/scheduled/:id` - Update scheduled report
- `DELETE /api/reports/scheduled/:id` - Delete scheduled report
- `GET /api/reports/scheduled/:id/history` - Get delivery history

## Database Schema

### Report Templates Table
```sql
CREATE TABLE report_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  query_definition JSONB NOT NULL,
  layout_definition JSONB NOT NULL,
  parameter_definition JSONB,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Report Jobs Table
```sql
CREATE TABLE report_jobs (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES report_templates(id),
  parameters JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  result_data JSONB,
  error_message TEXT,
  requested_by INTEGER REFERENCES admin_users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Report Exports Table
```sql
CREATE TABLE report_exports (
  id SERIAL PRIMARY KEY,
  report_job_id INTEGER REFERENCES report_jobs(id),
  format VARCHAR(20) NOT NULL, -- pdf, excel, csv, html
  file_path VARCHAR(255),
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  requested_by INTEGER REFERENCES admin_users(id),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scheduled Reports Table
```sql
CREATE TABLE scheduled_reports (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES report_templates(id),
  name VARCHAR(100) NOT NULL,
  parameters JSONB,
  frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly
  day_of_week INTEGER, -- 1-7 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME NOT NULL,
  format VARCHAR(20) NOT NULL, -- pdf, excel, csv
  recipients JSONB, -- array of email addresses
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Report Delivery History Table
```sql
CREATE TABLE report_delivery_history (
  id SERIAL PRIMARY KEY,
  scheduled_report_id INTEGER REFERENCES scheduled_reports(id),
  export_id INTEGER REFERENCES report_exports(id),
  delivery_method VARCHAR(20) NOT NULL, -- email, download
  recipient VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## UI Components

### Report Configuration
- Template creation/edit form
- Parameter configuration interface
- Layout designer
- Template listing with filters

### Report Generation
- Parameter selection form
- Report preview
- Interactive data grid
- Filtering and sorting controls

### Report Export
- Export format selection
- Export options configuration
- Download management
- Export history

### Scheduled Reports
- Schedule configuration form
- Recipient management
- Delivery history view
- Schedule status indicators

## Development Tasks

### Frontend Tasks
1. Create report template management interfaces
2. Implement parameter selection forms
3. Design report preview components
4. Build export configuration screens
5. Create scheduled report management UI
6. Implement print preview functionality
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop report template engine
2. Implement data retrieval and aggregation services
3. Create PDF/Excel/CSV export services
4. Develop report scheduling system
5. Implement email delivery service
6. Create report caching mechanism
7. Develop print-optimized output generation

## Testing Strategy

### Unit Tests
- Report parameter validation tests
- Data aggregation algorithm tests
- Export formatting tests

### Integration Tests
- End-to-end report generation tests
- Export service tests
- Scheduled report tests

### UI Tests
- Parameter form validation tests
- Report preview rendering tests
- Print functionality tests

## Dependencies

### Frontend
- React Hook Form for parameter forms
- React-Table for data display
- React-PDF for PDF preview
- React-to-Print for print functionality

### Backend
- PDF generation libraries (PDFKit, Puppeteer)
- Excel/CSV generation libraries
- Email service integration
- Scheduled task manager
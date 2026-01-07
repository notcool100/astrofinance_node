# Financial Management System (FMS)

## Project Overview
This project involves developing a comprehensive Financial Management System for a microfinance company in Nepal. The system will handle user management, loan calculation, interest handling, accounting entries, and financial reporting.

## Key Features

- **Admin Portal**: Central administration interface for system configuration and management
- **User Management**: Client account and profile management with support for different account types
- **Loan Module**: End-to-end loan management from application to closure with flexible product configuration
- **Accounting & Financial Reporting**: Complete financial transaction management with journal entries and reports
- **SMS Notifications**: Automated client communication through SMS with template management
- **Tax Calculation**: Tax-related calculations, TDS handling, and compliance reporting
- **Report Generation & Printing**: Comprehensive reporting capabilities with multiple export formats
- **Expense Tracking**: Operational expense management with approval workflows and budget monitoring

## Technology Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **State Management**: React Query
- **UI Components**: Custom components with Tailwind CSS
- **Form Handling**: React Hook Form
- **Data Visualization**: Chart.js, Recharts

### Backend
- **Runtime**: Node.js
- **API Framework**: Express.js
- **ORM**: Prisma
- **Architecture**: Module-based (route-module-controller-service)
- **Authentication**: JWT, Passport.js
- **Validation**: Joi

### Database
- **RDBMS**: PostgreSQL
- **ORM/Migration**: Prisma schema and migrations
- **Backup**: Automated backup strategies
- **Dynamic UI**: Database-driven navigation and permissions

### DevOps
- **CI/CD**: Azure DevOps Pipelines
- **Deployment**: Ubuntu VPS (Contabo)
- **Web Server**: Nginx (reverse proxy)
- **Monitoring**: Nginx logs

## Project Structure
```
/astrofinanceNew
├── fe/                  # Frontend (Next.js + TypeScript)
│   ├── public/          # Static assets
│   └── src/             # Source code
│       ├── components/  # UI components
│       ├── pages/       # Next.js pages
│       ├── services/    # API services
│       └── utils/       # Utility functions
├── be/                  # Backend (Node.js)
│   ├── src/             # Source code
│   │   ├── modules/     # Feature modules
│   │   │   ├── admin/   # Admin module
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── admin.route.ts
│   │   │   │   └── admin.service.ts
│   │   │   └── ...     # Other modules
│   │   ├── common/     # Shared code
│   │   ├── config/     # Configuration
│   │   ├── prisma/     # Prisma schema and client
│   │   └── utils/      # Utility functions
│   └── tests/           # Test files
├── db/                  # Database resources
│   ├── schema/          # Database schema design
│   ├── seed-data/       # Seed data for development
│   └── scripts/         # Database utility scripts
├── devops/              # DevOps configuration
│   ├── pipelines/       # Azure Pipeline definitions
│   └── infrastructure/  # Infrastructure as Code
├── docs/                # Project documentation
│   ├── modules/         # Module documentation
│   ├── setup/           # Setup guides
│   └── guidelines/      # Development guidelines
└── documents/           # Original project requirements
```

## Modules
The system consists of the following main modules:

1. [Admin Portal](./docs/modules/admin-portal.md)
   - Dashboard
   - User Administration
   - System Configuration
   - Audit Trail
   - Navigation Management

2. [User Management](./docs/modules/user-management.md)
   - User Registration
   - User Profile Management
   - Account Types (SB, BB, MB)
   - User Search and Reporting

3. [Staff Management](./docs/modules/staff-management.md)
   - Staff Registration
   - Role Assignment
   - Permission Management
   - Staff Performance Tracking
   - Attendance Management

4. [Loan Module](./docs/modules/loan-module.md)
   - Loan Products
   - Loan Application
   - Loan Processing
   - Loan Servicing
   - Loan Closure

4. [Accounting & Financial Reporting](./docs/modules/accounting.md)
   - Chart of Accounts
   - Journal Entries
   - Day Book
   - Financial Reports
   - Transaction Tallying

5. [SMS Notifications](./docs/modules/sms-notifications.md)
   - SMS Gateway Integration
   - Notification Templates
   - Event-Based Notifications
   - Notification Tracking

6. [Tax Calculation](./docs/modules/tax-calculation.md)
   - Tax Configuration
   - TDS (Tax Deducted at Source)
   - Tax Reporting
   - Tax Compliance

7. [Report Generation & Printing](./docs/modules/reports.md)
   - Report Configuration
   - Report Generation
   - Report Export
   - Report Printing
   - Scheduled Reports

8. [Expense Tracking](./docs/modules/expense-tracking.md)
   - Expense Categories
   - Expense Recording
   - Approval Workflow
   - Budget Management
   - Expense Reporting

## Getting Started

### Prerequisites
- Node.js (v16.x or later)
- npm (v8.x or later) or yarn (v1.22.x or later)
- PostgreSQL (v14.x or later)
- Git

### Installation

Please refer to the setup documentation for each component:
- [Frontend Setup](./docs/setup/frontend-setup.md)
- [Backend Setup](./docs/setup/backend-setup.md)
- [Database Setup](./docs/setup/database-setup.md)
- [DevOps Setup](./docs/setup/devops-setup.md)

### Deployment

The application is deployed to an Ubuntu VPS using Azure DevOps pipelines. For deployment setup:

1. **Azure DevOps Configuration**: Follow the [Azure Secure Files Setup Guide](./devops/AZURE_SECURE_FILES_SETUP.md) to configure environment variables
2. **Server Setup**: The backend API is served through Nginx on port 4000 (dev) and 4001 (production)
3. **Pipeline**: The pipeline automatically builds and deploys both frontend and backend on push to `develop` branch

**Key Deployment Details**:
- **Dev Frontend**: Deployed to `/var/www/astrofinance/frontend-dev`, port 4000 (nginx)
- **Dev Backend**: Deployed to `/var/www/astrofinance/backend-dev`, port 4010 (nginx)
- **Backend API Internal Port**: 5500, proxied through Nginx on port 4010
- **Frontend Internal Port**: 3000, proxied through Nginx on port 4000
- **Environment Files**: Managed securely via Azure DevOps Library

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/astrofinanceNew.git
   cd astrofinanceNew
   ```

2. Set up the frontend:
   ```bash
   cd fe
   npm install
   # Create .env.local file with required environment variables
   npm run dev
   ```

3. Set up the backend:
   ```bash
   cd be
   npm install
   # Create .env file with required environment variables
   npm run dev
   ```

4. Set up the database:
   ```bash
   # Create PostgreSQL database
   cd be
   npm run migrate
   npm run seed
   ```

## Development Workflow

We follow a modified Git Flow workflow. Please refer to our [Git Workflow Guidelines](./docs/guidelines/git-workflow.md) for detailed information.

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

3. Push your branch and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Guidelines
- [Coding Standards](./docs/guidelines/coding-standards.md)
- [Git Workflow](./docs/guidelines/git-workflow.md)
- [Testing Guidelines](./docs/guidelines/testing-guidelines.md)
- [Documentation Guidelines](./docs/guidelines/documentation-guidelines.md)

## Project Timeline
Please refer to the [Project Plan](./docs/project-plan.md) for detailed information about the project timeline, milestones, and deliverables.

## Team Structure

- **Project Manager**: Overall project coordination
- **Business Analyst**: Requirements gathering and analysis
- **Frontend Developers**: UI/UX implementation
- **Backend Developers**: API and business logic implementation
- **Database Engineer**: Database design and optimization
- **QA Engineer**: Testing and quality assurance
- **DevOps Engineer**: CI/CD and infrastructure

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact the project team at project-team@example.com.
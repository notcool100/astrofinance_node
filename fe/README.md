# AstroFinance - Frontend

This directory contains the frontend application for AstroFinance, built with Next.js and TypeScript.

## Technology Stack

- Next.js
- TypeScript
- React Query
- Tailwind CSS
- Chart.js (for data visualization)
- React Hook Form (for form handling)

## Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm (v8.x or later) or yarn (v1.22.x or later)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd /home/notcool/Desktop/astrofinanceNew/fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Access the application:
   Open your browser and navigate to `http://localhost:3000`

Please refer to the [Frontend Setup Guide](../docs/setup/frontend-setup.md) for more detailed setup instructions.

## Directory Structure

```
/fe
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common UI elements
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   └── modules/        # Module-specific components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Next.js pages
│   ├── services/           # API services
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Features

The frontend implements the following modules:

1. **Authentication**
   - User login/registration
   - Admin login
   - Password management

2. **User Dashboard**
   - Overview of loans and applications
   - Quick actions
   - Upcoming payments

3. **Admin Dashboard**
   - System overview
   - User management
   - Loan management
   - Reports and analytics

4. **Loan Module**
   - Loan application
   - Loan calculator
   - Repayment schedule
   - Payment tracking

5. **User Management**
   - User profiles
   - Account management
   - Document management

6. **Accounting**
   - Financial reports
   - Transaction history
   - Journal entries

7. **SMS Notifications**
   - Notification templates
   - Event-based notifications

8. **Tax Calculation**
   - Tax rate management
   - TDS calculation

9. **Report Generation & Printing**
   - Custom report templates
   - Export to various formats

10. **Expense Tracking**
    - Expense categories
    - Approval workflows

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=AstroFinance
```

## Coding Standards

Please follow the project's coding standards and guidelines when contributing to this codebase. Refer to the [Coding Standards](../docs/guidelines/coding-standards.md) document for more information.
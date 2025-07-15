# Financial Management System - Backend

This directory contains the backend application for the Financial Management System, built with Node.js.

## Technology Stack

- Node.js
- Express.js
- PostgreSQL (with Prisma ORM)
- JWT for authentication
- Jest for testing

## Getting Started

Please refer to the [Backend Setup Guide](../docs/setup/backend-setup.md) for detailed setup instructions.

## Database Setup

The database schema is defined using Prisma ORM. To set up the database:

1. Make sure PostgreSQL is installed and running
2. Create a database user and database:
   ```sql
   CREATE USER fms_user WITH PASSWORD 'your_secure_password';
   CREATE DATABASE fms_db WITH OWNER fms_user;
   GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;
   ```
3. Update the `.env` file with your database connection string:
   ```
   DATABASE_URL="postgresql://fms_user:your_secure_password@localhost:5432/fms_db?schema=public"
   ```
4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
5. Apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Seed the database:
   ```bash
   npx prisma db seed
   ```

See the detailed instructions in `/src/prisma/README.md` for more information.

## Directory Structure

```
/be
├── src/
│   ├── modules/            # Feature modules
│   │   ├── admin/          # Admin module
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.route.ts
│   │   │   └── admin.service.ts
│   │   ├── user/           # User module
│   │   ├── staff/          # Staff module
│   │   ├── loan/           # Loan module
│   │   ├── accounting/     # Accounting module
│   │   ├── notification/   # SMS notification module
│   │   ├── tax/            # Tax calculation module
│   │   ├── report/         # Report generation module
│   │   └── expense/        # Expense tracking module
│   ├── common/             # Shared code
│   │   ├── decorators/     # Custom decorators
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Authentication guards
│   │   ├── interceptors/   # Request/response interceptors
│   │   └── middleware/     # Express middleware
│   ├── config/             # Configuration files
│   ├── prisma/             # Prisma schema and client
│   │   ├── schema.prisma   # Prisma schema definition
│   │   ├── migrations/     # Prisma migrations
│   │   └── seed.ts         # Database seeding script
│   ├── utils/              # Utility functions
│   └── app.ts              # Express application setup
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with initial data

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It is generated using Swagger/OpenAPI.

## Module Implementation

The backend implements the following modules:

1. Admin Portal
2. User Management
3. Loan Module
4. Accounting & Financial Reporting
5. SMS Notifications
6. Tax Calculation
7. Report Generation & Printing
8. Expense Tracking

Each module has its own controllers, services, models, and routes organized in the appropriate directories.

## Coding Standards

Please follow the project's coding standards and guidelines when contributing to this codebase. Refer to the [Coding Standards](../docs/guidelines/coding-standards.md) document for more information.
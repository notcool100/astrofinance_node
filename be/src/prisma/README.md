# AstroFinance Database Setup

This directory contains the Prisma schema and database seed files for the AstroFinance Financial Management System.

## Database Schema

The database schema is defined in `schema.prisma` and includes models for:

- Admin Portal (admin users, roles, permissions)
- User Management (users, accounts)
- Loan Module (loan types, applications, loans, installments)
- Accounting (chart of accounts, journal entries)
- SMS Notifications (templates, events, logs)
- Tax Calculation (tax types, rates, TDS)
- Report Generation (templates, jobs, exports)
- Expense Tracking (categories, expenses, approvals)
- Staff Management (staff, roles, attendance)

## Database Seeding

The seed script in `seed.ts` populates the database with initial data:

- Admin users with default credentials
- Roles and permissions
- Navigation structure
- Loan types
- Chart of accounts
- SMS templates and events
- Tax types and rates
- Expense categories
- Report templates

## Setup Instructions

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

## Database Management

- To view and edit the database using Prisma Studio:
  ```bash
  npx prisma studio
  ```
- To reset the database (development only):
  ```bash
  npx prisma migrate reset
  ```
- To create a new migration after schema changes:
  ```bash
  npx prisma migrate dev --name your_migration_name
  ```

## Default Admin Credentials

- Username: `admin`
- Password: `Admin@123`

**Note:** Change these credentials immediately in a production environment.
# Database Setup Guide

## Overview
This guide provides instructions for setting up and managing the PostgreSQL database for the Financial Management System. The database is the central repository for all system data and requires proper setup and maintenance.

## Prerequisites
- PostgreSQL (v14.x or later)
- psql command-line tool
- Node.js (for running migration scripts)
- Database administration knowledge

## Database Architecture

### Schema Design
The Financial Management System uses a relational database with the following main schemas:

1. **Public Schema**: Contains all application tables
2. **Audit Schema**: Contains audit logs and history tables (optional)

### Key Tables
The database includes tables for various modules:

- User Management (users, accounts, user types)
- Loan Management (loans, applications, installments)
- Accounting (journal entries, accounts, transactions)
- Expense Tracking (expenses, categories, budgets)
- Reporting (report templates, scheduled reports)
- System Administration (admin users, roles, permissions)

Refer to the individual module documentation for detailed table structures.

## Installation

### Installing PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### On CentOS/RHEL:
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Verifying Installation
```bash
psql --version
```

## Database Creation

1. Log in to PostgreSQL as the postgres user:
   ```bash
   sudo -u postgres psql
   ```

2. Create a database user for the application:
   ```sql
   CREATE USER fms_user WITH PASSWORD 'your_secure_password';
   ```

3. Create the database:
   ```sql
   CREATE DATABASE fms_db WITH OWNER fms_user;
   ```

4. Grant privileges:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;
   ```

5. Exit the PostgreSQL prompt:
   ```sql
   \q
   ```

## Database Configuration

### Connection Settings
Update the database connection settings in the backend environment file (`/be/.env`):

```
# Database Configuration (Prisma)
DATABASE_URL="postgresql://fms_user:your_secure_password@localhost:5432/fms_db?schema=public"
```

### Prisma Schema Configuration

The Prisma schema is defined in `/be/src/prisma/schema.prisma`. This file contains all database models, relationships, and configurations:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models are defined here
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  // ... other fields and relations
}

// ... other models
```

## Database Migration

### Using Prisma Migrations

1. Navigate to the backend directory:
   ```bash
   cd /home/notcool/Desktop/astrofinanceNew/be
   ```

2. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

3. Create and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
   This command will:
   - Create a new migration based on your schema changes
   - Apply the migration to your database
   - Generate the Prisma client

4. Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```
   
   The seed script is defined in `package.json`:
   ```json
   {
     "prisma": {
       "seed": "ts-node src/prisma/seed.ts"
     }
   }
   ```

### Using Prisma Studio

Prisma provides a visual database browser called Prisma Studio:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can view and edit your database data.

### Using SQL Scripts (Alternative)

For complex database operations or performance optimizations, you can still use raw SQL scripts:

1. Navigate to the database scripts directory:
   ```bash
   cd /home/notcool/Desktop/astrofinanceNew/db/scripts
   ```

2. Run custom SQL scripts:
   ```bash
   psql -U fms_user -d fms_db -f custom_script.sql
   ```

## Database Maintenance

### Backup Procedures

#### Creating a Backup
```bash
pg_dump -U fms_user -d fms_db -F c -f /path/to/backup/fms_backup_$(date +%Y%m%d).dump
```

#### Scheduling Regular Backups
Add a cron job to perform daily backups:
```bash
0 2 * * * pg_dump -U fms_user -d fms_db -F c -f /path/to/backup/fms_backup_$(date +%Y%m%d).dump
```

#### Restoring from Backup
```bash
pg_restore -U fms_user -d fms_db -c /path/to/backup/fms_backup_20230101.dump
```

### Performance Optimization

#### Indexing Strategy
The database includes indexes on:
- Primary keys (automatically created)
- Foreign keys
- Frequently queried columns
- Search fields

#### Recommended Indexes
```sql
-- User search optimization
CREATE INDEX idx_users_full_name ON users(full_name);
CREATE INDEX idx_users_contact_number ON users(contact_number);

-- Loan search optimization
CREATE INDEX idx_loans_loan_number ON loans(loan_number);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Transaction date optimization
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);

-- Expense tracking optimization
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
```

#### Database Maintenance Tasks
Schedule regular maintenance tasks:
```sql
-- Analyze tables to update statistics
ANALYZE;

-- Vacuum to reclaim space and update statistics
VACUUM ANALYZE;

-- Reindex to rebuild indexes
REINDEX DATABASE fms_db;
```

## Database Security

### Security Best Practices

1. **Network Security**:
   - Configure PostgreSQL to listen only on necessary interfaces
   - Use firewall rules to restrict access
   - Consider using SSL for connections

2. **Authentication**:
   - Use strong passwords
   - Consider using client certificates
   - Implement IP-based access restrictions

3. **Authorization**:
   - Grant minimal necessary privileges
   - Use row-level security for sensitive data
   - Audit access to sensitive tables

### Configuring SSL

1. Generate certificates:
   ```bash
   openssl req -new -text -out server.req
   openssl rsa -in privkey.pem -out server.key
   openssl req -x509 -in server.req -text -key server.key -out server.crt
   ```

2. Configure PostgreSQL to use SSL in `postgresql.conf`:
   ```
   ssl = on
   ssl_cert_file = 'server.crt'
   ssl_key_file = 'server.key'
   ```

3. Update connection settings to use SSL:
   ```javascript
   {
     dialect: 'postgres',
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: false
       }
     }
   }
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Check if PostgreSQL is running: `sudo systemctl status postgresql`
   - Verify PostgreSQL is listening on the expected port: `netstat -tuln | grep 5432`
   - Check pg_hba.conf for proper client authentication settings

2. **Authentication Failed**:
   - Verify username and password
   - Check pg_hba.conf for authentication method
   - Ensure the user has proper permissions

3. **Slow Queries**:
   - Use EXPLAIN ANALYZE to identify bottlenecks
   - Check for missing indexes
   - Optimize queries and database design

### PostgreSQL Log Files
Check PostgreSQL logs for detailed error information:
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Administration Cookbook](https://www.packtpub.com/product/postgresql-14-administration-cookbook/9781803243337)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
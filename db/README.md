# Financial Management System - Database

This directory contains database resources for the Financial Management System.

## Technology Stack

- PostgreSQL
- Prisma (for ORM and migrations)

## Getting Started

Please refer to the [Database Setup Guide](../docs/setup/database-setup.md) for detailed setup instructions.

## Directory Structure

```
/db
├── schema/                # Database schema design documents
├── seed-data/             # Seed data for development
│   ├── admin/             # Admin module seed data
│   ├── users/             # User module seed data
│   ├── staff/             # Staff module seed data
│   ├── navigation/        # Navigation menu seed data
│   └── other/             # Other seed data
├── scripts/               # Database utility scripts
│   ├── backup/            # Backup scripts
│   ├── restore/           # Restore scripts
│   ├── maintenance/       # Maintenance scripts
│   └── analysis/          # Database analysis scripts
└── docs/                  # Database documentation
    ├── er-diagrams/       # Entity-relationship diagrams
    └── data-dictionary/   # Data dictionary
```

## Prisma Schema

The actual database schema is defined in the Prisma schema file located at `/be/src/prisma/schema.prisma`. This file defines all models, relationships, and database configurations.

## Database-Driven Navigation

The system uses a database-driven approach for navigation menus. The navigation structure is stored in the database, allowing for dynamic menu generation based on user roles and permissions.

### Navigation Tables

- `navigation_items`: Stores menu items with their labels, icons, and URLs
- `navigation_groups`: Groups menu items into logical sections
- `role_navigation`: Maps navigation items to user roles
- `navigation_permissions`: Defines access permissions for navigation items

## Database Schema

The database includes tables for the following modules:

1. Admin Portal
   - admin_users
   - roles
   - permissions
   - role_permissions
   - admin_user_roles

2. User Management
   - users
   - accounts
   - bb_account_details
   - mb_account_details

3. Loan Module
   - loan_types
   - loan_applications
   - loans
   - loan_installments
   - loan_payments

4. Accounting & Financial Reporting
   - accounts (chart of accounts)
   - journal_entries
   - journal_entry_lines
   - day_book
   - account_balances

5. SMS Notifications
   - sms_gateways
   - sms_templates
   - sms_events
   - sms_logs
   - user_notification_preferences

6. Tax Calculation
   - tax_types
   - tax_rates
   - tax_rules
   - tds_calculations
   - tds_exemptions
   - tax_certificates
   - tax_remittances

7. Report Generation
   - report_templates
   - report_jobs
   - report_exports
   - scheduled_reports
   - report_delivery_history

8. Expense Tracking
   - expense_categories
   - expenses
   - expense_receipts
   - approval_levels
   - expense_approvals
   - budgets
   - budget_allocations
<!-- 
## Migration Commands

- `npx sequelize-cli db:migrate` - Run pending migrations
- `npx sequelize-cli db:migrate:undo` - Revert the most recent migration
- `npx sequelize-cli db:migrate:undo:all` - Revert all migrations
- `npx sequelize-cli db:seed:all` - Run all seeders
- `npx sequelize-cli db:seed:undo:all` - Revert all seeders

## Backup and Restore

- Backup: `pg_dump -U username -d database_name -F c -f backup_file.dump`
- Restore: `pg_restore -U username -d database_name -c backup_file.dump` -->

## Best Practices

1. Always use migrations for schema changes
2. Include both "up" and "down" methods in migrations
3. Keep migrations small and focused
4. Use transactions for data integrity
5. Add appropriate indexes for performance
6. Document complex queries and stored procedures
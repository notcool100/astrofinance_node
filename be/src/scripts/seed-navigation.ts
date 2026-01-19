import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Script to seed navigation data if it doesn't exist
 */
async function seedNavigation() {
  try {
    // Check if navigation groups exist
    const existingGroups = await prisma.navigationGroup.count();

    if (existingGroups === 0) {
      logger.info('No navigation groups found. Seeding navigation data...');

      // Create navigation groups
      const groups = [
        { name: 'Dashboard', description: 'Dashboard and analytics', order: 1 },
        { name: 'User Management', description: 'User and account management', order: 2 },
        { name: 'Loan Management', description: 'Loan processing and management', order: 3 },
        { name: 'Accounting', description: 'Accounting and financial operations', order: 4 },
        { name: 'Reports', description: 'Reports and analytics', order: 5 },
        { name: 'Administration', description: 'System administration', order: 6 },
      ];

      for (const group of groups) {
        await prisma.navigationGroup.create({ data: group });
        logger.info(`Created navigation group: ${group.name}`);
      }

      // Get created groups
      const dashboardGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Dashboard' } });
      const userGroup = await prisma.navigationGroup.findFirst({ where: { name: 'User Management' } });
      const loanGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Loan Management' } });
      const accountingGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Accounting' } });
      const reportsGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Reports' } });
      const adminGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Administration' } });

      // Create navigation items
      if (dashboardGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Dashboard',
            icon: 'dashboard',
            url: '/dashboard',
            order: 1,
            groupId: dashboardGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Analytics',
            icon: 'analytics',
            url: '/analytics',
            order: 2,
            groupId: dashboardGroup.id,
          }
        });
      }

      if (userGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Users',
            icon: 'people',
            url: '/users',
            order: 1,
            groupId: userGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Accounts',
            icon: 'account_balance',
            url: '/accounts',
            order: 2,
            groupId: userGroup.id,
          }
        });
      }

      if (loanGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Loan Applications',
            icon: 'description',
            url: '/loan-applications',
            order: 1,
            groupId: loanGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Active Loans',
            icon: 'monetization_on',
            url: '/loans',
            order: 2,
            groupId: loanGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Loan Types',
            icon: 'category',
            url: '/loan-types',
            order: 3,
            groupId: loanGroup.id,
          }
        });
      }

      if (accountingGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Chart of Accounts',
            icon: 'account_tree',
            url: '/chart-of-accounts',
            order: 1,
            groupId: accountingGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Journal Entries',
            icon: 'book',
            url: '/journal-entries',
            order: 2,
            groupId: accountingGroup.id,
          }
        });
      }

      if (reportsGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Report Templates',
            icon: 'description',
            url: '/report-templates',
            order: 1,
            groupId: reportsGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Generate Reports',
            icon: 'play_arrow',
            url: '/generate-reports',
            order: 2,
            groupId: reportsGroup.id,
          }
        });
      }

      if (adminGroup) {
        await prisma.navigationItem.create({
          data: {
            label: 'Staff',
            icon: 'people',
            url: '/staff',
            order: 1,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Roles & Permissions',
            icon: 'security',
            url: '/roles',
            order: 2,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Navigation Management',
            icon: 'menu',
            url: '/navigation',
            order: 3,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'System Settings',
            icon: 'settings',
            url: '/settings',
            order: 4,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Fiscal Years',
            icon: 'calendar',
            url: '/admin/fiscal-years',
            order: 5,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Centers',
            icon: 'store',
            url: '/admin/centers',
            order: 6,
            groupId: adminGroup.id,
          }
        });

        await prisma.navigationItem.create({
          data: {
            label: 'Groups',
            icon: 'groups',
            url: '/admin/groups',
            order: 7,
            groupId: adminGroup.id,
          }
        });
      }

      logger.info('Navigation items created successfully');

      // Assign navigation to Super Admin role
      const superAdmin = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
      if (superAdmin) {
        const allNavItems = await prisma.navigationItem.findMany();
        for (const item of allNavItems) {
          await prisma.roleNavigation.create({
            data: {
              roleId: superAdmin.id,
              navigationItemId: item.id,
            }
          });
        }
        logger.info(`Assigned ${allNavItems.length} navigation items to Super Admin role`);
      }
    } else {
      logger.info(`Found ${existingGroups} navigation groups. Skipping navigation seeding.`);
    }

  } catch (error) {
    logger.error('Error seeding navigation data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedNavigation().then(() => {
  logger.info('Navigation seeding completed');
});
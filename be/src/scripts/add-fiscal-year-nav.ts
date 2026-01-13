import prisma from '../config/database';
import logger from '../config/logger';

async function addFiscalYearNavigation() {
    try {
        logger.info('Starting script to add Fiscal Year navigation...');

        // 1. Find the Administration group
        const adminGroup = await prisma.navigationGroup.findFirst({
            where: { name: 'Administration' }
        });

        if (!adminGroup) {
            logger.error('Administration navigation group not found. Please run seed first.');
            return;
        }

        // 2. Create "Fiscal Years" navigation item
        // Check if it already exists
        const existingItem = await prisma.navigationItem.findFirst({
            where: { url: '/admin/fiscal-years' }
        });

        let navItemId: string;

        if (existingItem) {
            logger.info('Fiscal Years navigation item already exists.');
            navItemId = existingItem.id;
        } else {
            const newItem = await prisma.navigationItem.create({
                data: {
                    label: 'Fiscal Years',
                    icon: 'calendar', // 'calendar' or 'date_range' if supported by frontend map
                    url: '/admin/fiscal-years',
                    order: 5, // After System Settings (order 4)
                    groupId: adminGroup.id,
                }
            });
            logger.info('Created Fiscal Years navigation item.');
            navItemId = newItem.id;
        }

        // 3. Assign to Super Admin (and maybe others)
        const superAdminRole = await prisma.role.findFirst({
            where: { name: 'Super Admin' } // or whatever the super admin role name is
        });

        if (superAdminRole) {
            // Check assignment
            const existingAssignment = await prisma.roleNavigation.findUnique({
                where: {
                    roleId_navigationItemId: {
                        roleId: superAdminRole.id,
                        navigationItemId: navItemId
                    }
                }
            });

            if (!existingAssignment) {
                await prisma.roleNavigation.create({
                    data: {
                        roleId: superAdminRole.id,
                        navigationItemId: navItemId
                    }
                });
                logger.info('Assigned Fiscal Years navigation to Super Admin.');
            } else {
                logger.info('Fiscal Years navigation already assigned to Super Admin.');
            }
        } else {
            logger.warn('Super Admin role not found.');
        }

        logger.info('Script completed successfully.');

    } catch (error) {
        logger.error('Error adding Fiscal Year navigation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addFiscalYearNavigation();

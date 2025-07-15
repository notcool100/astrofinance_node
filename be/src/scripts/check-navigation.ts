import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Script to check if navigation data exists in the database
 * and log information about it
 */
async function checkNavigation() {
  try {
    // Check navigation groups
    const groups = await prisma.navigationGroup.findMany();
    logger.info(`Found ${groups.length} navigation groups in database`);
    
    // Check navigation items
    const items = await prisma.navigationItem.findMany();
    logger.info(`Found ${items.length} navigation items in database`);
    
    // Check role navigation assignments
    const roleNavigation = await prisma.roleNavigation.findMany();
    logger.info(`Found ${roleNavigation.length} role-navigation assignments in database`);
    
    // Check roles
    const roles = await prisma.role.findMany();
    logger.info(`Found ${roles.length} roles in database`);
    
    // Check if Super Admin role has navigation items
    const superAdmin = await prisma.role.findFirst({ 
      where: { name: 'Super Admin' },
      include: {
        navigation: {
          include: {
            navigationItem: true
          }
        }
      }
    });
    
    if (superAdmin) {
      logger.info(`Super Admin role has ${superAdmin.navigation.length} navigation items assigned`);
      
      // List the navigation items assigned to Super Admin
      if (superAdmin.navigation.length > 0) {
        const navItems = superAdmin.navigation.map(n => n.navigationItem.label);
        logger.info(`Navigation items for Super Admin: ${navItems.join(', ')}`);
      } else {
        logger.warn('Super Admin role has no navigation items assigned');
      }
    } else {
      logger.warn('Super Admin role not found');
    }
    
  } catch (error) {
    logger.error('Error checking navigation data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkNavigation().then(() => {
  logger.info('Navigation check completed');
});